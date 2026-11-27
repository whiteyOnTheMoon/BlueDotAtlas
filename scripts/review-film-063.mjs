#!/usr/bin/env node
// Roadmap 063: offline review of the privately staged media candidates. Runs
// INSIDE the offline pilot046ffmpeg container:
//   /source  read-only private stage (.private-046/stage)
//   /review  private output (.private-046/review-063, 0700)
// For every staged candidate: re-verify the pinned SHA-256, probe streams
// (codec, size, fps, duration, audio tracks) and write one contact sheet PNG
// (12 frames evenly over the clip, with timecodes) plus review-063.md/.json.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256File } from './render-scene-v1.mjs';

const FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';

export function sheetFilter(duration, font = FONT) {
  const rate = (12 / Math.max(duration, 1)).toFixed(6);
  const stamp = existsSync(font)
    ? `,drawtext=fontfile=${font}:text='%{pts\\:hms}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6`
    : '';
  return `fps=${rate},scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2${stamp},tile=4x3`;
}

function probe(file) {
  const p = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,avg_frame_rate:format=duration',
    '-of', 'json', file], { encoding: 'utf8', timeout: 120_000 });
  assert.equal(p.status, 0, 'ffprobe failed: ' + (p.stderr ?? '').slice(-200));
  const j = JSON.parse(p.stdout);
  const v = j.streams.find((s) => s.codec_type === 'video');
  assert.ok(v, 'no video stream');
  return {
    codec: v.codec_name, width: v.width, height: v.height, fps: v.avg_frame_rate,
    seconds: Number(Number(j.format.duration).toFixed(2)), audioStreams: j.streams.filter((s) => s.codec_type === 'audio').length,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const dir = join(process.env.BDA_FILM_063_STAGE_ROOT ?? '/source', 'film/.candidates-063');
    const out = process.env.BDA_FILM_063_REVIEW_ROOT ?? '/review';
    const { pins } = JSON.parse(readFileSync(join(dir, 'pins.json'), 'utf8'));
    const rows = [];
    for (const pin of pins) {
      if (pin.status !== 'staged') {
        rows.push({ id: pin.id, status: 'not staged', reason: pin.reason });
        console.log(`063 REVIEW SKIP: ${pin.id} (${pin.reason})`);
        continue;
      }
      const file = join(dir, pin.id + '.mp4');
      assert.equal(sha256File(file), pin.sha256, pin.id + ' SHA-256 changed since staging');
      const info = probe(file);
      const sheet = join(out, pin.id + '.png');
      const p = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-threads', '1', '-i', file, '-vf', sheetFilter(info.seconds),
        '-frames:v', '1', '-n', sheet], { encoding: 'utf8', timeout: 900_000 });
      assert.equal(p.status, 0, pin.id + ' contact sheet failed: ' + (p.stderr ?? '').slice(-200));
      rows.push({ id: pin.id, status: 'reviewed', bytes: pin.bytes, sha256: pin.sha256, ...info, sheet: pin.id + '.png' });
      console.log(`063 REVIEW OK: ${pin.id} ${info.width}x${info.height} ${info.fps} ${info.seconds}s audio=${info.audioStreams}`);
    }
    writeFileSync(join(out, 'review-063.json'), JSON.stringify({ roadmap: '063', approval_scope: 'PRIVATE_CANDIDATE_REVIEW_ONLY', rows }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    const md = ['| Kandidat | Auflösung | fps | Länge | Ton | Kontaktabzug |', '| --- | --- | --- | --- | --- | --- |',
      ...rows.map((r) => r.status === 'reviewed'
        ? `| ${r.id} | ${r.width}×${r.height} | ${r.fps} | ${r.seconds} s | ${r.audioStreams ? 'ja (wird nie genutzt)' : 'nein'} | ${r.sheet} |`
        : `| ${r.id} | – | – | – | – | nicht geladen: ${r.reason} |`)].join('\n');
    writeFileSync(join(out, 'review-063.md'), md + '\n', { flag: 'wx', mode: 0o600 });
    console.log(`063 REVIEW PASS: ${rows.filter((r) => r.status === 'reviewed').length}/${rows.length} candidates with contact sheets`);
  } catch (error) {
    console.error('063 REVIEW NO-GO: ' + String(error?.message ?? error).slice(0, 400));
    process.exitCode = 1;
  }
}
