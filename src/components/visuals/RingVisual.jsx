import BreathingRing from "../BreathingRing";

// The existing breathing ring, reused as-is so its fill maths stay identical.
// Only the two outline colours are customizable; they belong to the ring alone
// and never follow the background or the Light / Dark appearance.
export default function RingVisual({ breath = 0, options = {}, label, showLabel = false, reducedMotion = false }) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <BreathingRing
        options={options}
        fill={breath}
        label={label}
        showLabel={showLabel}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}