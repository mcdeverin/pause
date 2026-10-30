import { useId } from "react";
import { getColors } from "../../lib/design";

const BRANCHES = 6;
const STEM = "M0,0 C 4,-20 -3,-38 3,-58";
const LEAVES = [
  { y: -22, x: 1, angle: 34, size: 1 },
  { y: -34, x: -1, angle: -38, size: 0.92 },
  { y: -47, x: 3, angle: 30, size: 0.8 },
];
const LEAF_SHAPE = "M0,0 C -5,-4 -5,-11 0,-14 C 5,-11 5,-4 0,0";

// Fine branches with small leaves, forming a loose circular silhouette that
// opens a little on the inhale and settles on the exhale.
export default function BranchesVisual({ breath = 0, theme = "day", reducedMotion = false, animate = true }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const colors = getColors(theme);
  const scale = 1 + 0.15 * breath;
  const opening = (breath - 0.5) * 3.2;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transition: reducedMotion ? "none" : "transform 0.12s linear",
          animation: animate && !reducedMotion ? "pauseSway 13s ease-in-out infinite" : "none",
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible", display: "block" }}>
          <defs>
            <linearGradient id={`${uid}leaf`} x1="20%" y1="100%" x2="70%" y2="0%">
              <stop offset="0%" stopColor={theme === "night" ? "#7FAE92" : "#8FBFA8"} />
              <stop offset="100%" stopColor={theme === "night" ? "#C6E2C8" : "#D6EBDB"} />
            </linearGradient>
          </defs>

          <g transform="translate(100 100)">
            <circle cx="0" cy="0" r="6" fill={colors.track} />
            {Array.from({ length: BRANCHES }).map((_, index) => (
              <g key={index} transform={`rotate(${(360 / BRANCHES) * index + opening})`}>
                <path
                  d={STEM}
                  fill="none"
                  stroke={theme === "night" ? "#B9A894" : "#8A7A64"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeOpacity="0.72"
                />
                {LEAVES.map((leaf, leafIndex) => (
                  <g
                    key={leafIndex}
                    transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.size})`}
                  >
                    <path d={LEAF_SHAPE} fill={`url(#${uid}leaf)`} opacity={0.95} />
                    <path d="M0,-1 L0,-12" stroke="#5E8B74" strokeWidth="0.45" strokeOpacity="0.35" />
                  </g>
                ))}
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}