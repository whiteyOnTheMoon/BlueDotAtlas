#!/usr/bin/env bash
# Roadmap 029: read-only live acceptance probe on the operator's EXISTING BlueDotAtlas VPS.
# No file writes, no Docker changes, no secrets/logs/config printed.
# Execute via: ( cd "$HOME/www/blueDotAtlas" || exit 1; bash scripts/verify-live-029.sh )
set +x
set -euo pipefail
export LC_ALL=C

root="$HOME/www/blueDotAtlas"
if [[ ! -d "$root/.git" ]] || [[ "$(pwd -P)" != "$(cd "$root" && pwd -P)" ]]; then
  echo "STOP: Run only from the existing ~/www/blueDotAtlas checkout."
  exit 2
fi
if [[ "$(git rev-parse --show-toplevel)" != "$root" ]] ||
   [[ "$(git remote get-url origin)" != "https://github.com/whiteyOnTheMoon/BlueDotAtlas.git" ]]; then
  echo "STOP: Unexpected repository."
  exit 2
fi
for command in docker curl; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "STOP: Required command unavailable: $command"
    exit 2
  fi
done
if ! docker info >/dev/null 2>&1; then
  echo "STOP: Docker daemon is not available to this user."
  exit 2
fi

count_lines() { awk 'NF { n++ } END { print n+0 }'; }
all_ids="$(docker ps -aq --filter 'label=com.docker.compose.project=bluedotatlas')"
count="$(printf '%s\n' "$all_ids" | count_lines)"
if [[ "$count" != "3" ]]; then
  echo "STOP: Expected exactly 3 BlueDotAtlas containers, observed $count. No changes made."
  exit 1
fi

id_for() {
  local service="$1" ids
  ids="$(docker ps -aq --filter 'label=com.docker.compose.project=bluedotatlas' \
      --filter "label=com.docker.compose.service=$service")"
  if [[ -z "$ids" || "$ids" == *$'\n'* ]]; then
    echo "STOP: Missing or duplicate BlueDotAtlas $service service." >&2
    return 1
  fi
  printf '%s' "$ids"
}
db="$(id_for db)"
web="$(id_for web)"
cloudflared="$(id_for cloudflared)"

echo '=== 029: laufende BlueDotAtlas-Dienste (nur Status) ==='
for service in db web cloudflared; do
  case "$service" in
    db) cid="$db"; memory_max=536870912; expected_networks="bluedotatlas_private_db" ;;
    web) cid="$web"; memory_max=402653184
         expected_networks="$(printf '%s\n' bluedotatlas_edge bluedotatlas_private_db | sort)" ;;
    cloudflared) cid="$cloudflared"; memory_max=134217728; expected_networks="bluedotatlas_edge" ;;
  esac
  running="$(docker inspect -f '{{.State.Running}}' "$cid")"
  restart_policy="$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' "$cid")"
  memory="$(docker inspect -f '{{.HostConfig.Memory}}' "$cid")"
  network_mode="$(docker inspect -f '{{.HostConfig.NetworkMode}}' "$cid")"
  bindings="$(docker port "$cid")"
  actual_networks="$(docker inspect -f '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}' "$cid" | sort)"
  if [[ "$running" != "true" || "$restart_policy" != "unless-stopped" ]] ||
     [[ ! "$memory" =~ ^[0-9]+$ ]] || (( memory <= 0 || memory > memory_max )) ||
     [[ "$network_mode" == "host" || -n "$bindings" ]] ||
     [[ "$actual_networks" != "$expected_networks" ]]; then
    echo "$service: FAIL – status, limits, networking or published ports differ from the review."
    exit 1
  fi
  if [[ "$service" != "cloudflared" ]]; then
    health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$cid")"
    if [[ "$health" != "healthy" ]]; then
      echo "$service: FAIL – health=$health"
      exit 1
    fi
    echo "$service: PASS (running, healthy, restart/limits, zero host ports, expected networks)"
  else
    echo "$service: PASS (running, restart/limits, zero host ports, edge-only)"
  fi
done
internal="$(docker network inspect -f '{{.Internal}}' bluedotatlas_private_db)"
if [[ "$internal" != "true" ]]; then
  echo "FAIL: BlueDotAtlas database network is not internal."
  exit 1
fi
if ! docker volume inspect bluedotatlas_bda_pgdata >/dev/null 2>&1; then
  echo "FAIL: dedicated BlueDotAtlas database volume not found."
  exit 1
fi
echo 'DB und PostgreSQL-Queue: PASS (private internal network; no host ports; dedicated volume)'
echo 'Hinweis: Kein unabhängiger externer Portscan; dieser Check belegt die lokale Docker-Isolation.'

echo '=== 029: HTTPS und anonyme Admin-Sperre ==='
# Download only into shell memory, never print response or sensitive headers.
homepage="$(curl --fail --silent --show-error --proto '=https' --max-time 20 \
  https://studio.ap-pixels.com/)" || {
  echo 'FAIL: HTTPS homepage request failed.'
  exit 1
}
if [[ "$homepage" != *"The Planet Has a Story."* ]]; then
  echo 'FAIL: HTTPS response did not contain the expected BlueDotAtlas homepage.'
  exit 1
fi
unset homepage
echo 'HTTPS public homepage: PASS (valid TLS, expected BlueDotAtlas content)'

status="$(curl --silent --show-error --proto '=https' --max-time 20 \
  -o /dev/null -w '%{http_code}' https://studio.ap-pixels.com/api/admin/session)"
if [[ "$status" != "401" ]]; then
  echo "FAIL: Anonymous admin session returned HTTP $status (expected 401)."
  exit 1
fi
echo 'Anonymous /api/admin/session: PASS (HTTP 401)'
echo 'Keine Admin-Anmeldung getestet; weder Daten noch Runtime-Secrets ausgelesen.'
echo '029 LIVE READ-ONLY CHECK: PASS (Restart-/Restore- und externe Reachability-Gates noch offen).'
