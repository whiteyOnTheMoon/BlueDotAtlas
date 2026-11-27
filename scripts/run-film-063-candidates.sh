#!/usr/bin/env bash
# Roadmap 063: private VPS staging + offline review of the 9-minute film's media
# candidates (contact sheets for owner viewing). NEVER publishes.
#   --check   read-only: plan, private folders, image revision; no network, no writes
#   --stage   download candidates (BDA_FILM_063_STAGE=TRUE), host node, svs.gsfc.nasa.gov only
#   --review  offline container: SHA re-check, stream probe, contact sheets
set -euo pipefail
umask 077
if [ "$#" -ne 1 ] || { [ "$1" != "--check" ] && [ "$1" != "--stage" ] && [ "$1" != "--review" ]; }; then
  echo "Use --check, then separately approved --stage and --review" >&2
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
candidates="$stage/film/.candidates-063"
review="$private_root/review-063"
image="bluedotatlas-private-ffmpeg046:local"
no_go() { echo "063 CANDIDATES NO-GO: $*" >&2; exit 1; }

if [ ! -d "$stage" ] || [ -L "$private_root" ] || [ -L "$stage" ]; then no_go "project-local stage $stage missing"; fi
test "$(stat -c '%a:%u' "$private_root")" = "700:1000"
git check-ignore -q "$private_root/stage" || no_go ".private-046 not git-ignored"
test -z "$(git ls-files -- .private-046)"
free_gib="$(df -P -BG "$private_root" | awk 'NR==2 {gsub("G", "", $4); print $4}')"
echo "063 CANDIDATES host: free disk ${free_gib} GiB (needs 10)"
[ "$free_gib" -ge 10 ] || no_go "need >= 10 GiB free disk"

case "$mode" in
--check)
  node scripts/stage-film-063.mjs --check
  actual="$(docker image inspect "$image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' 2>/dev/null || true)"
  [ "$actual" = "$(git rev-parse HEAD)" ] || echo "063 CANDIDATES: image $image needs a rebuild for --review (revision differs)"
  [ -e "$candidates" ] && echo "063 CANDIDATES: already staged in $candidates"
  [ -e "$review" ] && echo "063 CANDIDATES: review folder $review already exists"
  echo "063 CANDIDATES PREFLIGHT PASS: no downloads or file writes"
  ;;
--stage)
  [ "$(printenv BDA_FILM_063_STAGE 2>/dev/null || true)" = "TRUE" ] || no_go "explicit BDA_FILM_063_STAGE=TRUE approval required"
  [ ! -e "$candidates" ] || no_go "candidates already staged; refuse overwrite"
  BDA_FILM_063_STAGE=TRUE timeout --signal=TERM 3600s node scripts/stage-film-063.mjs --stage
  ;;
--review)
  actual="$(docker image inspect "$image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' 2>/dev/null || true)"
  [ "$actual" = "$(git rev-parse HEAD)" ] || no_go "image $image revision does not match current main (rebuild needed)"
  [ -f "$candidates/pins.json" ] || no_go "run --stage first"
  [ ! -e "$review" ] && [ ! -L "$review" ] || no_go "review folder exists; refuse overwrite"
  mkdir -m 700 "$review"
  docker run --rm --init --pull never --network none \
    --cpus 0.5 --memory 512m --memory-swap 512m --pids-limit 100 \
    --read-only --cap-drop ALL --security-opt no-new-privileges \
    --tmpfs /tmp:rw,nosuid,size=64m,uid=1000,gid=1000 \
    --mount "type=bind,source=$stage,target=/source,readonly" \
    --mount "type=bind,source=$review,target=/review" \
    --workdir /app --entrypoint /usr/local/bin/node "$image" \
    scripts/review-film-063.mjs
  cat "$review/review-063.md"
  echo "063 CANDIDATES REVIEW: contact sheets in $review (owner-only); download and view, then decide per candidate"
  ;;
esac
