#!/usr/bin/env node
// 036: Metadata-only guard for a future HUMAN media review. It cannot review pictures,
// listen to audio, grant rights, or approve a timeline.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../assets/pilot/', import.meta.url);
const packet = JSON.parse(readFileSync(fileURLToPath(new URL('manual-review-036.json', root)), 'utf8'));
const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('rights-manifest.json', root)), 'utf8'));

const evidence = new Map([
  ['P60-VID-001', {
    sha: '54ecdba5d5899fc7a2e8ee0f544359f59ddc45c13a26b919c3412b633416802c',
    size: 27140201, audio: false, run: '44673061410'
  }],
  ['P60-VID-003', {
    sha: '8deebf2acf159ab91b3d9c6383de76bbbdb0069acffb9eb2f2c78dc478cd22c8',
    size: 47866063, audio: true, run: '44673061410'
  }],
  ['P60-VID-005', {
    sha: 'e341bba65deafbf5857f7913af45cef74de2effe0e431323884e88f88574443b',
    size: 5548939, audio: true, run: '44707182588'
  }]
]);

const mustBeFalse = [
  'full_video_watched', 'full_audio_listened', 'persons_logos_reviewed',
  'embedded_third_party_content_reviewed', 'visual_quality_reviewed',
  'edit_context_reviewed', 'publisher_rights_checked', 'source_credit_checked',
  'timeline_approved'
];

function check(packetData, manifestData) {
  assert.equal(packetData.schema_version, 1);
  assert.equal(packetData.roadmap_id, '036');
  assert.equal(packetData.github_issue, 60);
  assert.equal(packetData.global_pilot_approved, false,
    'Pilot may not be approved by an unreviewed file evidence packet');
  assert.match(packetData.media_location, /NONE_ARCHIVED/,
    'Do not claim a private original file archive exists');
  assert.ok(Array.isArray(packetData.review_cases));
  assert.equal(packetData.review_cases.length, evidence.size,
    'Three technically proven original videos must be queued for full human review');
  const seen = new Set();
  for (const asset of packetData.review_cases) {
    assert.ok(evidence.has(asset.asset_id), 'Unknown or non-proven video asset');
    assert.ok(!seen.has(asset.asset_id), 'Duplicate human review record');
    seen.add(asset.asset_id);
    const technical = evidence.get(asset.asset_id);
    const source = manifestData.assets.find(a => a.asset_id === asset.asset_id);
    assert.ok(source, 'No matching original rights inventory record');
    assert.equal(source.rights_status, 'UNREVIEWED', 'Never relabel core source approved');
    assert.equal(source.approved_for_timeline, false);
    assert.equal(source.file_sha256, null, 'No permanent reviewed original file');
    assert.equal(asset.download_url, source.download_url, 'Original asset link changed');
    assert.equal(asset.source_page_url, source.source_page_url, 'Source page changed');
    assert.equal(asset.technical_original_sha256, technical.sha,
      'Original SHA differs from actual ephemeral GitHub proof');
    assert.equal(asset.technical_original_bytes, technical.size, 'Original byte count differs');
    assert.equal(asset.has_audio, technical.audio, 'Actual stream count/audio flag differs');
    assert.equal(asset.technical_proof_run,
      'https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/' + technical.run,
      'Source must link to actual checked CI evidence');

    assert.equal(asset.review_status, 'PENDING', 'Do not invent human-review approval');
    for (const field of mustBeFalse) {
      assert.equal(asset[field], false, asset.asset_id + ': not human-reviewed: ' + field);
    }
    for (const field of ['reviewed_by', 'reviewed_at_utc', 'review_notes',
      'selected_segment_in', 'selected_segment_out', 'rights_conclusion']) {
      assert.equal(asset[field], null, asset.asset_id + ': invented reviewer/evidence');
    }
    assert.equal(asset.source_audio_use, 'EXCLUDE_PENDING_CLEARANCE',
      'No unreviewed source soundtrack may be cleared for the pilot');
    assert.ok(asset.credit_proposal?.length >= 28, 'Missing exact proposed credit');
    assert.ok(Array.isArray(asset.review_questions) && asset.review_questions.length >= 3,
      'Real full-playback checklist is required');
  }
  assert.equal(seen.size, evidence.size);
  assert.equal(packetData.excluded_media.length, 2);
  for (const id of ['P60-VID-002', 'P60-VID-ALT-004']) {
    const x = packetData.excluded_media.find(e => e.asset_id === id);
    assert.ok(x && x.timeline_approved === false && x.reason?.length >= 24,
      id + ' must stay explicitly excluded');
  }
  const saildrone = manifestData.assets.find(a => a.asset_id === 'P60-VID-ALT-004');
  assert.equal(saildrone?.rights_status, 'BLOCKED',
    'Third-party Saildrone original still blocked');
}

function mustFail(mutate, label) {
  const clone = structuredClone(packet);
  mutate(clone);
  assert.throws(() => check(clone, manifest), undefined, label);
}

check(packet, manifest);
if (process.argv.includes('--self-test')) {
  mustFail(d => { d.review_cases[0].review_status = 'APPROVED'; }, 'premature rights approval');
  mustFail(d => { d.review_cases[0].full_video_watched = true; }, 'fake full visual review');
  mustFail(d => { d.review_cases[1].full_audio_listened = true; }, 'fake audio review');
  mustFail(d => { d.review_cases[1].timeline_approved = true; }, 'fake timeline go');
  mustFail(d => { d.review_cases[2].technical_original_sha256 = '0'.repeat(64); }, 'wrong hash');
  mustFail(d => { d.review_cases[2].technical_original_bytes += 1; }, 'wrong file size');
  mustFail(d => { d.review_cases[1].download_url = 'https://example.com/changed.mp4'; }, 'wrong source');
  mustFail(d => { d.review_cases[0].reviewed_by = 'Unknown reviewer'; }, 'invented reviewer');
  mustFail(d => { d.review_cases[2].source_audio_use = 'ALLOW'; }, 'unauthorized audio');
  mustFail(d => { d.review_cases.splice(1, 1); }, 'fewer than three files');
  mustFail(d => { d.excluded_media = []; }, 'missing excluded originals');
  mustFail(d => { d.global_pilot_approved = true; }, 'invented film approval');
  console.log('PASS 036: three pending human-review dossiers, 12 denied false approvals');
} else {
  console.log('PASS 036: all source and playback decisions PENDING; no rights/timeline approval');
}
