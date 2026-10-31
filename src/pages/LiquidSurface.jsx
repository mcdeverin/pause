import { useState } from "react";
import { Link } from "react-router-dom";
import LiquidSurfaceScene from "@/components/visuals/LiquidSurfaceScene";
import { BACKDROP_PHOTOS } from "@/lib/crystalStudio";

export default function LiquidSurface(){
 const [background,setBackground]=useState("gradient");
 const [photo,setPhoto]=useState(BACKDROP_PHOTOS[0]?.id);
 const strength=.83;
 const viscosity=.76;
 const [expanded,setExpanded]=useState(false);
 const image=BACKDROP_PHOTOS.find(p=>p.id===photo);
 return <main style={{minHeight:"100dvh",background:"#f7f6f4",color:"#27232a",padding:expanded?0:"clamp(16px,3vw,34px)"}}>
 <div style={{maxWidth:1200,margin:"0 auto"}}>
 {!expanded&&<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><Link to="/" style={{color:"#645e66",textDecoration:"none",fontSize:14}}>← Back to Always Pause</Link><span style={{fontSize:11,letterSpacing:".16em",fontWeight:700,color:"#8d8187"}}>SENSORY</span></div><h1 style={{fontSize:"clamp(30px,5vw,46px)",margin:"0 0 6px"}}>Liquid Surface</h1><p style={{fontSize:14,color:"#80777d",margin:"0 0 22px"}}>Move your finger or cursor through the water.</p></>}
 <div style={{position:"relative",height:expanded?"100dvh":"min(68dvh,690px)",minHeight:expanded?0:340,borderRadius:expanded?0:22,overflow:"hidden"}}>
 <LiquidSurfaceScene photoUrl={background==="photo"?image?.url:null} strength={strength} viscosity={viscosity} paused={false}/>
 <button type="button" onClick={()=>setExpanded(v=>!v)} style={{position:"absolute",right:16,top:16,padding:"10px 15px",border:0,borderRadius:24,background:"#ffffffdf",cursor:"pointer"}}>{expanded?"Exit full screen":"Expand ↗"}</button>
 </div>
 {!expanded&&<div style={{display:"flex",flexWrap:"wrap",gap:22,alignItems:"center",justifyContent:"space-between",marginTop:22}}>
 <label style={{fontSize:13}}>Backdrop <select value={background} onChange={e=>setBackground(e.target.value)}><option value="gradient">Pastel gradient</option><option value="photo">Nature photo</option></select></label>
 {background==="photo"&&<select aria-label="Nature photo" value={photo} onChange={e=>setPhoto(e.target.value)}>{BACKDROP_PHOTOS.map(p=><option key={p.id} value={p.id}>{p.label||p.id}</option>)}</select>}
 </div>}
 </div></main>;
}
