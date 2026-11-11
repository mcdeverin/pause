import { useEffect, useRef } from "react";

// Original, dependency-free sensory experiments. Canvas 2D avoids additional WebGL contexts.
const palettes = {
  light: ["#83e4d9", "#8d9df4", "#f2a4ce", "#e8c58d", "#ffffff"],
  aurora: ["#72ffe0", "#7aa7ff", "#d48cff", "#ffe0a8"],
  aether: ["#ffc4d8", "#c1a6ff", "#9debe3", "#fff2cf"],
};
const rand = (a,b) => a + Math.random()*(b-a);
const rgba = (hex,a) => {
  const h=hex.replace("#","");
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
};
export default function LivingCanvasScene({ mode="light", paused=false }) {
  const canvasRef=useRef(null);
  useEffect(()=>{
    const canvas=canvasRef.current;
    const ctx=canvas?.getContext("2d",{alpha:false});
    if(!ctx)return;
    let frame=0,raf=0,w=0,h=0,last=0;
    const points=[];
    const blobs=Array.from({length:8},(_,i)=>({x:rand(.12,.88),y:rand(.18,.82),r:rand(.08,.16),phase:i*1.7,color:(palettes.aether)[i%4]}));
    const pointer={down:false,x:0,y:0,px:0,py:0};
    const resize=()=>{
      const b=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.6);
      w=b.width;h=b.height;
      canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();
    const ro=new ResizeObserver(resize);ro.observe(canvas);
    const emit=(x,y,amount=9)=>{
      for(let i=0;i<amount;i++){
        const angle=rand(0,Math.PI*2),speed=rand(.15,1.8);
        points.push({x:x+rand(-5,5),y:y+rand(-5,5),px:x,py:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:rand(70,190),age:0,width:rand(1,5),color:palettes[mode]?.[Math.floor(rand(0,palettes[mode].length))]||"#ffffff",seed:rand(0,100)});
      }
      if(points.length>850)points.splice(0,points.length-850);
    };
    const down=e=>{const r=canvas.getBoundingClientRect();pointer.down=true;pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.px=pointer.x;pointer.py=pointer.y;canvas.setPointerCapture(e.pointerId);if(mode!=="lava")emit(pointer.x,pointer.y,55);};
    const move=e=>{const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      if(!pointer.down)return;
      if(mode==="lava"){
        const b=blobs.reduce((best,v)=>Math.hypot(v.x*w-x,v.y*h-y)<Math.hypot(best.x*w-x,best.y*h-y)?v:best,blobs[0]);
        b.x+=(x/w-b.x)*.3;b.y+=(y/h-b.y)*.3;
      }else{
        const dist=Math.hypot(x-pointer.x,y-pointer.y),steps=Math.min(16,Math.ceil(dist/9));
        for(let i=1;i<=steps;i++)emit(pointer.x+(x-pointer.x)*i/steps,pointer.y+(y-pointer.y)*i/steps,4);
      }
      pointer.px=pointer.x;pointer.py=pointer.y;pointer.x=x;pointer.y=y;
    };
    const up=()=>{pointer.down=false;};
    canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);
    canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);
    const render=now=>{
      const dt=Math.min(2,(now-(last||now))/16.667);last=now;
      if(!paused)frame+=dt;
      const dark=mode==="light"||mode==="aurora";
      ctx.fillStyle=mode==="light"?"#080d1c":mode==="aurora"?"#050f1b":mode==="aether"?"#f6eff4":"#f7eff0";
      ctx.fillRect(0,0,w,h);
      if(mode==="lava"){
        const min=Math.min(w,h);
        // Layered radial gradients give the soft, merging appearance without WebGL.
        for(const [i,b] of blobs.entries()){
          if(!paused){b.x+=Math.sin(frame*.004+b.phase)*.0006*dt;b.y+=Math.cos(frame*.005+b.phase)*.0007*dt;}
          const x=b.x*w,y=b.y*h,r=b.r*min*(1+.08*Math.sin(frame*.013+b.phase));
          const g=ctx.createRadialGradient(x-r*.18,y-r*.18,r*.03,x,y,r*1.5);
          g.addColorStop(0,rgba(b.color,.94));g.addColorStop(.48,rgba(b.color,.84));g.addColorStop(.78,rgba(b.color,.32));g.addColorStop(1,rgba(b.color,0));
          ctx.globalCompositeOperation="source-over";ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*1.5,0,Math.PI*2);ctx.fill();
        }
        ctx.globalCompositeOperation="source-over";
      }else{
        if(!paused){
          if(!pointer.down && frame%3<dt){
            const t=frame*.009;
            const x=w*(.5+.3*Math.sin(t*(mode==="aurora"?.53:.83)));
            const y=h*(.5+.24*Math.sin(t*.67+1.7));
            emit(x,y,mode==="aurora"?5:3);
          }
          for(const p of points){
            p.age+=dt;p.px=p.x;p.py=p.y;
            const curl=Math.sin(p.y*.013+frame*.007+p.seed)+Math.cos(p.x*.012-frame*.009+p.seed);
            p.vx=(p.vx+Math.cos(curl*2+p.seed)*.065*dt)*.986;
            p.vy=(p.vy+Math.sin(curl*2+p.seed)*.065*dt)*.986;
            if(mode==="aurora")p.vy-=.022*dt;
            p.x+=p.vx*dt;p.y+=p.vy*dt;
          }
          for(let i=points.length-1;i>=0;i--)if(points[i].age>points[i].life)points.splice(i,1);
        }
        ctx.globalCompositeOperation="lighter";
        ctx.lineCap="round";
        for(const p of points){
          const alpha=Math.pow(Math.max(0,1-p.age/p.life),1.2);
          ctx.strokeStyle=rgba(p.color,alpha*(mode==="aurora"?.18:.22));
          ctx.lineWidth=p.width*(mode==="aurora"?9:7);
          ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x,p.y);ctx.stroke();
          ctx.strokeStyle=rgba(p.color,alpha*.82);ctx.lineWidth=Math.max(.6,p.width*.65);
          ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x,p.y);ctx.stroke();
          if(mode==="aether"){
            ctx.fillStyle=rgba(p.color,alpha*.22);ctx.beginPath();ctx.arc(p.x,p.y,p.width*3,0,Math.PI*2);ctx.fill();
          }
        }
        ctx.globalCompositeOperation="source-over";
      }
      raf=requestAnimationFrame(render);
    };
    raf=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(raf);ro.disconnect();canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerup",up);canvas.removeEventListener("pointercancel",up);};
  },[mode,paused]);
  return <canvas ref={canvasRef} aria-label={mode==="lava"?"Interactive floating color blobs":"Interactive flowing light; touch and drag to paint"} style={{display:"block",width:"100%",height:"100%",touchAction:"none",cursor:"crosshair"}}/>;
}
