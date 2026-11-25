import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { validateSceneDocument } from '../dist/scene-schema/v1.js';

// Pilot Script V2 (048 follow-up): must satisfy the 049 contract AND the
// measurable 050 story rules that are checkable without rendering.
const doc = JSON.parse(
  readFileSync(new URL('../../../docs/pilot/60s-script-v2.scene.json', import.meta.url), 'utf8'),
);
const words = (text) => text.replace(/–/g, ' ').split(/\s+/).filter(Boolean).length;
const shots = () => doc.scenes.flatMap((scene) => scene.shots);

test('Script V2 validates against Scene-Director contract V1 (1800 frames)', () => {
  const result = validateSceneDocument(doc);
  assert.equal(result.ok, true, result.ok ? '' : result.errors.join('\n'));
  assert.equal(doc.durationFrames, 1800);
  assert.deepEqual(
    doc.scenes.map((s) => s.beat),
    [
      'intro',
      'arrival',
      'context',
      'pause',
      'news',
      'meaning',
      'future',
      'pause',
      'takeaway',
      'outro',
    ],
  );
});

test('Script V2 follows 050 speech rules: <= 120 words, <= 2.3 words/s, pauses', () => {
  const segments = doc.scenes.flatMap((scene) => scene.narration ?? []);
  const total = segments.reduce((sum, s) => sum + words(s.text), 0);
  assert.ok(total >= 60 && total <= 120, 'total words ' + total);
  for (const s of segments) {
    const rate = words(s.text) / ((s.endFrame - s.startFrame) / 30);
    assert.ok(rate <= 2.3, `${s.id} speaks ${rate.toFixed(2)} words/s`);
    assert.ok(s.sourceIds.length > 0, `${s.id} needs at least one source (V08)`);
  }
  for (const scene of doc.scenes) {
    const list = [...(scene.narration ?? [])].sort((a, b) => a.startFrame - b.startFrame);
    for (let i = 1; i < list.length; i++) {
      assert.ok(
        list[i].startFrame - list[i - 1].endFrame >= 18,
        'pause >= 0.6 s between sentences',
      );
    }
  }
});

test('Script V2 follows 050 visual rules: footage >= 50 %, graphics <= 30 %, text <= 8 %, block lengths', () => {
  const body = shots().filter((s) => !s.kind.startsWith('brand_'));
  const total = body.reduce((sum, s) => sum + s.duration.frames, 0);
  const share = (kinds) =>
    body.filter((s) => kinds.includes(s.kind)).reduce((sum, s) => sum + s.duration.frames, 0) /
    total;
  assert.ok(share(['footage_fullscreen', 'footage_with_overlay', 'breathing_video']) >= 0.5);
  assert.ok(share(['infographic', 'map']) <= 0.3);
  assert.ok(share(['text_card']) <= 0.08);
  const limits = {
    footage_fullscreen: [90, 360],
    footage_with_overlay: [90, 360],
    breathing_video: [60, 120],
    infographic: [120, 300],
    map: [120, 300],
    text_card: [60, 150],
  };
  for (const s of body) {
    const [min, max] = limits[s.kind];
    assert.ok(s.duration.frames >= min && s.duration.frames <= max, `${s.id} length`);
  }
  // Brand frame stays fixed: 9-frame transitions into the first body shot and the outro (V14/V15).
  const all = shots();
  assert.deepEqual(all[1].transitionIn, { type: 'crossfade', frames: 9 });
  assert.deepEqual(all.at(-1).transitionIn, { type: 'crossfade', frames: 9 });
  assert.equal(all.at(-1).duration.frames, 180);
  // Never two identical shot kinds in a row, except fullscreen -> overlay of the same take.
  for (let i = 1; i < all.length; i++) {
    const same = all[i].kind === all[i - 1].kind;
    assert.ok(!same, `${all[i - 1].id} and ${all[i].id} repeat ${all[i].kind}`);
  }
});

test('Script V2 overlays: <= 12 words, readable duration, not in the first second', () => {
  for (const s of shots()) {
    for (const o of s.overlays ?? []) {
      const w = words(o.text);
      const seconds = (o.endFrame - o.startFrame) / 30;
      assert.ok(w <= 12, `${s.id} overlay has ${w} words`);
      assert.ok(o.startFrame >= 30, `${s.id} overlay starts in the first second`);
      if (o.style === 'info_box')
        assert.ok(seconds >= 1 + 0.3 * w && seconds <= 6, `${s.id} reading time`);
    }
  }
});
