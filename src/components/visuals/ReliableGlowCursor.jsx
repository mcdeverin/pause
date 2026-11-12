import { useEffect, useRef } from "react";

export default function ReliableGlowCursor({ paused = false }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w=1,h=1,raf=0,last=0;
    const strokes=[];
    const pointer={down:false,inside:false,x:0,y:0,lastX:0,lastY:0};
    const resize=()=>{const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);w=Math.max(1,rect.width);h=Math.max(1,rect.height);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
    const locate=e=>{const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
    const move=e=>{const p=locate(e);if(pointer.inside&&!paused){strokes.push({x: pointer.x,y:pointer.y,tx:p.x,ty:p.y,life:1});if(strokes.length>450)strokes.shift();}pointer.x=p.x;pointer.y=p.y;pointer.inside=true;};
    const enter=e=>{const p=locate(e);pointer.x=p.x;pointer.y=p.y;pointer.inside=true;};
    const leave=()=>{pointer.inside=false;};
    const down=e=>{const p=locate(e);for(let i=0;i<24;i++){const a=i*Math.PI*2/24;strokes.push({x:p.x,y:p.y,tx:p.x+Math.cos(a)*28,ty:p.y+Math.sin(a)*28,life:1});}};
    const draw=now=>{const dt=last?Math.min((now-last)/1000,.05):0;last=now;ctx.fillStyle="#070b16";ctx.fillRect(0,0,w,h);ctx.lineCap="round";ctx.lineJoin="round";ctx.globalCompositeOperation="lighter";
      for(let i=strokes.length-1;i>=0;i--){const s=strokes[i];if(!paused)s.life-=dt/1.45;if(s.life<=0){strokes.splice(i,1);continue;}
        for(const [width,alpha,blur] of [[30,.10,22],[13,.22,12],[3,.95,5]]){ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.tx,s.ty);ctx.lineWidth=width;ctx.strokeStyle=`rgba(95,139,255,${alpha*s.life})`;ctx.shadowColor="#5f8bff";ctx.shadowBlur=blur;ctx.stroke();}
      }
      ctx.shadowBlur=0;ctx.globalCompositeOperation="source-over";raf=requestAnimationFrame(draw);};
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    canvas.addEventListener("pointerenter",enter);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerleave",leave);canvas.addEventListener("pointerdown",down);
    raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();canvas.removeEventListener("pointerenter",enter);canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerleave",leave);canvas.removeEventListener("pointerdown",down);};
  },[paused]);
  return <canvas ref={canvasRef} aria-label="Draw a glowing blue trail by moving your pointer" style={{display:"block",width:"100%",height:"100%",background:"#070b16",touchAction:"none"}}/>;
}