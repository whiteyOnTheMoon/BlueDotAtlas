import { Audio } from '@remotion/media';
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ScienceScene } from './ScienceScene';
import { BRAND_SOURCES, layerOpacity, VIDEO_PROFILE } from './profile.js';
import {
  PILOT_PRIVATE_046_SHOTS,
  PRIVATE_046_MEDIA,
  validatePilotPrivate046,
} from './pilot-private-046-plan.js';

validatePilotPrivate046();
type Shot = (typeof PILOT_PRIVATE_046_SHOTS)[number];

const FilmLabel = ({ shot }: { shot: Shot }) => (
  <div
    style={{
      position: 'absolute',
      left: VIDEO_PROFILE.safeMarginX,
      right: VIDEO_PROFILE.safeMarginX,
      bottom: 88,
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 12,
      color: '#f2f9ff',
      fontFamily: 'Arial, sans-serif',
      textShadow: '0 3px 14px #04121e',
    }}
  >
    <div style={{ backgroundColor: '#021934e8', padding: '13px 22px', fontSize: 34 }}>
      {shot.caption}
    </div>
    <div style={{ backgroundColor: '#021934e8', padding: '10px 20px', fontSize: 24 }}>
      {shot.credit}
    </div>
  </div>
);

const WeakeningDiagram = () => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, frame / 150);
  return (
    <AbsoluteFill style={{ background: '#071522', color: '#f2f9ff' }}>
      <svg
        viewBox="0 0 1920 1080"
        width="100%"
        height="100%"
        role="img"
        aria-label="Original schematic of reduced ocean moisture contribution over land"
      >
        <rect width="1920" height="1080" fill="#071522" />
        <rect y="565" width="1120" height="515" fill="#063b64" />
        <path d="M1120 565 L1920 495 L1920 1080 L1120 1080 Z" fill="#567a6b" />
        <path
          d="M0 580 Q280 535 560 580 T1120 580"
          fill="none"
          stroke="#19b7f4"
          strokeWidth="15"
        />
        <text x="160" y="174" fontSize="68" fill="#f2f9ff" fontWeight="700">
          Ocean energy helps sustain storms
        </text>
        <text x="160" y="243" fontSize="31" fill="#37d6c4">
          SCHEMATIC · NOT AN OBSERVATION
        </text>
        <text x="380" y="824" fontSize="40" fill="#f2f9ff">
          WARM OCEAN
        </text>
        <text x="1350" y="824" fontSize="40" fill="#f2f9ff">
          LAND
        </text>
        <g
          opacity={1 - 0.75 * progress}
          stroke="#37d6c4"
          strokeWidth="19"
          fill="none"
          strokeLinecap="round"
        >
          <path d="M515 620 C510 520 605 475 635 382" />
          <path d="M604 410 L636 363 L672 406" />
          <path d="M820 620 C821 532 860 490 894 410" />
          <path d="M867 439 L894 394 L928 436" />
        </g>
        <g stroke="#ffc178" fill="none" strokeWidth="12" opacity={0.35 + progress * 0.65}>
          <path d="M1270 400 L1520 400" strokeDasharray="25 20" />
          <path d="M1450 340 L1530 400 L1450 460" />
        </g>
        <text x="1230" y="325" fontSize="35" fill="#ffc178">
          Less heat and moisture supply
        </text>
        <text x="160" y="955" fontSize="31" fill="#f2f9ff">
          Storms may weaken. Dangerous impacts can continue.
        </text>
      </svg>
    </AbsoluteFill>
  );
};

const sourceForShot = (shot: Shot): string | null => {
  if (shot.kind === 'brand_intro') return BRAND_SOURCES.intro;
  if (shot.kind === 'brand_outro') return BRAND_SOURCES.outro;
  if (shot.assetId && Object.hasOwn(PRIVATE_046_MEDIA, shot.assetId)) {
    return PRIVATE_046_MEDIA[shot.assetId as keyof typeof PRIVATE_046_MEDIA];
  }
  return null;
};

const ShotContent = ({ shot }: { shot: Shot }) => {
  const frame = useCurrentFrame();
  const fadeIn = shot.id === 'S01' || shot.id === 'S08' ? 9 : 0;
  const fadeOut = shot.id === 'S00' || shot.id === 'S07' ? 9 : 0;
  const opacity = layerOpacity(frame, shot.durationInFrames, fadeIn, fadeOut);
  const source = sourceForShot(shot);

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: '#071522' }}>
      {source ? (
        <OffthreadVideo
          src={staticFile(source)}
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: shot.assetId === 'P60-VID-001' ? 'contain' : 'cover',
          }}
        />
      ) : shot.id === 'S07' ? (
        <WeakeningDiagram />
      ) : (
        <ScienceScene durationInFrames={shot.durationInFrames} />
      )}
      {shot.kind === 'footage' ? <FilmLabel shot={shot} /> : null}
      {shot.kind !== 'brand_intro' && shot.kind !== 'brand_outro' ? (
        <div
          style={{
            position: 'absolute',
            top: 34,
            right: 55,
            backgroundColor: '#021934cc',
            color: '#f2f9ff',
            font: '19px Arial, sans-serif',
            padding: '11px 17px',
          }}
        >
          PRIVATE VISUAL ROUGH CUT · VOICE PENDING
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Visual assembly only. Real narration, licensed music, publishing and 046 job API are NOT wired. */
export const PilotPrivateVisual046 = () => (
  <AbsoluteFill style={{ backgroundColor: '#071522' }}>
    {PILOT_PRIVATE_046_SHOTS.map((shot) => (
      <Sequence
        key={shot.id}
        name={shot.id}
        from={shot.from}
        durationInFrames={shot.durationInFrames}
      >
        <ShotContent shot={shot} />
        {shot.id === 'S00' ? (
          <Audio
            src={staticFile(BRAND_SOURCES.intro)}
            volume={(frame) => layerOpacity(frame, shot.durationInFrames, 0, 9)}
          />
        ) : null}
      </Sequence>
    ))}
  </AbsoluteFill>
);
