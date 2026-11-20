import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const workflowFile = fileURLToPath(
  new URL('../.github/workflows/required-ci-033.yml', import.meta.url),
);

/**
 * Narrow policy contract, not a general YAML parser. Ensures the one stable
 * quality check always runs and can be selected as a required main-branch rule.
 */
export function checkRequiredCiContract(yaml) {
  const errors = [];
  const expect = (condition, message) => {
    if (!condition) errors.push(message);
  };
  expect(/^name: M02 033 required CI quality gate$/m.test(yaml), 'Stable workflow name missing');
  expect(/^on:\n  pull_request:\n    types: \[opened, reopened, synchronize, edited, ready_for_review\]/m.test(yaml), 'Unconditional PR event types missing');
  expect(/^  merge_group:\s*$/m.test(yaml), 'Merge queue event missing');
  expect(/^  push:\n    branches:\n      - main$/m.test(yaml), 'Main branch smoke event missing');
  expect(/^  workflow_dispatch:\s*$/m.test(yaml), 'Manual dispatch missing');
  const prSection = yaml.match(/^  pull_request:[\s\S]*?(?=^  merge_group:)/m)?.[0] ?? '';
  expect(!/\bpaths(?:-ignore)?:|\bbranches(?:-ignore)?:/m.test(prSection), 'Required PR workflow must not filter paths/branches');
  expect(/^permissions:\n  contents: read$/m.test(yaml), 'Only read access needed');
  expect(!/^\s*pull_request_target:/m.test(yaml), 'Unsafe pull_request_target is forbidden');
  expect(!/continue-on-error:|\|\| true|if: failure\(\)/.test(yaml), 'Required checks cannot ignore failures');
  expect(/^  required-ci:\n    name: 033 Required CI$/m.test(yaml), 'Required check context must be 033 Required CI');
  expect(/image: postgres:16-alpine/.test(yaml), 'Disposable PostgreSQL 16 service missing');
  expect(/persist-credentials: false/.test(yaml), 'Checkout must not retain write credentials');
  for (const cmd of [
    'pnpm install --frozen-lockfile',
    'node --test scripts/check-ci-033.test.mjs',
    'node scripts/check-ci-033.mjs',
    'pnpm test',
    'pnpm lint',
    'pnpm format:check',
    'pnpm typecheck',
    'pnpm build',
    'pnpm --filter @bluedotatlas/db db:check',
    'pnpm --filter @bluedotatlas/db db:generate',
    'git status --porcelain -- packages/db/drizzle',
    'pnpm --filter @bluedotatlas/db db:migrate',
    'pnpm --filter @bluedotatlas/db test:integration',
    'node scripts/check-api-v1.mjs',
  ]) {
    expect(yaml.includes(cmd), 'Missing required CI command: ' + cmd);
  }
  expect(
    yaml.split('pnpm --filter @bluedotatlas/db db:migrate').length === 3,
    'Migration needs fresh apply and repeat for idempotency',
  );
  const build = yaml.match(/      - name: Secret-free production build\n([\s\S]*?)(?=      - name: Drizzle schema check)/)?.[1] ?? '';
  expect(!!build && build.includes('pnpm build'), 'Build must run independently');
  expect(
    build.includes('DATABASE_URL:-') && build.includes('BDA_ADMIN_PASSWORD_HASH:-'),
    'Build must refuse ambient DB/admin credentials',
  );
  expect(
    !/postgresql:\/\/|^\s+(?:DATABASE_URL|BDA_ADMIN_EMAIL|BDA_ADMIN_PASSWORD_HASH):/m.test(build),
    'Build must not receive real/test credentials',
  );
  expect(/\/bda_test\b/.test(yaml) && /BDA_DB_TEST: '1'/.test(yaml), 'No persistent or production database');
  expect(/admin-ci@bluedotatlas\.invalid/.test(yaml) && /SYNTHETIC-Only-Passphrase/.test(yaml), 'HTTP smoke must use fake admin');
  expect(!/\$\{\{\s*secrets\./.test(yaml), 'No GitHub Secrets needed by the 033 gate');
  if (errors.length) throw new Error(errors.join('; '));
  return { status: 'PASS', requiredStatusCheck: '033 Required CI' };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const output = checkRequiredCiContract(readFileSync(workflowFile, 'utf8'));
  process.stdout.write(
    '033 required CI policy: ' + output.status + ' (' + output.requiredStatusCheck + ')\n',
  );
}
