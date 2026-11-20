import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { openDatabase } from '../packages/db/dist/index.js';

const origin = 'http://127.0.0.1:3132';
const browserOrigin = 'http://localhost:3132';
const email = process.env.BDA_ADMIN_EMAIL;
const password = process.env.BDA_TEST_ADMIN_PASSWORD;
if (
  process.env.BDA_DB_TEST !== '1' ||
  !email?.endsWith('.invalid') ||
  !password?.startsWith('SYNTHETIC-') ||
  !process.env.BDA_ADMIN_PASSWORD_HASH
) {
  throw new Error('032 refuses to run with real credentials or a non-CI database');
}
const dbUrl = new URL(process.env.DATABASE_URL ?? '');
if (!['localhost', '127.0.0.1'].includes(dbUrl.hostname) || dbUrl.pathname !== '/bda_test') {
  throw new Error('032 can only use the disposable local bda_test database');
}

const out = resolve('.tmp-wizard-032-qa');
mkdirSync(out, { recursive: true });
const server = spawn(
  'pnpm',
  ['--filter', '@bluedotatlas/web', 'start', '--hostname', '127.0.0.1', '--port', '3132'],
  { env: { ...process.env, NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] },
);
let output = '';
server.stdout.on('data', (chunk) => { output = (output + String(chunk)).slice(-1200); });
server.stderr.on('data', (chunk) => { output = (output + String(chunk)).slice(-1200); });

async function send(path, options = {}) {
  const response = await fetch(origin + path, { redirect: 'manual', ...options });
  const text = await response.text();
  assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  assert.doesNotMatch(text, /(?:postgresql:\/\/|node_modules|stack trace|Bearer |private-secret)/i);
  return { status: response.status, headers: response.headers, data: text ? JSON.parse(text) : null };
}
async function rejected(path, options, status, code) {
  const reply = await send(path, options);
  assert.equal(reply.status, status, path);
  assert.equal(reply.data?.error?.code, code, path);
}
async function query(text, args = []) {
  const db = openDatabase();
  try {
    return (await db.pool.query(text, args)).rows;
  } finally {
    await db.pool.end();
  }
}
async function loginBrowser(page) {
  await page.goto(browserOrigin + '/admin/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/admin');
}
async function savedRevision(page, number) {
  await page.getByText('Draft revision ' + number, { exact: true }).waitFor({ timeout: 15000 });
  await page.getByText('Saved to database', { exact: false }).waitFor({ timeout: 15000 });
}

let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    if (server.exitCode !== null) throw new Error('Local production Next.js exited');
    try {
      if ((await fetch(origin + '/admin/login')).status === 200) {
        ready = true;
        break;
      }
    } catch { /* startup */ }
    await delay(500);
  }
  assert.ok(ready, 'Local production server was not ready');
  const missing = randomUUID();
  const wizardUrl = '/api/v1/projects/' + missing + '/wizard';
  const stepUrl = wizardUrl + '/steps/1';
  const patchBody = '{"expectedRevision":0,"notes":"anonymous"}';
  const csrfHeaders = { origin, 'content-type': 'application/json' };

  await rejected(wizardUrl, {}, 401, 'unauthorized');
  await rejected(stepUrl, { method: 'PATCH', headers: csrfHeaders, body: patchBody }, 401, 'unauthorized');
  for (const path of ['/admin/projects/' + missing + '/wizard']) {
    const response = await fetch(origin + path, { redirect: 'manual' });
    assert.ok([307, 308].includes(response.status), 'Anon wizard must redirect');
  }

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
  const jsonHeaders = { ...auth, ...csrfHeaders };
  await rejected(wizardUrl, { headers: auth }, 404, 'not_found');
  await rejected(wizardUrl + '?debug=1', { headers: auth }, 400, 'invalid_input');
  await rejected('/api/v1/projects/bad/wizard', { headers: auth }, 400, 'invalid_input');
  await rejected(wizardUrl, { method: 'PATCH', headers: jsonHeaders, body: patchBody }, 405, 'method_not_allowed');
  await rejected(stepUrl, { method: 'GET', headers: auth }, 405, 'method_not_allowed');
  await rejected(stepUrl, { method: 'PATCH', headers: { ...auth, origin: 'https://elsewhere.invalid', 'content-type': 'application/json' }, body: patchBody }, 403, 'forbidden_origin');
  await rejected(stepUrl, { method: 'PATCH', headers: { ...auth, origin, 'content-type': 'text/plain' }, body: patchBody }, 415, 'unsupported_media_type');
  await rejected(stepUrl, { method: 'PATCH', headers: jsonHeaders, body: '{' }, 400, 'invalid_json');
  await rejected(stepUrl, { method: 'PATCH', headers: jsonHeaders, body: '{"expectedRevision":0,"status":"approved"}' }, 400, 'invalid_input');
  await rejected(stepUrl, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify({ expectedRevision: 0, notes: 'x'.repeat(8200) }) }, 413, 'body_too_large');
  await rejected(wizardUrl + '/steps/8', { method: 'PATCH', headers: jsonHeaders, body: patchBody }, 400, 'invalid_input');

  const created = await send('/api/v1/projects', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ title: 'Synthetic blue ocean research' }),
  });
  assert.equal(created.status, 201);
  const id = created.data.id;
  const base = '/api/v1/projects/' + id + '/wizard';
  const steps = await send(base, { headers: auth });
  assert.equal(steps.status, 200);
  assert.equal(steps.data.steps.length, 7);
  assert.deepEqual(steps.data.steps.map((x) => x.editRevision), [0, 0, 0, 0, 0, 0, 0]);

  const once = await send(base + '/steps/7', {
    method: 'PATCH', headers: jsonHeaders,
    body: JSON.stringify({ expectedRevision: 0, notes: 'Future film direction' }),
  });
  assert.equal(once.status, 200);
  assert.equal(once.data.editRevision, 1);
  await rejected(base + '/steps/7', {
    method: 'PATCH', headers: jsonHeaders,
    body: JSON.stringify({ expectedRevision: 0, notes: 'Outdated tab' }),
  }, 409, 'edit_conflict');
  const unchanged = await send(base, { headers: auth });
  assert.equal(unchanged.data.steps[6].notes, 'Future film direction');
  assert.equal(unchanged.data.steps[0].editRevision, 0);
  const submit = await send(base + '/steps/7', {
    method: 'PATCH', headers: jsonHeaders,
    body: JSON.stringify({ expectedRevision: 1, action: 'submit' }),
  });
  assert.equal(submit.status, 200);
  assert.equal(submit.data.reviewState, 'submitted');
  assert.equal(submit.data.editRevision, 2);
  assert.equal((await query('select count(*)::int as n from render_jobs'))[0].n, 0);
  assert.equal((await query('select count(*)::int as n from approvals'))[0].n, 0);

  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await loginBrowser(page);
  await page.goto(browserOrigin + '/admin/projects/' + id);
  await page.getByRole('link', { name: 'Open seven-step wizard' }).click();
  await page.waitForURL('**/wizard');
  await page.getByRole('heading', { name: 'Video wizard' }).waitFor();
  await page.getByRole('heading', { name: 'New Video' }).waitFor();
  await page.screenshot({ path: resolve(out, 'wizard-initial-1440-dark.png'), fullPage: true });

  await page.locator('#wizard-editor-notes').fill('First step - durable verified notes');
  await savedRevision(page, 1);
  assert.equal((await query(
    'select draft->>\'editorNotes\' as notes from step_progress where project_version_id in (select id from project_versions where project_id=$1) and step_number=1',
    [id],
  ))[0].notes, 'First step - durable verified notes');
  await page.getByRole('button', { name: /News Sources/ }).click();
  await page.locator('#wizard-editor-notes').fill('Second step - independent notes');
  await savedRevision(page, 1);
  await page.getByRole('button', { name: /New Video/ }).click();
  assert.equal(await page.locator('#wizard-editor-notes').inputValue(), 'First step - durable verified notes');
  await page.reload();
  await page.getByRole('heading', { name: 'New Video' }).waitFor();
  assert.equal(await page.locator('#wizard-editor-notes').inputValue(), 'First step - durable verified notes');
  await page.screenshot({ path: resolve(out, 'wizard-restored-1440-dark.png'), fullPage: true });

  // A second real tab captures revision 1 before tab A edits: B must lose CAS.
  const secondTab = await context.newPage();
  await secondTab.goto(browserOrigin + '/admin/projects/' + id + '/wizard');
  await secondTab.getByRole('heading', { name: 'New Video' }).waitFor();
  await page.locator('#wizard-editor-notes').fill('New notes from browser tab A');
  await savedRevision(page, 2);
  await secondTab.locator('#wizard-editor-notes').fill('Conflicting unsaved text from browser tab B');
  await secondTab.getByText('Save conflict', { exact: false }).waitFor({ timeout: 15000 });
  assert.equal(
    await secondTab.locator('#wizard-editor-notes').inputValue(),
    'Conflicting unsaved text from browser tab B',
    'Local text must be retained on CAS conflict',
  );
  const committed = await send(base, { headers: auth });
  assert.equal(committed.data.steps[0].notes, 'New notes from browser tab A');
  await secondTab.screenshot({ path: resolve(out, 'wizard-two-tab-conflict-1440-dark.png'), fullPage: true });
  secondTab.once('dialog', (dialog) => dialog.accept());
  await secondTab.getByRole('button', { name: 'Discard and reload stored version' }).click();
  await secondTab.getByText('Draft revision 2', { exact: true }).waitFor();
  assert.equal(await secondTab.locator('#wizard-editor-notes').inputValue(), 'New notes from browser tab A');
  await secondTab.close();

  await page.getByRole('button', { name: 'Submit for editorial review' }).click();
  await page.getByText('Submitted · not approved').waitFor();
  assert.equal((await query('select count(*)::int as n from approvals'))[0].n, 0);
  await page.locator('#wizard-editor-notes').fill('Revised after review submission');
  await savedRevision(page, 4);
  await page.getByText('Editorial draft').waitFor();
  await page.close();

  // Close/reopen: only confirmed persisted notes are guaranteed; never rely on localStorage.
  const reopened = await context.newPage();
  await reopened.goto(browserOrigin + '/admin/projects/' + id + '/wizard');
  await reopened.getByRole('heading', { name: 'New Video' }).waitFor();
  assert.equal(await reopened.locator('#wizard-editor-notes').inputValue(), 'Revised after review submission');
  const allSteps = await reopened.locator('nav[aria-label="Wizard steps"] button').count();
  assert.equal(allSteps, 7);
  await reopened.screenshot({ path: resolve(out, 'wizard-reopened-1440-dark.png'), fullPage: true });

  await reopened.setViewportSize({ width: 375, height: 812 });
  await reopened.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await reopened.reload();
  await reopened.getByRole('heading', { name: 'New Video' }).waitFor();
  assert.equal(
    await reopened.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    true,
    'Mobile wizard must not overflow',
  );
  await reopened.screenshot({ path: resolve(out, 'wizard-mobile-375-light.png'), fullPage: true });
  assert.deepEqual(pageErrors, []);
  await context.close();

  const projectVersions = await query('select id from project_versions where project_id=$1', [id]);
  assert.equal(projectVersions.length, 1);
  assert.equal((await query('select count(*)::int as n from step_progress where project_version_id=$1', [projectVersions[0].id]))[0].n, 7);
  assert.equal((await query('select count(*)::int as n from render_jobs where project_version_id=$1', [projectVersions[0].id]))[0].n, 0);
  assert.equal((await query('select count(*)::int as n from approvals where project_version_id=$1', [projectVersions[0].id]))[0].n, 0);
  const audited = await query('select details::text as details from audit_events where project_id=$1', [id]);
  assert.doesNotMatch(JSON.stringify(audited), /First step - durable verified notes|New notes from browser tab A/);

  const logout = await fetch(origin + '/api/auth/logout', {
    method: 'POST', redirect: 'manual', headers: { ...auth, origin },
  });
  assert.equal(logout.status, 303);
  await rejected(base, { headers: auth }, 401, 'unauthorized');

  writeFileSync(resolve(out, 'results.json'), JSON.stringify({
    projectId: 'synthetic',
    stepCount: 7,
    result: 'PASS',
    savedAfterBrowserRestart: true,
    simultaneousTabs: '409 without overwrite',
    approvals: 0,
    renderJobs: 0,
    screenshots: 5,
  }, null, 2) + '\n');
  console.log('032 wizard PASS: persisted seven step notes, close/reopen, 409 two-tab conflict, review submission only, desktop/mobile Chrome and no jobs/approvals.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
