// 044: frame-accurate INTERNAL timing only. No actual pilot-footage timeline permit.
export const LOCKS_044 = Object.freeze({
  fps: 30,
  frames: 1800,
  sampleRate: 48000,
  samplesPerFrame: 1600,
  width: 1920,
  height: 1080,
  introEnd: 75,
  firstContent: 66,
  lastContent: 1629,
  outroStart: 1620,
  outroEnd: 1800,
  crossfadeFrames: 9,
  leadFrames: 9,
  lastLeadFrames: 6,
  tailFrames: 6,
  lastTailFrames: 9,
  musicEndFadeFrames: 24,
});
const IDS = Object.freeze(['S01','S02','S03','S04','S05','S06','S07']);
const expectedTypes = ['brand_intro','observational_video_reference','observational_video_reference',
  'original_science_animation','original_science_animation','original_science_animation',
  'observational_video_reference','original_science_animation','brand_outro'];

/**
 * @param {any} script the existing locked 037 9-shot draft
 * @param {any} timings exact original 042 speech sample evidence
 * @returns {any} non-publishable timing plan
 */
export function buildPilotTimeline044(script, timings) {
  if (!script || script.planning_only !== true || script.render_authorized !== false ||
      script.publish_authorized !== false) throw new Error('037 P60 release gates must remain locked');
  if (script.target?.fps !== 30 || script.target?.duration_frames !== 1800 ||
      script.target?.width !== 1920 || script.target?.height !== 1080 ||
      script.target?.audio_sample_rate_hz !== 48000 || script.target?.audio_channels !== 2) {
    throw new Error('037 master video/audio profile mismatch');
  }
  if (!Array.isArray(script.shots) || script.shots.length !== 9) throw new Error('Need exactly nine 037 shots');
  if (script.shots.some((s,i)=>s.id !== 'S0'+i || s.type !== expectedTypes[i])) {
    throw new Error('Shot ID/type drift from 037');
  }
  const [intro,...rest] = script.shots;
  const outro = rest[rest.length-1];
  if (!intro || !outro || intro.start_frame !== 0 || intro.end_frame !== 75 ||
      intro.transition_out_frames !== 9 || outro.start_frame !== 1620 ||
      outro.end_frame !== 1800 || outro.transition_in_frames !== 9) {
    throw new Error('007 brand transition anchors shifted');
  }
  for (let i=1;i<8;i++) {
    const shot=script.shots[i];
    if (!shot || !Number.isInteger(shot.start_frame) || !Number.isInteger(shot.end_frame) ||
        shot.end_frame <= shot.start_frame || !shot.narration || typeof shot.narration.text !== 'string' ||
        shot.narration.text.length < 45 || shot.transition_in_frames !== (i===1?9:0) ||
        shot.transition_out_frames !== (i===7?9:0)) {
      throw new Error('037 shot/narration/transition validation failed');
    }
    if (i>1 && shot.start_frame !== script.shots[i-1].end_frame) {
      throw new Error('037 shot order has a gap');
    }
    if (shot.type === 'observational_video_reference' &&
        !['P60-VID-001','P60-VID-005','P60-VID-003'].includes(shot.asset_id)) {
      throw new Error('Unexpected footage source');
    }
  }
  if (script.shots[1].start_frame !== 66 || script.shots[7].end_frame !== 1629) {
    throw new Error('037 brand/content boundary moved');
  }
  if (!timings || timings.status !== 'PRIVATE_AUDIO_QA_TIMING_ONLY' ||
      timings.mediaRights !== 'PRIVATE_INTERNAL_TEST_ONLY' ||
      timings.filmAuthorized !== false || timings.publishAuthorized !== false ||
      timings.voice !== 'bm_george' || timings.sampleRate !== 48000 || timings.channels !== 2 ||
      timings.leadSamples !== 5760 || timings.gapSamples !== 13440 ||
      timings.tailSamples !== 16800 ||
      !/^([a-f0-9]{64})$/.test(timings.sourceSha256 ?? '') ||
      !/^([a-f0-9]{64})$/.test(timings.wavSha256 ?? '') ||
      !Array.isArray(timings.segments) || timings.segments.length !== 7) {
    throw new Error('Missing / unverified 042 actual voice evidence');
  }
  const speech = [];
  let sourceCursor = timings.leadSamples;
  for (let i=0;i<7;i++) {
    const s=timings.segments[i];
    if (!s || s.id !== IDS[i] || !Number.isInteger(s.speechSamples) ||
        s.speechSamples < 48000 || s.speechSamples > 48000*15 ||
        Math.abs(s.startSeconds - sourceCursor/48000) > 0.002 ||
        Math.abs(s.speechSeconds - s.speechSamples/48000) > 0.002) {
      throw new Error('042 voice timing is not the original measured sample sequence');
    }
    speech.push({id:s.id,sourceStartSample:sourceCursor,sourceEndSample:sourceCursor+s.speechSamples,
      speechSamples:s.speechSamples,speechFrames:Math.ceil(s.speechSamples/1600)});
    sourceCursor += s.speechSamples + (i===6?0:timings.gapSamples);
  }
  const totalSamples=sourceCursor+timings.tailSamples;
  if (Math.abs(totalSamples/48000 - timings.durationSeconds) > 0.002) {
    throw new Error('042 overall spoken WAV duration does not match sample evidence');
  }
  const original=script.shots.slice(1,8);
  const minDur=speech.map((s,i)=>s.speechFrames+(i===6?LOCKS_044.lastLeadFrames:LOCKS_044.leadFrames)
    +(i===6?LOCKS_044.lastTailFrames:LOCKS_044.tailFrames));
  const available=LOCKS_044.lastContent-LOCKS_044.firstContent;
  const slack=available-minDur.reduce((a,b)=>a+b,0);
  if (slack < 0) throw new Error('Measured narration overflows 60s P60 frame budget: no speedup allowed');
  const weights=original.map((s,i)=>Math.max(0,(s.end_frame-s.start_frame)-minDur[i]));
  const sumWeight=weights.reduce((a,b)=>a+b,0);
  const desired=weights.map(w=>sumWeight>0?slack*w/sumWeight:slack/7);
  const extras=desired.map(x=>Math.floor(x));
  let remainder=slack-extras.reduce((a,b)=>a+b,0);
  const ranking=desired.map((x,i)=>({i,remainder:x-extras[i]}))
    .sort((a,b)=>b.remainder-a.remainder||a.i-b.i);
  for(const {i} of ranking){if(remainder===0)break;extras[i]++;remainder--;}
  const shots=[];
  shots.push({
    id:'S00',kind:'brand_intro',startFrame:0,endFrame:75,clipInFrame:0,clipOutFrame:75,
    transitionInFrames:0,transitionOutFrames:9,originalAssetReference:intro.brand_asset_path,
    sourceStaged:false,sourceIncludedInProof:false,proofVisual:'SYNTHETIC_BRAND_PLACEHOLDER',
  });
  let cursor=LOCKS_044.firstContent;
  for(let i=0;i<7;i++){
    const ref=original[i],voice=speech[i];
    const duration=minDur[i]+extras[i];
    const begin=cursor;
    const end=begin+duration;
    const lead=i===6?LOCKS_044.lastLeadFrames:LOCKS_044.leadFrames;
    const vStart=begin+lead,vEnd=vStart+voice.speechFrames;
    if(vEnd>end-(i===6?LOCKS_044.lastTailFrames:LOCKS_044.tailFrames) ||
       (i===6 && vEnd>LOCKS_044.outroStart))throw new Error('Syllable cut / voice runs into outro');
    shots.push({
      id:ref.id,kind:ref.type,startFrame:begin,endFrame:end,
      clipInFrame:0,clipOutFrame:duration,
      transitionInFrames:i===0?9:0,transitionOutFrames:i===6?9:0,
      sourceAssetId:ref.asset_id??null,
      sourceStaged:false,sourceIncludedInProof:false,
      originalSourceClipInFrame:null,originalSourceClipOutFrame:null,
      sourceRights:ref.type==='observational_video_reference'?'PRIVATE_INTERNAL_TEST_ONLY_NOT_STAGED':'ORIGINAL_SCHEMATIC_ONLY',
      proofVisual:ref.type==='observational_video_reference'?'SYNTHETIC_FOOTAGE_PLACEHOLDER':'SYNTHETIC_SCHEMATIC_PLACEHOLDER',
      narration:{id:ref.id,startFrame:vStart,endFrame:vEnd,
        ...voice,language:'en-gb',voice:'bm_george',playbackRate:1}
    });
    cursor=end;
  }
  if(cursor!==LOCKS_044.lastContent)throw new Error('Content clips fail to cover available time');
  shots.push({
    id:'S08',kind:'brand_outro',startFrame:LOCKS_044.outroStart,endFrame:LOCKS_044.outroEnd,
    clipInFrame:0,clipOutFrame:180,transitionInFrames:9,transitionOutFrames:0,
    originalAssetReference:outro.brand_asset_path,sourceStaged:false,
    sourceIncludedInProof:false,proofVisual:'SYNTHETIC_BRAND_PLACEHOLDER',
  });
  const timeline={
    schema:'bluedotatlas-internal-timeline-044-v1',status:'SYNTHETIC_INTERNAL_PROOF_ONLY',
    name:'Hurricanes: Powered by the Ocean · internal timing storyboard',
    master:{fps:30,frames:1800,durationSeconds:60,width:1920,height:1080,
      audioSampleRate:48000,audioChannels:2},
    preview:{width:960,height:540,watermark:'INTERNAL SYNTHETIC STORYBOARD - NOT PUBLISHED'},
    release:{planningOnly:true,renderAuthorized:false,publishAuthorized:false,
      privateObservationFootageUsed:false,originalBrandMediaUsed:false,
      thirdPartyMusicUsed:false,productionRenderAuthorized:false},
    speechEvidence:{source:'042 actual seven-segment Kokoro QA',sourceSha256:timings.sourceSha256,
      wavSha256:timings.wavSha256,durationSeconds:timings.durationSeconds,
      samples:totalSamples,voice:'bm_george',narrationSegments:7},
    music:{kind:'GENERATED_ORIGINAL_QA_TONE_ONLY',startsAtFrame:0,endsAtFrame:1800,
      outroStartsAtFrame:1620,finalFadeStartsAtFrame:1776,rightsApprovedForPublish:false,
      duckDepth:0.72},
    shots
  };
  validatePilotTimeline044(timeline);
  return timeline;
}

/** @param {any} plan */
export function validatePilotTimeline044(plan) {
  if (!plan || plan.status !== 'SYNTHETIC_INTERNAL_PROOF_ONLY' ||
      plan.release?.publishAuthorized!==false || plan.release?.renderAuthorized!==false ||
      plan.release?.productionRenderAuthorized!==false ||
      plan.release?.privateObservationFootageUsed!==false ||
      plan.release?.thirdPartyMusicUsed!==false || plan.release?.originalBrandMediaUsed!==false ||
      plan.master?.frames !== 1800 || plan.master?.fps !== 30 ||
      plan.music?.endsAtFrame !== 1800 || plan.music?.outroStartsAtFrame !== 1620 ||
      plan.music?.finalFadeStartsAtFrame!==1776 || plan.music?.rightsApprovedForPublish!==false ||
      plan.shots?.length!==9)throw new Error('044 timeline rights, frame count or music outro lock failed');
  const coverage=new Uint8Array(1800);
  const ids=['S00',...IDS,'S08'];
  let prev=null;
  for(const [i,shot] of plan.shots.entries()){
    if(shot.id!==ids[i]||!Number.isInteger(shot.startFrame)||!Number.isInteger(shot.endFrame)||
      shot.startFrame<0||shot.endFrame>1800||shot.endFrame<=shot.startFrame ||
      shot.clipInFrame!==0 || shot.clipOutFrame!==shot.endFrame-shot.startFrame ||
      shot.sourceStaged!==false||shot.sourceIncludedInProof!==false){
      throw new Error('044 unapproved clip or invalid frame range');
    }
    if(prev){
      const overlap=prev.endFrame-shot.startFrame;
      const expected=(i===1||i===8)?9:0;
      if(overlap!==expected || prev.transitionOutFrames!==expected || shot.transitionInFrames!==expected){
        throw new Error('044 gap, accidental overlap or broken 9-frame brand crossfade');
      }
    }
    for(let frame=shot.startFrame;frame<shot.endFrame;frame++)coverage[frame]++;
    if(i>0&&i<8){
      if(!shot.narration||shot.narration.id!==shot.id ||
         shot.narration.startFrame<shot.startFrame ||
         shot.narration.endFrame>shot.endFrame ||
         (i===7&&shot.narration.endFrame>1620) ||
         shot.narration.playbackRate!==1 ||
         !Number.isInteger(shot.narration.sourceStartSample) ||
         shot.narration.sourceEndSample-shot.narration.sourceStartSample!==shot.narration.speechSamples ||
         shot.narration.endFrame-shot.narration.startFrame!==Math.ceil(shot.narration.speechSamples/1600)
      )throw new Error('044 voice sample/frame truncation or misordered narration');
    }else if(shot.narration)throw new Error('No narration over brand source');
    prev=shot;
  }
  for(let f=0;f<1800;f++){
    const expected=((f>=66&&f<75)||(f>=1620&&f<1629))?2:1;
    if(coverage[f]!==expected)throw new Error('044 frame coverage gap or overlap at '+f);
  }
  return true;
}
