#!/usr/bin/env bash
# 046: optional operator-only private 60-second rough-cut MP4; never a publish job.
set -euo pipefail
umask 077

if [ "$#" -ne 1 ] || { [ "$1" != "--check" ] && [ "$1" != "--render" ]; }; then
  echo "Use --check (read-only) or --render (separately approved private one-shot)" >&2
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

node scripts/check-pilot-preview-046.mjs --check
mem_kib="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
test -n "$mem_kib"
if [ "$mem_kib" -lt 3145728 ]; then
  echo "046 FILM NO-GO: <3 GiB MemAvailable; protect cohosted services" >&2
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

out="$HOME/.bda-pilot-film-046"
# Never overwrite, resume unknown output or touch six source PNGs.
if [ -e "$out" ] || [ -L "$out" ]; then
  echo "046 FILM NO-GO: private film destination already exists; inspect first" >&2
  exit 1
fi
command -v docker >/dev/null
command -v timeout >/dev/null
image="bluedotatlas-private-preview046:local"
expected="$(git rev-parse HEAD)"
actual="$(docker image inspect "$image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}')"
test "$actual" = "$expected" || {
  echo "046 FILM NO-GO: image revision differs from current main" >&2
  exit 1
}
name="bluedotatlas-046-private-film-diagnostic"
if docker container inspect "$name" >/dev/null 2>&1; then
  echo "046 FILM NO-GO: diagnostic container already exists" >&2
  exit 1
fi
if [ -n "$(docker ps -q --filter "ancestor=$image")" ]; then
  echo "046 FILM NO-GO: another preview container is running" >&2
  exit 1
fi

if [ "$mode" = "--check" ]; then
  echo "046 PRIVATE FILM PREFLIGHT PASS: no render, no new files"
  exit 0
fi
test "$(printenv BDA_PILOT_046_PRIVATE_FILM 2>/dev/null || true)" = TRUE || {
  echo "046 FILM NO-GO: separate BDA_PILOT_046_PRIVATE_FILM=TRUE consent required" >&2
  exit 1
}

mkdir -m 700 "$out"
test ! -L "$out" && test "$(stat -c '%a:%u' "$out")" = "700:1000"
stage="$HOME/.bda-pilot-stage-046"
target="$out/046-private-rough-cut.mp4"

echo "046 PRIVATE FILM: one offline Remotion 1800f/30fps 1080p MP4; no publishing"
if timeout --signal=TERM --kill-after=30s 7200s docker run \
  --name "$name" --pull never --init \
  --network none --cpus 0.5 --memory 2048m --memory-swap 2048m \
  --pids-limit 200 --ulimit fsize=838860800:838860800 \
  --read-only --cap-drop ALL \
  --security-opt no-new-privileges --shm-size 128m \
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
  BDA046PrivateVisualRoughCut /review/046-private-rough-cut.mp4 \
  --codec=h264 --audio-codec=aac --audio-bitrate=192k \
  --pixel-format=yuv420p --color-space=bt709 --crf=23 --concurrency=1 \
  --offthreadvideo-video-threads=1 \
  --offthreadvideo-cache-size-in-bytes=268435456 \
  --media-cache-size-in-bytes=134217728 \
  --browser-executable=/usr/bin/chromium \
  --chrome-mode=chrome-for-testing --bundle-cache=false \
  --overwrite=false --log=info
then
  rc=0
else
  rc=$?
fi

# On timeout or CLI SIGKILL stop only our own named container.
if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
  docker stop --time 20 "$name" >/dev/null 2>&1 || true
fi
state="$(docker inspect "$name" \
  --format '{{.State.Status}} {{.State.ExitCode}} {{.State.OOMKilled}}' 2>/dev/null || true)"
echo "046 FILM: invocation=$rc container=$state"
if [ "$rc" -ne 0 ] || [ "$state" != "exited 0 false" ]; then
  if [ -f "$target" ] && [ ! -L "$target" ]; then chmod 600 "$target"; fi
  echo "046 FILM STOP: retain private artifacts and container for diagnosis" >&2
  exit 1
fi

test -f "$target" && test ! -L "$target"
test "$(stat -c '%u' "$target")" = 1000
chmod 600 "$target"
bytes="$(stat -c '%s' "$target")"
test "$bytes" -gt 100000 && test "$bytes" -lt 838860800

echo "046 FILM: offline ffprobe metadata gate"
docker run --rm --init --pull never --network none \
  --cpus 0.5 --memory 1024m --memory-swap 1024m \
  --pids-limit 200 --read-only --cap-drop ALL --security-opt no-new-privileges \
  --mount "type=bind,source=$out,target=/review,readonly" \
  --entrypoint /usr/bin/ffprobe "$image" \
  -v error -show_streams -show_format -of json \
  /review/046-private-rough-cut.mp4 |
  python3 scripts/check-pilot-film-046-probe.py

echo "046 PRIVATE MP4 METADATA PASS; full decode and human playback NOT yet verified"
echo "046 PRIVATE FILM: $target (owner-only); no publish or queue changes"
