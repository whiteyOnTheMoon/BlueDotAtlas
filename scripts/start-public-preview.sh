#!/usr/bin/env bash
# BlueDotAtlas: explicit operator-initiated PUBLIC HOMEPAGE PREVIEW.
# One existing repository, one Compose project, no new staging directories.
# Do not invoke without owner approval for starting BlueDotAtlas Docker resources.
set +x
set -euo pipefail
umask 077
export LC_ALL=C

root="$HOME/www/blueDotAtlas"
# The preview script is intentionally branch-scoped, not a production release.
if [[ "$(id -u)" == "0" ]]; then
  echo "STOP: Execute as the regular ap user, not root." >&2
  exit 1
fi
if [[ ! -d "$root/.git" || "$(pwd -P)" != "$(cd "$root" && pwd -P)" ]]; then
  echo "STOP: Run only inside the existing ~/www/blueDotAtlas checkout." >&2
  exit 1
fi
if [[ "$(git rev-parse --show-toplevel)" != "$root" ]] ||
   [[ "$(git remote get-url origin)" != "https://github.com/whiteyOnTheMoon/BlueDotAtlas.git" ]] ||
   [[ "$(git branch --show-current)" != "feat/029-compose-proxy-isolation" ]]; then
  echo "STOP: Unexpected repository or branch." >&2
  exit 1
fi
if [[ "$(git status --porcelain --untracked-files=normal)" != "?? vps-audit-output.txt" ]]; then
  echo "STOP: Unexpected local files or tracked changes. Nothing started." >&2
  exit 1
fi
for file in .env.bda.db .env.bda.web .env.bda.tunnel.token; do
  if ! git check-ignore -q "$file"; then
    echo "STOP: A private credential file is not Git-ignored: $file" >&2
    exit 1
  fi
done
for command in docker openssl stat; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "STOP: Required command missing: $command" >&2
    exit 1
  fi
done
docker compose version >/dev/null
if [[ -n "$(docker ps -aq --filter 'label=com.docker.compose.project=bluedotatlas')" ]] ||
   [[ -n "$(docker ps -aq --filter 'label=com.docker.compose.project=bluedotatlas-029')" ]]; then
  echo "STOP: BlueDotAtlas Docker containers already exist. Inspect before restarting." >&2
  exit 1
fi
for resource in bluedotatlas_bda_pgdata bluedotatlas-029_bda_pgdata; do
  if docker volume inspect "$resource" >/dev/null 2>&1; then
    echo "STOP: Existing BlueDotAtlas volume: $resource" >&2
    exit 1
  fi
done
for resource in bluedotatlas_edge bluedotatlas_private_db bluedotatlas-029_edge bluedotatlas-029_private_db; do
  if docker network inspect "$resource" >/dev/null 2>&1; then
    echo "STOP: Existing BlueDotAtlas network: $resource" >&2
    exit 1
  fi
done

if ! [[ -t 0 ]]; then
  echo "STOP: Interactive terminal required to enter the Cloudflare token privately." >&2
  exit 1
fi
if [[ ! -e .env.bda.db && ! -e .env.bda.web ]]; then
  password="$(openssl rand -hex 32)"
  printf 'POSTGRES_DB=bluedotatlas\nPOSTGRES_USER=bluedotatlas\nPOSTGRES_PASSWORD=%s\n' \
    "$password" > .env.bda.db
  printf 'NODE_ENV=production\nDATABASE_URL=postgresql://bluedotatlas:%s@db:5432/bluedotatlas\nAPP_ORIGIN=https://studio.ap-pixels.com\n' \
    "$password" > .env.bda.web
  unset password
  echo "Private DB/web env files created without enabling an administrator."
elif [[ ! -f .env.bda.db || ! -f .env.bda.web ]]; then
  echo "STOP: Partial configuration exists. Nothing overwritten." >&2
  exit 1
fi

for file in .env.bda.db .env.bda.web; do
  if [[ ! -s "$file" || "$(stat -c %u "$file")" != "$(id -u)" ]] ||
     [[ "$(stat -c %a "$file")" != "600" ]]; then
    echo "STOP: Invalid owner/permissions or empty env file: $file" >&2
    exit 1
  fi
done
if grep -Eq '^BDA_ADMIN_(EMAIL|PASSWORD_HASH)=' .env.bda.web; then
  echo "STOP: Public preview must not enable the administrator." >&2
  exit 1
fi

if [[ ! -e .env.bda.tunnel.token ]]; then
  printf '%s' "Paste ONLY the existing BlueDotAtlas tunnel token (hidden): "
  IFS= read -r -s token
  printf '\n'
  if [[ -z "$token" || "$token" =~ [[:space:]] ]]; then
    unset token
    echo "STOP: Token empty or includes whitespace. Nothing started." >&2
    exit 1
  fi
  printf '%s' "$token" > .env.bda.tunnel.token
  unset token
  echo "Cloudflare token stored privately; its value was not printed."
fi
if [[ ! -f .env.bda.tunnel.token || ! -s .env.bda.tunnel.token ]] ||
   [[ "$(stat -c %u .env.bda.tunnel.token)" != "$(id -u)" ]] ||
   [[ "$(stat -c %a .env.bda.tunnel.token)" != "600" ]]; then
  echo "STOP: Invalid Cloudflare token file owner/permissions." >&2
  exit 1
fi

export BDA_DB_ENV_FILE="$root/.env.bda.db"
export BDA_WEB_ENV_FILE="$root/.env.bda.web"
# Worker profile stays disabled, but Compose interpolates its env_file.
export BDA_WORKER_ENV_FILE="$root/.env.bda.web"
export BDA_TUNNEL_TOKEN_FILE="$root/.env.bda.tunnel.token"
export BDA_TUNNEL_UID="$(id -u)"
export BDA_TUNNEL_GID="$(id -g)"
export BDA_CLOUDFLARED_IMAGE='cloudflare/cloudflared:2026.11.1'

echo "Checking the effective Compose configuration (no secret output)..."
docker compose --profile future-tunnel -f compose.yml -f compose.cloudflare.yml config --quiet

echo "Building the BlueDotAtlas web image (no other projects affected)..."
docker compose --profile future-tunnel -f compose.yml -f compose.cloudflare.yml build web

echo "Starting only dedicated BlueDotAtlas PostgreSQL and web services..."
docker compose --profile future-tunnel -f compose.yml -f compose.cloudflare.yml \
  up -d --no-build --wait --wait-timeout 150 db web

echo "Starting only the existing Cloudflare tunnel's new BlueDotAtlas connector..."
docker compose --profile future-tunnel -f compose.yml -f compose.cloudflare.yml \
  up -d --no-build cloudflared

echo "=== BlueDotAtlas status ==="
docker compose --profile future-tunnel -f compose.yml -f compose.cloudflare.yml ps
echo "=== Public homepage (Cloudflare connectivity not yet proven) ==="
echo "https://studio.ap-pixels.com"
echo "Admin sign-in is intentionally disabled; no media or migrations started."
