#!/usr/bin/env node
// 046 regression: copy-concat of 11 parts must yield exactly 1800f / 30/1 / 60.000s,
// even when parts carry different MP4 timescales and odd seek offsets. Synthetic only.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JOIN_TIMESTAMPS046, SEGMENTS046 } from './pilot-ffmpeg-046-plan.mjs';

const run = (bin, args) => {
  const p = spawnSync(bin, args, { encoding: 'utf8', timeout: 120000, maxBuffer: 1 << 20 });
  assert.equal(p.status, 0, bin + ' failed: ' + (p.stderr ?? '').slice(-600));
  return p.stdout;
};
const common = ['-nostdin', '-hide_banner', '-loglevel', 'error', '-threads', '1'];
const work = mkdtempSync(join(tmpdir(), 'ff046-join-'));
try {
  const src = join(work, 'src.mp4');
  run('ffmpeg', [...common, '-f', 'lavfi', '-i', 'testsrc2=size=160x90:rate=30000/1001:duration=12',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', src]);
  const timescales = [15360, 30000, 90000];
  const files = SEGMENTS046.map((segment, i) => {
    const file = join(work, 'p' + String(i).padStart(2, '0') + '.mp4');
    run('ffmpeg', [...common, '-ss', (i * 0.037).toFixed(3), '-stream_loop', '-1', '-i', src,
      '-vf', 'fps=30', '-frames:v', String(segment.frames), '-c:v', 'libx264', '-preset', 'ultrafast',
      '-threads:v', '1', '-pix_fmt', 'yuv420p', '-r', '30', '-an',
      '-video_track_timescale', String(timescales[i % 3]), file]);
    return file;
  });
  const list = join(work, 'parts.ffconcat');
  writeFileSync(list, 'ffconcat version 1.0\n' + files.map((f) => "file '" + f + "'").join('\n') + '\n');
  const joined = join(work, 'joined.mp4');
  run('ffmpeg', [...common, '-f', 'concat', '-safe', '0', '-i', list, '-map', '0:v:0', '-an',
    '-c:v', 'copy', ...JOIN_TIMESTAMPS046, '-movflags', '+faststart', joined]);
  const v = JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', joined]))
    .streams.find((s) => s.codec_type === 'video');
  assert.equal(v.nb_frames, '1800');
  assert.equal(v.avg_frame_rate, '30/1', 'join drift: ' + v.avg_frame_rate);
  assert.ok(Math.abs(Number(v.duration) - 60) < 0.0005, 'join duration ' + v.duration);
  run('ffmpeg', ['-v', 'error', '-i', joined, '-f', 'null', '-']);
  const version = run('ffmpeg', ['-hide_banner', '-version']).split('\n')[0];
  console.log('046 FFMPEG JOIN TIMESTAMP PASS: 11 mixed-timescale parts -> 1800f 30/1 60.000s (' + version + ')');
} finally {
  rmSync(work, { recursive: true, force: true });
}
