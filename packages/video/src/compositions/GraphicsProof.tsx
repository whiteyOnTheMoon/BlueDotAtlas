import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { GraphicsScene } from './GraphicsScene';
import { GRAPHICS_PROOF_CUES, validateGraphicTimeline } from './graphics-plan.js';

validateGraphicTimeline(GRAPHICS_PROOF_CUES);

/** Synthetic moving background only. No third-party image, footage, or data. */
export const GraphicsProof = () => {
  const frame = useCurrentFrame();
  const bright = frame >= 88 && frame < 164;
  return (
    <AbsoluteFill
      style={{
        background: bright
          ? 'linear-gradient(115deg, #a7dbe7 0%, #d7edf1 48%, #a1bed7 100%)'
          : 'linear-gradient(115deg, #071522 0%, #0d3c58 46%, #0e2942 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 1150,
          height: 580,
          borderRadius: '50%',
          left: 570 + Math.sin(frame / 39) * 170,
          top: 110 + Math.cos(frame / 51) * 100,
          background: bright ? 'rgba(25,183,244,0.13)' : 'rgba(55,214,196,0.10)',
          border: bright ? '6px solid rgba(2,25,52,0.08)' : '6px solid rgba(55,214,196,0.12)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 150,
          top: 92,
          fontSize: 23,
          color: bright ? '#021934' : '#F2F9FF',
          opacity: 0.85,
          letterSpacing: 1.5,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        SYNTHETIC GRAPHICS TEST · NOT OBSERVATIONAL FOOTAGE
      </div>
      {GRAPHICS_PROOF_CUES.map((cue) => (
        <Sequence
          key={cue.id}
          name={cue.id}
          from={cue.from}
          durationInFrames={cue.durationInFrames}
        >
          <GraphicsScene graphic={cue.graphic} durationInFrames={cue.durationInFrames} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
