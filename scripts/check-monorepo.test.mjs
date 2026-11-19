import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const required = [
  ['apps/web', '@bluedotatlas/web'],
  ['apps/worker', '@bluedotatlas/worker'],
  ['packages/core', '@bluedotatlas/core'],
  ['packages/db', '@bluedotatlas/db'],
  ['packages/video', '@bluedotatlas/video'],
  ['packages/providers', '@bluedotatlas/providers'],
  ['packages/ui', '@bluedotatlas/ui'],
];
const fromRoot = (...parts) => join(root.pathname, ...parts);

test('workspace manifest includes apps and packages', () => {
  const manifest = readFileSync(fromRoot('pnpm-workspace.yaml'), 'utf8');
  assert.match(manifest, /apps\/\*/);
  assert.match(manifest, /packages\/\*/);
});

test('package manager and source toolchain are pinned', () => {
  const rootPackage = JSON.parse(readFileSync(fromRoot('package.json'), 'utf8'));
  assert.match(rootPackage.packageManager, /^pnpm@\d+\.\d+\.\d+$/);
  assert.equal(rootPackage.private, true);
  for (const version of Object.values(rootPackage.devDependencies)) {
    assert.match(version, /^\d+\.\d+\.\d+$/);
  }
});

for (const [directory, name] of required) {
  test(`${directory} has package and typed build contracts`, () => {
    const packageJson = JSON.parse(readFileSync(fromRoot(directory, 'package.json'), 'utf8'));
    assert.equal(packageJson.name, name);
    assert.equal(packageJson.private, true);
    if (directory === 'apps/web') {
      assert.equal(packageJson.scripts.typecheck, 'pnpm --filter @bluedotatlas/core build && pnpm --filter @bluedotatlas/db build && next typegen && tsc --noEmit');
      assert.equal(packageJson.scripts.build, 'pnpm --filter @bluedotatlas/core build && pnpm --filter @bluedotatlas/db build && next build');
      assert.equal(packageJson.dependencies.next, '16.4.6');
    } else if (directory === 'packages/db') {
      assert.equal(packageJson.scripts.typecheck, 'pnpm --filter @bluedotatlas/core build && tsc -p tsconfig.json --noEmit');
      assert.equal(packageJson.scripts.build, 'tsc -p tsconfig.json');
    } else if (directory === 'apps/worker') {
      assert.equal(
        packageJson.scripts.typecheck,
        'pnpm --filter @bluedotatlas/core build && pnpm --filter @bluedotatlas/db build && tsc -p tsconfig.json --noEmit',
      );
      assert.equal(
        packageJson.scripts.build,
        'pnpm --filter @bluedotatlas/core build && pnpm --filter @bluedotatlas/db build && tsc -p tsconfig.json',
      );
      assert.equal(packageJson.dependencies['@bluedotatlas/db'], 'workspace:*');
      assert.equal(packageJson.devDependencies['@types/node'], '22.20.5');
      assert.equal(packageJson.scripts['start:test'], 'node dist/run.js');
    } else {
      assert.equal(packageJson.scripts.typecheck, 'tsc -p tsconfig.json --noEmit');
      assert.equal(packageJson.scripts.build, 'tsc -p tsconfig.json');
    }
    assert.ok(existsSync(fromRoot(directory, 'tsconfig.json')));
  });
}

test('env template contains no credentials', () => {
  const env = readFileSync(fromRoot('.env.example'), 'utf8');
  assert.match(env, /DATABASE_URL=/);
  // Roadmap 025 uses opaque, database-backed sessions: no global signing secret.
  assert.doesNotMatch(env, /^SESSION_SECRET=/m);
  assert.doesNotMatch(env, /^(?:BDA_ADMIN_EMAIL|BDA_ADMIN_PASSWORD_HASH)=/m);
  assert.doesNotMatch(env, /(?:SECRET|PASSWORD|TOKEN)=[^\r\n#]+/);
});
