import { useEffect, useRef } from "react";
import * as THREE from "three";

// Original pastel water study. A feedback buffer stores fading cursor wakes.
export default function PrismaticWaterScene({strength=.7,softness=.65,motion=.5,palette="pearl",paused=false}){
 const host=useRef(null),settings=useRef({});settings.current={strength,softness,motion,palette,paused};
 useEffect(()=>{
 const el=host.current;if(!el)return;
 let renderer;try{renderer=new THREE.WebGLRenderer({antialias:false});}catch(e){console.warn(e);return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.domElement.style.cssText="width:100%;height:100%;display:block;touch-action:none";el.appendChild(renderer.domElement);
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),geometry=new THREE.PlaneGeometry(2,2);
 const colors={pearl:["#d7e8fa","#f9c6df","#a7e6e6"],sunset:["#ffd5aa","#f4a7c6","#d4bbff"],lagoon:["#a7e4de","#a9c7ee","#e9c9ee"]};
 const uniforms={uTime:{value:0},uResolution:{value:new THREE.Vector2(1,1)},uPointer:{value:new THREE.Vector2(-10,-10)},uVelocity:{value:new THREE.Vector2()},uStrength:{value:.7},uSoftness:{value:.65},uMotion:{value:.5},uColors:{value:colors.pearl.map(x=>new THREE.Color(x))}};
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}",fragmentShader:`
 precision highp float;
 varying vec2 vUv;
 uniform float uTime,uStrength,uSoftness,uMotion;
 uniform vec2 uResolution,uPointer,uVelocity;
 uniform vec3 uColors[3];
 float ring(vec2 p,vec2 origin,float frequency,float phase){
  float d=length(p-origin);
  return sin(d*frequency-phase)*exp(-d*2.8);
 }
 float heightField(vec2 p){
  float t=uTime;
  float a=uResolution.x/max(uResolution.y,1.);
  vec2 touch=vec2(uPointer.x*a,uPointer.y);
  float dist=length(p-touch);
  float nearTouch=exp(-dist*dist/(.28*.28))*exp(-dist*(3.5+uSoftness*3.));
  float interaction=nearTouch*uStrength*(sin(dist*62.-t*5.)*.018+sin(dist*124.-t*10.)*.004);
  float flow=uMotion*(sin(p.x*9.+p.y*4.+t*.38)*.005+cos(p.y*13.-p.x*3.-t*.31)*.004);
  float wake=ring(p,vec2(.49*a,.49),32.,t*.55)*.009*uMotion;
  return interaction+flow+wake;
 }
 vec3 spectrum(float x){
  vec3 a=vec3(.51,.62,.74),b=vec3(.46,.37,.32),c=vec3(1.,1.,1.),d=vec3(.02,.21,.43);
  return clamp(a+b*cos(6.28318*(c*x+d)),0.,1.);
 }
 void main(){
  float aspect=uResolution.x/max(uResolution.y,1.);
  vec2 p=vec2(vUv.x*aspect,vUv.y);
  float eps=.0025;
  float h=heightField(p);
  vec2 slope=vec2(heightField(p+vec2(eps,0.))-heightField(p-vec2(eps,0.)),heightField(p+vec2(0.,eps))-heightField(p-vec2(0.,eps)))/(2.*eps);
  vec3 normal=normalize(vec3(-slope.x*2.4,-slope.y*2.4,1.));
  vec3 view=vec3(0.,0.,1.);
  vec3 reflection=reflect(-view,normal);
  float fresnel=pow(1.-max(dot(normal,view),0.),3.);
  float t=uTime;
  vec2 env=reflection.xy*.48+p*.23;
  float longBands=sin(env.y*18.+env.x*8.+sin(env.x*6.)*2.);
  float thinBands=sin(env.y*75.+env.x*22.+sin(env.y*14.)*3.);
  float glint=pow(max(0.,sin(env.y*44.+env.x*16.)),18.);
  float sky=clamp(.5+.5*sin(env.y*4.+env.x*2.),0.,1.);
  vec3 chrome=mix(vec3(.20,.27,.38),vec3(.91,.95,1.),clamp(.55+longBands*.29+thinBands*.11,0.,1.));
  chrome=mix(chrome,vec3(.99,.99,1.),sky*.18);
  float colorPhase=env.x*.49+env.y*.58+normal.x*.22+normal.y*.19;
  vec3 iridescent=spectrum(colorPhase);
  vec3 warm=mix(uColors[0],uColors[1],clamp(.5+.5*sin(colorPhase*8.),0.,1.));
  iridescent=mix(iridescent,mix(warm,uColors[2],.4),.17);
  float touchDist=length(p-vec2(uPointer.x*aspect,uPointer.y));
  float touchGlow=exp(-touchDist*touchDist/(.28*.28))*uStrength;
  float colorAmount=clamp(.12+.26*uMotion+.46*touchGlow+.28*length(slope),0.,.85);
  vec3 col=mix(chrome,iridescent,colorAmount);
  col+=vec3(1.,.91,.76)*glint*.24;
  col+=vec3(.88,.96,1.)*pow(max(dot(normal,normalize(vec3(-.4,.6,1.))),0.),38.)*.38;
  col+=fresnel*vec3(.24,.31,.4);
  col=clamp(col,0.,1.);
  gl_FragColor=vec4(col,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`});
 const scene=new THREE.Scene();scene.add(new THREE.Mesh(geometry,material));
 const pointer=new THREE.Vector2(-10,-10),target=new THREE.Vector2(-10,-10),last=new THREE.Vector2(-10,-10);
 let frame=0,stopped=false,active=false,elapsed=0,previous=performance.now();
 const move=e=>{const r=el.getBoundingClientRect();target.set((e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height);active=true;};
 const leave=()=>{active=false;target.set(-10,-10);};
 el.addEventListener("pointermove",move);el.addEventListener("pointerdown",move);el.addEventListener("pointerleave",leave);
 const resize=()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);renderer.setSize(w,h,false);uniforms.uResolution.value.set(w,h);};
 const observer=new ResizeObserver(resize);observer.observe(el);resize();
 const animate=now=>{if(stopped)return;const dt=Math.min(.05,(now-previous)/1000);previous=now;const s=settings.current;
 if(!s.paused){elapsed+=dt;pointer.lerp(target,active?.14:.08);uniforms.uVelocity.value.subVectors(pointer,last).multiplyScalar(1.7);last.copy(pointer);uniforms.uPointer.value.copy(pointer);uniforms.uTime.value=elapsed;}
 uniforms.uStrength.value=s.strength;uniforms.uSoftness.value=s.softness;uniforms.uMotion.value=s.motion;
 const paletteColors=colors[s.palette]||colors.pearl;paletteColors.forEach((c,i)=>uniforms.uColors.value[i].set(c));
 renderer.render(scene,camera);frame=requestAnimationFrame(animate);};
 frame=requestAnimationFrame(animate);
 return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();el.removeEventListener("pointermove",move);el.removeEventListener("pointerdown",move);el.removeEventListener("pointerleave",leave);geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div ref={host} style={{width:"100%",height:"100%",touchAction:"none"}}/>;
}
