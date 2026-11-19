#!/usr/bin/env bash
# 029: one operator-authorized BlueDotAtlas web restart + health/recovery proof.
# NEVER run in CI. Only the existing VPS checkout; no other Docker changes.
set +x
set -euo pipefail
export LC_ALL=C

root="$HOME/www/blueDotAtlas"
if [[ "$(pwd -P)" != "$(cd "$root" && pwd -P)" ]] ||
   [[ "$(git rev-parse --show-toplevel)" != "$root" ]] ||
   [[ "$(git remote get-url origin)" != "https://github.com/whiteyOnTheMoon/BlueDotAtlas.git" ]] ||
   [[ "$(git branch --show-current)" != "feat/029-compose-proxy-isolation" ]] ||
   [[ "$(git status --porcelain)" != "?? vps-audit-output.txt" ]]; then
  echo "STOP: Unexpected checkout/branch/git status. No restart."
  exit 2
fi
for command in docker curl sha256sum; do
  command -v "$command" >/dev/null 2>&1 || { echo "STOP: Missing command $command"; exit 2; }
done
docker info >/dev/null 2>&1 || { echo "STOP: Docker unavailable"; exit 2; }

count="$(docker ps -aq --filter 'label=com.docker.compose.project=bluedotatlas' | awk 'NF {n++} END {print n+0}')"
if [[ "$count" != "3" ]]; then echo "STOP: Unexpected BlueDotAtlas container count"; exit 2; fi
id_for() {
  local ids
  ids="$(docker ps -q --filter 'label=com.docker.compose.project=bluedotatlas' \
    --filter "label=com.docker.compose.service=$1")"
  if [[ -z "$ids" || "$ids" == *$'\n'* ]]; then
    echo "STOP: Missing or duplicate running BlueDotAtlas $1" >&2
    return 1
  fi
  printf '%s' "$ids"
}
db="$(id_for db)"
web="$(id_for web)"
cf="$(id_for cloudflared)"

if [[ "$(docker inspect -f '{{.Name}}' "$web")" != "/bluedotatlas-web-1" ]] ||
   [[ "$(docker inspect -f '{{.State.Running}}' "$web")" != "true" ]] ||
   [[ "$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' "$web")" != "unless-stopped" ]] ||
   [[ -n "$(docker port "$web")" ]]; then
  echo "STOP: Unexpected web identity/configuration"; exit 2
fi

echo "=== 029: preflight ==="
bash scripts/verify-live-029.sh

# Fingerprint foreign Docker state in memory; never display foreign names/IDs.
snapshot_foreign() {
  local id
  while IFS= read -r id; do
    [[ -n "$id" ]] || continue
    if [[ "$id" == "$db" || "$id" == "$web" || "$id" == "$cf" ]]; then continue; fi
    docker inspect -f '{{.Id}}|{{.State.Running}}|{{.State.StartedAt}}|{{.RestartCount}}' "$id" || return 1
  done < <(docker ps -aq --no-trunc | sort) | sha256sum | awk '{print $1}'
}
foreign_before="$(snapshot_foreign)"
db_before="$(docker inspect -f '{{.State.StartedAt}}' "$db")"
cf_before="$(docker inspect -f '{{.State.StartedAt}}' "$cf")"
web_before="$(docker inspect -f '{{.State.StartedAt}}' "$web")"

echo "=== 029: targeted BlueDotAtlas web restart ==="
docker restart --time 15 "$web" >/dev/null
if [[ "$(docker inspect -f '{{.State.StartedAt}}' "$web")" == "$web_before" ]] ||
   [[ "$(docker inspect -f '{{.State.Running}}' "$web")" != "true" ]]; then
  echo "FAIL: Web restart was not confirmed. No automatic retries."; exit 1
fi
echo "Web restart: PASS"

recovered=0
for attempt in {1..30}; do
  health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$web")"
  if [[ "$health" == "healthy" ]]; then
    homepage="$(curl -fsS --proto '=https' --max-time 8 \
      https://studio.ap-pixels.com/ 2>/dev/null)" || homepage=""
    if [[ "$homepage" == *"The Planet Has a Story."* ]]; then
      status="$(curl -sS --proto '=https' --max-time 8 -o /dev/null \
        -w '%{http_code}' https://studio.ap-pixels.com/api/admin/session 2>/dev/null)" || status=""
      if [[ "$status" == "401" ]]; then recovered=1; break; fi
    fi
  fi
  sleep 2
done
unset homepage
if [[ "$recovered" != "1" ]]; then
  echo "FAIL: Web health/HTTPS/anonymous session 401 did not recover."
  echo "No second restart, rollback or other Docker changes performed."; exit 1
fi
echo "Web health, HTTPS and anonymous admin 401: PASS"

if [[ "$(docker inspect -f '{{.State.StartedAt}}' "$db")" != "$db_before" ]] ||
   [[ "$(docker inspect -f '{{.State.StartedAt}}' "$cf")" != "$cf_before" ]]; then
  echo "FAIL: DB or Cloudflared start time changed"; exit 1
fi
echo "DB and Cloudflared unchanged: PASS"

foreign_after="$(snapshot_foreign)"
if [[ "$foreign_after" == "$foreign_before" ]]; then
  echo "Other VPS Docker container start states unchanged: PASS"
else
  echo "WARN: Foreign Docker container state changed during observation."
  echo "This script never changed foreign services; inspect cause separately."
fi

echo "=== 029: final read-only validation ==="
bash scripts/verify-live-029.sh
echo "029 WEB RECOVERY: PASS (external-origin scan and release review separate)"
