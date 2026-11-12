import { useState } from "react";
import { FONT, HEADING_FONT, PAUSE, getTimeCanvas, getMomentStyle } from "../lib/design";
const choices=["calm","focus","wind_down","reset"];
export default function MomentChooser({onBack,onBegin,initialMoment="calm",initialGuided=true}){
 const [moment,setMoment]=useState(initialMoment);const [guided,setGuided]=useState(initialGuided);
 const time=getTimeCanvas();const night=time.key==="night";const ink=night?time.ink:PAUSE.ink;
 const glass=night?PAUSE.nightGlass:PAUSE.glass;
 return <main className="screen-fit" style={{minHeight:"100dvh",boxSizing:"border-box",background:time.background,color:ink,fontFamily:FONT,padding:"calc(env(safe-area-inset-top, 20px) + 12px) 24px calc(env(safe-area-inset-bottom, 0px) + 34px)",display:"flex",flexDirection:"column"}}>
 <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:44}}>
 <button aria-label="Back" onClick={onBack} style={{width:44,height:44,borderRadius:999,...glass,color:ink,fontSize:24,cursor:"pointer"}}>←</button>
 <span style={{fontFamily:HEADING_FONT,fontSize:22,letterSpacing:"-.02em"}}>always pause.</span><span style={{width:44}}/>
 </header>
 <section style={{textAlign:"center",marginTop:"clamp(64px,13vh,126px)"}}>
 <h1 style={{fontFamily:HEADING_FONT,fontSize:36,lineHeight:1.1,fontWeight:400,letterSpacing:"-.02em",margin:"0 auto 14px",maxWidth:300}}>What do you<br/>need right now?</h1>
 <p style={{fontSize:15,color:night?time.secondary:PAUSE.ink2,margin:0}}>A moment for whatever you're feeling.</p>
 </section>
 <div style={{maxWidth:440,width:"100%",margin:"32px auto 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
 {choices.map(id=>{const m=getMomentStyle(id);const selected=moment===id;return <button key={id} onClick={()=>setMoment(id)} aria-pressed={selected} style={{height:80,borderRadius:20,padding:"0 18px",display:"flex",alignItems:"center",justifyContent:"space-between",textAlign:"left",background:m.tint,color:m.ink,border:selected?"1.5px solid "+m.ink:"1.5px solid transparent",fontSize:16,fontWeight:600,cursor:"pointer"}}>{m.label}{selected&&<span style={{borderRadius:"50%",width:22,height:22,background:m.ink,color:"#fff",display:"grid",placeItems:"center"}}>✓</span>}</button>})}
 <button onClick={()=>setMoment("surprise")} style={{gridColumn:"1 / -1",height:60,borderRadius:20,textAlign:"left",padding:"0 18px",background:night?"rgba(255,255,255,.12)":"rgba(255,255,255,.8)",border:0,color:ink,fontSize:16,fontWeight:600,cursor:"pointer"}}>Surprise me</button>
 <div style={{gridColumn:"1 / -1",marginTop:18}}>
 <p style={{fontSize:12,letterSpacing:".1em",textTransform:"uppercase",fontWeight:700,color:night?time.secondary:PAUSE.ink3,margin:"0 0 12px"}}>Guidance</p>
 <div style={{display:"flex",height:56,padding:5,borderRadius:999,...glass}}>
 {[["Lauren's voice",true],["Visual only",false]].map(([label,value])=><button key={label} onClick={()=>setGuided(value)} style={{flex:1,border:0,borderRadius:999,background:guided===value?"#fff":"transparent",boxShadow:guided===value?"0 1px 4px rgba(38,48,44,.08)":"none",fontSize:15,fontWeight:600,color:PAUSE.ink,cursor:"pointer"}}>{label}</button>)}
 </div></div>
 </div>
 <div style={{flex:1,minHeight:20}}/>
 <button onClick={()=>onBegin(moment==="surprise"?choices[Math.floor(Math.random()*choices.length)]:moment,guided)} style={{height:56,width:"100%",maxWidth:440,alignSelf:"center",border:0,borderRadius:999,background:PAUSE.accent,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer"}}>Begin</button>
 </main>;
}