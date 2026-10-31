import { useEffect, useRef, useState } from "react";
import { BACKDROP_PHOTOS } from "@/lib/crystalStudio";

const COLORS = ["#ff388b","#adff36","#7c48ff","#00edca","#ff9c45"];
export default function NeonNatureScene(){
 const canvasRef=useRef(null), baseRef=useRef(null), paintRef=useRef(null), active=useRef(false), last=useRef(null);
 const [mode,setMode]=useState("paint"),[color,setColor]=useState(COLORS[0]),[photo,setPhoto]=useState(0);
 const modeRef=useRef(mode),colorRef=useRef(color);modeRef.current=mode;colorRef.current=color;
 useEffect(()=>{
  const canvas=canvasRef.current;const ctx=canvas.getContext("2d");let disposed=false;
  const img=new Image();img.crossOrigin="anonymous";
  img.onload=()=>{
   if(disposed)return;
   const w=900,h=600;canvas.width=w;canvas.height=h;
   const base=document.createElement("canvas");base.width=w;base.height=h;
   const b=base.getContext("2d",{willReadFrequently:true});
   const scale=Math.max(w/img.width,h/img.height),sw=img.width*scale,sh=img.height*scale;
   b.drawImage(img,(w-sw)/2,(h-sh)/2,sw,sh);baseRef.current=base;
   const layer=document.createElement("canvas");layer.width=w;layer.height=h;paintRef.current=layer;
   ctx.drawImage(base,0,0);
  };
  img.src=BACKDROP_PHOTOS[photo]?.url||"";
  return()=>{disposed=true;img.onload=null;};
 },[photo]);
 useEffect(()=>{
  let frame;const canvas=canvasRef.current;
  const render=()=>{
   const base=baseRef.current,paint=paintRef.current;
   if(base&&paint){
    const ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(base,0,0);
    ctx.save();ctx.globalCompositeOperation="screen";ctx.drawImage(paint,0,0);ctx.restore();
   }
   frame=requestAnimationFrame(render);
  };frame=requestAnimationFrame(render);return()=>cancelAnimationFrame(frame);
 },[]);
 const draw=e=>{
  if(!active.current||!paintRef.current)return;
  const canvas=canvasRef.current,r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;
  const p=paintRef.current.getContext("2d");
  p.save();p.lineCap="round";p.lineJoin="round";p.lineWidth=54;
  if(modeRef.current==="erase"){p.globalCompositeOperation="destination-out";p.strokeStyle="#000";p.shadowBlur=0;}
  else {p.globalCompositeOperation="source-over";p.strokeStyle=colorRef.current;p.shadowColor=colorRef.current;p.shadowBlur=22;p.globalAlpha=.65;}
  p.beginPath();p.moveTo(last.current?.x??x,last.current?.y??y);p.lineTo(x,y);p.stroke();
  p.restore();last.current={x,y};
 };
 const reset=()=>{const c=paintRef.current;if(c)c.getContext("2d").clearRect(0,0,c.width,c.height);};
 return <div style={{width:"100%",height:"100%",position:"relative",background:"#284537"}}>
  <canvas ref={canvasRef} onPointerDown={e=>{active.current=true;last.current=null;e.currentTarget.setPointerCapture(e.pointerId);draw(e);}} onPointerMove={draw} onPointerUp={()=>{active.current=false;last.current=null;}} onPointerCancel={()=>{active.current=false;last.current=null;}} style={{width:"100%",height:"100%",objectFit:"cover",touchAction:"none",cursor:"crosshair",display:"block"}}/>
  <div style={{position:"absolute",left:16,bottom:16,right:16,display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,padding:10,background:"#ffffffdf",borderRadius:16}}>
   <button onClick={()=>setMode("paint")} style={{border:mode==="paint"?"2px solid #222":"1px solid #bbb",borderRadius:12,padding:"8px 12px",background:"white"}}>Paint</button>
   <button onClick={()=>setMode("erase")} style={{border:mode==="erase"?"2px solid #222":"1px solid #bbb",borderRadius:12,padding:"8px 12px",background:"white"}}>Erase</button>
   {COLORS.map(c=><button key={c} onClick={()=>{setColor(c);setMode("paint");}} aria-label={"Paint "+c} style={{width:28,height:28,borderRadius:"50%",background:c,border:color===c?"3px solid #222":"2px solid white"}}/>)}
   <button onClick={reset} style={{marginLeft:"auto",border:"1px solid #bbb",background:"white",borderRadius:12,padding:"8px 12px"}}>Reset</button>
  </div>
  <select aria-label="Landscape" value={photo} onChange={e=>setPhoto(+e.target.value)} style={{position:"absolute",right:16,top:70,border:0,borderRadius:10,padding:8,background:"#ffffffe8"}}>{BACKDROP_PHOTOS.map((p,i)=><option key={p.id} value={i}>{p.label||p.id}</option>)}</select>
 </div>;
}
