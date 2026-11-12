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
        {id === "screenFill" ? (
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 10, overflow: "hidden", background: "#F1F7F5", border: "1px solid #7DB3AA", boxSizing: "border-box" }}>
            <div style={{ position: "absolute", inset: "42% 0 0", background: options?.color || "#83B8AE" }} />
          </div>
        ) : id === "rainDroplet" ? (
          <div aria-hidden="true" style={{ width: "100%", height: "100%", position: "relative" }}>
            {[[8, 8, 21], [20, 3, 15], [17, 21, 19], [2, 24, 13], [29, 22, 11]].map(([left, top, size], i) => (
              <span key={i} style={{ position: "absolute", left, top, width: size, height: size, borderRadius: "50%", background: "radial-gradient(circle at 28% 24%, rgba(255,255,255,.98), rgba(218,237,243,.55) 37%, rgba(134,174,195,.28) 74%, rgba(255,255,255,.8))", border: "1px solid rgba(164,191,206,.65)", boxShadow: "inset -2px -3px 5px rgba(116,147,169,.18), 0 1px 3px rgba(100,130,160,.12)" }} />
            ))}
          </div>
        ) : <BreathingVisual
          id={id}
          breath={0.6}
          theme={theme}
          options={options}
          animate={false}
          reducedMotion
          showLabel={false}
        /> }
      </div>
    </div>
  );
}