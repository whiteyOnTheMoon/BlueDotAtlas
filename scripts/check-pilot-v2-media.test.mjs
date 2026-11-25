import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { ALLOWED_HOSTS, loadManifest, stage, stagePlan } from './stage-pilot-v2-media.mjs';

const roots = [];
after(() => roots.forEach((r) => rmSync(r, { recursive: true, force: true })));
function projectRoot() {
  const root = mkdtempSync(join(tmpdir(), 'bda-v2-stage-'));
  roots.push(root);
  mkdirSync(join(root, '.private-046', 'stage'), { recursive: true, mode: 0o700 });
  return root;
}
const fake = (bytes) => ({
  publication_authorized: false,
  assets: [{
    asset_id: 'V2-VID-TEST', rights_status: 'APPROVED', approval_scope: 'PRIVATE_INTERNAL_TEST_ONLY',
    source_audio_allowed: false, download_url: 'https://svs.gsfc.nasa.gov/vis/test.mp4',
    technical: { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), audio_streams: 0 },
  }],
});
const fetchOf = (bytes) => async () => ({ status: 200, body: [bytes] });

test('V2 manifest plan: all three clips approved for private test, allow-listed https hosts only', () => {
  const plan = stagePlan(loadManifest());
  assert.equal(plan.length, 3);
  for (const item of plan) assert.ok(ALLOWED_HOSTS.includes(new URL(item.url).hostname));
});

test('V2 stage writes 0600 files inside .private-046/stage/pilot/.private-v2 after SHA check', async () => {
  const root = projectRoot();
  const bytes = Buffer.from('synthetic clip bytes');
  await stage({ root, manifest: fake(bytes), fetchImpl: fetchOf(bytes) });
  const file = join(root, '.private-046/stage/pilot/.private-v2/V2-VID-TEST.mp4');
  assert.deepEqual(readFileSync(file), bytes);
  assert.equal(statSync(file).mode & 0o777, 0o600);
  await assert.rejects(stage({ root, manifest: fake(bytes), fetchImpl: fetchOf(bytes) }), /refusing to overwrite/);
});

test('V2 stage refuses tampered downloads, oversize bodies, foreign hosts and unapproved assets', async () => {
  const good = Buffer.from('original');
  await assert.rejects(stage({ root: projectRoot(), manifest: fake(good), fetchImpl: fetchOf(Buffer.from('tampered')) }), /SHA-256 mismatch/);
  await assert.rejects(stage({ root: projectRoot(), manifest: fake(good), fetchImpl: fetchOf(Buffer.from('original+extra')) }), /larger than manifest/);
  const foreign = fake(good); foreign.assets[0].download_url = 'https://evil.example/x.mp4';
  assert.throws(() => stagePlan(foreign), /not allow-listed/);
  const unapproved = fake(good); unapproved.assets[0].rights_status = 'UNREVIEWED';
  assert.throws(() => stagePlan(unapproved), /not approved/);
  const root = projectRoot();
  await assert.rejects(stage({ root, manifest: fake(good), fetchImpl: fetchOf(Buffer.from('tampered')) }));
  assert.equal(existsSync(join(root, '.private-046/stage/pilot/.private-v2')), false, 'no partial stage left behind');
});
