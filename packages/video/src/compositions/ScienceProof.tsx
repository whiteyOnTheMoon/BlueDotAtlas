import { AbsoluteFill } from 'remotion';
import { ScienceScene } from './ScienceScene';
import { SCIENCE_PROOF_FRAMES } from './science-plan.js';

// Pure educational process schematic. No external footage, climate figures, or audio.
export const ScienceProof = () => (
  <AbsoluteFill>
    <ScienceScene durationInFrames={SCIENCE_PROOF_FRAMES} />
  </AbsoluteFill>
);
