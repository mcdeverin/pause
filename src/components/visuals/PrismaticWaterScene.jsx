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
 float wave(vec2 p,vec2 center,float freq,float speed){
 float d=length(p-center);return sin(d*freq-uTime*speed)*exp(-d*3.3);
 }
 void main(){
 vec2 uv=vUv;float aspect=uResolution.x/max(uResolution.y,1.);
 vec2 p=vec2(uv.x*aspect,uv.y),cursor=vec2(uPointer.x*aspect,uPointer.y);
 float d=length(p-cursor);
 float influence=exp(-d*d/(.035+.18*uSoftness));
 float ripples=sin(d*54.-uTime*8.)*exp(-d*(7.+4.*uSoftness));
 vec2 dir=(p-cursor)/(d+.002);
 vec2 displacement=dir*ripples*influence*uStrength*.024+uVelocity*influence*uStrength*.055;
 float ambient=wave(p,vec2(.18*aspect,.72),19.,.48)+wave(p,vec2(.85*aspect,.3),23.,.37)+wave(p,vec2(.53*aspect,.53),28.,.31);
 displacement+=vec2(sin(ambient*2.+uTime*.17),cos(ambient*2.-uTime*.13))*.008*uMotion;
 vec2 q=uv-displacement;
 float blend=clamp(.5+.38*sin(q.x*4.+q.y*3.+ambient*.55),0.,1.);
 vec3 col=mix(uColors[0],uColors[1],blend);
 col=mix(col,uColors[2],clamp(.35+.4*cos(q.y*5.-q.x*2.+ambient),0.,1.));
 float ridges=sin((q.y+ambient*.026)*120.+q.x*15.);
 float shimmer=pow(max(0.,ridges),18.)*(.08+.16*uMotion);
 float crest=max(0.,ripples)*influence*uStrength*.22;
 col+=vec3(1.,.93,.94)*(shimmer+crest);
 col-=vec3(.18,.13,.22)*max(0.,-ripples)*influence*uStrength*.08;
 col=mix(col,vec3(1.),.07);
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
