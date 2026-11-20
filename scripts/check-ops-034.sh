#!/usr/bin/env bash
# Disposable CI-only proof: real pg_dump/pg_restore, synthetic media and negative guards.
(
set +x
set -euo pipefail
export LC_ALL=C
[[ "${GITHUB_ACTIONS:-}" == true && "${GITHUB_REPOSITORY:-}" == whiteyOnTheMoon/BlueDotAtlas ]] ||
  { echo "034 test refuses non-GitHub CI"; exit 2; }
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$root" || exit 2
tmp="$(mktemp -d /tmp/bda-034-test-XXXXXXXX)"
container=""
cleanup() {
  [[ -z "$container" ]] || docker rm -f "$container" >/dev/null 2>&1 || true
  rm -rf -- "$tmp"
}
trap cleanup EXIT
mkdir -m 700 "$tmp/backups" "$tmp/media" "$tmp/media/uploads" "$tmp/media/rendered" "$tmp/media/temp"
printf 'SYNTHETIC UPLOAD\n' > "$tmp/media/uploads/fixture.txt"
printf 'SYNTHETIC RENDER BYTES\n' > "$tmp/media/rendered/fixture.mp4"
printf 'NEVER BACKUP TEMP\n' > "$tmp/media/temp/discard.txt"
container="$(docker run -d --rm --label bda.034.ci=true \
  -e POSTGRES_USER=bda_test \
  -e POSTGRES_DB=bda_test \
  -e POSTGRES_PASSWORD=SYNTHETIC-bda-034-test-only \
  postgres:16-alpine)"
export GITHUB_ACTIONS=true
export GITHUB_REPOSITORY=whiteyOnTheMoon/BlueDotAtlas
export BDA_034_CI=1
export BDA_034_CONTAINER="$container"

ready=0
for attempt in {1..40}; do
  if docker exec "$container" pg_isready -U bda_test -d bda_test >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done
[[ "$ready" == 1 ]] || { echo "034 test PostgreSQL not ready"; exit 1; }
docker exec "$container" psql -U bda_test -d bda_test -v ON_ERROR_STOP=1 -q \
  -c "CREATE TABLE bda_restore_proof (id integer PRIMARY KEY, note text NOT NULL); INSERT INTO bda_restore_proof VALUES (1, 'synthetic-restored');" \
  >/dev/null

bash scripts/ops-034.sh health
if BDA_034_CI_MIN_FREE_BYTES=999999999999999 bash scripts/ops-034.sh health >/dev/null 2>&1; then
  echo "034 FAIL: low disk simulation must warn" >&2
  exit 1
fi
if bash scripts/ops-034.sh backup "$root" >/dev/null 2>&1; then
  echo "034 FAIL: destination within Git was accepted" >&2
  exit 1
fi
ln -s /etc/hostname "$tmp/media/uploads/unsafe-link"
if bash scripts/ops-034.sh backup "$tmp/backups" "$tmp/media" >/dev/null 2>&1; then
  echo "034 FAIL: symlinked media was accepted" >&2
  exit 1
fi
rm "$tmp/media/uploads/unsafe-link"
bash scripts/ops-034.sh backup "$tmp/backups" "$tmp/media"
(
  cd "$tmp/backups" || exit 1
  sha256sum --check --status ./*.sha256
)
dump=( "$tmp/backups"/*.dump )
media=( "$tmp/backups"/*.media.tar )
manifests=( "$tmp/backups"/*.manifest.tar )
[[ "${#dump[@]}" -eq 1 && "${#media[@]}" -eq 1 && "${#manifests[@]}" -eq 1 ]] ||
  { echo "034 FAIL: incomplete archive triplet"; exit 1; }
for file in "${dump[@]}" "${media[@]}" "${manifests[@]}" "$tmp/backups"/*.sha256; do
  [[ "$(stat -c %a "$file")" == 600 ]] ||
    { echo "034 FAIL: public backup permissions"; exit 1; }
done
tar -tf "${media[0]}" | grep -q '^uploads/fixture.txt$'
tar -tf "${media[0]}" | grep -q '^rendered/fixture.mp4$'
if tar -tf "${media[0]}" | grep -q 'temp/'; then
  echo "034 FAIL: scratch copied into media archive" >&2
  exit 1
fi
tar -tf "${manifests[0]}" | grep -q '^compose.yml$'
if tar -tf "${manifests[0]}" | grep -Eq '(^|/)\.env'; then
  echo "034 FAIL: credential file copied" >&2
  exit 1
fi
# CI container alone may restore, into a new different database only.
bash scripts/ops-034.sh restore-test "${dump[0]}"
found="$(docker exec "$container" psql -U bda_test -d bda_restore_test -Atc 'SELECT note FROM bda_restore_proof WHERE id=1')"
[[ "$found" == synthetic-restored ]] ||
  { echo "034 FAIL: fresh restored DB lost synthetic data"; exit 1; }
if bash scripts/ops-034.sh restore-test "${dump[0]}" >/dev/null 2>&1; then
  echo "034 FAIL: existing restore database was overwritten" >&2
  exit 1
fi
if ( unset BDA_034_CI; bash scripts/ops-034.sh restore-test "${dump[0]}" ) >/dev/null 2>&1; then
  echo "034 FAIL: restore permitted outside disposable CI guard" >&2
  exit 1
fi
echo "034 CI PASS: private DB+media+manifest backup, hashes, fresh PostgreSQL restore, synthetic row and negative guards"
)