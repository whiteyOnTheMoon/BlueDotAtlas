import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { buildChecked044 } from './build-timeline-044.mjs';
import { buildPilotTimeline044, validatePilotTimeline044 } from '../packages/video/timeline/plan.mjs';
const source=JSON.parse(readFileSync(new URL('../docs/pilot/60s-script.json',import.meta.url),'utf8'));
const timing=JSON.parse(readFileSync(new URL('../docs/pilot/tts-timing-evidence-042.json',import.meta.url),'utf8'));
const frozen=JSON.parse(readFileSync(new URL('../docs/pilot/pilot-timeline.json',import.meta.url),'utf8'));
const fresh=()=>buildPilotTimeline044(structuredClone(source),structuredClone(timing));

test('044 snapshot derives byte-identically from real sampled TTS evidence and 037 text SHA',()=>{
  assert.equal(buildChecked044(),JSON.stringify(frozen,null,2)+'\n');
  assert.deepEqual(fresh(),frozen);
  assert.equal(frozen.master.frames,1800);
  assert.equal(frozen.master.durationSeconds,60);
  assert.equal(frozen.speechEvidence.durationSeconds,48.593);
  assert.equal(frozen.speechEvidence.voice,'bm_george');
  assert.equal(frozen.speechEvidence.wavSha256,'e9a554d85f7eb10cc7f49f5ae5347eb2e0ba445c1a84f6db25b2186669b6224f');
});

test('nine shots cover 1800 frames exactly with only two nine-frame brand crossfades',()=>{
  assert.equal(validatePilotTimeline044(frozen),true);
  assert.deepEqual(frozen.shots.map(x=>x.id),['S00','S01','S02','S03','S04','S05','S06','S07','S08']);
  const coverage=Array(1800).fill(0);
  for(const s of frozen.shots)for(let f=s.startFrame;f<s.endFrame;f++)coverage[f]++;
  assert.equal(coverage.filter(x=>x===2).length,18);
  assert.equal(coverage.filter(x=>x===1).length,1782);
  assert.equal(Math.min(...coverage),1);
  assert.equal(Math.max(...coverage),2);
  assert.equal(frozen.shots[1].startFrame,66);
  assert.equal(frozen.shots[8].startFrame,1620);
});

test('all 7 original voice samples fit in scenes, never stretch or cut, last voice before outro',()=>{
  const spoken=frozen.shots.slice(1,8);
  assert.equal(spoken.length,7);
  for(let i=0;i<7;i++){
    const s=spoken[i],v=s.narration,t=timing.segments[i];
    assert.equal(v.id,t.id);
    assert.equal(v.speechSamples,t.speechSamples);
    assert.equal(v.sourceEndSample-v.sourceStartSample,t.speechSamples);
    assert.equal(v.endFrame-v.startFrame,Math.ceil(t.speechSamples/1600));
    assert.equal(v.playbackRate,1);
    assert.ok(v.startFrame>=s.startFrame);
    assert.ok(v.endFrame<=s.endFrame);
  }
  assert.ok(spoken.at(-1).narration.endFrame<=1620);
  assert.equal(frozen.music.finalFadeStartsAtFrame,1776);
  assert.equal(frozen.music.endsAtFrame,1800);
});

test('production, source footage, third-party music, original brand render remain all denied',()=>{
  assert.equal(frozen.status,'SYNTHETIC_INTERNAL_PROOF_ONLY');
  assert.equal(frozen.release.renderAuthorized,false);
  assert.equal(frozen.release.publishAuthorized,false);
  assert.equal(frozen.release.productionRenderAuthorized,false);
  assert.equal(frozen.release.privateObservationFootageUsed,false);
  assert.equal(frozen.release.thirdPartyMusicUsed,false);
  assert.equal(frozen.release.originalBrandMediaUsed,false);
  assert.ok(frozen.shots.every(x=>!x.sourceStaged&&!x.sourceIncludedInProof));
  assert.ok(frozen.shots.filter(x=>x.kind==='observational_video_reference')
    .every(x=>x.sourceRights==='PRIVATE_INTERNAL_TEST_ONLY_NOT_STAGED'));
  assert.throws(()=>validatePilotTimeline044({...frozen,release:{...frozen.release,publishAuthorized:true}}));
  const switched=structuredClone(frozen);switched.shots[2].sourceIncludedInProof=true;
  assert.throws(()=>validatePilotTimeline044(switched));
});

test('malformed voice duration/source order or missing proof evidence fails closed',()=>{
  for(const mutation of [
    x=>{x.segments[0].speechSamples=12*48000; x.segments[0].speechSeconds=12;},
    x=>{x.segments[1].id='S08';},
    x=>{x.segments[2].startSeconds=0;},
    x=>{x.voice='unreviewed_celebrity_voice';},
    x=>{x.publishAuthorized=true;},
    x=>{x.durationSeconds=4;},
    x=>{for(const s of x.segments){s.speechSamples=14*48000;s.speechSeconds=14;}x.durationSeconds=99;},
  ]){
    const t=structuredClone(timing);mutation(t);
    assert.throws(()=>buildPilotTimeline044(source,t));
  }
});

test('037 changed timeline topology, source or release flags are rejected',()=>{
  for(const mutation of [
    x=>{x.shots[2].id='S99';},
    x=>{x.shots[1].asset_id='P60-VID-ALT-004';},
    x=>{x.shots[7].transition_out_frames=0;},
    x=>{x.shots[4].start_frame+=1;},
    x=>{x.shots[8].start_frame+=1;},
    x=>{x.target.fps=24;},
    x=>{x.render_authorized=true;},
    x=>{x.publish_authorized=true;},
    x=>{x.planning_only=false;},
  ]){
    const s=structuredClone(source);mutation(s);
    assert.throws(()=>buildPilotTimeline044(s,timing));
  }
});

test('snapshots with a clip gap, stray overlap, truncated syllables or premature music end fail',()=>{
  for(const mutation of [
    x=>{x.shots[4].startFrame+=1;},
    x=>{x.shots[3].endFrame+=1;},
    x=>{x.shots[7].narration.endFrame+=1;},
    x=>{x.shots[6].narration.sourceEndSample-=1;},
    x=>{x.shots[5].clipOutFrame-=1;},
    x=>{x.music.endsAtFrame=1620;},
    x=>{x.music.finalFadeStartsAtFrame=1620;},
    x=>{x.release.originalBrandMediaUsed=true;},
  ]){
    const plan=structuredClone(frozen);mutation(plan);
    assert.throws(()=>validatePilotTimeline044(plan));
  }
});

test('abuse guards do not silently accept old fixed 037 per-shot narration windows',()=>{
  const s3=frozen.shots.find(x=>x.id==='S03');
  const s5=frozen.shots.find(x=>x.id==='S05');
  const s7=frozen.shots.find(x=>x.id==='S07');
  assert.ok(s3.narration.endFrame-s3.narration.startFrame > source.shots[3].narration.end_frame-source.shots[3].narration.start_frame);
  assert.ok(s5.narration.endFrame-s5.narration.startFrame > source.shots[5].narration.end_frame-source.shots[5].narration.start_frame);
  assert.ok(s7.narration.endFrame-s7.narration.startFrame > source.shots[7].narration.end_frame-source.shots[7].narration.start_frame);
});
