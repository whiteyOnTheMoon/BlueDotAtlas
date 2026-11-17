#!/usr/bin/env bash
# Reproduce two short, SILENT BlueDotAtlas outro REVIEW candidates.
# Requires: inkscape, ffmpeg, ffprobe, git.
# YouTube's clickable Subscribe element is added separately in YouTube Studio.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
OUT=".tmp-outro-review"
mkdir -p "$OUT"
SVG="assets/brand/logo/logo-dark.svg"
EXPECTED="f471d8439ae0366fcc6624048e9aee95021eb434"
if [[ "$(git hash-object "$SVG")" != "$EXPECTED" ]]; then
  echo "Approved original logo SVG differs from reviewed GitHub blob" >&2
  exit 1
fi
inkscape "$SVG" --export-background-opacity=0 --export-width=1500 \
 --export-filename="$OUT/official-logo-transparent.png" >/dev/null 2>&1

ffmpeg -nostdin -hide_banner -loglevel error -y \
 -f lavfi -i "color=c=0x071522:s=1920x1080:r=30:d=2.5" \
 -loop 1 -framerate 30 -i "$OUT/official-logo-transparent.png" \
 -filter_complex '[0:v]fade=t=out:st=0:d=0.6:color=black[bg];[1:v]format=rgba,scale=1220:-2,fade=t=in:st=0.52:d=0.52:alpha=1,fade=t=out:st=2.10:d=0.40:alpha=1[logo];[bg][logo]overlay=(W-w)/2:(H-h)/2:format=auto:shortest=1,format=yuv420p[v]' \
 -map '[v]' -t 2.5 -an -c:v libx264 -preset veryfast -crf 19 \
 -pix_fmt yuv420p -movflags +faststart "$OUT/BlueDotAtlas_Outro_Kurz_2p5s.mp4"

ffmpeg -nostdin -hide_banner -loglevel error -y \
 -f lavfi -i "color=c=0x071522:s=1920x1080:r=30:d=6" \
 -loop 1 -framerate 30 -i "$OUT/official-logo-transparent.png" \
 -filter_complex '[0:v]fade=t=out:st=0:d=0.6:color=black[bg];[1:v]format=rgba,scale=980:-2,fade=t=in:st=0.38:d=0.55:alpha=1[logo];[bg][logo]overlay=135:(H-h)/2:format=auto:shortest=1,format=yuv420p[v]' \
 -map '[v]' -t 6 -an -c:v libx264 -preset veryfast -crf 19 \
 -pix_fmt yuv420p -movflags +faststart "$OUT/BlueDotAtlas_Outro_YouTube_6s.mp4"

for name in BlueDotAtlas_Outro_Kurz_2p5s.mp4 BlueDotAtlas_Outro_YouTube_6s.mp4; do
  ffprobe -v error -select_streams v:0 \
   -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames \
   -show_entries format=duration -of json "$OUT/$name"
done
echo "Two video review candidates rendered. Human approval and actual film fade-integration remain pending."
