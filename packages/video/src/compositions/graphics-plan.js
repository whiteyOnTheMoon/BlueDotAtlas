import { VIDEO_PROFILE } from './profile.js';

// Only already-approved brand colors. A translucent navy scrim keeps text legible
// even over bright imagery; typography and source labels are not scientific data.
export const GRAPHICS_PALETTE = Object.freeze({
  deepSea: '#021934',
  deepNight: '#071522',
  iceWhite: '#F2F9FF',
  muted: '#B4CCDC',
  blueDot: '#19B7F4',
  glacier: '#37D6C4',
});

export const GRAPHICS_LAYOUT = Object.freeze({
  left: VIDEO_PROFILE.safeMarginX,
  bottom: VIDEO_PROFILE.safeMarginY,
  width: 780,
  fadeFrames: 12,
});
export const GRAPHICS_PROOF_FRAMES = 240;

/**
 * @typedef {{
 * kind: 'location' | 'metric';
 * eyebrow: string;
 * title: string;
 * detail: string;
 * date: string | null;
 * source: string;
 * metricValue: number | null;
 * metricUnit: string | null;
 * }} GraphicSpec
 */

/**
 * @typedef {{
 * id: string;
 * from: number;
 * durationInFrames: number;
 * graphic: GraphicSpec;
 * }} GraphicCue
 */

/** @type {ReadonlyArray<GraphicCue>} */
export const GRAPHICS_PROOF_CUES = Object.freeze([
  Object.freeze({
    id: 'G01',
    from: 0,
    durationInFrames: 76,
    graphic: Object.freeze({
      kind: 'location',
      eyebrow: 'ISS OBSERVATION · SOURCE CONTEXT',
      title: 'Tropical Cyclone Oma',
      detail: 'Coral Sea · NASA Johnson Space Center',
      date: '2019-02-20',
      source: 'NASA/JSC · Expedition 58',
      metricValue: null,
      metricUnit: null,
    }),
  }),
  Object.freeze({
    id: 'G02',
    from: 88,
    durationInFrames: 76,
    graphic: Object.freeze({
      kind: 'location',
      eyebrow: 'ILLUSTRATIVE OCEAN FOOTAGE',
      title: 'North Atlantic',
      detail: 'Wind-driven waves · not hurricane footage',
      date: '2021',
      source: 'NOAA Ocean Exploration · 2021 expedition',
      metricValue: null,
      metricUnit: null,
    }),
  }),
  Object.freeze({
    id: 'G03',
    from: 176,
    durationInFrames: 30,
    graphic: Object.freeze({
      kind: 'metric',
      eyebrow: 'TECHNICAL SAMPLE · NOT CLIMATE DATA',
      title: 'Output frame rate',
      detail: 'Full HD motion-graphics proof',
      date: null,
      source: 'BlueDotAtlas · video project profile',
      metricValue: VIDEO_PROFILE.fps,
      metricUnit: 'fps',
    }),
  }),
]);

const textBounded = (value, max) =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= max &&
  !/[\n\r\t<>]/.test(value);

/** Only explicit year or real YYYY-MM-DD source dates, never invented day precision. */
export function isValidSourceDate(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})(?:-(\d{2})-(\d{2}))?$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  if (year < 1900 || year > 2100) return false;
  if (!match[2]) return true;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/** @param {GraphicSpec} graphic */
export function validateGraphic(graphic) {
  if (!graphic || typeof graphic !== 'object') throw new TypeError('Graphic required');
  if (graphic.kind !== 'location' && graphic.kind !== 'metric') {
    throw new RangeError('Unknown graphic kind');
  }
  if (
    !textBounded(graphic.eyebrow, 45) ||
    !textBounded(graphic.title, 30) ||
    !textBounded(graphic.detail, 65) ||
    !textBounded(graphic.source, 58)
  ) {
    throw new RangeError('Required provenance and short, legible text');
  }
  if (graphic.kind === 'location') {
    if (!isValidSourceDate(graphic.date)) throw new Error('Location requires truthful source date');
    if (graphic.metricValue !== null || graphic.metricUnit !== null) {
      throw new Error('Location overlay must not imply a measurement');
    }
  } else {
    if (graphic.date !== null) throw new Error('Metric must not invent a source date');
    if (
      typeof graphic.metricValue !== 'number' ||
      !Number.isFinite(graphic.metricValue) ||
      graphic.metricValue < 0
    ) {
      throw new RangeError('Only finite nonnegative measured values');
    }
    if (!textBounded(graphic.metricUnit, 12)) throw new Error('Metric requires unit');
  }
  return graphic;
}

/** @param {number} frame local frame */
/** @param {number} durationInFrames total overlay lifetime */
export function graphicOpacity(frame, durationInFrames) {
  const fade = GRAPHICS_LAYOUT.fadeFrames;
  if (
    !Number.isInteger(durationInFrames) ||
    durationInFrames < 2 * fade + 1 ||
    !Number.isInteger(frame) ||
    frame < 0 ||
    frame >= durationInFrames
  ) {
    throw new RangeError('Graphic frame outside bounded fade timeline');
  }
  const entering = Math.min(1, frame / (fade - 1));
  const leaving = Math.min(1, (durationInFrames - 1 - frame) / (fade - 1));
  const t = Math.max(0, Math.min(entering, leaving));
  return t * t * (3 - 2 * t);
}

/** @param {ReadonlyArray<GraphicCue>} cues */
export function validateGraphicTimeline(cues) {
  if (!Array.isArray(cues) || cues.length !== 3) {
    throw new Error('Synthetic proof must show precisely three overlay types/examples');
  }
  let previousEnd = 0;
  for (const cue of cues) {
    if (
      !textBounded(cue.id, 12) ||
      !Number.isInteger(cue.from) ||
      !Number.isInteger(cue.durationInFrames) ||
      cue.from < previousEnd ||
      cue.durationInFrames < 2 * GRAPHICS_LAYOUT.fadeFrames + 1
    ) {
      throw new RangeError('Overlapping or unbounded graphic cue');
    }
    validateGraphic(cue.graphic);
    previousEnd = cue.from + cue.durationInFrames;
  }
  if (previousEnd > GRAPHICS_PROOF_FRAMES - 30) {
    throw new Error('Every proof must finish with at least one empty second');
  }
  return true;
}
