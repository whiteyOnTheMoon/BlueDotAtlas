import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VIDEO_PROFILE } from '../packages/video/src/compositions/profile.js';

export const validateProbe = (probe) => {
  const video = probe.streams?.find((stream) => stream.codec_type === 'video');
  const audio = probe.streams?.find((stream) => stream.codec_type === 'audio');
  assert.ok(video, 'video stream missing');
  assert.equal(video.codec_name, 'h264', 'expected H.264');
  assert.equal(video.width, VIDEO_PROFILE.width, 'wrong width');
  assert.equal(video.height, VIDEO_PROFILE.height, 'wrong height');
  assert.equal(video.r_frame_rate, '30/1', 'wrong frame rate');
  assert.equal(Number(video.nb_read_frames), VIDEO_PROFILE.proofFrames, 'wrong frame count');
  assert.ok(audio, 'intro soundtrack / audio stream missing');
  assert.equal(audio.codec_name, 'aac', 'expected AAC');
  assert.ok(Math.abs(Number(probe.format?.duration) - 10) < 0.03, 'wrong duration');
};

export const verifyRender = (filename) => {
  const data = execFileSync(
    'ffprobe',
    [
      '-v', 'error', '-count_frames', '-show_entries',
      'format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames',
      '-of', 'json', filename,
    ],
    { encoding: 'utf8', timeout: 120_000 },
  );
  validateProbe(JSON.parse(data));
  console.log('038 REMOTION PROOF PASS: 1920x1080 / 30fps / 300 frames / 10s / H.264 + AAC');
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/check-remotion-038.mjs path/to/proof.mp4');
  verifyRender(process.argv[2]);
}
