import { useId } from "react";
import { paletteOption } from "../../lib/visuals";

// Hex → rgba so a palette colour can be used at any strength the sliders ask for.
function rgba(hex, alpha) {
  const raw = String(hex || "#FFFFFF").replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  const value = parseInt(full, 16);
  if (!Number.isFinite(value)) return `rgba(255, 255, 255, ${alpha})`;
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

// Liquid glass: a soft sphere that refracts whatever sits behind it, with a
// bright wet rim and drifting specular highlights. Breath only drives scale —
// the shared clock still owns the timing.
export default function GlassVisual({
  breath = 0,
  theme = "day",
  options = {},
  reducedMotion = false,
  animate = true,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tint = paletteOption("glass", options.tint) || paletteOption("glass", "clear");
  const dark = theme === "night";

  const transparency = options.transparency ?? 55;
  const rimStrength = options.rim ?? 65;
  const glow = options.glow ?? 30;

  const scale = 1 + 0.26 * breath;
  const fill = 1 - transparency / 100;
  const rimAlpha = 0.26 + (rimStrength / 100) * 0.62;
  const still = reducedMotion || !animate;

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
      {/* Halo behind the glass, so the light appears to spill past the edge. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-8%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${rgba(tint.tint, (glow / 100) * 0.5)} 30%, ${rgba(tint.tint, 0)} 68%)`,
          filter: "blur(12px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transition: reducedMotion ? "none" : "transform 0.12s linear",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            background: `radial-gradient(circle at 33% 26%, ${rgba(
              tint.rim,
              0.12 + fill * 0.22
            )} 0%, ${rgba(tint.tint, 0.08 + fill * 0.3)} 46%, ${rgba(
              tint.edge,
              0.08 + fill * 0.16
            )} 76%, ${rgba(tint.edge, 0.14 + fill * 0.22)} 100%)`,
            backdropFilter: `blur(${(1.5 + transparency / 26).toFixed(1)}px) saturate(150%)`,
            WebkitBackdropFilter: `blur(${(1.5 + transparency / 26).toFixed(1)}px) saturate(150%)`,
            boxShadow: [
              `inset 0 0 0 1px ${rgba(tint.rim, rimAlpha * 0.45)}`,
              `inset 1px 3px 6px ${rgba(tint.rim, rimAlpha * 0.8)}`,
              `inset -3px -5px 12px ${rgba(tint.edge, 0.2 + rimAlpha * 0.3)}`,
              `inset -1px -2px 3px ${rgba(tint.rim, rimAlpha * 0.4)}`,
              `0 14px 34px ${rgba(dark ? "#000000" : tint.edge, dark ? 0.34 : 0.16)}`,
            ].join(", "),
          }}
        >
          <svg
            viewBox="0 0 200 200"
            width="100%"
            height="100%"
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              display: "block",
              animation: still ? "none" : "pauseShimmer 7s ease-in-out infinite",
            }}
          >
            <defs>
              <filter id={`${uid}soft`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
              <filter id={`${uid}softer`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>

            {/* Broad specular sheen, upper left */}
            <ellipse
              cx="71"
              cy="57"
              rx="31"
              ry="17"
              fill={tint.rim}
              opacity={(0.16 + (rimStrength / 100) * 0.3) * (0.5 + fill * 0.8)}
              transform="rotate(-28 71 57)"
              filter={`url(#${uid}softer)`}
            />

            {/* Tight wet glint riding on the sheen */}
            <ellipse
              cx="64"
              cy="50"
              rx="9.5"
              ry="5"
              fill="#FFFFFF"
              opacity={0.32 + (rimStrength / 100) * 0.5}
              transform="rotate(-28 64 50)"
              filter={`url(#${uid}soft)`}
            />

            {/* Light caught underneath, the way glass lifts its lower edge */}
            <ellipse
              cx="134"
              cy="141"
              rx="24"
              ry="12"
              fill={tint.rim}
              opacity={0.1 + (rimStrength / 100) * 0.18}
              transform="rotate(-18 134 141)"
              filter={`url(#${uid}softer)`}
            />

            {/* Curved rim light along the lower left */}
            <path
              d="M30,118 C22,150 46,178 84,185"
              fill="none"
              stroke={tint.rim}
              strokeOpacity={0.18 + (rimStrength / 100) * 0.34}
              strokeWidth="3.4"
              strokeLinecap="round"
              filter={`url(#${uid}soft)`}
            />

            {/* Thin crisp edge on the right, liquid glass's tell-tale line */}
            <path
              d="M170,92 C177,120 168,150 149,168"
              fill="none"
              stroke={tint.rim}
              strokeOpacity={0.22 + (rimStrength / 100) * 0.42}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}