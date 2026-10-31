import { useId } from "react";
import { paletteOption } from "../../lib/visuals";

const RADIUS = 70;
const SEGMENTS = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DASH = CIRCUMFERENCE / SEGMENTS - 18;

// A soap bubble: transparent centre, iridescent rim that turns slowly, soft
// specular highlights. Breath changes the size only — it never pops.
export default function BubbleVisual({ breath = 0, theme = "day", options = {}, reducedMotion = false, animate = true }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const palette = paletteOption("bubble", options.palette) || paletteOption("bubble", "default");
  const dark = theme === "night";

  const transparency = options.transparency ?? 60;
  const rim = options.rim ?? 55;
  const iridescence = options.iridescence ?? 70;
  const glow = options.glow ?? 35;

  // A wider swing between empty and full lungs reads more like a real breath.
  const scale = 1.05 + 0.34 * breath;
  const bodyAlpha = 0.02 + (1 - transparency / 100) * 0.1;
  const rimAlpha = 0.22 + (rim / 100) * 0.62;
  const rimWidth = 2.4 + (rim / 100) * 2.4;
  const iriAlpha = 0.1 + (iridescence / 100) * 0.72;
  const glowAlpha = (glow / 100) * 0.45;

  const arcs = palette.rim.map((colour, index) => (
    <circle
      key={`${colour}-${index}`}
      cx="100"
      cy="100"
      r={RADIUS}
      fill="none"
      stroke={colour}
      strokeWidth={rimWidth}
      strokeLinecap="round"
      strokeDasharray={`${DASH} ${CIRCUMFERENCE}`}
      transform={`rotate(${(360 / SEGMENTS) * index + 14} 100 100)`}
      opacity={iriAlpha}
    />
  ));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transition: reducedMotion ? "none" : "transform 0.12s linear",
        }}
      >
        {/* Turning iridescent rim */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            animation: animate && !reducedMotion ? "pauseSpin 26s linear infinite" : "none",
          }}
        >
          <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible", display: "block" }}>
            <defs>
              <filter id={`${uid}soft`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.7" />
              </filter>
              <filter id={`${uid}halo`} x="-45%" y="-45%" width="190%" height="190%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <radialGradient id={`${uid}aura`} cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor={palette.rim[0]} stopOpacity="0" />
                <stop offset="84%" stopColor={palette.rim[0]} stopOpacity={glowAlpha} />
                <stop offset="100%" stopColor={palette.rim[3]} stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="100" cy="100" r={RADIUS + 12} fill={`url(#${uid}aura)`} filter={`url(#${uid}halo)`} />
            <g filter={`url(#${uid}soft)`}>{arcs}</g>
          </svg>
        </div>

        {/* Body, edge and highlights stay upright while the rim turns */}
        <svg
          viewBox="0 0 200 200"
          width="100%"
          height="100%"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, overflow: "visible", display: "block" }}
        >
          <defs>
            <radialGradient id={`${uid}body`} cx="46%" cy="42%" r="58%">
              <stop offset="0%" stopColor={palette.tint} stopOpacity={bodyAlpha * 0.16} />
              <stop offset="58%" stopColor={palette.tint} stopOpacity={bodyAlpha * 0.42} />
              <stop offset="90%" stopColor={palette.tint} stopOpacity={bodyAlpha} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
            </radialGradient>
            <filter id={`${uid}blur`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.6" />
            </filter>
          </defs>

          <circle cx="100" cy="100" r={RADIUS} fill={`url(#${uid}body)`} />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeOpacity={0.3 + rimAlpha * 0.45}
          />
          {/* A faint dark edge keeps the bubble readable on bright photos */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS - 1.8}
            fill="none"
            stroke={dark ? "#FFFFFF" : "#243642"}
            strokeWidth="0.9"
            strokeOpacity={dark ? 0.12 : 0.16}
          />

          <ellipse
            cx="73"
            cy="62"
            rx="21"
            ry="12"
            fill="#FFFFFF"
            opacity={0.32}
            transform="rotate(-26 73 62)"
            filter={`url(#${uid}blur)`}
          />
          <ellipse
            cx="133"
            cy="136"
            rx="13"
            ry="7"
            fill="#FFFFFF"
            opacity={0.16}
            transform="rotate(-18 133 136)"
            filter={`url(#${uid}blur)`}
          />
          <path
            d="M46,122 A57,57 0 0 0 82,158"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={0.2}
            strokeWidth="2.2"
            strokeLinecap="round"
            filter={`url(#${uid}blur)`}
          />
        </svg>
      </div>
    </div>
  );
}