import { Composition } from 'remotion';
import { TenSecondProof } from './TenSecondProof';
import { VIDEO_PROFILE } from './profile.js';

export const RemotionRoot = () => (
  <Composition
    id="BDA038TenSecondProof"
    component={TenSecondProof}
    width={VIDEO_PROFILE.width}
    height={VIDEO_PROFILE.height}
    fps={VIDEO_PROFILE.fps}
    durationInFrames={VIDEO_PROFILE.proofFrames}
  />
);
