import { getColors } from "../../lib/design";

// The original Always Pause orb, unchanged: same teal-to-sage gradient, same
// organic morph, same breathing travel (resting scale 1 → 1.35 at full lungs).
export default function OriginalOrb({ breath = 0, theme = "day", reducedMotion = false, animate = true }) {
  const colors = getColors(theme);
  const scale = 1 + 0.35 * breath;

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
          background: colors.orbGradient,
          borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
          transform: `scale(${scale})`,
          transition: reducedMotion ? "none" : "transform 0.12s linear",
          animation: reducedMotion || !animate ? "none" : "liquidMorph 8s ease-in-out infinite",
        }}
      />
    </div>
  );
}