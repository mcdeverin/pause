import { breathScale } from "../../lib/breathExpansion";
import { DEFAULT_VISUAL_COLORS, isHexColor } from "../../lib/visualColors";

// The original Always Pause orb, unchanged: same organic morph, same breathing
// travel (resting scale 1 → shared expansion at full lungs). Only its two gradient colours
// are customizable, and they belong to the visual alone — the background and the
// Light / Dark appearance never tint it.
export default function OriginalOrb({ breath = 0, options = {}, reducedMotion = false, animate = true }) {
  const scale = breathScale(breath);
  const from = isHexColor(options.colorFrom) ? options.colorFrom : DEFAULT_VISUAL_COLORS.orb.colorFrom;
  const to = isHexColor(options.colorTo) ? options.colorTo : DEFAULT_VISUAL_COLORS.orb.colorTo;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at 35% 35%, ${from} 0%, ${to} 100%)`,
          borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
          transform: `scale(${scale})`,
          transition: reducedMotion ? "none" : "transform 0.12s linear",
          animation: reducedMotion || !animate ? "none" : "liquidMorph 8s ease-in-out infinite",
        }}
      />
    </div>
  );
}