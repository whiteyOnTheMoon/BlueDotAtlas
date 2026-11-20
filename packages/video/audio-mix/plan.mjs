import { readFileSync } from 'node:fs';

export const MIX_043 = Object.freeze({
  status: 'SYNTHETIC_QA_ONLY',
  sampleRate: 48000,
  channels: 2,
  seconds: 16,
  outroStartSeconds: 10,
  outroSeconds: 6,
  brandCrossfadeFrames: 9,
  frameRate: 30,
  fadeInSeconds: 0.5,
  fadeOutSeconds: 0.8,
  introAudioFadeOutSeconds: 0.3,
  voiceGain: 0.82,
  musicGain: 0.22,
  ambienceGain: 0.08,
  introGain: 0.2,
  duckingDepth: 0.72,
  voiceWindow: Object.freeze({ start: 2.5, end: 8.5 }),
  duckAttackSeconds: 0.35,
  duckReleaseSeconds: 0.45,
});

/**
 * Track-level rights gate. A synthetic CI fixture is never a licensed
 * soundtrack and may never silently be upgraded for production.
 * @param {{source:string, licenseStatus:string, releaseAuthorized:boolean}} track
 * @param {boolean} testOnly
 */
export function validateMusicRights(track, testOnly = true) {
  if (!track || typeof track !== 'object') throw new Error('Soundtrack metadata required');
  if (!testOnly) throw new Error('043 cannot authorize production or any external music track');
  if (track.source !== 'GENERATED_ORIGINAL_TEST_TONES' ||
      track.licenseStatus !== 'SYNTHETIC_QA_ONLY' ||
      track.releaseAuthorized !== false) {
    throw new Error('Unreviewed third-party music is prohibited in 043 QA');
  }
  return true;
}

/** @param {any} pilot */
export function buildAudioProofPlan(pilot) {
  if (!pilot || pilot.planning_only !== true ||
      pilot.render_authorized !== false || pilot.publish_authorized !== false) {
    throw new Error('Unreleased 037 pilot flags cannot be bypassed');
  }
  if (pilot.target?.fps !== MIX_043.frameRate ||
      pilot.target?.duration_frames !== 1800 ||
      pilot.target?.audio_channels !== 2 ||
      pilot.target?.audio_sample_rate_hz !== MIX_043.sampleRate) {
    throw new Error('037 audio master profile mismatch');
  }
  if (MIX_043.outroStartSeconds + MIX_043.outroSeconds !== MIX_043.seconds ||
      MIX_043.brandCrossfadeFrames !== MIX_043.frameRate * MIX_043.introAudioFadeOutSeconds) {
    throw new Error('Brand crossfade or outro duration rule broken');
  }
  validateMusicRights({
    source: 'GENERATED_ORIGINAL_TEST_TONES',
    licenseStatus: 'SYNTHETIC_QA_ONLY',
    releaseAuthorized: false,
  });
  return Object.freeze({
    ...MIX_043,
    published: false,
    filmAuthorized: false,
    musicRights: 'ORIGINAL_SYNTHETIC_QA_ONLY',
    voiceSource: 'SYNTHETIC_GATE_SIGNAL_NOT_REAL_NARRATION',
    originalBrandMediaIncluded: false,
    outputName: '043-audio-mix-review.wav',
    bedName: '043-ducked-bed-review.wav',
  });
}

/**
 * Frame-evaluated smooth gain automation, not a compressor or a measurement
 * of real speech loudness. Actual 042 voice timeline is integrated in 044.
 * @param {ReturnType<typeof buildAudioProofPlan>} plan
 */
export function musicGainExpression(plan) {
  const { voiceWindow, duckAttackSeconds, duckReleaseSeconds, duckingDepth, musicGain } = plan;
  const start = voiceWindow.start - duckAttackSeconds;
  const finish = voiceWindow.end + duckReleaseSeconds;
  if (!(start > 0 && voiceWindow.start < voiceWindow.end &&
    voiceWindow.end < plan.outroStartSeconds &&
    finish < plan.outroStartSeconds &&
    musicGain > 0 && musicGain <= 0.5 &&
    duckingDepth > 0 && duckingDepth < 0.95)) {
    throw new Error('Invalid ducking window or music headroom');
  }
  const enter = `max(0,min((t-${start.toFixed(2)})/${duckAttackSeconds.toFixed(2)},1))`;
  const leave = `max(0,min((${finish.toFixed(2)}-t)/${duckReleaseSeconds.toFixed(2)},1))`;
  return `${musicGain}*(1-${duckingDepth}*${enter}*${leave})`;
}

/**
 * Four separate input WAVs: [voice, synthetic bed, synthetic ambience,
 * synthetic intro tone]. Two outputs: audible QA mix and exposed music stem.
 * @param {ReturnType<typeof buildAudioProofPlan>} plan
 */
export function filterGraph(plan) {
  const d = plan.seconds;
  const fadeAt = d - plan.fadeOutSeconds;
  const introFadeAt = 2.5 - plan.introAudioFadeOutSeconds;
  const musicVolume = musicGainExpression(plan);
  return [
    `[0:a]aresample=${plan.sampleRate},aformat=channel_layouts=stereo,atrim=duration=${d},apad=whole_dur=${d},volume=${plan.voiceGain}[voice]`,
    `[1:a]aresample=${plan.sampleRate},aformat=channel_layouts=stereo,atrim=duration=${d},volume='${musicVolume}':eval=frame,afade=t=in:st=0:d=${plan.fadeInSeconds},afade=t=out:st=${fadeAt}:d=${plan.fadeOutSeconds},asplit=2[music][musicqa]`,
    `[2:a]aresample=${plan.sampleRate},aformat=channel_layouts=stereo,atrim=duration=${d},volume=${plan.ambienceGain},afade=t=out:st=${fadeAt}:d=${plan.fadeOutSeconds}[ambience]`,
    `[3:a]aresample=${plan.sampleRate},aformat=channel_layouts=stereo,atrim=duration=${d},volume=${plan.introGain},afade=t=out:st=${introFadeAt}:d=${plan.introAudioFadeOutSeconds}[intro]`,
    '[voice][music][ambience][intro]amix=inputs=4:duration=first:normalize=0,alimiter=limit=0.90:attack=5:release=50:latency=1[mixed]',
  ].join(';');
}

/** Only for deterministic source tests; no runtime/public release. */
export function loadLockedPilot() {
  return JSON.parse(readFileSync(new URL('../../../docs/pilot/60s-script.json', import.meta.url), 'utf8'));
}
