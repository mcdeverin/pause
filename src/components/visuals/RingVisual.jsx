import BreathingRing from "../BreathingRing";

// The existing breathing ring, reused as-is so its fill maths stay identical.
export default function RingVisual({ breath = 0, theme = "day", label, showLabel = false, reducedMotion = false }) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <BreathingRing
        theme={theme}
        fill={breath}
        label={label}
        showLabel={showLabel}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}