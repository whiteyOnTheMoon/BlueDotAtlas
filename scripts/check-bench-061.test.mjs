// Roadmap 061/062: benchmark plan, resume planning and VPS runner boundary (no media).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateSceneDocument } from '../packages/core/dist/scene-schema/v1.js';
import { benchScene061 } from './bench-061-plan.mjs';
import { assetMap, sourceNeeds } from './render-pilot-v2.mjs';
import { segments, shotsStillNeeded, timeline } from './scene-render-v1-plan.mjs';

// Known private stage source lengths (rights manifests / VPS preflight, seconds).
const SOURCE_SECONDS = {
  'brand-intro': 2.5, 'brand-outro': 6, 'P60-VID-001': 27.84, 'P60-VID-003': 34.83, 'P60-VID-005': 17.48,
  'V2-VID-SVS5683-ELNINO-SSTA': 20.02, 'V2-VID-CIRA-POLO-RI': 7.61, 'V2-VID-SVS5681-POLO-GPM': 103.37,
};

test('061 benchmark is a valid 8–10 minute scene with long, calm shots', () => {
  const doc = benchScene061();
  const v = validateSceneDocument(doc);
  assert.ok(v.ok, v.ok ? '' : v.errors.join('\n'));
  const minutes = doc.durationFrames / 1800;
  assert.ok(minutes >= 8 && minutes <= 10, 'length ' + minutes);
  assert.equal(doc.publicationAuthorized, false);
  const shots = timeline(doc);
  const content = shots.filter((s) => !s.kind.startsWith('brand_'));
  assert.ok(content.every((s) => s.frames >= 180), 'content shots are at least 6 s');
  assert.ok(content.reduce((a, s) => a + s.frames, 0) / content.length >= 12 * 30, 'mean shot >= 12 s');
  for (const kind of ['footage_fullscreen', 'footage_with_overlay', 'map', 'breathing_video', 'infographic']) {
    assert.ok(shots.some((s) => s.kind === kind), kind);
  }
  const types = new Set(shots.map((s) => s.transitionIn.type));
  for (const type of ['cut', 'crossfade', 'dip_to_black']) assert.ok(types.has(type), type);
  assert.equal(segments(shots).reduce((a, p) => a + p.frames, 0), doc.durationFrames);
});

test('061 benchmark fits every private source and maps only to the private stage', () => {
  const doc = benchScene061();
  for (const [id, seconds] of Object.entries(sourceNeeds(doc))) {
    assert.ok(seconds <= SOURCE_SECONDS[id], `${id} needs ${seconds} s > ${SOURCE_SECONDS[id]} s`);
  }
  for (const { file } of Object.values(assetMap(doc, '/source'))) assert.ok(file.startsWith('/source/'));
});

test('062 resume planning re-renders only shots that unfinished parts still need', () => {
  const parts = [
    { kind: 'body', shot: 0 }, { kind: 'blend', from: 0, to: 1 }, { kind: 'body', shot: 1 },
    { kind: 'body', shot: 2 }, { kind: 'blend', from: 2, to: 3 }, { kind: 'body', shot: 3 },
  ];
  assert.deepEqual([...shotsStillNeeded(parts, new Set())].sort(), [0, 1, 2, 3]);
  assert.deepEqual([...shotsStillNeeded(parts, new Set([0, 1, 2]))].sort(), [2, 3]);
  assert.deepEqual([...shotsStillNeeded(parts, new Set([0, 1, 2, 3, 4, 5]))], []);
});

test('061 VPS runner stays private, offline, bounded and resumable', () => {
  const sh = readFileSync(new URL('./run-bench-061.sh', import.meta.url), 'utf8');
  for (const needle of [
    'test "$root" = "$HOME/www/blueDotAtlas"', 'git check-ignore -q "$private_root/stage"', 'out="$private_root/bench-061-01"',
    'BDA_BENCH_061_PRIVATE=TRUE', 'refuse overwrite', '--memory 512m --memory-swap 512m', 'need_mem=2816',
    'below 2048 MiB MemAvailable', 'org.opencontainers.image.revision', 'needs 8', 'resume',
  ]) assert.ok(sh.includes(needle), 'runner lost: ' + needle);
  const runs = sh.match(/docker run[^\n]*\n(?:[^\n]*\\\n)*/g) ?? [];
  assert.equal(runs.length, 3);
  for (const run of runs) assert.ok(run.includes('--network none') && run.includes('--read-only') && run.includes('--cap-drop ALL'), run);
  assert.ok(!/docker (system|image|container) prune|compose |rm -rf/.test(sh));
});
