import { useEffect, useRef, useState } from "react";
import { BACKDROP_PHOTOS } from "@/lib/crystalStudio";

// Studio prototype: pixel-aware propagation, not semantic tree segmentation.
const COLORS=["#ff3991","#b7ff2e","#ad5cff","#00f6c6","#ffab39"];
const W=600,H=400;
export default function NeonInfusionScene(){
 const canvas=useRef(null),model=useRef(null),pointer=useRef({down:false,erase:false,x:0,y:0}),raf=useRef(0);
 const [color,setColor]=useState(COLORS[0]),[photo,setPhoto]=useState(0),[erase,setErase]=useState(false),[ready,setReady]=useState(false);
 const colorRef=useRef(color);colorRef.current=color;
 const eraseRef=useRef(erase);eraseRef.current=erase;
 useEffect(()=>{
  let cancelled=false;setReady(false);model.current=null;
  const image=new Image();image.crossOrigin="anonymous";
  image.onload=()=>{
   if(cancelled)return;
   const c=document.createElement("canvas");c.width=W;c.height=H;
   const ctx=c.getContext("2d",{willReadFrequently:true});
   const scale=Math.max(W/image.width,H/image.height);
   ctx.drawImage(image,(W-image.width*scale)/2,(H-image.height*scale)/2,image.width*scale,image.height*scale);
   try{
    const original=ctx.getImageData(0,0,W,H);
    model.current={original,output:new ImageData(W,H),ink:new Float32Array(W*H),hue:new Uint8Array(W*H),visited:new Uint8Array(W*H),queue:[],head:0,stamp:0,activeColor:0};
    setReady(true);
   }catch(e){console.warn("Neon Infusion requires a CORS-enabled photograph",e);}
  };
  image.src=BACKDROP_PHOTOS[photo]?.url||"";
  return()=>{cancelled=true;};
 },[photo]);
 useEffect(()=>{
  const ctx=canvas.current?.getContext("2d");if(!ctx)return;
  const frame=()=>{
   const m=model.current,p=pointer.current;
   if(m){
    const source=m.original.data,dest=m.output.data,ink=m.ink;
    if(p.down){
     if(p.erase){
      const radius=18;
      for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
       const x=p.x+dx,y=p.y+dy;if(x<0||x>=W||y<0||y>=H)continue;
       const d=Math.hypot(dx,dy);if(d>radius)continue;
       const k=y*W+x;ink[k]=Math.max(0,ink[k]-(1-d/radius)*.22);
      }
     }else{
      // Slowly expand through adjacent vegetation-like pixels while held.
      for(let n=0;n<520&&m.head<m.queue.length;n++){
       const k=m.queue[m.head++],x=k%W,y=(k/W)|0,off=k*4;
       ink[k]=Math.min(1,ink[k]+.85);m.hue[k]=m.activeColor;
       const neighbors=[k-1,k+1,k-W,k+W];
       for(let j=0;j<4;j++){
        const nx=x+(j===0?-1:j===1?1:0),ny=y+(j===2?-1:j===3?1:0);
        if(nx<0||nx>=W||ny<0||ny>=H)continue;
        const q=neighbors[j];if(m.visited[q]===m.stamp)continue;
        const a=q*4,r=source[a],g=source[a+1],b=source[a+2];
        // Exclude bright sky, blue water, and neutral rock; preserve photo detail.
        const vegetation=g>r*.78&&g>b*.83&&g>30&&(r+g+b)<610;
        const contrast=Math.abs(r-source[off])+Math.abs(g-source[off+1])+Math.abs(b-source[off+2]);
        if(!vegetation||contrast>145)continue;
        m.visited[q]=m.stamp;m.queue.push(q);
       }
      }
     }
    }
    for(let k=0;k<ink.length;k++){
     const i=k*4,amount=ink[k],r=source[i],g=source[i+1],b=source[i+2];
     if(amount>.001){
      const hex=COLORS[m.hue[k]],cr=parseInt(hex.slice(1,3),16),cg=parseInt(hex.slice(3,5),16),cb=parseInt(hex.slice(5,7),16);
      const luminance=(r*.25+g*.6+b*.15)/255;
      const shade=.38+luminance*.9;
      const mix=amount*.9;
      dest[i]=r*(1-mix)+Math.min(255,cr*shade)*mix;
      dest[i+1]=g*(1-mix)+Math.min(255,cg*shade)*mix;
      dest[i+2]=b*(1-mix)+Math.min(255,cb*shade)*mix;
     }else{dest[i]=r;dest[i+1]=g;dest[i+2]=b;}
     dest[i+3]=255;
    }
    ctx.putImageData(m.output,0,0);
   }
   raf.current=requestAnimationFrame(frame);
  };raf.current=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf.current);
 },[]);
 const coords=e=>{const r=canvas.current.getBoundingClientRect();return {x:Math.max(0,Math.min(W-1,Math.floor((e.clientX-r.left)*W/r.width))),y:Math.max(0,Math.min(H-1,Math.floor((e.clientY-r.top)*H/r.height)))};};
 const down=e=>{
  const m=model.current;if(!m)return;
  const p=coords(e);pointer.current={...p,down:true,erase:eraseRef.current};
  e.currentTarget.setPointerCapture(e.pointerId);
  if(!eraseRef.current){
   m.stamp=(m.stamp%254)+1;m.queue=[];m.head=0;
   m.activeColor=Math.max(0,COLORS.indexOf(colorRef.current));
   const seed=p.y*W+p.x;m.queue.push(seed);m.visited[seed]=m.stamp;
  }
 };
 const move=e=>{if(!pointer.current.down)return;Object.assign(pointer.current,coords(e));};
 const stop=()=>{pointer.current.down=false;};
 const reset=()=>{if(model.current){model.current.ink.fill(0);model.current.queue=[];model.current.head=0;}};
 return <div style={{height:"100%",width:"100%",position:"relative",background:"#334b3d"}}>
  <canvas ref={canvas} width={W} height={H} onPointerDown={down} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} style={{height:"100%",width:"100%",objectFit:"cover",touchAction:"none",display:"block",cursor:"crosshair"}}/>
  {!ready&&<div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"white"}}>Loading landscape…</div>}
  <div style={{position:"absolute",bottom:15,left:15,right:15,display:"flex",alignItems:"center",flexWrap:"wrap",gap:8,padding:10,background:"#ffffffea",borderRadius:16}}>
   <button onClick={()=>setErase(false)} style={{border:!erase?"2px solid #222":"1px solid #bbb",borderRadius:12,padding:"7px 12px",background:"white"}}>Hold to infuse</button>
   <button onClick={()=>setErase(true)} style={{border:erase?"2px solid #222":"1px solid #bbb",borderRadius:12,padding:"7px 12px",background:"white"}}>Swipe to erase</button>
   {COLORS.map(c=><button key={c} aria-label={"Neon "+c} onClick={()=>{setColor(c);setErase(false);}} style={{height:28,width:28,borderRadius:20,background:c,border:color===c?"3px solid #242424":"2px solid white"}}/>)}
   <button onClick={reset} style={{marginLeft:"auto",padding:"7px 12px",borderRadius:12,border:"1px solid #bbb",background:"white"}}>Reset</button>
  </div>
  <select aria-label="Landscape" value={photo} onChange={e=>setPhoto(+e.target.value)} style={{position:"absolute",top:68,right:15,padding:8,borderRadius:10,border:0,background:"#ffffffe8"}}>{BACKDROP_PHOTOS.map((p,i)=><option key={p.id} value={i}>{p.label||p.id}</option>)}</select>
 </div>;
}
