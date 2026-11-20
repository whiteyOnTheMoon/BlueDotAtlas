import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  SCIENCE_PROOF_FRAMES,
  SCIENCE_FPS,
  SCIENCE_SOURCE_URLS,
  SCIENCE_LABELS,
  SCIENCE_COLORS,
  validateScienceDuration,
  canonicalFrame,
  scienceStateAt,
  scienceVaporParticle,
} from '../packages/video/src/compositions/science-plan.js';
import { VIDEO_PROFILE } from '../packages/video/src/compositions/profile.js';
import { validateScienceOutput } from './check-science-041.mjs';

test('041 is a bounded original 9s 1080p30 animation, not a 60s pilot', () => {
  assert.equal(SCIENCE_PROOF_FRAMES, 270);
  assert.equal(SCIENCE_FPS, 30);
  assert.equal(VIDEO_PROFILE.width, 1920);
  assert.equal(VIDEO_PROFILE.height, 1080);
  assert.equal(validateScienceDuration(SCIENCE_PROOF_FRAMES), 270);
  for (const value of [0, 29, 89, 901, 1800, 90.5, NaN, Infinity, -1]) {
    assert.throws(() => validateScienceDuration(value), RangeError);
  }
});

test('pure phase clock draws evaporation, uplift, condensation and heat in sequence', () => {
  const start = scienceStateAt(0);
  const first = scienceStateAt(78);
  const middle = scienceStateAt(128);
  const late = scienceStateAt(239);
  const finish = scienceStateAt(269);
  assert.deepEqual([start.evaporation, start.rising, start.condensation, start.heatRelease], [0, 0, 0, 0]);
  assert.ok(first.evaporation > 0.85);
  assert.equal(first.condensation, 0);
  assert.ok(middle.rising > 0.5 && middle.condensation === 0);
  assert.ok(late.condensation > 0.8 && late.heatRelease > 0.6);
  assert.deepEqual([finish.evaporation, finish.rising, finish.condensation, finish.heatRelease], [1, 1, 1, 1]);
  assert.deepEqual([scienceStateAt(30).phase, scienceStateAt(130).phase, scienceStateAt(240).phase], [
    'evaporation', 'rising', 'condensation',
  ]);
});

test('monotone visual progress, no non-finite opacity or numeric scientific scale', () => {
  for (const key of ['evaporation', 'rising', 'condensation', 'heatRelease']) {
    let prev = 0;
    for (let frame = 0; frame < SCIENCE_PROOF_FRAMES; frame++) {
      const v = scienceStateAt(frame)[key];
      assert.ok(Number.isFinite(v) && v >= 0 && v <= 1 && v + 1e-8 >= prev);
      prev = v;
    }
  }
  for (const label of Object.values(SCIENCE_LABELS)) {
    assert.doesNotMatch(label, /°C|°F|m\/s|km\/h|mph|hPa|percent|\d+\.\d+%/i);
  }
});

test('real NOAA source citations and caveat stay visible, no fake observation claims', () => {
  assert.deepEqual([...SCIENCE_SOURCE_URLS], [
    'https://oceanservice.noaa.gov/facts/how-hurricanes-form.html',
    'https://www.nesdis.noaa.gov/about/k-12-education/severe-weather/how-does-hurricane-form',
  ]);
  assert.match(SCIENCE_LABELS.subheading, /SCHEMATIC.*NOT TO SCALE.*NOT AN OBSERVATION/);
  assert.match(SCIENCE_LABELS.caveat, /Warm water alone is not enough/);
  assert.match(SCIENCE_LABELS.attribution, /NOAA Ocean Service.*NOAA NESDIS/);
  const tokens = readFileSync(new URL('../packages/ui/tokens/colors.ts', import.meta.url), 'utf8');
  for (const color of Object.values(SCIENCE_COLORS)) {
    assert.ok(tokens.includes(color), 'no unapproved brand/data color ' + color);
  }
});

test('bounded stage particle positions change with time but are never measurements', () => {
  const a = scienceVaporParticle(40, 2);
  const b = scienceVaporParticle(85, 2);
  assert.notEqual(a.y, b.y);
  assert.ok(a.radius > 0 && b.radius > 0);
  for (let frame = 0; frame < SCIENCE_PROOF_FRAMES; frame += 13) {
    for (let index = 0; index < 12; index++) {
      const p = scienceVaporParticle(frame, index);
      assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
      assert.ok(p.opacity >= 0 && p.opacity <= 1);
    }
  }
  for (const index of [-1, 1.5, 12, 99]) {
    assert.throws(() => scienceVaporParticle(10, index), RangeError);
  }
});

test('frame bounds reject invalid frames and support independent 044 clip durations', () => {
  assert.equal(canonicalFrame(0, 270), 0);
  assert.equal(canonicalFrame(269, 270), 269);
  assert.equal(canonicalFrame(149, 150), 269);
  assert.equal(scienceStateAt(149, 150).heatRelease, 1);
  for (const frame of [-1, 270, 2.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => canonicalFrame(frame, 270), RangeError);
  }
});

test('science proof is registered in RemotionRoot and cannot unlock P60 timeline', () => {
  const root = readFileSync(
    new URL('../packages/video/src/compositions/RemotionRoot.tsx', import.meta.url), 'utf8',
  );
  assert.match(root, /id="BDA041ScienceProof"/);
  assert.match(root, /component=\{ScienceProof\}/);
  assert.match(root, /durationInFrames=\{SCIENCE_PROOF_FRAMES\}/);
  const pilot = JSON.parse(
    readFileSync(new URL('../docs/pilot/60s-script.json', import.meta.url), 'utf8'),
  );
  assert.equal(pilot.planning_only, true);
  assert.equal(pilot.render_authorized, false);
  assert.equal(pilot.publish_authorized, false);
});

const probe = () => ({
  streams: [{
    codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080,
    r_frame_rate: '30/1', pix_fmt: 'yuv420p', nb_read_frames: '270',
  }],
  format: { duration: '9.000' },
});

test('encoded QA guards 270 frames, H264 1080p30, 8-bit YUV420 and silence', () => {
  assert.doesNotThrow(() => validateScienceOutput(probe()));
  const alias = probe();
  alias.streams[0].pix_fmt = 'yuvj420p';
  assert.doesNotThrow(() => validateScienceOutput(alias));
  for (const mutate of [
    (p) => { p.streams[0].width = 1280; },
    (p) => { p.streams[0].height = 720; },
    (p) => { p.streams[0].codec_name = 'vp9'; },
    (p) => { p.streams[0].r_frame_rate = '24/1'; },
    (p) => { p.streams[0].pix_fmt = 'yuv422p'; },
    (p) => { p.streams[0].nb_read_frames = '269'; },
    (p) => { p.format.duration = '8.7'; },
    (p) => { p.streams.push({ codec_type: 'audio', codec_name: 'aac' }); },
  ]) {
    const value = probe();
    mutate(value);
    assert.throws(() => validateScienceOutput(value));
  }
});
