// Private 046 still-only VPS proof: read-only preflight, never a full film render.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync, statfsSync, statSync } from 'node:fs';
import { cpus, homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PILOT_PRIVATE_046,
  PILOT_PRIVATE_046_SHOTS,
  PRIVATE_046_MEDIA,
  PRIVATE_046_HELENE_HD_PROXY,
  PRIVATE_046_MAX_REFERENCE_WIDTH,
  PRIVATE_046_MAX_REFERENCE_HEIGHT,
  validatePilotPrivate046,
} from '../packages/video/src/compositions/pilot-private-046-plan.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const stage = resolve(homedir(), '.bda-pilot-stage-046');
const manifest = JSON.parse(readFileSync(join(root, 'assets/pilot/rights-manifest.json'), 'utf8'));

export const PRIVATE_STILLS_046 = Object.freeze([
  Object.freeze({ shot: 'S00', frame: 30, name: '046-S00-intro.png' }),
  Object.freeze({ shot: 'S01', frame: 160, name: '046-S01-oma.png' }),
  Object.freeze({ shot: 'S02', frame: 380, name: '046-S02-waves.png' }),
  Object.freeze({ shot: 'S04', frame: 850, name: '046-S04-science.png' }),
  Object.freeze({ shot: 'S06', frame: 1330, name: '046-S06-helene.png' }),
  Object.freeze({ shot: 'S08', frame: 1710, name: '046-S08-outro.png' }),
]);

export function validateHdReferencePolicy() {
  assert.equal(PRIVATE_046_MAX_REFERENCE_WIDTH, 1920);
  assert.equal(PRIVATE_046_MAX_REFERENCE_HEIGHT, 1080);
  for (const id of ['P60-VID-001', 'P60-VID-003', 'P60-VID-005']) {
    const asset = manifest.assets.find((x) => x.asset_id === id);
    assert.ok(asset && asset.technical_original_media_probe, 'missing private source probe');
    const { width, height } = asset.technical_original_media_probe;
    assert.ok(Number.isInteger(width) && Number.isInteger(height));
    if (width > PRIVATE_046_MAX_REFERENCE_WIDTH || height > PRIVATE_046_MAX_REFERENCE_HEIGHT) {
      assert.equal(id, PRIVATE_046_HELENE_HD_PROXY.assetId, 'new over-HD source needs a separately approved proxy');
      assert.equal(PRIVATE_046_MEDIA[id], PRIVATE_046_HELENE_HD_PROXY.path);
    } else {
      assert.equal(PRIVATE_046_MEDIA[id], 'pilot/.private-046/' + id + '.mp4');
    }
  }
  return true;
}

export function validatePreviewFrames() {
  assert.equal(validatePilotPrivate046(), true);
  assert.equal(validateHdReferencePolicy(), true);
  assert.equal(PILOT_PRIVATE_046.frames, 1800);
  assert.equal(PILOT_PRIVATE_046.narrationIncluded, true);
  assert.equal(PILOT_PRIVATE_046.renderAuthorized, false);
  assert.equal(PILOT_PRIVATE_046.publicationAuthorized, false);
  assert.equal(new Set(PRIVATE_STILLS_046.map((x) => x.shot)).size, PRIVATE_STILLS_046.length);
  for (const entry of PRIVATE_STILLS_046) {
    const shot = PILOT_PRIVATE_046_SHOTS.find((x) => x.id === entry.shot);
    assert.ok(shot, 'unknown private shot');
    assert.ok(entry.frame >= shot.from && entry.frame < shot.from + shot.durationInFrames);
    assert.match(entry.name, /^046-S0[0-8]-[a-z]+\.png$/);
  }
  return true;
}

export function validateHostBudget(memMiB, freeDiskGiB, cpuCount) {
  assert.ok(Number.isFinite(memMiB) && memMiB >= 2048,
    'Private review NO-GO: less than 2 GiB MemAvailable');
  assert.ok(Number.isFinite(freeDiskGiB) && freeDiskGiB >= 12,
    'Private review NO-GO: less than 12 GiB free disk');
  assert.ok(Number.isInteger(cpuCount) && cpuCount >= 2,
    'Private review NO-GO: host CPU evidence missing');
  return true;
}

function privateDir(file) {
  const stat = lstatSync(file);
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink() &&
    stat.uid === process.getuid() && !(stat.mode & 0o077) &&
    realpathSync(file) === file, 'private media directory unsafe');
}
function privateFile(file, min, max) {
  const stat = lstatSync(file);
  assert.ok(stat.isFile() && !stat.isSymbolicLink() &&
    stat.uid === process.getuid() && !(stat.mode & 0o077) &&
    stat.size >= min && stat.size <= max, 'private media file unsafe');
  return readFileSync(file);
}
const sha = (raw) => createHash('sha256').update(raw).digest('hex');

function validateVoice(raw) {
  const rate = 48000;
  const dataBytes = 60 * rate * 4;
  assert.equal(raw.length, 44 + dataBytes, 'aligned WAV size invalid');
  assert.equal(raw.toString('ascii', 0, 4), 'RIFF');
  assert.equal(raw.toString('ascii', 8, 12), 'WAVE');
  assert.equal(raw.toString('ascii', 12, 16), 'fmt ');
  assert.equal(raw.readUInt16LE(20), 1, 'not PCM');
  assert.equal(raw.readUInt16LE(22), 2, 'not stereo');
  assert.equal(raw.readUInt32LE(24), rate, 'not 48kHz');
  assert.equal(raw.readUInt16LE(34), 16, 'not 16-bit');
  assert.equal(raw.toString('ascii', 36, 40), 'data');
  assert.equal(raw.readUInt32LE(40), dataBytes, 'WAV data size invalid');
  assert.ok(!raw.subarray(44, 44 + 75 * 1600 * 4).some((x) => x !== 0),
    'speaker audio intrudes into brand intro');
  assert.ok(!raw.subarray(44 + 1620 * 1600 * 4).some((x) => x !== 0),
    'speaker audio intrudes into brand outro');
}

export function validatePrivateHdEvidence(evidence, actualSha, originalSha) {
  assert.equal(evidence.schema, 1);
  assert.equal(evidence.assetId, PRIVATE_046_HELENE_HD_PROXY.assetId);
  assert.equal(evidence.originalSha256, originalSha);
  assert.match(actualSha, /^[0-9a-f]{64}$/);
  assert.equal(evidence.proxySha256, actualSha);
  assert.equal(evidence.codec, 'h264');
  assert.equal(evidence.width, 1920);
  assert.equal(evidence.height, 1080);
  assert.equal(evidence.pixFmt, 'yuv420p');
  assert.equal(evidence.videoStreams, 1);
  assert.equal(evidence.audioStreams, 0);
  assert.ok(Number.isFinite(evidence.durationSeconds) &&
    evidence.durationSeconds >= 34 && evidence.durationSeconds <= 36);
  return true;
}

export function readOnlyPreflight({ requireHdProxy = true } = {}) {
  validatePreviewFrames();
  const memText = readFileSync('/proc/meminfo', 'utf8');
  const memKiB = Number(memText.match(/^MemAvailable:\s+(\d+)\s+kB/m)?.[1]);
  const freeDiskGiB = statfsSync(stage).bavail * statfsSync(stage).bsize / 1024 ** 3;
  validateHostBudget(memKiB / 1024, freeDiskGiB, cpus().length);
  assert.equal(process.getuid(), 1000, 'operator UID differs from isolated container UID');

  privateDir(stage);
  for (const folder of ['pilot', 'pilot/.private-046', 'brand', 'brand/motion',
    'brand/motion/final', 'audio']) privateDir(join(stage, folder));

  for (const id of ['P60-VID-001', 'P60-VID-003', 'P60-VID-005']) {
    const asset = manifest.assets.find((x) => x.asset_id === id);
    assert.ok(asset && asset.rights_status === 'APPROVED' &&
      asset.approval_scope === 'PRIVATE_INTERNAL_TEST_ONLY' &&
      asset.internal_test_source_approved === true &&
      asset.source_audio_allowed === false &&
      asset.approved_for_timeline === false, 'private source rights gate changed');
    const raw = privateFile(join(stage, 'pilot/.private-046', id + '.mp4'),
      asset.technical_original_bytes, asset.technical_original_bytes);
    assert.equal(sha(raw), asset.technical_original_sha256, 'original source SHA changed');
  }
  for (const brand of ['BlueDotAtlas Intro.mp4', 'BlueDotAtlas_Outro.mp4']) {
    const from = join(root, 'assets/brand/motion/final', brand);
    const actual = privateFile(join(stage, 'brand/motion/final', brand), 1000, 20_000_000);
    assert.equal(sha(actual), sha(readFileSync(from)), 'brand MP4 changed');
  }
  validateVoice(privateFile(join(stage, 'audio/pilot-narration-aligned.wav'),
    11_520_044, 11_520_044));
  if (requireHdProxy) {
    const hd = PRIVATE_046_HELENE_HD_PROXY;
    privateDir(join(stage, 'pilot/.private-046/hd-proxy-046'));
    const raw = privateFile(join(stage, hd.path), 100_000, 268_435_456);
    const evidence = JSON.parse(privateFile(join(stage, hd.evidencePath), 100, 4096).toString('utf8'));
    const source = manifest.assets.find((x) => x.asset_id === hd.assetId);
    assert.ok(source && source.approval_scope === 'PRIVATE_INTERNAL_TEST_ONLY');
    validatePrivateHdEvidence(evidence, sha(raw), source.technical_original_sha256);
    console.log('046 PRIVATE HD PROXY PASS: 1920x1080, muted, source/derived SHA validated');
  }
  console.log('046 PRIVATE STILL PREFLIGHT PASS: 3 original videos + 2 brand clips + aligned voice');
  console.log('046 HOST GATE PASS: MemAvailable >= 2 GiB; free disk >= 12 GiB');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const mode = process.argv.slice(2);
    assert.ok(mode.length === 1 && ['--check', '--check-originals'].includes(mode[0]),
      'Only --check or --check-originals permitted');
    readOnlyPreflight({ requireHdProxy: mode[0] === '--check' });
  } catch (error) {
    console.error('046 PRIVATE STILL NO-GO: ' + String(error).slice(0, 200));
    process.exitCode = 1;
  }
}
