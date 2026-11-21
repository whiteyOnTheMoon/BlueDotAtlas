import { VIDEO_PROFILE } from './profile.js';

export const PILOT_PRIVATE_046 = Object.freeze({
  status: 'PRIVATE_VISUAL_ROUGH_CUT_ONLY',
  frames: 1800,
  fps: VIDEO_PROFILE.fps,
  width: VIDEO_PROFILE.width,
  height: VIDEO_PROFILE.height,
  narrationIncluded: false,
  thirdPartyAudioIncluded: false,
  renderAuthorized: false,
  publicationAuthorized: false,
});

// Fixed 044 shot boundaries. All sources are original, SHA-verified operator-side
// files staged privately. The two NOAA sources are deliberately muted.
/** @type {ReadonlyArray<{
 * id: string; kind: string;
 * from: number; durationInFrames: number; assetId: string|null;
 * caption: string; credit: string;
 * }>} */
export const PILOT_PRIVATE_046_SHOTS = Object.freeze([
  { id: 'S00', kind: 'brand_intro', from: 0, durationInFrames: 75, assetId: null, caption: '', credit: '' },
  { id: 'S01', kind: 'footage', from: 66, durationInFrames: 213, assetId: 'P60-VID-001', caption: 'Tropical Cyclone Oma · 2019', credit: 'NASA JSC · ISS Expedition 58' },
  { id: 'S02', kind: 'footage', from: 279, durationInFrames: 222, assetId: 'P60-VID-005', caption: 'North Atlantic waves · 2021 · Illustrative only', credit: 'NOAA Ocean Exploration · not hurricane footage' },
  { id: 'S03', kind: 'science', from: 501, durationInFrames: 223, assetId: null, caption: 'Ocean moisture rises · Schematic', credit: 'Original BlueDotAtlas science animation' },
  { id: 'S04', kind: 'science', from: 724, durationInFrames: 260, assetId: null, caption: 'Condensation releases heat · Schematic', credit: 'Original BlueDotAtlas science animation' },
  { id: 'S05', kind: 'science', from: 984, durationInFrames: 239, assetId: null, caption: 'Atmospheric circulation · Schematic', credit: 'Warm water alone is not enough' },
  { id: 'S06', kind: 'footage', from: 1223, durationInFrames: 207, assetId: 'P60-VID-003', caption: 'Hurricane Helene · 2024', credit: 'Nick Underwood / NOAA OMAO · Hurricane Hunter' },
  { id: 'S07', kind: 'science', from: 1430, durationInFrames: 199, assetId: null, caption: 'Less ocean energy can weaken storms · Schematic', credit: 'Impacts may persist over land' },
  { id: 'S08', kind: 'brand_outro', from: 1620, durationInFrames: 180, assetId: null, caption: '', credit: '' },
].map((shot) => Object.freeze(shot)));

export const PRIVATE_046_MEDIA = Object.freeze({
  'P60-VID-001': 'pilot/.private-046/P60-VID-001.mp4',
  'P60-VID-003': 'pilot/.private-046/P60-VID-003.mp4',
  'P60-VID-005': 'pilot/.private-046/P60-VID-005.mp4',
});

/** @param {typeof PILOT_PRIVATE_046_SHOTS} shots */
export function validatePilotPrivate046(shots = PILOT_PRIVATE_046_SHOTS) {
  const expected = ['S00', 'S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08'];
  if (PILOT_PRIVATE_046.frames !== 1800 || PILOT_PRIVATE_046.fps !== 30 ||
      PILOT_PRIVATE_046.renderAuthorized !== false ||
      PILOT_PRIVATE_046.publicationAuthorized !== false ||
      PILOT_PRIVATE_046.thirdPartyAudioIncluded !== false ||
      PILOT_PRIVATE_046.narrationIncluded !== false ||
      shots.length !== 9) throw new Error('046 private rough cut contract changed');
  const coverage = new Uint8Array(1800);
  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    if (!shot) throw new Error('046 missing shot');
    if (shot.id !== expected[i] || !Number.isInteger(shot.from) ||
        !Number.isInteger(shot.durationInFrames) ||
        shot.from < 0 || shot.durationInFrames < 60 ||
        shot.from + shot.durationInFrames > 1800) throw new Error('046 shot contract invalid');
    const expectedKind = i === 0 ? 'brand_intro' : i === 8 ? 'brand_outro' :
      [1, 2, 6].includes(i) ? 'footage' : 'science';
    if (shot.kind !== expectedKind) throw new Error('046 shot type changed');
    if (shot.kind === 'footage') {
      const expectedAsset = i === 1 ? 'P60-VID-001' : i === 2 ? 'P60-VID-005' : 'P60-VID-003';
      if (shot.assetId !== expectedAsset || typeof shot.assetId !== 'string' ||
          !Object.hasOwn(PRIVATE_046_MEDIA, shot.assetId) ||
          !shot.caption || !shot.credit) throw new Error('046 source or credit changed');
    } else if (shot.assetId !== null) throw new Error('046 unexpected footage');
    if (i > 0) {
      const previous = shots[i - 1];
      if (!previous) throw new Error('046 prior shot missing');
      const overlap = previous.from + previous.durationInFrames - shot.from;
      if (overlap !== (i === 1 || i === 8 ? 9 : 0)) throw new Error('046 shot gap or invalid transition');
    }
    for (let f = shot.from; f < shot.from + shot.durationInFrames; f++) coverage[f]++;
  }
  for (let f = 0; f < 1800; f++) {
    if (coverage[f] !== ((f >= 66 && f < 75) || (f >= 1620 && f < 1629) ? 2 : 1)) {
      throw new Error('046 timeline coverage or brand crossfade invalid');
    }
  }
  return true;
}
