import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { createProject } from '../packages/db/dist/index.js';
import {
  assertSyntheticTestDatabase,
  cancelJob,
  enqueueSyntheticJob,
  openDatabase,
} from '../packages/db/dist/queue.js';

assertSyntheticTestDatabase();
if (
  !process.env.BDA_ADMIN_EMAIL?.endsWith('.invalid') ||
  !process.env.BDA_TEST_ADMIN_PASSWORD?.startsWith('SYNTHETIC-') ||
  !process.env.BDA_ADMIN_PASSWORD_HASH
) {
  throw new Error('Only synthetic CI credentials are permitted');
}

const origin = 'http://127.0.0.1:3119';
const allChildren = new Set();
function start(command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.output = '';
  child.stdout.on('data', (value) => {
    child.output = (child.output + String(value)).slice(-2000);
  });
  child.stderr.on('data', (value) => {
    child.output = (child.output + String(value)).slice(-2000);
  });
  allChildren.add(child);
  child.once('exit', () => allChildren.delete(child));
  return child;
}
function worker(extraEnv = {}) {
  return start(process.execPath, ['apps/worker/dist/run.js'], {
    BDA_WORKER_ONCE: '1',
    ...extraEnv,
  });
}
function finished(child, timeoutMs = 14_000) {
  return new Promise((resolve, reject) => {
    if (child.exitCode !== null || child.signalCode) {
      resolve({ code: child.exitCode, signal: child.signalCode });
      return;
    }
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('Subprocess timeout: ' + child.output));
    }, timeoutMs);
    child.once('exit', (code, signal) => {
      clearTimeout(timeout);
      resolve({ code, signal });
    });
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

const connection = openDatabase();
async function job(id) {
  const r = await connection.pool.query(
    'SELECT status, attempt, max_attempts, progress_pct, error_code, lease_token, heartbeat_at FROM render_jobs WHERE id=$1::uuid',
    [id],
  );
  assert.ok(r.rows[0], 'Test job must exist');
  return r.rows[0];
}
async function waitStatus(id, status, timeoutMs = 8_000) {
  const until = Date.now() + timeoutMs;
  let row;
  while (Date.now() < until) {
    row = await job(id);
    if (row.status === status) return row;
    await delay(55);
  }
  throw new Error('Timed out waiting for ' + status + ' (last: ' + JSON.stringify(row) + ')');
}
async function oneWorkerSucceeded() {
  const child = worker();
  const result = await finished(child);
  assert.equal(result.code, 0, 'Synthetic worker failed: ' + child.output);
  return child;
}

let server;
try {
  const denied = worker({ BDA_WORKER_SYNTHETIC_TEST: '' });
  assert.equal((await finished(denied)).code, 1, 'Worker must fail closed outside test mode');

  server = start('pnpm', [
    '--filter', '@bluedotatlas/web', 'start',
    '--hostname', '127.0.0.1', '--port', '3119',
  ], { NODE_ENV: 'production' });
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null) throw new Error('Production Next.js exited: ' + server.output);
    try {
      if ((await fetch(origin + '/admin/login')).status === 200) {
        ready = true;
        break;
      }
    } catch { /* Next.js is starting */ }
    await delay(500);
  }
  if (!ready) throw new Error('Production Next.js did not start: ' + server.output);
  const login = await fetch(origin + '/api/auth/login', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/x-www-form-urlencoded' },
    redirect: 'manual',
    body: new URLSearchParams({
      email: process.env.BDA_ADMIN_EMAIL,
      password: process.env.BDA_TEST_ADMIN_PASSWORD,
    }),
  });
  assert.equal(login.status, 303);
  const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0];
  assert.match(cookie, /^__Host-bda-session=/);

  const created = await createProject(connection, { title: 'Worker 027 synthetic HTTP liveness' });
  const version = await connection.pool.query(
    'SELECT id FROM project_versions WHERE project_id=$1::uuid',
    [created.project.id],
  );
  const versionId = version.rows[0]?.id;
  assert.ok(versionId);

  const livenessId = await enqueueSyntheticJob(connection, versionId, { durationMs: 3000 });
  const activeWorker = worker();
  await waitStatus(livenessId, 'running');
  const started = Date.now();
  const response = await fetch(origin + '/api/v1/jobs/' + livenessId, {
    headers: { Cookie: cookie },
  });
  const elapsedMs = Date.now() - started;
  assert.equal(response.status, 200);
  const publicRow = await response.json();
  assert.equal(publicRow.id, livenessId);
  assert.equal(publicRow.status, 'running', 'HTTP must answer BEFORE the job completes');
  assert.ok(elapsedMs < 1300, 'HTTP request blocked by running worker');
  assert.equal((await job(livenessId)).status, 'running');
  assert.equal((await finished(activeWorker)).code, 0, activeWorker.output);
  const succeeded = await waitStatus(livenessId, 'succeeded');
  assert.equal(succeeded.attempt, 1);
  assert.equal(succeeded.progress_pct, 100);
  assert.equal(succeeded.lease_token, null);

  const retryId = await enqueueSyntheticJob(connection, versionId, {
    durationMs: 350, failUntilAttempt: 1, maxAttempts: 3,
  });
  await oneWorkerSucceeded();
  assert.equal((await waitStatus(retryId, 'failed')).error_code, 'synthetic_failure');
  await delay(340);
  await oneWorkerSucceeded();
  assert.equal((await waitStatus(retryId, 'succeeded')).attempt, 2);

  const cancelId = await enqueueSyntheticJob(connection, versionId, { durationMs: 2600 });
  const cancelWorker = worker();
  await waitStatus(cancelId, 'running');
  assert.equal(await cancelJob(connection, cancelId), true);
  assert.equal((await finished(cancelWorker)).code, 0);
  assert.equal((await job(cancelId)).status, 'cancelled', 'No late success after cancellation');

  const stoppedId = await enqueueSyntheticJob(connection, versionId, { durationMs: 2500 });
  const stopWorker = worker();
  await waitStatus(stoppedId, 'running');
  stopWorker.kill('SIGTERM');
  assert.equal((await finished(stopWorker)).code, 0, 'Graceful SIGTERM must close worker');
  assert.equal((await waitStatus(stoppedId, 'failed')).error_code, 'worker_stopped');
  await delay(340);
  await oneWorkerSucceeded();
  assert.equal((await waitStatus(stoppedId, 'succeeded')).attempt, 2);

  const crashId = await enqueueSyntheticJob(connection, versionId, { durationMs: 2200 });
  const crashed = worker();
  await waitStatus(crashId, 'running');
  crashed.kill('SIGKILL');
  assert.equal((await finished(crashed)).signal, 'SIGKILL');
  await delay(2150);
  await oneWorkerSucceeded(); // One-shot recovery marks failed, does not bypass backoff.
  assert.equal((await waitStatus(crashId, 'failed')).error_code, 'lease_expired');
  await delay(340);
  await oneWorkerSucceeded();
  assert.equal((await waitStatus(crashId, 'succeeded')).attempt, 2);

  const raceId = await enqueueSyntheticJob(connection, versionId, { durationMs: 500 });
  const raceA = worker();
  const raceB = worker();
  const outcomes = await Promise.all([finished(raceA), finished(raceB)]);
  assert.ok(outcomes.every((result) => result.code === 0), 'Two independent worker processes');
  assert.equal((await waitStatus(raceId, 'succeeded')).attempt, 1);

  const videoResult = await connection.pool.query(
    'SELECT COUNT(*)::integer AS count FROM videos WHERE status = $1',
    ['published'],
  );
  assert.equal(videoResult.rows[0]?.count, 0, 'Synthetic worker must never publish video');

  process.stdout.write(
    'M02 027 PASS: isolated worker refused live mode; separate worker + nonblocking authenticated HTTP; ' +
    'two-process concurrency; heartbeats; retry/backoff; cancellation; graceful shutdown; real SIGKILL recovery; ' +
    'no publication or media output.\n',
  );
} finally {
  for (const child of allChildren) child.kill('SIGKILL');
  await connection.pool.end();
}
