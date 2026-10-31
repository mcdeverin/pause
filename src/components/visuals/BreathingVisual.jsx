import { resolveOptions } from "../../lib/visuals";
import OriginalOrb from "./OriginalOrb";
import RingVisual from "./RingVisual";
import BubbleVisual from "./BubbleVisual";
import CrystalVisual from "./CrystalVisual";
import LivingOpalVisual from "./LivingOpalVisual";
import GlassOrb from "./GlassOrb";
import AuroraVisual from "./AuroraVisual";
import LeavesVisual from "./LeavesVisual";
import BranchesVisual from "./BranchesVisual";
import BloomVisual from "./BloomVisual";
import RippleVisual from "./RippleVisual";
import BasketballVisual from "./BasketballVisual";
import StudioBreathingShape from "./StudioBreathingShape";
const ParticlesVisual = (props) => <StudioBreathingShape {...props} kind="particles" />;
const RainDropletVisual = (props) => <StudioBreathingShape {...props} kind="droplets" />;

// Every visual takes the same breath value from the shared session clock — none
// of them keeps its own timing.
const REGISTRY = {
  orb: OriginalOrb,
  classicOrb: OriginalOrb,
  ring: RingVisual,
  bubble: BubbleVisual,
  crystal: CrystalVisual,
  living: LivingOpalVisual,
  glass: GlassOrb,
  aurora: AuroraVisual,
  leaves: LeavesVisual,
  branches: BranchesVisual,
  bloom: BloomVisual,
  ripple: RippleVisual,
  basketball: BasketballVisual,
  particles: ParticlesVisual,
  rainDroplet: RainDropletVisual,
};

export default function BreathingVisual({
  id = "orb",
  breath = 0,
  theme = "day",
  options = {},
  reducedMotion = false,
  photo = null,
  backgroundSettings = {},
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
      photo={photo}
      backgroundSettings={backgroundSettings}
      animate={animate}
      label={label}
      showLabel={showLabel}
    />
  );
}