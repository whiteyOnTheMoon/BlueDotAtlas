#!/usr/bin/env bash
# 034: small opt-in BlueDotAtlas backup/health tool. No live restore operation.
(
set +x
set -euo pipefail
export LC_ALL=C
umask 077
fail() { echo "034 STOP: $1" >&2; exit 2; }
[[ $# -ge 1 ]] || fail "usage: backup DIR [MEDIA_ROOT] | health | restore-test DUMP (CI only)"
repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
[[ "$(git -C "$repo" rev-parse --show-toplevel 2>/dev/null)" == "$repo" ]] ||
  fail "unexpected Git checkout"
for cmd in docker stat realpath tar sha256sum df find; do
  command -v "$cmd" >/dev/null || fail "missing utility"
done

ci=no
if [[ "${BDA_034_CI:-}" == 1 ]]; then
  [[ "${GITHUB_ACTIONS:-}" == true && "${GITHUB_REPOSITORY:-}" == whiteyOnTheMoon/BlueDotAtlas ]] ||
    fail "CI mode only on project's disposable GitHub Actions runner"
  ci=yes
  container="${BDA_034_CONTAINER:-}"
  [[ -n "$container" ]] || fail "missing disposable CI container"
  [[ "$(docker inspect -f '{{index .Config.Labels "bda.034.ci"}}' "$container" 2>/dev/null)" == true &&
     "$(docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null)" == true ]] ||
    fail "unlabelled or stopped CI container"
else
  [[ "$(id -u)" -ne 0 ]] || fail "operator must be nonroot"
  [[ "$repo" == "$(realpath -e "$HOME/www/blueDotAtlas" 2>/dev/null)" ]] ||
    fail "only the existing BlueDotAtlas VPS checkout is permitted"
  [[ "$(git -C "$repo" remote get-url origin)" == https://github.com/whiteyOnTheMoon/BlueDotAtlas.git ]] ||
    fail "unexpected Git remote"
  container="$(docker ps -q --no-trunc --filter 'label=com.docker.compose.project=bluedotatlas' --filter 'label=com.docker.compose.service=db')"
  [[ -n "$container" && "$container" != *$'\n'* ]] || fail "not exactly one project DB"
  [[ "$(docker inspect -f '{{.State.Running}}' "$container")" == true ]] ||
    fail "project DB is stopped"
fi

private_dir() {
  local dir="$1"
  [[ "$dir" == /* && -d "$dir" && ! -L "$dir" &&
    "$(realpath -e "$dir")" == "$dir" &&
    "$dir" != "$repo" && "$dir" != "$repo/"* &&
    "$(stat -c %u "$dir")" == "$(id -u)" &&
    "$(stat -c %a "$dir")" == 700 ]] ||
    fail "backup folder must be canonical, private 0700, owned and outside Git"
}
case "$1" in
  backup)
    [[ $# -eq 2 || $# -eq 3 ]] || fail "backup requires private output dir and optional media root"
    dest="$2"
    private_dir "$dest"
    media=""
    if [[ $# -eq 3 ]]; then
      media="$3"
      [[ "$media" == /* && -d "$media" && ! -L "$media" &&
        "$(realpath -e "$media")" == "$media" &&
        "$media" != "$repo" && "$media" != "$repo/"* &&
        "$media" != "$dest" && "$media" != "$dest/"* &&
        -d "$media/uploads" && -d "$media/rendered" &&
        ! -L "$media/uploads" && ! -L "$media/rendered" ]] ||
        fail "unsafe media root or missing uploads/rendered"
      [[ -z "$(find "$media/uploads" "$media/rendered" -type l -print -quit)" ]] ||
        fail "media symlink found; archive rejected"
    fi
    free="$(df -P -B1 "$dest" | awk 'NR==2 {print $4}')"
    [[ "$free" =~ ^[0-9]+$ && "$free" -ge 2147483648 ]] ||
      fail "backup destination requires at least 2 GiB available"
    dump="$(mktemp "$dest/.bda-034-dump-XXXXXXXX")"
    manifest="$(mktemp "$dest/.bda-034-manifest-XXXXXXXX")"
    media_stage=""
    checksum="$(mktemp "$dest/.bda-034-checksum-XXXXXXXX")"
    trap 'rm -f -- "$dump" "$manifest" "$checksum" ${media_stage:+"$media_stage"}' EXIT
    if ! docker exec "$container" sh -c \
      'exec pg_dump -Fc --no-owner --no-acl -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
      > "$dump" 2>/dev/null; then fail "DB dump failed"; fi
    [[ -s "$dump" ]] || fail "empty dump"
    docker exec -i "$container" pg_restore --list < "$dump" >/dev/null 2>&1 ||
      fail "invalid dump format"
    tar -cf "$manifest" -C "$repo" -- \
      compose.yml compose.cloudflare.yml compose.loopback.yml packages/db/drizzle ||
      fail "public manifest archive failed"
    if [[ -n "$media" ]]; then
      media_stage="$(mktemp "$dest/.bda-034-media-XXXXXXXX")"
      tar -cf "$media_stage" -C "$media" -- uploads rendered ||
        fail "media archive failed"
    fi
    stamp="$(date -u '+%Y%m%dT%H%M%SZ')-$$"
    : > "$checksum"
    for entry in "$dump:.dump" "$manifest:.manifest.tar" "$media_stage:.media.tar"; do
      staged="${entry%:*}"
      suffix="${entry##*:}"
      [[ -n "$staged" ]] || continue
      filename="bda-$stamp$suffix"
      digest="$(sha256sum "$staged" | awk '{print $1}')"
      printf '%s  %s\n' "$digest" "$filename" >> "$checksum"
      ln -- "$staged" "$dest/$filename" || fail "archive already exists"
    done
    ln -- "$checksum" "$dest/bda-$stamp.sha256" || fail "checksum already exists"
    echo "034 BACKUP PASS: private DB dump, public manifests and SHA-256; optional media=$([[ -n "$media" ]] && echo yes || echo no)"
    echo "034 NOTE: no offsite copy, scheduling or automatic deletion configured"
    ;;
  restore-test)
    [[ $# -eq 2 && "$ci" == yes ]] || fail "restore is restricted to disposable GitHub CI"
    file="$2"
    [[ "$file" == /* && -s "$file" && -f "$file" && ! -L "$file" &&
       "$(realpath -e "$file")" == "$file" ]] || fail "invalid test archive"
    [[ "$(docker exec "$container" sh -c 'printf "%s" "$POSTGRES_DB"')" == bda_test ]] ||
      fail "CI source DB must be bda_test"
    docker exec -i "$container" pg_restore --list < "$file" >/dev/null 2>&1 ||
      fail "not a PostgreSQL archive"
    exists="$(docker exec "$container" sh -c \
      'psql -U "$POSTGRES_USER" -d postgres -Atc "SELECT count(*) FROM pg_database WHERE datname = '\''bda_restore_test'\''"')"
    [[ "$exists" == 0 ]] || fail "restore target already exists; never overwrite"
    docker exec "$container" sh -c \
      'createdb -U "$POSTGRES_USER" bda_restore_test' >/dev/null ||
      fail "unable to create empty restore DB"
    docker exec -i "$container" sh -c \
      'exec pg_restore --no-owner --no-acl --exit-on-error -U "$POSTGRES_USER" -d bda_restore_test' \
      < "$file" >/dev/null 2>&1 || fail "fresh test restore failed"
    echo "034 RESTORE PASS: new isolated bda_restore_test (verify fixture separately)"
    ;;
  health)
    [[ $# -eq 1 ]] || fail "health takes no parameters"
    free="$(df -P -B1 / | awk 'NR==2 {print $4}')"
    disk="$(df -P / | awk 'NR==2 {gsub(/%/, "", $5);print $5}')"
    inodes="$(df -Pi / | awk 'NR==2 {gsub(/%/, "", $5);print $5}')"
    [[ "$free" =~ ^[0-9]+$ && "$disk" =~ ^[0-9]+$ && "$inodes" =~ ^[0-9]+$ ]] ||
      fail "missing filesystem counters"
    reserve=12884901888 # 12 GiB safety reserve, no automatic remediation
    if [[ "$ci" == yes && -n "${BDA_034_CI_MIN_FREE_BYTES:-}" ]]; then
      [[ "$BDA_034_CI_MIN_FREE_BYTES" =~ ^[0-9]+$ ]] || fail "invalid CI threshold"
      reserve="$BDA_034_CI_MIN_FREE_BYTES"
    fi
    if [[ "$free" -lt "$reserve" || "$disk" -ge 85 || "$inodes" -ge 85 ]]; then
      echo "034 HEALTH WARN: disk space or inode threshold reached"
      exit 1
    fi
    if [[ "$ci" == no ]]; then
      for service in db web cloudflared; do
        id="$(docker ps -q --no-trunc --filter 'label=com.docker.compose.project=bluedotatlas' --filter "label=com.docker.compose.service=$service")"
        [[ -n "$id" && "$id" != *$'\n'* &&
          "$(docker inspect -f '{{.State.Running}}' "$id")" == true ]] ||
          { echo "034 HEALTH WARN: project service $service unavailable"; exit 1; }
        if [[ "$service" != cloudflared ]]; then
          [[ "$(docker inspect -f '{{.State.Health.Status}}' "$id")" == healthy ]] ||
            { echo "034 HEALTH WARN: project $service unhealthy"; exit 1; }
        fi
      done
    fi
    echo "034 HEALTH PASS: own project containers and filesystem within limits (no changes)"
    ;;
  *) fail "usage: backup ABS_PRIVATE_DIR [MEDIA_ROOT] | health | restore-test DUMP (CI only)" ;;
esac
)
