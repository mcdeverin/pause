import { useState } from "react";
import { Link } from "react-router-dom";
import OrbitScene from "@/components/visuals/OrbitScene";

const COLORS = [["Cherry","#d90a3d"],["Coral","#f2544d"],["Wine","#7e1530"],["Ruby","#b70029"]];

export default function Popcorn() {
  const [accent,setAccent]=useState(COLORS[0][1]);
  const [motion,setMotion]=useState(.85);
  const [paused,setPaused]=useState(false);
  return (
    <main style={{minHeight:"100dvh",background:"#f7f6f4",color:"#27232a",padding:"clamp(16px,3vw,34px)",fontFamily:"inherit"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:18}}>
          <Link to="/" style={{textDecoration:"none",color:"#645e66",fontSize:14}}>← Back to Always Pause</Link>
          <span style={{fontSize:11,letterSpacing:".16em",fontWeight:700,color:"#8d8187"}}>SENSORY</span>
        </div>
        <h1 style={{fontSize:"clamp(30px,5vw,46px)",fontWeight:700,margin:"0 0 6px"}}>Popcorn</h1>
        <p style={{fontSize:14,color:"#80777d",margin:"0 0 22px"}}>Touch, scatter, and watch the spheres come together again.</p>
        <div style={{position:"relative",height:"min(68dvh,690px)",minHeight:340,borderRadius:22,overflow:"hidden",background:"#dedede"}}>
          <OrbitScene accent={accent} motion={motion} paused={paused}/>
          <div style={{position:"absolute",left:18,bottom:18,pointerEvents:"none",fontSize:12,color:"#5d5158",background:"#ffffffb8",borderRadius:20,padding:"9px 13px"}}>Move your cursor or drag to bounce</div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:22,marginTop:22}}>
          <div><div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Color</div><div style={{display:"flex",gap:12}}>
            {COLORS.map(([name,hex])=><button key={hex} type="button" title={name} aria-label={name} aria-pressed={accent===hex} onClick={()=>setAccent(hex)} style={{width:36,height:36,borderRadius:"50%",background:hex,border:accent===hex?"3px solid #353036":"3px solid white",outline:"1px solid #d1c9ca",cursor:"pointer"}}/>)}
          </div></div>
          <label style={{fontSize:13}}>Bounce · {Math.round(motion*100)}%<input type="range" min="0" max="1" step=".05" value={motion} onChange={e=>setMotion(Number(e.target.value))} style={{display:"block",width:190,marginTop:12}}/></label>
          <button type="button" onClick={()=>setPaused(v=>!v)} style={{border:"1px solid #ded8d9",background:"white",borderRadius:22,padding:"11px 22px",cursor:"pointer"}}>{paused?"Resume":"Pause"}</button>
        </div>
      </div>
    </main>
  );
}
