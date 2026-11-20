#!/usr/bin/env node
// Only a synthetic canary on disposable CI containers; never read live credentials.
import { execFileSync } from 'node:child_process';

async function main() {
  const marker = process.env.BDA_SECRET_TEST_CANARY;
  const target = new URL(process.argv[2] || 'http://invalid/');
  if (
    process.env.CI !== 'true' ||
    !marker?.startsWith('BDA030_CANARY_') ||
    target.hostname !== '127.0.0.1' ||
    target.protocol !== 'http:'
  ) {
    throw new Error('030 FAIL: disposable CI-loopback test prerequisites are missing');
  }

  // Public and anonymous surfaces only, no admin credentials or migrations.
  for (const endpoint of ['/', '/admin/login', '/api/admin/session', '/api/v1/projects']) {
    const response = await fetch(new URL(endpoint, target), { redirect: 'manual' });
    const body = await response.text();
    const headers = [...response.headers].map(([name, value]) => name + ': ' + value).join('\n');
    if (body.includes(marker) || headers.includes(marker)) {
      throw new Error('030 FAIL: synthetic canary appeared in an HTTP response');
    }
  }

  const logs = execFileSync(
    'docker',
    ['compose', '-f', 'compose.yml', '-f', 'compose.loopback.yml', 'logs', '--no-color', '--tail=120', 'web', 'db'],
    { encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 },
  );
  if (logs.includes(marker)) {
    throw new Error('030 FAIL: synthetic canary appeared in test-container logs');
  }
  console.log('030 synthetic canary HTTP + container logs: PASS (4 anonymous routes).');
}

main().catch(() => {
  // Never log raw HTTP bodies, header values, exception stacks, or Docker output.
  console.error('030 synthetic canary check failed (details withheld by design)');
  process.exitCode = 1;
});
