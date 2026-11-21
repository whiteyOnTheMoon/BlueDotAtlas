import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const shPath = new URL('./prepare-pilot-hd-proxy-046.sh', import.meta.url).pathname;
const checkPath = new URL('./check-pilot-hd-proxy-046.py', import.meta.url).pathname;
const originalSha = 'b'.repeat(64);
const proxySha = 'a'.repeat(64);

const valid = {
  streams: [
    { codec_type: 'video', codec_name: 'h264',
      width: 1920, height: 1080, pix_fmt: 'yuv420p' },
  ],
  format: { duration: '34.850' },
};

function check(probe, sha = proxySha, original = originalSha) {
  return spawnSync('python3', [checkPath, sha, original], {
    input: JSON.stringify(probe), encoding: 'utf8',
  });
}

test('046 private HD proxy is validated from ffprobe before SHA evidence is recorded', () => {
  const result = check(valid);
  assert.equal(result.status, 0, result.stderr);
  const evidence = JSON.parse(result.stdout);
  assert.equal(evidence.width, 1920);
  assert.equal(evidence.height, 1080);
  assert.equal(evidence.originalSha256, originalSha);
  assert.equal(evidence.proxySha256, proxySha);
  assert.equal(evidence.audioStreams, 0);
  for (const mutate of [
    (p) => { p.streams[0].width = 3840; },
    (p) => { p.streams[0].height = 2160; },
    (p) => { p.streams[0].codec_name = 'hevc'; },
    (p) => { p.streams[0].pix_fmt = 'yuv444p'; },
    (p) => { p.streams.push({ codec_type: 'audio', codec_name: 'aac' }); },
    (p) => { p.format.duration = '5'; },
    (p) => { p.format.duration = '80'; },
  ]) {
    const bad = structuredClone(valid);
    mutate(bad);
    assert.notEqual(check(bad).status, 0);
  }
  assert.notEqual(check(valid, 'not-a-sha').status, 0);
});

test('046 HD proxy conversion is one-shot, original read-only, no network and <=2GiB', () => {
  execFileSync('bash', ['-n', shPath]);
  const sh = readFileSync(shPath, 'utf8');
  for (const required of [
    '--network none', '--cpus 0.5', '--memory 2048m', '--memory-swap 2048m',
    '--read-only', '--cap-drop ALL', '--security-opt no-new-privileges',
    '--pids-limit 120', '--ulimit fsize=268435456:268435456',
    'type=bind,source=$stage,target=/source,readonly',
  ]) assert.ok(sh.includes(required), 'missing proxy guard: ' + required);
  assert.match(sh, /-map 0:v:0/);
  assert.match(sh, /scale=1920:1080/);
  assert.match(sh, /-c:v libx264/);
  assert.match(sh, /-an -sn -dn/);
  assert.match(sh, /-n \/proxy\/P60-VID-003-hd\.mp4/);
  assert.match(sh, /BDA_PILOT_046_PRIVATE_HD_PROXY/);
  assert.match(sh, /--check-originals/);
  assert.match(sh, /-lt 2883584/);
  assert.match(sh, /hd-proxy-046/);
  assert.doesNotMatch(sh, /docker compose|docker system prune|docker rm|--privileged|--network host|curl |wget |--memory 3072m|--memory-swap -1/);
});
