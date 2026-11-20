#!/usr/bin/env node
// Roadmap 036: test-only source-rights gate. This does NOT grant publication,
// prove archived local bytes, or permit unverified originals in a timeline.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const manifestPath = fileURLToPath(new URL('../assets/pilot/rights-manifest.json', import.meta.url));
const known = new Map([
  ['P60-VID-001', {sha:'54ecdba5d5899fc7a2e8ee0f544359f59ddc45c13a26b919c3412b633416802c',
    bytes:27140201, run:'44673061410', width:1080, height:720, audio:false}],
  ['P60-VID-003', {sha:'8deebf2acf159ab91b3d9c6383de76bbbdb0069acffb9eb2f2c78dc478cd22c8',
    bytes:47866063, run:'44673061410', width:3840, height:2160, audio:true}],
  ['P60-VID-005', {sha:'e341bba65deafbf5857f7913af45cef74de2effe0e431323884e88f88574443b',
    bytes:5548939, run:'44707182588', width:1920, height:1080, audio:true}]
]);

function officialOrigin(value, name) {
  assert.equal(typeof value, 'string', name + ': missing original URL');
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', name + ': HTTPS required');
  assert.ok(url.hostname.endsWith('.nasa.gov') || url.hostname === 'nasa.gov' ||
    url.hostname.endsWith('.noaa.gov') || url.hostname === 'noaa.gov',
    name + ': only original NASA/NOAA video pages');
}

function validate(data) {
  assert.equal(data.schema_version, 1);
  assert.equal(data.roadmap_id, '036');
  assert.equal(data.github_issue, 60);
  assert.equal(data.local_media_acquired, false, 'No archived original or VPS media verified');
  assert.equal(data.internal_test_source_selection_accepted, true);
  assert.equal(data.publication_authorized, false, 'Not a public release grant');
  assert.match(data.decision_policy, /PRIVATE_INTERNAL_TEST_ONLY/,
    'Actual private-only license scope must be stated');
  assert.ok(Array.isArray(data.assets));
  const primary = data.assets.filter(a => a.type === 'video' && a.priority === 'primary');
  assert.equal(primary.length, 4, 'Keep all four real sourced video candidates');
  assert.equal(data.third_party_video_count, primary.length);
  assert.equal(new Set(primary.map(a=>a.source_page_url)).size, primary.length);
  assert.equal(new Set(primary.map(a=>a.origin_category)).size, primary.length);
  assert.ok(primary.some(a=>a.origin_category === 'actual_ocean_surface_camera'));
  const seen = new Set();
  for (const a of data.assets) {
    const prefix = a.asset_id + ': ';
    assert.match(a.asset_id, /^P60-VID-(?:00[1-9]|ALT-00[1-9])$/);
    assert.ok(!seen.has(a.asset_id), prefix + 'duplicate source ID');
    seen.add(a.asset_id);
    officialOrigin(a.source_page_url, prefix);
    assert.ok(a.title?.length >= 12);
    assert.ok(a.creator?.length >= 12);
    assert.ok(a.rights_basis?.length >= 20);
    assert.ok(a.credits?.length >= 20);
    assert.ok(a.rights_blocker?.length >= 20);
    assert.ok(Array.isArray(a.rights_evidence_urls) && a.rights_evidence_urls.length);
    for (const evidence of a.rights_evidence_urls) {
      const url = new URL(evidence);
      assert.equal(url.protocol, 'https:');
      assert.ok(url.hostname.endsWith('.nasa.gov') ||
        url.hostname.endsWith('.noaa.gov') || url.hostname === 'www.bom.gov.au',
        prefix + 'rights evidence must be authoritative');
    }
    assert.equal(a.local_file, null, prefix + 'No source-video binary in public Git');
    assert.equal(a.approved_for_timeline, false,
      prefix + 'No film timeline approval before private byte-verified ingest');
    assert.equal(a.file_sha256, null, prefix + 'No permanent local-file hash yet');
    assert.equal(a.file_media_probe, null, prefix + 'No permanent media probe yet');
    assert.equal(a.file_reviewer, null);
    assert.equal(a.file_reviewed_at_utc, null);
    if (a.download_url !== null) {
      const url = new URL(a.download_url);
      assert.equal(url.protocol, 'https:');
      assert.equal(url.username, '');
      assert.equal(url.password, '');
      assert.match(url.pathname.toLowerCase(), /\.mp4$/);
      assert.ok(url.hostname.endsWith('.nasa.gov') ||
        url.hostname.endsWith('.noaa.gov') || url.hostname === 'nesdis-prod.s3.amazonaws.com',
        prefix + 'only known official original host');
    }

    if (known.has(a.asset_id)) {
      const e = known.get(a.asset_id);
      assert.equal(a.rights_status, 'APPROVED',
        prefix + 'only source-specific private test permission is approved');
      assert.equal(a.internal_test_source_approved, true);
      assert.equal(a.approval_scope, 'PRIVATE_INTERNAL_TEST_ONLY');
      assert.equal(a.source_audio_allowed, false, prefix + 'source audio is always excluded');
      assert.equal(a.technical_original_sha256, e.sha,
        prefix + 'hash must match actual original CI download');
      assert.equal(a.technical_original_bytes, e.bytes);
      assert.equal(a.technical_proof_run,
        'https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/' + e.run);
      assert.equal(a.technical_original_media_probe?.codec_name, 'h264');
      assert.equal(a.technical_original_media_probe?.width, e.width);
      assert.equal(a.technical_original_media_probe?.height, e.height);
      assert.equal(a.technical_original_media_probe?.has_audio, e.audio);
      assert.equal(a.source_rights_reviewed_at_utc, '2026-11-20');
      assert.match(a.source_rights_reviewed_by || '', /operator/i);
      assert.match(a.user_visual_feedback || '', /NOT stated/,
        prefix + 'do not invent a complete visual/audio audit');
    } else {
      assert.ok(['P60-VID-002','P60-VID-ALT-004'].includes(a.asset_id));
      assert.equal(a.rights_status, a.asset_id === 'P60-VID-002' ? 'UNREVIEWED' : 'BLOCKED');
      assert.equal(a.internal_test_source_approved, false);
      assert.equal(a.approval_scope, null);
    }
  }
  assert.equal(known.size, data.assets.filter(a=>a.internal_test_source_approved).length);
  assert.equal(data.assets.filter(a=>a.rights_status === 'APPROVED').length, 3);
}

function denied(base, mutate, label) {
  const copy = structuredClone(base);
  mutate(copy);
  assert.throws(() => validate(copy), undefined, label);
}
const data = JSON.parse(readFileSync(manifestPath, 'utf8'));
validate(data);
if (process.argv.includes('--self-test')) {
  const a = (d,id='P60-VID-001')=>d.assets.find(x=>x.asset_id===id);
  denied(data,d=>{a(d).approved_for_timeline=true}, 'unstaged source cannot render');
  denied(data,d=>{d.publication_authorized=true}, 'internal approval is not publication');
  denied(data,d=>{a(d).approval_scope='PUBLIC'}, 'no public rights grant');
  denied(data,d=>{a(d).source_audio_allowed=true}, 'no source audio');
  denied(data,d=>{a(d).technical_original_sha256='0'.repeat(64)}, 'wrong original hash');
  denied(data,d=>{a(d).technical_original_bytes++}, 'wrong byte count');
  denied(data,d=>{a(d).file_sha256='0'.repeat(64)}, 'fabricated local file hash');
  denied(data,d=>{a(d,'P60-VID-002').rights_status='APPROVED'}, 'unverified Ernesto');
  denied(data,d=>{a(d,'P60-VID-ALT-004').rights_status='APPROVED'}, 'Saildrone');
  denied(data,d=>{a(d).credits=''}, 'lost NASA credit');
  denied(data,d=>{a(d).rights_evidence_urls=[]}, 'missing rights evidence');
  denied(data,d=>{a(d).source_page_url='https://example.com/a.mp4'}, 'third-party origin');
  denied(data,d=>{a(d,'P60-VID-003').source_page_url=a(d).source_page_url}, 'duplicated source');
  denied(data,d=>{d.local_media_acquired=true}, 'fabricated archived originals');
  console.log('PASS 036: exactly 3 private-test-only approved sources; 14 denied scope/rights/media bypasses');
} else {
  console.log('PASS 036: 3 private-test source rights approved, 0 staged timeline assets, publication denied');
}
