import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const root = process.cwd();
const url = 'http://127.0.0.1:3107';
const out = resolve(root, '.tmp-web-shell-qa');
mkdirSync(out, { recursive: true });

const server = spawn(
  'pnpm',
  ['--filter', '@bluedotatlas/web', 'dev', '--hostname', '127.0.0.1', '--port', '3107'],
  { cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
);
let output = '';
server.stdout.on('data', (data) => { output += String(data).slice(-500); });
server.stderr.on('data', (data) => { output += String(data).slice(-500); });

async function ready() {
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null) throw new Error('Next exited early: ' + output);
    try {
      const response = await fetch(url + '/');
      if (response.status === 200) return;
    } catch { /* compilation or port not yet ready */ }
    await delay(500);
  }
  throw new Error('Next dev server did not become ready: ' + output);
}

const results = [];
let browser;
try {
  await ready();
  const adminResponse = await fetch(url + '/admin', { redirect: 'manual' });
  assert.ok([307, 308].includes(adminResponse.status), 'Admin must redirect without auth');
  assert.equal(new URL(adminResponse.headers.get('location'), url).pathname, '/admin/login');
  results.push({ check: 'admin redirect', status: 'PASS', code: adminResponse.status });

  browser = await chromium.launch({ headless: true });
  for (const width of [1440, 375]) {
    for (const scheme of ['dark', 'light']) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const [route, heading, filename] of [
        ['/', 'The Planet Has a Story.', 'public'],
        ['/admin/login', 'Admin sign-in', 'login'],
        ['/preview/admin', 'Studio overview', 'admin-preview'],
      ]) {
        const response = await page.goto(url + route, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200, route + ' should load');
        await page.getByRole('heading', { name: heading, exact: true }).waitFor();
        const metrics = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
          logos: [...document.querySelectorAll('.brand img')].filter((el) => getComputedStyle(el).display !== 'none').map((el) => ({ loaded: el.complete && el.naturalWidth > 0 })),
        }));
        assert.ok(metrics.scrollWidth <= metrics.viewportWidth, 'Overflow ' + route + ' @' + width);
        assert.ok(metrics.logos.length === 1 && metrics.logos[0].loaded, 'Brand SVG missing ' + route);
        await page.screenshot({ path: resolve(out, filename + '-' + width + '-' + scheme + '.png'), fullPage: true });
        results.push({ route, width, scheme, status: 'PASS' });
      }
      assert.deepEqual(errors, [], 'Browser errors @' + width + '/' + scheme);
      await page.close();
    }
  }
  writeFileSync(resolve(out, 'results.json'), JSON.stringify({ results }, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ passes: results.length, results }, null, 2) + '\n');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
