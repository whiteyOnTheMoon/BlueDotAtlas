import { Audio } from '@remotion/media';
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {
  BRAND_SOURCES,
  layerOpacity,
  planBrandTimeline,
  VIDEO_PROFILE,
} from './profile.js';

const timeline = planBrandTimeline(VIDEO_PROFILE.proofFrames);

const FullFrameVideo = ({ src, opacity }: { src: string; opacity: number }) => (
  <AbsoluteFill style={{ opacity }}>
    <OffthreadVideo
      muted
      src={staticFile(src)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </AbsoluteFill>
);

const IntroPicture = () => {
  const frame = useCurrentFrame();
  return (
    <FullFrameVideo
      src={BRAND_SOURCES.intro}
      opacity={layerOpacity(
        frame,
        VIDEO_PROFILE.introFrames,
        0,
        VIDEO_PROFILE.crossfadeFrames,
      )}
    />
  );
};

const IntroSound = () => {
  const frame = useCurrentFrame();
  return (
    <Audio
      src={staticFile(BRAND_SOURCES.intro)}
      volume={layerOpacity(
        frame,
        VIDEO_PROFILE.introFrames,
        0,
        VIDEO_PROFILE.crossfadeFrames,
      )}
    />
  );
};

const SyntheticMotion = () => {
  const frame = useCurrentFrame();
  const opacity = layerOpacity(
    frame,
    timeline.content.durationInFrames,
    VIDEO_PROFILE.crossfadeFrames,
    VIDEO_PROFILE.crossfadeFrames,
  );
  const progress = frame / timeline.content.durationInFrames;
  return (
    <AbsoluteFill
      style={{
        opacity,
        background:
          'radial-gradient(ellipse at 65% 45%, #16516c 0%, #071f37 45%, #02101e 100%)',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <AbsoluteFill
        style={{
          left: VIDEO_PROFILE.safeMarginX,
          right: VIDEO_PROFILE.safeMarginX,
          top: VIDEO_PROFILE.safeMarginY,
          bottom: VIDEO_PROFILE.safeMarginY,
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 5,
            textTransform: 'uppercase',
            color: '#a7e2f4',
          }}
        >
          BlueDotAtlas · Technical Proof
        </div>
        <div style={{ fontSize: 78, fontWeight: 700, marginTop: 20 }}>
          Ocean in motion
        </div>
        <div style={{ fontSize: 28, marginTop: 24 }}>
          1920 × 1080 · 30 fps · synthetic animation
        </div>
        <div
          style={{
            width: 300,
            height: 4,
            backgroundColor: '#45d2dc',
            marginTop: 32,
            transform: 'scaleX(' + Math.max(0.08, progress) + ')',
            transformOrigin: 'left',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const OutroPicture = () => {
  const frame = useCurrentFrame();
  return (
    <FullFrameVideo
      src={BRAND_SOURCES.outro}
      opacity={layerOpacity(
        frame,
        VIDEO_PROFILE.outroFrames,
        VIDEO_PROFILE.crossfadeFrames,
        0,
      )}
    />
  );
};

export const TenSecondProof = () => (
  <AbsoluteFill style={{ backgroundColor: '#02101e' }}>
    <Sequence
      from={timeline.intro.from}
      durationInFrames={timeline.intro.durationInFrames}
      name="Brand intro picture"
    >
      <IntroPicture />
    </Sequence>
    <Sequence
      from={timeline.intro.from}
      durationInFrames={timeline.intro.durationInFrames}
      name="Brand intro audio"
    >
      <IntroSound />
    </Sequence>
    <Sequence
      from={timeline.content.from}
      durationInFrames={timeline.content.durationInFrames}
      name="Synthetic animation"
    >
      <SyntheticMotion />
    </Sequence>
    <Sequence
      from={timeline.outro.from}
      durationInFrames={timeline.outro.durationInFrames}
      name="Brand outro picture"
    >
      <OutroPicture />
    </Sequence>
  </AbsoluteFill>
);
