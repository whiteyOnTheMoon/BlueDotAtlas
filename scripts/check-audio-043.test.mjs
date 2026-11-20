import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  MIX_043, validateMusicRights, buildAudioProofPlan, musicGainExpression,
  filterGraph, loadLockedPilot,
} from '../packages/video/audio-mix/plan.mjs';

const draft = loadLockedPilot();

test('043 only mixes a 16s diagnostic, not an authorized 60-second film', () => {
  const p = buildAudioProofPlan(draft);
  assert.equal(p.status, 'SYNTHETIC_QA_ONLY');
  assert.equal(p.filmAuthorized, false);
  assert.equal(p.published, false);
  assert.equal(p.originalBrandMediaIncluded, false);
  assert.equal(p.musicRights, 'ORIGINAL_SYNTHETIC_QA_ONLY');
  assert.equal(p.voiceSource, 'SYNTHETIC_GATE_SIGNAL_NOT_REAL_NARRATION');
  assert.equal(p.seconds, 16);
  assert.equal(p.sampleRate, 48000);
  assert.equal(p.channels, 2);
  assert.equal(p.frameRate, 30);
});

test('Music continues across intro, final content and all six outro seconds', () => {
  const p = buildAudioProofPlan(draft);
  assert.equal(p.outroStartSeconds, 10);
  assert.equal(p.outroSeconds, 6);
  assert.equal(p.outroStartSeconds + p.outroSeconds, p.seconds);
  assert.equal(p.brandCrossfadeFrames, 9);
  assert.equal(p.introAudioFadeOutSeconds, 0.3);
  assert.equal(p.seconds - p.fadeOutSeconds, 15.2);
  assert.ok(p.seconds - p.fadeOutSeconds > p.outroStartSeconds + 5);
  assert.ok(p.voiceWindow.end < p.outroStartSeconds);
});

test('Smooth and reversible music ducking is under narration, not under outro', () => {
  const p = buildAudioProofPlan(draft);
  assert.ok(p.duckingDepth > 0.5 && p.duckingDepth < 0.9);
  assert.ok(p.duckAttackSeconds > 0 && p.duckReleaseSeconds > 0);
  const expr = musicGainExpression(p);
  assert.match(expr, /t-2\.15/);
  assert.match(expr, /8\.95-t/);
  assert.match(expr, /0\.72/);
  const ff = filterGraph(p);
  assert.match(ff, /:eval=frame/);
  assert.match(ff, /afade=t=in:st=0:d=0\.5/);
  assert.match(ff, /afade=t=out:st=15\.2:d=0\.8/);
  assert.match(ff, /alimiter=limit=0\.90/);
  assert.match(ff, /asplit=2\[music\]\[musicqa\]/);
  assert.match(ff, /\[voice\]\[music\]\[ambience\]\[intro\]amix/);
});

test('Unverified commercial music, absent rights or release upgrade fail closed', () => {
  assert.equal(validateMusicRights({
    source: 'GENERATED_ORIGINAL_TEST_TONES',
    licenseStatus: 'SYNTHETIC_QA_ONLY',
    releaseAuthorized: false,
  }), true);
  for (const track of [
    undefined,
    {source:'unlicensed-song', licenseStatus:'UNKNOWN',releaseAuthorized:false},
    {source:'GENERATED_ORIGINAL_TEST_TONES', licenseStatus:'UNREVIEWED',releaseAuthorized:false},
    {source:'GENERATED_ORIGINAL_TEST_TONES', licenseStatus:'SYNTHETIC_QA_ONLY',releaseAuthorized:true},
  ]) {
    assert.throws(() => validateMusicRights(track));
  }
  assert.throws(() => validateMusicRights({
    source:'GENERATED_ORIGINAL_TEST_TONES',
    licenseStatus:'SYNTHETIC_QA_ONLY',
    releaseAuthorized:false,
  }, false), /cannot authorize production/);
});

test('P60 render gate and master sound profile cannot change for mixing QA', () => {
  for (const patch of [
    {planning_only:false},
    {render_authorized:true},
    {publish_authorized:true},
    {target:{...draft.target,fps:24}},
    {target:{...draft.target,duration_frames:300}},
    {target:{...draft.target,audio_sample_rate_hz:44100}},
    {target:{...draft.target,audio_channels:1}},
    {target:null},
  ]) {
    assert.throws(() => buildAudioProofPlan({...draft,...patch}));
  }
});

test('Reject unsafe timing changes or music exceeding plausible headroom', () => {
  const p=buildAudioProofPlan(draft);
  for (const patch of [
    {voiceWindow:{start:9.5,end:12}},
    {voiceWindow:{start:2.5,end:2.3}},
    {duckingDepth:1.1},
    {musicGain:0.99},
    {voiceWindow:{start:-2,end:8}},
  ]) {
    assert.throws(() => musicGainExpression({...p,...patch}));
  }
});
