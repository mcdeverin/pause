import { Orb } from "./ElevenLabsOrb";

// Production Lagoon palette from Liquid Orb Studio. Breath comes from the shared clock.
export default function LagoonLiquidOrb({ breath = 0, reducedMotion = false, animate = true, options = {} }) {
  const amount = Math.min(1, Math.max(0, Number(breath) || 0));
  return (
    <div style={{ width: "100%", height: "100%", transform: `scale(${0.92 + amount * 0.08})`, transition: reducedMotion ? "none" : "transform 120ms linear" }}>
      <Orb colors={[options.colorFrom || "#76C7DF", options.colorTo || "#C6E7DB"]} seed={420} volumeMode="manual" manualInput={amount} manualOutput={reducedMotion || !animate ? 0 : 0.16} />
    </div>
  );
}
