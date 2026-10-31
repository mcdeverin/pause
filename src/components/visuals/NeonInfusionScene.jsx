import { useEffect, useRef, useState } from "react";
import { BACKDROP_PHOTOS } from "@/lib/crystalStudio";

// Studio prototype: edge-guided vegetation propagation. True per-tree masks require segmentation assets.
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
    model.current={original,output:new ImageData(W,H),ink:new Float32Array(W*H),hue:new Uint8Array(W*H),visited:new Uint16Array(W*H),queue:[],head:0,stamp:0,activeColor:0,seedRGB:null,mask:new Uint8Array(W*H)};
    // Vegetation likelihood: green-dominant, moderately dark, and textured. Sky and water stay unmasked.\n    const data=original.data,mask=model.current.mask;\n    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const k=y*W+x,i=k*4,r=data[i],g=data[i+1],b=data[i+2];\n      const vegetation=g>r*.78&&g>b*.9&&g>24&&(r+g+b)<565;\n      const skyBlue=b>g*1.08&&b>r*1.12;\n      mask[k]=vegetation&&!skyBlue?1:0;\n    }\n    setReady(true);
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
      // Grow from the held point through adjacent, similarly colored vegetation.
      // 8-connected neighbors avoid the diamond-shaped Manhattan-distance frontier.
      // Expansion is blocked by strong image edges and non-vegetation pixels.
      const offsets=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
      for(let n=0;n<115&&m.head<m.queue.length;n++){
       const k=m.queue[m.head++],x=k%W,y=(k/W)|0,i=k*4;
       ink[k]=1;m.hue[k]=m.activeColor;
       for(const [dx,dy] of offsets){
        const nx=x+dx,ny=y+dy;if(nx<1||nx>=W-1||ny<1||ny>=H-1)continue;
        const q=ny*W+nx;if(m.visited[q]===m.stamp||!m.mask[q])continue;
        const a=q*4;
        const edge=Math.abs(source[a]-source[i])+Math.abs(source[a+1]-source[i+1])+Math.abs(source[a+2]-source[i+2]);
        const seed=m.seedRGB;
        const similarity=Math.abs(source[a]-seed[0])*.45+Math.abs(source[a+1]-seed[1])*.4+Math.abs(source[a+2]-seed[2])*.35;
        if(edge>100||similarity>115)continue;
        m.visited[q]=m.stamp;m.queue.push(q);
       }
      }
