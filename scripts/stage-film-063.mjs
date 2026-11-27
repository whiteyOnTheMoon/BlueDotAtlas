#!/usr/bin/env node
// Roadmap 063: stage the 9-minute film's media CANDIDATES privately for owner
// viewing (the NASA SVS media folder is currently forbidden for the owner's
// browser and the cloud sandbox). Downloads only the allow-listed https URLs
// from assets/film/hurricanes-9min-candidates.json, streams each to disk with
// a hard size cap, pins SHA-256 + size on first fetch (trust on first use),
// never overwrites, never publishes. Target (git-/docker-ignored, 0700):
//   .private-046/stage/film/.candidates-063/
// Usage:
//   node scripts/stage-film-063.mjs --check                      (plan only, no network)
//   BDA_FILM_063_STAGE=TRUE node scripts/stage-film-063.mjs --stage
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createWriteStream, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
export const ALLOWED_HOSTS = Object.freeze(['svs.gsfc.nasa.gov']);
export const MAX_BYTES = 700 * 1024 * 1024;

export function loadCandidates(path = join(repo, 'assets/film/hurricanes-9min-candidates.json')) {
  const doc = JSON.parse(readFileSync(path, 'utf8'));
  assert.equal(doc.publication_authorized, false);
  assert.equal(doc.approval_scope, 'PRIVATE_CANDIDATE_REVIEW_ONLY');
  return doc;
}

export function stagePlan(doc) {
  const ids = new Set();
  return doc.candidates.map((c) => {
    assert.match(c.id, /^K\d{1,2}-[A-Z0-9-]+$/, 'bad id ' + c.id);
    assert.ok(!ids.has(c.id), 'duplicate id ' + c.id);
    ids.add(c.id);
    const url = new URL(c.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(ALLOWED_HOSTS.includes(url.hostname), `${url.hostname} not allow-listed`);
    assert.ok(url.pathname.endsWith('.mp4'), 'only mp4 files');
    return { id: c.id, url: url.href };
  });
}

function privateDirectory(path) {
  const stat = lstatSync(path);
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), path + ' must be a directory');
  assert.equal(stat.mode & 0o077, 0, path + ' must be 0700');
  assert.equal(realpathSync(path), path);
}

/** Stream one URL to a file with a hard byte cap; returns {bytes, sha256}. */
export async function downloadTo(url, file, maxBytes = MAX_BYTES, fetchImpl = fetch) {
  const response = await fetchImpl(url, { redirect: 'error' });
  assert.equal(response.status, 200, `HTTP ${response.status}`);
  const hash = createHash('sha256');
  const out = createWriteStream(file, { flags: 'wx', mode: 0o600 });
  let bytes = 0;
  try {
    for await (const chunk of response.body) {
      bytes += chunk.byteLength;
      assert.ok(bytes <= maxBytes, 'download exceeds the size cap');
      hash.update(chunk);
      if (!out.write(chunk)) await new Promise((r) => out.once('drain', r));
    }
  } finally {
    await new Promise((r) => out.end(r));
  }
  assert.ok(bytes > 0, 'empty download');
  return { bytes, sha256: hash.digest('hex') };
}

export async function stage({ root = repo, doc = loadCandidates(), fetchImpl = fetch } = {}) {
  const privateRoot = resolve(root, '.private-046');
  const stageRoot = join(privateRoot, 'stage');
  privateDirectory(privateRoot);
  privateDirectory(stageRoot);
  mkdirSync(join(stageRoot, 'film'), { recursive: true, mode: 0o700 });
  const target = join(stageRoot, 'film', '.candidates-063');
  assert.ok(!existsSync(target), 'candidate stage exists; refusing to overwrite');
  const temp = mkdtempSync(join(stageRoot, 'film', '.candidates-tmp-'));
  const pins = [];
  try {
    for (const item of stagePlan(doc)) {
      try {
        const pin = await downloadTo(item.url, join(temp, item.id + '.mp4'), MAX_BYTES, fetchImpl);
        pins.push({ id: item.id, url: item.url, status: 'staged', ...pin, fetchedAt: new Date().toISOString() });
        console.log(`063 CANDIDATE STAGED: ${item.id} ${pin.bytes} bytes sha256 ${pin.sha256}`);
      } catch (error) {
        rmSync(join(temp, item.id + '.mp4'), { force: true });
        pins.push({ id: item.id, url: item.url, status: 'failed', reason: String(error?.message ?? error).split('\n')[0].slice(0, 120) });
        console.log(`063 CANDIDATE FAILED: ${item.id} (${String(error?.message ?? error).split('\n')[0].slice(0, 80)})`);
      }
    }
    writeFileSync(join(temp, 'pins.json'), JSON.stringify({ roadmap: '063', approval_scope: 'PRIVATE_CANDIDATE_REVIEW_ONLY', pins }, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
    renameSync(temp, target);
  } finally {
    if (existsSync(temp)) rmSync(temp, { recursive: true, force: true });
  }
  const ok = pins.filter((p) => p.status === 'staged').length;
  console.log(`063 CANDIDATE STAGE: ${ok}/${pins.length} staged (private review only; not approved, not published)`);
  return pins;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  try {
    assert.ok(process.argv.length === 3 && ['--check', '--stage'].includes(mode), 'use --check or --stage');
    const plan = stagePlan(loadCandidates());
    if (mode === '--check') {
      for (const item of plan) console.log('063 PLAN:', item.id, item.url);
      console.log(`063 CANDIDATE CHECK PASS: ${plan.length} candidates; no downloads, no writes`);
    } else {
      assert.equal(process.env.BDA_FILM_063_STAGE, 'TRUE', 'explicit BDA_FILM_063_STAGE=TRUE required');
      await stage();
    }
  } catch (error) {
    console.error('063 CANDIDATE STAGE NO-GO: ' + String(error?.message ?? error).slice(0, 300));
    process.exitCode = 1;
  }
}
