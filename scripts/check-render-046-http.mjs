import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { openDatabase } from '../packages/db/dist/index.js';

const origin = 'http://127.0.0.1:3146';
const browserOrigin = 'http://localhost:3146';
const email = process.env.BDA_ADMIN_EMAIL;
const password = process.env.BDA_TEST_ADMIN_PASSWORD;
const dbUrl = new URL(process.env.DATABASE_URL ?? 'postgresql://invalid');
if (
  process.env.CI !== 'true' ||
  process.env.BDA_DB_TEST !== '1' ||
  process.env.BDA_WORKER_SYNTHETIC_TEST !== '1' ||
  process.env.BDA_STORAGE_TEST !== '1' ||
  process.env.BDA_RENDER_046_SYNTHETIC_PROOF !== 'TRUE' ||
  dbUrl.username !== 'bda_test' ||
  !['localhost', '127.0.0.1'].includes(dbUrl.hostname) ||
  dbUrl.pathname !== '/bda_test' ||
  !email?.endsWith('.invalid') ||
  !password?.startsWith('SYNTHETIC-') ||
  !process.env.BDA_ADMIN_PASSWORD_HASH
) {
  throw new Error('046 HTTP/UI QA refuses any non-synthetic CI credentials or database');
}
const output = resolve('.tmp-render-046/http-ui');
mkdirSync(output, { recursive: true });
const root = mkdtempSync(join(tmpdir(), 'bda-storage-028-046-http-'));

const children = new Set();
function start(cmd, args, env = {}) {
  const child = spawn(cmd, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.output = '';
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (chunk) => {
      child.output = (child.output + String(chunk)).slice(-1800);
    });
  }
  children.add(child);
  child.once('exit', () => children.delete(child));
  return child;
}
function waitExit(child, maximum = 90_000) {
  return new Promise((resolvePromise, reject) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolvePromise({ code: child.exitCode, signal: child.signalCode });
      return;
    }
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('046 child timed out (no process details disclosed)'));
    }, maximum);
    child.once('exit', (code, signal) => {
      clearTimeout(timeout);
      resolvePromise({ code, signal });
    });
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([waitExit(child, 12_000), delay(12_500)]).catch(() => {});
  if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
}
async function serverReady(child) {
  for (let n = 0; n < 100; n++) {
    if (child.exitCode !== null) throw new Error('046 test server stopped unexpectedly');
    try {
      if ((await fetch(origin + '/admin/login')).status === 200) return;
    } catch {
      // Next.js is still starting.
    }
    await delay(400);
  }
  throw new Error('046 test server was not ready');
}
async function request(path, options = {}) {
  const response = await fetch(origin + path, { redirect: 'manual', ...options });
  const text = await response.text();
  assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  assert.doesNotMatch(text, /(?:postgresql:\/\/|node_modules|stack trace|leaseToken|storageKey|checksumSha256|private-secret)/i);
  return {
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : null,
  };
}
async function reject(path, options, status, code) {
  const response = await request(path, options);
  assert.equal(response.status, status, path);
  assert.equal(response.body?.error?.code, code, path);
}
async function dbRows(sql, args = []) {
  const connection = openDatabase();
  try {
    return (await connection.pool.query(sql, args)).rows;
  } finally {
    await connection.pool.end();
  }
}
async function waitJob(jobId, wanted, timeout = 30_000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const rows = await dbRows(
      'SELECT status, progress_pct FROM render_jobs WHERE id = $1::uuid',
      [jobId],
    );
    if (rows[0]?.status === wanted) return rows[0];
    await delay(100);
  }
  throw new Error('046 job did not reach expected state: ' + wanted);
}

let server;
let browser;
const report = {
  scope: 'ORIGINAL_SYNTHETIC_046_HTTP_BROWSER_CI_ONLY',
  productionRenderAuthorized: false,
  published: false,
  checks: [],
};
try {
  server = start('pnpm', [
    '--filter', '@bluedotatlas/web', 'start',
    '--hostname', '127.0.0.1', '--port', '3146',
  ], { NODE_ENV: 'production', BDA_046_TEST_STORAGE_ROOT: root });
  await serverReady(server);

  const baselineJobCount = (await dbRows('SELECT count(*)::int AS n FROM render_jobs'))[0].n;
  const post = '/api/v1/render-046';
  const unknown = '/api/v1/projects/' + randomUUID() + '/render-046';
  await reject(post, {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ projectId: randomUUID() }),
  }, 401, 'unauthorized');
  await reject(unknown, {}, 401, 'unauthorized');
  const login = await fetch(origin + '/api/auth/login', {
    method: 'POST',
    redirect: 'manual',
    headers: { origin, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email, password }),
  });
  assert.equal(login.status, 303);
  const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0];
  assert.match(cookie, /^__Host-bda-session=/);
  const auth = { Cookie: cookie };
  const headers = { ...auth, origin, 'content-type': 'application/json' };

  await reject(post, {
    method: 'POST', headers: { ...headers, origin: 'https://untrusted.invalid' },
    body: JSON.stringify({ projectId: randomUUID() }),
  }, 403, 'forbidden_origin');
  await reject(post, { method: 'POST', headers, body: '{' }, 400, 'invalid_json');
  await reject(post, {
    method: 'POST', headers, body: JSON.stringify({ projectId: randomUUID(), url: 'https://untrusted.invalid/file.mp4' }),
  }, 400, 'invalid_input');
  await reject(post, {
    method: 'POST', headers, body: JSON.stringify({ projectId: randomUUID(), render_authorized: true }),
  }, 400, 'invalid_input');
  await reject(post, {
    method: 'POST', headers, body: JSON.stringify({ projectId: '/etc/passwd' }),
  }, 400, 'invalid_input');
  await reject(post, {
    method: 'POST', headers, body: JSON.stringify({ projectId: 42 }),
  }, 400, 'invalid_input');
  await reject(post, {
    method: 'POST', headers, body: JSON.stringify({ projectId: randomUUID(), options: { shell: 'arbitrary' } }),
  }, 400, 'invalid_input');
  await reject(post, {
    method: 'POST', headers: { ...auth, origin, 'content-type': 'text/plain' },
    body: '{}',
  }, 415, 'unsupported_media_type');
  await reject(post, {
    method: 'POST', headers, body: 'x'.repeat(8300),
  }, 413, 'body_too_large');
  await reject(post + '?debug=1', {
    method: 'POST', headers, body: '{}',
  }, 400, 'invalid_input');
  await reject(post, { method: 'GET', headers: auth }, 405, 'method_not_allowed');
  await reject(unknown, { method: 'POST', headers }, 405, 'method_not_allowed');
  await reject(unknown + '?raw=true', { headers: auth }, 400, 'invalid_input');
  await reject('/api/v1/projects/bad/render-046', { headers: auth }, 400, 'invalid_input');
  await reject(post, {
    method: 'POST', headers, body: JSON.stringify({ projectId: randomUUID() }),
  }, 404, 'not_found');
  assert.equal((await dbRows('SELECT count(*)::int AS n FROM render_jobs'))[0].n, baselineJobCount);
  report.checks.push('Auth, origin, input shape, body limit, method and unknown-ID fail closed');

  const created = await request('/api/v1/projects', {
    method: 'POST', headers, body: JSON.stringify({ title: '046 original synthetic browser QA' }),
  });
  assert.equal(created.status, 201);
  const projectId = created.body.id;
  const statusRoute = '/api/v1/projects/' + projectId + '/render-046';
  const empty = await request(statusRoute, { headers: auth });
  assert.equal(empty.status, 200);
  assert.deepEqual(empty.body, { items: [] });

  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark', reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(browserOrigin + '/admin/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/admin');
  await page.goto(browserOrigin + '/admin/projects/' + projectId);
  const button = page.getByRole('button', { name: 'Queue synthetic 1080p test' });
  await button.waitFor();
  await page.getByText('Synthetic 8-second video and tone QA runs in CI or on an explicitly enabled VPS.', { exact: false }).waitFor();
  assert.equal(await page.getByText('CI test only:', { exact: false }).count(), 0);
  await page.screenshot({ path: resolve(output, '046-admin-queued-button-1440.png'), fullPage: true });

  const clickStarted = Date.now();
  await button.click();
  await page.getByText('Synthetic 8-second render queued', { exact: false }).waitFor();
  assert.ok(Date.now() - clickStarted < 5000, 'HTTP button must not block on rendering');
  const queued = await request(statusRoute, { headers: auth });
  assert.equal(queued.status, 200);
  assert.equal(queued.body.items.length, 1);
  const { id: jobId } = queued.body.items[0];
  assert.equal(queued.body.items[0].status, 'queued');
  assert.deepEqual(Object.keys(queued.body.items[0]).sort(), [
    'attempt', 'createdAt', 'errorCode', 'id', 'kind', 'maxAttempts',
    'progressPct', 'status', 'updatedAt',
  ]);
  assert.equal(queued.body.items[0].kind, 'original_synthetic_046');
  const second = await request(post, {
    method: 'POST', headers, body: JSON.stringify({ projectId }),
  });
  assert.equal(second.status, 202);
  assert.equal(second.body.jobId, jobId);
  assert.equal((await request(statusRoute, { headers: auth })).body.items.length, 1);
  await page.reload();
  await page.getByText('queued', { exact: true }).waitFor();
  await page.screenshot({ path: resolve(output, '046-admin-queued-reloaded-1440.png'), fullPage: true });
  report.checks.push('Authenticated browser button and duplicate submit give one queued job after reload');

  const worker = start(process.execPath, ['apps/worker/dist/run-046.js'], {
    BDA_046_TEST_STORAGE_ROOT: root,
  });
  await waitJob(jobId, 'running');
  const liveStart = Date.now();
  const running = await request('/api/v1/jobs/' + jobId, { headers: auth });
  assert.equal(running.status, 200);
  assert.equal(running.body.status, 'running');
  assert.ok(Date.now() - liveStart < 1500, 'Admin status request blocked by FFmpeg worker');
  await page.reload();
  await page.getByText('running', { exact: true }).waitFor({ timeout: 15000 });
  await page.screenshot({ path: resolve(output, '046-admin-running-1440.png'), fullPage: true });
  assert.equal((await waitExit(worker, 120_000)).code, 0, '046 one-shot worker failed');
  await waitJob(jobId, 'succeeded');
  await page.reload();
  await page.getByText('succeeded', { exact: true }).waitFor();
  await page.getByText('100%', { exact: false }).waitFor();
  await page.screenshot({ path: resolve(output, '046-admin-succeeded-after-reload-1440.png'), fullPage: true });
  const finalized = await request(statusRoute, { headers: auth });
  assert.equal(finalized.body.items[0].status, 'succeeded');
  assert.equal(finalized.body.items[0].progressPct, 100);
  assert.equal(finalized.body.items[0].errorCode, null);
  assert.ok(!JSON.stringify(finalized.body).includes('storage_key'));
  const state = await dbRows(
    `SELECT r.status AS job_status, v.status AS video_status,
            a.kind, a.rights_status, a.storage_key
     FROM render_jobs r JOIN videos v ON v.id=r.video_id
     JOIN artifacts a ON a.id=v.final_artifact_id WHERE r.id=$1::uuid`,
    [jobId],
  );
  assert.equal(state.length, 1);
  assert.equal(state[0].job_status, 'succeeded');
  assert.equal(state[0].video_status, 'rendered');
  assert.equal(state[0].kind, 'render');
  assert.equal(state[0].rights_status, 'unreviewed');
  assert.equal(state[0].storage_key, 'rendered/jobs/' + jobId + '.mp4');
  assert.equal((await dbRows("SELECT count(*)::int AS n FROM videos WHERE status='published'"))[0].n, 0);
  assert.deepEqual(errors, []);
  report.checks.push('Worker outside HTTP, running liveness, real FFmpeg, succeeded after reload, no publish');

  // Private 60s pilot film path: same admin page, separate button/manifest/worker.
  const filmPost = '/api/v1/render-046/pilot-film';
  await reject(filmPost, {
    method: 'POST', headers: { ...headers, origin: 'https://untrusted.invalid' },
    body: JSON.stringify({ projectId }),
  }, 403, 'forbidden_origin');
  await reject(filmPost, {
    method: 'POST', headers, body: JSON.stringify({ projectId, sourcePath: '/etc/passwd' }),
  }, 400, 'invalid_input');
  await reject(filmPost, { method: 'GET', headers: auth }, 405, 'method_not_allowed');
  const filmButton = page.getByRole('button', { name: 'Render private 60s pilot film' });
  await filmButton.waitFor();
  const filmClick = Date.now();
  await filmButton.click();
  await page.getByText('Private 60-second pilot film queued', { exact: false }).waitFor();
  assert.ok(Date.now() - filmClick < 5000, 'film button must not block on rendering');
  const withFilm = await request(statusRoute, { headers: auth });
  const filmJob = withFilm.body.items.find((item) => item.kind === 'private_pilot_film_046');
  assert.ok(filmJob, 'film job listed with its kind');
  assert.equal(filmJob.status, 'queued');
  assert.equal(filmJob.maxAttempts, 1);
  const filmAgain = await request(filmPost, { method: 'POST', headers, body: JSON.stringify({ projectId }) });
  assert.equal(filmAgain.status, 202);
  assert.equal(filmAgain.body.jobId, filmJob.id);
  assert.equal(filmAgain.body.publicationAuthorized, false);
  const scratch = mkdtempSync(join(tmpdir(), 'bda-046-film-http-'));
  const filmWorker = start(process.execPath, ['apps/worker/dist/run-046-film.js'], {
    BDA_046_TEST_STORAGE_ROOT: root,
    BDA_046_FILM_TEST_SCRATCH: scratch,
  });
  assert.equal((await waitExit(filmWorker, 180_000)).code, 0, '046 film worker failed');
  await waitJob(filmJob.id, 'succeeded');
  await page.reload();
  await page.getByText('Private 60s pilot film', { exact: true }).waitFor();
  await page.screenshot({ path: resolve(output, '046-admin-pilot-film-succeeded-1440.png'), fullPage: true });
  const filmState = await dbRows(
    `SELECT v.status AS video_status, a.rights_status, a.storage_key
     FROM render_jobs r JOIN videos v ON v.id=r.video_id
     JOIN artifacts a ON a.id=v.final_artifact_id WHERE r.id=$1::uuid`,
    [filmJob.id],
  );
  assert.deepEqual(filmState[0], {
    video_status: 'rendered', rights_status: 'unreviewed',
    storage_key: 'rendered/jobs/' + filmJob.id + '.mp4',
  });
  assert.equal((await dbRows("SELECT count(*)::int AS n FROM videos WHERE status='published'"))[0].n, 0);
  rmSync(scratch, { recursive: true, force: true });
  assert.deepEqual(errors, []);
  report.checks.push('Film button queues one private film job; separate worker renders it; succeeded after reload; unreviewed, never published');

  // Roadmap 047: protected preview page, HTML5 playback with Range, original download, metadata.
  const videosRoute = '/api/v1/projects/' + projectId + '/videos';
  const listed = await request(videosRoute, { headers: auth });
  assert.equal(listed.status, 200);
  assert.equal(listed.body.items.length, 2, 'synthetic QA and private film both listed');
  const filmVideo = listed.body.items.find((item) => item.kind === 'private_pilot_film_046');
  assert.ok(filmVideo && filmVideo.available === true && filmVideo.published === false);
  assert.equal(filmVideo.rightsStatus, 'unreviewed');
  assert.equal(filmVideo.durationMs, 1400);
  assert.match(filmVideo.sha256, /^[a-f0-9]{64}$/);
  assert.ok(Number.isInteger(filmVideo.sizeBytes) && filmVideo.sizeBytes > 1000);
  assert.ok(!JSON.stringify(listed.body).includes('rendered/jobs'), 'no storage keys exposed');
  const fileUrl = origin + filmVideo.mediaUrl;
  for (const [url, init] of [
    [fileUrl, {}],
    [origin + videosRoute, {}],
  ]) {
    const anonymous = await fetch(url, { redirect: 'manual', ...init });
    assert.equal(anonymous.status, 401, 'anonymous access refused: ' + url);
  }
  const full = await fetch(fileUrl, { headers: auth });
  assert.equal(full.status, 200);
  assert.equal(full.headers.get('content-type'), 'video/mp4');
  assert.equal(full.headers.get('accept-ranges'), 'bytes');
  assert.match(full.headers.get('cache-control') ?? '', /private, no-store/);
  assert.match(full.headers.get('content-disposition') ?? '', /^inline;/);
  const fullBytes = Buffer.from(await full.arrayBuffer());
  assert.equal(fullBytes.byteLength, filmVideo.sizeBytes);
  assert.equal(createHash('sha256').update(fullBytes).digest('hex'), filmVideo.sha256);
  const partial = await fetch(fileUrl, { headers: { ...auth, Range: 'bytes=100-199' } });
  assert.equal(partial.status, 206);
  assert.equal(partial.headers.get('content-range'), 'bytes 100-199/' + filmVideo.sizeBytes);
  assert.deepEqual(Buffer.from(await partial.arrayBuffer()), fullBytes.subarray(100, 200));
  const tail = await fetch(fileUrl, { headers: { ...auth, Range: 'bytes=-10' } });
  assert.equal(tail.status, 206);
  assert.deepEqual(Buffer.from(await tail.arrayBuffer()), fullBytes.subarray(-10));
  const unsatisfiable = await fetch(fileUrl, { headers: { ...auth, Range: 'bytes=999999999-' } });
  assert.equal(unsatisfiable.status, 416);
  await unsatisfiable.arrayBuffer();
  const downloadResponse = await fetch(origin + filmVideo.downloadUrl, { headers: auth });
  assert.equal(downloadResponse.status, 200);
  assert.match(downloadResponse.headers.get('content-disposition') ?? '',
    /^attachment; filename="bluedotatlas-[0-9a-f-]{36}\.mp4"$/);
  assert.equal(createHash('sha256').update(Buffer.from(await downloadResponse.arrayBuffer())).digest('hex'), filmVideo.sha256);
  await reject(filmVideo.mediaUrl + '?path=/etc/passwd', { headers: auth }, 400, 'invalid_input');
  await reject('/api/v1/videos/' + randomUUID() + '/file', { headers: auth }, 404, 'not_found');
  await reject('/api/v1/videos/not-a-uuid/file', { headers: auth }, 400, 'invalid_input');
  await reject(filmVideo.mediaUrl, { method: 'DELETE', headers }, 405, 'method_not_allowed');
  await page.goto(browserOrigin + '/admin/projects/' + projectId + '/video');
  await page.getByRole('heading', { name: 'Private video preview' }).waitFor();
  await page.getByRole('heading', { name: 'Private 60s pilot film' }).waitFor();
  const playerDuration = await page.locator('video').first().evaluate((video) =>
    new Promise((resolvePromise, rejectPromise) => {
      if (video.readyState >= 1) resolvePromise(video.duration);
      video.addEventListener('loadedmetadata', () => resolvePromise(video.duration), { once: true });
      video.addEventListener('error', () => rejectPromise(new Error('player error')), { once: true });
      setTimeout(() => rejectPromise(new Error('player timeout')), 15000);
    }));
  assert.ok(Math.abs(playerDuration - 1.4) < 0.1, 'HTML5 player reads the private MP4: ' + playerDuration);
  await page.getByRole('link', { name: 'Download original MP4' }).first().waitFor();
  await page.getByText(filmVideo.sha256, { exact: true }).waitFor();
  await page.screenshot({ path: resolve(output, '047-admin-video-preview-1440.png'), fullPage: true });
  assert.deepEqual(errors, []);
  report.checks.push('047 protected preview: HTML5 player loads MP4, Range 206/416, attachment download SHA-identical, metadata, 401/404/400/405');

  await context.close();
  await stop(server);
  server = start('pnpm', [
    '--filter', '@bluedotatlas/web', 'start',
    '--hostname', '127.0.0.1', '--port', '3146',
  ], { NODE_ENV: 'production', BDA_RENDER_046_SYNTHETIC_PROOF: '' });
  await serverReady(server);
  await reject(post, {
    method: 'POST', headers, body: JSON.stringify({ projectId }),
  }, 403, 'render_not_authorized');
  await reject(statusRoute, { headers: auth }, 403, 'render_not_authorized');
  await reject('/api/v1/render-046/pilot-film', {
    method: 'POST', headers, body: JSON.stringify({ projectId }),
  }, 403, 'render_not_authorized');
  await reject('/api/v1/projects/' + projectId + '/videos', { headers: auth }, 403, 'preview_not_authorized');
  const disabledContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark', reducedMotion: 'reduce',
  });
  const disabledPage = await disabledContext.newPage();
  await disabledPage.goto(browserOrigin + '/admin/login');
  await disabledPage.locator('input[name="email"]').fill(email);
  await disabledPage.locator('input[name="password"]').fill(password);
  await disabledPage.getByRole('button', { name: 'Sign in' }).click();
  await disabledPage.waitForURL('**/admin');
  await disabledPage.goto(browserOrigin + '/admin/projects/' + projectId);
  await disabledPage.getByRole('heading', { name: '046 original synthetic browser QA' }).waitFor();
  assert.equal(await disabledPage.getByRole('button', { name: 'Queue synthetic 1080p test' }).count(), 0);
  assert.equal(await disabledPage.getByRole('button', { name: 'Render private 60s pilot film' }).count(), 0);
  await disabledPage.screenshot({ path: resolve(output, '046-disabled-gate-1440.png'), fullPage: true });
  await disabledContext.close();
  assert.equal((await request('/api/v1/jobs/' + jobId, { headers: auth })).body.status, 'succeeded');
  report.checks.push('Gate disabled: protected API returns 403, no UI button, ordinary job GET remains read-only');
  writeFileSync(resolve(output, '046-http-browser-qa.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('046 HTTP/CHROME PASS: session + CSRF + strict input + idempotency + live worker + persistent reload + disabled gate');
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server) await stop(server);
  for (const child of children) child.kill('SIGKILL');
  rmSync(root, { recursive: true, force: true });
}
