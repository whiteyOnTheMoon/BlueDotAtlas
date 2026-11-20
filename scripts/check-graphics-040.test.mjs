import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  graphicOpacity,
  GRAPHICS_LAYOUT,
  GRAPHICS_PALETTE,
  GRAPHICS_PROOF_CUES,
  GRAPHICS_PROOF_FRAMES,
  isValidSourceDate,
  validateGraphic,
  validateGraphicTimeline,
} from '../packages/video/src/compositions/graphics-plan.js';
import { VIDEO_PROFILE } from '../packages/video/src/compositions/profile.js';
import { validateGraphicsOutput } from './check-graphics-040.mjs';

test('proof must be registered as an actual selectable Remotion composition', () => {
  const root = readFileSync(
    new URL('../packages/video/src/compositions/RemotionRoot.tsx', import.meta.url),
    'utf8',
  );
  assert.match(root, /id="BDA040GraphicsProof"/);
  assert.match(root, /component=\{GraphicsProof\}/);
  assert.match(root, /durationInFrames=\{GRAPHICS_PROOF_FRAMES\}/);
});

test('040 proof uses exactly two contextual captions, one real technical metric, 8-second film', () => {
  assert.equal(VIDEO_PROFILE.width, 1920);
  assert.equal(VIDEO_PROFILE.height, 1080);
  assert.equal(VIDEO_PROFILE.fps, 30);
  assert.equal(GRAPHICS_PROOF_FRAMES, 240);
  assert.equal(validateGraphicTimeline(GRAPHICS_PROOF_CUES), true);
  assert.deepEqual(GRAPHICS_PROOF_CUES.map((cue) => cue.from), [0, 88, 176]);
  assert.deepEqual(GRAPHICS_PROOF_CUES.map((cue) => cue.graphic.kind), [
    'location', 'location', 'metric',
  ]);
  assert.equal(GRAPHICS_PROOF_CUES[2].graphic.metricValue, VIDEO_PROFILE.fps);
  assert.equal(GRAPHICS_PROOF_FRAMES - 206, 34);
});

test('graphics fit approved horizontal and vertical margins', () => {
  assert.equal(GRAPHICS_LAYOUT.left, VIDEO_PROFILE.safeMarginX);
  assert.equal(GRAPHICS_LAYOUT.bottom, VIDEO_PROFILE.safeMarginY);
  assert.ok(GRAPHICS_LAYOUT.width <= VIDEO_PROFILE.width - 2 * VIDEO_PROFILE.safeMarginX);
  assert.ok(GRAPHICS_LAYOUT.width < VIDEO_PROFILE.width / 2);
  assert.equal(GRAPHICS_LAYOUT.fadeFrames, 12);
  const brandTokens = readFileSync(new URL('../packages/ui/tokens/colors.ts', import.meta.url), 'utf8');
  for (const color of Object.values(GRAPHICS_PALETTE)) {
    assert.ok(brandTokens.includes(color), 'overlay must not invent a new color ' + color);
  }
});

test('short fade-in and fade-out, solid hold, then the overlay unmounts', () => {
  assert.equal(graphicOpacity(0, 76), 0);
  assert.ok(graphicOpacity(6, 76) > 0 && graphicOpacity(6, 76) < 1);
  assert.equal(graphicOpacity(11, 76), 1);
  assert.equal(graphicOpacity(64, 76), 1);
  assert.equal(graphicOpacity(75, 76), 0);
  assert.equal(graphicOpacity(0, 30), 0);
  assert.equal(graphicOpacity(29, 30), 0);
  assert.throws(() => graphicOpacity(-1, 76), RangeError);
  assert.throws(() => graphicOpacity(76, 76), RangeError);
  assert.throws(() => graphicOpacity(0, 12), RangeError);
  assert.throws(() => graphicOpacity(2.5, 76), RangeError);
});

test('truthful date precision: YYYY and real YYYY-MM-DD only', () => {
  assert.equal(isValidSourceDate('2021'), true);
  assert.equal(isValidSourceDate('2019-02-20'), true);
  for (const bad of ['2021-00-20', '2021-02-30', '2021-13-01', 'not-a-date', '2021-02', '0000', '2021-1-2']) {
    assert.equal(isValidSourceDate(bad), false);
  }
});

test('unverified numeric fields, long or unsafe text, missing source are rejected', () => {
  const location = GRAPHICS_PROOF_CUES[0].graphic;
  const metric = GRAPHICS_PROOF_CUES[2].graphic;
  for (const patch of [
    { kind: 'unknown' },
    { title: '' },
    { title: 'A'.repeat(40) },
    { detail: 'A'.repeat(90) },
    { source: '' },
    { eyebrow: '<script>' },
    { date: null },
    { date: '2021-02-30' },
    { metricValue: 20 },
  ]) {
    assert.throws(() => validateGraphic({ ...location, ...patch }));
  }
  for (const patch of [
    { metricValue: null },
    { metricValue: Number.NaN },
    { metricValue: Number.POSITIVE_INFINITY },
    { metricValue: -5 },
    { metricUnit: '' },
    { metricUnit: null },
    { date: '2021' },
    { source: '' },
  ]) {
    assert.throws(() => validateGraphic({ ...metric, ...patch }));
  }
});

test('proof cannot overlap graphics or keep permanent overlays', () => {
  const clone = GRAPHICS_PROOF_CUES.map((cue) => ({ ...cue }));
  assert.throws(() => validateGraphicTimeline(clone.slice(0, 2)));
  assert.throws(() =>
    validateGraphicTimeline(clone.map((cue, n) => n === 1 ? { ...cue, from: 50 } : cue)));
  assert.throws(() =>
    validateGraphicTimeline(clone.map((cue, n) => n === 2 ? { ...cue, durationInFrames: 60 } : cue)));
});

test('pilot film stays planning-only and source rights remain untouched', () => {
  const p = JSON.parse(readFileSync(new URL('../docs/pilot/60s-script.json', import.meta.url), 'utf8'));
  assert.equal(p.planning_only, true);
  assert.equal(p.render_authorized, false);
  assert.equal(p.publish_authorized, false);
});

const cleanProbe = () => ({
  streams: [{ codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080,
    r_frame_rate: '30/1', nb_read_frames: '240', pix_fmt: 'yuv420p' }],
  format: { duration: '8.000000' },
});

test('real render verifier strictly checks size, FPS, duration, frame count and no audio', () => {
  assert.doesNotThrow(() => validateGraphicsOutput(cleanProbe()));
  const full = cleanProbe();
  full.streams[0].pix_fmt = 'yuvj420p';
  assert.doesNotThrow(() => validateGraphicsOutput(full));
  for (const patch of [
    (p) => { p.streams[0].width = 1280; },
    (p) => { p.streams[0].height = 720; },
    (p) => { p.streams[0].r_frame_rate = '25/1'; },
    (p) => { p.streams[0].nb_read_frames = '239'; },
    (p) => { p.streams[0].pix_fmt = 'yuv422p'; },
    (p) => { p.streams.push({ codec_type: 'audio', codec_name: 'aac' }); },
    (p) => { p.format.duration = '9.0'; },
  ]) {
    const value = cleanProbe();
    patch(value);
    assert.throws(() => validateGraphicsOutput(value));
  }
});
