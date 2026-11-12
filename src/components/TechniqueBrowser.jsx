import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import BackgroundLayer from "./BackgroundLayer";
import { MOMENTS } from "../lib/moments";

const CATEGORIES = ["All", "Calm", "Sleep", "Focus", "Energy", "Advanced"];
export default function TechniqueBrowser({ techniques, momentId, onChoose, onBack, theme, backgroundSettings, photo }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const moment = MOMENTS.find(item => item.id === momentId);
  const explore = momentId === "explore_all";
  const items = useMemo(() => techniques.filter(t => (!explore || category === "All" || t.category === category) && String(t.name || "").toLowerCase().includes(query.toLowerCase())).sort((a,b) => String(a.name).localeCompare(String(b.name))), [techniques, explore, category, query]);
  return <main className="screen-fit" style={{ position:"relative", isolation:"isolate", overflow:"hidden", display:"flex", flexDirection:"column", padding:"calc(env(safe-area-inset-top, 44px) + 8px) 22px calc(env(safe-area-inset-bottom, 20px) + 12px)", boxSizing:"border-box", color:"#fff" }}>
    <BackgroundLayer settings={backgroundSettings} theme={theme} photo={photo} />
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(12,29,35,.72),rgba(12,29,35,.55))",pointerEvents:"none"}} />
    <div style={{position:"relative",maxWidth:560,width:"100%",margin:"0 auto",display:"flex",flexDirection:"column",minHeight:0,flex:1}}>
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:48}}>
        <button onClick={onBack} aria-label="Back" style={{border:0,background:"transparent",color:"inherit",padding:10,cursor:"pointer"}}><ArrowLeft size={23}/></button>
        <span style={{fontFamily:"Georgia,serif",fontSize:22}}>always pause.</span><span style={{width:43}}/>
      </header>
      <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(30px,6vw,42px)",fontWeight:400,margin:"24px 0 4px"}}>{explore ? "Explore breathing." : moment?.label + "."}</h1>
      <p style={{margin:"0 0 20px",opacity:.85,fontSize:14}}>Choose a technique for this moment.</p>
      <label style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.16)",border:"1px solid rgba(255,255,255,.35)",borderRadius:18,padding:"12px 14px"}}><Search size={18}/><input aria-label="Search breathing techniques" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search techniques" style={{background:"transparent",border:0,outline:0,color:"#fff",font:"inherit",width:"100%"}} /></label>
      {explore && <div style={{display:"flex",gap:7,overflowX:"auto",padding:"14px 0 4px",flexShrink:0}}>{CATEGORIES.map(name=><button key={name} onClick={()=>setCategory(name)} aria-pressed={category===name} style={{whiteSpace:"nowrap",border:"1px solid rgba(255,255,255,.5)",borderRadius:99,padding:"8px 13px",background:category===name?"#f7f2eb":"rgba(255,255,255,.12)",color:category===name?"#243c3e":"#fff",fontWeight:600,cursor:"pointer"}}>{name}</button>)}</div>}
      <div style={{overflowY:"auto",minHeight:0,flex:1,padding:"12px 0 24px",display:"flex",flexDirection:"column",gap:9}}>
        {items.map(t=><button key={t.id || t.name} onClick={()=>onChoose(t)} style={{width:"100%",textAlign:"left",padding:"16px 18px",borderRadius:20,border:"1px solid rgba(255,255,255,.35)",background:"rgba(18,37,43,.43)",color:"#fff",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <span style={{fontSize:16,fontWeight:600}}>{t.name}</span><span style={{fontSize:12,opacity:.8,whiteSpace:"nowrap"}}>{t.category || "Breathing"} ›</span>
        </button>)}
        {items.length===0 && <p style={{textAlign:"center",opacity:.85}}>No matching techniques. Try another search.</p>}
      </div>
    </div>
  </main>;
}
