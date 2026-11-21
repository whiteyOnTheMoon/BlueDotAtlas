import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  PILOT_PRIVATE_046,
  PILOT_PRIVATE_046_SHOTS,
  PRIVATE_046_MEDIA,
  validatePilotPrivate046,
} from '../packages/video/src/compositions/pilot-private-046-plan.js';

const timeline = JSON.parse(
  readFileSync(new URL('../docs/pilot/pilot-timeline.json', import.meta.url), 'utf8'),
);
const rights = JSON.parse(
  readFileSync(new URL('../assets/pilot/rights-manifest.json', import.meta.url), 'utf8'),
);
const script = JSON.parse(
  readFileSync(new URL('../docs/pilot/60s-script.json', import.meta.url), 'utf8'),
);

test('046 internal visual cut matches all nine locked 044 ranges, including brand overlaps', () => {
  assert.equal(validatePilotPrivate046(), true);
  assert.equal(PILOT_PRIVATE_046.frames, 1800);
  assert.equal(PILOT_PRIVATE_046.fps, 30);
  assert.equal(timeline.master.frames, 1800);
  assert.equal(timeline.master.fps, 30);
  for (let i = 0; i < 9; i++) {
    assert.equal(PILOT_PRIVATE_046_SHOTS[i].id, timeline.shots[i].id);
    assert.equal(PILOT_PRIVATE_046_SHOTS[i].from, timeline.shots[i].startFrame);
    assert.equal(PILOT_PRIVATE_046_SHOTS[i].durationInFrames,
      timeline.shots[i].endFrame - timeline.shots[i].startFrame);
  }
});

test('046 admits only three operator-approved INTERNAL TEST original sources, without source audio', () => {
  assert.deepEqual(Object.keys(PRIVATE_046_MEDIA).sort(),
    ['P60-VID-001', 'P60-VID-003', 'P60-VID-005']);
  assert.deepEqual(PILOT_PRIVATE_046_SHOTS.filter((shot) => shot.kind === 'footage')
    .map((shot) => shot.assetId), ['P60-VID-001', 'P60-VID-005', 'P60-VID-003']);
  for (const id of Object.keys(PRIVATE_046_MEDIA)) {
    const source = rights.assets.find((asset) => asset.asset_id === id);
    assert.ok(source);
    assert.equal(source.rights_status, 'APPROVED');
    assert.equal(source.approval_scope, 'PRIVATE_INTERNAL_TEST_ONLY');
    assert.equal(source.internal_test_source_approved, true);
    assert.equal(source.source_audio_allowed, false);
    assert.equal(source.approved_for_timeline, false);
    assert.match(source.technical_original_sha256, /^[a-f0-9]{64}$/);
    assert.ok(source.technical_original_bytes > 100_000);
    assert.ok(PRIVATE_046_MEDIA[id].startsWith('pilot/.private-046/'));
  }
  assert.equal(rights.local_media_acquired, false, 'tracked catalogue is not runtime staging state');
  assert.equal(script.render_authorized, false);
  assert.equal(script.publish_authorized, false);
  assert.equal(timeline.release.productionRenderAuthorized, false);
  assert.equal(PILOT_PRIVATE_046.narrationIncluded, false);
  assert.equal(PILOT_PRIVATE_046.thirdPartyAudioIncluded, false);
  assert.equal(PILOT_PRIVATE_046.publicationAuthorized, false);
  assert.equal(PILOT_PRIVATE_046.renderAuthorized, false);
});

test('046 invalid footage, extra frames, missing scene, unplanned brand overlaps fail closed', () => {
  const copy = () => PILOT_PRIVATE_046_SHOTS.map((shot) => ({ ...shot }));
  const cases = [
    (shots) => { shots[1].assetId = 'P60-VID-002'; },
    (shots) => { shots[6].assetId = 'P60-VID-ALT-004'; },
    (shots) => { shots[2].assetId = 'https://example.invalid/video.mp4'; },
    (shots) => { shots[3].assetId = 'P60-VID-001'; },
    (shots) => { shots[8].durationInFrames = 181; },
    (shots) => { shots[1].from = 75; },
    (shots) => { shots[4].durationInFrames = 259; },
    (shots) => { shots.pop(); },
  ];
  for (const change of cases) {
    const shots = copy();
    change(shots);
    assert.throws(() => validatePilotPrivate046(shots));
  }
});
