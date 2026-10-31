import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import OrbitScene from "@/components/visuals/OrbitScene";
const palettes=[["Rose","#ed4d9a"],["Cobalt","#4169ff"],["Mint","#39dfb4"],["Amber","#ffc451"]];
export default function SensoryStudio(){
 const [allowed,setAllowed]=useState(null),[accent,setAccent]=useState(palettes[0][1]),[motion,setMotion]=useState(.6),[paused,setPaused]=useState(false),[expanded,setExpanded]=useState(false);
 useEffect(()=>{base44.auth.me().then(me=>setAllowed(me?.role==="admin")).catch(()=>setAllowed(false));},[]);
 if(allowed===null)return <main style={{padding:32}}>Checking access…</main>;
 if(!allowed)return <main style={{padding:32}}>Private design studio. <Link to="/">Return to Pause</Link></main>;
 return <main style={{minHeight:"100vh",background:"#f6f5f4",color:"#24252a",padding:expanded?0:"24px max(18px, calc((100vw - 1380px)/2)) 80px"}}>
 {!expanded&&<><Link to="/" style={{color:"#77718c"}}>← Back to Pause</Link><p style={{fontSize:11,letterSpacing:".18em",color:"#8275a0",fontWeight:700,marginTop:26}}>ALWAYS PAUSE · PRIVATE EXPERIMENTS</p><h1 style={{fontSize:"clamp(32px,5vw,52px)",margin:"8px 0"}}>Sensory Studio</h1><p style={{color:"#73737c",marginBottom:24}}>Freeform interactive experiences. No breathing timer, no instructions to follow.</p></>}
 <section style={{background:"#fff",borderRadius:expanded?0:22,padding:expanded?0:12,overflow:"hidden"}}>
 <div style={{position:"relative",height:expanded?"100dvh":"min(67vw,670px)",minHeight:expanded?0:380,borderRadius:expanded?0:15,overflow:"hidden"}}>
 <OrbitScene accent={accent} motion={motion} paused={paused}/>
 <div style={{position:"absolute",left:20,top:18,pointerEvents:"none",color:"#fff",textShadow:"0 1px 10px #0008"}}><span style={{fontSize:11,letterSpacing:".18em",opacity:.7}}>01 / SENSORY</span><h2 style={{fontSize:26,margin:"5px 0"}}>Orbit</h2><span style={{fontSize:12,opacity:.75}}>Move your cursor or touch the spheres</span></div>
 <button onClick={()=>setExpanded(v=>!v)} style={{position:"absolute",right:18,top:18,background:"#ffffffdd",border:0,borderRadius:30,padding:"10px 15px",cursor:"pointer"}}>{expanded?"Exit full screen":"Expand ↗"}</button>
 {expanded&&<button onClick={()=>setPaused(v=>!v)} style={{position:"absolute",bottom:22,right:22,background:"#ffffffdd",border:0,borderRadius:30,padding:"10px 15px",cursor:"pointer"}}>{paused?"Resume":"Pause"}</button>}
 </div>
 {!expanded&&<div style={{display:"flex",gap:22,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",padding:"20px 12px 12px"}}>
 <div><strong style={{fontSize:13}}>Accent color</strong><div style={{display:"flex",gap:10,marginTop:10}}>{palettes.map(([name,hex])=><button key={hex} title={name} aria-label={name} aria-pressed={accent===hex} onClick={()=>setAccent(hex)} style={{height:34,width:34,borderRadius:"50%",background:hex,border:accent===hex?"3px solid #24252a":"3px solid white",outline:"1px solid #d4d4d4",cursor:"pointer"}}/>)}</div></div>
 <label style={{fontSize:13}}>Movement · {Math.round(motion*100)}%<input type="range" min="0" max="1" step=".05" value={motion} onChange={e=>setMotion(+e.target.value)} style={{display:"block",width:180,marginTop:12}}/></label>
 <button onClick={()=>setPaused(v=>!v)} style={{border:"1px solid #ddd",borderRadius:20,background:"white",padding:"10px 20px",cursor:"pointer"}}>{paused?"Resume motion":"Pause motion"}</button>
 </div>}
 </section>
 {!expanded&&<p style={{fontSize:13,color:"#898991",marginTop:18}}>Orbit is an original lightweight interactive prototype inspired by your CodeSandbox reference. Advanced WebGPU reflections and SSGI are not included yet. Nothing here changes the production breathing gallery.</p>}
 </main>;
}