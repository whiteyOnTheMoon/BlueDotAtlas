#!/usr/bin/env bash
# Roadmap 061/062: ~9.5-minute private VPS benchmark of the Scene-Director renderer.
#   --check  read-only preflight (assets, plan, image, memory, disk); no writes
#   --bench  render (BDA_BENCH_061_PRIVATE=TRUE); after any stop, the same
#            command RESUMES at the first unfinished part (062)
# Technical load test only (repeated clips, silent track). NEVER published.
set -euo pipefail
umask 077
if [ "$#" -ne 1 ] || { [ "$1" != "--check" ] && [ "$1" != "--bench" ]; }; then
  echo "Use --check, then separately approved --bench" >&2
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
out="$private_root/bench-061-01"
image="bluedotatlas-private-ffmpeg046:local"
no_go() { echo "061 BENCH NO-GO: $*" >&2; exit 1; }

if [ ! -d "$stage" ] || [ -L "$private_root" ] || [ -L "$stage" ]; then no_go "project-local stage $stage missing"; fi
test "$(stat -c '%a:%u' "$private_root")" = "700:1000"
git check-ignore -q "$private_root/stage" || no_go ".private-046 not git-ignored"
test -z "$(git ls-files -- .private-046)"
command -v docker >/dev/null
command -v timeout >/dev/null
actual="$(docker image inspect "$image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' 2>/dev/null || true)"
[ "$actual" = "$(git rev-parse HEAD)" ] || no_go "image $image revision does not match current main (rebuild needed)"
if [ -n "$(docker ps -q --filter "ancestor=$image")" ]; then no_go "another private FFmpeg render is running"; fi
if [ -n "$(docker ps -q --filter "name=bluedotatlas-061-bench")" ]; then no_go "a 061 benchmark container is still running"; fi

mem_mib() { awk '/^MemAvailable:/ {print int($2 / 1024)}' /proc/meminfo; }
need_mem=2816   # 512 MiB cap + 2048 MiB host reserve + 256 MiB margin (as 046/V2 film)
free_gib="$(df -P -BG "$private_root" | awk 'NR==2 {gsub("G", "", $4); print $4}')"
echo "061 BENCH host: MemAvailable $(mem_mib) MiB (needs $need_mem), free disk ${free_gib} GiB (needs 8)"
[ "$free_gib" -ge 8 ] || no_go "need >= 8 GiB free disk (streaming render keeps <= 2 lossless shots + parts)"
if [ -e "$out/scene-v1.mp4" ]; then no_go "benchmark film already exists in $out; refuse overwrite"; fi
if [ -d "$out/.work-scene-v1" ]; then
  echo "061 BENCH: unfinished work found in $out; --bench resumes at the first missing part"
fi

if [ "$mode" = "--check" ]; then
  docker run --rm --init --pull never --network none \
    --cpus 0.5 --memory 512m --memory-swap 512m --pids-limit 100 \
    --read-only --cap-drop ALL --security-opt no-new-privileges \
    --tmpfs /tmp:rw,nosuid,size=16m,uid=1000,gid=1000 \
    --mount "type=bind,source=$stage,target=/source,readonly" \
    --workdir /app --entrypoint /usr/local/bin/node "$image" \
    scripts/render-bench-061.mjs --preflight
  echo "061 BENCH PRIVATE PREFLIGHT PASS: no rendering or file writes"
  exit 0
fi

[ "$(printenv BDA_BENCH_061_PRIVATE 2>/dev/null || true)" = "TRUE" ] || no_go "explicit BDA_BENCH_061_PRIVATE=TRUE approval required"
[ "$(mem_mib)" -ge "$need_mem" ] || no_go "need >= $need_mem MiB MemAvailable immediately before render"
if [ ! -d "$out" ]; then mkdir -m 700 "$out"; fi
test ! -L "$out" && test "$(stat -c '%a:%u' "$out")" = "700:1000"
name="bluedotatlas-061-bench-$(date +%Y%m%d%H%M%S)"
watchdog_pid=""
cleanup() {
  local rc="$?"
  trap - EXIT
  if [ -n "$watchdog_pid" ]; then kill "$watchdog_pid" >/dev/null 2>&1 || true; wait "$watchdog_pid" >/dev/null 2>&1 || true; fi
  if [ "$rc" -ne 0 ] && [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" = "true" ]; then
    docker stop --timeout 10 "$name" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP
(
  while [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" != "true" ]; do sleep 1; done
  while [ "$(docker inspect "$name" --format '{{.State.Running}}' 2>/dev/null || true)" = "true" ]; do
    if [ "$(mem_mib)" -lt 2048 ]; then
      echo "061 BENCH HOST PRESSURE STOP: below 2048 MiB MemAvailable (rerun --bench later to resume)" >&2
      docker stop --timeout 10 "$name" >/dev/null 2>&1 || true
      break
    fi
    sleep 1
  done
) &
watchdog_pid="$!"
echo "061 BENCH: private ~9.5 min streaming render, offline, 0.5 CPU, 512 MiB; expect about 2.5 h"
if timeout --signal=TERM --kill-after=30s 21600s docker run \
  --name "$name" --pull never --init --network none \
  --cpus 0.5 --memory 512m --memory-swap 512m --pids-limit 120 \
  --ulimit fsize=2147483648:2147483648 \
  --read-only --cap-drop ALL --security-opt no-new-privileges \
  --tmpfs /tmp:rw,nosuid,size=64m,uid=1000,gid=1000 \
  -e HOME=/home/node -e BDA_BENCH_061_PRIVATE=TRUE \
  --mount "type=bind,source=$stage,target=/source,readonly" \
  --mount "type=bind,source=$out,target=/review" \
  --workdir /app --entrypoint /usr/local/bin/node "$image" \
  scripts/render-bench-061.mjs --render
then rc=0; else rc=$?; fi
state="$(docker inspect "$name" --format '{{.State.Status}} {{.State.ExitCode}} {{.State.OOMKilled}}' 2>/dev/null || true)"
echo "061 BENCH: invocation=$rc container=$state"
if [ "$rc" -ne 0 ] || [ "$state" != "exited 0 false" ]; then
  echo "061 BENCH STOP: finished parts and container $name kept; rerun --bench to resume" >&2
  exit 1
fi
docker rm "$name" >/dev/null
test -f "$out/scene-v1.mp4" && test -f "$out/bench-061-report.json"
docker run --rm --init --pull never --network none --cpus 0.5 --memory 512m --memory-swap 512m --pids-limit 100 \
  --read-only --cap-drop ALL --security-opt no-new-privileges \
  --mount "type=bind,source=$out,target=/review,readonly" --entrypoint /usr/bin/ffprobe "$image" \
  -v error -select_streams v:0 -show_entries stream=nb_frames,avg_frame_rate,width,height -of csv=p=0 /review/scene-v1.mp4
grep -E '"(filmSeconds|wallSeconds|secondsPerFilmMinute|resumedParts|minMemAvailableMiBSeenInContainer|bytes)"' "$out/bench-061-report.json"
echo "061 BENCH PRIVATE PASS: $out (owner-only); technical benchmark, not published"
