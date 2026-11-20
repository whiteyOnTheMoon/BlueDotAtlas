import type { CSSProperties } from 'react';
import { useCurrentFrame } from 'remotion';
import {
  graphicOpacity,
  GRAPHICS_LAYOUT,
  GRAPHICS_PALETTE,
  validateGraphic,
} from './graphics-plan.js';
import type { GraphicSpec } from './graphics-plan.js';

/**
 * Composable informational overlay. Place it in its own Remotion <Sequence>
 * over real footage only after the source/rights context has been checked.
 * It intentionally draws no map pins, fake measurements, or brand logos.
 */
export const GraphicsScene = ({
  graphic,
  durationInFrames,
}: {
  graphic: GraphicSpec;
  durationInFrames: number;
}) => {
  validateGraphic(graphic);
  const frame = useCurrentFrame();
  const opacity = graphicOpacity(frame, durationInFrames);
  const panel: CSSProperties = {
    position: 'absolute',
    left: GRAPHICS_LAYOUT.left,
    bottom: GRAPHICS_LAYOUT.bottom,
    width: GRAPHICS_LAYOUT.width,
    boxSizing: 'border-box',
    padding: '23px 30px',
    borderLeft: '6px solid ' + GRAPHICS_PALETTE.glacier,
    borderRadius: 16,
    background:
      'linear-gradient(100deg, rgba(2,25,52,0.98) 0%, rgba(7,21,34,0.94) 100%)',
    color: GRAPHICS_PALETTE.iceWhite,
    opacity,
    transform: 'translateY(' + 14 * (1 - opacity) + 'px)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.32)',
    fontFamily: 'Inter, Arial, sans-serif',
    pointerEvents: 'none',
  };
  return (
    <div style={panel}>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 2,
          color: GRAPHICS_PALETTE.glacier,
          marginBottom: 10,
        }}
      >
        {graphic.eyebrow}
      </div>
      <div
        style={{
          fontSize: graphic.kind === 'metric' ? 44 : 52,
          fontWeight: 700,
          lineHeight: 1.12,
          marginBottom: 10,
          letterSpacing: -1,
        }}
      >
        {graphic.title}
      </div>
      {graphic.kind === 'metric' ? (
        <div style={{ fontSize: 60, fontWeight: 700, marginBottom: 8, lineHeight: 1.05 }}>
          {graphic.metricValue}
          <span
            style={{ fontSize: 34, fontWeight: 500, color: GRAPHICS_PALETTE.blueDot }}
          >
            {' ' + graphic.metricUnit}
          </span>
        </div>
      ) : (
        <div style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.3, marginBottom: 8 }}>
          {graphic.detail}
          <span style={{ color: GRAPHICS_PALETTE.blueDot }}>{' · ' + graphic.date}</span>
        </div>
      )}
      {graphic.kind === 'metric' && (
        <div style={{ fontSize: 29, marginBottom: 8, color: GRAPHICS_PALETTE.muted }}>
          {graphic.detail}
        </div>
      )}
      <div
        style={{
          fontSize: 26,
          lineHeight: 1.2,
          color: GRAPHICS_PALETTE.muted,
          paddingTop: 8,
          borderTop: '1px solid rgba(180,204,220,0.45)',
        }}
      >
        {'Source: ' + graphic.source}
      </div>
    </div>
  );
};
