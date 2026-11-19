#!/usr/bin/env bash
# Roadmap 029 — read-only, privacy-limited VPS deployment inventory.
#
# Run locally ON THE TARGET VPS from an inspected BlueDotAtlas checkout:
#   bash scripts/audit-deploy-029.sh [optional-reviewed-candidate-port]
#
# This script does not install, connect, inspect secrets, modify, or restart
# any service. It never prints IPs, hostnames, tunnel IDs, Docker image names,
# container/project names, environment variables, volumes or network names.
# Review the aggregate output privately before sharing it.
set -uo pipefail
export LC_ALL=C

if [[ "$(uname -s)" != "Linux" ]]; then
  printf 'ERROR: Linux required.\n' >&2
  exit 2
fi

if (( $# > 1 )); then
  printf 'Usage: bash scripts/audit-deploy-029.sh [candidate-port]\n' >&2
  exit 2
fi

candidate="${1:-}"
if [[ -n "$candidate" ]]; then
  if [[ ! "$candidate" =~ ^[0-9]{4,5}$ ]]; then
    printf 'ERROR: candidate port must be numeric (1024–65535).\n' >&2
    exit 2
  fi
  n=$((10#$candidate))
  if (( n < 1024 || n > 65535 )); then
    printf 'ERROR: candidate port must be 1024–65535.\n' >&2
    exit 2
  fi
  candidate="$n"
fi

field() { printf '| %s | %s |\n' "$1" "$2"; }
count_lines() { awk 'NF { n++ } END { print n+0 }'; }
memory_value() {
  awk -v field="$1" '$1 == field ":" { printf "%.0f MiB", $2/1024; found=1; exit }
    END { if (!found) printf "NOT MEASURED" }' /proc/meminfo
}

printf '# BlueDotAtlas — Roadmap 029, sanitized VPS deployment inventory\n\n'
printf 'Collected UTC: %s. **Only authentic when executed on the VPS itself.**\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
printf 'Read-only point-in-time indicators; not a production-HTTPS, port-reservation, DNS, TLS or restore proof.\n\n'

printf '## Capacity and Linux services\n\n| Indicator | Observation |\n| --- | --- |\n'
field 'Available RAM' "$(memory_value MemAvailable)"
field 'Total RAM' "$(memory_value MemTotal)"
field 'Swap free' "$(memory_value SwapFree)"
field 'Load average (1 / 5 / 15 minutes)' "$(awk '{ print $1 " / " $2 " / " $3 }' /proc/loadavg)"
if command -v nproc >/dev/null 2>&1; then
  field 'Logical CPUs visible' "$(nproc 2>/dev/null || printf 'NOT MEASURED')"
fi
field 'Root filesystem free' "$(df -P -B1 / 2>/dev/null | awk 'NR==2 { printf "%.1f GiB (%.0f%% used)", $4/1073741824, $5+0; seen=1 } END { if (!seen) print "NOT MEASURED" }')"
field 'Root inode utilization' "$(df -Pi / 2>/dev/null | awk 'NR==2 { print $5; seen=1 } END { if (!seen) print "NOT MEASURED" }')"
if [[ -r /proc/pressure/io ]]; then
  field 'I/O pressure avg10' "$(awk '$1=="some" { for(i=2;i<=NF;i++) if ($i ~ /^avg10=/) { print $i; exit } }' /proc/pressure/io)"
fi
if command -v systemctl >/dev/null 2>&1; then
  for service in nginx apache2 caddy traefik cloudflared; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
      field "Host service $service" active
    else
      field "Host service $service" 'not confirmed active'
    fi
  done
else
  field 'Host reverse-proxy service checks' 'systemctl not available'
fi

printf '\n## Docker and reverse-proxy indicators (counts only)\n\n| Indicator | Observation |\n| --- | --- |\n'
docker_access=no
docker_published=''
if command -v docker >/dev/null 2>&1; then
  if docker_images="$(docker ps --format '{{.Image}}' 2>/dev/null)"; then
    docker_access=yes
    field 'Running Docker containers' "$(printf '%s\n' "$docker_images" | count_lines)"
    field 'Images matching cloudflared (count)' "$(printf '%s\n' "$docker_images" | awk 'tolower($0) ~ /(^|\/)cloudflared([:@]|$)/ { n++ } END { print n+0 }')"
    field 'Images matching nginx/caddy/traefik/haproxy (count)' "$(printf '%s\n' "$docker_images" | awk 'tolower($0) ~ /(^|\/)(nginx|caddy|traefik|haproxy)([:@]|$)/ { n++ } END { print n+0 }')"
    if projects="$(docker ps --format '{{.Label "com.docker.compose.project"}}' 2>/dev/null)"; then
      field 'Distinct active Compose projects (approx.)' "$(printf '%s\n' "$projects" | awk 'NF && $0 != "<no value>" && $0 != "-" { projects[$0]=1 } END { for (p in projects) n++; print n+0 }')"
    fi
    if networks="$(docker network ls --format '{{.ID}}' 2>/dev/null)"; then
      field 'Docker networks (count)' "$(printf '%s\n' "$networks" | count_lines)"
    fi
    docker_published="$(docker ps --format '{{.Ports}}' 2>/dev/null || true)"
  else
    field 'Docker daemon' 'not readable by this user'
  fi
else
  field 'Docker CLI' 'not on PATH'
fi

printf '\n## Candidate loopback port (observation only)\n\n| Indicator | Observation |\n| --- | --- |\n'
if [[ -z "$candidate" ]]; then
  field 'Candidate port' 'NOT SPECIFIED: no port scanned or assumed'
else
  field 'Candidate port' "$candidate"
  if command -v ss >/dev/null 2>&1; then
    if ss_output="$(ss -lntH 2>/dev/null)"; then
      if printf '%s\n' "$ss_output" | awk -v p="$candidate" '$4 ~ (":" p "$") { found=1 } END { exit !found }'; then
        field 'Active local TCP listeners on candidate' 'OBSERVED: occupied'
      else
        field 'Active local TCP listeners on candidate' 'NONE OBSERVED: not a reservation or guarantee'
      fi
      field 'All active TCP listening sockets (count)' "$(printf '%s\n' "$ss_output" | count_lines)"
    else
      field 'TCP listener inspection' 'not available to current user'
    fi
  else
    field 'TCP listener inspection' 'ss command unavailable'
  fi
  if [[ "$docker_access" == yes ]]; then
    if printf '%s\n' "$docker_published" | grep -Eq "(^|[^0-9])${candidate}->"; then
      field 'Existing Docker published mapping on candidate' 'OBSERVED: occupied'
    else
      field 'Existing Docker published mapping on candidate' 'NONE OBSERVED: not a reservation or guarantee'
    fi
  fi
fi

printf '\n## What this snapshot cannot establish\n\n'
printf '%s\n' \
  '- No hostnames, DNS, tunnel ingress rules, authentication secrets, or TLS certificates were read.' \
  '- Cloudflare/other ingress may terminate inside a container; a host 127.0.0.1 port is NOT automatically reachable from that network namespace.' \
  '- A single sample and a free-looking port do not grant permission to deploy, reserve a port, or change existing routing.' \
  '- Confirm the intended private host/domain/route from the owner before the operational change, without publishing tunnel credentials or ingress files.' \
  '- Obtain a separate exact VPS change approval, backup/rollback plan, and 030/034 security gates before any productive deployment.'
