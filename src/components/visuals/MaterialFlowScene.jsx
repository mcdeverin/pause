import { useEffect, useRef } from "react";

// Original Canvas 2D effects: no WebGL context, paid models, or external artwork.
export default function MaterialFlowScene({ mode = "lava", paused = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    let w = 1, h = 1, raf = 0, last = 0, tick = 0, visible = !document.hidden;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blobs = Array.from({length: 9}, (_, i) => ({
      x: .14 + Math.random()*.72, y: .14 + Math.random()*.72,
      vx: (Math.random()-.5)*.00025, vy: (Math.random()-.5)*.00035,
      r: .085+Math.random()*.055, phase:i*1.7
    }));
    const strokes = [];
    const pointer = {down:false,x:0,y:0,prevX:0,prevY:0};
    const resize = () => {
      const r=canvas.getBoundingClientRect(); w=Math.max(1,r.width);h=Math.max(1,r.height);
      const dpr=Math.min(devicePixelRatio||1,1.25);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();
    const ro=new ResizeObserver(resize);ro.observe(canvas);
    const down=e=>{
      const r=canvas.getBoundingClientRect();
      pointer.down=true;pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;
      pointer.prevX=pointer.x;pointer.prevY=pointer.y;
      canvas.setPointerCapture(e.pointerId);
      if(mode!=="lava")emit(pointer.x,pointer.y,0,0,18);
    };
    const emit=(x,y,vx,vy,count=6)=>{
      for(let i=0;i<count;i++){
        const a=Math.random()*Math.PI*2,spd=Math.random()*1.5;
        strokes.push({x,y,px:x,py:y,vx:vx*.22+Math.cos(a)*spd,vy:vy*.22+Math.sin(a)*spd,
          age:0,life:90+Math.random()*140,size:1+Math.random()*3,
          hue:(Math.random()*360)|0,seed:Math.random()*10});
      }
      if(strokes.length>550)strokes.splice(0,strokes.length-550);
    };
    const move=e=>{
      const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      if(!pointer.down)return;
      const vx=x-pointer.x,vy=y-pointer.y;
      if(mode==="lava"){
        const b=blobs.reduce((a,b)=>Math.hypot(b.x*w-x,b.y*h-y)<Math.hypot(a.x*w-x,a.y*h-y)?b:a,blobs[0]);
        b.vx+=vx/w*.035;b.vy+=vy/h*.035;
      } else emit(x,y,vx,vy,Math.min(12,Math.max(3,Math.ceil(Math.hypot(vx,vy)/7))));
      pointer.prevX=pointer.x;pointer.prevY=pointer.y;pointer.x=x;pointer.y=y;
    };
    const up=()=>{pointer.down=false};
    canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);
    canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);

    // Low-resolution implicit surface creates connected, sharply defined lava shapes.
    const lava = () => {
      const scale=Math.min(1,210/w,160/h);
      const sw=Math.max(2,Math.round(w*scale)),sh=Math.max(2,Math.round(h*scale));
      const off=document.createElement("canvas");off.width=sw;off.height=sh;
      const c=off.getContext("2d"),image=c.createImageData(sw,sh),p=image.data;
      const aspect=w/h;
      for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
        const nx=x/sw,ny=y/sh;
        let field=0;
        for(const b of blobs){
          const dx=(nx-b.x)*aspect,dy=ny-b.y;
          field+=b.r*b.r/(dx*dx+dy*dy+.0003);
        }
        const i=(y*sw+x)*4;
        const edge=Math.max(0,Math.min(1,(field-1.05)*3.2));
        const highlight=Math.max(0,Math.min(1,(field-1.5)*1.3));
        const inside=edge>0.06;
        const light= Math.min(1,edge*.75+highlight*.25);
        p[i]=inside?Math.round(192+63*light):18;
        p[i+1]=inside?Math.round(63+97*light):14;
        p[i+2]=inside?Math.round(86+92*light):31;
        p[i+3]=255;
      }
      c.putImageData(image,0,0);
      ctx.imageSmoothingEnabled=true;ctx.drawImage(off,0,0,w,h);
      // Subtle glassy edge / specular highlights, without expensive per-particle blur.
      const glaze=ctx.createLinearGradient(0,0,w,h);
      glaze.addColorStop(0,"#ffffff18");glaze.addColorStop(.5,"#ffffff00");glaze.addColorStop(1,"#00000018");
      ctx.fillStyle=glaze;ctx.fillRect(0,0,w,h);
    };
    const chrome = () => {
      const bg=ctx.createLinearGradient(0,0,w,h);
      bg.addColorStop(0,"#080b12");bg.addColorStop(.5,"#202a34");bg.addColorStop(1,"#080b12");
      ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      for(const b of blobs){
        const x=b.x*w,y=b.y*h,r=b.r*Math.min(w,h)*1.6;
        const g=ctx.createLinearGradient(x-r,y-r,x+r,y+r);
        g.addColorStop(0,"#111820");g.addColorStop(.16,"#f8fdff");g.addColorStop(.26,"#5b6878");
        g.addColorStop(.4,"#060b12");g.addColorStop(.51,"#edfaff");g.addColorStop(.6,"#8193a3");
        g.addColorStop(.75,"#151b25");g.addColorStop(.88,"#f4faff");g.addColorStop(1,"#1a2430");
        ctx.fillStyle=g;ctx.beginPath();
        ctx.ellipse(x,y,r*(1+.13*Math.sin(tick*.009+b.phase)),r*.64,tick*.0004+b.phase,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#ffffff8c";ctx.lineWidth=1.5;ctx.stroke();
      }
    };
    const chromatic = () => {
      ctx.fillStyle="#090a20";ctx.fillRect(0,0,w,h);
      ctx.globalCompositeOperation="lighter";
      for(const s of strokes){
        const alpha=Math.max(0,1-s.age/s.life);
        ctx.strokeStyle=`hsla(${(s.hue+tick*.5)%360},100%,56%,${alpha*.35})`;
        ctx.lineWidth=s.size*5;ctx.lineCap="round";
        ctx.beginPath();ctx.moveTo(s.px,s.py);ctx.lineTo(s.x,s.y);ctx.stroke();
        ctx.strokeStyle=`hsla(${(s.hue+tick*.5)%360},100%,74%,${alpha*.95})`;
        ctx.lineWidth=Math.max(.7,s.size*.8);
        ctx.beginPath();ctx.moveTo(s.px,s.py);ctx.lineTo(s.x,s.y);ctx.stroke();
      }
      ctx.globalCompositeOperation="source-over";
    };
    const render=now=>{
      raf=requestAnimationFrame(render);
      if(!visible||now-last<1000/30)return;
      const dt=Math.min(2,(now-(last||now))/33.3);last=now;
      if(!paused&&!reduced){
        tick+=dt;
        for(const b of blobs){
          b.vx+=(Math.sin(tick*.013+b.phase))*.000005*dt;
          b.vy+=(Math.cos(tick*.012+b.phase))*.000006*dt;
          b.vx*=.985;b.vy*=.985;
          b.x+=b.vx*dt;b.y+=b.vy*dt;
          if(b.x<.08||b.x>.92)b.vx*=-1;
          if(b.y<.08||b.y>.92)b.vy*=-1;
          b.x=Math.max(.06,Math.min(.94,b.x));b.y=Math.max(.06,Math.min(.94,b.y));
        }
        for(const s of strokes){
          s.age+=dt;s.px=s.x;s.py=s.y;
          const curl=Math.sin(s.y*.016+tick*.009+s.seed)+Math.cos(s.x*.013-tick*.012+s.seed);
          s.vx=(s.vx+Math.cos(curl*2+s.seed)*.05*dt)*.988;
          s.vy=(s.vy+Math.sin(curl*2+s.seed)*.05*dt)*.988;
          s.x+=s.vx*dt;s.y+=s.vy*dt;
        }
        for(let i=strokes.length-1;i>=0;i--)if(strokes[i].age>strokes[i].life)strokes.splice(i,1);
        if(mode==="chromatic"&&tick%5<dt&&!pointer.down){
          const x=w*(.5+.28*Math.sin(tick*.007)),y=h*(.5+.26*Math.cos(tick*.009));
          emit(x,y,0,0,3);
        }
      }
      if(mode==="lava")lava();
      else if(mode==="chrome")chrome();
      else chromatic();
    };
    const visibility=()=>{visible=!document.hidden;last=0};
    document.addEventListener("visibilitychange",visibility);
    raf=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(raf);ro.disconnect();document.removeEventListener("visibilitychange",visibility);
      canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);
      canvas.removeEventListener("pointerup",up);canvas.removeEventListener("pointercancel",up)};
  },[mode,paused]);
  return <canvas ref={ref} aria-label={mode==="lava"?"Interactive connected lava lamp blobs":mode==="chrome"?"Interactive reflective liquid chrome":"Interactive colorful flowing light"} style={{display:"block",width:"100%",height:"100%",touchAction:"none",cursor:"crosshair"}}/>;
}
