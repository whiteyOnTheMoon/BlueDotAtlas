import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { FF046, SHOTS046, SEGMENTS046, VOICE046,
  sourceFor, planSegments, scienceSvg046, overlaySvg046 } from './pilot-ffmpeg-046-plan.mjs';

const runner = new URL('./run-pilot-ffmpeg-046.sh', import.meta.url).pathname;
const film = new URL('./render-pilot-ffmpeg-046.mjs', import.meta.url).pathname;
test('046 old timeline stays exactly 1800 frames at 1080p30 with 2x9f overlap',()=>{
  assert.deepEqual([FF046.width,FF046.height,FF046.fps,FF046.frames],[1920,1080,30,1800]);
  assert.equal(VOICE046,'audio/pilot-narration-aligned.wav');
  assert.equal(SEGMENTS046.reduce((sum,s)=>sum+s.frames,0),1800);
  assert.deepEqual(SEGMENTS046.map(s=>s.frames),[66,9,204,222,223,260,239,207,190,9,171]);
  assert.deepEqual(SEGMENTS046.filter(s=>s.kind==='blend').map(s=>s.timelineFrom),[66,1620]);
  assert.ok(sourceFor(SHOTS046.find(s=>s.id==='S06')).endsWith('/hd-proxy-046/P60-VID-003-hd.mp4'));
});
test('046 qualitative SVG science is moving; full NASA/NOAA credit text retained',()=>{
  const s=SHOTS046.find(s=>s.id==='S03');
  assert.notEqual(scienceSvg046(s,0),scienceSvg046(s,130));
  assert.match(scienceSvg046(s,130),/NOT AN OBSERVATION/);
  assert.notEqual(scienceSvg046(SHOTS046.find(s=>s.id==='S07'),0),
    scienceSvg046(SHOTS046.find(s=>s.id==='S07'),160));
  for(const id of ['S01','S02','S06']) {
    const shot=SHOTS046.find(s=>s.id===id),overlay=overlaySvg046(shot);
    assert.ok(overlay.includes(shot.credit));
    assert.ok(overlay.includes('NOT PUBLISHED'));
  }
});
test('046 plan rejects gaps, bad scene boundaries and overlapping entire scenes',()=>{
  const shots=[{id:'S00',from:0,durationInFrames:10},{id:'S01',from:10,durationInFrames:10}];
  assert.equal(planSegments(shots).reduce((sum,s)=>sum+s.frames,0),20);
  assert.throws(()=>planSegments([{...shots[0]},{...shots[1],from:12}]));
  assert.throws(()=>planSegments([{...shots[0]},{...shots[1],from:0}]));
});
test('046 alternate ffmpeg runner is offline, memory-limited, owner-only and no restart',()=>{
  execFileSync('bash',['-n',runner]);
  execFileSync('node',['--check',film]);
  const sh=readFileSync(runner,'utf8');
  for(const k of ['scripts/check-pilot-preview-046.mjs --check',
    'BDA_PILOT_046_FFMPEG_PRIVATE','--network none','--cpus 0.5',
    '--memory 1536m','--memory-swap 1536m','--read-only',
    '--cap-drop ALL','--security-opt no-new-privileges',
    '--pids-limit 120','-lt 3145728','-lt 2097152',
    'docker stop --timeout 10 "$name"',
    '046 FFMPEG PRIVATE PREFLIGHT PASS',
    'scripts/check-pilot-film-046-probe.py']) {
    assert.ok(sh.includes(k),'missing safeguard: '+k);
  }
  assert.doesNotMatch(sh,/docker compose|docker system prune|docker rm |--network host|--privileged|kurvenfunk-staging-/);
  const js=readFileSync(film,'utf8');
  for(const k of ['--synthetic','rsvg-convert','-threads:v','libx264',
    "'concat'","'copy'","amix=inputs=2",'-frames:v','sourceAudioDiscarded:true']) {
    assert.ok(js.includes(k),'missing media operation: '+k);
  }
  assert.doesNotMatch(js,/from ['"](?:remotion|@remotion)|\bchromium\s*--/i);
});
