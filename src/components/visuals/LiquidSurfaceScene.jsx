import { useEffect, useRef } from "react";
import * as THREE from "three";

// Full-screen, pointer-driven displacement: the image itself bends like water.
export default function LiquidSurfaceScene({ photoUrl, strength=.65, viscosity=.65, paused=false }) {
 const host=useRef(null),opts=useRef({});
 opts.current={photoUrl,strength,viscosity,paused};
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:false,alpha:false});}
  catch(e){console.warn("Liquid Surface unavailable",e);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.style.cssText="width:100%;height:100%;display:block;touch-action:none";
  el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const uniforms={
   uTime:{value:0},uResolution:{value:new THREE.Vector2(1,1)},
   uTexture:{value:null},uPhoto:{value:0},uStrength:{value:.65},
   uRipple:{value:new THREE.Vector2(-10,-10)},uVelocity:{value:new THREE.Vector2()},
   uAspect:{value:1}
  };
  const material=new THREE.ShaderMaterial({
   uniforms,
   vertexShader:"varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.);}",
   fragmentShader:`
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uTime,uPhoto,uStrength,uAspect;
    uniform vec2 uRipple,uVelocity;
    vec3 gradient(vec2 p){
     vec3 peach=vec3(.99,.76,.67),pink=vec3(.97,.57,.77),blue=vec3(.64,.81,.91);
     vec3 c=mix(peach,pink,smoothstep(.05,.85,p.y+.15*sin(p.x*3.)));
     return mix(c,blue,smoothstep(.2,1.,p.x*.7+p.y*.25));
    }
    vec3 imageAt(vec2 p){return uPhoto>.5?texture2D(uTexture,clamp(p,0.,1.)).rgb:gradient(p);}
    void main(){
     vec2 uv=vUv;
     vec2 d=uv-uRipple;d.x*=uAspect;
     float dist=length(d);
     float radius=.28;
     float falloff=exp(-dist*dist/(radius*radius));
     float wave=sin(dist*62.-uTime*5.)*exp(-dist*11.);
     vec2 direction=d/(dist+.001);
     vec2 push=(direction*wave*.018+uVelocity*.035)*falloff*uStrength;
     vec2 ambient=vec2(sin(uv.y*12.+uTime*.27),cos(uv.x*11.-uTime*.22))*.0016;
     vec2 offset=push+ambient;
     vec3 col=imageAt(uv-offset);
     float light=dot(normalize(vec3(direction,1.)),normalize(vec3(-.55,.65,1.)));
     col+=vec3(.9,.75,.65)*max(0.,wave)*falloff*.07*uStrength;
     col-=vec3(.16,.10,.15)*max(0.,-wave)*falloff*.055*uStrength;
     col+=light*falloff*.012*uStrength;
     gl_FragColor=vec4(col,1.);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`,
   depthWrite:false,depthTest:false
  });
  const geometry=new THREE.PlaneGeometry(2,2),mesh=new THREE.Mesh(geometry,material);
  scene.add(mesh);
  const pointer=new THREE.Vector2(-10,-10),target=new THREE.Vector2(-10,-10);
  const velocity=new THREE.Vector2(),last=new THREE.Vector2(-10,-10);
  let inside=false,dragging=false,frame=0,stopped=false;
  const move=e=>{
   const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=1-(e.clientY-r.top)/r.height;
   target.set(x,y);inside=true;
   if(e.type==="pointerdown"){dragging=true;el.setPointerCapture?.(e.pointerId);}
  };
  const down=e=>move(e);
  const up=()=>{dragging=false;};
  const leave=()=>{if(!dragging)inside=false;};
  el.addEventListener("pointermove",move);el.addEventListener("pointerdown",down);
  el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);el.addEventListener("pointerleave",leave);
  const resize=()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);
   renderer.setSize(w,h,false);uniforms.uResolution.value.set(w,h);uniforms.uAspect.value=w/h;};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  let disposed=false;
  const loader=new THREE.TextureLoader();
  const setPhoto=url=>{
   if(!url){uniforms.uPhoto.value=0;return;}
   loader.load(url,texture=>{
    if(disposed){texture.dispose();return;}
    if(uniforms.uTexture.value)uniforms.uTexture.value.dispose();
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
    uniforms.uTexture.value=texture;uniforms.uPhoto.value=1;
   },undefined,()=>{uniforms.uPhoto.value=0;});
  };
  let currentUrl=opts.current.photoUrl;setPhoto(currentUrl);
  let lastTime=performance.now(),elapsed=0;
  const animate=now=>{
   if(stopped)return;
   const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now;
   const o=opts.current;
   if(o.photoUrl!==currentUrl){currentUrl=o.photoUrl;setPhoto(currentUrl);}
   if(!o.paused){
    elapsed+=dt;
    const easing=.025+(1-o.viscosity)*.18;
    if(inside)pointer.lerp(target,easing);
    velocity.subVectors(pointer,last).multiplyScalar(dragging?2.5:1.4);
    last.copy(pointer);
    uniforms.uRipple.value.copy(pointer);
    uniforms.uVelocity.value.lerp(velocity,.25);
    uniforms.uTime.value=elapsed;
   }
   uniforms.uStrength.value=o.strength;
   renderer.render(scene,camera);
   frame=requestAnimationFrame(animate);
  };frame=requestAnimationFrame(animate);
  return()=>{disposed=true;stopped=true;cancelAnimationFrame(frame);observer.disconnect();
   el.removeEventListener("pointermove",move);el.removeEventListener("pointerdown",down);
   el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);el.removeEventListener("pointerleave",leave);
   uniforms.uTexture.value?.dispose();geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div ref={host} style={{width:"100%",height:"100%",touchAction:"none"}}/>;
}
