import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CloudScene from "../components/visuals/CloudScene";

export default function Cloud() {
  const navigate = useNavigate();
  const [paused, setPaused] = useState(false);
  return <main style={{position:"relative",width:"100%",height:"100dvh",overflow:"hidden"}}>
    <CloudScene paused={paused}/>
    <button type="button" onClick={()=>navigate("/")} aria-label="Back to Always Pause" style={{position:"absolute",top:"calc(env(safe-area-inset-top, 16px) + 12px)",left:18,border:0,borderRadius:28,padding:"11px 17px",background:"#ffffffdd",color:"#244c63",cursor:"pointer",fontSize:15}}>← Back</button>
    <button type="button" onClick={()=>setPaused(v=>!v)} style={{position:"absolute",top:"calc(env(safe-area-inset-top, 16px) + 12px)",right:18,border:0,borderRadius:28,padding:"11px 17px",background:"#ffffffdd",color:"#244c63",cursor:"pointer",fontSize:15}}>{paused?"Resume":"Pause"}</button>
  </main>;
}
