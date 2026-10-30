import { useId } from "react";
import { paletteOption } from "../../lib/visuals";

const RINGS = [
  { count: 10, length: 74, half: 14 },
  { count: 8, length: 56, half: 12.5 },
  { count: 6, length: 38, half: 11 },
];

const petal = (length, half) =>
  `M0,0 C ${-half},${-length * 0.3} ${-half * 0.9},${-length * 0.82} 0,${-length} C ${half * 0.9},${
    -length * 0.82
  } ${half},${-length * 0.3} 0,0`;

// Three rings of petals. They slide outward and open on the inhale, then settle
// closed on the exhale without ever collapsing past the resting shape.
export default function BloomVisual({ breath = 0, theme = "day", options = {}, reducedMotion = false, animate = true }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const palette = paletteOption("bloom", options.palette) || paletteOption("bloom", "blush");
  const movement = options.movement ?? 50;

  const scale = 1 + 0.14 * breath;
  const spread = 2 + (movement / 100) * 14;
  const drift = (1 - breath) * 4;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transition: reducedMotion ? "none" : "transform 0.12s linear",
          animation: animate && !reducedMotion ? "pauseSway 16s ease-in-out infinite" : "none",
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible", display: "block" }}>
          <defs>
            {RINGS.map((ring, index) => (
              <linearGradient key={ring.count} id={`${uid}p${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={palette.inner} />
                <stop offset="55%" stopColor={palette.outer} />
                <stop offset="100%" stopColor={palette.inner} />
              </linearGradient>
            ))}
            <radialGradient id={`${uid}heart`} cx="38%" cy="34%" r="70%">
              <stop offset="0%" stopColor={palette.inner} />
              <stop offset="100%" stopColor={palette.centre} />
            </radialGradient>
          </defs>

          <g transform="translate(100 100)">
            {RINGS.map((ring, ringIndex) => {
              const outward = 3 + ringIndex * 2 + breath * spread * (1 - ringIndex * 0.18);
              return (
                <g key={ringIndex} transform={`rotate(${ringIndex % 2 === 0 ? drift : -drift})`}>
                  {Array.from({ length: ring.count }).map((_, petalIndex) => (
                    <g
                      key={petalIndex}
                      transform={`rotate(${(360 / ring.count) * petalIndex}) translate(0 ${-outward})`}
                    >
                      <path
                        d={petal(ring.length, ring.half)}
                        fill={`url(#${uid}p${ringIndex})`}
                        opacity={ringIndex === 0 ? 0.92 : 0.97}
                      />
                      <path
                        d={`M0,-2 L0,${-ring.length + 6}`}
                        stroke={palette.centre}
                        strokeWidth="0.5"
                        strokeOpacity="0.18"
                        fill="none"
                      />
                    </g>
                  ))}
                </g>
              );
            })}

            <circle cx="0" cy="0" r="15" fill={`url(#${uid}heart)`} opacity="0.96" />
            {Array.from({ length: 8 }).map((_, index) => {
              const angle = (360 / 8) * index;
              return (
                <circle
                  key={index}
                  cx={Math.cos((angle * Math.PI) / 180) * 8}
                  cy={Math.sin((angle * Math.PI) / 180) * 8}
                  r="1.5"
                  fill={palette.centre}
                  opacity="0.6"
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}