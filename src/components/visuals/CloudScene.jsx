import { useEffect, useRef, useState } from "react";

// Separate private experiment: SmokeScene is not modified.
const SKY_TOP = "#7dc5f1";
const SKY_BOTTOM = "#d7effc";
const MAX_PUFFS = 500;
const rand = (a,b) => a + Math.random()*(b-a);

export default function CloudScene({ paused = false, preview = false }) {
  const canvasRef = useRef(null);
  const puffsRef = useRef([]);
  const [reset, setReset] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!ctx) return;
    let frame, previous = 0, tick = 0;
    const pointer = { down: false, x: 0, y: 0, vx: 0, vy: 0 };
    puffsRef.current = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      ctx.setTransform(ratio,0,0,ratio,0,0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const emit = (x,y,count=5) => {
      for(let i=0;i<count;i++) {
        if(puffsRef.current.length >= MAX_PUFFS) puffsRef.current.shift();
        puffsRef.current.push({
          x:x+rand(-15,15), y:y+rand(-13,13),
          vx:rand(-.12,.2), vy:rand(-.16,.04),
          radius:rand(12,27), growth:rand(.045,.13),
          age:0, life:rand(420,850), opacity:rand(.36,.73),
          seed:rand(0,Math.PI*2)
        });
      }
    };
    const position = e => {
      const r=canvas.getBoundingClientRect();
      return {x:e.clientX-r.left,y:e.clientY-r.top};
    };
    const down=e=>{
      if(paused)return;
      const p=position(e);
      pointer.down=true;pointer.x=p.x;pointer.y=p.y;
      canvas.setPointerCapture(e.pointerId);
      emit(p.x,p.y,16);
    };
    const move=e=>{
      if(!pointer.down||paused)return;
      const p=position(e),dx=p.x-pointer.x,dy=p.y-pointer.y;
      const steps=Math.min(30,Math.ceil(Math.hypot(dx,dy)/9));
      for(let i=1;i<=steps;i++)emit(pointer.x+dx*i/steps,pointer.y+dy*i/steps,3);
      pointer.vx=dx;pointer.vy=dy;pointer.x=p.x;pointer.y=p.y;
    };
    const up=()=>{pointer.down=false;pointer.vx=0;pointer.vy=0;};
    for(const [name,handler] of [["pointerdown",down],["pointermove",move],["pointerup",up],["pointercancel",up],["lostpointercapture",up]])canvas.addEventListener(name,handler);

    const render=now=>{
      const dt=Math.min(2,(now-(previous||now))/16.67);
      previous=now;
      const w=canvas.clientWidth,h=canvas.clientHeight;
      const sky=ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,SKY_TOP);sky.addColorStop(1,SKY_BOTTOM);
      ctx.fillStyle=sky;ctx.globalAlpha=1;ctx.fillRect(0,0,w,h);

      if(!paused){
        tick+=dt;
        if(preview&&Math.floor(tick)%9===0)emit(w*.45+Math.sin(tick*.01)*w*.18,h*.53,1);
        for(const p of puffsRef.current){
          p.age+=dt;
          const curl=Math.sin(tick*.009+p.seed+p.y*.006);
          p.vx=(p.vx+curl*.002*dt)*.999;
          p.x+=(p.vx+.075)*dt;
          p.y+=p.vy*dt;
          p.radius+=p.growth*dt;
          if(pointer.down){
            const dx=p.x-pointer.x,dy=p.y-pointer.y;
            const d=Math.hypot(dx,dy);
            if(d<125){
              const force=(1-d/125)*.009*dt;
              p.vx+=pointer.vx*force;
              p.vy+=pointer.vy*force;
            }
          }
        }
        puffsRef.current=puffsRef.current.filter(p=>p.age<p.life&&p.x>-180&&p.x<w+180&&p.y>-180&&p.y<h+180);
        pointer.vx*=.8;pointer.vy*=.8;
      }

      // Multi-stop radial highlights make overlapping, soft-edged cumulus shapes.
      for(const p of puffsRef.current){
        const life=p.age/p.life;
        const fade=Math.min(1,p.age/24)*Math.min(1,(1-life)*5);
        const radius=p.radius;
        const glow=ctx.createRadialGradient(p.x-radius*.2,p.y-radius*.22,0,p.x,p.y,radius*1.6);
        glow.addColorStop(0,"rgba(255,255,255,"+(p.opacity*fade)+")");
        glow.addColorStop(.45,"rgba(255,255,255,"+(p.opacity*.9*fade)+")");
        glow.addColorStop(.78,"rgba(248,253,255,"+(p.opacity*.35*fade)+")");
        glow.addColorStop(1,"rgba(255,255,255,0)");
        ctx.fillStyle=glow;
        ctx.beginPath();ctx.arc(p.x,p.y,radius*1.6,0,Math.PI*2);ctx.fill();
      }
      frame=requestAnimationFrame(render);
    };
    frame=requestAnimationFrame(render);
    return ()=>{
      cancelAnimationFrame(frame);observer.disconnect();
      for(const [name,handler] of [["pointerdown",down],["pointermove",move],["pointerup",up],["pointercancel",up],["lostpointercapture",up]])canvas.removeEventListener(name,handler);
      puffsRef.current=[];
    };
  },[paused,preview,reset]);

  return <div style={{position:"relative",width:"100%",height:"100%"}}>
    <canvas ref={canvasRef} aria-label="Sky-blue canvas. Drag to paint drifting white clouds." style={{display:"block",width:"100%",height:"100%",touchAction:"none",cursor:"crosshair"}}/>
    {!preview&&<button type="button" onClick={()=>setReset(v=>v+1)} style={{position:"absolute",bottom:18,left:18,padding:"9px 16px",borderRadius:20,border:"1px solid #ffffffb8",background:"#ffffffd9",color:"#244c63",cursor:"pointer"}}>Clear sky</button>}
  </div>;
}
