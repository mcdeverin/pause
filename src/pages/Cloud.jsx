import { useState } from "react";
import SensoryBackButton from "../components/visuals/SensoryBackButton";
import CloudScene from "../components/visuals/CloudScene";

export default function Cloud() {
  const [paused, setPaused] = useState(false);
  return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden"}}>
    <CloudScene paused={paused}/>
    <SensoryBackButton/>
    <button type="button" onClick={()=>setPaused(v=>!v)} style={{position:"absolute",top:"calc(env(safe-area-inset-top, 16px) + 12px)",right:18,border:0,borderRadius:28,padding:"11px 17px",background:"#ffffffdd",color:"#244c63",cursor:"pointer",fontSize:15}}>{paused?"Resume":"Pause"}</button>
  </main>;
}
