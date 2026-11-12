import GlassSurface from "../components/GlassSurface";
import { useState, useEffect, useRef } from "react";
import CloudScene from "../components/visuals/CloudScene";
import MaterialFlowScene from "../components/visuals/MaterialFlowScene";
import LiquidSurfaceScene from "../components/visuals/LiquidSurfaceScene";
import PrismaticWaterScene from "../components/visuals/PrismaticWaterScene";
import OrbitScene from "../components/visuals/OrbitScene";
import LivingCanvasScene from "../components/visuals/LivingCanvasScene";
import DitherVeil from "../components/visuals/DitherVeil";
import PixelSwapSky from "../components/visuals/PixelSwapSky";
import NeonNatureScene from "../components/visuals/NeonNatureScene";
import Balatro from "../components/visuals/Balatro";
import Antigravity from "../components/visuals/Antigravity";
import Prism from "../components/visuals/Prism";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import NavigationSheet from "../components/NavigationSheet";
import { FONT, HEADING_FONT } from "../lib/design";
import { BACKDROP_PHOTOS } from "../lib/crystalStudio";

const groups = [
  {name:"Nature",description:"Quiet places, natural movement.",items:[["Cloud","/sensory/cloud"],["Underwater","/sensory/underwater"],["Liquid Surface","/sensory/liquid-surface"],["Rain","/sensory/rain"],["Pixel Swap Sky","/sensory/pixel-swap-sky"]]},
  {name:"Abstract",description:"Light, texture, and fluid motion.",items:[["Liquid Chrome","/sensory/liquid-chrome"],["Popcorn","/sensory/popcorn"],["Prismatic Water","/sensory/prismatic-water"],["Firefly","/sensory/firefly"],["Dither Veil","/sensory/dither-veil"],["Neon Painting","/sensory/neon-painting"],["Prismatic Balatro","/sensory/prismatic-balatro"],["Anti Gravity","/sensory/anti-gravity"],["Prism","/sensory/prism"]]}
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
    "Pixel Swap Sky": <PixelSwapSky />,
    "Neon Painting": <NeonNatureScene preview backgroundMode="dark" />,
    "Prism": <Prism animationType="rotate" timeScale={0.5} height={3.5} baseWidth={5.5} scale={1.65} hueShift={0} colorFrequency={1} glow={1} colors={[]} saturation={1.5} noise={0} interactive hoverStrength={2} inertia={0.05} intro resolution={0.5} lightMode={false} />,
    "Anti Gravity": <Antigravity colors={["#5227FF","#FF9FFC","#B497CF"]} count={1500} magnetRadius={9} ringRadius={7} particleSize={0.9} autoAnimate colorMode="conic" colorSpeed={0.05} particleShape="capsule" particleVariance={1} fieldStrength={10} waveAmplitude={1} waveCount={3} waveSpeed={0.4} rotationSpeed={0} pulseSpeed={3} depthFactor={1} ambient={0.25} lerpSpeed={0.05} interactive clickBurst intro lightMode={false} />,
    "Prismatic Balatro": <Balatro color1="#FF873B" color2="#F25BD0" color3="#55D9E8" swirl={0.25} pixelSize={1.5} mouseInteraction contrast={3.5} lighting={0.4} speed={1} rotationSpeed={0} scale={1} detail={5} crt={0} mouseStrength={1} clickSwirl intro lightMode={false} />,
    "Liquid Chrome": <MaterialFlowScene mode="chrome" paused={false} />,
    "Popcorn": <OrbitScene />,
    "Liquid Surface": <LiquidSurfaceScene preview photoUrl={BACKDROP_PHOTOS[0]?.url} />,
    "Prismatic Water": <PrismaticWaterScene />,
    "Firefly": <LivingCanvasScene mode="light" paused={false} />,
    "Dither Veil": <DitherVeil fit="contain" pattern="floyd" pixelSize={2} levels={2} palette="duotone" inkColor="#120f17" paperColor="#f4f1ea" contrast={1.15} brightness={0} revealRadius={200} softness={0.6} linger={1} rimColor="#a78bfa" rim={0} reverse={false} wander={true} clickBurst style={{width:"100%",height:"100%"}} />,
    "Rain": <video src="/videos/16312401-hd_1920_1080_60fps.mp4" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} />
  };
  return <div ref={ref} style={{width:"100%",height:"100%",background:name==="Underwater"?"linear-gradient(155deg,#194d78,#092744 70%,#071b35)":"#d7e8e9",pointerEvents:"none"}}>
    {visible && (name==="Underwater"
      ? <iframe title="Underwater visual preview" src="https://holtsetio.com/lab/aurelia/" loading="lazy" tabIndex={-1} aria-hidden="true" style={{border:0,width:"100%",height:"calc(100% + 650px)",marginTop:-40,pointerEvents:"none"}} />
      : scenes[name])}
  </div>;
}

export default function SensoryLibrary() {
  const [menuOpen,setMenuOpen]=useState(false);
  const navigate=useNavigate();
  const visibleGroups = groups;
  return <main style={{minHeight:"100dvh",boxSizing:"border-box",background:"#f5f5f1",color:"#24342f",padding:"calc(env(safe-area-inset-top, 28px) + 24px) 24px calc(env(safe-area-inset-bottom, 20px) + 118px)",fontFamily:FONT}}>
    <header style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",maxWidth:620,minHeight:44,margin:"0 auto"}}>
      <span style={{fontFamily:HEADING_FONT,fontSize:23}}>always pause.</span>
      <button type="button" onClick={()=>setMenuOpen(true)} aria-label="Open your space" aria-expanded={menuOpen} style={{position:"absolute",right:6,top:0,width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",border:0,background:"none",color:"#24342f",cursor:"pointer",padding:0}}>
        <svg width="29" height="29" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16.2 3.8C22.7 3.5 28.3 8.9 28.2 15.9C28.1 23.1 22.8 28.2 15.7 28.1C8.5 28 3.7 22.6 3.9 15.8C4.1 8.9 9.5 4.1 16.2 3.8Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity=".9"/>
          <path d="M13.1 11.7C12.9 14.4 13.2 17.2 13 20.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M19 11.3C18.8 14.1 19.1 17.1 18.8 20.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </header>
    <div style={{maxWidth:900,margin:"clamp(36px,6vh,64px) auto 0"}}>
      {visibleGroups.map(group=><section key={group.name} aria-label={group.name} style={{marginTop:0,marginBottom:48}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,marginBottom:14}}>
          <h2 style={{fontFamily:HEADING_FONT,fontSize:25,fontWeight:400,margin:0}}>{group.name}</h2>

        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:18}}>
          {group.items.map(([name,path])=><Link key={path} to={path} aria-label={`Explore ${name}`} style={{display:"block",textDecoration:"none",color:"inherit",minWidth:0}}>
            <div style={{position:"relative",aspectRatio:"4 / 4.3",borderRadius:16,overflow:"hidden",background:"#d9e1dd"}}>
              <Preview name={name} />
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,padding:"11px 2px 0"}}>
              <span aria-hidden="true" />
              
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
    <AnimatePresence>
      {menuOpen && <NavigationSheet key="nav" theme="day" selectedCategory="All" onCategoryChange={()=>navigate("/")} isPro={false} onOpenPersonalize={()=>navigate("/")} onOpenMoments={()=>navigate("/")} onOpenPausePlus={()=>navigate("/")} onOpenAbout={()=>navigate("/")} onClose={()=>setMenuOpen(false)} />}
    </AnimatePresence>
  </main>;
}
