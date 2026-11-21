import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import {
  PRIVATE_STILLS_046, validateHdReferencePolicy, validateHostBudget,
  validatePrivateHdEvidence, validatePreviewFrames,
} from './check-pilot-preview-046.mjs';

test('046 private-still frame picks are fixed, within real 60s shot bounds', () => {
  assert.equal(validatePreviewFrames(), true);
  assert.equal(PRIVATE_STILLS_046.length, 6);
  assert.deepEqual(PRIVATE_STILLS_046.map((x) => x.frame),
    [30, 160, 380, 850, 1330, 1710]);
});
test('046 host preflight rejects insufficient memory, disk and CPU', () => {
  assert.equal(validateHostBudget(2048, 12, 4), true);
  for (const [mem, disk, cpu] of [[2047, 12, 4], [2048, 11.9, 4],
    [2048, 12, 1], [NaN, 12, 4]]) {
    assert.throws(() => validateHostBudget(mem, disk, cpu));
  }
});
test('046 operator-only stills runner cannot invoke a full film render or change existing service', () => {
  const shell = readFileSync(new URL('./run-pilot-stills-046.sh', import.meta.url), 'utf8');
  execFileSync('bash', ['-n', new URL('./run-pilot-stills-046.sh', import.meta.url).pathname]);
  const docker = readFileSync(new URL('../deploy/Dockerfile', import.meta.url), 'utf8');
  assert.match(shell, /BDA_PILOT_046_PRIVATE_STILLS/);
  assert.match(shell, /--network none/);
  assert.match(shell, /--memory 1024m/);
  assert.match(shell, /--cpus 0\.5/);
  assert.match(shell, /--read-only/);
  assert.match(shell, /--bundle-cache=false/);
  assert.match(shell, /--log=info/);
  assert.match(shell, /find "\$out" -mindepth 1 -maxdepth 1 -print -quit/);
  assert.match(shell, /046 NO-GO: Private review directory is not empty/);
  assert.match(shell, /--cap-drop ALL/);
  assert.match(shell, /still src\/entry-pilot-private-046\.tsx/);
  assert.doesNotMatch(shell, /--remove-orphans|docker compose|docker exec/);
  assert.match(docker, /FROM worker046 AS pilot046preview/);
  assert.match(docker, /apt-get install -y --no-install-recommends chromium/);
});


test('046 HD-only policy selects exactly one private proxy, not the 4K original', () => {
  assert.equal(validateHdReferencePolicy(), true);
  const sha = 'a'.repeat(64);
  const source = 'b'.repeat(64);
  const evidence = {
    schema: 1, assetId: 'P60-VID-003', originalSha256: source,
    proxySha256: sha, codec: 'h264', width: 1920, height: 1080,
    pixFmt: 'yuv420p', videoStreams: 1, audioStreams: 0, durationSeconds: 34.84,
  };
  assert.equal(validatePrivateHdEvidence(evidence, sha, source), true);
  for (const mutate of [
    (v) => { v.width = 3840; },
    (v) => { v.audioStreams = 1; },
    (v) => { v.originalSha256 = 'c'.repeat(64); },
    (v) => { v.proxySha256 = 'd'.repeat(64); },
    (v) => { v.durationSeconds = 12; },
    (v) => { v.codec = 'hevc'; },
  ]) {
    const copy = structuredClone(evidence);
    mutate(copy);
    assert.throws(() => validatePrivateHdEvidence(copy, sha, source));
  }
});
