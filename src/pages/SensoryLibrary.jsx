import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Menu } from "lucide-react";
import { FONT, HEADING_FONT } from "../lib/design";

const groups = [
  {name:"Nature",description:"Quiet places, natural movement.",items:[["Cloud","/sensory/cloud"],["Underwater","/sensory/underwater"]]},
  {name:"Abstract",description:"Light, texture, and fluid motion.",items:[["Liquid Chrome","/sensory/liquid-chrome"],["Popcorn","/sensory/popcorn"],["Liquid Surface","/sensory/liquid-surface"],["Prismatic Water","/sensory/prismatic-water"]]}
];

export default function SensoryLibrary() {
  const [category,setCategory]=useState("Nature");
  const group=groups.find(g=>g.name===category);
  return <main style={{minHeight:"100dvh",boxSizing:"border-box",background:"#f5f5f1",color:"#24342f",padding:"calc(env(safe-area-inset-top, 28px) + 24px) 24px calc(env(safe-area-inset-bottom, 20px) + 118px)",fontFamily:FONT}}>
    <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:620,margin:"0 auto"}}>
      <Link to="/" aria-label="Back to breathing" style={{color:"inherit",padding:8}}><ChevronLeft size={22}/></Link>
      <span style={{fontFamily:HEADING_FONT,fontSize:23}}>always pause.</span>
      <span style={{width:38}}/>
    </header>
    <div style={{maxWidth:620,margin:"72px auto 0"}}>
      <p style={{fontSize:11,letterSpacing:".19em",fontWeight:700,opacity:.55}}>SENSORY</p>
      <h1 style={{fontFamily:HEADING_FONT,fontWeight:400,fontSize:"clamp(42px,9vw,66px)",letterSpacing:"-.04em",margin:"10px 0 8px"}}>Find your stillness.</h1>
      <p style={{opacity:.65,fontSize:15,lineHeight:1.6,marginBottom:36}}>Explore a moment through movement, light, and sound.</p>
      <div role="tablist" aria-label="Sensory categories" style={{display:"flex",gap:28,borderBottom:"1px solid #24342f22"}}>
        {groups.map(g=><button key={g.name} role="tab" aria-selected={category===g.name} onClick={()=>setCategory(g.name)} style={{border:0,borderBottom:category===g.name?"2px solid #325c50":"2px solid transparent",padding:"12px 0",marginBottom:-1,background:"none",fontFamily:FONT,fontSize:16,fontWeight:category===g.name?650:400,color:category===g.name?"#24342f":"#78857f",cursor:"pointer"}}>{g.name}</button>)}
      </div>
      <p style={{margin:"26px 0 18px",color:"#72817a",fontSize:14}}>{group.description}</p>
      <div style={{display:"grid",gap:12}}>{group.items.map(([name,path],i)=><Link key={path} to={path} style={{textDecoration:"none",color:"inherit",display:"flex",alignItems:"center",justifyContent:"space-between",border:"1px solid #24342f19",borderRadius:20,background:"#ffffffad",padding:"22px 22px",minHeight:65,boxSizing:"border-box"}}><span style={{fontFamily:HEADING_FONT,fontSize:25}}>{name}</span><span style={{fontSize:12,opacity:.5}}>{String(i+1).padStart(2,"0")} ↗</span></Link>)}</div>
    </div>
    <nav aria-label="Primary navigation" style={{position:"fixed",bottom:"calc(env(safe-area-inset-bottom, 12px) + 18px)",left:"50%",transform:"translateX(-50%)",width:"min(330px,calc(100vw - 48px))",display:"flex",padding:5,borderRadius:28,background:"rgba(255,255,255,.54)",backdropFilter:"blur(24px) saturate(150%)",WebkitBackdropFilter:"blur(24px) saturate(150%)",border:"1px solid rgba(255,255,255,.85)",boxShadow:"0 8px 30px #1b332a19,inset 0 1px 0 #fff9",zIndex:10}}>
      <Link to="/" style={{flex:1,textAlign:"center",padding:"13px 0",borderRadius:23,color:"#51665e",textDecoration:"none",fontSize:14,fontWeight:600}}>Breathing</Link>
      <span aria-current="page" style={{flex:1,textAlign:"center",padding:"13px 0",borderRadius:23,background:"rgba(255,255,255,.75)",boxShadow:"0 2px 12px #20382c12,inset 0 1px 0 #fff",fontSize:14,fontWeight:700}}>Sensory</span>
    </nav>
  </main>;
}
