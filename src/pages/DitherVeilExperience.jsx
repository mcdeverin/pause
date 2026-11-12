import DitherVeil from "../components/visuals/DitherVeil";
import SensoryBackButton from "../components/visuals/SensoryBackButton";

export default function DitherVeilExperience() {
  return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden",background:"#f4f1ea"}}>
    <DitherVeil fit="contain" pattern="floyd" pixelSize={2} levels={2} palette="duotone" inkColor="#120f17" paperColor="#f4f1ea" contrast={1.15} brightness={0} revealRadius={200} softness={0.6} linger={1} rimColor="#a78bfa" rim={0} reverse={false} wander={false} clickBurst style={{width:"100%",height:"100%"}}/>
    <SensoryBackButton/>
  </main>;
}