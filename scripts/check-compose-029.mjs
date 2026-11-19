import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Validate docker compose config --format json, never an untrusted .env file. */
export function reviewCompose(config) {
  const problems = [];
  const fail = (message) => problems.push(message);
  if (config.name !== 'bluedotatlas-029') fail('unexpected project namespace');
  const services = config.services || {};
  for (const name of ['web', 'db', 'migrate', 'worker']) {
    if (!services[name]) fail(`missing ${name} service`);
  }
  const db = services.db || {};
  const web = services.web || {};
  const worker = services.worker || {};
  const migrate = services.migrate || {};
  const networks = config.networks || {};
  if (networks.private_db?.internal !== true) fail('DB network must be internal');
  if (db.ports?.length || worker.ports?.length || migrate.ports?.length) {
    fail('private services must not publish host ports');
  }
  for (const name of ['db', 'worker', 'migrate']) {
    if (Object.hasOwn(services[name]?.networks || {}, 'edge')) fail(`${name} must not join edge network`);
    if (!Object.hasOwn(services[name]?.networks || {}, 'private_db')) fail(`${name} must join private network`);
  }
  if (!Object.hasOwn(web.networks || {}, 'edge') || !Object.hasOwn(web.networks || {}, 'private_db')) fail('web networks incomplete');
  if (web.ports?.length !== 1 || web.ports[0]?.host_ip !== '127.0.0.1' || Number(web.ports[0]?.target) !== 3000) {
    fail('web must publish exactly one loopback-only 3000 port');
  }
  for (const [name, limit, cpu] of [['db', 512, 0.25], ['web', 384, 0.25], ['worker', 1024, 0.5]]) {
    const s = services[name] || {};
    if (!(Number(s.mem_limit) > 0) || Number(s.mem_limit) > limit * 1024 * 1024) fail(`${name} memory cap exceeded or missing`);
    if (!(Number(s.cpus) > 0) || Number(s.cpus) > cpu) fail(`${name} CPU cap exceeded or missing`);
  }
  if (!worker.profiles?.includes('future-renderer')) fail('synthetic worker must remain opt-in');
  if (!migrate.profiles?.includes('maintenance')) fail('migration must remain opt-in');
  if (web.read_only !== true || worker.read_only !== true) fail('app filesystem must be read-only');
  if (!web.cap_drop?.includes('ALL') || !worker.cap_drop?.includes('ALL')) fail('missing dropped capabilities');
  if (db.depends_on?.web || db.depends_on?.worker) fail('DB startup must not depend on applications');
  if (web.depends_on?.db?.condition !== 'service_healthy') fail('web must wait for DB health');
  const dbVolumes = db.volumes || [];
  if (dbVolumes.length !== 1 || dbVolumes[0]?.type !== 'volume' || dbVolumes[0]?.target !== '/var/lib/postgresql/data') {
    fail('DB must use one dedicated named volume');
  }
  for (const name of ['web', 'db', 'worker', 'migrate']) {
    if (services[name]?.privileged === true) fail(`${name} must never run privileged`);
    if (services[name]?.network_mode === 'host') fail(`${name} must never use host networking`);
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.equal(process.argv.length, 3, 'pass rendered Docker Compose JSON file path');
  const model = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const problems = reviewCompose(model);
  if (problems.length) {
    process.stderr.write(`029 Compose security review failed: ${problems.join('; ')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write('029 Compose static security PASS (not live deployment or HTTPS proof).\n');
  }
}
