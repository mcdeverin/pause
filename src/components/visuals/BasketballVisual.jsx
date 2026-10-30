import { useId } from "react";

const RADIUS = 70;

// A polished basketball: leather shading, pebbled grain and authentic seams. It
// breathes in size only — it never bounces or spins.
export default function BasketballVisual({ breath = 0, options = {}, reducedMotion = false }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const size = options.size ?? 100;
  const texture = options.texture ?? 55;

  const scale = (size / 100) * (1 + 0.2 * breath);

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
            <radialGradient id={`${uid}ball`} cx="36%" cy="30%" r="76%">
              <stop offset="0%" stopColor="#F2AE72" />
              <stop offset="38%" stopColor="#DD8038" />
              <stop offset="78%" stopColor="#BE5F22" />
              <stop offset="100%" stopColor="#8F4317" />
            </radialGradient>
            <pattern id={`${uid}grain`} width="7" height="7" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.05" fill="#5E2C0C" opacity="0.2" />
              <circle cx="5.4" cy="5" r="0.85" fill="#FFFFFF" opacity="0.14" />
            </pattern>
            <filter id={`${uid}soft`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <circle cx="100" cy="100" r={RADIUS} fill={`url(#${uid}ball)`} />
          <circle cx="100" cy="100" r={RADIUS} fill={`url(#${uid}grain)`} opacity={(texture / 100) * 0.85} />

          <g stroke="#6E3411" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.78" fill="none">
            <path d="M100,30 C 86,70 86,130 100,170" />
            <path d="M30,100 C 70,86 130,86 170,100" />
            <path d="M46,44 C 66,74 66,126 46,156" />
            <path d="M154,44 C 134,74 134,126 154,156" />
          </g>

          <ellipse
            cx="74"
            cy="58"
            rx="22"
            ry="11"
            fill="#FFFFFF"
            opacity="0.3"
            transform="rotate(-30 74 58)"
            filter={`url(#${uid}soft)`}
          />
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#5E2C0C" strokeWidth="1" strokeOpacity="0.28" />
        </svg>
      </div>
    </div>
  );
}