import { useEffect, useRef } from "react";
import LiquidChrome from "./LiquidChrome";

// Original SVG-filter lava and CPU-rendered chrome. No WebGL contexts or paid assets.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function PixelMaterialScene({mode="chrome",paused=false}){
  const ref=useRef(null);
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas.getContext("2d",{alpha:false});
    const buffer=document.createElement("canvas"),bc=buffer.getContext("2d",{willReadFrequently:true});
    let w=1,h=1,nx=0,ny=0,pixels,raf=0,last=0,time=0,visible=!document.hidden;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blobs=Array.from({length:11},(_,i)=>({
      x:.14+(i%4)*.22+Math.random()*.04,y:.16+Math.floor(i/4)*.28+Math.random()*.06,
      vx:(Math.random()-.5)*.0004,vy:(Math.random()-.5)*.0005,
      r:.064+Math.random()*.042,heat:Math.random(),seed:i*1.7
    }));
    let dye,bufferDye;
    const pointer={down:false,x:.5,y:.5,dx:0,dy:0,active:0};
    function resize(){
      const rect=canvas.getBoundingClientRect();
      w=Math.max(1,rect.width);h=Math.max(1,rect.height);
      const dpr=Math.min(window.devicePixelRatio||1,1.4);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const factor=Math.min(1,320/w,220/h);
      nx=Math.max(80,Math.round(w*factor));ny=Math.max(60,Math.round(h*factor));
      buffer.width=nx;buffer.height=ny;pixels=bc.createImageData(nx,ny);
      dye=new Float32Array(nx*ny*3);bufferDye=new Float32Array(nx*ny*3);
      if(mode==="chromatic"){
        // A fully populated initial pigment field, not sparse particle dots.
        for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
          const u=x/nx,v=y/ny;
          const a=Math.sin(u*19+Math.sin(v*13)*2.5)+Math.sin(v*24-u*10);
          const b=Math.cos(u*25-v*14+Math.sin(u*9)*3);
          const hue=((u*.7+v*.3+a*.075+b*.045)%1+1)%1;
          const [r,g,bl]=hsv(hue,.97,.93);
          const i=(y*nx+x)*3;dye[i]=r;dye[i+1]=g;dye[i+2]=bl;
        }
      }
    }
    function hsv(h,s,v){
      const k=n=>(n+h*6)%6;
      const f=n=>v-v*s*Math.max(0,Math.min(k(n),4-k(n),1));
      return [f(5),f(3),f(1)];
    }
    resize();const observer=new ResizeObserver(resize);observer.observe(canvas);
    function position(e){
      const r=canvas.getBoundingClientRect();
      return {x:clamp((e.clientX-r.left)/r.width),y:clamp((e.clientY-r.top)/r.height)};
    }
    function down(e){const p=position(e);pointer.down=true;pointer.x=p.x;pointer.y=p.y;pointer.active=1;canvas.setPointerCapture(e.pointerId)}
    function move(e){
      if(!pointer.down)return;
      const p=position(e);
      pointer.dx=clamp((p.x-pointer.x)*4,-.3,.3);
      pointer.dy=clamp((p.y-pointer.y)*4,-.3,.3);
      pointer.x=p.x;pointer.y=p.y;pointer.active=1;
      if(mode!=="chromatic"){
        for(const b of blobs){
          const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);
          if(d<.24){const force=(.24-d)/.24;b.vx+=pointer.dx*.0012*force;b.vy+=pointer.dy*.0012*force}
        }
      }
    }
    function up(){pointer.down=false}
    canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);
    canvas.addEventListener("pointerup",up);canvas.addEventListener("pointercancel",up);

    function animateBlobs(dt){
      for(const b of blobs){
        if(mode==="lava"){
          b.heat=clamp(b.heat+(b.y>.66?.006:-.005)*dt);
          b.vy+=(.000035-b.heat*.000095)*dt;
          b.vx+=Math.sin(time*.013+b.seed)*.000009*dt;
        }else{
          b.vx+=Math.sin(time*.009+b.seed)*.000014*dt;
          b.vy+=Math.cos(time*.008+b.seed)*.000013*dt;
        }
        b.vx*=.991;b.vy*=.991;b.x+=b.vx*dt;b.y+=b.vy*dt;
        if(b.x<.07||b.x>.93)b.vx*=-.9;
        if(b.y<.07||b.y>.93)b.vy*=-.9;
        b.x=clamp(b.x,.07,.93);b.y=clamp(b.y,.07,.93);
      }
    }
    function fieldAt(u,v){
      const aspect=w/h;
      let f=0;
      for(const b of blobs){
        const dx=(u-b.x)*aspect,dy=v-b.y;
        f+=b.r*b.r/(dx*dx+dy*dy+.0001);
      }
      return f;
    }
    function drawMaterial(){
      const p=pixels.data,du=1/nx,dv=1/ny;
      for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
        const u=x/nx,v=y/ny,i=(y*nx+x)*4;
        const f=fieldAt(u,v),surface=clamp((f-1.03)*9);
        const fx=fieldAt(u+du,v)-fieldAt(u-du,v);
        const fy=fieldAt(u,v+dv)-fieldAt(u,v-dv);
        const normal=Math.atan2(fy,fx);
        let r,g,b;
        if(mode==="lava"){
          const edge=clamp((f-1.01)*9),rim=Math.pow(1-edge,2)*surface;
          const light=clamp(.65+.32*Math.cos(normal+1.1));
          r=20+(235*light+16*rim)*surface;
          g=13+(76+100*rim+35*light)*surface;
          b=32+(95+70*rim)*surface;
        }else{
          // Chrome is shaded from the changing implicit-surface normal.
          // Repeated narrow environment highlights create curved reflections,
          // rather than a fixed linear gradient inside an ellipse.
          const band=Math.sin(normal*3.5+time*.014+v*5);
          const highlight=Math.pow(Math.max(0,Math.sin(normal*6.4+u*5-time*.01)),14);
          const spec=Math.pow(Math.max(0,Math.cos(normal-1.05)),24);
          const silver=clamp(.24+.38*band+.65*highlight+.65*spec);
          const edge=clamp((f-1.02)*8);
          const rim=Math.pow(1-edge,2)*surface;
          r=9+(35+silver*195+rim*60)*surface;
          g=14+(44+silver*201+rim*67)*surface;
          b=23+(56+silver*205+rim*77)*surface;
        }
        p[i]=clamp(r,0,255);p[i+1]=clamp(g,0,255);p[i+2]=clamp(b,0,255);p[i+3]=255;
      }
    }
    function sample(a,x,y,k){
      x=clamp(x,0,nx-1.001);y=clamp(y,0,ny-1.001);
      const ix=Math.floor(x),iy=Math.floor(y),tx=x-ix,ty=y-iy;
      const i=(iy*nx+ix)*3+k,j=i+3,l=i+nx*3,m=l+3;
      return (a[i]*(1-tx)+a[j]*tx)*(1-ty)+(a[l]*(1-tx)+a[m]*tx)*ty;
    }
    function drawChromatic(dt){
      const p=pixels.data,px=pointer.x*nx,py=pointer.y*ny;
      const t=time*.012;
      for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
        const u=x/nx,v=y/ny;
        // Multi-scale, divergence-free curl field with touch-induced vortex.
        let vx=1.6*Math.sin(v*12+t)*Math.cos(u*11-t*.7)
          +1.1*Math.sin(v*29-u*14-t*.8);
        let vy=-1.6*Math.cos(v*12+t)*Math.sin(u*11-t*.7)
          +1.1*Math.cos(u*23+v*8+t*.9);
        const dx=x-px,dy=y-py,d2=dx*dx+dy*dy;
        const influence=Math.exp(-d2/(nx*nx*.012));
        vx+=(-dy*.12+pointer.dx*nx*.9)*influence*pointer.active;
        vy+=(dx*.12+pointer.dy*ny*.9)*influence*pointer.active;
        const index=(y*nx+x)*3;
        const sx=x-vx*dt*.85,sy=y-vy*dt*.85;
        for(let k=0;k<3;k++)bufferDye[index+k]=sample(dye,sx,sy,k);
        if(pointer.down&&influence>.06){
          const hue=(time*.003+u*.4+v*.2)%1;
          const rgb=hsv(hue,1,1);
          for(let k=0;k<3;k++)bufferDye[index+k]=bufferDye[index+k]*(1-influence*.25)+rgb[k]*influence*.25;
        }
        const o=(y*nx+x)*4;
        const contrast=1.28;
        for(let k=0;k<3;k++){
          const c=clamp((bufferDye[index+k]-.5)*contrast+.5);
          p[o+k]=Math.round(c*255);
        }
        p[o+3]=255;
      }
      [dye,bufferDye]=[bufferDye,dye];
      pointer.active*=.96;
      pointer.dx*=.85;pointer.dy*=.85;
    }
    function frame(now){
      raf=requestAnimationFrame(frame);
      if(!visible||now-last<1000/24)return;
      const dt=Math.min(1.7,(now-(last||now))/42);last=now;
      if(!paused&&!reduced){time+=dt;if(mode!=="chromatic")animateBlobs(dt)}
      if(mode==="chromatic")drawChromatic(paused||reduced?0:dt);
      else drawMaterial();
      bc.putImageData(pixels,0,0);
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
      ctx.drawImage(buffer,0,0,w,h);
    }
    const visibility=()=>{visible=!document.hidden;last=0};
    document.addEventListener("visibilitychange",visibility);
    raf=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener("visibilitychange",visibility);
      canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);
      canvas.removeEventListener("pointerup",up);canvas.removeEventListener("pointercancel",up)};
  },[mode,paused]);
  return <canvas ref={ref} aria-label={mode==="lava"?"Interactive flowing lava":mode==="chrome"?"Interactive reflective chrome fluid":"Interactive rainbow fluid"} style={{width:"100%",height:"100%",display:"block",touchAction:"none",cursor:"crosshair"}}/>;
}

function LavaGooScene({paused=false}){
  const root=useRef(null);
  const blobsRef=useRef([]);
  useEffect(()=>{
    const host=root.current;
    if(!host)return;
    const elements=[...host.querySelectorAll("[data-wax]")];
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blobs=elements.map((el,i)=>({
      el,i,x:0,y:0,vx:0,vy:0,
      ax:.12+((i*17)%13)/100,ay:.19+((i*7)%15)/100,
      sx:.11+((i*5)%11)/100,sy:.075+((i*3)%9)/100,
      px:i*1.91,py:i*2.67,
      orbit:.38+i*.09
    }));
    blobsRef.current=blobs;
    const target={x:0,y:0,until:0,inside:false,down:false};
    let width=1,height=1,raf=0,last=0,t=0,blend=0,inView=true;
    const resize=()=>{const r=host.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height)};
    const ro=new ResizeObserver(resize);ro.observe(host);resize();
    const io=new IntersectionObserver(entries=>{inView=!!entries[0]?.isIntersecting},{threshold:0.01});io.observe(host);
    const setTarget=e=>{const r=host.getBoundingClientRect();target.x=e.clientX-r.left;target.y=e.clientY-r.top;target.until=performance.now()+4000};
    const onDown=e=>{target.down=true;setTarget(e);host.setPointerCapture?.(e.pointerId)};
    const onMove=e=>{if(e.pointerType==="mouse"||target.down)setTarget(e)};
    const onEnter=e=>{if(e.pointerType==="mouse"){target.inside=true;setTarget(e)}};
    const onLeave=()=>{target.inside=false;target.down=false};
    const onUp=()=>{target.down=false};
    host.addEventListener("pointerdown",onDown);
    host.addEventListener("pointermove",onMove);
    host.addEventListener("pointerenter",onEnter);
    host.addEventListener("pointerleave",onLeave);
    host.addEventListener("pointerup",onUp);
    host.addEventListener("pointercancel",onUp);
    const ease=(k,dt)=>1-Math.pow(1-k,dt*60);
    const mix=(a,b,w)=>a+(b-a)*w;
    const tick=now=>{
      raf=requestAnimationFrame(tick);
      if(paused||document.hidden||!inView){last=now;return}
      const dt=Math.min(.05,(now-(last||now))/1000);last=now;
      t+=dt*(reduced?.3:1);
      const follow=target.inside||now<target.until;
      blend=mix(blend,follow?1:0,ease(follow?.08:.02,dt));
      const base=Math.min(width,height);
      for(const b of blobs){
        const lx=width*(.5+b.ax*Math.sin(t*b.sx*2+b.px));
        const ly=height*(.5+b.ay*Math.sin(t*b.sy*2+b.py));
        let fx,fy;
        if(b.i===0){fx=target.x;fy=target.y}
        else{
          const prev=blobs[b.i-1],orbit=base*b.orbit*.16;
          fx=prev.x+Math.cos(t*1.3+b.px)*orbit;
          fy=prev.y+Math.sin(t*1.1+b.py)*orbit;
        }
        const tx=mix(lx,fx,blend),ty=mix(ly,fy,blend);
        const ox=b.x,oy=b.y;
        if(!b.x&&!b.y){b.x=lx;b.y=ly}
        b.x=mix(b.x,tx,ease(.09,dt));b.y=mix(b.y,ty,ease(.09,dt));
        b.vx=b.x-ox;b.vy=b.y-oy;
        const speed=Math.hypot(b.vx,b.vy)/Math.max(.3,dt*60);
        const stretch=reduced?1:1+Math.min(speed*.012,.35);
        const angle=Math.atan2(b.vy,b.vx);
        b.el.style.transform=`translate3d(${b.x}px,${b.y}px,0) translate(-50%,-50%) rotate(${angle}rad) scale(${stretch},${1/stretch})`;
      }
    };
    raf=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(raf);ro.disconnect();io.disconnect();
      host.removeEventListener("pointerdown",onDown);host.removeEventListener("pointermove",onMove);
      host.removeEventListener("pointerenter",onEnter);host.removeEventListener("pointerleave",onLeave);
      host.removeEventListener("pointerup",onUp);host.removeEventListener("pointercancel",onUp)};
  },[paused]);
  return <div ref={root} aria-label="Interactive flowing lava wax. Touch or move your pointer to attract the wax." style={{position:"relative",width:"100%",height:"100%",overflow:"hidden",touchAction:"none",background:"radial-gradient(ellipse at 45% 35%,#30203d 0%,#171126 58%,#0d0c1a 100%)",isolation:"isolate"}}>
    <svg width="0" height="0" aria-hidden="true" style={{position:"absolute",pointerEvents:"none"}}><defs><filter id="always-pause-lava-goo" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="13" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"/></filter></defs></svg>
    <div style={{position:"absolute",inset:0,filter:"url(#always-pause-lava-goo)",pointerEvents:"none"}}>
      {Array.from({length:9},(_,i)=><div key={i} data-wax="" style={{position:"absolute",left:0,top:0,width:`${i===0?27:11+(i*7)%12}%`,aspectRatio:"1",borderRadius:"50%",willChange:"transform",background:"radial-gradient(circle at 35% 28%,#ffe9cc 0%,#ffc3c7 16%,#f782b0 46%,#d34a96 75%,#8e286e 100%)",boxShadow:"inset -12px -14px 25px rgba(91,12,79,.28)"}}/>)}
    </div>
    <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse at 50% 105%,rgba(255,104,161,.12),transparent 52%)"}}/>
  </div>;
}
export default function MaterialFlowScene(props){
  return props.mode==="lava"
    ? <LavaGooScene paused={props.paused}/>
    : props.mode==="chrome"
      ? <LiquidChrome speed={props.paused ? 0 : 0.2} color="#ffffff" amplitude={0.3} detail={4} thickness={1} interactive={!props.paused} frequencyX={3} frequencyY={3} depth={1} roughness={0.3} exposure={1} rippleStrength={1} rippleSize={1} tilt={1} intro lightMode={false}/>
      : <PixelMaterialScene {...props}/>;
}
