import { resolveOptions } from "../../lib/visuals";
import OriginalOrb from "./OriginalOrb";
import RingVisual from "./RingVisual";
import BubbleVisual from "./BubbleVisual";
import CrystalVisual from "./CrystalVisual";
import GlassOrb from "./GlassOrb";
import LivingOpalVisual from "./LivingOpalVisual";
import AuroraVisual from "./AuroraVisual";
import LeavesVisual from "./LeavesVisual";
import BranchesVisual from "./BranchesVisual";
import BloomVisual from "./BloomVisual";
import RippleVisual from "./RippleVisual";
import BasketballVisual from "./BasketballVisual";

// Every visual takes the same breath value from the shared session clock — none
// of them keeps its own timing.
const REGISTRY = {
  orb: OriginalOrb,
  ring: RingVisual,
  bubble: BubbleVisual,
  crystal: CrystalVisual,
  glass: GlassOrb,
  living_opal: LivingOpalVisual,
  aurora: AuroraVisual,
  leaves: LeavesVisual,
  branches: BranchesVisual,
  bloom: BloomVisual,
  ripple: RippleVisual,
  basketball: BasketballVisual,
};

export default function BreathingVisual({
  id = "orb",
  breath = 0,
  theme = "day",
  options = {},
  reducedMotion = false,
  animate = true,
  label,
  showLabel = false,
}) {
  const Visual = REGISTRY[id] || OriginalOrb;
  const resolved = resolveOptions(id, options);

  return (
    <Visual
      breath={breath}
      theme={theme}
      options={resolved}
      reducedMotion={reducedMotion}
      animate={animate}
      label={label}
      showLabel={showLabel}
    />
  );
}