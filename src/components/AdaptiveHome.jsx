import { Link } from "react-router-dom";
import { useState } from "react";
import { FONT, HEADING_FONT, PAUSE, getTimeCanvas, getMomentStyle } from "../lib/design";

export default function AdaptiveHome({ onStart, onExplore, onMoments, onAbout, onPlus, onPersonalize }) {
 const [time] = useState(() => getTimeCanvas());
 const [menu, setMenu] = useState(false);
 const moment = getMomentStyle(time.moment);
 const night = time.key === "night";
 const glass = night ? PAUSE.nightGlass : PAUSE.glass;
 const secondary = night ? time.secondary : PAUSE.ink2;
 return <main className="screen-fit" style={{position:"relative",display:"flex",flexDirection:"column",minHeight:"100dvh",boxSizing:"border-box",padding:"calc(env(safe-area-inset-top, 20px) + 12px) 24px calc(env(safe-area-inset-bottom, 0px) + 34px)",background:time.background,color:time.ink,fontFamily:FONT}}>
   <header style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:44,position:"relative"}}>
    <span style={{fontFamily:HEADING_FONT,fontSize:22,letterSpacing:"-.02em"}}>always pause.</span>
    <button aria-label="Open menu" onClick={()=>setMenu(!menu)} style={{position:"absolute",right:0,top:0,width:44,height:44,borderRadius:999,border:"1.8px solid currentColor",background:"transparent",color:time.ink,cursor:"pointer",display:"grid",placeItems:"center"}}><span aria-hidden="true" style={{display:"flex",alignItems:"center",gap:5}}><i style={{width:2,height:15,borderRadius:2,background:"currentColor"}}/><i style={{width:2,height:15,borderRadius:2,background:"currentColor"}}/></span></button>
   </header>
   {menu&&<nav style={{position:"absolute",top:"calc(env(safe-area-inset-top, 20px) + 64px)",right:24,zIndex:10,padding:16,borderRadius:20,...glass,display:"grid",gap:12,minWidth:180}}>
     <button onClick={()=>{setMenu(false);onPersonalize?.()}} style={menuButton}>Personalize</button>
     <button onClick={()=>{setMenu(false);onMoments?.()}} style={menuButton}>Your moments</button>
     <button onClick={()=>{setMenu(false);onPlus?.()}} style={menuButton}>Always Pause+</button>
     <button onClick={()=>{setMenu(false);onAbout?.()}} style={menuButton}>About</button>
   </nav>}
   <section style={{textAlign:"center",paddingTop:"clamp(30px,7vh,72px)"}}>
    <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",opacity:.7,margin:"0 0 10px"}}>{time.label}</p>
    <h1 style={{fontFamily:HEADING_FONT,fontSize:"clamp(36px,10vw,44px)",fontWeight:400,letterSpacing:"-.02em",lineHeight:1.05,maxWidth:330,margin:"0 auto"}}>{time.headline}</h1>
   </section>
   <div style={{flex:1,minHeight:200,display:"grid",placeItems:"center"}}>
     <div aria-hidden="true" style={{width:"min(220px,60vw)",aspectRatio:"1",borderRadius:"50%",background:moment.orb,boxShadow:"0 30px 80px -10px "+moment.ink+"66"}}/>
   </div>
   <div style={{display:"grid",gap:4,maxWidth:440,width:"100%",margin:"0 auto"}}>
     <button onClick={()=>onStart(time.moment)} style={{height:56,borderRadius:999,border:0,background:night?moment.gradient[0]:moment.ink,color:night?PAUSE.ink:"#fff",fontFamily:FONT,fontSize:16,fontWeight:600,cursor:"pointer"}}>Pause for {time.moment==="wind_down"?"wind down":time.moment} · {time.minutes} min</button>
     <button onClick={onExplore} style={{height:44,border:0,background:"transparent",color:secondary,fontFamily:FONT,fontSize:15,fontWeight:600,cursor:"pointer"}}>Something else</button>
   </div>
   <nav aria-label="Primary navigation" style={{height:56,borderRadius:999,padding:5,...glass,display:"flex",marginTop:16,maxWidth:440,width:"100%",alignSelf:"center",boxSizing:"border-box"}}>
    <span aria-current="page" style={{flex:1,display:"grid",placeItems:"center",background:night?"rgba(255,255,255,.18)":"#fff",borderRadius:999,boxShadow:"0 1px 4px rgba(38,48,44,.08)",fontWeight:600}}>Breathing</span>
    <Link to="/sensory" style={{flex:1,display:"grid",placeItems:"center",textDecoration:"none",color:secondary,fontWeight:600}}>Sensory</Link>
   </nav>
 </main>;
}
const menuButton={background:"transparent",border:0,textAlign:"left",fontSize:15,fontWeight:600,padding:8,cursor:"pointer",color:"inherit"};
