// CI checks the operator-only script statically; never runs it against Docker.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const body = readFileSync(new URL('./verify-web-recovery-029.sh', import.meta.url), 'utf8');
assert.ok(body.startsWith('#!/usr/bin/env bash\n'));
for (const phrase of [
  'set +x', 'set -euo pipefail', 'git status --porcelain',
  'label=com.docker.compose.project=bluedotatlas',
  'docker ps -q --no-trunc --filter',
  'docker ps -aq --no-trunc | sort',
  'bash scripts/verify-live-029.sh', 'snapshot_foreign',
  'docker restart --time 15 "$web"', 'https://studio.ap-pixels.com/',
  'https://studio.ap-pixels.com/api/admin/session', '"401"',
  'db_before', 'cf_before', 'web_before', '029 WEB RECOVERY: PASS',
]) assert.ok(body.includes(phrase), 'Missing safety invariant: ' + phrase);
// Regression: ID lookup and foreign inventory must use comparable, full IDs.
const shortWebId = 'b'.repeat(12);
const fullWebId = shortWebId + 'b'.repeat(52);
const fullOtherId = 'f'.repeat(64);
const snapshot = [fullWebId, fullOtherId];
assert.ok(
  snapshot.filter((id) => id !== shortWebId).includes(fullWebId),
  'Fixture must demonstrate the old false-positive with truncated IDs',
);
assert.deepEqual(
  snapshot.filter((id) => id !== fullWebId),
  [fullOtherId],
  'Full-length BlueDotAtlas IDs must exclude the restarted own web container',
);
const runnable = body.split('\n').filter(line => !/^\s*#/.test(line)).join('\n');
assert.match(runnable, /ids="\$\(docker ps -q --no-trunc --filter/);
assert.match(runnable, /docker ps -aq --no-trunc \| sort/);
assert.equal((runnable.match(/\bdocker\s+restart\b/g) || []).length, 1);
for (const forbidden of [
  /\bsudo\b/, /\bdocker\s+(?:compose\s+)?(?:up|down|run|exec|start|stop|rm|rmi|prune|build|pull|push|login|kill|update|create)\b/,
  /\bsystemctl\s+(?:restart|start|stop|enable|disable|reload)\b/,
  /\b(?:rm|mv|cp|chmod|chown|mkdir|tee|truncate|pkill)\s/,
  /\b(?:docker\s+logs|docker\s+compose\s+config|printenv|\.env\.bda)\b/,
]) assert.ok(!forbidden.test(runnable), 'Unsafe operator action: ' + forbidden);
process.stdout.write('029 web-only recovery static safety check PASS (no VPS actions).\n');
