import { useId } from "react";
import { paletteOption } from "../../lib/visuals";

const COUNT = 9;
const LEAF = "M0,0 C -13,-16 -12,-42 0,-58 C 12,-42 13,-16 0,0";
const VEIN = "M0,-4 L0,-52";

// Nine elegant leaves in a ring. Inhale spreads them outward, exhale draws them
// back; the leaf shapes themselves never squash.
export default function LeavesVisual({ breath = 0, theme = "day", options = {}, reducedMotion = false, animate = true }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const palette = paletteOption("leaves", options.palette) || paletteOption("leaves", "sage");
  const movement = options.movement ?? 45;

  const scale = 1 + 0.16 * breath;
  const spread = 2 + (movement / 100) * 12;
  const outward = 6 + breath * spread;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transition: reducedMotion ? "none" : "transform 0.12s linear",
          animation: animate && !reducedMotion ? "pauseSway 11s ease-in-out infinite" : "none",
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible", display: "block" }}>
          <defs>
            <linearGradient id={`${uid}leaf`} x1="18%" y1="100%" x2="72%" y2="0%">
              <stop offset="0%" stopColor={palette.from} />
              <stop offset="100%" stopColor={palette.to} />
            </linearGradient>
          </defs>

          <g transform="translate(100 100)">
            <circle cx="0" cy="0" r="5" fill={palette.vein} opacity="0.35" />
            {Array.from({ length: COUNT }).map((_, index) => (
              <g key={index} transform={`rotate(${(360 / COUNT) * index}) translate(0 ${-outward})`}>
                <path d={LEAF} fill={`url(#${uid}leaf)`} opacity={index % 2 === 0 ? 0.98 : 0.86} />
                <path d={VEIN} fill="none" stroke={palette.vein} strokeWidth="0.9" strokeOpacity="0.45" />
                <path d="M0,-20 L7,-26 M0,-32 L-7,-38" stroke={palette.vein} strokeWidth="0.6" strokeOpacity="0.28" />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}