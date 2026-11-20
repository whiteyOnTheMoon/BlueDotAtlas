import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectFile, inspectIgnoreRules } from './check-secrets-030.mjs';

test('does not reject permitted templates, placeholder values or synthetic CI config', () => {
  assert.deepEqual(inspectFile('.env.example', 'DATABASE_URL=\nBDA_ADMIN_EMAIL=\n'), []);
  assert.deepEqual(
    inspectFile('.github/workflows/ci.yml', 'DATABASE_URL: postgresql://bda_test:bda_test_only@db:5432/bda_test'),
    [],
  );
});

test('rejects git-tracked private environment and certificate files', () => {
  assert.ok(inspectFile('.env.bda.web', 'NODE_ENV=production').includes('tracked-private-file'));
  assert.ok(inspectFile('apps/web/.env.local', 'FOO=bar').includes('tracked-private-file'));
  assert.ok(inspectFile('secrets/runtime.pem', 'binary').includes('tracked-private-file'));
});

test('detects a synthetically assembled token without emitting its value', () => {
  const synthetic = 'ghp_' + 'A'.repeat(40);
  const hits = inspectFile('accidental.txt', synthetic);
  assert.deepEqual(hits, ['github-credential']);
  assert.equal(JSON.stringify(hits).includes(synthetic), false);
});

test('detects private key headers and client-side server secret access', () => {
  const privateKeyHeader = '-----BEGIN ' + 'PRIVATE KEY-----';
  assert.ok(inspectFile('oops.txt', privateKeyHeader).includes('private-key-header'));
  const source = "'use client';\nconst db = process.env.DATABASE_URL;";
  assert.ok(inspectFile('apps/web/src/components/Client.tsx', source).includes('client-bundled-server-secret'));
});

test('detects NEXT_PUBLIC credential assignments but allows harmless public values', () => {
  const forbidden = 'NEXT_PUBLIC_' + 'API_KEY' + '=hidden';
  assert.ok(inspectFile('config.txt', forbidden).includes('public-secret-variable'));
  assert.deepEqual(inspectFile('config.txt', 'NEXT_PUBLIC_SITE_TITLE=BlueDotAtlas'), []);
});

test('enforces safe Git and Docker ignore boundaries', () => {
  assert.deepEqual(
    inspectIgnoreRules('.env\n.env.*\n!.env.example', '.env\n.env.*\n**/.env.*'),
    [],
  );
  assert.ok(inspectIgnoreRules('.env', '.env').length > 0);
});
