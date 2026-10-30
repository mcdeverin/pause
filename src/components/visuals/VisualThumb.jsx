import { getColors } from "../../lib/design";
import BreathingVisual from "./BreathingVisual";

// A still thumbnail for the gallery. Breath is fixed and decorative motion is
// off, so a dozen thumbs cost almost nothing to render.
export default function VisualThumb({ id, theme, options, size = 58 }) {
  const colors = getColors(theme);

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        overflow: "hidden",
        background:
          theme === "day"
            ? `linear-gradient(160deg, ${colors.sheet} 0%, ${colors.track} 100%)`
            : `linear-gradient(160deg, ${colors.sheet} 0%, rgba(255, 255, 255, 0.06) 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        padding: 6,
      }}
    >
      <div style={{ width: "100%", height: "100%" }}>
        <BreathingVisual
          id={id}
          breath={0.6}
          theme={theme}
          options={options}
          animate={false}
          reducedMotion
          showLabel={false}
        />
      </div>
    </div>
  );
}