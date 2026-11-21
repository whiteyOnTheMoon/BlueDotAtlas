import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync,
  readFileSync, realpathSync, renameSync, rmSync, statSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(
  readFileSync(join(repo, 'assets/pilot/rights-manifest.json'), 'utf8'),
);
const ids = ['P60-VID-001', 'P60-VID-003', 'P60-VID-005'];
const source = resolve(homedir(), '.bda-pilot-originals');
const target = resolve(homedir(), '.bda-pilot-stage-046');

/** @param {string} path */
function regularPrivateFile(path) {
  const file = lstatSync(path);
  assert.ok(file.isFile() && !file.isSymbolicLink(), '046 input must be a regular file');
  assert.equal(file.uid, process.getuid(), '046 input must be operator-owned');
  assert.equal(file.mode & 0o077, 0, '046 private input cannot be world/group readable');
  return file;
}

/** @param {string} path */
function privateDirectory(path) {
  const stat = lstatSync(path);
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink());
  assert.equal(stat.uid, process.getuid());
  assert.equal(stat.mode & 0o077, 0);
  assert.equal(realpathSync(path), path);
}

/** @param {string} file */
function sha256(file) {
  const hash = createHash('sha256');
  hash.update(readFileSync(file));
  return hash.digest('hex');
}

/** @param {string} id */
function verifiedOriginal(id) {
  const asset = manifest.assets.find((item) => item.asset_id === id);
  assert.ok(asset, '046 unknown media source');
  assert.equal(asset.rights_status, 'APPROVED');
  assert.equal(asset.approval_scope, 'PRIVATE_INTERNAL_TEST_ONLY');
  assert.equal(asset.source_audio_allowed, false);
  assert.equal(asset.approved_for_timeline, false);
  assert.equal(asset.internal_test_source_approved, true);
  const original = join(source, id + '.mp4');
  const stat = regularPrivateFile(original);
  assert.equal(stat.size, asset.technical_original_bytes, '046 original size mismatch');
  assert.equal(sha256(original), asset.technical_original_sha256, '046 original SHA mismatch');
  return original;
}

function run() {
  if (process.argv.length !== 3 || process.argv[2] !== '--stage' ||
      process.env.BDA_PILOT_046_PRIVATE_STAGE !== 'TRUE') {
    throw new Error('046 requires --stage and explicit BDA_PILOT_046_PRIVATE_STAGE=TRUE');
  }
  privateDirectory(source);
  assert.ok(!existsSync(target), '046 private staging directory exists; do not overwrite');
  const originals = new Map(ids.map((id) => [id, verifiedOriginal(id)]));
  assert.equal(originals.size, 3);
  const temp = mkdtempSync(resolve(homedir(), '.bda-pilot-stage-046-tmp-'));
  try {
    chmodSync(temp, 0o700);
    const mediaDir = join(temp, 'pilot/.private-046');
    const brandDir = join(temp, 'brand/motion/final');
    mkdirSync(mediaDir, { recursive: true, mode: 0o700 });
    mkdirSync(brandDir, { recursive: true, mode: 0o700 });
    for (const id of ids) {
      const dst = join(mediaDir, id + '.mp4');
      copyFileSync(originals.get(id), dst);
      chmodSync(dst, 0o600);
      assert.equal(sha256(dst), manifest.assets.find((item) => item.asset_id === id).technical_original_sha256);
      console.log('046 STAGED ORIGINAL VERIFIED:', id);
    }
    for (const name of ['BlueDotAtlas Intro.mp4', 'BlueDotAtlas_Outro.mp4']) {
      const original = join(repo, 'assets/brand/motion/final', name);
      const dest = join(brandDir, basename(name));
      const stat = lstatSync(original);
      assert.ok(stat.isFile() && !stat.isSymbolicLink(), '046 original brand media unavailable');
      copyFileSync(original, dest);
      chmodSync(dest, 0o600);
      assert.equal(sha256(dest), sha256(original));
    }
    renameSync(temp, target);
  } finally {
    if (existsSync(temp)) rmSync(temp, { recursive: true, force: true });
  }
  console.log('046 PRIVATE MEDIA STAGE: PASS (3 original videos; brand intro/outro; not published)');
}

run();
