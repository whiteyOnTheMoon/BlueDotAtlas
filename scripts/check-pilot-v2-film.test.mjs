// 048 re-review: unit tests for the private V2 film path (no media, no Docker).
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { NARRATION_BYTES, SCENE_V2, V2_STAGE_FILES, assetMap, checkNarration, sourceNeeds } from './render-pilot-v2.mjs';

const sceneBytes = readFileSync(SCENE_V2);
const doc = JSON.parse(sceneBytes);
const sha = (b) => createHash('sha256').update(b).digest('hex');

test('every V2 scene asset maps to a project-local private stage file', () => {
  const map = assetMap(doc, '/source');
  assert.deepEqual(Object.keys(map).sort(), Object.keys(V2_STAGE_FILES).sort());
  for (const { file } of Object.values(map)) {
    assert.ok(file.startsWith('/source/brand/motion/final/') || file.startsWith('/source/pilot/.private-'), file);
  }
  assert.equal(map['P60-VID-003'].file, '/source/pilot/.private-046/hd-proxy-046/P60-VID-003-hd.mp4');
  assert.throws(() => assetMap({ scenes: [{ shots: [{ assetIds: ['UNKNOWN'] }] }] }, '/source'), /no private stage file/);
});

test('source length needs include transition tails and in-points', () => {
  const needs = sourceNeeds(doc);
  assert.equal(needs['brand-intro'], 2.5, 'brand intro holds its last frame instead of needing extra source');
  assert.equal(needs['brand-outro'], 6);
  // S02 starts at 105 in P60-VID-001 and renders 270 + 18 tail frames.
  assert.equal(needs['P60-VID-001'], (105 + 270 + 18) / 30);
  // S08 starts at frame 1500 of SVS 5681.
  assert.equal(needs['V2-VID-SVS5681-POLO-GPM'], (1500 + 60 + 15) / 30);
  // Known source lengths from the rights manifests still fit.
  assert.ok(needs['P60-VID-005'] <= 17.48);
  assert.ok(needs['V2-VID-CIRA-POLO-RI'] <= 7.6);
});

function fakeWav() {
  const b = Buffer.alloc(NARRATION_BYTES);
  b.write('RIFF', 0, 'ascii');
  b.writeUInt16LE(2, 22);
  b.writeUInt32LE(48000, 24);
  return b;
}

test('narration must be exact, private and generated from this scene document', () => {
  const wav = fakeWav();
  const report = { scope: '048_V2_PRIVATE_NARRATION', published: false, sceneSha256: sha(sceneBytes), wavSha256: sha(wav), segments: new Array(6).fill({}) };
  assert.equal(checkNarration(wav, report, sceneBytes), true);
  assert.throws(() => checkNarration(wav, { ...report, sceneSha256: '0'.repeat(64) }, sceneBytes), /different scene/);
  assert.throws(() => checkNarration(wav, { ...report, published: true }, sceneBytes));
  assert.throws(() => checkNarration(wav, { ...report, wavSha256: '0'.repeat(64) }, sceneBytes), /SHA mismatch/);
  assert.throws(() => checkNarration(wav.subarray(0, 1000), report, sceneBytes));
});

test('VPS runner keeps the private, offline, bounded boundary', () => {
  const sh = readFileSync(new URL('./run-pilot-v2-film.sh', import.meta.url), 'utf8');
  for (const needle of [
    'test "$root" = "$HOME/www/blueDotAtlas"', 'git check-ignore -q "$private_root/stage"',
    'voice="$private_root/v2-tts-01"', 'out="$private_root/scene-v2-01"',
    'BDA_PILOT_V2_TTS_PRIVATE=TRUE', 'BDA_PILOT_V2_FILM_PRIVATE=TRUE', 'refuse overwrite',
    '--memory 800m --memory-swap 800m', '--memory 512m --memory-swap 512m',
    'need_tts=3104', 'need_film=2816', 'below 2048 MiB MemAvailable', 'org.opencontainers.image.revision',
  ]) assert.ok(sh.includes(needle), 'runner lost: ' + needle);
  const runs = sh.match(/docker run[^\n]*\n(?:[^\n]*\\\n)*/g) ?? [];
  assert.ok(runs.length >= 4);
  for (const run of runs) {
    assert.ok(run.includes('--network none') && run.includes('--read-only') && run.includes('--cap-drop ALL'), run);
  }
  assert.ok(!/docker (system|image|container) prune|compose (down|restart)|rm -rf/.test(sh));
});

test('TTS image is offline at runtime and fully pinned', () => {
  const docker = readFileSync(new URL('../deploy/Dockerfile', import.meta.url), 'utf8');
  const block = docker.slice(docker.indexOf('AS pilotv2tts'));
  for (const pin of ['kokoro-onnx==0.6.1', 'onnxruntime==1.29.0', 'phonemizer==3.6.0', 'espeakng-loader==0.2.4', 'numpy==2.2.6', 'scipy==1.16.3']) {
    assert.ok(block.includes(pin), pin);
  }
  assert.ok(block.includes('--fetch-model /opt/kokoro-v1.0') && block.includes('BDA_TTS_V2_MODEL_DIR=/opt/kokoro-v1.0'));
  assert.ok(block.includes('org.opencontainers.image.revision') && block.includes('USER bda'));
});
