import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { buildPilotTimeline044, validatePilotTimeline044 } from '../packages/video/timeline/plan.mjs';

const root = new URL('../', import.meta.url);
const source = new URL('docs/pilot/60s-script.json', root);
const timingFile = new URL('docs/pilot/tts-timing-evidence-042.json', root);
const output = new URL('docs/pilot/pilot-timeline.json', root);

export function buildChecked044() {
  const bytes = readFileSync(source);
  const measured = JSON.parse(readFileSync(timingFile, 'utf8'));
  const sha = createHash('sha256').update(bytes).digest('hex');
  if (measured.sourceSha256 !== sha) throw new Error('042 spoken words do not match 037 source SHA');
  const script = JSON.parse(bytes.toString('utf8'));
  const timeline = buildPilotTimeline044(script, measured);
  validatePilotTimeline044(timeline);
  return JSON.stringify(timeline, null, 2) + '\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const content = buildChecked044();
  const command = process.argv[2] ?? '--check';
  if (command === '--write') {
    writeFileSync(output, content, { encoding: 'utf8' });
    console.log('044 TIMELINE SNAPSHOT WRITTEN: docs/pilot/pilot-timeline.json');
  } else if (command === '--check') {
    const actual = readFileSync(output, 'utf8');
    if (actual !== content) throw new Error('Timeline snapshot stale / edited: regenerate from real 042 evidence');
    console.log('044 TIMELINE PASS: 1800f / 60.000s / 9 shots / 7 real voice sample windows / 9f+9f crossfades');
  } else {
    throw new Error('Usage: node scripts/build-timeline-044.mjs --check|--write');
  }
}
