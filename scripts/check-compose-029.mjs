import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * Check effective "docker compose config --format json" with optional profiles
 * included. Never publish these config files when they contain real secrets.
 *
 * base:    private Web+DB, no published ports
 * loopback: Web only 127.0.0.1:<reviewed-port> for disposable CI
 * tunnel:  Web and DB without ANY host ports, optional cloudflared edge-only
 */
export function reviewCompose(config, mode = 'base') {
  const errors = [];
  const fail = (message) => errors.push(message);
  if (!['base', 'loopback', 'tunnel'].includes(mode)) return ['unknown Compose mode'];
  if (config.name !== 'bluedotatlas') fail('unexpected project namespace');
  const services = config.services || {};
  const networks = config.networks || {};
  for (const name of ['web', 'db', 'migrate', 'worker']) {
    if (!services[name]) fail(`missing ${name} service`);
  }
  const {web = {}, db = {}, worker = {}, migrate = {}} = services;
  if (networks.private_db?.internal !== true) fail('DB network must be internal');
  if (db.ports?.length || worker.ports?.length || migrate.ports?.length) {
    fail('private services must not publish host ports');
  }
  for (const name of ['db', 'worker', 'migrate']) {
    const n = services[name]?.networks || {};
    if (Object.hasOwn(n, 'edge')) fail(`${name} must not join edge network`);
    if (!Object.hasOwn(n, 'private_db')) fail(`${name} must join private network`);
  }
  if (!Object.hasOwn(web.networks || {}, 'edge') || !Object.hasOwn(web.networks || {}, 'private_db')) {
    fail('web networks incomplete');
  }
  if (mode === 'loopback') {
    if (web.ports?.length !== 1 || web.ports[0]?.host_ip !== '127.0.0.1'
      || Number(web.ports[0]?.target) !== 3000
      || !(Number(web.ports[0]?.published) >= 1024)) {
      fail('loopback mode must publish exactly one reviewed local port -> 3000');
    }
  } else if (web.ports?.length) {
    fail(`${mode} mode must NEVER publish web host ports`);
  }
  for (const [name, limit, cpu] of [
    ['db', 512, 0.25], ['web', 384, 0.25], ['worker', 1024, 0.5],
  ]) {
    const s = services[name] || {};
    if (!(Number(s.mem_limit) > 0) || Number(s.mem_limit) > limit * 1024 * 1024) {
      fail(`${name} memory cap exceeded or missing`);
    }
    if (!(Number(s.cpus) > 0) || Number(s.cpus) > cpu) {
      fail(`${name} CPU cap exceeded or missing`);
    }
  }
  if (!worker.profiles?.includes('future-renderer')) fail('synthetic worker must remain opt-in');
  if (!migrate.profiles?.includes('maintenance')) fail('migration must remain opt-in');
  if (web.read_only !== true || worker.read_only !== true) fail('app filesystem must be read-only');
  if (!web.cap_drop?.includes('ALL') || !worker.cap_drop?.includes('ALL')) fail('missing dropped capabilities');
  if (db.depends_on?.web || db.depends_on?.worker) fail('DB startup must not depend on applications');
  if (web.depends_on?.db?.condition !== 'service_healthy') fail('web must wait for DB health');
  const dbVolumes = db.volumes || [];
  if (dbVolumes.length !== 1 || dbVolumes[0]?.type !== 'volume'
      || dbVolumes[0]?.target !== '/var/lib/postgresql/data') {
    fail('DB must use one dedicated named volume');
  }
  for (const name of ['web', 'db', 'worker', 'migrate', 'cloudflared']) {
    const s = services[name];
    if (!s) continue;
    if (s.privileged === true) fail(`${name} must never run privileged`);
    if (s.network_mode === 'host') fail(`${name} must never use host networking`);
    if ((s.volumes || []).some(v => (v.source || '').includes('docker.sock'))) {
      fail(`${name} must not mount Docker socket`);
    }
  }
  if (mode === 'tunnel') {
    const tunnel = services.cloudflared || {};
    if (!services.cloudflared) fail('tunnel overlay needs cloudflared');
    if (!tunnel.profiles?.includes('future-tunnel')) fail('tunnel must be explicitly opt-in');
    if (!Object.hasOwn(tunnel.networks || {}, 'edge')
        || Object.hasOwn(tunnel.networks || {}, 'private_db')) {
      fail('cloudflared must connect to edge only; NEVER directly to database');
    }
    if (tunnel.ports?.length) fail('cloudflared must have no host port');
    if (!/^[1-9][0-9]*:[1-9][0-9]*$/.test(String(tunnel.user || ''))) {
      fail('cloudflared must use nonroot numeric UID:GID for the private file secret');
    }
    if (tunnel.read_only !== true || !tunnel.cap_drop?.includes('ALL')) {
      fail('cloudflared must be read-only with no capabilities');
    }
    if (!(Number(tunnel.mem_limit) > 0) || Number(tunnel.mem_limit) > 128 * 1024 * 1024
        || !(Number(tunnel.cpus) > 0) || Number(tunnel.cpus) > 0.1) {
      fail('cloudflared needs strict memory and CPU caps');
    }
    if (!tunnel.depends_on?.web || tunnel.depends_on.web.condition !== 'service_healthy') {
      fail('cloudflared must depend on healthy web');
    }
    if (!tunnel.command?.includes('--token-file') || !tunnel.command?.includes('/run/secrets/bda_tunnel_token')) {
      fail('cloudflared must obtain credentials from mounted token FILE only');
    }
    if (tunnel.environment?.TUNNEL_TOKEN || tunnel.environment?.TUNNEL_TOKEN_FILE) {
      fail('cloudflared token must not be in environment');
    }
    if (!tunnel.secrets?.some(s => s.source === 'bda_tunnel_token')
        || !config.secrets?.bda_tunnel_token?.file) {
      fail('cloudflared token file secret missing');
    }
    if (!String(tunnel.image || '').startsWith('cloudflare/cloudflared:') &&
        !String(tunnel.image || '').startsWith('cloudflare/cloudflared@sha256:')) {
      fail('cloudflared image origin must be explicit');
    }
  } else if (services.cloudflared) {
    fail('cloudflared must not be present without explicit tunnel profile');
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.ok(process.argv.length === 3 || process.argv.length === 4,
    'usage: check-compose-029.mjs <rendered-config.json> [base|loopback|tunnel]');
  const model = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const mode = process.argv[3] || 'base';
  const problems = reviewCompose(model, mode);
  if (problems.length) {
    process.stderr.write(`029 ${mode} security review failed: ${problems.join('; ')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`029 ${mode} Compose static security PASS (not live VPS/HTTPS proof).\n`);
  }
}
