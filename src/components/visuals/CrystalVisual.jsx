import { useId, useMemo } from "react";
import { paletteOption } from "../../lib/visuals";

const RADIUS = 70;
const CENTRE = 100;
const MERIDIANS = 12;
const BANDS = 4;

// Facets are real geometry: a sphere split into quads, projected to 2D and lit
// from the upper left, so each face catches the light differently.
function buildFacets() {
  const point = (theta, phi) => [
    CENTRE + RADIUS * Math.cos(phi) * Math.sin(theta),
    CENTRE - RADIUS * Math.sin(phi),
    RADIUS * Math.cos(phi) * Math.cos(theta),
  ];

  const facets = [];
  for (let band = 0; band < BANDS; band += 1) {
    const phi0 = -Math.PI / 2 + (Math.PI * band) / BANDS;
    const phi1 = -Math.PI / 2 + (Math.PI * (band + 1)) / BANDS;

    for (let meridian = 0; meridian < MERIDIANS; meridian += 1) {
      const t0 = (2 * Math.PI * meridian) / MERIDIANS;
      const t1 = (2 * Math.PI * (meridian + 1)) / MERIDIANS;
      const corners = [point(t0, phi0), point(t1, phi0), point(t1, phi1), point(t0, phi1)];
      const depth = corners.reduce((sum, corner) => sum + corner[2], 0) / corners.length;
      if (depth < 8) continue;

      const x = (corners.reduce((sum, corner) => sum + corner[0], 0) / corners.length - CENTRE) / RADIUS;
      const y = (corners.reduce((sum, corner) => sum + corner[1], 0) / corners.length - CENTRE) / RADIUS;
      const light = Math.max(0, -x * 0.55 - y * 0.62 + (depth / RADIUS) * 0.5);

      facets.push({
        key: `${band}-${meridian}`,
        points: corners.map((corner) => `${corner[0].toFixed(1)},${corner[1].toFixed(1)}`).join(" "),
        light,
        depth: depth / RADIUS,
      });
    }
  }
  return facets;
}

export default function CrystalVisual({ breath = 0, theme = "day", options = {}, reducedMotion = false }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const facets = useMemo(buildFacets, []);
  const tint = paletteOption("crystal", options.tint) || paletteOption("crystal", "clear");
  const dark = theme === "night";

  const transparency = options.transparency ?? 55;
  const outline = options.outline ?? 60;
  const glow = options.glow ?? 30;

  // A wider swing between empty and full lungs reads more like a real breath.
  const scale = 1.05 + 0.34 * breath;
  const density = 1 - (transparency / 100) * 0.6;
  const rimWidth = 1.4 + (outline / 100) * 2.4;

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
            <radialGradient id={`${uid}core`} cx="46%" cy="40%" r="58%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.16 * density} />
              <stop offset="62%" stopColor={tint.tint} stopOpacity={0.18 * density} />
              <stop offset="100%" stopColor={tint.tint} stopOpacity={0.05 * density} />
            </radialGradient>
            <linearGradient id={`${uid}rim`} x1="12%" y1="8%" x2="88%" y2="96%">
              <stop offset="0%" stopColor={tint.rim} stopOpacity="0.95" />
              <stop offset="46%" stopColor={tint.edge} stopOpacity="0.5" />
              <stop offset="100%" stopColor={tint.rim} stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id={`${uid}glow`} cx="50%" cy="50%" r="50%">
              <stop offset="58%" stopColor={tint.tint} stopOpacity="0" />
              <stop offset="82%" stopColor={tint.tint} stopOpacity={(glow / 100) * 0.42} />
              <stop offset="100%" stopColor={tint.tint} stopOpacity="0" />
            </radialGradient>
            <filter id={`${uid}blur`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          <circle cx={CENTRE} cy={CENTRE} r={RADIUS + 14} fill={`url(#${uid}glow)`} filter={`url(#${uid}blur)`} />

          <circle cx={CENTRE} cy={CENTRE} r={RADIUS} fill={`url(#${uid}core)`} />

          {facets.map((facet) => (
            <polygon
              key={facet.key}
              points={facet.points}
              fill="#FFFFFF"
              fillOpacity={(0.02 + facet.light * 0.19) * density}
              stroke={tint.edge}
              strokeOpacity={0.16 * density}
              strokeWidth="0.5"
            />
          ))}

          <circle
            cx={CENTRE}
            cy={CENTRE}
            r={RADIUS}
            fill="none"
            stroke={`url(#${uid}rim)`}
            strokeWidth={rimWidth}
            strokeOpacity={0.28 + (outline / 100) * 0.6}
          />
          <circle
            cx={CENTRE}
            cy={CENTRE}
            r={RADIUS - 2.4}
            fill="none"
            stroke={dark ? "#FFFFFF" : "#20333D"}
            strokeWidth="0.8"
            strokeOpacity={dark ? 0.1 : 0.12}
          />

          <ellipse
            cx="74"
            cy="60"
            rx="21"
            ry="11"
            fill="#FFFFFF"
            opacity={0.36}
            transform="rotate(-28 74 60)"
            filter={`url(#${uid}blur)`}
          />
          <ellipse cx="128" cy="132" rx="10" ry="6" fill="#FFFFFF" opacity={0.18} filter={`url(#${uid}blur)`} />
          <path
            d="M100,32 L112,96 L100,168 L88,96 Z"
            fill="#FFFFFF"
            fillOpacity={0.05}
            stroke="#FFFFFF"
            strokeOpacity={0.08}
            strokeWidth="0.6"
          />
        </svg>
      </div>
    </div>
  );
}