import { useEffect, useRef, useState } from "react";

const COLORS = ["#ff388b","#adff36","#7c48ff","#00edca","#ff9c45"];
export default function NeonNatureScene({ preview = false, backgroundMode = "dark" }){
 const canvasRef=useRef(null), baseRef=useRef(null), paintRef=useRef(null), active=useRef(false), last=useRef(null);
 const [mode,setMode]=useState("paint"),[color,setColor]=useState(COLORS[0]);
 const modeRef=useRef(mode),colorRef=useRef(color);modeRef.current=mode;colorRef.current=color;
 useEffect(()=>{
  const canvas=canvasRef.current;const ctx=canvas.getContext("2d");let disposed=false;
  const w=900,h=600;canvas.width=w;canvas.height=h;
  const base=document.createElement("canvas");base.width=w;base.height=h;
  const b=base.getContext("2d");
  const gradient=b.createLinearGradient(0,0,w,h);
  if(backgroundMode==="light") {gradient.addColorStop(0,"#fffdf8");gradient.addColorStop(.55,"#f6f0e6");gradient.addColorStop(1,"#fffaf2");}
  else {gradient.addColorStop(0,"#07142e");gradient.addColorStop(.55,"#071b32");gradient.addColorStop(1,"#031d28");}
  b.fillStyle=gradient;b.fillRect(0,0,w,h);baseRef.current=base;
  let layer=paintRef.current;
  if(!layer){layer=document.createElement("canvas");layer.width=w;layer.height=h;paintRef.current=layer;}
  if(preview && !layer.datasetPreviewInitialized){
   layer.datasetPreviewInitialized=true;
   const p=layer.getContext("2d");p.lineCap="round";p.lineJoin="round";
   // Layered translucent curves resemble flowing neon pigment rather than rigid zigzags.
   [["#ff388b",120,390,300,180,560,500,760,200],
    ["#7c48ff",30,260,280,100,430,410,820,140],
    ["#00edca",100,520,370,330,570,590,890,240],
    ["#adff36",500,580,620,350,740,530,940,330]].forEach(([color,x1,y1,c1x,c1y,c2x,c2y,x2,y2])=>{
     for(let i=0;i<7;i++){
       p.beginPath();p.moveTo(x1,y1+i*6);
       p.bezierCurveTo(c1x,c1y+i*7,c2x,c2y+i*5,x2,y2+i*4);
       p.strokeStyle=color;p.globalAlpha=.09+i*.014;p.lineWidth=24-i*2;
       p.shadowColor=color;p.shadowBlur=24;p.stroke();
     }
   });
  }
  ctx.drawImage(base,0,0);
 },[preview,backgroundMode]);
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
 return <div style={{width:"100%",height:"100%",position:"relative",background:backgroundMode==="light"?"#fffaf2":"#07142e"}}>
  <canvas ref={canvasRef} onPointerDown={e=>{active.current=true;last.current=null;e.currentTarget.setPointerCapture(e.pointerId);draw(e);}} onPointerMove={draw} onPointerUp={()=>{active.current=false;last.current=null;}} onPointerCancel={()=>{active.current=false;last.current=null;}} style={{width:"100%",height:"100%",objectFit:"cover",touchAction:"none",cursor:"crosshair",display:"block"}}/>
  {!preview && <div style={{position:"absolute",left:16,bottom:16,right:16,display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,padding:10,background:"#ffffffdf",borderRadius:16}}>
   <button onClick={()=>setMode("paint")} style={{border:mode==="paint"?"2px solid #222":"1px solid #bbb",borderRadius:12,padding:"8px 12px",background:"white"}}>Paint</button>
   <button onClick={()=>setMode("erase")} style={{border:mode==="erase"?"2px solid #222":"1px solid #bbb",borderRadius:12,padding:"8px 12px",background:"white"}}>Erase</button>
   {COLORS.map(c=><button key={c} onClick={()=>{setColor(c);setMode("paint");}} aria-label={"Paint "+c} style={{width:28,height:28,borderRadius:"50%",background:c,border:color===c?"3px solid #222":"2px solid white"}}/>)}
   <button onClick={reset} style={{marginLeft:"auto",border:"1px solid #bbb",background:"white",borderRadius:12,padding:"8px 12px"}}>Reset</button>
  </div>}

 </div>;
}
