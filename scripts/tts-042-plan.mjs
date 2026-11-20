import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const TTS_042 = Object.freeze({
  provider: 'kokoro-onnx-local',
  voice: 'bm_george',
  language: 'en-gb',
  speed: 1.0,
  outputRate: 48000,
  channels: 2,
  segmentGapSeconds: 0.28,
  segmentIds: Object.freeze(['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07']),
});

const SOURCE = fileURLToPath(new URL('../docs/pilot/60s-script.json', import.meta.url));

/** @param {unknown} script */
export function buildTts042Plan(script) {
  if (!script || typeof script !== 'object') throw new Error('Pilot script required');
  const draft = /** @type {Record<string, any>} */ (script);
  if (draft.planning_only !== true || draft.render_authorized !== false || draft.publish_authorized !== false) {
    throw new Error('P60 release gate must remain locked');
  }
  if (!Array.isArray(draft.shots)) throw new Error('Shotlist required');
  const shots = draft.shots.filter((s) => s.narration);
  if (shots.length !== 7) throw new Error('Exactly seven approved planning narration fragments');
  const segments = shots.map((shot, i) => {
    if (shot.id !== TTS_042.segmentIds[i]) throw new Error('Narration sequence changed');
    if (typeof shot.narration.text !== 'string' || shot.narration.text.trim() !== shot.narration.text ||
      shot.narration.text.length < 45 || shot.narration.text.length > 180 ||
      /[\r\n<>]/.test(shot.narration.text)) throw new Error('Unsafe/malformed narration');
    return { id: shot.id, text: shot.narration.text };
  });
  const sourceBytes = readFileSync(SOURCE);
  return Object.freeze({
    scope: '042_PRIVATE_AUDIO_QA_ONLY',
    published: false,
    authorizedForFilm: false,
    provider: TTS_042.provider,
    voice: TTS_042.voice,
    language: TTS_042.language,
    speed: TTS_042.speed,
    outputRate: TTS_042.outputRate,
    channels: TTS_042.channels,
    segmentGapSeconds: TTS_042.segmentGapSeconds,
    sourceSha256: createHash('sha256').update(sourceBytes).digest('hex'),
    segments,
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.CI !== 'true' || process.env.BDA_TTS_042_PRIVATE_TEST !== 'TRUE') {
    throw new Error('Local audio proof requires explicit CI-only opt-in');
  }
  const output = resolve('.tmp-tts-042/plan.json');
  const spec = JSON.parse(readFileSync(SOURCE, 'utf8'));
  const result = buildTts042Plan(spec);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(result, null, 2) + '\n', { mode: 0o600 });
  console.log('042 PLAN PASS: seven English fragments, one local voice, publish=false, no credentials');
}
