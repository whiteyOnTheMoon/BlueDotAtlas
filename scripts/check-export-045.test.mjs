import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  loadPreset, validatePreset, validateUnreleasedPilot,
  syntheticFfmpegArgs, readAndCheckInputs,
} from '../render/preset-1080p.mjs';

const p=loadPreset();
const draft=JSON.parse(readFileSync(new URL('../docs/pilot/60s-script.json',import.meta.url),'utf8'));
const timeline=JSON.parse(readFileSync(new URL('../docs/pilot/pilot-timeline.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(p);

test('045 preset passes only exactly specified 1080p30 H264 High/BT709 and 48k stereo AAC profile',()=>{
  assert.equal(validatePreset(clone()).id,'1080p30-h264-aac-faststart');
  assert.equal(p.video.width,1920);
  assert.equal(p.video.height,1080);
  assert.equal(p.video.frameRate,'30/1');
  assert.equal(p.video.pixelFormat,'yuv420p');
  assert.equal(p.audio.sampleRate,48000);
  assert.equal(p.audio.channels,2);
  assert.equal(p.container.faststart,true);
  assert.equal(p.syntheticProof.frames,240);
  assert.equal(p.syntheticProof.durationSeconds,8);
  assert.equal(p.status,'SYNTHETIC_EXPORT_QA_ONLY');
  assert.deepEqual(readAndCheckInputs(),p);
});

test('Unknown rights / real 60s film / public export never silently becomes authorized',()=>{
  for(const mut of [
    x=>{x.filmExportAuthorized=true},
    x=>{x.publishAuthorized=true},
    x=>{x.requiresSeparateRightsApproval=false},
    x=>{x.status='PUBLIC_RELEASE'},
    x=>{x.sourcePolicy.thirdPartyFootageAllowed=true},
    x=>{x.sourcePolicy.originalBrandMediaAllowed=true},
    x=>{x.sourcePolicy.commercialMusicAllowed=true},
    x=>{x.sourcePolicy.realPilotTimelineUsed=true},
    x=>{x.sourcePolicy.allowedInThisProof='NASA_HELENE_REAL'},
  ]){
    const x=clone();mut(x);
    assert.throws(()=>validatePreset(x));
  }
});

test('Any deviation from exact H264, BT709, yuv420p, sample aspect or 30fps fails',()=>{
  for(const mut of [
    x=>{x.video.width=1280},
    x=>{x.video.height=720},
    x=>{x.video.encoder='libx265'},
    x=>{x.video.frameRate='30000/1001'},
    x=>{x.video.pixelFormat='yuv444p'},
    x=>{x.video.sampleAspectRatio='4:3'},
    x=>{x.video.colorTransfer='smpte2084'},
    x=>{x.video.colorPrimaries='bt2020'},
    x=>{x.video.colorSpace='bt2020nc'},
    x=>{x.video.colorRange='pc'},
    x=>{x.video.profile='Main'},
    x=>{x.video.crf=0},
    x=>{x.video.threads=8},
  ]){
    const x=clone();mut(x);
    assert.throws(()=>validatePreset(x));
  }
});

test('Audio, MP4 faststart and test duration/size cannot be weakened',()=>{
  for(const mut of [
    x=>{x.audio.encoder='mp3'},
    x=>{x.audio.profile='HE-AAC'},
    x=>{x.audio.sampleRate=44100},
    x=>{x.audio.channels=1},
    x=>{x.audio.channelLayout='mono'},
    x=>{x.audio.bitRate='48k'},
    x=>{x.container.faststart=false},
    x=>{x.container.fragmented=true},
    x=>{x.container.format='mov'},
    x=>{x.syntheticProof.durationSeconds=60},
    x=>{x.syntheticProof.frames=1800},
    x=>{x.syntheticProof.sourceVideo='user-provided-url'},
    x=>{x.syntheticProof.sourceAudio='copyrighted-song'},
    x=>{x.syntheticProof.outputDirectory='public'},
  ]){
    const x=clone();mut(x);
    assert.throws(()=>validatePreset(x));
  }
});

test('037 original production render gates and 044 60s synthetic boundary are preserved',()=>{
  assert.equal(validateUnreleasedPilot(draft,timeline),true);
  for(const mut of [
    x=>{x.render_authorized=true},
    x=>{x.publish_authorized=true},
    x=>{x.planning_only=false},
    x=>{x.target.width=960},
    x=>{x.target.audio_sample_rate_hz=44100},
  ]){
    const x=structuredClone(draft);mut(x);
    assert.throws(()=>validateUnreleasedPilot(x,timeline));
  }
  for(const mut of [
    x=>{x.release.productionRenderAuthorized=true},
    x=>{x.release.privateObservationFootageUsed=true},
    x=>{x.release.originalBrandMediaUsed=true},
    x=>{x.release.publishAuthorized=true},
    x=>{x.master.frames=240},
  ]){
    const x=structuredClone(timeline);mut(x);
    assert.throws(()=>validateUnreleasedPilot(draft,x));
  }
});

test('FFmpeg argv is fixed-input, no shell, correct Faststart/codec/colors; isolated temp output only',()=>{
  const file='/home/runner/BlueDotAtlas/.tmp-export-045/045-original-synthetic-1080p.mp4';
  const args=syntheticFfmpegArgs(p,file);
  assert.ok(args.includes('+faststart'));
  assert.ok(args.includes('libx264'));
  assert.ok(args.includes('aac'));
  assert.ok(args.includes('yuv420p'));
  assert.ok(args.includes('bt709'));
  assert.ok(args.includes('cfr'));
  assert.ok(args.includes('240'));
  assert.ok(args.includes('48000'));
  assert.ok(args.includes('stereo')===false);
  assert.equal(args.at(-1),file);
  assert.ok(args.filter(x=>x==='-i').length===2);
  assert.ok(args.every(x=>typeof x==='string'));
  for(const f of [
    '/tmp/045.mp4','/tmp/public/video.mp4',
    '/tmp/.tmp-export-045/unauthorized.mp4',
    '/tmp/.tmp-export-045/045-original-synthetic-1080p.mp4\0-random',
  ]) assert.throws(()=>syntheticFfmpegArgs(p,f));
});
