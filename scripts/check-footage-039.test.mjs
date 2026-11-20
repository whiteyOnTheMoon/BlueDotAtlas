import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  FOOTAGE_PROOF_FRAMES,
  PRIVATE_ORIGINALS,
  PRIVATE_PROOF_SHOTS,
  validateFootageShot,
  validatePrivateProofTimeline,
} from '../packages/video/src/compositions/footage-plan.js';
import { validateOutput } from './check-footage-039.mjs';

test('two different NASA/NOAA originals, 180 frames, no gap or slideshow-only layer', () => {
  assert.equal(FOOTAGE_PROOF_FRAMES, 180);
  assert.equal(validatePrivateProofTimeline(PRIVATE_PROOF_SHOTS), true);
  assert.deepEqual(PRIVATE_PROOF_SHOTS.map((s) => s.from), [0, 60, 120]);
  assert.deepEqual(PRIVATE_PROOF_SHOTS.map((s) => s.assetId), [
    'P60-VID-001',
    'P60-VID-005',
    'P60-VID-001',
  ]);
  assert.equal(PRIVATE_PROOF_SHOTS[0].fit, 'contain');
  assert.equal(PRIVATE_PROOF_SHOTS[1].fit, 'cover');
  for (const asset of Object.values(PRIVATE_ORIGINALS)) {
    assert.match(asset.relativePath, /^pilot\/\.private-039\/P60-VID-00[15]\.mp4$/);
  }
});

test('bounded crop, trim, color and playback rules deny unsafe values', () => {
  for (const edits of [
    { assetId: 'P60-VID-002' },
    { assetId: 'P60-VID-ALT-004' },
    { trimBefore: -1 },
    { trimBefore: 1.5 },
    { playbackRate: -1 },
    { playbackRate: 8 },
    { fit: 'fill' },
    { fit: 'cover' },
    { focalX: 200 },
    { brightness: 2 },
    { contrast: 0.5 },
    { saturation: 4 },
    { durationInFrames: 1800 },
    { durationInFrames: 0 },
  ]) {
    assert.throws(() => validateFootageShot({ ...PRIVATE_PROOF_SHOTS[0], ...edits }));
  }
});

test('private proof timeline refuses holes, overlaps and single-source substitutions', () => {
  assert.throws(() => validatePrivateProofTimeline(PRIVATE_PROOF_SHOTS.slice(0, 2)));
  assert.throws(() =>
    validatePrivateProofTimeline(PRIVATE_PROOF_SHOTS.map((s, i) =>
      i === 1 ? { ...s, from: 70 } : s)),
  );
  assert.throws(() =>
    validatePrivateProofTimeline(PRIVATE_PROOF_SHOTS.map((s) =>
      ({ ...s, assetId: 'P60-VID-001', fit: 'contain' }))),
  );
});

test('039 never changes the 037 full-film authorization', () => {
  const script = JSON.parse(readFileSync(new URL('../docs/pilot/60s-script.json', import.meta.url), 'utf8'));
  assert.equal(script.planning_only, true);
  assert.equal(script.render_authorized, false);
  assert.equal(script.publish_authorized, false);
});

const valid = () => ({
  streams: [{
    codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080,
    r_frame_rate: '30/1', pix_fmt: 'yuv420p', nb_read_frames: '180',
  }],
  format: { duration: '6.000' },
});

test('final output must be H264 1080p30 180 frames and entirely mute', () => {
  assert.doesNotThrow(() => validateOutput(valid()));
  for (const corrupt of [
    (p) => { p.streams[0].width = 1280; },
    (p) => { p.streams[0].r_frame_rate = '25/1'; },
    (p) => { p.streams[0].nb_read_frames = '179'; },
    (p) => { p.streams[0].pix_fmt = 'yuv422p'; },
    (p) => { p.streams.push({ codec_type: 'audio', codec_name: 'aac' }); },
    (p) => { p.format.duration = '5.0'; },
  ]) {
    const data = valid();
    corrupt(data);
    assert.throws(() => validateOutput(data));
  }
});
