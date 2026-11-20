import { readFileSync } from 'node:fs';

export const SCOPE_045 = 'SYNTHETIC_EXPORT_QA_ONLY';
const purl = new URL('./preset-1080p.json', import.meta.url);
const lockedScript = new URL('../docs/pilot/60s-script.json', import.meta.url);
const lockedTimeline = new URL('../docs/pilot/pilot-timeline.json', import.meta.url);

export function loadPreset() {
  return JSON.parse(readFileSync(purl, 'utf8'));
}

/** This is a QA preset, never production permission. */
export function validatePreset(p) {
  const v=p?.video,a=p?.audio,c=p?.container,s=p?.sourcePolicy,q=p?.syntheticProof,m=p?.masterCompatibility;
  if (p?.schema !== 'bluedotatlas-render-preset-045-v1' ||
      p?.id !== '1080p30-h264-aac-faststart' ||
      p?.status !== SCOPE_045 || p.filmExportAuthorized !== false ||
      p.publishAuthorized !== false || p.requiresSeparateRightsApproval !== true ||
      s?.allowedInThisProof !== 'ORIGINAL_FFMPEG_GENERATED_TESTSRC2_AND_SINE_ONLY' ||
      s?.thirdPartyFootageAllowed !== false || s?.originalBrandMediaAllowed !== false ||
      s?.commercialMusicAllowed !== false || s?.realPilotTimelineUsed !== false) {
    throw new Error('045 forbids real film, third-party media or release authorization');
  }
  if (c?.format !== 'mp4' || c?.filenameExtension !== '.mp4' ||
      c?.faststart !== true || c?.fragmented !== false) {
    throw new Error('045 requires nonfragmented MP4 with faststart');
  }
  if (v?.encoder !== 'libx264' || v?.codec !== 'h264' ||
      v?.width !== 1920 || v?.height !== 1080 || v?.frameRate !== '30/1' ||
      v?.pixelFormat !== 'yuv420p' || v?.sampleAspectRatio !== '1:1' ||
      v?.colorPrimaries !== 'bt709' || v?.colorTransfer !== 'bt709' ||
      v?.colorSpace !== 'bt709' || v?.colorRange !== 'tv' ||
      v?.profile !== 'High' || v?.level !== '4.1' ||
      v?.preset !== 'veryfast' || v?.crf !== 23 ||
      v?.keyframeInterval !== 60 || v?.threads !== 2) {
    throw new Error('045 requires locked 1080p30 SDR BT709 H264 High/yuv420p encoding');
  }
  if (a?.encoder !== 'aac' || a?.codec !== 'aac' || a?.profile !== 'LC' ||
      a?.bitRate !== '128k' || a?.sampleRate !== 48000 ||
      a?.channels !== 2 || a?.channelLayout !== 'stereo') {
    throw new Error('045 requires AAC-LC stereo 48000Hz 128k');
  }
  if (q?.durationSeconds !== 8 || q?.frames !== 240 ||
      q?.sourceVideo !== 'testsrc2' || q?.sourceAudio !== 'sine_440hz' ||
      q?.outputDirectory !== '.tmp-export-045' ||
      q?.outputFilename !== '045-original-synthetic-1080p.mp4') {
    throw new Error('045 only permits bounded original 8s synthetic inputs');
  }
  if (m?.targetFrames !== 1800 || m?.targetSeconds !== 60 ||
      typeof m?.description !== 'string')throw new Error('045 must respect 044 master timeline');
  return p;
}

/** Refuse to silently turn 045 into a real P60 export. */
export function validateUnreleasedPilot(script,timeline) {
  if(script?.planning_only !== true || script?.render_authorized !== false ||
      script?.publish_authorized !== false || script?.target?.width !== 1920 ||
      script?.target?.height !== 1080 || script?.target?.fps !== 30 ||
      script?.target?.duration_frames !== 1800 ||
      script?.target?.audio_sample_rate_hz !== 48000 ||
      script?.target?.audio_channels !== 2) {
    throw new Error('037 real pilot render authorization is not granted');
  }
  if(timeline?.status !== 'SYNTHETIC_INTERNAL_PROOF_ONLY' ||
      timeline?.release?.productionRenderAuthorized !== false ||
      timeline?.release?.renderAuthorized !== false ||
      timeline?.release?.publishAuthorized !== false ||
      timeline?.release?.privateObservationFootageUsed !== false ||
      timeline?.release?.originalBrandMediaUsed !== false ||
      timeline?.release?.thirdPartyMusicUsed !== false ||
      timeline?.master?.frames !== 1800 || timeline?.master?.fps !== 30 ||
      timeline?.master?.width !== 1920 || timeline?.master?.height !== 1080 ||
      timeline?.master?.audioSampleRate !== 48000) {
    throw new Error('044 internal proxy does not authorize real P60 render');
  }
  return true;
}

export function readAndCheckInputs() {
  const preset=validatePreset(loadPreset());
  const pilot=JSON.parse(readFileSync(lockedScript,'utf8'));
  const timeline=JSON.parse(readFileSync(lockedTimeline,'utf8'));
  validateUnreleasedPilot(pilot,timeline);
  return preset;
}

/** Build a fixed argv vector, never a command string or user-specified URLs. */
export function syntheticFfmpegArgs(p, output) {
  validatePreset(p);
  if (typeof output !== 'string' || !output.endsWith('/.tmp-export-045/045-original-synthetic-1080p.mp4') ||
      output.includes('\0')) throw new Error('045 synthetic output path must stay in isolated QA folder');
  return [
    '-nostdin','-hide_banner','-loglevel','error','-y',
    '-f','lavfi','-i','testsrc2=size=1920x1080:rate=30:duration=8',
    '-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=8',
    '-map','0:v:0','-map','1:a:0',
    '-filter_threads','2','-threads:v','2',
    '-vf','format=yuv420p,setsar=1',
    '-c:v',p.video.encoder,
    '-preset',p.video.preset,'-crf',String(p.video.crf),
    '-profile:v',p.video.profile.toLowerCase(),'-level:v',p.video.level,
    '-pix_fmt',p.video.pixelFormat,
    '-r','30','-fps_mode','cfr',
    '-g',String(p.video.keyframeInterval),'-x264-params','threads=2',
    '-color_primaries',p.video.colorPrimaries,
    '-color_trc',p.video.colorTransfer,
    '-colorspace',p.video.colorSpace,
    '-color_range',p.video.colorRange,
    '-c:a',p.audio.encoder,'-profile:a','aac_low','-b:a',p.audio.bitRate,
    '-ar',String(p.audio.sampleRate),'-ac',String(p.audio.channels),
    '-t',String(p.syntheticProof.durationSeconds),
    '-frames:v',String(p.syntheticProof.frames),
    '-movflags','+faststart',
    '-metadata','title=BlueDotAtlas 045 ORIGINAL SYNTHETIC QA ONLY',
    '-f','mp4',output,
  ];
}
