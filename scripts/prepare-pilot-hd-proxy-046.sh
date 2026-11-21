#!/usr/bin/env bash
# 046: one-off PRIVATE, offline, bounded HD working copy of NOAA Helene 4K source.
# Never modify originals or any previous film render artifacts.
set -euo pipefail
umask 077

if [ "$#" -ne 1 ] || { [ "$1" != "--check" ] && [ "$1" != "--prepare" ]; }; then
  echo "Use --check (read-only) or --prepare (separately authorized one-off private HD proxy)" >&2
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

# The 4K original and the OTHER TWO already-HD originals are SHA/rights verified.
# A generated HD proxy is not yet required for preparation.
node scripts/check-pilot-preview-046.mjs --check-originals

mem_kib="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
test -n "$mem_kib"
echo "046 HD PROXY host MemAvailable: $((mem_kib / 1024)) MiB"
if [ "$mem_kib" -lt 2883584 ]; then
  echo "046 HD PROXY NO-GO: less than 2816 MiB host MemAvailable" >&2
  exit 1
fi

command -v docker >/dev/null
command -v timeout >/dev/null
command -v python3 >/dev/null
image="bluedotatlas-private-preview046:local"
expected="$(git rev-parse HEAD)"
actual="$(docker image inspect "$image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}')"
if [ "$actual" != "$expected" ]; then
  echo "046 HD PROXY NO-GO: image revision does not match main" >&2
  exit 1
fi

stage="$HOME/.bda-pilot-stage-046"
out="$stage/pilot/.private-046/hd-proxy-046"
name="bluedotatlas-046-private-hd-proxy-diagnostic"
if [ -e "$out" ] || [ -L "$out" ]; then
  echo "046 HD PROXY NO-GO: output directory already exists (never overwrite)" >&2
  exit 1
fi
if docker container inspect "$name" >/dev/null 2>&1; then
  echo "046 HD PROXY NO-GO: diagnostic container already exists" >&2
  exit 1
fi
if [ -n "$(docker ps -q --filter "ancestor=$image")" ]; then
  echo "046 HD PROXY NO-GO: preview image already in use" >&2
  exit 1
fi

if [ "$mode" = "--check" ]; then
  echo "046 PRIVATE HD PROXY PREFLIGHT PASS: no conversion, no new files"
  exit 0
fi
if [ "$(printenv BDA_PILOT_046_PRIVATE_HD_PROXY 2>/dev/null || true)" != "TRUE" ]; then
  echo "046 HD PROXY NO-GO: BDA_PILOT_046_PRIVATE_HD_PROXY=TRUE required" >&2
  exit 1
fi

mkdir -m 700 "$out"
test ! -L "$out" && test "$(stat -c '%a:%u' "$out")" = "700:1000"
file="$out/P60-VID-003-hd.mp4"
evidence="$out/evidence.json"
source_sha="$(node -e 'const fs=require("node:fs"); const m=JSON.parse(fs.readFileSync("assets/pilot/rights-manifest.json", "utf8")); const a=m.assets.find(x=>x.asset_id==="P60-VID-003"); if(!a)process.exit(1);process.stdout.write(a.technical_original_sha256)')"

echo "046 PRIVATE HD PROXY: convert original 3840x2160 to <=1920x1080, silent; no publishing"
if timeout --signal=TERM --kill-after=30s 3600s docker run \
  --name "$name" --pull never --init \
  --network none --cpus 0.5 --memory 2048m --memory-swap 2048m \
  --pids-limit 120 --ulimit fsize=268435456:268435456 \
  --read-only --cap-drop ALL --security-opt no-new-privileges \
  --tmpfs /tmp:rw,nosuid,size=64m,uid=1000,gid=1000 \
  --mount "type=bind,source=$stage,target=/source,readonly" \
  --mount "type=bind,source=$out,target=/proxy" \
  --entrypoint /usr/bin/ffmpeg "$image" \
  -nostdin -hide_banner -loglevel warning \
  -i /source/pilot/.private-046/P60-VID-003.mp4 \
  -map 0:v:0 -vf "scale=1920:1080:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset veryfast -crf 23 -threads 1 -filter_threads 1 \
  -an -sn -dn -movflags +faststart -n /proxy/P60-VID-003-hd.mp4
then
  rc=0
else
  rc=$?
fi
if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then
  docker stop --time 20 "$name" >/dev/null 2>&1 || true
fi
state="$(docker inspect "$name" \
  --format '{{.State.Status}} {{.State.ExitCode}} {{.State.OOMKilled}}' 2>/dev/null || true)"
echo "046 HD PROXY: invocation=$rc container=$state"
if [ "$rc" -ne 0 ] || [ "$state" != "exited 0 false" ]; then
  if [ -f "$file" ] && [ ! -L "$file" ]; then chmod 600 "$file"; fi
  echo "046 HD PROXY STOP: preserve partial proxy and container for diagnosis" >&2
  exit 1
fi

test -f "$file" && test ! -L "$file"
test "$(stat -c '%u' "$file")" = 1000
chmod 600 "$file"
bytes="$(stat -c '%s' "$file")"
test "$bytes" -gt 100000 && test "$bytes" -lt 268435456

proxy_sha="$(sha256sum "$file" | awk '{print $1}')"
echo "046 HD PROXY: validating H.264/1920x1080/no-audio and source evidence"
docker run --rm --init --pull never --network none \
  --cpus 0.5 --memory 512m --memory-swap 512m \
  --pids-limit 100 --read-only --cap-drop ALL --security-opt no-new-privileges \
  --mount "type=bind,source=$out,target=/proxy,readonly" \
  --entrypoint /usr/bin/ffprobe "$image" \
  -v error -show_streams -show_format -of json /proxy/P60-VID-003-hd.mp4 |
  python3 scripts/check-pilot-hd-proxy-046.py "$proxy_sha" "$source_sha" > "$evidence"
chmod 600 "$evidence"
test "$(stat -c '%a:%u' "$evidence")" = "600:1000"

# Recheck SHA, source consent and the HD-only compositor selection.
node scripts/check-pilot-preview-046.mjs --check
echo "046 PRIVATE HD PROXY PASS: original remains untouched; private HD proxy ready"
