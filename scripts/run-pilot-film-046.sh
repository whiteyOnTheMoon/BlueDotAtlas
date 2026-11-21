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
echo "046 host MemAvailable: $((mem_kib / 1024)) MiB"
# Operator read-only PSI/vmstat sample 2026-11-21: low active pressure,
# ~2947 MiB available but swap already full. Keep 2048MiB Docker cgroup cap,
# zero additional swap and fail closed if host drops below 2.75 GiB.
if [ "$mem_kib" -lt 2883584 ]; then
  echo "046 FILM NO-GO: <2.75 GiB (2816 MiB) MemAvailable; protect cohosted services" >&2
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

out="$HOME/.bda-pilot-film-046-attempt-04"
# Private attempt 04 preserves all three failed render directories/containers.
# Never overwrite, resume unknown output or touch six source PNGs.
if [ -e "$out" ] || [ -L "$out" ]; then
  echo "046 FILM NO-GO: attempt-04 private destination already exists" >&2
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

# Split at the exact S06 boundary (frame 1223, NOAA Helene HD-proxied clip).
# Render the memory-intensive late section FIRST; each chunk gets fresh Chromium
# and FFmpeg processes rather than retaining decoded frames from earlier shots.
late_name="bluedotatlas-046-private-film-diagnostic-04-late"
early_name="bluedotatlas-046-private-film-diagnostic-04-early"
join_name="bluedotatlas-046-private-film-diagnostic-04-join"
for name in "$late_name" "$early_name" "$join_name"; do
  if docker container inspect "$name" >/dev/null 2>&1; then
    echo "046 FILM NO-GO: attempt-04 diagnostic container already exists: $name" >&2
    exit 1
  fi
done
if [ -n "$(docker ps -q --filter "ancestor=$image")" ]; then
  echo "046 FILM NO-GO: another preview container is running" >&2
  exit 1
fi

if [ "$mode" = "--check" ]; then
  echo "046 PRIVATE FILM PREFLIGHT PASS: attempt-04; no render, no new files"
  exit 0
fi
test "$(printenv BDA_PILOT_046_PRIVATE_FILM 2>/dev/null || true)" = TRUE || {
  echo "046 FILM NO-GO: separate BDA_PILOT_046_PRIVATE_FILM=TRUE consent required" >&2
  exit 1
}

mkdir -m 700 "$out"
test ! -L "$out" && test "$(stat -c '%a:%u' "$out")" = "700:1000"
stage="$HOME/.bda-pilot-stage-046"
target="$out/046-private-rough-cut-attempt-04.mp4"

render_chunk() {
  local label="$1" frames="$2" name="$3" filename="$4" expected_frames="$5"
  local available rc state bytes got

  # Co-hosted VPS safety is checked independently ahead of EACH render container.
  available="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
  test -n "$available"
  echo "046 FILM $label: host MemAvailable $((available / 1024)) MiB"
  if [ "$available" -lt 2883584 ]; then
    echo "046 FILM NO-GO: $label needs 2816 MiB host MemAvailable" >&2
    return 1
  fi
  echo "046 FILM $label: offline frames $frames, 1080p/30fps; no publishing"

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
    BDA046PrivateVisualRoughCut "/review/$filename" \
    "--frames=$frames" --for-seamless-aac-concatenation \
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

  # On timeout or CLI SIGKILL stop only this attempt-04 chunk's own container.
  if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
    docker stop --time 20 "$name" >/dev/null 2>&1 || true
  fi
  state="$(docker inspect "$name" \
    --format '{{.State.Status}} {{.State.ExitCode}} {{.State.OOMKilled}}' 2>/dev/null || true)"
  echo "046 FILM $label: invocation=$rc container=$state"
  if [ "$rc" -ne 0 ] || [ "$state" != "exited 0 false" ]; then
    if [ -f "$out/$filename" ] && [ ! -L "$out/$filename" ]; then
      chmod 600 "$out/$filename"
    fi
    echo "046 FILM STOP: preserve attempt-04 output and diagnostic container" >&2
    return 1
  fi

  test -f "$out/$filename" && test ! -L "$out/$filename"
  test "$(stat -c '%u' "$out/$filename")" = 1000
  chmod 600 "$out/$filename"
  bytes="$(stat -c '%s' "$out/$filename")"
  test "$bytes" -gt 100000 && test "$bytes" -lt 838860800
  got="$(docker run --rm --init --pull never --network none \
    --cpus 0.5 --memory 512m --memory-swap 512m \
    --pids-limit 200 --read-only --cap-drop ALL --security-opt no-new-privileges \
    --mount "type=bind,source=$out,target=/review,readonly" \
    --entrypoint /usr/bin/ffprobe "$image" \
    -v error -select_streams v:0 -show_entries stream=nb_frames \
    -of default=noprint_wrappers=1:nokey=1 "/review/$filename")"
  if [ "$got" != "$expected_frames" ]; then
    echo "046 FILM STOP: $label unexpected frame count: $got / $expected_frames" >&2
    return 1
  fi
  echo "046 FILM $label: $got frames PASS"
}

# Render late first with the SHA-verified 1080p working proxy, not the 4K original.
# Fail closed if HD proxy/source preflight fails; fresh Chromium for each segment.
render_chunk "late" "1223-1799" "$late_name" "046-late-04.mp4" "577"
render_chunk "early" "0-1222" "$early_name" "046-early-04.mp4" "1223"

# Concat in timeline order using FFmpeg stream copy (not a second full Remotion pass).
printf "file '046-early-04.mp4'\nfile '046-late-04.mp4'\n" > "$out/046-parts-04.txt"
test "$(stat -c '%a:%u' "$out/046-parts-04.txt")" = "600:1000"
echo "046 FILM: offline FFmpeg concat of 1223 + 577 frames"
if timeout --signal=TERM --kill-after=30s 600s docker run \
  --name "$join_name" --pull never --init \
  --network none --cpus 0.5 --memory 512m --memory-swap 512m \
  --pids-limit 200 --ulimit fsize=838860800:838860800 \
  --read-only --cap-drop ALL --security-opt no-new-privileges \
  --mount "type=bind,source=$out,target=/review" \
  --entrypoint /usr/bin/ffmpeg "$image" \
  -nostdin -hide_banner -loglevel warning \
  -f concat -safe 1 -i /review/046-parts-04.txt \
  -c copy -movflags +faststart -n /review/046-private-rough-cut-attempt-04.mp4
then
  join_rc=0
else
  join_rc=$?
fi
if [ "$join_rc" -eq 124 ] || [ "$join_rc" -eq 137 ]; then
  docker stop --time 20 "$join_name" >/dev/null 2>&1 || true
fi
join_state="$(docker inspect "$join_name" \
  --format '{{.State.Status}} {{.State.ExitCode}} {{.State.OOMKilled}}' 2>/dev/null || true)"
echo "046 FILM join: invocation=$join_rc container=$join_state"
if [ "$join_rc" -ne 0 ] || [ "$join_state" != "exited 0 false" ]; then
  echo "046 FILM STOP: retain all chunk and join artifacts for diagnosis" >&2
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
  /review/046-private-rough-cut-attempt-04.mp4 |
  python3 scripts/check-pilot-film-046-probe.py

echo "046 PRIVATE MP4 METADATA PASS; full decode and human playback NOT yet verified"
echo "046 PRIVATE FILM: $target (owner-only); no publish or queue changes"
