import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCIENCE_PROOF_FRAMES } from '../packages/video/src/compositions/science-plan.js';
import { VIDEO_PROFILE } from '../packages/video/src/compositions/profile.js';

export function validateScienceOutput(probe) {
  const stream = probe.streams?.find((s) => s.codec_type === 'video');
  assert.ok(stream, 'missing actual video stream');
  assert.equal(stream.codec_name, 'h264');
  assert.equal(stream.width, VIDEO_PROFILE.width);
  assert.equal(stream.height, VIDEO_PROFILE.height);
  assert.equal(stream.r_frame_rate, '30/1');
  assert.equal(Number(stream.nb_read_frames), SCIENCE_PROOF_FRAMES);
  assert.ok(['yuv420p', 'yuvj420p'].includes(stream.pix_fmt), 'not 8-bit YUV 4:2:0');
  assert.equal(probe.streams.filter((s) => s.codec_type === 'audio').length, 0, 'science proof must be silent');
  assert.ok(
    Math.abs(Number(probe.format?.duration) - SCIENCE_PROOF_FRAMES / VIDEO_PROFILE.fps) < 0.03,
    'wrong render duration',
  );
}

export function validateScienceStillFrames(dir) {
  const frames = [30, 130, 240];
  const files = readdirSync(dir).filter((f) => f.endsWith('.png'));
  const hashes = frames.map((frame) => {
    const image = files.find((file) => new RegExp('-0*' + frame + '\\.png$').test(file));
    assert.ok(image, 'missing stage still frame ' + frame);
    const data = readFileSync(resolve(dir, image));
    assert.ok(data.length > 5000, 'truncated stage still');
    return createHash('sha256').update(data).digest('hex');
  });
  assert.equal(new Set(hashes).size, frames.length, 'actual phase frames must not be identical');
  console.log('041 STAGES PASS: 3 distinct real rendered PNG stage frames; no pixel files exposed in logs');
}

export function checkScienceVideo(filename, stillsDir) {
  const probe = execFileSync(
    'pnpm',
    ['--filter', '@bluedotatlas/video', 'exec', 'remotion', 'ffprobe',
      '-v', 'error', '-count_frames',
      '-show_entries',
      'format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,pix_fmt',
      '-of', 'json', resolve(filename)],
    { encoding: 'utf8', timeout: 120_000 },
  );
  validateScienceOutput(JSON.parse(probe));
  validateScienceStillFrames(stillsDir);
  console.log('041 SCIENCE PASS: 9s/270 frames/1920x1080/30fps/H264/2D conceptual stages/no audio');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4) {
    throw new Error('Usage: node scripts/check-science-041.mjs <MP4> <stills-directory>');
  }
  checkScienceVideo(process.argv[2], process.argv[3]);
}
