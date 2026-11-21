import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const shellPath = new URL('./run-pilot-film-046.sh', import.meta.url).pathname;
const checker = new URL('./check-pilot-film-046-probe.py', import.meta.url).pathname;

test('046 private-film runner is opt-in, bounded and offline (no publishing)', () => {
  execFileSync('bash', ['-n', shellPath]);
  const sh = readFileSync(shellPath, 'utf8');
  for (const flag of [
    '--network none', '--cpus 0.5', '--memory 2048m', '--memory-swap 2048m',
    '--pids-limit 200', '--read-only', '--cap-drop ALL', '--security-opt no-new-privileges',
    '--concurrency=1', '--offthreadvideo-video-threads=1', '--bundle-cache=false',
    '--offthreadvideo-cache-size-in-bytes=268435456',
    '--media-cache-size-in-bytes=134217728', '--color-space=bt709',
    '--ulimit fsize=838860800:838860800',
    '--overwrite=false', '--codec=h264', '--audio-codec=aac',
    'BDA_PILOT_046_PRIVATE_FILM', '046-private-rough-cut.mp4',
    '--signal=TERM', '7200s', 'scripts/check-pilot-preview-046.mjs --check',
    '046-S06-helene.png', '046-S08-outro.png',
  ]) assert.ok(sh.includes(flag), 'missing safety gate: ' + flag);
  assert.doesNotMatch(sh, /docker compose|docker system prune|--privileged|--network host|docker rm|git push|--disallow-parallel-encoding/);
  assert.match(sh, /if \[ "\$mode" = "--check" \]; then/);
  assert.match(sh, /if \[ -e "\$out" \] \|\| \[ -L "\$out" \]; then/);
});

const valid = {
  streams: [
    { codec_type: 'video', codec_name: 'h264', width: 1920, height: 1080,
      pix_fmt: 'yuv420p', avg_frame_rate: '30/1', nb_frames: '1800',
      color_primaries: 'bt709', color_transfer: 'bt709', color_space: 'bt709' },
    { codec_type: 'audio', codec_name: 'aac', sample_rate: '48000', channels: 2 },
  ],
  format: { duration: '60.000', size: '50000000' },
};

function check(data) {
  return spawnSync('python3', [checker], { input: JSON.stringify(data), encoding: 'utf8' });
}

test('046 ffprobe metadata contract rejects wrong frames, codecs and duration', () => {
  assert.equal(check(valid).status, 0);
  for (const change of [
    (x) => { x.streams[0].width = 1280; },
    (x) => { x.streams[0].nb_frames = '1799'; },
    (x) => { x.streams[0].codec_name = 'vp9'; },
    (x) => { x.streams[0].color_primaries = 'bt601'; },
    (x) => { x.streams[0].avg_frame_rate = '25/1'; },
    (x) => { x.streams[1].codec_name = 'mp3'; },
    (x) => { x.streams[1].channels = 1; },
    (x) => { x.streams.pop(); },
    (x) => { x.format.duration = '45'; },
    (x) => { x.format.size = '0'; },
  ]) {
    const copy = structuredClone(valid);
    change(copy);
    assert.notEqual(check(copy).status, 0);
  }
});
