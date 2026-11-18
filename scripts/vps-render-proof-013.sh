#!/usr/bin/env bash
# BlueDotAtlas Roadmap 013 — bounded, standalone 1080p FFmpeg proof.
# Generated test media only; no network, Docker or production paths.
set -euo pipefail
export LC_ALL=C

for tool in ffmpeg ffprobe timeout mktemp df awk stat nice; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf 'MISSING: %s (no packages installed)\n' "$tool" >&2
    exit 2
  fi
done
encoders="$(ffmpeg -hide_banner -encoders 2>/dev/null)" || {
  echo 'ERROR: cannot inspect ffmpeg encoders' >&2
  exit 2
}
if ! grep -E '[[:space:]]libx264[[:space:]]' >/dev/null <<< "$encoders"; then
  echo 'MISSING: ffmpeg libx264 encoder' >&2
  exit 2
fi
if ! grep -E '[[:space:]]aac[[:space:]]' >/dev/null <<< "$encoders"; then
  echo 'MISSING: ffmpeg AAC encoder' >&2
  exit 2
fi

scratch_root="${TMPDIR:-/tmp}"
if [[ ! -d "$scratch_root" || -L "$scratch_root" ]]; then
  echo 'ERROR: TMPDIR must be an existing non-symlink directory' >&2
  exit 2
fi
free_kib="$(df -Pk -- "$scratch_root" | awk 'NR == 2 {print $4}')"
if [[ ! "$free_kib" =~ ^[0-9]+$ ]] || (( free_kib < 2097152 )); then
  echo 'STOP: less than 2 GiB free on scratch filesystem' >&2
  exit 2
fi

work="$(mktemp -d -- "$scratch_root/bda-render-013.XXXXXXXX")"
output="$work/proof-1080p.mp4"
metrics="$work/metrics.txt"
cleanup() {
  rm -f -- "$output" "$metrics"
  rmdir -- "$work" 2>/dev/null || true
}
trap cleanup EXIT

echo '=== BlueDotAtlas 013 | bounded synthetic proof ==='
echo "UTC $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
echo 'Source: generated FFmpeg testsrc2 + sine (no third-party media)'
echo 'Target: 1920x1080 / 30 fps / 8 s / H.264 + AAC'
echo 'Limits: 1 x264 encoder thread, low priority, 180 s timeout, >=2 GiB disk before start'
echo 'No Docker, production services, network, or external downloads used'
echo '--- disk before ---'
df -h -- "$scratch_root"

cmd=(
  timeout --signal=TERM --kill-after=10s 180s
  ffmpeg -hide_banner -nostdin -loglevel error -y
  -f lavfi -i 'testsrc2=size=1920x1080:rate=30:duration=8'
  -f lavfi -i 'sine=frequency=440:sample_rate=48000:duration=8'
  -map 0:v:0 -map 1:a:0
  -threads 1 -filter_threads 1
  -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p
  -x264-params 'threads=1'
  -c:a aac -b:a 128k
  -t 8 -movflags +faststart
  "$output"
)
start="$(date +%s)"
if [[ -x /usr/bin/time ]]; then
  nice -n 10 /usr/bin/time -f 'elapsed_seconds=%e user_seconds=%U sys_seconds=%S peak_rss_kib=%M' -o "$metrics" "${cmd[@]}"
  echo '--- process usage ---'
  cat -- "$metrics"
else
  nice -n 10 "${cmd[@]}"
  echo 'peak_rss_kib=NOT MEASURED (/usr/bin/time unavailable)'
fi
end="$(date +%s)"
echo "wall_clock_seconds=$((end-start))"

vcodec="$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$output")"
res="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$output")"
fps="$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "$output")"
acodec="$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$output")"
duration="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$output")"
size="$(stat -c '%s' -- "$output")"
echo '--- MP4 validation ---'
printf 'video_codec=%s\nresolution=%s\nframe_rate=%s\naudio_codec=%s\nduration_seconds=%s\nfile_size_bytes=%s\n' \
  "$vcodec" "$res" "$fps" "$acodec" "$duration" "$size"
if [[ "$vcodec" != 'h264' || "$res" != '1920x1080' || "$fps" != '30/1' || "$acodec" != 'aac' ]] ||
  ! awk -v n="$duration" 'BEGIN {exit !(n >= 7.5 && n <= 8.5)}'; then
  echo 'FAIL: unexpected MP4 attributes' >&2
  exit 1
fi

echo '--- disk after ---'
df -h -- "$scratch_root"
echo 'PASS: short 1080p H.264/AAC proof; not a full 60-second film or production approval'
echo 'Temporary output is automatically removed on exit'
