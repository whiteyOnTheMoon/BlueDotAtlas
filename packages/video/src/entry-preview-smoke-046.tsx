// Synthetic-only CI renderer entrypoint for Roadmap 046.
// Never references operator originals, brand files or the private audio stage.
import { Composition, registerRoot } from 'remotion';

const SyntheticStill046 = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: '#071522',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#f2f9ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: 68,
    }}
  >
    <div style={{ border: '12px solid #37d6c4', padding: 80 }}>
      046 SYNTHETIC OFFLINE STILL
    </div>
  </div>
);

const SyntheticRoot046 = () => (
  <Composition
    id="BDA046SyntheticStillSmoke"
    component={SyntheticStill046}
    fps={30}
    durationInFrames={1}
    width={1920}
    height={1080}
  />
);

registerRoot(SyntheticRoot046);
