import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { openDatabase } from '../packages/db/dist/index.js';

const origin = 'http://127.0.0.1:3131';
const email = process.env.BDA_ADMIN_EMAIL;
const password = process.env.BDA_TEST_ADMIN_PASSWORD;
if (
  process.env.BDA_DB_TEST !== '1' ||
  !email?.endsWith('.invalid') ||
  !password?.startsWith('SYNTHETIC-') ||
  !process.env.BDA_ADMIN_PASSWORD_HASH
) {
  throw new Error('031 refuses to run outside synthetic CI admin credentials');
}
const dbUrl = new URL(process.env.DATABASE_URL ?? '');
if (!['localhost', '127.0.0.1'].includes(dbUrl.hostname) || dbUrl.pathname !== '/bda_test') {
  throw new Error('031 refuses to run on a non-test database');
}

const outputDir = resolve('.tmp-project-qa');
mkdirSync(outputDir, { recursive: true });
const server = spawn(
  'pnpm',
  ['--filter', '@bluedotatlas/web', 'start', '--hostname', '127.0.0.1', '--port', '3131'],
  { env: { ...process.env, NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] },
);
let serverOutput = '';
server.stdout.on('data', (chunk) => { serverOutput = (serverOutput + String(chunk)).slice(-1200); });
server.stderr.on('data', (chunk) => { serverOutput = (serverOutput + String(chunk)).slice(-1200); });

async function send(path, options = {}) {
  const response = await fetch(origin + path, { redirect: 'manual', ...options });
  const body = await response.text();
  assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  assert.doesNotMatch(body, /(?:postgresql:\/\/|node_modules|stack trace|Bearer |private-secret)/i);
  return { status: response.status, headers: response.headers, data: body ? JSON.parse(body) : null };
}
async function bad(path, options, status, code) {
  const result = await send(path, options);
  assert.equal(result.status, status);
  assert.equal(result.data?.error?.code, code);
}
async function rows(sql, params = []) {
  const db = openDatabase();
  try {
    return (await db.pool.query(sql, params)).rows;
  } finally {
    await db.pool.end();
  }
}

let browser;
const uiResults = [];
try {
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    if (server.exitCode !== null) throw new Error('Next exited unexpectedly (details withheld)');
    try {
      if ((await fetch(origin + '/admin/login')).status === 200) {
        ready = true;
        break;
      }
    } catch { /* startup */ }
    await delay(500);
  }
  assert.ok(ready, 'Next was not ready');

  const anonymous = await fetch(origin + '/admin/projects', { redirect: 'manual' });
  assert.ok([307, 308].includes(anonymous.status));
  const anonDetail = await fetch(origin + '/admin/projects/' + randomUUID(), { redirect: 'manual' });
  assert.ok([307, 308].includes(anonDetail.status));
  await bad('/api/v1/projects/' + randomUUID(), {
    method: 'PATCH',
    headers: { origin, 'content-type': 'application/json' },
    body: '{"action":"archive"}',
  }, 401, 'unauthorized');

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
  const write = { ...auth, origin, 'content-type': 'application/json' };
  const base = '/api/v1/projects/' + randomUUID();

  await bad(base, { method: 'PATCH', headers: { ...auth, origin: 'https://bad.invalid', 'content-type': 'application/json' }, body: '{"title":"x"}' }, 403, 'forbidden_origin');
  await bad(base, { method: 'PATCH', headers: write, body: '{' }, 400, 'invalid_json');
  await bad(base, { method: 'PATCH', headers: write, body: '{"status":"published"}' }, 400, 'invalid_input');
  await bad(base, { method: 'PATCH', headers: write, body: '{"action":"archive","title":"x"}' }, 400, 'invalid_input');
  await bad(base, { method: 'PATCH', headers: { ...auth, origin, 'content-type': 'text/plain' }, body: '{}' }, 415, 'unsupported_media_type');
  await bad(base + '?debug=1', { method: 'PATCH', headers: write, body: '{"action":"archive"}' }, 400, 'invalid_input');
  await bad('/api/v1/projects/bad', { method: 'PATCH', headers: write, body: '{"title":"x"}' }, 400, 'invalid_input');
  await bad(base, { method: 'PATCH', headers: write, body: '{"title":"x"}' }, 404, 'not_found');
  await bad(base, { method: 'DELETE', headers: write }, 405, 'method_not_allowed');

  const before = Number((await rows('select count(*)::int as n from video_projects'))[0].n);
  const created = await send('/api/v1/projects', {
    method: 'POST',
    headers: write,
    body: JSON.stringify({ title: 'Synthetic test atlas' }),
  });
  assert.equal(created.status, 201);
  assert.equal(created.data.status, 'draft');
  const id = created.data.id;
  assert.equal(Number((await rows('select count(*)::int as n from video_projects'))[0].n), before + 1);
  const version = await rows('select id from project_versions where project_id=$1', [id]);
  assert.equal(version.length, 1);
  assert.equal((await rows('select id from step_progress where project_version_id=$1', [version[0].id])).length, 7);
  assert.equal((await rows('select id from render_jobs where project_version_id=$1', [version[0].id])).length, 0);

  const renamed = await send('/api/v1/projects/' + id, {
    method: 'PATCH',
    headers: write,
    body: JSON.stringify({ title: 'Renamed ocean atlas' }),
  });
  assert.equal(renamed.status, 200);
  assert.equal(renamed.data.title, 'Renamed ocean atlas');
  const archived = await send('/api/v1/projects/' + id, {
    method: 'PATCH',
    headers: write,
    body: JSON.stringify({ action: 'archive' }),
  });
  assert.equal(archived.status, 200);
  assert.equal(archived.data.status, 'archived');
  const archivedFilter = await send('/api/v1/projects?status=archived', { headers: auth });
  assert.equal(archivedFilter.status, 200);
  assert.ok(archivedFilter.data.items.some((entry) => entry.id === id));
  await bad('/api/v1/projects/' + id, {
    method: 'PATCH', headers: write, body: '{"title":"Too late"}',
  }, 409, 'project_conflict');
  assert.equal((await rows('select id from render_jobs where project_version_id=$1', [version[0].id])).length, 0);

  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(origin + '/admin/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(origin + '/admin');
  await page.getByRole('link', { name: 'Create New Video' }).click();
  await page.waitForURL(origin + '/admin/projects');
  await page.getByRole('heading', { name: 'Projects', exact: true }).waitFor();
  await page.screenshot({ path: resolve(outputDir, 'projects-empty-or-list-1440-dark.png'), fullPage: true });

  const beforeBrowser = Number((await rows('select count(*)::int as n from video_projects'))[0].n);
  await page.locator('#project-new-title').fill('Browser project draft');
  await page.getByRole('button', { name: 'Create New Video', exact: true }).click();
  await page.waitForURL(/\/admin\/projects\/[a-f0-9-]{36}$/);
  await page.getByRole('heading', { name: 'Browser project draft' }).waitFor();
  const browserId = page.url().split('/').at(-1);
  assert.equal(Number((await rows('select count(*)::int as n from video_projects'))[0].n), beforeBrowser + 1);
  assert.equal((await rows('select id from project_versions where project_id=$1', [browserId])).length, 1);
  assert.equal((await rows('select id from render_jobs where project_version_id in (select id from project_versions where project_id=$1)', [browserId])).length, 0);
  await page.screenshot({ path: resolve(outputDir, 'project-detail-1440-dark.png'), fullPage: true });

  await page.locator('#project-edit-title').fill('Browser renamed atlas');
  await page.getByRole('button', { name: 'Save title' }).click();
  await page.getByRole('status').filter({ hasText: 'Project renamed.' }).waitFor();
  await page.getByRole('heading', { name: 'Browser renamed atlas' }).waitFor();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Archive project' }).click();
  await page.getByText('Archived projects are read-only.').waitFor();
  assert.equal((await rows('select status from video_projects where id=$1', [browserId]))[0].status, 'archived');

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 375, height: 812 });
  await mobile.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await mobile.goto(origin + '/admin/projects');
  await mobile.getByRole('heading', { name: 'Projects', exact: true }).waitFor();
  await mobile.locator('#project-status-filter').selectOption('archived');
  await mobile.getByRole('link', { name: 'Browser renamed atlas' }).waitFor();
  const layout = await mobile.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  assert.ok(layout.pageWidth <= layout.viewportWidth, 'Mobile horizontal overflow');
  await mobile.screenshot({ path: resolve(outputDir, 'projects-375-light.png'), fullPage: true });
  assert.deepEqual(errors, []);
  uiResults.push({ desktop: 1440, mobile: 375, create: 'PASS', rename: 'PASS', archive: 'PASS' });
  await context.close();

  const logout = await fetch(origin + '/api/auth/logout', {
    method: 'POST', redirect: 'manual', headers: { ...auth, origin },
  });
  assert.equal(logout.status, 303);
  await bad('/api/v1/projects/' + id, {
    method: 'PATCH', headers: write, body: '{"title":"blocked"}',
  }, 401, 'unauthorized');

  writeFileSync(resolve(outputDir, 'results.json'), JSON.stringify(uiResults, null, 2) + '\n');
  console.log('031 project CRUD PASS: auth, create/1 version/7 steps/0 jobs, rename/archive/filter/conflict and real Chromium desktop/mobile.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
