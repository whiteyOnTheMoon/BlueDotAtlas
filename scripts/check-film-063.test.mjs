// Roadmap 063: candidate staging plan, streamed download with cap and runner boundary (no network, no media).
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { downloadTo, loadCandidates, stage, stagePlan } from './stage-film-063.mjs';

test('063 candidates: private review scope, unique ids, only NASA SVS https mp4', () => {
  const doc = loadCandidates();
  assert.equal(doc.publication_authorized, false);
  const plan = stagePlan(doc);
  assert.equal(plan.length, 11);
  for (const item of plan) assert.match(item.url, /^https:\/\/svs\.gsfc\.nasa\.gov\/vis\/.+\.mp4$/);
  const bad = { ...doc, candidates: [{ id: 'K99-EVIL', url: 'https://example.com/x.mp4' }] };
  assert.throws(() => stagePlan(bad), /not allow-listed/);
  assert.throws(() => stagePlan({ ...doc, candidates: [doc.candidates[0], doc.candidates[0]] }), /duplicate/);
});

const body = (...chunks) => (async function* () { for (const c of chunks) yield c; })();

test('063 download streams to disk with a hard cap and records failures without stopping', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'c063-'));
  try {
    const pin = await downloadTo('https://svs.gsfc.nasa.gov/x.mp4', join(dir, 'a.mp4'), 100, async () => ({ status: 200, body: body(Buffer.from('abc'), Buffer.from('def')) }));
    assert.deepEqual(pin, { bytes: 6, sha256: 'bef57ec7f53a6d40beb640a780a639c83bc29ac8a9816f1fc6c5c6dcd93c4721' });
    await assert.rejects(downloadTo('https://svs.gsfc.nasa.gov/y.mp4', join(dir, 'b.mp4'), 4, async () => ({ status: 200, body: body(Buffer.alloc(8)) })), /size cap/);
    await assert.rejects(downloadTo('https://svs.gsfc.nasa.gov/z.mp4', join(dir, 'c.mp4'), 4, async () => ({ status: 403, body: null })), /HTTP 403/);

    const root = join(dir, 'proj');
    mkdirSync(join(root, '.private-046', 'stage'), { recursive: true, mode: 0o700 });
    const doc = loadCandidates();
    doc.candidates = doc.candidates.slice(0, 2);
    let n = 0;
    const pins = await stage({ root, doc, fetchImpl: async () => (++n === 1 ? { status: 403, body: null } : { status: 200, body: body(Buffer.from('mp4')) }) });
    assert.deepEqual(pins.map((p) => p.status), ['failed', 'staged']);
    const saved = JSON.parse(readFileSync(join(root, '.private-046/stage/film/.candidates-063/pins.json'), 'utf8'));
    assert.equal(saved.pins[0].reason, 'HTTP 403');
    await assert.rejects(stage({ root, doc, fetchImpl: async () => ({ status: 200, body: body(Buffer.from('x')) }) }), /refusing to overwrite/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('063 VPS runner stays private, offline for review and never overwrites', () => {
  const sh = readFileSync(new URL('./run-film-063-candidates.sh', import.meta.url), 'utf8');
  for (const needle of ['test "$root" = "$HOME/www/blueDotAtlas"', 'git check-ignore -q "$private_root/stage"', 'BDA_FILM_063_STAGE=TRUE',
    'refuse overwrite', '--network none', '--read-only', '--cap-drop ALL', '--memory 512m', 'org.opencontainers.image.revision']) {
    assert.ok(sh.includes(needle), 'runner lost: ' + needle);
  }
  assert.ok(!/docker (system|image|container) prune|compose |rm -rf/.test(sh));
});
