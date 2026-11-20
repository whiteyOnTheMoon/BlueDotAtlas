import { AbsoluteFill, Sequence } from 'remotion';
import { FootageScene } from './FootageScene';
import { PRIVATE_PROOF_SHOTS, validatePrivateProofTimeline } from './footage-plan.js';

// CI ingests and verifies the two exact originals before this is ever rendered.
// No P60 publish/render rights are inferred from this short private proof.
validatePrivateProofTimeline(PRIVATE_PROOF_SHOTS);

export const FootageProof = () => (
  <AbsoluteFill style={{ backgroundColor: '#0b3045' }}>
    {PRIVATE_PROOF_SHOTS.map((shot) => (
      <Sequence
        key={shot.id}
        name={shot.id + ' ' + shot.assetId}
        from={shot.from}
        durationInFrames={shot.durationInFrames}
      >
        <FootageScene shot={shot} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
