#!/usr/bin/env node
// Roadmap 036: fail-closed local metadata guard; never fetches or renders external media.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const manifestPath = fileURLToPath(new URL('../assets/pilot/rights-manifest.json', import.meta.url));
const allowed = new Set(['UNREVIEWED', 'APPROVED', 'BLOCKED', 'REJECTED']);
const sha256Pattern = /^[a-f0-9]{64}$/;

function officialOrigin(value, name) {
  assert.equal(typeof value, 'string', name + ': missing URL');
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', name + ': HTTPS required');
  assert.ok(url.hostname === 'nasa.gov' || url.hostname.endsWith('.nasa.gov') ||
    url.hostname === 'noaa.gov' || url.hostname.endsWith('.noaa.gov'),
    name + ': not a NASA/NOAA original page');
  return url;
}

function validate(data) {
  assert.equal(data.schema_version, 1);
  assert.equal(data.roadmap_id, '036');
  assert.equal(data.github_issue, 60);
  assert.equal(data.local_media_acquired, false, 'Actual media not yet acquired');
  assert.ok(Array.isArray(data.assets));
  const primary = data.assets.filter(x => x.type === 'video' && x.priority === 'primary');
  assert.equal(primary.length, 3, 'Exactly three distinct original video candidates');
  assert.equal(data.third_party_video_count, 3);
  assert.equal(new Set(primary.map(x => x.source_page_url)).size, 3,
    'Three independent original source pages required');
  assert.equal(new Set(primary.map(x => x.origin_category)).size, 3,
    'Three different observation types required');
  const ids = new Set();
  for (const asset of data.assets) {
    const prefix = asset.asset_id + ': ';
    assert.match(asset.asset_id, /^P60-VID-(?:00[1-9]|ALT-00[1-9])$/);
    assert.ok(!ids.has(asset.asset_id), prefix + 'duplicate ID');
    ids.add(asset.asset_id);
    officialOrigin(asset.source_page_url, prefix);
    assert.equal(asset.type, 'video');
    assert.ok(allowed.has(asset.rights_status), prefix + 'unknown rights status');
    assert.ok(asset.title?.length >= 12);
    assert.ok(asset.creator?.length >= 12);
    assert.ok(asset.rights_basis?.length >= 20);
    assert.ok(asset.credits?.length >= 20);
    assert.ok(asset.rights_blocker?.length >= 20);
    assert.ok(Array.isArray(asset.conditions) && asset.conditions.length > 0);
    assert.ok(Array.isArray(asset.rights_evidence_urls) && asset.rights_evidence_urls.length > 0);
    for (const evidence of asset.rights_evidence_urls) {
      const source = new URL(evidence);
      assert.equal(source.protocol, 'https:', prefix + 'rights evidence must use HTTPS');
      assert.ok(
        source.hostname.endsWith('.nasa.gov') ||
        source.hostname.endsWith('.noaa.gov') ||
        source.hostname === 'www.bom.gov.au',
        prefix + 'rights evidence must be authoritative NOAA, NASA or Australian BOM'
      );
    }
    assert.match(asset.checked_source_date_utc, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(asset.local_file, null, prefix + 'no local media bytes in git');
    if (asset.download_url !== null) {
      const videoUrl = new URL(asset.download_url);
      assert.equal(videoUrl.protocol, 'https:', prefix + 'HTTPS download required');
      assert.equal(videoUrl.username, '', prefix + 'credentials forbidden');
      assert.equal(videoUrl.password, '', prefix + 'credentials forbidden');
      assert.match(videoUrl.pathname.toLowerCase(), /\.mp4$/, prefix + 'MP4 download expected');
      assert.ok(videoUrl.hostname.endsWith('.noaa.gov') ||
        videoUrl.hostname === 'nesdis-prod.s3.amazonaws.com',
        prefix + 'only exact original official NOAA download host allowed');
    }
    // Fail closed: no source may enter the timeline just because a webpage exists.
    if (asset.rights_status !== 'APPROVED') {
      assert.equal(asset.approved_for_timeline, false, prefix + 'unreviewed/blocked asset selected');
      assert.equal(asset.file_sha256, null, prefix + 'no fabricated file checksum');
      assert.equal(asset.file_media_probe, null, prefix + 'no fabricated ffprobe');
      assert.equal(asset.file_reviewed_at_utc, null);
      assert.equal(asset.file_reviewer, null);
    } else {
      assert.equal(asset.approved_for_timeline, true, prefix + 'approved must be marked selected');
      assert.match(asset.file_sha256 || '', sha256Pattern, prefix + 'missing exact file hash');
      assert.ok(asset.file_media_probe?.codec_name?.length, prefix + 'missing video probe');
      assert.ok(asset.file_reviewer?.length >= 3, prefix + 'missing human reviewer');
      assert.match(asset.file_reviewed_at_utc || '', /^\d{4}-\d{2}-\d{2}$/, prefix + 'missing review date');
    }
  }
  assert.equal(data.assets.filter(a=>a.rights_status === 'APPROVED').length, 0,
    '036 pre-acquisition catalog is not a fabricated approval');
  assert.ok(data.assets.some(a=>a.priority === 'excluded_alternative' && a.rights_status === 'BLOCKED'),
    'Third-party Saildrone alternative must remain blocked');
}

function expectRejected(base, mutation, label) {
  const copy = structuredClone(base);
  mutation(copy);
  assert.throws(() => validate(copy), undefined, label);
}

const data = JSON.parse(readFileSync(manifestPath, 'utf8'));
validate(data);
if (process.argv.includes('--self-test')) {
  const primary = d => d.assets.find(x=>x.asset_id==='P60-VID-001');
  expectRejected(data, d=>{primary(d).approved_for_timeline = true}, 'unreviewed to timeline');
  expectRejected(data, d=>{primary(d).rights_status = 'APPROVED';primary(d).approved_for_timeline=true},
    'approve without hash, probe and human reviewer');
  expectRejected(data, d=>{d.assets[3].rights_status='APPROVED';d.assets[3].approved_for_timeline=true},
    'blocked Saildrone may not be auto-approved');
  expectRejected(data, d=>{d.assets[0].credits=''}, 'missing credits');
  expectRejected(data, d=>{d.assets[0].rights_evidence_urls=[]}, 'missing license evidence');
  expectRejected(data, d=>{d.assets[0].source_page_url='https://unsplash.com/example'}, 'not original source');
  expectRejected(data, d=>{d.assets[1].source_page_url=d.assets[0].source_page_url}, 'duplicate source');
  expectRejected(data, d=>{d.assets[1].download_url='http://example.com/video.mp4'}, 'unsafe download URL');
  expectRejected(data, d=>{d.assets[2].file_sha256='0'.repeat(64)}, 'unverified hash');
  expectRejected(data, d=>{d.assets.splice(0,1)}, 'fewer than three primary videos');
  console.log('PASS 036: source manifest + 10 negative rights/metadata guards');
} else {
  console.log('PASS 036: three real video source records; zero timeline-approved files; Saildrone blocked');
}
