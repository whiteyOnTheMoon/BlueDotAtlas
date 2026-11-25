#!/usr/bin/env node
// 048 Script V2: stage the operator-approved V2 clips into the PROJECT-LOCAL,
// git-/docker-ignored private stage (.private-046/stage/pilot/.private-v2/).
// Downloads only the exact official URLs from assets/pilot/rights-manifest-v2.json,
// verifies byte size and SHA-256, never overwrites, never publishes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync,
  realpathSync, renameSync, rmSync, writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
export const ALLOWED_HOSTS = Object.freeze(['svs.gsfc.nasa.gov', 'satlib.cira.colostate.edu']);
const MAX_BYTES = 400 * 1024 * 1024;

export function loadManifest(path = join(repo, 'assets/pilot/rights-manifest-v2.json')) {
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  assert.equal(manifest.publication_authorized, false);
  return manifest;
}

/** Only approved, private-test, audio-free assets from allow-listed https hosts. */
export function stagePlan(manifest) {
  return manifest.assets.map((asset) => {
    assert.equal(asset.rights_status, 'APPROVED', `${asset.asset_id} not approved`);
    assert.equal(asset.approval_scope, 'PRIVATE_INTERNAL_TEST_ONLY');
    assert.equal(asset.source_audio_allowed, false);
    assert.equal(asset.technical.audio_streams, 0);
    assert.match(asset.asset_id, /^V2-VID-[A-Z0-9-]+$/);
    assert.match(asset.technical.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(asset.technical.bytes) && asset.technical.bytes > 0 &&
      asset.technical.bytes <= MAX_BYTES);
    const url = new URL(asset.download_url.replace(/^http:\/\//, 'https://'));
    assert.equal(url.protocol, 'https:');
    assert.ok(ALLOWED_HOSTS.includes(url.hostname), `${url.hostname} not allow-listed`);
    return { id: asset.asset_id, url: url.href, bytes: asset.technical.bytes, sha256: asset.technical.sha256 };
  });
}

function privateDirectory(path) {
  const stat = lstatSync(path);
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), path + ' must be a directory');
  assert.equal(stat.mode & 0o077, 0, path + ' must be 0700');
  assert.equal(realpathSync(path), path);
}

/** Download with a hard size cap; returns the buffer. */
export async function download(url, maxBytes, fetchImpl = fetch) {
  const response = await fetchImpl(url, { redirect: 'error' });
  assert.equal(response.status, 200, `download failed ${response.status}`);
  const chunks = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.byteLength;
    assert.ok(total <= maxBytes, 'download larger than manifest size');
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function stage({ root = repo, manifest = loadManifest(), fetchImpl = fetch } = {}) {
  const privateRoot = resolve(root, '.private-046');
  const stageRoot = join(privateRoot, 'stage');
  privateDirectory(privateRoot);
  privateDirectory(stageRoot);
  const target = join(stageRoot, 'pilot', '.private-v2');
  assert.ok(!existsSync(target), 'V2 stage exists; refusing to overwrite');
  mkdirSync(join(stageRoot, 'pilot'), { recursive: true, mode: 0o700 });
  const temp = mkdtempSync(join(stageRoot, 'pilot', '.v2-tmp-'));
  try {
    chmodSync(temp, 0o700);
    for (const item of stagePlan(manifest)) {
      const bytes = await download(item.url, item.bytes, fetchImpl);
      assert.equal(bytes.byteLength, item.bytes, `${item.id} size mismatch`);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, `${item.id} SHA-256 mismatch`);
      writeFileSync(join(temp, item.id + '.mp4'), bytes, { mode: 0o600, flag: 'wx' });
      console.log('048 V2 STAGED + SHA VERIFIED:', item.id);
    }
    renameSync(temp, target);
  } finally {
    if (existsSync(temp)) rmSync(temp, { recursive: true, force: true });
  }
  console.log('048 V2 PRIVATE MEDIA STAGE: PASS (' + manifest.assets.length + ' clips; private test only; not published)');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  try {
    assert.ok(process.argv.length === 3 && ['--check', '--stage'].includes(mode), 'use --check or --stage');
    const plan = stagePlan(loadManifest());
    if (mode === '--check') {
      for (const item of plan) console.log('048 V2 PLAN:', item.id, item.bytes, 'bytes', item.url);
      console.log('048 V2 STAGE CHECK PASS: no downloads, no writes');
    } else {
      assert.equal(process.env.BDA_PILOT_V2_STAGE, 'TRUE', 'explicit BDA_PILOT_V2_STAGE=TRUE required');
      await stage();
    }
  } catch (error) {
    console.error('048 V2 STAGE NO-GO: ' + String(error?.message ?? error).slice(0, 300));
    process.exitCode = 1;
  }
}
