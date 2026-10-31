import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Orb } from "@/components/visuals/ElevenLabsOrb";
import { BACKDROP_PHOTOS, BACKGROUND_CSS, STUDIO_UI } from "@/lib/crystalStudio";

const palettes = {
  Pearl: ["#b6a5ee","#ffd2c8"],
  Lagoon: ["#76c7df","#c6e7db"],
  Twilight: ["#827bbf","#edb9ce"],
  Sunrise: ["#f6b5a4","#e5c4f4"],
};
export default function LiquidOrbStudio() {
  const [allowed,setAllowed] = useState(null);
  const [palette,setPalette] = useState("Pearl");
  const [mode,setMode] = useState("dark");
  const [photoId,setPhotoId] = useState(BACKDROP_PHOTOS[0]?.id);
  const [playing,setPlaying] = useState(true);
  const [manual,setManual] = useState(false);
  const [breath,setBreath] = useState(0);
  const [expansion,setExpansion] = useState(55);
  const [seconds,setSeconds] = useState(8);
  useEffect(()=>{base44.auth.me().then(me=>setAllowed(me?.role==="admin")).catch(()=>setAllowed(false));},[]);
  useEffect(()=>{
    if (!playing || manual) return;
    let frame;
    const start=performance.now();
    const tick=now=>{
      const cycle=((now-start)/1000/seconds)%1;
      setBreath(cycle<.5?cycle*2:2-cycle*2);
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame);
  },[playing,manual,seconds]);
  const photo=BACKDROP_PHOTOS.find(p=>p.id===photoId)||BACKDROP_PHOTOS[0];
  const background=mode==="photo"?`url("${photo?.url}") center/cover`:BACKGROUND_CSS[mode]||"#101824";
  if (allowed===null) return <main style={{padding:32}}>Checking access…</main>;
  if (!allowed) return <main style={{padding:32}}>Private studio. <Link to="/">Back to Pause</Link></main>;
  const colors=palettes[palette];
  return <main style={{minHeight:"100dvh",background:STUDIO_UI.page,color:STUDIO_UI.text,padding:"24px max(18px, calc((100vw - 1180px)/2)) 60px"}}>
    <Link to="/" style={{color:STUDIO_UI.accent,fontSize:13}}>← Back to Pause</Link>
    <p style={{color:STUDIO_UI.accent,letterSpacing:".2em",fontSize:11,fontWeight:800,marginTop:24}}>ALWAYS PAUSE · DESIGN STUDIO</p>
    <h1 style={{fontSize:"clamp(28px,4vw,40px)",margin:"4px 0"}}>Liquid Orb Studio</h1>
    <p style={{color:STUDIO_UI.muted}}>ElevenLabs open-source shader, adapted for breathing. Experimental only.</p>
    <section style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",margin:"22px 0",fontSize:13}}>
      <label>Palette <select value={palette} onChange={e=>setPalette(e.target.value)}>{Object.keys(palettes).map(k=><option key={k}>{k}</option>)}</select></label>
      <label>Background <select value={mode} onChange={e=>setMode(e.target.value)}><option value="dark">Dark</option><option value="light">Light</option><option value="photo">Nature photo</option></select></label>
      {mode==="photo"&&<select value={photoId} onChange={e=>setPhotoId(e.target.value)}>{BACKDROP_PHOTOS.map(p=><option key={p.id} value={p.id}>{p.label||p.id}</option>)}</select>}
      <button onClick={()=>setPlaying(v=>!v)}>{playing?"Pause":"Play"}</button>
      <button onClick={()=>{setManual(v=>!v);setBreath(.5)}}>{manual?"Auto breathing":"Manual breathing"}</button>
    </section>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,330px),1fr))",gap:20}}>
      {["Original shader","Breathing adaptation"].map((title,i)=><section key={title} style={{background:"#fff",color:"#243142",borderRadius:18,padding:12}}>
        <b style={{display:"block",padding:"8px 4px 12px"}}>{title}</b>
        <div style={{background,aspectRatio:"1/1",borderRadius:12,overflow:"hidden",display:"grid",placeItems:"center"}}>
          <div style={{width:"78%",height:"78%",transform:i?`scale(${.72+breath*expansion/100})`:"scale(.95)",transition:"transform 90ms linear"}}>
            <Orb colors={colors} seed={420} volumeMode="manual" manualInput={i?breath:.25} manualOutput={playing?.4:0}/>
          </div>
        </div>
      </section>)}
    </div>
    <section style={{maxWidth:650,marginTop:24,padding:20,borderRadius:18,background:"#fff",color:"#243142",display:"grid",gap:16}}>
      <h2 style={{fontSize:18,margin:0}}>Breathing controls</h2>
      <label>Expansion: {expansion}% <input style={{width:"100%"}} type="range" min="0" max="75" value={expansion} onChange={e=>setExpansion(+e.target.value)}/></label>
      <label>Cycle duration: {seconds}s <input style={{width:"100%"}} type="range" min="4" max="20" value={seconds} onChange={e=>setSeconds(+e.target.value)}/></label>
      {manual&&<label>Manual breath: {Math.round(breath*100)}% <input style={{width:"100%"}} type="range" min="0" max="100" value={Math.round(breath*100)} onChange={e=>setBreath(+e.target.value/100)}/></label>}
      <p style={{fontSize:12,color:"#687587"}}>Studio preview only. The production visual gallery remains unchanged. Original shader licensed under MIT.</p>
    </section>
  </main>;
}
