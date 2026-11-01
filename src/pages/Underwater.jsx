import { useState } from "react";
import { Link } from "react-router-dom";
import ExpandPill from "@/components/visuals/ExpandPill";

export default function Underwater() {
  const [expanded, setExpanded] = useState(false);
  return <main style={{minHeight:"100dvh",background:"#f7f6f4",color:"#27232a",padding:expanded?0:"clamp(16px,3vw,34px)"}}>
    {!expanded&&<>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <Link to="/" style={{color:"#645e66",textDecoration:"none",fontSize:14}}>← Back to Always Pause</Link>
        <span style={{fontSize:11,letterSpacing:".16em",fontWeight:700,color:"#8d8187"}}>SENSORY</span>
      </div>
      <h1 style={{fontSize:"clamp(30px,5vw,46px)",margin:"0 0 6px"}}>Underwater</h1>
      <p style={{fontSize:14,color:"#80777d",margin:"0 0 22px"}}>Explore the ocean and interact with drifting jellyfish.</p>
    </>}
    <div style={{position:"relative",height:expanded?"100dvh":"min(68dvh,690px)",minHeight:expanded?0:340,borderRadius:expanded?0:22,overflow:"hidden",background:"#031426"}}>
      <iframe title="Interactive Aurelia underwater jellyfish scene" src="https://holtsetio.com/lab/aurelia/" loading="lazy" allow="fullscreen"
        style={{display:"block",width:"100%",height:"calc(100% + 600px)",marginTop:-72,border:0,background:"#031426"}}/>
      <ExpandPill expanded={expanded} onClick={()=>setExpanded(v=>!v)} label="Underwater"/>
    </div>
    {!expanded&&<p style={{fontSize:12,color:"#898991",marginTop:18}}>Underwater experience based on <a href="https://github.com/holtsetio/aurelia/" target="_blank" rel="noopener noreferrer" style={{color:"inherit"}}>Aurelia by Holtsetio (MIT)</a>. Requires WebGPU.</p>}
  </main>;
}
