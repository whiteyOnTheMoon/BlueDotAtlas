#!/usr/bin/env bash
# 046: operator-only bounded single-frame private review; never renders a full film.
set -euo pipefail
umask 077

if [ "$#" -ne 1 ] || { [ "$1" != "--check" ] && [ "$1" != "--stills" ]; }; then
  echo "Use --check (read-only) or --stills (explicit opt-in, single PNGs)" >&2
  exit 1
fi

root="$(cd "$(dirname "$0")/.." && pwd -P)"
test "$root" = "$HOME/www/blueDotAtlas"
cd "$root"
test "$(git branch --show-current)" = main
git diff --quiet
git diff --cached --quiet

node scripts/check-pilot-preview-046.mjs --check
if [ "$1" = "--check" ]; then
  exit 0
fi

test "${BDA_PILOT_046_PRIVATE_STILLS:-}" = TRUE || {
  echo "046 NO-GO: Explicit BDA_PILOT_046_PRIVATE_STILLS=TRUE required" >&2
  exit 1
}
test "$(id -u)" = 1000
command -v docker >/dev/null
image="bluedotatlas-private-preview046:local"
expected="$(git rev-parse HEAD)"
actual="$(docker image inspect "$image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}')"
test "$actual" = "$expected" || {
  echo "046 NO-GO: Preview image is absent or not built from current main" >&2
  exit 1
}

out="$HOME/.bda-pilot-review-046"
# Reuse an EMPTY private directory left by an interrupted first attempt.
# Never delete, overwrite or silently resume partial/unknown outputs.
test ! -L "$out"
if [ -e "$out" ]; then
  test -d "$out"
  test "$(stat -c '%a:%u' "$out")" = "700:1000"
  test -z "$(find "$out" -mindepth 1 -maxdepth 1 -print -quit)" || {
    echo "046 NO-GO: Private review directory is not empty; inspect it, do not overwrite" >&2
    exit 1
  }
else
  mkdir -m 700 "$out"
fi
test "$(stat -c '%a:%u' "$out")" = "700:1000"
stage="$HOME/.bda-pilot-stage-046"

# The one-shot container has no network, no database mount, no web ports,
# readonly code and inputs, CPU/RAM/PID limits, a bounded temporary filesystem.
for item in   "30:046-S00-intro"   "160:046-S01-oma"   "380:046-S02-waves"   "850:046-S04-science"   "1330:046-S06-helene"   "1710:046-S08-outro"; do
  frame="${item%%:*}"
  name="${item#*:}"
  echo "046 PRIVATE STILL: $name"
  docker run --rm --init --network none     --cpus 0.5 --memory 1024m --memory-swap 1024m --pids-limit 200     --read-only --cap-drop ALL --security-opt no-new-privileges     --shm-size 128m     --tmpfs /tmp:rw,nosuid,size=256m,uid=1000,gid=1000     -e HOME=/home/node -e REMOTION_DISABLE_TELEMETRY=1     -e XDG_CACHE_HOME=/tmp -e XDG_CONFIG_HOME=/tmp     -e BDA_PILOT_046_VISUAL_PREVIEW=TRUE     -e BDA_PILOT_046_PRIVATE_PUBLIC_DIR=/home/node/.bda-pilot-stage-046     --mount "type=bind,source=$stage,target=/home/node/.bda-pilot-stage-046,readonly"     --mount "type=bind,source=$out,target=/review"     --workdir /app/packages/video     --entrypoint /app/packages/video/node_modules/.bin/remotion     "$image" still src/entry-pilot-private-046.tsx       BDA046PrivateVisualRoughCut "/review/$name.png"       "--frame=$frame" --browser-executable=/usr/bin/chromium       --chrome-mode=chrome-for-testing --offthreadvideo-video-threads=1 --bundle-cache=false --log=info
  target="$out/$name.png"
  test -f "$target" && test ! -L "$target"
  test "$(stat -c %u "$target")" = 1000
  bytes="$(stat -c %s "$target")"
  test "$bytes" -gt 20000 && test "$bytes" -lt 25000000
  chmod 600 "$target"
done

echo "046 PRIVATE 6 STILLS PASS: images in private host directory (no full video)"
