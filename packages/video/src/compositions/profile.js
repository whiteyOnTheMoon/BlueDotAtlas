// Shared ESM profile: tested without invoking Remotion or authorizing P60 rendering.
export const VIDEO_PROFILE = Object.freeze({
  width: 1920,
  height: 1080,
  fps: 30,
  safeMarginX: 160,
  safeMarginY: 108,
  crossfadeFrames: 9,
  introFrames: 75,
  outroFrames: 180,
  proofFrames: 300,
});

export const BRAND_SOURCES = Object.freeze({
  intro: 'brand/motion/final/BlueDotAtlas Intro.mp4',
  outro: 'brand/motion/final/BlueDotAtlas_Outro.mp4',
});

/** @param {number} totalFrames */
export function planBrandTimeline(totalFrames) {
  const { introFrames, outroFrames, crossfadeFrames } = VIDEO_PROFILE;
  if (!Number.isInteger(totalFrames) || totalFrames <= 0) {
    throw new RangeError('Total frame count must be a positive integer');
  }
  const outroFrom = totalFrames - outroFrames;
  const contentFrom = introFrames - crossfadeFrames;
  const contentDuration = outroFrom + crossfadeFrames - contentFrom;
  if (contentDuration < 2 * crossfadeFrames) {
    throw new RangeError('Not enough room for both brand crossfades');
  }
  return Object.freeze({
    totalFrames,
    intro: Object.freeze({ from: 0, durationInFrames: introFrames }),
    content: Object.freeze({ from: contentFrom, durationInFrames: contentDuration }),
    outro: Object.freeze({ from: outroFrom, durationInFrames: outroFrames }),
  });
}

/**
 * Local alpha used by overlapping video layers.
 * @param {number} frame Local frame index.
 * @param {number} duration Layer duration in frames.
 * @param {number} fadeIn
 * @param {number} fadeOut
 */
export function layerOpacity(frame, duration, fadeIn, fadeOut) {
  if (!Number.isInteger(frame) || frame < 0 || frame >= duration) {
    throw new RangeError('Frame is outside the clip');
  }
  const enter = fadeIn === 0 ? 1 : Math.min(1, (frame + 1) / fadeIn);
  const leave = fadeOut === 0 ? 1 : Math.min(1, (duration - frame) / fadeOut);
  return Math.min(enter, leave);
}
