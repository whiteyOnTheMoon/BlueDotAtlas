#!/usr/bin/env node
// Roadmap 037: validate a 60s PLANNING script, not an authorized render timeline.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../docs/pilot/60s-script.json', import.meta.url));
const rightsFile = fileURLToPath(new URL('../assets/pilot/rights-manifest.json', import.meta.url));
const pilot = JSON.parse(readFileSync(file, 'utf8'));
const rights = JSON.parse(readFileSync(rightsFile, 'utf8'));

const selectedIds = ['P60-VID-001', 'P60-VID-003', 'P60-VID-005'];
const brandFiles = [
  'assets/brand/motion/final/BlueDotAtlas Intro.mp4',
  'assets/brand/motion/final/BlueDotAtlas_Outro.mp4'
];

function validNoaaReference(href) {
  const url = new URL(href);
  assert.equal(url.protocol, 'https:', 'Scientific sources require HTTPS');
  assert.equal(url.username, '');
  assert.equal(url.password, '');
  assert.ok(url.hostname === 'noaa.gov' || url.hostname.endsWith('.noaa.gov'),
    'Every scientific claim must cite an original NOAA science explanation');
}

function validate(p, rightsCatalog = rights) {
  assert.equal(p.schema_version, 1);
  assert.equal(p.roadmap_id, '037');
  assert.equal(p.github_issue, 61);
  assert.equal(p.language, 'en');
  assert.equal(p.release_scope, 'INTERNAL_TEST_PLANNING_ONLY');
  assert.equal(p.planning_only, true);
  assert.equal(p.render_authorized, false, 'Unreviewed source media cannot enter a render');
  assert.equal(p.publish_authorized, false, 'Issue 037 cannot authorize publication');
  assert.equal(p.source_rights_gate_issue, 60);
  assert.deepEqual(p.target, {
    duration_frames: 1800, duration_seconds: 60, fps: 30,
    width: 1920, height: 1080, container: 'mp4',
    video_codec: 'h264', audio_codec: 'aac',
    audio_channels: 2, audio_sample_rate_hz: 48000
  });
  assert.equal(p.brand.intro_original, brandFiles[0]);
  assert.equal(p.brand.outro_original, brandFiles[1]);
  assert.equal(p.brand.intro_frames, 75);
  assert.equal(p.brand.outro_frames, 180);
  assert.equal(p.brand.boundary_crossfade_frames, 9);
  assert.equal(p.creative_direction.spoken_track_status, 'SCRIPT_NOT_TTS_GENERATED');
  assert.ok(p.creative_direction.narrative_arc?.length > 40);

  const claims = new Map();
  for (const claim of p.scientific_claims) {
    assert.match(claim.id, /^C0[1-3]$/);
    assert.ok(!claims.has(claim.id));
    assert.ok(claim.statement?.length >= 40);
    assert.ok(Array.isArray(claim.reference_urls) && claim.reference_urls.length > 0);
    claim.reference_urls.forEach(validNoaaReference);
    assert.match(claim.checked_at_utc, /^\d{4}-\d{2}-\d{2}$/);
    claims.set(claim.id, claim);
  }
  assert.equal(claims.size, 3, 'Require all three scientifically sourced claims');

  assert.ok(Array.isArray(p.observational_asset_references));
  assert.equal(p.observational_asset_references.length, 3);
  const sources = new Map();
  for (const ref of p.observational_asset_references) {
    assert.ok(selectedIds.includes(ref.id), 'Unexpected film source');
    assert.ok(!sources.has(ref.id), 'Duplicated film source');
    const original = rightsCatalog.assets.find(a => a.asset_id === ref.id);
    assert.ok(original, 'Missing original provenance entry');
    assert.equal(original.source_page_url, ref.source_page_url);
    assert.ok(original.credits.includes(ref.source_credit) ||
      ref.source_credit.includes(original.creator.split(',')[0]),
      'Proposed credit must match real NASA/NOAA attribution');
    assert.equal(ref.rights_status_at_planning, 'UNREVIEWED');
    assert.ok(original.rights_status !== 'BLOCKED' && original.rights_status !== 'REJECTED');
    assert.equal(ref.source_audio_allowed, false, 'No unreviewed original source audio');
    assert.equal(ref.original_byte_proof, 'docs/pilot/media-byte-proof-036.md');
    sources.set(ref.id, ref);
  }

  assert.ok(Array.isArray(p.shots) && p.shots.length === 9, 'Nine planned shots required');
  const usedAssets = new Set(), usedClaims = new Set();
  let wordCount = 0, previousNarrationEnd = 0;
  p.shots.forEach((shot, i) => {
    assert.equal(shot.id, 'S' + String(i).padStart(2, '0'));
    assert.ok(Number.isInteger(shot.start_frame) && Number.isInteger(shot.end_frame));
    assert.ok(shot.start_frame >= 0 && shot.end_frame > shot.start_frame);
    assert.ok(shot.end_frame <= 1800);
    if (i > 0) {
      const overlap = p.shots[i - 1].end_frame - shot.start_frame;
      assert.equal(overlap, i === 1 || i === 8 ? 9 : 0,
        'Only brand-content boundaries may overlap, by exactly 9 frames');
    }
    if (i === 0 || i === 8) {
      assert.equal(shot.type, i === 0 ? 'brand_intro' : 'brand_outro');
      assert.equal(shot.brand_asset_path, brandFiles[i === 0 ? 0 : 1]);
      assert.equal(shot.asset_id, null);
      assert.equal(shot.narration, null);
      assert.deepEqual(shot.claim_ids, []);
      assert.equal(shot.source_audio, i === 0 ? 'original_brand_only' : 'no_original_audio');
    } else {
      assert.ok(shot.visual?.length >= 55, 'A motivated, specific visual is required');
      assert.ok(shot.caption?.length >= 10);
      assert.ok(shot.narration && shot.narration.text?.length >= 30);
      assert.ok(shot.narration.start_frame >= shot.start_frame &&
        shot.narration.end_frame <= shot.end_frame);
      assert.ok(shot.narration.end_frame > shot.narration.start_frame);
      assert.ok(shot.narration.start_frame >= previousNarrationEnd,
        'Spoken lines must not overlap');
      previousNarrationEnd = shot.narration.end_frame;
      const words = shot.narration.text.trim().split(/\s+/).length;
      assert.ok(words >= 10 && words <= 25, 'Keep speech concise for each shot');
      wordCount += words;
      assert.ok(Array.isArray(shot.claim_ids) && shot.claim_ids.length > 0);
      shot.claim_ids.forEach(id => {
        assert.ok(claims.has(id), 'Every spoken claim must have a source');
        usedClaims.add(id);
      });
      if (shot.type === 'observational_video_reference') {
        assert.ok(sources.has(shot.asset_id), 'No unapproved asset allowed');
        assert.equal(shot.source_audio, 'discard', 'Original soundtrack is excluded');
        usedAssets.add(shot.asset_id);
      } else {
        assert.equal(shot.type, 'original_science_animation');
        assert.equal(shot.asset_id, null);
        assert.equal(shot.source_audio, 'none');
        assert.match(shot.visual, /[Ss]chematic|[Cc]onceptual|[Oo]riginal/);
      }
    }
  });
  assert.equal(p.shots[0].start_frame, 0);
  assert.equal(p.shots[0].end_frame, 75);
  assert.equal(p.shots[8].start_frame, 1620);
  assert.equal(p.shots[8].end_frame, 1800);
  assert.deepEqual([...usedAssets].sort(), selectedIds.slice().sort());
  assert.deepEqual([...usedClaims].sort(), [...claims.keys()].sort());
  assert.ok(wordCount >= 80 && wordCount <= 120, '60 s narration should remain concise');
  assert.ok(p.excluded_assets.includes('P60-VID-002'), 'Ernesto lacks a verified original');
  assert.ok(p.excluded_assets.includes('P60-VID-ALT-004'), 'Saildrone is BLOCKED');
  assert.ok(p.notes.rights.includes('UNREVIEWED'), 'Source-rights gate must remain visible');
  assert.ok(p.notes.render_blocker.includes('036'), 'Rendering must be blocked on source rights');
}

validate(pilot);
if (process.argv.includes('--self-test')) {
  function denied(mutate, reason) {
    const copy = structuredClone(pilot);
    mutate(copy);
    assert.throws(() => validate(copy), undefined, reason);
  }
  denied(p => { p.render_authorized = true; }, 'premature render');
  denied(p => { p.publish_authorized = true; }, 'premature publish');
  denied(p => { p.shots[1].asset_id = 'P60-VID-ALT-004'; }, 'blocked Saildrone');
  denied(p => { p.shots[2].asset_id = 'P60-VID-002'; }, 'unverified Ernesto');
  denied(p => { p.shots[6].source_audio = 'original'; }, 'unreviewed source audio');
  denied(p => { p.brand.boundary_crossfade_frames = 6; }, 'incorrect brand overlap');
  denied(p => { p.shots[8].start_frame = 1621; }, 'wrong outro start');
  denied(p => { p.shots[8].end_frame = 1820; }, 'overlong film');
  denied(p => { p.scientific_claims[0].reference_urls = ['https://example.com/story']; },
    'invalid science source');
  denied(p => { p.shots[4].claim_ids = ['C99']; }, 'unsupported spoken claim');
  denied(p => { p.shots[1].narration.end_frame = 520; }, 'narration outside shot');
  denied(p => { p.observational_asset_references[0].source_page_url = 'https://example.org'; },
    'media provenance mismatch');
  console.log('PASS 037: 1800 frames, 9 shots, 3 traced originals, 3 claims, 12 denial tests');
} else {
  console.log('PASS 037: planning-only, real sources UNREVIEWED, no render or publish authorization');
}
