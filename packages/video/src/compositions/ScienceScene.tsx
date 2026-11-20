import type { CSSProperties } from 'react';
import { useCurrentFrame } from 'remotion';
import {
  SCIENCE_COLORS,
  SCIENCE_LABELS,
  scienceStateAt,
  scienceVaporParticle,
  validateScienceDuration,
} from './science-plan.js';

const baseFont = 'Inter, Arial, sans-serif';
const displayFont = 'Space Grotesk, Inter, Arial, sans-serif';

/**
 * Original vector-only explanatory animation for NOAA-based C01/C02 claims.
 * Qualitative progress is a drawing timeline, NEVER measured weather data.
 * This component must not be mistaken for observations of any actual storm.
 */
export const ScienceScene = ({ durationInFrames }: { durationInFrames: number }) => {
  validateScienceDuration(durationInFrames);
  const frame = useCurrentFrame();
  const state = scienceStateAt(frame, durationInFrames);
  const breeze = Math.sin(frame / 14) * 10;
  const cloudScale = 0.83 + state.condensation * 0.17;
  const oceanWave = Math.sin(frame / 12) * 12;

  const stageText: CSSProperties = {
    fontFamily: baseFont,
    fontWeight: 700,
    fontSize: 29,
    letterSpacing: 1.5,
  };
  const stageDetail: CSSProperties = {
    fontFamily: baseFont,
    fontWeight: 500,
    fontSize: 25,
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Schematic: ocean evaporation, rising moist air, cloud condensation, heat released to the air"
      style={{ display: 'block', background: SCIENCE_COLORS.background }}
    >
      <defs>
        <linearGradient id="science-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#071522" />
          <stop offset="100%" stopColor="#0E2942" />
        </linearGradient>
        <linearGradient id="science-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#026E9E" />
          <stop offset="100%" stopColor="#021934" />
        </linearGradient>
        <linearGradient id="science-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2F9FF" />
          <stop offset="100%" stopColor="#B4CCDC" />
        </linearGradient>
        <radialGradient id="science-glow">
          <stop offset="0%" stopColor="#FFC178" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FFC178" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Brand-safe typography and scientific status; no actual sensor scales. */}
      <rect width="1920" height="1080" fill="url(#science-sky)" />
      <text
        x="160"
        y="144"
        fill={SCIENCE_COLORS.moisture}
        fontFamily={baseFont}
        fontSize="26"
        fontWeight="700"
        letterSpacing="4"
      >
        BLUE DOT ATLAS   /   EARTH SCIENCE
      </text>
      <text
        x="160"
        y="237"
        fill={SCIENCE_COLORS.iceWhite}
        fontFamily={displayFont}
        fontSize="67"
        fontWeight="700"
      >
        {SCIENCE_LABELS.heading}
      </text>
      <text
        x="160"
        y="289"
        fill={SCIENCE_COLORS.moisture}
        fontFamily={baseFont}
        fontSize="27"
        fontWeight="700"
        letterSpacing="1.4"
      >
        {SCIENCE_LABELS.subheading}
      </text>

      <rect x="160" y="335" width="1600" height="565" rx="30" fill={SCIENCE_COLORS.panel} />
      <rect
        x="160"
        y="335"
        width="1600"
        height="565"
        rx="30"
        fill="none"
        stroke="#31546D"
        strokeWidth="2"
      />
      <path d="M695 384 V868 M1225 384 V868" stroke="#31546D" strokeWidth="2" strokeDasharray="5 17" opacity="0.6" />
      <g fill={SCIENCE_COLORS.iceWhite} opacity="0.15">
        {Array.from({ length: 12 }, (_, index) => (
          <circle
            key={'background-star-' + index}
            cx={255 + index * 132}
            cy={465 + Math.sin(index * 3.2) * 65}
            r={2 + (index % 2)}
          />
        ))}
      </g>

      {/* Clearly fabricated ocean cross-section, not an aerial observation. */}
      <path
        d={`M160 ${741 + oceanWave} C370 ${724 - oceanWave} 580 ${743 + oceanWave} 790 736 C1000 ${725 + oceanWave} 1250 ${744 - oceanWave} 1450 737 C1600 ${730 + oceanWave} 1710 747 1760 738 L1760 900 L160 900 Z`}
        fill="url(#science-ocean)"
      />
      <path
        d={`M160 ${741 + oceanWave} C370 ${724 - oceanWave} 580 ${743 + oceanWave} 790 736 C1000 ${725 + oceanWave} 1250 ${744 - oceanWave} 1450 737 C1600 ${730 + oceanWave} 1710 747 1760 738`}
        fill="none"
        stroke={SCIENCE_COLORS.ocean}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <text x="270" y="850" fill={SCIENCE_COLORS.muted} fontSize="24" fontFamily={baseFont}>
        ILLUSTRATIVE OCEAN SURFACE
      </text>

      {/* Stage 1: water vapor leaves sea surface. The dots visibly travel. */}
      <g opacity={0.24 + state.evaporation * 0.76}>
        <text x="210" y="404" fill={SCIENCE_COLORS.moisture} style={stageText}>
          {SCIENCE_LABELS.phaseOne}
        </text>
        <text x="210" y="450" fill={SCIENCE_COLORS.iceWhite} style={stageDetail}>
          {SCIENCE_LABELS.phaseOneDetail}
        </text>
      </g>
      <path
        d="M405 741 C375 632 483 610 451 492"
        fill="none"
        stroke={SCIENCE_COLORS.moisture}
        strokeWidth="13"
        strokeLinecap="round"
        strokeDasharray="19 18"
        strokeDashoffset={-frame * 1.8}
        opacity={state.evaporation * 0.91}
      />
      <path
        d="M430 511 L451 473 L467 513"
        fill="none"
        stroke={SCIENCE_COLORS.moisture}
        strokeWidth="11"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={state.evaporation}
      />
      {Array.from({ length: 12 }, (_, index) => {
        const particle = scienceVaporParticle(frame, index, durationInFrames);
        return (
          <circle
            key={'vapor-' + index}
            cx={particle.x}
            cy={particle.y}
            r={particle.radius}
            opacity={particle.opacity}
            fill={SCIENCE_COLORS.moisture}
          />
        );
      })}

      {/* Stage 2: the trajectory illustrates uplift, not a measured height or speed. */}
      <g opacity={0.17 + state.rising * 0.83}>
        <text x="755" y="404" fill={SCIENCE_COLORS.moisture} style={stageText}>
          {SCIENCE_LABELS.phaseTwo}
        </text>
        <text x="755" y="450" fill={SCIENCE_COLORS.iceWhite} style={stageDetail}>
          {SCIENCE_LABELS.phaseTwoDetail}
        </text>
      </g>
      <path
        d="M906 725 C855 644 952 569 914 492"
        fill="none"
        stroke={SCIENCE_COLORS.ocean}
        strokeWidth="19"
        strokeLinecap="round"
        strokeDasharray="100 100"
        pathLength={100}
        strokeDashoffset={100 * (1 - state.rising)}
      />
      <path
        d="M885 515 L911 469 L942 506"
        fill="none"
        stroke={SCIENCE_COLORS.ocean}
        strokeWidth="14"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={state.rising}
      />
      {Array.from({ length: 7 }, (_, index) => {
        const radius = 10 + (index % 3) * 5;
        const y = 698 - ((frame * 2.1 + index * 54) % 210);
        return (
          <circle
            key={'lift-' + index}
            cx={897 + Math.sin((frame + index * 12) / 32) * 33}
            cy={y}
            r={radius}
            stroke={SCIENCE_COLORS.moisture}
            strokeWidth="3"
            fill="none"
            opacity={state.rising * 0.48}
          />
        );
      })}

      {/* Stage 3: liquid droplets/cloud and qualitative release of latent heat. */}
      <g opacity={0.17 + state.condensation * 0.83}>
        <text x="1270" y="404" fill={SCIENCE_COLORS.moisture} style={stageText}>
          {SCIENCE_LABELS.phaseThree}
        </text>
        <text x="1270" y="450" fill={SCIENCE_COLORS.iceWhite} style={stageDetail}>
          {SCIENCE_LABELS.phaseThreeDetail}
        </text>
      </g>
      <circle
        cx="1458"
        cy="577"
        r="205"
        fill="url(#science-glow)"
        opacity={state.heatRelease}
      />
      <g
        opacity={state.condensation}
        transform={`translate(1458 568) scale(${cloudScale}) translate(-1458 -568)`}
      >
        <ellipse cx="1420" cy="587" rx="132" ry="59" fill="url(#science-cloud)" />
        <circle cx="1367" cy="569" r="67" fill="url(#science-cloud)" />
        <circle cx="1450" cy="536" r="90" fill="url(#science-cloud)" />
        <circle cx="1521" cy="562" r="74" fill="url(#science-cloud)" />
        <g fill="#026E9E" opacity="0.5">
          {Array.from({ length: 6 }, (_, index) => (
            <circle
              key={'droplet-' + index}
              cx={1370 + index * 34 + breeze * 0.25}
              cy={584 + Math.sin(frame / 18 + index) * 8}
              r="8"
            />
          ))}
        </g>
      </g>
      {Array.from({ length: 3 }, (_, index) => (
        <circle
          key={'latent-heat-' + index}
          cx="1458"
          cy="571"
          r={111 + index * 39 + Math.sin(frame / 21) * 4}
          stroke={SCIENCE_COLORS.heat}
          strokeWidth="6"
          fill="none"
          strokeDasharray="26 36"
          strokeDashoffset={-frame * 0.9 + index * 18}
          opacity={state.heatRelease * (0.7 - index * 0.14)}
        />
      ))}
      <text
        x="1292"
        y="713"
        fill={SCIENCE_COLORS.heat}
        fontSize="27"
        fontWeight="700"
        fontFamily={baseFont}
        opacity={state.heatRelease}
      >
        {SCIENCE_LABELS.energy}
      </text>

      {/* Conservative truth/scale guard is visible for the whole proof. */}
      <text
        x="160"
        y="951"
        fill={SCIENCE_COLORS.iceWhite}
        fontFamily={baseFont}
        fontSize="26"
        fontWeight="600"
      >
        {SCIENCE_LABELS.caveat}
      </text>
      <text
        x="1760"
        y="951"
        textAnchor="end"
        fill={SCIENCE_COLORS.muted}
        fontFamily={baseFont}
        fontSize="23"
      >
        {SCIENCE_LABELS.attribution}
      </text>
    </svg>
  );
};
