#!/usr/bin/env bash
# 046 attempt 05: ONE private 60s/1800-frame HD film render, with a 4GiB cgroup
# ceiling and a host-memory watchdog; never a live queue or publication job.
# Earlier failed attempt directories and diagnostic containers remain untouched.
set -euo pipefail
umask 077

if [ "$#" -ne 1 ] || { [ "$1" != "--check" ] && [ "$1" != "--render" ]; }; then
  echo "Use --check (read-only) or --render (separately approved one-shot)" >&2
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

# Rehash three original sources, private 1080p Helene proxy and evidence,
# brand MP4s, aligned Kokoro narration, and check source rights + disk.
node scripts/check-pilot-preview-046.mjs --check

# 4GiB is a CONTAINER CEILING, not currently free host RAM. Host is cohosted.
# Do not launch below 3GiB MemAvailable, and STOP the container whenever
# available host RAM drops below 2GiB. No additional container swap.
mem_kib="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
test -n "$mem_kib"
echo "046 SINGLE HD host MemAvailable: $((mem_kib / 1024)) MiB"
if [ "$mem_kib" -lt 3145728 ]; then
  echo "046 SINGLE HD NO-GO: host needs >=3072 MiB available; protect other services" >&2
  exit 1
fi

review="$HOME/.bda-pilot-review-046"
test -d "$review" && test ! -L "$review"
test "$(stat -c '%a:%u' "$review")" = "700:1000"
test "$(find "$review" -mindepth 1 -maxdepth 1 | wc -l)" -eq 6
for still in 046-S00-intro.png 046-S01-oma.png 046-S02-waves.png \
  046-S04-science.png 046-S06-helene.png 046-S08-outro.png; do
  file="$review/$still"
  test -f "$file" && test ! -L "$file"
  test "$(stat -c '%a:%u' "$file")" = "600:1000"
  test "$(stat -c '%s' "$file")" -gt 20000
  test "$(od -An -tx1 -N8 "$file" | xargs)" = "89 50 4e 47 0d 0a 1a 0a"
done

out="$HOME/.bda-pilot-film-046-attempt-05"
target="$out/046-private-rough-cut-attempt-05.mp4"
name="bluedotatlas-046-private-film-diagnostic-05-single"
if [ -e "$out" ] || [ -L "$out" ]; then
  echo "046 SINGLE HD NO-GO: attempt-05 output already exists; no overwrite or retry" >&2
  exit 1
fi

command -v docker >/dev/null
command -v timeout >/dev/null
image="bluedotatlas-private-preview046:local"
expected="$(git rev-parse HEAD)"
actual="$(docker image inspect "$image" \
  --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}')"
if [ "$actual" != "$expected" ]; then
  echo "046 SINGLE HD NO-GO: image revision does not match main" >&2
  exit 1
fi
if docker container inspect "$name" >/dev/null 2>&1; then
  echo "046 SINGLE HD NO-GO: attempt-05 diagnostic container exists" >&2
  exit 1
fi
if [ -n "$(docker ps -q --filter "ancestor=$image")" ]; then
  echo "046 SINGLE HD NO-GO: preview image already in use" >&2
  exit 1
fi

if [ "$mode" = "--check" ]; then
  echo "046 PRIVATE SINGLE HD FILM PREFLIGHT PASS: attempt-05; no render, no new files"
  exit 0
fi
if [ "$(printenv BDA_PILOT_046_PRIVATE_SINGLE_HD_FILM 2>/dev/null || true)" != "TRUE" ]; then
  echo "046 SINGLE HD NO-GO: explicit one-shot film approval required" >&2
  exit 1
fi

# Confirm host headroom again immediately before creating the container.
mem_kib="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
test -n "$mem_kib"
echo "046 SINGLE HD pre-render MemAvailable: $((mem_kib / 1024)) MiB"
if [ "$mem_kib" -lt 3145728 ]; then
  echo "046 SINGLE HD NO-GO: insufficient RAM immediately before render" >&2
  exit 1
fi

mkdir -m 700 "$out"
test ! -L "$out" && test "$(stat -c '%a:%u' "$out")" = "700:1000"
stage="$HOME/.bda-pilot-stage-046"
watchdog_pid=""

cleanup() {
  local rc="$?"
  trap - EXIT
  if [ -n "$watchdog_pid" ]; then
    kill "$watchdog_pid" >/dev/null 2>&1 || true
    wait "$watchdog_pid" >/dev/null 2>&1 || true
  fi
  # On signals/unexpected script error, stop ONLY our own still-running container.
  if [ "$rc" -ne 0 ] &&
    [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" = "true" ]; then
    docker stop --time 10 "$name" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

echo "046 SINGLE HD: one uninterrupted Remotion 1800-frame 1080p/30fps render; no publishing"

# The monitor starts BEFORE docker run; waits until our named container runs.
# Poll real host MemAvailable: the 4GiB cap must not consume cohosted-service reserve.
(
  while [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" != "true" ]; do
    sleep 1
  done
  while [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" = "true" ]; do
    current="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
    if [ -z "$current" ] || [ "$current" -lt 2097152 ]; then
      echo "046 SINGLE HD HOST PRESSURE STOP: MemAvailable below 2048 MiB or unreadable" >&2
      docker stop --time 10 "$name" >/dev/null 2>&1 || true
      break
    fi
    sleep 1
  done
) &
watchdog_pid="$!"

# One and only one Remotion render. No --frames subset, no segment stitch.
# The stage is read-only, the private output alone is writable.
if timeout --signal=TERM --kill-after=30s 7200s docker run \
  --name "$name" --pull never --init \
  --network none --cpus 0.5 --memory 4096m --memory-swap 4096m \
  --pids-limit 200 --ulimit fsize=838860800:838860800 \
  --read-only --cap-drop ALL --security-opt no-new-privileges --shm-size 128m \
  --tmpfs /tmp:rw,nosuid,size=512m,uid=1000,gid=1000 \
  -e HOME=/home/node -e REMOTION_DISABLE_TELEMETRY=1 \
  -e XDG_CACHE_HOME=/tmp -e XDG_CONFIG_HOME=/tmp \
  -e BDA_PILOT_046_VISUAL_PREVIEW=TRUE \
  -e BDA_PILOT_046_PRIVATE_PUBLIC_DIR=/home/node/.bda-pilot-stage-046 \
  --mount "type=bind,source=$stage,target=/home/node/.bda-pilot-stage-046,readonly" \
  --mount "type=bind,source=$out,target=/review" \
  --workdir /app/packages/video \
  --entrypoint /app/packages/video/node_modules/.bin/remotion \
  "$image" render src/entry-pilot-private-046.tsx \
  BDA046PrivateVisualRoughCut "/review/046-private-rough-cut-attempt-05.mp4" \
  --codec=h264 --audio-codec=aac --audio-bitrate=192k --sample-rate=48000 \
  --pixel-format=yuv420p --color-space=bt709 --crf=23 --concurrency=1 \
  --offthreadvideo-video-threads=1 \
  --offthreadvideo-cache-size-in-bytes=268435456 \
  --media-cache-size-in-bytes=268435456 \
  --browser-executable=/usr/bin/chromium \
  --chrome-mode=chrome-for-testing --bundle-cache=false \
  --overwrite=false --log=info
then
  rc=0
else
  rc=$?
fi
kill "$watchdog_pid" >/dev/null 2>&1 || true
wait "$watchdog_pid" >/dev/null 2>&1 || true
watchdog_pid=""

if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
  docker stop --time 10 "$name" >/dev/null 2>&1 || true
fi
state="$(docker inspect "$name" \
  --format '{{.State.Status}} {{.State.ExitCode}} {{.State.OOMKilled}}' 2>/dev/null || true)"
echo "046 SINGLE HD: invocation=$rc container=$state"
if [ "$rc" -ne 0 ] || [ "$state" != "exited 0 false" ]; then
  if [ -f "$target" ] && [ ! -L "$target" ]; then chmod 600 "$target"; fi
  echo "046 SINGLE HD STOP: preserve attempt-05 artifacts and diagnostic container" >&2
  exit 1
fi

test -f "$target" && test ! -L "$target"
test "$(stat -c '%u' "$target")" = 1000
chmod 600 "$target"
bytes="$(stat -c '%s' "$target")"
test "$bytes" -gt 100000 && test "$bytes" -lt 838860800

echo "046 SINGLE HD: offline ffprobe metadata gate"
docker run --rm --init --pull never --network none \
  --cpus 0.5 --memory 1024m --memory-swap 1024m \
  --pids-limit 200 --read-only --cap-drop ALL --security-opt no-new-privileges \
  --mount "type=bind,source=$out,target=/review,readonly" \
  --entrypoint /usr/bin/ffprobe "$image" \
  -v error -show_streams -show_format -of json \
  /review/046-private-rough-cut-attempt-05.mp4 |
  python3 scripts/check-pilot-film-046-probe.py

echo "046 PRIVATE SINGLE HD MP4 METADATA PASS; full decode and human playback NOT yet verified"
echo "046 PRIVATE SINGLE HD FILM: $target (owner-only); no publish or queue changes"
