import { useState } from "react";
import OrbitScene from "@/components/visuals/OrbitScene";
import SensoryBackButton from "@/components/visuals/SensoryBackButton";
export default function Popcorn() {
 const [hue,setHue]=useState(345);
 const accent=`hsl(${hue}, 90%, 48%)`;
 return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden",background:"#dedede"}}>
  <OrbitScene accent={accent} motion={1} paused={false}/>
  <SensoryBackButton/>
  <input type="range" min="0" max="360" value={hue} onChange={e=>setHue(Number(e.target.value))} aria-label="Change sphere color" style={{position:"absolute",right:20,bottom:"calc(env(safe-area-inset-bottom, 16px) + 24px)",zIndex:10,width:120,accentColor:accent,opacity:.65}}/>
 </main>;
}