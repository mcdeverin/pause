import { useState } from "react";
import { Link } from "react-router-dom";
import PrismaticWaterScene from "@/components/visuals/PrismaticWaterScene";

export default function PrismaticWater(){
 const [palette,setPalette]=useState("pearl");
 const [strength,setStrength]=useState(.7);
 const [softness,setSoftness]=useState(.65);
 const [motion,setMotion]=useState(1);
 const [paused,setPaused]=useState(false);
 const [expanded,setExpanded]=useState(false);
 return <main style={{minHeight:"100dvh",background:"#f7f6f4",color:"#27232a",padding:expanded?0:"clamp(16px,3vw,34px)"}}>
 <div style={{maxWidth:1200,margin:"0 auto"}}>
 {!expanded&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><Link to="/" style={{color:"#645e66",textDecoration:"none",fontSize:14}}>← Back to Always Pause</Link><span style={{fontSize:11,letterSpacing:".16em",fontWeight:700,color:"#8d8187"}}>SENSORY</span></div><h1 style={{fontSize:"clamp(30px,5vw,46px)",margin:"0 0 6px"}}>Prismatic Water</h1><p style={{fontSize:14,color:"#80777d",margin:"0 0 22px"}}>Glide your finger or cursor across the shimmering water.</p></>}
 <div style={{position:"relative",height:expanded?"100dvh":"min(68dvh,690px)",minHeight:expanded?0:340,borderRadius:expanded?0:22,overflow:"hidden"}}>
 <PrismaticWaterScene strength={strength} softness={softness} motion={motion} palette={palette} paused={paused}/>
 <button type="button" onClick={()=>setExpanded(v=>!v)} style={{position:"absolute",right:16,top:16,padding:"10px 15px",border:0,borderRadius:24,background:"#ffffffdf",cursor:"pointer"}}>{expanded?"Exit full screen":"Expand ↗"}</button>
 {expanded&&<button type="button" onClick={()=>setPaused(v=>!v)} style={{position:"absolute",right:16,bottom:16,padding:"10px 15px",border:0,borderRadius:24,background:"#ffffffdf",cursor:"pointer"}}>{paused?"Resume":"Pause"}</button>}
 </div>
 {!expanded&&<div style={{display:"flex",flexWrap:"wrap",gap:22,alignItems:"center",justifyContent:"space-between",marginTop:22}}>
 <label style={{fontSize:13}}>Palette <select value={palette} onChange={e=>setPalette(e.target.value)}><option value="pearl">Pearl</option><option value="sunset">Sunset</option><option value="lagoon">Lagoon</option></select></label>
 <label style={{fontSize:13}}>Ripple intensity · {Math.round(strength*100)}%<input type="range" min="0" max="1" step=".01" value={strength} onChange={e=>setStrength(+e.target.value)} style={{display:"block",width:155,marginTop:10}}/></label>
 <label style={{fontSize:13}}>Water softness · {Math.round(softness*100)}%<input type="range" min="0" max="1" step=".01" value={softness} onChange={e=>setSoftness(+e.target.value)} style={{display:"block",width:155,marginTop:10}}/></label>
 <label style={{fontSize:13}}>Movement · {Math.round(motion*100)}%<input type="range" min="0" max="1" step=".05" value={motion} onChange={e=>setMotion(+e.target.value)} style={{display:"block",width:155,marginTop:10}}/></label>
 <button type="button" onClick={()=>setPaused(v=>!v)} style={{padding:"11px 22px",borderRadius:22,border:"1px solid #ded8d9",background:"white",cursor:"pointer"}}>{paused?"Resume motion":"Pause motion"}</button>
 </div>}
 </div></main>;
}
