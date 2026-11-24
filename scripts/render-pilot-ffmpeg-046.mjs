#!/usr/bin/env node
// FFmpeg/SVG alternative: bounded per-scene encoding, one final movie, no Chromium.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { chmodSync, existsSync, lstatSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { FF046, JOIN_TIMESTAMPS046, SEGMENTS046, SHOTS046, VOICE046, overlaySvg046, planSegments, scienceSvg046, sourceFor } from './pilot-ffmpeg-046-plan.mjs';

assert.equal(process.argv.length,3,'Use --synthetic or --private');
const mode=process.argv[2];
assert.ok(['--synthetic','--private'].includes(mode));
const synthetic=mode==='--synthetic';
if(!synthetic) {
  assert.equal(process.env.BDA_PILOT_046_FFMPEG_PRIVATE,'TRUE');
  assert.equal(process.getuid?.(),1000);
  assert.equal(process.env.HOME,'/home/node');
  assert.equal(process.env.BDA_PILOT_046_MEDIA_ROOT,'/source');
  assert.equal(process.env.BDA_PILOT_046_OUTPUT_ROOT,'/review');
}
process.umask(0o077);
const common=['-nostdin','-hide_banner','-loglevel','error','-threads','1','-filter_threads','1','-filter_complex_threads','1'];
const vidopts=['-c:v','libx264','-preset','ultrafast','-crf',synthetic?'31':'28','-threads:v','1',
  '-pix_fmt','yuv420p','-r','30','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-an','-movflags','+faststart'];
const sec=(frames)=>(frames/30).toFixed(6);
const pad=(number)=>String(number).padStart(6,'0');
function command(bin,args,ms=600000) {
  const p=spawnSync(bin,args,{encoding:'utf8',timeout:ms,shell:false,maxBuffer:256*1024,
    env:{PATH:process.env.PATH??'/usr/bin:/bin'}});
  if(p.error||p.status!==0) throw Error(bin+' failed exit='+p.status+' signal='+p.signal+
    ' code='+(p.error?.code??'none')+' stderr='+(p.stderr??'').slice(-1100));
  return p.stdout??'';
}
function probe(file) {
  return JSON.parse(command('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file],30000));
}
function countFrames(file) {
  const v=probe(file).streams.filter(s=>s.codec_type==='video');
  assert.equal(v.length,1);
  assert.equal(v[0].codec_name,'h264');
  return Number(v[0].nb_frames);
}
function refuseOverwrite(file) {assert.ok(!existsSync(file),'REFUSED overwrite: '+file);}
function render({shots,segments,root,out,voice,intro,width,height,output}) {
  assert.deepEqual(segments,planSegments(shots));
  const frames=shots.at(-1).from+shots.at(-1).durationInFrames;
  if(!synthetic) assert.deepEqual([width,height,frames],[1920,1080,1800]);
  const byId=new Map(shots.map(s=>[s.id,s]));
  const work=join(out,'.work-ffmpeg-046');
  refuseOverwrite(work);mkdirSync(work,{mode:0o700});
  const sceneCache=new Set(),overlays=new Set();
  function source(shot) {
    const relative=synthetic?'synthetic-'+shot.id+'.mp4':sourceFor(shot);
    assert.ok(typeof relative==='string'&&!relative.startsWith('/')&&!relative.includes('..'));
    const file=resolve(root,relative);
    assert.ok(file.startsWith(resolve(root)+'/')&&lstatSync(file).isFile());
    return file;
  }
  function ensureVectorFrames(shot) {
    if(sceneCache.has(shot.id)) return;
    const dir=join(work,shot.id);mkdirSync(dir,{mode:0o700});
    for(let frame=0;frame<shot.durationInFrames;frame++) {
      const name=shot.id+'-'+pad(frame);
      const svg=join(dir,name+'.svg'),png=join(dir,name+'.png');
      writeFileSync(svg,scienceSvg046(shot,frame),{mode:0o600,flag:'wx'});
      command('rsvg-convert',['--width',String(width),'--height',String(height),'--output',png,svg],30000);
      rmSync(svg);
    }
    sceneCache.add(shot.id);
    console.log('046 FFMPEG VECTOR '+shot.id+': '+shot.durationInFrames+' frames');
  }
  function overlay(shot) {
    const png=join(work,shot.id+'-overlay.png');
    if(!overlays.has(shot.id)) {
      const svg=join(work,shot.id+'-overlay.svg');
      writeFileSync(svg,overlaySvg046(shot),{mode:0o600,flag:'wx'});
      command('rsvg-convert',['--width',String(width),'--height',String(height),'--output',png,svg],30000);
      rmSync(svg);overlays.add(shot.id);
    }
    return png;
  }
  function encodeSpan(shot,offset,length,dest) {
    refuseOverwrite(dest);
    assert.ok(Number.isInteger(offset)&&offset>=0&&Number.isInteger(length)&&length>0&&
      offset+length<=shot.durationInFrames);
    let args;
    if(shot.kind==='science') {
      ensureVectorFrames(shot);
      args=['-framerate','30','-start_number',String(offset),'-i',
        join(work,shot.id,shot.id+'-%06d.png'),'-vf','scale='+width+':'+height+',format=yuv420p',
        '-frames:v',String(length)];
    } else {
      const crop=shot.assetId==='P60-VID-001'
        ? 'scale='+width+':'+height+':force_original_aspect_ratio=decrease:flags=lanczos,pad='+width+':'+height+':(ow-iw)/2:(oh-ih)/2'
        : 'scale='+width+':'+height+':force_original_aspect_ratio=increase:flags=lanczos,crop='+width+':'+height;
      // Seek the REAL source input, not the following looping PNG overlay.
      // Input seeking stays frame-accurate after FFmpeg decode on H.264.
      args=['-ss',sec(offset),'-i',source(shot)];
      if(shot.kind==='footage') {
        args.push('-loop','1','-framerate','30','-i',overlay(shot),
          '-filter_complex','[0:v]fps=30,'+crop+',setsar=1,format=yuv420p[base];'+
            '[base][1:v]overlay=0:0:shortest=1,format=yuv420p[out]',
          '-map','[out]','-frames:v',String(length));
      } else {
        args.push('-vf','fps=30,'+crop+',setsar=1,format=yuv420p','-frames:v',String(length));
      }
    }
    command('ffmpeg',[...common,...args,...vidopts,'-n',dest]);
    assert.equal(countFrames(dest),length,'wrong frames for '+shot.id);
    return dest;
  }
  const parts=[];
  for(let i=0;i<segments.length;i++) {
    const span=segments[i],file=join(work,'part-'+String(i).padStart(2,'0')+'.mp4');
    if(span.kind==='body') encodeSpan(byId.get(span.shot),span.offset,span.frames,file);
    else {
      const first=encodeSpan(byId.get(span.left),span.leftOffset,span.frames,join(work,'fade-'+i+'-left.mp4'));
      const second=encodeSpan(byId.get(span.right),span.rightOffset,span.frames,join(work,'fade-'+i+'-right.mp4'));
      command('ffmpeg',[...common,'-i',first,'-i',second,'-filter_complex',
        "[0:v][1:v]blend=all_expr='A*(1-(N+1)/"+span.frames+")+B*((N+1)/"+span.frames+")',format=yuv420p[v]",
        '-map','[v]','-frames:v',String(span.frames),...vidopts,'-n',file],120000);
      assert.equal(countFrames(file),span.frames);
    }
    parts.push(file);
    console.log('046 FFMPEG PART '+(i+1)+'/'+segments.length+': '+span.frames+'f PASS');
  }
  const listing=join(work,'parts.ffconcat');
  assert.ok(parts.every(s=>!s.includes("'")&&!s.includes('\n')));
  writeFileSync(listing,'ffconcat version 1.0\n'+parts.map(s=>"file '"+s+"'").join('\n')+'\n',
    {mode:0o600,flag:'wx'});
  const joined=join(work,'joined.mp4');
  // Rewrite PTS/DTS to exact frame index while stream-copying: some FFmpeg
  // builds (bookworm 5.1) accumulated tick drift across 11 copy-concatenated
  // parts (VPS: avg_frame_rate 27648000/921631 = 60.002 s instead of 30/1).
  // ultrafast x264 has no B-frames, so PTS == DTS == N frames.
  command('ffmpeg',[...common,'-f','concat','-safe','0','-i',listing,'-map','0:v:0',
    '-an','-c:v','copy',...JOIN_TIMESTAMPS046,'-movflags','+faststart','-n',joined],120000);
  assert.equal(countFrames(joined),frames);
  const joinedVideo=probe(joined).streams.find(s=>s.codec_type==='video');
  assert.equal(joinedVideo.avg_frame_rate,'30/1','joined video must be exactly 30/1');
  assert.ok(Math.abs(Number(joinedVideo.duration)-frames/30)<0.0005,'joined video duration drift');
  const fade=segments.find(s=>s.kind==='blend')?.frames??0;
  const fadeAt=sec(shots[0].durationInFrames-fade);
  // Match Remotion's additive <Audio> layers: voice at 0.78 plus faded intro.
  // amix normalizes by default (1/inputs => about -6 dB on the narration);
  // normalize=0 keeps the 043/046 voice level. apad guarantees a full-length track.
  const mix='[1:a]volume=0.78,apad=whole_dur='+sec(frames)+',atrim=duration='+sec(frames)+',asetpts=PTS-STARTPTS[voice];'+
    '[2:a]atrim=duration='+sec(shots[0].durationInFrames)+',asetpts=PTS-STARTPTS,'+
    'afade=t=out:st='+fadeAt+':d='+sec(fade)+',apad=pad_dur='+sec(frames)+'[intro];'+
    '[voice][intro]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,aresample=48000[a]';
  const final=join(out,output);refuseOverwrite(final);
  command('ffmpeg',[...common,'-i',joined,'-i',voice,'-i',intro,'-filter_complex',mix,
    '-map','0:v:0','-map','[a]','-t',sec(frames),'-c:v','copy','-c:a','aac',
    '-b:a','192k','-ar','48000','-ac','2','-movflags','+faststart','-n',final],120000);
  chmodSync(final,0o600);
  const info=probe(final),v=info.streams.filter(s=>s.codec_type==='video'),
    a=info.streams.filter(s=>s.codec_type==='audio');
  assert.equal(v.length,1);assert.equal(a.length,1);
  assert.equal(v[0].codec_name,'h264');assert.equal(v[0].width,width);assert.equal(v[0].height,height);
  assert.equal(Number(v[0].nb_frames),frames);assert.equal(a[0].codec_name,'aac');
  assert.equal(a[0].channels,2);assert.equal(a[0].sample_rate,'48000');
  assert.ok(Math.abs(Number(info.format.duration)-frames/30)<.15);
  assert.ok(Math.abs(Number(a[0].duration)-frames/30)<.15,'audio track must span the full film');
  assert.equal(v[0].avg_frame_rate,'30/1');
  if(!synthetic) {
    for(const key of ['color_primaries','color_transfer','color_space']) assert.equal(v[0][key],'bt709');
  }
  const bytes=statSync(final).size;assert.ok(bytes>5000&&bytes<838860800);
  const sha256=command('sha256sum',[final],30000).split(' ')[0];
  assert.match(sha256,/^[a-f0-9]{64}$/);
  writeFileSync(final+'.receipt.json',JSON.stringify({schema:1,method:'SEQUENTIAL_FFMPEG_SVG_NO_CHROMIUM',
    synthetic,privateOnly:!synthetic,sourceAudioDiscarded:true,frames,width,height,fps:30,
    sha256,bytes,parts:segments},null,2)+'\n',{mode:0o600,flag:'wx'});
  rmSync(work,{recursive:true,force:true});
  console.log('046 FFMPEG '+(synthetic?'SYNTHETIC':'PRIVATE')+' FILM PASS: '+frames+
    ' frames, H264/AAC, continuous MP4, muted source video');
}
function syntheticInputs(root,shots) {
  for(const shot of shots) {
    if(shot.kind==='science') continue;
    const seconds=sec(shot.durationInFrames+5);
    // 30000/1001 like real NASA/NOAA sources: exercises fps conversion + timestamps.
    const args=[...common,'-f','lavfi','-i','testsrc2=size=320x180:rate=30000/1001:duration='+seconds];
    if(shot.kind==='brand_intro') args.push('-f','lavfi','-i','sine=frequency=330:sample_rate=48000:duration='+seconds);
    if(shot.id==='S01') {
      // Three RED frames followed by BLUE; first non-blended frame must be BLUE
      // because S01's preceding 3-frame crossfade consumes input frames 0..2.
      args.push('-vf',"drawbox=x=0:y=0:w=iw:h=ih:color=red:t=fill:enable='lt(t,0.1)',"+
        "drawbox=x=0:y=0:w=iw:h=ih:color=blue:t=fill:enable='gte(t,0.1)'");
    }
    args.push('-t',seconds,'-c:v','libx264','-preset','ultrafast','-threads:v','1','-crf','30','-pix_fmt','yuv420p');
    if(shot.kind==='brand_intro') args.push('-c:a','aac','-ar','48000','-ac','2');
    else args.push('-an');
    command('ffmpeg',[...args,'-n',join(root,'synthetic-'+shot.id+'.mp4')],60000);
  }
  const voice=join(root,'synthetic-voice.wav');
  command('ffmpeg',[...common,'-f','lavfi','-i',
    'sine=frequency=440:sample_rate=48000:duration=1.4','-c:a','pcm_s16le','-ac','2','-n',voice],30000);
  return voice;
}
if(synthetic) {
  const root=join(tmpdir(),'ff046-synthetic-'+randomBytes(8).toString('hex'));
  mkdirSync(root,{mode:0o700});
  try {
    const shots=[
      {id:'S00',kind:'brand_intro',from:0,durationInFrames:12,assetId:null},
      {id:'S01',kind:'footage',from:9,durationInFrames:12,assetId:'SYNTH',
        caption:'Synthetic test footage',credit:'Generated local testsrc2'},
      {id:'S07',kind:'science',from:21,durationInFrames:12,assetId:null},
      {id:'S08',kind:'brand_outro',from:30,durationInFrames:12,assetId:null},
    ];
    const voice=syntheticInputs(root,shots);
    render({shots,segments:planSegments(shots),root,out:root,voice,
      intro:join(root,'synthetic-S00.mp4'),width:320,height:180,output:'synthetic-046.mp4'});
    // Decode actual frame 12. It is the first S01 BODY frame (offset 3),
    // and therefore must be BLUE rather than source frame zero (RED).
    // Probe a patch outside both caption and private watermark overlays.
    const sample=spawnSync('ffmpeg',['-nostdin','-hide_banner','-loglevel','error',
      '-i',join(root,'synthetic-046.mp4'),'-vf',
      'select=eq(n\\,12),crop=16:16:48:48,format=rgb24',
      '-frames:v','1','-f','rawvideo','pipe:1'],
      {encoding:null,timeout:30000,maxBuffer:1024*1024});
    assert.equal(sample.status,0,'synthetic first body frame decode failed');
    assert.equal(sample.stdout?.length,16*16*3);
    let red=0,blue=0;
    for(let i=0;i<sample.stdout.length;i+=3) {
      red+=sample.stdout[i];blue+=sample.stdout[i+2];
    }
    assert.ok((blue-red)/(16*16)>80,
      '046 FFMPEG seek regression: S01 body replayed red source frame zero');
    console.log('046 FFMPEG SYNTHETIC SOURCE SEEK PASS: S01 body begins at input frame 3');
    // After the intro (0.4s) only the 0.78-scaled narration remains. The
    // synthetic stereo voice WAV measures -24.1 dB mean, so x0.78 gives about
    // -26.3 dB; the former normalizing amix produced -32.3 dB (6 dB too quiet).
    const level=spawnSync('ffmpeg',['-nostdin','-hide_banner','-i',join(root,'synthetic-046.mp4'),
      '-vn','-af','atrim=start=0.5:end=1.3,volumedetect','-f','null','-'],
      {encoding:'utf8',timeout:30000,maxBuffer:1024*1024});
    assert.equal(level.status,0,'synthetic narration level decode failed');
    const mean=Number(/mean_volume:\s*(-?[\d.]+) dB/.exec(level.stderr??'')?.[1]);
    assert.ok(Number.isFinite(mean)&&mean>-28&&mean<-24.5,
      '046 FFMPEG voice level regression: mean '+mean+' dB, expected about -26.3 dB');
    console.log('046 FFMPEG SYNTHETIC VOICE LEVEL PASS: '+mean+' dB (unnormalized mix)');
    console.log('046 FFMPEG SYNTHETIC OFFLINE SMOKE PASS: 42f, crossfades, animated SVG and AAC');
  } finally {rmSync(root,{recursive:true,force:true});}
} else {
  assert.ok(lstatSync('/review').isDirectory());
  assert.ok(!existsSync('/review/046-private-ffmpeg-pilot-02.mp4'));
  render({shots:SHOTS046,segments:SEGMENTS046,root:'/source',out:'/review',
    voice:join('/source',VOICE046),intro:join('/source',sourceFor(SHOTS046[0])),
    width:FF046.width,height:FF046.height,output:'046-private-ffmpeg-pilot-02.mp4'});
}
