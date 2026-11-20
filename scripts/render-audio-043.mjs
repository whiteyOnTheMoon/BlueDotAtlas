import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAudioProofPlan, filterGraph, loadLockedPilot } from '../packages/video/audio-mix/plan.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIR = resolve(ROOT, '.tmp-audio-043');

function call(args) {
  execFileSync('ffmpeg', ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', ...args], {
    cwd: ROOT,
    timeout: 90000,
    stdio: 'pipe',
  });
}

/** Original test sine/noise signals only. No commercial track or 042 voice. */
export function renderSyntheticMix() {
  if (process.env.CI !== 'true' || process.env.BDA_AUDIO_043_SYNTHETIC_PROOF !== 'TRUE') {
    throw new Error('043 media rendering requires explicit disposable CI-only opt-in');
  }
  const plan = buildAudioProofPlan(loadLockedPilot());
  mkdirSync(DIR, { recursive: true });
  const wav = (name) => resolve(DIR, name + '.wav');
  // Avoid synthetic notes resembling third-party music. These are sparse
  // original diagnostics for gain, continuity and clipping, not a song.
  call(['-f', 'lavfi', '-i', 'sine=frequency=380:duration=6:sample_rate=48000',
    '-af', 'volume=0.9,adelay=2500|2500,apad=whole_dur=16,atrim=duration=16',
    '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', wav('synthetic-voice-marker')]);
  call(['-f', 'lavfi', '-i', 'sine=frequency=176:duration=16:sample_rate=48000',
    '-af', 'volume=0.4', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', wav('original-music-marker')]);
  call(['-f', 'lavfi', '-i', 'anoisesrc=color=pink:amplitude=0.065:duration=16:sample_rate=48000:seed=43',
    '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', wav('original-ambient-marker')]);
  call(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=2.5:sample_rate=48000',
    '-af', 'volume=0.6,apad=whole_dur=16,atrim=duration=16',
    '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', wav('synthetic-intro-marker')]);

  call([
    '-i', wav('synthetic-voice-marker'),
    '-i', wav('original-music-marker'),
    '-i', wav('original-ambient-marker'),
    '-i', wav('synthetic-intro-marker'),
    '-filter_complex', filterGraph(plan),
    '-map', '[mixed]', '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2',
    resolve(DIR, plan.outputName),
    '-map', '[musicqa]', '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2',
    resolve(DIR, plan.bedName),
  ]);

  writeFileSync(resolve(DIR, '043-audio-mix-plan.json'), JSON.stringify({
    ...plan,
    originalWavAssets: false,
    voiceRecorded: false,
    musicLicenseApproved: false,
    wholeFilmRendered: false,
    ownerListeningReviewRequired: true,
    generatedTracks: [
      'synthetic-voice-marker', 'original-music-marker',
      'original-ambient-marker', 'synthetic-intro-marker',
    ],
  }, null, 2) + '\n');
  console.log('043 SYNTHETIC MIX CREATED: 16s WAV 48kHz/PCM16 stereo; no real music/voice/brand clips');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  renderSyntheticMix();
}
