import { useId } from "react";
import { paletteOption } from "../../lib/visuals";

// Ribbons inside a glass orb. Each ribbon is its own gradient band that drifts
// decoratively, while breath opens them outward or draws them in.
const RIBBONS = [
  { d: "M-40,134 C 20,54 84,142 240,64", width: 26, dir: 1, duration: 12, delay: 0 },
  { d: "M-40,98 C 40,162 110,42 240,114", width: 20, dir: -1, duration: 15, delay: -3 },
  { d: "M-40,160 C 50,94 96,178 240,98", width: 16, dir: 1, duration: 18, delay: -6 },
  { d: "M-40,74 C 30,130 120,62 240,144", width: 22, dir: -1, duration: 10, delay: -2 },
];

export default function AuroraVisual({ breath = 0, theme = "day", options = {}, reducedMotion = false, animate = true }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const palette = paletteOption("aurora", options.palette) || paletteOption("aurora", "aurora");
  const dark = theme === "night";

  const intensity = options.intensity ?? 65;
  const flow = options.flow ?? 55;
  const glow = options.glow ?? 40;

  const scale = 1 + 0.22 * breath;
  const ribbonOpacity = 0.28 + (intensity / 100) * 0.62;
  const blur = 6 + (1 - intensity / 100) * 4;
  const spread = 6 + (flow / 100) * 16;
  const hazeAlpha = dark ? "E8" : "B8";

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
        {/* Halo behind the orb */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-4%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${palette.colours[0]}66 0%, ${palette.colours[2]}38 52%, transparent 76%)`,
            opacity: (glow / 100) * 0.85,
            filter: `blur(${6 + (glow / 100) * 14}px)`,
          }}
        />

        {/* Orb body with the ribbons clipped inside it */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            overflow: "hidden",
            background: `radial-gradient(circle at 42% 34%, ${palette.haze}${hazeAlpha} 0%, ${palette.haze} 78%)`,
            boxShadow: `inset 0 0 26px rgba(255, 255, 255, 0.14), inset 0 0 2px rgba(255, 255, 255, 0.55)`,
          }}
        >
          {RIBBONS.map((ribbon, index) => (
            <div
              key={ribbon.d}
              style={{
                position: "absolute",
                inset: 0,
                transform: `translate3d(0, ${(breath - 0.5) * spread * ribbon.dir}px, 0)`,
                transition: reducedMotion ? "none" : "transform 0.16s linear",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  mixBlendMode: "screen",
                  animation:
                    animate && !reducedMotion
                      ? `pauseDrift ${ribbon.duration * (1.4 - (flow / 100) * 0.7)}s ease-in-out ${ribbon.delay}s infinite`
                      : "none",
                }}
              >
                <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ display: "block", filter: `blur(${blur}px)` }}>
                  <defs>
                    <linearGradient id={`${uid}g${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={palette.colours[0]} stopOpacity="0" />
                      <stop offset="26%" stopColor={palette.colours[0]} stopOpacity="0.92" />
                      <stop offset="62%" stopColor={palette.colours[2]} stopOpacity="0.85" />
                      <stop offset="100%" stopColor={palette.colours[1]} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={ribbon.d}
                    fill="none"
                    stroke={`url(#${uid}g${index})`}
                    strokeWidth={ribbon.width}
                    strokeLinecap="round"
                    opacity={ribbonOpacity}
                  />
                </svg>
              </div>
            </div>
          ))}

          {/* A second, finer set of highlights gives the ribbons depth */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              animation: animate && !reducedMotion ? "pauseDrift 22s ease-in-out -8s infinite" : "none",
            }}
          >
            <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ display: "block", filter: "blur(2px)" }}>
              <path
                d="M-20,120 C 60,96 120,142 220,104"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={1.4}
                strokeLinecap="round"
                opacity={0.12 + (intensity / 100) * 0.2}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}