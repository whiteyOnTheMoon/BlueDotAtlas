import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { checkRequiredCiContract } from './check-ci-033.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const yaml = readFileSync(join(root, '.github/workflows/required-ci-033.yml'), 'utf8');

test('one stable required status check runs on every PR, even docs-only edits', () => {
  assert.deepEqual(checkRequiredCiContract(yaml), {
    status: 'PASS',
    requiredStatusCheck: '033 Required CI',
  });
  for (const [bad, warning] of [
    [yaml.replace('  merge_group:', '  not_merge_group:'), /Merge queue/],
    [yaml.replace('  pull_request:', '  pull_request_target:'), /PR event/],
    [yaml.replace('  merge_group:', "    paths:\n      - 'apps/**'\n  merge_group:"), /filter paths/],
    [yaml.replace('    name: 033 Required CI', '    name: Optional CI'), /Required check/],
    [yaml.replace('pnpm format:check', 'echo skipped'), /Missing required CI command/],
    [yaml.replace('pnpm build', 'echo skipped'), /Build must run/],
    [yaml.replace('pnpm --filter @bluedotatlas/db test:integration', 'true'), /Missing required CI command/],
    [yaml.replace('run: pnpm lint', 'run: pnpm lint || true'), /cannot ignore failures/],
    [yaml.replace('run: pnpm typecheck', 'run: |\n          pnpm typecheck\n          echo ${{ secrets.API_KEY }}'), /No GitHub Secrets/],
  ]) {
    assert.throws(() => checkRequiredCiContract(bad), warning);
  }
});

test('deliberately broken TypeScript and formatting each make the underlying gate fail', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bda033-negative-'));
  try {
    const badType = join(dir, 'broken.ts');
    writeFileSync(badType, 'export const expectedString: string = 42;\n');
    const type = spawnSync(
      'pnpm',
      ['exec', 'tsc', '--noEmit', '--skipLibCheck', '--target', 'ES2022', badType],
      { cwd: root, encoding: 'utf8', timeout: 30000 },
    );
    assert.equal(type.error, undefined, 'TypeScript must launch');
    assert.notEqual(type.status, 0, 'Broken TypeScript must fail the type gate');

    const badFormat = join(dir, 'bad-format.mjs');
    writeFileSync(badFormat, 'const value={foo:"bad"}\n');
    const format = spawnSync('pnpm', ['exec', 'prettier', '--check', badFormat], {
      cwd: root,
      encoding: 'utf8',
      timeout: 30000,
    });
    assert.equal(format.error, undefined, 'Prettier must launch');
    assert.notEqual(format.status, 0, 'Broken formatting must fail the format gate');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
