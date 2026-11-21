import { Composition } from 'remotion';
import { PilotPrivateVisual046 } from './PilotPrivateVisual046';
import { PILOT_PRIVATE_046, validatePilotPrivate046 } from './pilot-private-046-plan.js';

validatePilotPrivate046();

export const PilotPrivateRoot046 = () => (
  <Composition
    id="BDA046PrivateVisualRoughCut"
    component={PilotPrivateVisual046}
    width={PILOT_PRIVATE_046.width}
    height={PILOT_PRIVATE_046.height}
    fps={PILOT_PRIVATE_046.fps}
    durationInFrames={PILOT_PRIVATE_046.frames}
  />
);
