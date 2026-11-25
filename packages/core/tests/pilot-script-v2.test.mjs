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

test('Script V2 follows 050 speech rules: <= 120 words, mean <= 2.3 words/s, pauses', () => {
  const segments = doc.scenes.flatMap((scene) => scene.narration ?? []);
  const total = segments.reduce((sum, s) => sum + words(s.text), 0);
  assert.ok(total >= 60 && total <= 120, 'total words ' + total);
  const seconds = segments.reduce((sum, s) => sum + (s.endFrame - s.startFrame) / 30, 0);
  assert.ok(total / seconds <= 2.3, `mean ${(total / seconds).toFixed(2)} words/s`);
  for (const s of segments) {
    const rate = words(s.text) / ((s.endFrame - s.startFrame) / 30);
    // A single short sentence may run a little faster; the 050 rule is the mean.
    assert.ok(rate <= 2.7, `${s.id} speaks ${rate.toFixed(2)} words/s`);
    assert.ok(s.sourceIds.length > 0, `${s.id} needs at least one source (V08)`);
  }
  // Absolute frames: >= 0.6 s between sentences, >= 1.0 s between beats.
  let offset = 0;
  const absolute = [];
  for (const scene of doc.scenes) {
    for (const n of scene.narration ?? []) {
      absolute.push({
        ...n,
        scene: scene.id,
        start: offset + n.startFrame,
        end: offset + n.endFrame,
      });
    }
    offset += scene.shots.reduce((sum, shot) => sum + shot.duration.frames, 0);
  }
  absolute.sort((a, b) => a.start - b.start);
  for (let i = 1; i < absolute.length; i++) {
    const gap = absolute[i].start - absolute[i - 1].end;
    const min = absolute[i].scene === absolute[i - 1].scene ? 18 : 30;
    assert.ok(gap >= min, `${absolute[i - 1].id} -> ${absolute[i].id} gap ${gap} frames`);
  }
});

test('Script V2 narration windows equal the measured Kokoro timing (053 audio as master)', () => {
  const timing = JSON.parse(
    readFileSync(
      new URL('../../../docs/pilot/60s-script-v2.narration-timing.json', import.meta.url),
      'utf8',
    ),
  );
  assert.equal(timing.published, false);
  assert.equal(timing.voice, 'bm_george');
  let offset = 0;
  const actual = new Map();
  for (const scene of doc.scenes) {
    for (const n of scene.narration ?? [])
      actual.set(n.id, [offset + n.startFrame, offset + n.endFrame]);
    offset += scene.shots.reduce((sum, shot) => sum + shot.duration.frames, 0);
  }
  assert.equal(timing.segments.length, actual.size);
  for (const s of timing.segments) assert.deepEqual(actual.get(s.id), [s.startFrame, s.endFrame]);
  assert.ok(timing.averageWordsPerSecond <= 2.3);
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

test('Script V2 media are listed in the V2 rights manifest with matching SHA-256 and credits', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../../../assets/pilot/rights-manifest-v2.json', import.meta.url), 'utf8'),
  );
  assert.equal(manifest.publication_authorized, false);
  const byId = new Map(manifest.assets.map((a) => [a.asset_id, a]));
  for (const asset of doc.assets.filter((a) => a.id.startsWith('V2-'))) {
    const entry = byId.get(asset.id);
    assert.ok(entry, `${asset.id} missing from rights-manifest-v2.json`);
    assert.equal(asset.sha256, entry.technical.sha256, `${asset.id} SHA-256 differs`);
    assert.match(entry.technical.sha256, /^[a-f0-9]{64}$/);
    assert.equal(entry.technical.audio_streams, 0);
    assert.ok(entry.credits && entry.rights_evidence_urls.length > 0);
    assert.equal(asset.rightsStatus, 'unreviewed', 'unreviewed until the operator approves');
    assert.ok(['UNREVIEWED', 'APPROVED'].includes(entry.rights_status));
  }
  // An asset with an open publication blocker can never be marked publishable.
  for (const entry of manifest.assets) {
    if (entry.publication_blocker)
      assert.equal(entry.proposed_status, 'PRIVATE_INTERNAL_TEST_ONLY');
  }
});
