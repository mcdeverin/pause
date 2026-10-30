import { getColors } from "../../lib/design";

const RINGS = 4;

// Concentric water rings: inhale pushes them outward, exhale returns them. The
// geometry is derived from breath, so there are no independent timers.
export default function RippleVisual({ breath = 0, theme = "day", reducedMotion = false }) {
  const colors = getColors(theme);
  const scale = 1 + 0.1 * breath;
  const rings = Array.from({ length: RINGS }).map((_, index) => ({
    radius: 24 + index * 16 + breath * (10 + index * 4),
    opacity: Math.max(0.06, 0.58 - index * 0.13) * (0.55 + breath * 0.5),
    width: 2.4 - index * 0.35,
  }));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transition: reducedMotion ? "none" : "transform 0.12s linear",
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible", display: "block" }}>
          <defs>
            <radialGradient id="rippleCore" cx="42%" cy="38%" r="62%">
              <stop offset="0%" stopColor={colors.ringFrom} stopOpacity="0.5" />
              <stop offset="100%" stopColor={colors.ringTo} stopOpacity="0.06" />
            </radialGradient>
            <linearGradient id="rippleStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.ringFrom} />
              <stop offset="100%" stopColor={colors.ringTo} />
            </linearGradient>
          </defs>

          <circle cx="100" cy="100" r="18" fill="url(#rippleCore)" />

          {rings.map((ring, index) => (
            <circle
              key={index}
              cx="100"
              cy="100"
              r={ring.radius}
              fill="none"
              stroke="url(#rippleStroke)"
              strokeWidth={ring.width}
              strokeOpacity={ring.opacity}
            />
          ))}

          <circle
            cx="100"
            cy="100"
            r="86"
            fill="none"
            stroke={colors.ringTo}
            strokeWidth="0.9"
            strokeOpacity="0.18"
            strokeDasharray="2 7"
          />
        </svg>
      </div>
    </div>
  );
}