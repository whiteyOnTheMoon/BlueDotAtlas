import { VIDEO_PROFILE } from './profile.js';

export const SCIENCE_PROOF_FRAMES = 270;
export const SCIENCE_FPS = VIDEO_PROFILE.fps;

export const SCIENCE_COLORS = Object.freeze({
  background: '#071522',
  panel: '#0E2942',
  ocean: '#19B7F4',
  oceanDeep: '#021934',
  moisture: '#37D6C4',
  iceWhite: '#F2F9FF',
  muted: '#B4CCDC',
  heat: '#FFC178',
});

export const SCIENCE_SOURCE_URLS = Object.freeze([
  'https://oceanservice.noaa.gov/facts/how-hurricanes-form.html',
  'https://www.nesdis.noaa.gov/about/k-12-education/severe-weather/how-does-hurricane-form',
]);

export const SCIENCE_LABELS = Object.freeze({
  heading: 'How ocean moisture fuels convection',
  subheading: 'SCHEMATIC · NOT TO SCALE · NOT AN OBSERVATION',
  phaseOne: '01   EVAPORATION',
  phaseTwo: '02   RISING MOIST AIR',
  phaseThree: '03   CONDENSATION',
  phaseOneDetail: 'Water vapor enters the air',
  phaseTwoDetail: 'Moist air rises and cools',
  phaseThreeDetail: 'Water vapor forms droplets',
  energy: 'LATENT HEAT RELEASED',
  caveat: 'Warm water alone is not enough to form a hurricane.',
  attribution: 'Science basis: NOAA Ocean Service · NOAA NESDIS',
});

/** Pure timeline gate: 3 seconds minimum, 30 seconds maximum, no full film.
 * @param {number} durationInFrames
 */
export function validateScienceDuration(durationInFrames) {
  if (!Number.isInteger(durationInFrames) || durationInFrames < 90 || durationInFrames > 900) {
    throw new RangeError('Science scene must be a bounded 3–30-second clip');
  }
  return durationInFrames;
}

/** @param {number} frame @param {number} durationInFrames */
export function canonicalFrame(frame, durationInFrames = SCIENCE_PROOF_FRAMES) {
  validateScienceDuration(durationInFrames);
  if (!Number.isInteger(frame) || frame < 0 || frame >= durationInFrames) {
    throw new RangeError('Science frame must be inside the composition');
  }
  return (frame / (durationInFrames - 1)) * (SCIENCE_PROOF_FRAMES - 1);
}

/**
 * A deliberately qualitative progression. These values are illustration
 * opacities and line-draw progress, NOT measurements of hurricane strength,
 * latent heat, temperatures, cloud height, motion rates or causal magnitude.
 * @param {number} frame
 * @param {number} durationInFrames
 */
export function scienceStateAt(frame, durationInFrames = SCIENCE_PROOF_FRAMES) {
  const f = canonicalFrame(frame, durationInFrames);
  /** @param {number} start @param {number} end */
  const smooth = (start, end) => {
    const t = Math.max(0, Math.min(1, (f - start) / (end - start)));
    return t * t * (3 - 2 * t);
  };
  return Object.freeze({
    evaporation: smooth(6, 88),
    rising: smooth(58, 170),
    condensation: smooth(142, 222),
    heatRelease: smooth(181, 263),
    phase: f < 90 ? 'evaporation' : f < 182 ? 'rising' : 'condensation',
  });
}

/**
 * Vector-only illustrative vapor position; screen coordinates, not geographic
 * coordinates or atmospheric measurements.
 * @param {number} frame
 * @param {number} index
 * @param {number} durationInFrames
 */
export function scienceVaporParticle(frame, index, durationInFrames = SCIENCE_PROOF_FRAMES) {
  const f = canonicalFrame(frame, durationInFrames);
  if (!Number.isInteger(index) || index < 0 || index > 11) {
    throw new RangeError('Only 12 bounded decorative vapor particles');
  }
  const progress = ((f * 1.7 + index * 29) % 230) / 230;
  const stage = scienceStateAt(frame, durationInFrames);
  return Object.freeze({
    x: 400 + Math.sin(progress * Math.PI * 3 + index) * 54,
    y: 757 - progress * 340,
    opacity: Math.max(0, (1 - progress) * 0.74 * stage.evaporation),
    radius: 5 + (index % 3) * 2,
  });
}
