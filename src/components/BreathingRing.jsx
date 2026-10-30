import { getColors } from "../lib/design";

// Breathing Ring — an alternative visualisation driven by the same breath state
// as the organic orb (fill 0 = empty lungs, 1 = full).
const VIEWBOX = 280;
const CENTER = VIEWBOX / 2;
const STROKE = 12;
const RADIUS = CENTER - STROKE - 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function BreathingRing({ theme, fill = 0, label, showLabel = false, reducedMotion = false }) {
  const colors = getColors(theme);
  const clamped = Math.min(Math.max(fill, 0), 1);
  const offset = CIRCUMFERENCE * (1 - clamped);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Soft inner atmosphere */}
      <div
        style={{
          position: "absolute",
          width: "72%",
          height: "72%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 38%, ${colors.ringFrom}2E 0%, ${colors.ringTo}12 62%, transparent 78%)`,
        }}
      />

      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        width="100%"
        height="100%"
        aria-hidden="true"
        style={{ transform: "rotate(-90deg)", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="pauseBreathingRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.ringFrom} />
            <stop offset="100%" stopColor={colors.ringTo} />
          </linearGradient>
        </defs>

        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={colors.track}
          strokeWidth={STROKE}
        />

        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="url(#pauseBreathingRing)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            transition: reducedMotion
              ? "stroke-dashoffset 0.2s linear"
              : "stroke-dashoffset 0.95s linear",
          }}
        />
      </svg>

      {showLabel && label && (
        <span
          style={{
            position: "absolute",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "0.01em",
            textTransform: "lowercase",
            color: colors.text,
            textAlign: "center",
            padding: "0 56px",
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}