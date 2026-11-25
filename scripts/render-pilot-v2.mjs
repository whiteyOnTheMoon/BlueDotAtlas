#!/usr/bin/env node
// 048 re-review: first real private Script-V2 film with the Scene-Director V1
// renderer (057/058). Runs INSIDE the offline pilot046ffmpeg container:
//   /source  read-only private stage (.private-046/stage)
//   /voice   read-only V2 narration (.private-046/v2-tts-NN)
//   /review  private output folder (0700)
// Modes:
//   --preflight  verify assets (SHA/size), source lengths and narration; no writes
//   --render     preflight, then render scene-v1.mp4 + receipt (needs BDA_PILOT_V2_FILM_PRIVATE=TRUE)
// Never publishes; media stay PRIVATE_INTERNAL_TEST_ONLY.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, existsSync, lstatSync, openSync, readFileSync, readSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { timeline } from './scene-render-v1-plan.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
export const SCENE_V2 = join(repo, 'docs/pilot/60s-script-v2.scene.json');
export const NARRATION_BYTES = 1800 * 1600 * 2 * 2 + 44; // 60 s, 48 kHz, stereo PCM16

/** Stage-relative file for every asset the V2 scene uses (046 layout + V2 clips). */
export const V2_STAGE_FILES = Object.freeze({
  'brand-intro': 'brand/motion/final/BlueDotAtlas Intro.mp4',
  'brand-outro': 'brand/motion/final/BlueDotAtlas_Outro.mp4',
  'P60-VID-001': 'pilot/.private-046/P60-VID-001.mp4',
  // Over-HD original: the operator-approved 1080p HD proxy from 046.
  'P60-VID-003': 'pilot/.private-046/hd-proxy-046/P60-VID-003-hd.mp4',
  'P60-VID-005': 'pilot/.private-046/P60-VID-005.mp4',
  'V2-VID-SVS5683-ELNINO-SSTA': 'pilot/.private-v2/V2-VID-SVS5683-ELNINO-SSTA.mp4',
  'V2-VID-CIRA-POLO-RI': 'pilot/.private-v2/V2-VID-CIRA-POLO-RI.mp4',
  'V2-VID-SVS5681-POLO-GPM': 'pilot/.private-v2/V2-VID-SVS5681-POLO-GPM.mp4',
});

/** Asset map {id: {file}} for the scene; every used asset must be known. */
export function assetMap(doc, stageRoot) {
  const used = [...new Set(doc.scenes.flatMap((s) => s.shots.flatMap((sh) => sh.assetIds)))];
  return Object.fromEntries(used.map((id) => {
    assert.ok(V2_STAGE_FILES[id], 'no private stage file for asset ' + id);
    return [id, { file: join(stageRoot, V2_STAGE_FILES[id]) }];
  }));
}

/** Seconds each source must provide: max(assetInFrame + renderFrames) per asset. */
export function sourceNeeds(doc) {
  const needs = {};
  for (const shot of timeline(doc)) {
    for (const id of shot.assetIds) {
      // brand_intro holds its last frame for the outgoing blend (render-scene-v1).
      const frames = (shot.assetInFrame ?? 0) + (shot.kind === 'brand_intro' ? shot.frames : shot.renderFrames);
      needs[id] = Math.max(needs[id] ?? 0, frames / 30);
    }
  }
  return needs;
}

/** Narration must be the exact 60 s V2 timeline generated from THIS scene file. */
export function checkNarration(wavBytes, report, sceneBytes) {
  assert.equal(report.scope, '048_V2_PRIVATE_NARRATION');
  assert.equal(report.published, false);
  assert.equal(report.sceneSha256, createHash('sha256').update(sceneBytes).digest('hex'),
    'narration was generated for a different scene document');
  assert.equal(wavBytes.length, NARRATION_BYTES, 'narration must be exactly 60 s 48 kHz stereo PCM16');
  assert.equal(report.wavSha256, createHash('sha256').update(wavBytes).digest('hex'), 'narration WAV SHA mismatch');
  assert.equal(wavBytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wavBytes.readUInt16LE(22), 2);
  assert.equal(wavBytes.readUInt32LE(24), 48000);
  assert.equal(report.segments.length, 6);
  return true;
}

function shaFile(path) {
  const hash = createHash('sha256');
  const buffer = Buffer.alloc(1 << 20);
  const fd = openSync(path, 'r');
  try {
    for (let n; (n = readSync(fd, buffer, 0, buffer.length, null)) > 0;) hash.update(buffer.subarray(0, n));
  } finally {
    closeSync(fd);
  }
  return hash.digest('hex');
}

function regularFile(path) {
  const st = lstatSync(path);
  assert.ok(st.isFile() && !st.isSymbolicLink(), path + ' must be a regular file');
  return st;
}

function probeSeconds(file) {
  const p = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration:format=duration',
    '-of', 'json', file], { encoding: 'utf8', timeout: 60_000, env: { PATH: process.env.PATH ?? '/usr/bin:/bin' } });
  assert.equal(p.status, 0, 'ffprobe failed for ' + file);
  const j = JSON.parse(p.stdout);
  return Number(j.streams?.[0]?.duration ?? j.format?.duration);
}

export function preflight({ stageRoot, voiceDir, requireNarration = true }) {
  const sceneBytes = readFileSync(SCENE_V2);
  const doc = JSON.parse(sceneBytes);
  assert.equal(doc.publicationAuthorized, false);
  const assets = assetMap(doc, stageRoot);
  const v2 = JSON.parse(readFileSync(join(repo, 'assets/pilot/rights-manifest-v2.json'), 'utf8'));
  const needs = sourceNeeds(doc);
  for (const [id, { file }] of Object.entries(assets)) {
    const st = regularFile(file);
    const entry = v2.assets.find((a) => a.asset_id === id);
    if (entry) {
      assert.equal(entry.approval_scope, 'PRIVATE_INTERNAL_TEST_ONLY');
      assert.equal(st.size, entry.technical.bytes, id + ' size mismatch');
      assert.equal(shaFile(file), entry.technical.sha256, id + ' SHA-256 mismatch');
    }
    const have = probeSeconds(file);
    assert.ok(have + 1e-3 >= needs[id], `${id}: source has ${have.toFixed(2)} s, scene needs ${needs[id].toFixed(2)} s`);
    console.log(`V2 FILM ASSET OK: ${id} ${have.toFixed(2)} s >= ${needs[id].toFixed(2)} s${entry ? ' + SHA' : ''}`);
  }
  const wav = join(voiceDir, 'pilot-v2-narration-60s.wav');
  if (!requireNarration && !existsSync(wav)) {
    console.log('V2 FILM NARRATION: not generated yet (run --tts after approval)');
    return { doc, assets, narration: null };
  }
  regularFile(wav);
  checkNarration(readFileSync(wav), JSON.parse(readFileSync(join(voiceDir, 'pilot-v2-narration-timing.json'), 'utf8')), sceneBytes);
  console.log('V2 FILM NARRATION OK: exact 60 s, generated from current scene document');
  return { doc, assets, narration: wav };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  try {
    assert.ok(process.argv.length === 3 && ['--preflight', '--render'].includes(mode), 'use --preflight or --render');
    const stageRoot = process.env.BDA_PILOT_V2_STAGE_ROOT ?? '/source';
    const voiceDir = process.env.BDA_PILOT_V2_VOICE_ROOT ?? '/voice';
    const out = process.env.BDA_PILOT_V2_OUTPUT_ROOT ?? '/review';
    const { doc, assets, narration } = preflight({ stageRoot, voiceDir, requireNarration: mode === '--render' });
    if (mode === '--preflight') {
      console.log('V2 FILM PREFLIGHT PASS: no rendering, no writes');
    } else {
      assert.equal(process.env.BDA_PILOT_V2_FILM_PRIVATE, 'TRUE', 'explicit BDA_PILOT_V2_FILM_PRIVATE=TRUE required');
      const st = statSync(out);
      assert.ok(st.isDirectory() && (st.mode & 0o077) === 0, 'output must be a private 0700 directory');
      const { renderScene } = await import('./render-scene-v1.mjs');
      renderScene({ doc, assets, narration, introAudio: assets['brand-intro'].file, out });
      console.log('V2 FILM PRIVATE PASS: ' + join(out, 'scene-v1.mp4') + ' (not published; owner review required)');
    }
  } catch (error) {
    console.error('V2 FILM NO-GO: ' + String(error?.message ?? error).slice(0, 600));
    process.exitCode = 1;
  }
}
