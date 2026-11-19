// Roadmap 029: CI must only check the live verification script statically.
// Do not run it on a CI runner: it is intended for the already running operator VPS.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const body = readFileSync(new URL('./verify-live-029.sh', import.meta.url), 'utf8');
assert.ok(body.startsWith('#!/usr/bin/env bash\n'));
for (const phrase of [
  'set +x', 'set -euo pipefail', 'bluedotatlas_private_db',
  'bluedotatlas_bda_pgdata', 'docker port "$cid"',
  'https://studio.ap-pixels.com/', 'https://studio.ap-pixels.com/api/admin/session',
  'expected 401', 'exactly 3 BlueDotAtlas containers',
]) assert.ok(body.includes(phrase), 'Missing required 029 live verifier invariant: ' + phrase);

const executable = body.split('\n').filter(line => !/^\s*#/.test(line)).join('\n');
for (const forbidden of [
  /\bsudo\b/, /\bdocker\s+(?:compose\s+)?(?:up|down|run|exec|start|stop|restart|rm|rmi|prune|build|pull|push|login|kill|update|create)\b/,
  /\bsystemctl\s+(?:restart|start|stop|enable|disable|reload)\b/,
  /\b(?:rm|mv|cp|chmod|chown|mkdir|tee|truncate|kill|pkill)\s/,
  /\bcurl\b[^\n]*(?:--data|--upload-file|--request\s+(?:POST|PUT|DELETE|PATCH))\b/,
  /\b(?:docker\s+logs|docker\s+compose\s+config|printenv|env\s+|\.env\.bda)\b/,
]) assert.ok(!forbidden.test(executable), 'Live verifier must stay read-only / secret-free: ' + forbidden);

process.stdout.write('029 live-readonly verifier: static checks PASS; no live host/network probes in CI.\n');
