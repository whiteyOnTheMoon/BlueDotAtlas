import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const url = 'http://127.0.0.1:3115';
const root = process.cwd();
const screenshots = resolve(root, '.tmp-admin-auth-qa');
mkdirSync(screenshots, { recursive: true });
const email = process.env.BDA_ADMIN_EMAIL;
const password = process.env.BDA_TEST_ADMIN_PASSWORD;
if (!email || !password || !process.env.BDA_ADMIN_PASSWORD_HASH) {
  throw new Error('CI synthetic admin credentials required; no actual credentials should be supplied');
}

const server = spawn(
  'pnpm',
  ['--filter', '@bluedotatlas/web', 'dev', '--hostname', '127.0.0.1', '--port', '3115'],
  { cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
);
let output = '';
server.stdout.on('data', (data) => { output = (output + String(data)).slice(-5000); });
server.stderr.on('data', (data) => { output = (output + String(data)).slice(-5000); });

async function ready() {
  for (let n = 0; n < 90; n++) {
    if (server.exitCode !== null) throw new Error('Next failed to start: ' + output);
    try {
      const response = await fetch(url + '/admin/login');
      if (response.status === 200) return;
    } catch { /* still starting */ }
    await delay(500);
  }
  throw new Error('Next did not start: ' + output);
}

let browser;
const results = [];
try {
  await ready();
  const badOrigin = await fetch(url + '/api/auth/logout', {
    method: 'POST', headers: { origin: 'https://other.invalid' }, redirect: 'manual',
  });
  assert.equal(badOrigin.status, 403, 'CSRF: cross-origin logout must be denied');
  const badLogin = await fetch(url + '/api/auth/login', {
    method: 'POST', headers: { origin: 'https://other.invalid', 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email, password }), redirect: 'manual',
  });
  assert.equal(badLogin.status, 403, 'CSRF: cross-origin login must be denied');
  results.push({ check: 'cross-origin login and logout', status: 'PASS' });

  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  for (const [width, scheme] of [[1440, 'dark'], [375, 'light']]) {
    const page = await browser.newPage({
      viewport: { width, height: 880 }, colorScheme: scheme, reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url + '/admin');
    await page.waitForURL('**/admin/login');

    const apiNoCookie = await page.request.get(url + '/api/admin/session');
    assert.equal(apiNoCookie.status(), 401, 'anonymous admin API must be denied');
    await page.context().addCookies([{
      name: 'bda-session-dev', value: 'a'.repeat(43), url,
      httpOnly: true, sameSite: 'Strict',
    }]);
    await page.goto(url + '/admin');
    await page.waitForURL('**/admin/login');
    const forgedApi = await page.request.get(url + '/api/admin/session');
    assert.equal(forgedApi.status(), 401, 'forged cookie cannot authorize API');
    await page.context().clearCookies();

    await page.goto(url + '/admin/login');
    await page.getByRole('heading', { name: 'Admin sign-in' }).waitFor();
    await page.screenshot({ path: resolve(screenshots, 'login-' + width + '-' + scheme + '.png'), fullPage: true });
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill('Bad-test-password-025');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('alert').waitFor();
    assert.ok(page.url().includes('/admin/login?error=invalid'));

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/admin');
    await page.getByRole('heading', { name: 'Studio overview' }).waitFor();
    const apiOk = await page.request.get(url + '/api/admin/session');
    assert.equal(apiOk.status(), 200);
    assert.equal((await apiOk.json()).authenticated, true);
    const cookies = await page.context().cookies();
    const adminCookie = cookies.find((c) => c.name === 'bda-session-dev');
    assert.ok(adminCookie?.httpOnly, 'session cookie must be HttpOnly');
    assert.equal(adminCookie.sameSite, 'Strict', 'session cookie must use Strict SameSite');

    await page.reload();
    await page.getByRole('heading', { name: 'Studio overview' }).waitFor();
    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    assert.ok(noOverflow, 'admin must not overflow viewport');
    await page.screenshot({ path: resolve(screenshots, 'authenticated-admin-' + width + '-' + scheme + '.png'), fullPage: true });
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL('**/admin/login');
    assert.equal((await page.request.get(url + '/api/admin/session')).status(), 401);
    assert.equal(errors.length, 0, 'browser JavaScript errors: ' + errors.join('; '));
    results.push({ width, scheme, check: 'anonymous / invalid cookie / failed login / successful login / reload / sign out', status: 'PASS' });
    await page.close();
  }
  writeFileSync(resolve(screenshots, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ passed: results.length, results }, null, 2) + '\n');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
