import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRAPHICS_PROOF_FRAMES } from '../packages/video/src/compositions/graphics-plan.js';
import { VIDEO_PROFILE } from '../packages/video/src/compositions/profile.js';

export function validateGraphicsOutput(probe) {
  const video = probe.streams?.find((stream) => stream.codec_type === 'video');
  assert.ok(video, 'no output video stream');
  assert.equal(video.codec_name, 'h264');
  assert.equal(video.width, VIDEO_PROFILE.width);
  assert.equal(video.height, VIDEO_PROFILE.height);
  assert.equal(video.r_frame_rate, '30/1');
  assert.equal(Number(video.nb_read_frames), GRAPHICS_PROOF_FRAMES);
  // FFmpeg may report the full-range YUV420 alias (yuvj420p).
  assert.ok(['yuv420p', 'yuvj420p'].includes(video.pix_fmt), 'not 8-bit YUV420');
  assert.equal(probe.streams.filter((stream) => stream.codec_type === 'audio').length, 0);
  assert.ok(Math.abs(Number(probe.format?.duration) - GRAPHICS_PROOF_FRAMES / VIDEO_PROFILE.fps) < 0.03);
}

/** Run the already installed Remotion-bundled FFprobe; never apt install on the VPS. */
export function verifyGraphicsRender(file) {
  const filename = resolve(file);
  const output = execFileSync(
    'pnpm',
    [
      '--filter', '@bluedotatlas/video', 'exec', 'remotion', 'ffprobe',
      '-v', 'error', '-count_frames',
      '-show_entries',
      'format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,pix_fmt',
      '-of', 'json', filename,
    ],
    { encoding: 'utf8', timeout: 120_000 },
  );
  validateGraphicsOutput(JSON.parse(output));
  console.log('040 GRAPHICS PASS: real synthetic MP4 / 8s / 240 frames / 1080p30 / no audio');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error('Expected local output MP4 filename');
  verifyGraphicsRender(process.argv[2]);
}
