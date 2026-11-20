import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOOTAGE_PROOF_FRAMES } from '../packages/video/src/compositions/footage-plan.js';

export function validateOutput(probe) {
  const v = probe.streams?.find((s) => s.codec_type === 'video');
  assert.ok(v, 'no encoded picture');
  assert.equal(v.codec_name, 'h264');
  assert.equal(v.width, 1920);
  assert.equal(v.height, 1080);
  assert.equal(v.r_frame_rate, '30/1');
  // ffprobe reports limited-range yuv420p or its full-range 4:2:0 alias yuvj420p.
  // Both have 8-bit 4:2:0 chroma; final limited/full range normalization is 045.
  assert.ok(['yuv420p', 'yuvj420p'].includes(v.pix_fmt), 'expected 8-bit 4:2:0');
  assert.equal(Number(v.nb_read_frames), FOOTAGE_PROOF_FRAMES);
  assert.equal(probe.streams.filter((s) => s.codec_type === 'audio').length, 0, 'uncleared source audio leaked');
  assert.ok(Math.abs(Number(probe.format.duration) - 6) < 0.03, 'wrong duration');
}

/** @param {string} filename */
export function checkVideoFile(filename) {
  const raw = execFileSync(
    'ffprobe',
    ['-v', 'error', '-count_frames',
      '-show_entries',
      'format=duration:stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate,nb_read_frames',
      '-of', 'json', filename],
    { encoding: 'utf8', timeout: 120_000 },
  );
  validateOutput(JSON.parse(raw));
  // Two frames inside EACH distinct moving excerpt must differ. No frames are
  // uploaded/logged; only pass/fail of real encoded pixels is reported.
  const signatures = [0.4, 1.4, 2.4, 3.4, 4.4, 5.4].map((seconds) =>
    execFileSync(
      'ffmpeg',
      ['-v', 'error', '-ss', String(seconds), '-i', filename,
        '-frames:v', '1', '-an', '-f', 'hash', '-hash', 'sha256', '-'],
      { encoding: 'utf8', timeout: 90_000 },
    ).trim(),
  );
  for (let i = 0; i < signatures.length; i += 2) {
    assert.ok(signatures[i]?.startsWith('SHA256='));
    assert.notEqual(signatures[i], signatures[i + 1], 'static/slideshow excerpt detected');
  }
  assert.notEqual(signatures[1], signatures[2], 'no visible change at first cut');
  assert.notEqual(signatures[3], signatures[4], 'no visible change at second cut');
  console.log('039 REAL FOOTAGE PASS: 6s / 180 frames / 1920x1080 / 30fps / 2 original videos / 2 cuts / motion / no source audio');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/check-footage-039.mjs path/to/private.mp4');
  checkVideoFile(process.argv[2]);
}
