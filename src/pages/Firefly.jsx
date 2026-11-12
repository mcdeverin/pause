import LivingCanvasScene from "../components/visuals/LivingCanvasScene";
import SensoryBackButton from "../components/visuals/SensoryBackButton";

export default function Firefly() {
  return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden",background:"#090c16"}}>
    <LivingCanvasScene mode="light" paused={false}/>
    <SensoryBackButton/>
  </main>;
}