import { useState } from "react";
import SensoryBackButton from "../components/visuals/SensoryBackButton";

export default function Rain() {
  const [failed, setFailed] = useState(false);
  return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden",background:"#253b35"}}>
    {!failed ? <video src="/videos/16312401-hd_1920_1080_60fps.mp4" autoPlay muted loop playsInline preload="metadata" onError={()=>setFailed(true)} aria-label="Rain falling on a peaceful pond" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/> : <div role="status" style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"#f4f4ef",fontSize:14}}>Rain video unavailable</div>}
    <SensoryBackButton/>
  </main>;
}