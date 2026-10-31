import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ShapeScene from "@/components/visuals/ShapeScene";
import { BACKDROP_PHOTOS, BACKGROUND_CSS } from "@/lib/crystalStudio";
const kinds=[["pearls","Pearl Cluster","Iridescent spheres moving together"],["ribbon","Silk Ribbon","A sculptural spiral that opens"],["droplets","Floating Droplets","Liquid forms drifting in space"],["particles","Particle Sphere","A constellation that breathes"]];
export default function ShapesStudio(){
 const [allowed,setAllowed]=useState(null),[background,setBackground]=useState("photo"),[photo,setPhoto]=useState(BACKDROP_PHOTOS[0]?.id),[playing,setPlaying]=useState(true),[manual,setManual]=useState(false),[breath,setBreath]=useState(.4),[motion,setMotion]=useState(.6);
 const breathRef=useRef(.4),motionRef=useRef(.6);motionRef.current=motion;
 useEffect(()=>{base44.auth.me().then(me=>setAllowed(me?.role==="admin")).catch(()=>setAllowed(false));},[]);
 useEffect(()=>{if(!playing||manual){breathRef.current=breath;return;}let frame,last=performance.now(),seconds=0;const tick=now=>{const dt=Math.min(.06,(now-last)/1000);last=now;if(!document.hidden)seconds=(seconds+dt)%14;let b;if(seconds<4){const x=seconds/4;b=x*x*(3-2*x);}else if(seconds<6)b=1;else if(seconds<12){const x=(seconds-6)/6;b=1-x*x*(3-2*x);}else b=0;breathRef.current=b;frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[playing,manual,breath]);
 if(allowed===null)return <div style={{padding:32}}>Checking access…</div>;
 if(!allowed)return <div style={{padding:32}}>Private design studio. <Link to="/">Return to Pause</Link></div>;
 const image=BACKDROP_PHOTOS.find(x=>x.id===photo)||BACKDROP_PHOTOS[0];
 const bg=background==="photo"&&image?`url("${image.url}") center / cover`:BACKGROUND_CSS[background];
 return <main style={{minHeight:"100vh",background:"#f7f5f1",color:"#2c302e",padding:"24px max(18px, calc((100vw - 1150px)/2)) 70px"}}>
 <Link to="/" style={{color:"#8b7cc0"}}>← Back to Pause</Link><p style={{fontSize:11,letterSpacing:".19em",fontWeight:700,color:"#8b7cc0",marginTop:25}}>ALWAYS PAUSE · PRIVATE EXPERIMENTS</p><h1 style={{fontSize:"clamp(30px,5vw,46px)",margin:"8px 0"}}>Shapes Studio</h1><p style={{color:"#747575"}}>Four breathing-synchronized Three.js studies. Nothing here changes your production gallery.</p>
 <div style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",margin:"24px 0"}}>
 <label>Backdrop <select value={background} onChange={e=>setBackground(e.target.value)}><option value="photo">Nature photo</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
 {background==="photo"&&<select aria-label="Nature photo" value={photo} onChange={e=>setPhoto(e.target.value)}>{BACKDROP_PHOTOS.map(x=><option key={x.id} value={x.id}>{x.label||x.id}</option>)}</select>}
 <button onClick={()=>setPlaying(v=>!v)}>{playing?"Pause breathing":"Resume breathing"}</button>
 <button onClick={()=>{setManual(v=>!v);setPlaying(false)}}>{manual?"Automatic":"Manual"}</button>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,360px),1fr))",gap:18}}>
 {kinds.map(([id,name,description])=><article key={id} style={{padding:12,background:"white",borderRadius:20,boxShadow:"0 6px 22px #2222220a"}}><div style={{height:340,background:bg,borderRadius:14,overflow:"hidden"}}><ShapeScene kind={id} breathRef={breathRef} motionRef={motionRef}/></div><h2 style={{fontSize:19,margin:"14px 6px 2px"}}>{name}</h2><p style={{fontSize:13,color:"#73777b",margin:"0 6px 12px"}}>{description}</p></article>)}
 </div>
 <section style={{background:"white",borderRadius:18,padding:22,maxWidth:600,marginTop:22}}>
 <label style={{display:"block",marginBottom:18}}>Ambient movement · {Math.round(motion*100)}%<input type="range" min="0" max="1" step=".01" value={motion} onChange={e=>setMotion(+e.target.value)} style={{display:"block",width:"100%"}}/></label>
 {manual&&<label style={{display:"block"}}>Manual inhale · {Math.round(breath*100)}%<input type="range" min="0" max="1" step=".01" value={breath} onChange={e=>{setBreath(+e.target.value);breathRef.current=+e.target.value;}} style={{display:"block",width:"100%"}}/></label>}
 <p style={{fontSize:12,color:"#777"}}Auto timing: inhale 4s · hold 2s · exhale 6s · hold 2s. These are original prototype geometries inspired by the Three.js examples, not copied example scenes.</p>
 </section></main>;
}
