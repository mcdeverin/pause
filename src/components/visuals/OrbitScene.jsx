import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
export default function OrbitScene({ accent = "#ed4d9a", motion = 0.6, paused = false }) {
 const host = useRef(null), settings = useRef({accent,motion,paused});
 settings.current = {accent,motion,paused};
 useEffect(() => {
  const el=host.current;if(!el)return;
  const renderer=new THREE.WebGLRenderer({alpha:false,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.55;
  renderer.domElement.style.cssText="width:100%;height:100%;display:block;touch-action:none";
  el.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color("#0b0b1c");
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.z=15;
  scene.add(new THREE.HemisphereLight(0xc6d5ff,0x23132c,2.8));
  const lights=[["#ffffff",75,-5,7,7],["#ff64c4",65,5,3,3],["#728bff",80,1,-5,5]];
  lights.forEach(([color,power,x,y,z])=>{const l=new THREE.PointLight(color,power,30);l.position.set(x,y,z);scene.add(l);});
  const geometry=new THREE.SphereGeometry(1,48,32);
  const spheres=Array.from({length:18},(_,i)=>{
   const color=i%6<2?"#e5e8ff":i%6<4?"#343959":settings.current.accent;
   const material=new THREE.MeshPhysicalMaterial({color,metalness:.38,roughness:.13,clearcoat:1,clearcoatRoughness:.08});
   const mesh=new THREE.Mesh(geometry,material);
   const angle=i*2.39996,radius=1.3+Math.sqrt(i/18)*2.0;
   mesh.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius,(i%5-2)*.5);
   scene.add(mesh);
   return {mesh,velocity:new THREE.Vector3(),target:new THREE.Vector3().copy(mesh.position),accent:i%6>=4};
  });
  const pointer=new THREE.Vector3(100,100,0);
  const updatePointer=e=>{const r=el.getBoundingClientRect();pointer.set(((e.clientX-r.left)/r.width-.5)*9,((.5-(e.clientY-r.top)/r.height))*9,0);};
  const leave=()=>pointer.set(100,100,0);
  el.addEventListener("pointermove",updatePointer);el.addEventListener("pointerdown",updatePointer);el.addEventListener("pointerleave",leave);
  const resize=()=>{const w=el.clientWidth||1,h=el.clientHeight||1;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  let frame,previous=performance.now();
  const tick=now=>{
   const dt=Math.min((now-previous)/1000,.04);previous=now;
   const {accent,motion,paused}=settings.current;
   if(!paused){
    for(const item of spheres){
     const p=item.mesh.position;
     const force=item.target.clone().sub(p).multiplyScalar(1.4);
     const away=p.clone().sub(pointer);const distance=away.length();
     if(distance<2.2&&Math.abs(p.z)<1.8)force.add(away.normalize().multiplyScalar((2.2-distance)*13));
     for(const other of spheres){if(other===item)continue;const d=p.clone().sub(other.mesh.position);const len=d.length();if(len>0.001&&len<1.93)force.addScaledVector(d,(1.93-len)*5/len);}
     item.velocity.addScaledVector(force,dt*motion);item.velocity.multiplyScalar(Math.exp(-3*dt));p.addScaledVector(item.velocity,dt*4);
    }
   }
   spheres.forEach(item=>{if(item.accent)item.mesh.material.color.lerp(new THREE.Color(accent),.08);});
   renderer.render(scene,camera);frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();el.removeEventListener("pointermove",updatePointer);el.removeEventListener("pointerdown",updatePointer);el.removeEventListener("pointerleave",leave);spheres.forEach(s=>s.mesh.material.dispose());geometry.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div ref={host} style={{width:"100%",height:"100%"}}/>;
}