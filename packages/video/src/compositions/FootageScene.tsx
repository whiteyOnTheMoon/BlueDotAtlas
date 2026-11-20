import type { CSSProperties } from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import { PRIVATE_ORIGINALS, validateFootageShot } from './footage-plan.js';
import type { FootageShotSpec } from './footage-plan.js';

export const FootageScene = ({ shot }: { shot: FootageShotSpec }) => {
  validateFootageShot(shot);
  const asset = PRIVATE_ORIGINALS[shot.assetId as keyof typeof PRIVATE_ORIGINALS];
  if (!asset) throw new Error('No approved private-test source');
  // A nonblack brand matte surrounds 3:2 NASA footage; do not stretch or
  // silently crop it to a false 16:9 original. Wide NOAA footage fills the frame.
  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: shot.fit,
    objectPosition: shot.focalX + '% ' + shot.focalY + '%',
    filter:
      'brightness(' +
      shot.brightness +
      ') contrast(' +
      shot.contrast +
      ') saturate(' +
      shot.saturation +
      ')',
  };
  return (
    <AbsoluteFill style={{ backgroundColor: '#0b3045' }}>
      <OffthreadVideo
        src={staticFile(asset.relativePath)}
        muted
        toneMapped
        trimBefore={shot.trimBefore}
        durationInFrames={Math.ceil(shot.durationInFrames * shot.playbackRate)}
        playbackRate={shot.playbackRate}
        style={style}
      />
    </AbsoluteFill>
  );
};
