import { breathScale } from "../../lib/breathExpansion";
import { Orb } from "./ElevenLabsOrb";

// Production Original: ElevenLabs MIT shader with Always Pause's Pearl palette.
// Preserve the previous OriginalOrb implementation separately as classicOrb.
export default function LiquidOriginalOrb({ breath = 0, reducedMotion = false, animate = true }) {
  const scale = breathScale(breath);
  return (
    <div style={{width:"100%",height:"100%",display:"grid",placeItems:"center",overflow:"visible"}}>
      <div aria-label="Liquid breathing orb" style={{
        width:"100%",height:"100%",
        transform:`scale(${scale})`,
        transition:reducedMotion?"none":"transform 120ms linear",
        willChange:"transform"
      }}>
        <Orb colors={["#b6a5ee","#ffd2c8"]} seed={420} volumeMode="manual"
          manualInput={reducedMotion ? 0 : breath}
          manualOutput={animate && !reducedMotion ? .4 : 0}/>
      </div>
    </div>
  );
}
