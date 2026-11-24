import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { FF046, JOIN_TIMESTAMPS046, SHOTS046, SEGMENTS046, VOICE046,
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
    '--memory 512m','--memory-swap 512m','--read-only',
    '--cap-drop ALL','--security-opt no-new-privileges',
    '--pids-limit 120','min_mem_kib=2883584', '-lt "$min_mem_kib"', '-lt 2097152',
    'docker stop --timeout 10 "$name"',
    '046 FFMPEG PRIVATE PREFLIGHT PASS',
    'scripts/check-pilot-film-046-probe.py']) {
    assert.ok(sh.includes(k),'missing safeguard: '+k);
  }
  assert.doesNotMatch(sh,/--memory 1536m|min_mem_kib=3932160/);
  assert.doesNotMatch(sh,/docker compose|docker system prune|docker rm |--network host|--privileged|kurvenfunk-staging-/);
  const js=readFileSync(film,'utf8');
  for(const k of ['--synthetic','rsvg-convert','-threads:v','libx264',
    "'concat'","'copy'","amix=inputs=2",'-frames:v','sourceAudioDiscarded:true']) {
    assert.ok(js.includes(k),'missing media operation: '+k);
  }

  // Both read-only preflight and last-moment render admission need
  // 512MiB container (2x measured 1080p peak) + 2048MiB host reserve + 256MiB margin.
  assert.equal(sh.split('if [ "$mem_kib" -lt "$min_mem_kib" ]; then').length-1,2);
  assert.ok(sh.includes('512MiB hard container cap + 2048MiB host reserve'));
  assert.ok(js.includes("args=['-ss',sec(offset),'-i',source(shot)]"));
  assert.ok(!js.includes("args=['-i',source(shot),'-ss'"));
  assert.ok(js.includes('SYNTHETIC SOURCE SEEK PASS'));
  assert.ok(js.includes('S01 body replayed red source frame zero'));

  // Remotion layers add up; FFmpeg amix must not halve the 0.78 narration.
  assert.ok(js.includes('dropout_transition=0:normalize=0'));
  assert.ok(js.includes("'[1:a]volume=0.78,apad=whole_dur='"));
  assert.ok(js.includes('SYNTHETIC VOICE LEVEL PASS'));

  assert.doesNotMatch(js,/from ['"](?:remotion|@remotion)|\bchromium\s*--/i);
});
test('046 private files stay inside the project folder (.private-046), never in Git or images',async()=>{
  const sh=readFileSync(runner,'utf8'),js=readFileSync(film,'utf8');
  for(const k of ['private_root="$root/.private-046"','stage="$private_root/stage"',
    'out="$private_root/ffmpeg-pilot-02"','git check-ignore -q "$private_root/stage"',
    'test -z "$(git ls-files -- .private-046)"','BDA_PILOT_046_STAGE="$stage" node scripts/check-pilot-preview-046.mjs --check',
    '/review/046-private-ffmpeg-pilot-02.mp4']) assert.ok(sh.includes(k),'missing: '+k);
  assert.doesNotMatch(sh,/\$HOME\/\.bda-pilot/);
  assert.ok(js.includes("output:'046-private-ffmpeg-pilot-02.mp4'"));
  for(const f of ['.gitignore','.dockerignore'])
    assert.match(readFileSync(new URL('../'+f,import.meta.url),'utf8'),/^(\*\*\/)?\.private-046\/?$/m);
  const { stageFor, PROJECT_STAGE_046 } = await import('./check-pilot-preview-046.mjs');
  assert.equal(stageFor({BDA_PILOT_046_STAGE:PROJECT_STAGE_046}),PROJECT_STAGE_046);
  assert.throws(()=>stageFor({BDA_PILOT_046_STAGE:'/tmp/elsewhere'}));
  assert.ok(PROJECT_STAGE_046.endsWith('/.private-046/stage'));
});
test('046 join rewrites timestamps to exact 30fps in the input time base (FFmpeg 5.1 safe)',()=>{
  const js=readFileSync(film,'utf8');
  assert.deepEqual([...JOIN_TIMESTAMPS046],['-bsf:v','setts=pts=N/(30*TB):dts=N/(30*TB):duration=1/(30*TB)',
    '-video_track_timescale','15360']);
  assert.ok(js.includes("'-c:v','copy',...JOIN_TIMESTAMPS046"));
  assert.doesNotMatch(JOIN_TIMESTAMPS046.join(' '),/time_base=/);
  assert.ok(js.includes("joined video must be exactly 30/1"));
  // 30/1 is asserted for synthetic AND private output, not only private.
  assert.match(js,/assert\.equal\(v\[0\]\.avg_frame_rate,'30\/1'\);\n  if\(!synthetic\)/);
});
