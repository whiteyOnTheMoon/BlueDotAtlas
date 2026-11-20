import { Composition } from 'remotion';
import { TenSecondProof } from './TenSecondProof';
import { FootageProof } from './FootageProof';
import { FOOTAGE_PROOF_FRAMES } from './footage-plan.js';
import { VIDEO_PROFILE } from './profile.js';

export const RemotionRoot = () => (
  <>
  <Composition
    id="BDA038TenSecondProof"
    component={TenSecondProof}
    width={VIDEO_PROFILE.width}
    height={VIDEO_PROFILE.height}
    fps={VIDEO_PROFILE.fps}
    durationInFrames={VIDEO_PROFILE.proofFrames}
  />
  <Composition
    id="BDA039FootageProof"
    component={FootageProof}
    width={VIDEO_PROFILE.width}
    height={VIDEO_PROFILE.height}
    fps={VIDEO_PROFILE.fps}
    durationInFrames={FOOTAGE_PROOF_FRAMES}
  />
  </>
);
