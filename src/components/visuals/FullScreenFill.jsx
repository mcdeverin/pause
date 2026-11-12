// The shared breathing clock supplies breath (0–1): rising on inhale,
// stationary on hold, and falling on exhale. No independent timer.
export default function FullScreenFill({ breath = 0, options = {} }) {
  const amount = Math.min(1, Math.max(0, Number(breath) || 0));
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: options.color || "#83B8AE", transform: `translateY(${(1 - amount) * 100}%)`, willChange: "transform" }} />
    </div>
  );
}
