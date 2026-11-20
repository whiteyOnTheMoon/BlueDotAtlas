// Roadmap 039: private, byte-verified proof ONLY. Never a 60s render authorization.
export const PRIVATE_ORIGINALS = Object.freeze({
  'P60-VID-001': Object.freeze({
    relativePath: 'pilot/.private-039/P60-VID-001.mp4',
    event: 'Tropical Cyclone Oma (2019) · NASA JSC / ISS',
    aspect: '3:2',
  }),
  'P60-VID-005': Object.freeze({
    relativePath: 'pilot/.private-039/P60-VID-005.mp4',
    event: 'Wind-driven North Atlantic waves (2021) · NOAA Ocean Exploration',
    aspect: '16:9',
  }),
});

export const FOOTAGE_PROOF_FRAMES = 180;

/**
 * @typedef {object} FootageShotSpec
 * @property {string} id
 * @property {string} assetId
 * @property {number} from
 * @property {number} durationInFrames
 * @property {number} trimBefore
 * @property {number} playbackRate
 * @property {'cover' | 'contain'} fit
 * @property {number} focalX
 * @property {number} focalY
 * @property {number} brightness
 * @property {number} contrast
 * @property {number} saturation
 */

/** @type {ReadonlyArray<FootageShotSpec>} */
export const PRIVATE_PROOF_SHOTS = Object.freeze([
  Object.freeze({
    id: 'F01',
    assetId: 'P60-VID-001',
    from: 0,
    durationInFrames: 60,
    trimBefore: 15,
    playbackRate: 1,
    fit: 'contain',
    focalX: 50,
    focalY: 50,
    brightness: 1,
    contrast: 1,
    saturation: 1,
  }),
  Object.freeze({
    id: 'F02',
    assetId: 'P60-VID-005',
    from: 60,
    durationInFrames: 60,
    trimBefore: 60,
    playbackRate: 1.15,
    fit: 'cover',
    focalX: 50,
    focalY: 50,
    brightness: 1,
    contrast: 1,
    saturation: 1,
  }),
  Object.freeze({
    id: 'F03',
    assetId: 'P60-VID-001',
    from: 120,
    durationInFrames: 60,
    trimBefore: 240,
    playbackRate: 0.85,
    fit: 'contain',
    focalX: 50,
    focalY: 50,
    brightness: 1,
    contrast: 1,
    saturation: 1,
  }),
]);

/** @param {FootageShotSpec} shot */
export function validateFootageShot(shot) {
  if (!shot || typeof shot !== 'object') throw new TypeError('Shot required');
  if (!Object.hasOwn(PRIVATE_ORIGINALS, shot.assetId)) {
    throw new Error('Only previously selected 036 private-test sources are permitted');
  }
  if (
    !Number.isInteger(shot.from) || shot.from < 0 ||
    !Number.isInteger(shot.durationInFrames) || shot.durationInFrames < 0 ||
    !Number.isInteger(shot.trimBefore) || shot.trimBefore < 0
  ) {
    throw new RangeError('Frame positions must be nonnegative integers');
  }
  if (shot.durationInFrames < 10 || shot.durationInFrames > 150) {
    throw new RangeError('Bounded shots only; never bypass full-film render gate');
  }
  if (!Number.isFinite(shot.playbackRate) || shot.playbackRate < 0.75 || shot.playbackRate > 1.25) {
    throw new RangeError('Only moderate forward playback speed is permitted');
  }
  if (shot.fit !== 'contain' && shot.fit !== 'cover') {
    throw new RangeError('Only contain or cover preserves the source aspect ratio');
  }
  for (const value of [shot.focalX, shot.focalY]) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new RangeError('Focal point must be 0–100%');
    }
  }
  for (const value of [shot.brightness, shot.contrast, shot.saturation]) {
    if (!Number.isFinite(value) || value < 0.9 || value > 1.1) {
      throw new RangeError('Only mild SDR adjustments in 0.9–1.1 permitted');
    }
  }
  if (shot.assetId === 'P60-VID-001' && shot.fit !== 'contain') {
    throw new Error('3:2 NASA source must keep original framing in this proof');
  }
  return shot;
}

/** @param {ReadonlyArray<FootageShotSpec>} shots */
export function validatePrivateProofTimeline(shots) {
  if (shots.length !== 3) throw new RangeError('Exactly 3 short moving excerpts');
  let cursor = 0;
  for (const shot of shots) {
    validateFootageShot(shot);
    if (shot.from !== cursor) throw new Error('Shots must join without gap or overlap');
    cursor += shot.durationInFrames;
  }
  if (cursor !== FOOTAGE_PROOF_FRAMES) throw new Error('Expected exactly 180 frames');
  if (new Set(shots.map((shot) => shot.assetId)).size !== 2) {
    throw new Error('Two genuinely different original source clips are required');
  }
  return true;
}
