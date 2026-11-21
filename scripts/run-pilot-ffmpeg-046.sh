#!/usr/bin/env bash
# 046 optional private FFmpeg/SVG prototype. NEVER a publish job.
set -euo pipefail
umask 077
if [ "$#" -ne 1 ] || { [ "$1" != "--check" ] && [ "$1" != "--render" ]; }; then
  echo "Use --check or separately approved --render" >&2
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
# Existing private 046 source, rights, HD proxy, voice SHA and disk gate.
node scripts/check-pilot-preview-046.mjs --check
# Admission: 1536MiB hard container cap + 2048MiB host reserve
# + 256MiB margin for cohosted workloads.
min_mem_kib=3932160  # (1536 + 2048 + 256) MiB
mem_kib="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
test -n "$mem_kib"
echo "046 FFMPEG host MemAvailable: $((mem_kib / 1024)) MiB"
if [ "$mem_kib" -lt "$min_mem_kib" ]; then
  echo "046 FFMPEG NO-GO: need >=3840 MiB MemAvailable (1536 MiB container + 2048 MiB reserve + 256 MiB margin)" >&2
  exit 1
fi
command -v docker >/dev/null
command -v timeout >/dev/null
image="bluedotatlas-private-ffmpeg046:local"
expected="$(git rev-parse HEAD)"
actual="$(docker image inspect "$image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' 2>/dev/null || true)"
if [ "$actual" != "$expected" ]; then
  echo "046 FFMPEG NO-GO: image revision does not match current main" >&2
  exit 1
fi
stage="$HOME/.bda-pilot-stage-046"
out="$HOME/.bda-pilot-film-046-ffmpeg-pilot-01"
name="bluedotatlas-046-private-ffmpeg-diagnostic-pilot-01"
if [ -e "$out" ] || [ -L "$out" ]; then
  echo "046 FFMPEG NO-GO: private output exists; refuse overwrite" >&2
  exit 1
fi
if docker inspect "$name" >/dev/null 2>&1; then
  echo "046 FFMPEG NO-GO: diagnostic container already exists" >&2
  exit 1
fi
if [ -n "$(docker ps -q --filter "ancestor=$image")" ]; then
  echo "046 FFMPEG NO-GO: another prototype is running" >&2
  exit 1
fi
if [ "$mode" = "--check" ]; then
  echo "046 FFMPEG PRIVATE PREFLIGHT PASS: no rendering or file writes"
  exit 0
fi
if [ "$(printenv BDA_PILOT_046_FFMPEG_PRIVATE 2>/dev/null || true)" != "TRUE" ]; then
  echo "046 FFMPEG NO-GO: explicit BDA_PILOT_046_FFMPEG_PRIVATE=TRUE approval required" >&2
  exit 1
fi
mem_kib="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
test -n "$mem_kib"
if [ "$mem_kib" -lt "$min_mem_kib" ]; then
  echo "046 FFMPEG NO-GO: need >=3840 MiB MemAvailable immediately before render" >&2
  exit 1
fi
mkdir -m 700 "$out"
test ! -L "$out" && test "$(stat -c '%a:%u' "$out")" = "700:1000"
watchdog_pid=""
cleanup() {
  local rc="$?"
  trap - EXIT
  if [ -n "$watchdog_pid" ]; then
    kill "$watchdog_pid" >/dev/null 2>&1 || true
    wait "$watchdog_pid" >/dev/null 2>&1 || true
  fi
  if [ "$rc" -ne 0 ] &&
    [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" = "true" ]; then
    docker stop --timeout 10 "$name" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
(
  while [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" != "true" ]; do
    sleep 1
  done
  while [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" = "true" ]; do
    current="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
    if [ -z "$current" ] || [ "$current" -lt 2097152 ]; then
      echo "046 FFMPEG HOST PRESSURE STOP: below 2048 MiB MemAvailable" >&2
      docker stop --timeout 10 "$name" >/dev/null 2>&1 || true
      break
    fi
    sleep 1
  done
) &
watchdog_pid="$!"
echo "046 FFMPEG: private sequential 1080p SVG/HD encoding, no Chromium"
if timeout --signal=TERM --kill-after=30s 7200s docker run \
  --name "$name" --pull never --init --network none \
  --cpus 0.5 --memory 1536m --memory-swap 1536m --pids-limit 120 \
  --ulimit fsize=838860800:838860800 \
  --read-only --cap-drop ALL --security-opt no-new-privileges \
  --tmpfs /tmp:rw,nosuid,size=64m,uid=1000,gid=1000 \
  -e HOME=/home/node -e BDA_PILOT_046_FFMPEG_PRIVATE=TRUE \
  -e BDA_PILOT_046_MEDIA_ROOT=/source -e BDA_PILOT_046_OUTPUT_ROOT=/review \
  --mount "type=bind,source=$stage,target=/source,readonly" \
  --mount "type=bind,source=$out,target=/review" \
  --workdir /app \
  --entrypoint /usr/local/bin/node "$image" \
  scripts/render-pilot-ffmpeg-046.mjs --private
then rc=0; else rc=$?; fi
kill "$watchdog_pid" >/dev/null 2>&1 || true
wait "$watchdog_pid" >/dev/null 2>&1 || true
watchdog_pid=""
if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
  docker stop --timeout 10 "$name" >/dev/null 2>&1 || true
fi
state="$(docker inspect "$name" \
  --format '{{.State.Status}} {{.State.ExitCode}} {{.State.OOMKilled}}' 2>/dev/null || true)"
echo "046 FFMPEG: invocation=$rc container=$state"
if [ "$rc" -ne 0 ] || [ "$state" != "exited 0 false" ]; then
  echo "046 FFMPEG STOP: preserve prototype files and diagnostic container" >&2
  exit 1
fi
file="$out/046-private-ffmpeg-pilot-01.mp4"
receipt="$file.receipt.json"
test -f "$file" && test ! -L "$file"
test -f "$receipt" && test ! -L "$receipt"
test "$(stat -c '%a:%u' "$file")" = "600:1000"
test "$(stat -c '%a:%u' "$receipt")" = "600:1000"
docker run --rm --init --pull never --network none \
  --cpus 0.5 --memory 512m --memory-swap 512m --pids-limit 100 \
  --read-only --cap-drop ALL --security-opt no-new-privileges \
  --mount "type=bind,source=$out,target=/review,readonly" \
  --entrypoint /usr/bin/ffprobe "$image" \
  -v error -show_streams -show_format -of json \
  /review/046-private-ffmpeg-pilot-01.mp4 |
  python3 scripts/check-pilot-film-046-probe.py
echo "046 FFMPEG PRIVATE MP4 METADATA PASS; full decode and human QA still needed"
echo "046 FFMPEG PRIVATE: $file (owner-only); no publication or Queue/Admin changes"
