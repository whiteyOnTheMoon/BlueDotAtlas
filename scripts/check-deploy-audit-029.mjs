// Roadmap 029 — static guard only; NEVER run the VPS inventory on a CI runner.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./audit-deploy-029.sh', import.meta.url), 'utf8');
assert.ok(source.startsWith('#!/usr/bin/env bash\n'));
assert.match(source, /Roadmap 029/);
assert.match(source, /docker ps --format/);
assert.match(source, /ss -lntH/);
assert.match(source, /candidate/);
assert.match(source, /NOT SPECIFIED/);
assert.match(source, /not a reservation or guarantee/);

// Examine only executable lines, not explanatory comments.
const shell = source.split('\n').filter((line) => !/^\s*#/.test(line)).join('\n');
for (const unsafe of [
  /\bsudo\s/, /\b(curl|wget|ssh|scp)\s/, /\bdocker\s+(compose\s+)?(up|down|run|exec|stop|rm|rmi|prune|build|login|push|pull|inspect|volume\s+rm)\b/,
  /\bsystemctl\s+(start|stop|restart|reload|enable|disable)\b/,
  /\b(kill|pkill|truncate|rm|chmod|chown|mkfs|dd|apt|snap|pip|npm)\s/,
  /\b(cat|sed|awk)\s+[^\n]*(?:\.env|cloudflared\/config|\.pem|secret|credentials)/i,
  /\b(docker\s+info\b|docker\s+config\b)/,
]) {
  assert.ok(!unsafe.test(shell), 'inventory must not use unsafe or secret-reading operations: ' + unsafe);
}
process.stdout.write('029 target-VPS inventory script: syntax/privacy static assertions PASS (no host inventory executed).\n');
