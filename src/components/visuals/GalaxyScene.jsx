import { useEffect, useRef } from "react";

// Canvas fallback avoids WebGL shader and context failures on mobile devices.
export default function GalaxyScene({preview=false}) {
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas.getContext("2d");if(!ctx)return;
    let w=1,h=1,raf=0,last=0,t=0,warp=0;
    const cursor={x:.5,y:.5,active:false};
    const stars=Array.from({length:650},(_,i)=>({angle:i*2.39996323,rad:Math.sqrt((i+.5)/650),depth:.2+((i*.6180339887)%1)*.8,size:.5+((i*.414213562)%1)*1.5,phase:i*.83}));
    const resize=()=>{const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);w=Math.max(1,r.width);h=Math.max(1,r.height);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);};
    const move=e=>{const r=canvas.getBoundingClientRect();cursor.x=(e.clientX-r.left)/w;cursor.y=(e.clientY-r.top)/h;cursor.active=true;};
    const click=()=>{warp=1;};
    const draw=now=>{const dt=last?Math.min((now-last)/1000,.05):0;last=now;t+=dt;warp=Math.max(0,warp-dt*.75);
      ctx.fillStyle="#02040d";ctx.fillRect(0,0,w,h);
      const cx=w*(cursor.active ? .5+(cursor.x-.5)*.07 : .5),cy=h*(cursor.active ? .5+(cursor.y-.5)*.07 : .5);
      const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.65);
      glow.addColorStop(0,"rgba(27,36,92,.30)");glow.addColorStop(.4,"rgba(11,15,48,.16)");glow.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
      const radius=Math.max(w,h)*.78;
      for(const s of stars){const angle=s.angle+t*.055*(.4+s.depth);const r=((s.rad+t*(.018+warp*.24)*s.depth)%1)*radius;
        const x=cx+Math.cos(angle)*r*w/Math.max(w,h),y=cy+Math.sin(angle)*r*h/Math.max(w,h);
        if(x<0||y<0||x>w||y>h)continue;
        const twinkle=.55+.45*Math.sin(t*1.3+s.phase)**2;
        const a=(.25+.7*s.depth)*twinkle;
        ctx.beginPath();ctx.arc(x,y,s.size*(.65+s.rad*.8),0,Math.PI*2);
        ctx.fillStyle=`rgba(236,242,255,${a})`;ctx.fill();
      }
      raf=requestAnimationFrame(draw);
    };
    const obs=new ResizeObserver(resize);obs.observe(canvas);resize();
    canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerleave",()=>{cursor.active=false});canvas.addEventListener("pointerdown",click);
    raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);obs.disconnect();canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerdown",click);};
  },[]);
  return <canvas ref={ref} aria-label="Interactive moving galaxy of white stars" style={{display:"block",width:"100%",height:"100%",background:"#02040d",touchAction:"pan-y"}}/>;
}