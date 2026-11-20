import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildTts042Plan, TTS_042 } from './tts-042-plan.mjs';
const draft = JSON.parse(readFileSync(new URL('../docs/pilot/60s-script.json', import.meta.url), 'utf8'));

test('042 references seven real narration fragments from locked P60 draft', () => {
  const plan = buildTts042Plan(draft);
  assert.deepEqual(plan.segments.map(x=>x.id), TTS_042.segmentIds);
  assert.equal(plan.scope, '042_PRIVATE_AUDIO_QA_ONLY');
  assert.equal(plan.authorizedForFilm, false);
  assert.equal(plan.published, false);
  assert.equal(plan.segments.length, 7);
  assert.ok(plan.segments.every(x=>x.text.length >= 45));
  assert.match(plan.sourceSha256, /^[a-f0-9]{64}$/);
});

test('one real open model voice, bounded pausing and 48k stereo export', () => {
  assert.equal(TTS_042.provider, 'kokoro-onnx-local');
  assert.equal(TTS_042.voice, 'bm_george');
  assert.equal(TTS_042.language, 'en-gb');
  assert.equal(TTS_042.speed, 1);
  assert.equal(TTS_042.outputRate, 48000);
  assert.equal(TTS_042.channels, 2);
  assert.ok(TTS_042.segmentGapSeconds > 0 && TTS_042.segmentGapSeconds < 0.5);
});

test('narration planning locks fail closed instead of generating a film', () => {
  for (const change of [
    { planning_only: false },
    { render_authorized: true },
    { publish_authorized: true },
    { shots: [] },
    { shots: [...draft.shots, { id:'S09', narration:{text:'A completely new unreviewed narration sentence.'} }] },
  ]) {
    assert.throws(() => buildTts042Plan({ ...draft, ...change }));
  }
});

test('missing sources or modified spoken fragments are rejected', () => {
  const cloned = structuredClone(draft);
  cloned.shots.find(x=>x.id==='S03').narration.text = '';
  assert.throws(()=>buildTts042Plan(cloned));
  cloned.shots.find(x=>x.id==='S03').narration.text = 'Ok.';
  assert.throws(()=>buildTts042Plan(cloned));
  cloned.shots.find(x=>x.id==='S03').narration.text = 'A'.repeat(200);
  assert.throws(()=>buildTts042Plan(cloned));
});

test('no provider keys or proprietary model downloads in source planning', () => {
  const plan = JSON.stringify(buildTts042Plan(draft));
  assert.doesNotMatch(plan, /api_key|authorization|elevenlabs|credit card|billing|token/i);
});
