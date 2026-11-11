import { useRef, useState } from "react";
import { BACKDROP_PHOTOS } from "@/lib/crystalStudio";

// Continuous, touch-friendly before/after comparison; unlike PixelSwap's timed hover trigger.
export default function NeonRevealSlider() {
  const [photoId, setPhotoId] = useState(BACKDROP_PHOTOS[0]?.id ?? "");
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const frame = useRef(null);
  const photo = BACKDROP_PHOTOS.find(p => p.id === photoId) ?? BACKDROP_PHOTOS[0];
  const update = e => {
    const r = frame.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    setPosition(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
  };
  const imgStyle = {position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",userSelect:"none",pointerEvents:"none"};
  return <div style={{position:"relative",width:"100%",height:"100%",background:photo?.tone || "#0d1324"}}>
    {photo && <>
      <img src={photo.url} alt="" draggable={false} style={imgStyle}/>
      <div style={{position:"absolute",inset:0,clipPath:`inset(0 ${100-position}% 0 0)`,overflow:"hidden",pointerEvents:"none"}}>
        <img src={photo.url} alt="" draggable={false} style={{...imgStyle,filter:"brightness(.78) contrast(1.55) saturate(3.2) hue-rotate(115deg)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(125deg,rgba(248,24,170,.18),transparent 43%,rgba(0,240,220,.26))",mixBlendMode:"screen"}}/>
      </div>
      <div ref={frame} role="slider" tabIndex={0} aria-label="Reveal neon version" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(position)}
        onKeyDown={e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();setPosition(v=>Math.max(0,Math.min(100,v+(e.key==="ArrowRight"?5:-5))))}}}
        onPointerDown={e=>{setDragging(true);e.currentTarget.setPointerCapture(e.pointerId);update(e)}}
        onPointerMove={e=>{if(dragging)update(e)}}
        onPointerUp={e=>{update(e);setDragging(false)}}
        onPointerCancel={()=>setDragging(false)}
        style={{position:"absolute",inset:0,cursor:"ew-resize",touchAction:"none",outlineOffset:-4}}>
        <div style={{position:"absolute",left:`${position}%`,top:0,bottom:0,width:2,transform:"translateX(-50%)",background:"white",boxShadow:"0 0 12px #0008",pointerEvents:"none"}}>
          <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:46,height:46,borderRadius:"50%",background:"#ffffffee",display:"grid",placeItems:"center",color:"#282038",fontSize:19,fontWeight:700,boxShadow:"0 3px 20px #0007"}}>↔</div>
        </div>
      </div>
      <span style={{position:"absolute",left:16,bottom:18,padding:"6px 11px",borderRadius:20,background:"#0008",color:"white",pointerEvents:"none",fontSize:12}}>Neon treatment</span>
      <span style={{position:"absolute",right:16,bottom:18,padding:"6px 11px",borderRadius:20,background:"#0008",color:"white",pointerEvents:"none",fontSize:12}}>Original</span>
    </>}
    <label style={{position:"absolute",top:15,right:15,display:"flex",alignItems:"center",gap:8,background:"#fffffff0",padding:"8px 10px",borderRadius:12,color:"#26232e",fontSize:12,zIndex:2}}>Photo
      <select aria-label="Nature photograph" value={photoId} onChange={e=>setPhotoId(e.target.value)} style={{maxWidth:145,border:"1px solid #ddd",borderRadius:7,padding:4}}>
        {BACKDROP_PHOTOS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
    </label>
  </div>;
}
