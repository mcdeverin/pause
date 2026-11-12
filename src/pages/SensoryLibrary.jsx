import GlassSurface from "../components/GlassSurface";
import { useState, useEffect, useRef } from "react";
import CloudScene from "../components/visuals/CloudScene";
import LiquidChromeScene from "../components/visuals/LiquidChromeScene";
import LiquidSurfaceScene from "../components/visuals/LiquidSurfaceScene";
import PrismaticWaterScene from "../components/visuals/PrismaticWaterScene";
import OrbitScene from "../components/visuals/OrbitScene";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { FONT, HEADING_FONT } from "../lib/design";

const groups = [
  {name:"Nature",description:"Quiet places, natural movement.",items:[["Cloud","/sensory/cloud"],["Underwater","/sensory/underwater"]]},
  {name:"Abstract",description:"Light, texture, and fluid motion.",items:[["Liquid Chrome","/sensory/liquid-chrome"],["Popcorn","/sensory/popcorn"],["Liquid Surface","/sensory/liquid-surface"],["Prismatic Water","/sensory/prismatic-water"]]}
];

function Preview({name}) {
  const ref = useRef(null);
  const [visible,setVisible] = useState(false);
  useEffect(()=>{
    const el=ref.current;
    if(!el)return;
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:"80px"});
    observer.observe(el);
    return ()=>observer.disconnect();
  },[]);
  const scenes={
    "Cloud": <CloudScene preview />,
    "Liquid Chrome": <LiquidChromeScene />,
    "Popcorn": <OrbitScene />,
    "Liquid Surface": <LiquidSurfaceScene />,
    "Prismatic Water": <PrismaticWaterScene />
  };
  return <div ref={ref} style={{width:"100%",height:"100%",background:name==="Underwater"?"linear-gradient(155deg,#194d78,#092744 70%,#071b35)":"#d7e8e9",pointerEvents:"none"}}>
    {visible && (name==="Underwater"
      ? <iframe title="Underwater visual preview" src="https://holtsetio.com/lab/aurelia/" loading="lazy" tabIndex={-1} aria-hidden="true" style={{border:0,width:"100%",height:"calc(100% + 90px)",marginTop:-40,pointerEvents:"none"}} />
      : scenes[name])}
  </div>;
}

export default function SensoryLibrary() {
  const [category,setCategory]=useState("All");
  const visibleGroups = category === "All" ? groups : groups.filter(g=>g.name===category);
  return <main style={{minHeight:"100dvh",boxSizing:"border-box",background:"#f5f5f1",color:"#24342f",padding:"calc(env(safe-area-inset-top, 28px) + 24px) 24px calc(env(safe-area-inset-bottom, 20px) + 118px)",fontFamily:FONT}}>
    <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:620,margin:"0 auto"}}>
      <Link to="/" aria-label="Back to breathing" style={{color:"inherit",padding:8}}><ChevronLeft size={22}/></Link>
      <span style={{fontFamily:HEADING_FONT,fontSize:23}}>always pause.</span>
      <span style={{width:38}}/>
    </header>
    <div style={{maxWidth:900,margin:"clamp(36px,6vh,64px) auto 0"}}>
      <div role="tablist" aria-label="Sensory categories" style={{display:"flex",gap:28,borderBottom:"1px solid #24342f22"}}>
        {["All","Nature","Abstract"].map(name=><button key={name} role="tab" aria-selected={category===name} onClick={()=>setCategory(name)} style={{border:0,borderBottom:category===name?"2px solid #325c50":"2px solid transparent",padding:"12px 0",marginBottom:-1,background:"none",fontFamily:FONT,fontSize:15,fontWeight:category===name?650:400,color:category===name?"#24342f":"#78857f",cursor:"pointer"}}>{name}</button>)}
      </div>
      {visibleGroups.map(group=><section key={group.name} aria-label={group.name} style={{marginTop:28}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,marginBottom:14}}>
          <h2 style={{fontFamily:HEADING_FONT,fontSize:25,fontWeight:400,margin:0}}>{group.name}</h2>

        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:18}}>
          {group.items.map(([name,path])=><Link key={path} to={path} aria-label={`Explore ${name}`} style={{display:"block",textDecoration:"none",color:"inherit",minWidth:0}}>
            <div style={{position:"relative",aspectRatio:"4 / 4.3",borderRadius:16,overflow:"hidden",background:"#d9e1dd"}}>
              <Preview name={name} />
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,padding:"11px 2px 0"}}>
              <span style={{fontFamily:HEADING_FONT,fontSize:"clamp(17px,4vw,22px)",lineHeight:1.2}}>{name}</span>
              <span aria-hidden="true" style={{fontSize:17,color:"#74877f"}}>↗</span>
            </div>
          </Link>)}
        </div>
      </section>)}
    </div>
    <GlassSurface width="min(320px, calc(100vw - 48px))" height={76} borderRadius={38} distortionScale={-180} displace={0.5} backgroundOpacity={0.1} blur={11} style={{position:"fixed",bottom:"calc(env(safe-area-inset-bottom, 12px) + 18px)",left:"50%",transform:"translateX(-50%)",zIndex:10}}>
      <nav aria-label="Primary navigation" style={{width:"100%",display:"flex",alignItems:"center",padding:"0 18px",boxSizing:"border-box"}}>
        <Link to="/" style={{flex:1,textAlign:"center",padding:"12px 0",color:"#51665e",textDecoration:"none",fontSize:14}}>Breathing</Link>
        <span aria-current="page" style={{flex:1,textAlign:"center",padding:"12px 0",fontSize:14,fontWeight:650}}>Sensory</span>
      </nav>
    </GlassSurface>
  </main>;
}
