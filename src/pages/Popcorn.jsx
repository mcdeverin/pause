import OrbitScene from "@/components/visuals/OrbitScene";
import SensoryBackButton from "@/components/visuals/SensoryBackButton";

// Pink to match the app icon. (The colour slider that used to sit bottom-right
// was a tuning control, not something people should see.)
const ACCENT = "hsl(345, 90%, 48%)";

export default function Popcorn() {
 return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden",background:"#dedede"}}>
  <OrbitScene accent={ACCENT} motion={1} paused={false}/>
  <SensoryBackButton/>
 </main>;
}
