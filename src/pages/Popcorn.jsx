import { useState } from "react";
import { Link } from "react-router-dom";
import OrbitScene from "@/components/visuals/OrbitScene";

export default function Popcorn() {
  const [hue,setHue] = useState(345);
  const [expanded,setExpanded] = useState(false);
  const accent = `hsl(${hue}, 90%, 48%)`;
  return (
    <main style={{minHeight:"100dvh",background:"#f7f6f4",color:"#27232a",padding:"clamp(16px,3vw,34px)",fontFamily:"inherit"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:18}}>
          <Link to="/" style={{textDecoration:"none",color:"#645e66",fontSize:14}}>← Back to Always Pause</Link>
          <span style={{fontSize:11,letterSpacing:".16em",fontWeight:700,color:"#8d8187"}}>SENSORY</span>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,46px)",fontWeight:700,margin:"0 0 6px"}}>Popcorn</h1>
        <p style={{fontSize:14,color:"#80777d",margin:"0 0 22px"}}>Touch, scatter, and watch the spheres come together again.</p>
        <div style={{position:expanded?"fixed":"relative",inset:expanded?0:undefined,zIndex:expanded?1000:undefined,height:expanded?"100dvh":"min(68dvh,690px)",minHeight:expanded?0:340,borderRadius:expanded?0:22,overflow:"hidden",background:"#dedede"}}>
          <OrbitScene accent={accent} motion={1} paused={false}/>
          <button type="button" aria-label={expanded?"Exit full screen":"Expand Popcorn to full screen"} title={expanded?"Exit full screen":"Full screen"} onClick={()=>setExpanded(v=>!v)} style={{position:"absolute",top:16,right:16,zIndex:5,width:42,height:42,display:"grid",placeItems:"center",border:0,borderRadius:14,background:"#ffffffd9",color:"#353036",fontSize:23,cursor:"pointer",boxShadow:"0 2px 12px #00000012"}}><svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" aria-hidden="true"><path d={expanded?"M13 3v10H3 M21 31V21h10":"M13 13V3H3 M21 21v10h10"}/></svg></button>
        </div>
        <div style={{marginTop:22,maxWidth:360}}>
          <label htmlFor="popcorn-hue" style={{display:"block",fontSize:13,fontWeight:600,marginBottom:10}}>Color</label>
          <input id="popcorn-hue" type="range" min="0" max="360" step="1" value={hue} onChange={e=>setHue(Number(e.target.value))} aria-label="Popcorn color" style={{display:"block",width:"100%",height:20,appearance:"none",WebkitAppearance:"none",borderRadius:999,background:"linear-gradient(to right,#f33,#ff0,#0f6,#0df,#44f,#f0f,#f33)",cursor:"pointer",accentColor:accent}}/>
        </div>
      </div>
    </main>
  );
}
