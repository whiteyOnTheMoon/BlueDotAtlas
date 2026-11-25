#!/usr/bin/env bash
# 048 re-review: first private Script-V2 film on the VPS. NEVER a publish job.
#   --check  read-only preflight (rights/SHA/lengths, images, memory); no writes
#   --tts    V2 narration into .private-046/v2-tts-01 (BDA_PILOT_V2_TTS_PRIVATE=TRUE)
#   --film   V2 film into .private-046/scene-v2-01   (BDA_PILOT_V2_FILM_PRIVATE=TRUE)
# Everything stays inside the project folder in the git-/docker-ignored .private-046/.
set -euo pipefail
umask 077
if [ "$#" -ne 1 ] || { [ "$1" != "--check" ] && [ "$1" != "--tts" ] && [ "$1" != "--film" ]; }; then
  echo "Use --check, then separately approved --tts and --film" >&2
  exit 1
fi
mode="$1"
root="$(cd "$(dirname "$0")/.." && pwd -P)"
test "$root" = "$HOME/www/blueDotAtlas"
cd "$root"
test "$(id -u)" = 1000
test "$(git branch --show-current)" = main
git diff --quiet
git diff --cached --quiet
private_root="$root/.private-046"
stage="$private_root/stage"
voice="$private_root/v2-tts-01"
out="$private_root/scene-v2-01"
tts_image="bluedotatlas-private-v2tts:local"
film_image="bluedotatlas-private-ffmpeg046:local"
tts_name="bluedotatlas-v2-private-tts-01"
film_name="bluedotatlas-v2-private-film-01"
no_go() { echo "V2 FILM NO-GO: $*" >&2; exit 1; }

if [ ! -d "$stage" ] || [ -L "$private_root" ] || [ -L "$stage" ]; then
  no_go "project-local stage $stage missing"
fi
test "$(stat -c '%a:%u' "$private_root")" = "700:1000"
git check-ignore -q "$private_root/stage" || no_go ".private-046 not git-ignored"
test -z "$(git ls-files -- .private-046)"
test -d "$stage/pilot/.private-v2" || no_go "V2 clips not staged (scripts/stage-pilot-v2-media.mjs)"
# 046 originals, HD proxy, brand clips and host disk/memory floor (read-only).
BDA_PILOT_046_STAGE="$stage" node scripts/check-pilot-preview-046.mjs --check

command -v docker >/dev/null
command -v timeout >/dev/null
expected="$(git rev-parse HEAD)"
for image in "$tts_image" "$film_image"; do
  actual="$(docker image inspect "$image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' 2>/dev/null || true)"
  [ "$actual" = "$expected" ] || no_go "image $image revision does not match current main (rebuild needed)"
done
for name in "$tts_name" "$film_name"; do
  if [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" = "true" ]; then
    no_go "container $name is still running"
  fi
done
if [ -n "$(docker ps -q --filter "ancestor=$film_image")" ]; then
  no_go "another private FFmpeg prototype is running"
fi

mem_mib() { awk '/^MemAvailable:/ {print int($2 / 1024)}' /proc/meminfo; }
# Admission = container cap + 2048 MiB host reserve + 256 MiB margin (as 046).
need_tts=3328   # 1024 MiB cap; measured Kokoro peak ~800 MiB
need_film=2816  # 512 MiB cap; single-thread FFmpeg/rsvg steps
echo "V2 FILM host MemAvailable: $(mem_mib) MiB (TTS needs $need_tts, film needs $need_film)"

# Read-only container preflight: V2 SHA/size, every source long enough, voice (if present).
preflight() {
  local voice_mount=()
  if [ -d "$voice" ]; then voice_mount=(--mount "type=bind,source=$voice,target=/voice,readonly"); fi
  docker run --rm --init --pull never --network none \
    --cpus 0.5 --memory 512m --memory-swap 512m --pids-limit 100 \
    --read-only --cap-drop ALL --security-opt no-new-privileges \
    --tmpfs /tmp:rw,nosuid,size=16m,uid=1000,gid=1000 \
    --mount "type=bind,source=$stage,target=/source,readonly" \
    "${voice_mount[@]}" \
    --workdir /app --entrypoint /usr/local/bin/node "$film_image" \
    scripts/render-pilot-v2.mjs --preflight
}

# Host watchdog: stop only OUR container if MemAvailable drops below 2048 MiB.
watchdog_pid=""
watch_container() {
  local name="$1"
  (
    while [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" != "true" ]; do sleep 1; done
    while [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" = "true" ]; do
      if [ "$(mem_mib)" -lt 2048 ]; then
        echo "V2 FILM HOST PRESSURE STOP: below 2048 MiB MemAvailable" >&2
        docker stop --timeout 10 "$name" >/dev/null 2>&1 || true
        break
      fi
      sleep 1
    done
  ) &
  watchdog_pid="$!"
}
cleanup() {
  local rc="$?"
  trap - EXIT
  if [ -n "$watchdog_pid" ]; then
    kill "$watchdog_pid" >/dev/null 2>&1 || true
    wait "$watchdog_pid" >/dev/null 2>&1 || true
  fi
  for name in "$tts_name" "$film_name"; do
    if [ "$rc" -ne 0 ] && [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" = "true" ]; then
      docker stop --timeout 10 "$name" >/dev/null 2>&1 || true
    fi
  done
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
finish() {
  local name="$1" rc="$2" state
  state="$(docker inspect "$name" --format '{{.State.Status}} {{.State.ExitCode}} {{.State.OOMKilled}}' 2>/dev/null || true)"
  echo "V2 FILM: invocation=$rc container=$state"
  if [ "$rc" -ne 0 ] || [ "$state" != "exited 0 false" ]; then
    echo "V2 FILM STOP: output and diagnostic container $name preserved" >&2
    exit 1
  fi
  docker rm "$name" >/dev/null
}

case "$mode" in
--check)
  preflight
  [ ! -e "$out" ] || no_go "film output $out exists; refuse overwrite"
  echo "V2 FILM PRIVATE PREFLIGHT PASS: no rendering or file writes"
  ;;
--tts)
  [ "$(printenv BDA_PILOT_V2_TTS_PRIVATE 2>/dev/null || true)" = "TRUE" ] || no_go "explicit BDA_PILOT_V2_TTS_PRIVATE=TRUE approval required"
  [ ! -e "$voice" ] && [ ! -L "$voice" ] || no_go "narration $voice exists; refuse overwrite"
  ! docker inspect "$tts_name" >/dev/null 2>&1 || no_go "diagnostic container $tts_name exists"
  [ "$(mem_mib)" -ge "$need_tts" ] || no_go "need >= $need_tts MiB MemAvailable for TTS"
  mkdir -m 700 "$voice"
  watch_container "$tts_name"
  echo "V2 TTS: local pinned Kokoro (bm_george, speed 0.9), offline, 1024 MiB cap"
  if timeout --signal=TERM --kill-after=30s 1800s docker run \
    --name "$tts_name" --pull never --init --network none \
    --cpus 0.5 --memory 1024m --memory-swap 1024m --pids-limit 64 \
    --read-only --cap-drop ALL --security-opt no-new-privileges \
    --tmpfs /tmp:rw,nosuid,exec,size=64m,uid=1000,gid=1000 \
    -e BDA_TTS_V2_PRIVATE=TRUE -e BDA_TTS_V2_SPEED=0.9 \
    --mount "type=bind,source=$voice,target=/voice" \
    "$tts_image" python3 -I scripts/generate-tts-v2.py /voice
  then rc=0; else rc=$?; fi
  finish "$tts_name" "$rc"
  test -f "$voice/pilot-v2-narration-60s.wav" && test "$(stat -c '%s' "$voice/pilot-v2-narration-60s.wav")" = 11520044
  preflight
  echo "V2 TTS PRIVATE PASS: $voice (owner-only); owner listening review required"
  ;;
--film)
  [ "$(printenv BDA_PILOT_V2_FILM_PRIVATE 2>/dev/null || true)" = "TRUE" ] || no_go "explicit BDA_PILOT_V2_FILM_PRIVATE=TRUE approval required"
  [ -d "$voice" ] || no_go "run --tts first"
  [ ! -e "$out" ] && [ ! -L "$out" ] || no_go "film output $out exists; refuse overwrite"
  ! docker inspect "$film_name" >/dev/null 2>&1 || no_go "diagnostic container $film_name exists"
  preflight
  [ "$(mem_mib)" -ge "$need_film" ] || no_go "need >= $need_film MiB MemAvailable immediately before render"
  mkdir -m 700 "$out"
  watch_container "$film_name"
  echo "V2 FILM: private sequential 1080p scene render (Scene-Director V1), offline, 512 MiB cap"
  if timeout --signal=TERM --kill-after=30s 7200s docker run \
    --name "$film_name" --pull never --init --network none \
    --cpus 0.5 --memory 512m --memory-swap 512m --pids-limit 120 \
    --ulimit fsize=838860800:838860800 \
    --read-only --cap-drop ALL --security-opt no-new-privileges \
    --tmpfs /tmp:rw,nosuid,size=64m,uid=1000,gid=1000 \
    -e HOME=/home/node -e BDA_PILOT_V2_FILM_PRIVATE=TRUE \
    --mount "type=bind,source=$stage,target=/source,readonly" \
    --mount "type=bind,source=$voice,target=/voice,readonly" \
    --mount "type=bind,source=$out,target=/review" \
    --workdir /app --entrypoint /usr/local/bin/node "$film_image" \
    scripts/render-pilot-v2.mjs --render
  then rc=0; else rc=$?; fi
  finish "$film_name" "$rc"
  file="$out/scene-v1.mp4"
  test -f "$file" && test ! -L "$file" && test -f "$file.receipt.json"
  docker run --rm --init --pull never --network none \
    --cpus 0.5 --memory 512m --memory-swap 512m --pids-limit 100 \
    --read-only --cap-drop ALL --security-opt no-new-privileges \
    --mount "type=bind,source=$out,target=/review,readonly" \
    --entrypoint /usr/bin/ffmpeg "$film_image" \
    -v error -nostdin -threads 1 -i /review/scene-v1.mp4 -f null - \
    || no_go "full decode of the film failed"
  echo "V2 FILM PRIVATE PASS: $file (owner-only, full decode OK); not published, owner review required"
  ;;
esac
