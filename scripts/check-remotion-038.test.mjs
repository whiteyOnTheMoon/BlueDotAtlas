import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  BRAND_SOURCES,
  layerOpacity,
  planBrandTimeline,
  VIDEO_PROFILE,
} from '../packages/video/src/compositions/profile.js';
import { validateProbe } from './check-remotion-038.mjs';

test('1080p/30fps 10-second profile and safe bounds', () => {
  assert.deepEqual(
    [VIDEO_PROFILE.width, VIDEO_PROFILE.height, VIDEO_PROFILE.fps, VIDEO_PROFILE.proofFrames],
    [1920, 1080, 30, 300],
  );
  assert.equal(VIDEO_PROFILE.width - 2 * VIDEO_PROFILE.safeMarginX, 1600);
  assert.equal(VIDEO_PROFILE.height - 2 * VIDEO_PROFILE.safeMarginY, 864);
});

test('brand composition has exactly two overlapping 9-frame transitions', () => {
  const plan = planBrandTimeline(300);
  assert.deepEqual(plan.intro, { from: 0, durationInFrames: 75 });
  assert.deepEqual(plan.content, { from: 66, durationInFrames: 63 });
  assert.deepEqual(plan.outro, { from: 120, durationInFrames: 180 });
  assert.equal(plan.intro.from + plan.intro.durationInFrames - plan.content.from, 9);
  assert.equal(plan.content.from + plan.content.durationInFrames - plan.outro.from, 9);
  assert.equal(plan.outro.from + plan.outro.durationInFrames, 300);
});

test('crossfade remains continuous over 9 frames', () => {
  assert.equal(layerOpacity(0, 75, 0, 9), 1);
  assert.equal(layerOpacity(66, 75, 0, 9), 1);
  assert.equal(layerOpacity(74, 75, 0, 9), 1 / 9);
  assert.equal(layerOpacity(0, 63, 9, 9), 1 / 9);
  assert.equal(layerOpacity(8, 63, 9, 9), 1);
  assert.equal(layerOpacity(54, 63, 9, 9), 1);
  assert.equal(layerOpacity(62, 63, 9, 9), 1 / 9);
  assert.throws(() => layerOpacity(-1, 75, 0, 9), RangeError);
});

test('invalid short or fractional timelines are rejected', () => {
  assert.throws(() => planBrandTimeline(0), RangeError);
  assert.throws(() => planBrandTimeline(240), RangeError);
  assert.throws(() => planBrandTimeline(299.5), RangeError);
});

test('brand sources point to existing original MP4s', () => {
  for (const src of [BRAND_SOURCES.intro, BRAND_SOURCES.outro]) {
    const bytes = readFileSync(new URL('../assets/' + src, import.meta.url));
    assert.ok(bytes.byteLength > 100_000);
  }
});

const valid = () => ({
  streams: [
    { codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080, r_frame_rate: '30/1', nb_read_frames: '300' },
    { codec_type: 'audio', codec_name: 'aac' },
  ],
  format: { duration: '10.000000' },
});

test('ffprobe shape denies malformed outputs', () => {
  assert.doesNotThrow(() => validateProbe(valid()));
  for (const mutation of [
    (v) => { v.streams[0].width = 1280; },
    (v) => { v.streams[0].r_frame_rate = '25/1'; },
    (v) => { v.streams[0].nb_read_frames = '299'; },
    (v) => { v.streams[1].codec_name = 'mp3'; },
    (v) => { v.streams.pop(); },
    (v) => { v.format.duration = '9.9'; },
  ]) {
    const v = valid();
    mutation(v);
    assert.throws(() => validateProbe(v));
  }
});
