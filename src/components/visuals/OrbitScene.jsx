import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
export default function OrbitScene({ accent = "#d90a3d", motion = 0.6, paused = false }) {
 const host = useRef(null), settings = useRef({accent,motion,paused});
 const [webglUnavailable,setWebglUnavailable] = useState(false);
 settings.current = {accent,motion,paused};
 useEffect(() => {
  const el=host.current;if(!el)return;
  let renderer;
  try { renderer=new THREE.WebGLRenderer({alpha:false,antialias:true}); }
  catch (error) { console.warn("Orbit: WebGL unavailable",error); setWebglUnavailable(true); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.18;
  renderer.domElement.style.cssText="width:100%;height:100%;display:block;touch-action:none";
  el.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color("#dedede");
  // Keep reflection environment fixed when the user changes sphere colors.
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const reflection=pmrem.fromScene(room,.025);
  scene.environment=reflection.texture;
  room.dispose();
  const camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.z=15;
  scene.add(new THREE.HemisphereLight(0xffffff,0x775a5a,2.2));
  const lights=[["#fff4df",125,-5,7,7],["#ff7354",105,4,2,4],["#ffffff",90,-3,-3,6]];
  lights.forEach(([color,power,x,y,z])=>{const l=new THREE.PointLight(color,power,30);l.position.set(x,y,z);scene.add(l);});
  const geometry=new THREE.SphereGeometry(1,48,32);
  const spheres=Array.from({length:18},(_,i)=>{
   const color=i%6<2?"#f4f0ef":i%6<4?"#340b13":settings.current.accent;
   const material=new THREE.MeshPhysicalMaterial({color,metalness:.42,roughness:.095,clearcoat:1,clearcoatRoughness:.025,envMapIntensity:1.75});
   const mesh=new THREE.Mesh(geometry,material);
   const angle=i*2.39996,radius=1.05+Math.sqrt(i/18)*1.55;
   mesh.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius,(i%5-2)*.76);
   scene.add(mesh);
   return {mesh,velocity:new THREE.Vector3(),accent:i%6>=4};
  });
  const pointer=new THREE.Vector3(100,100,0);
  let touching=false;
  const updatePointer=e=>{
   const rect=el.getBoundingClientRect(),nx=(e.clientX-rect.left)/rect.width*2-1,ny=1-(e.clientY-rect.top)/rect.height*2;
   const distance=camera.position.z*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*2;
   pointer.set(nx*distance*camera.aspect/2,ny*distance/2,0);
  };
  const press=e=>{touching=true;updatePointer(e);el.setPointerCapture?.(e.pointerId);};
  const release=()=>{touching=false;};
  const leave=()=>{if(!touching)pointer.set(100,100,0);};
  el.addEventListener("pointermove",updatePointer);
  el.addEventListener("pointerdown",press);
  el.addEventListener("pointerup",release);
  el.addEventListener("pointercancel",release);
  el.addEventListener("pointerleave",leave);
  const resize=()=>{const w=el.clientWidth||1,h=el.clientHeight||1;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  let frame,previous=performance.now();
  const tick=now=>{
   const dt=Math.min((now-previous)/1000,.04);previous=now;
   const {accent,motion,paused}=settings.current;
   if(!paused){
    const step=Math.min(dt,.025),energy=.7+motion*1.25;
    for(const item of spheres){
     const p=item.mesh.position;
     const force=p.clone().multiplyScalar(-1.45);
     force.z*=.8;
     const away=p.clone().sub(pointer),dist=away.length();
     if(dist<3.3)force.addScaledVector(away.normalize(),(3.3-dist)*(touching?78:46)*energy);
     item.velocity.addScaledVector(force,step*energy);
     item.velocity.multiplyScalar(Math.exp(-.62*step));
    }
    spheres.forEach(item=>item.mesh.position.addScaledVector(item.velocity,step*energy));
    for(let pass=0;pass<3;pass++){
     for(let i=0;i<spheres.length;i++)for(let j=i+1;j<spheres.length;j++){
      const A=spheres[i],B=spheres[j],difference=B.mesh.position.clone().sub(A.mesh.position);
      let distance=difference.length();
      if(distance<.0001){difference.set(.01,.01,.01);distance=difference.length();}
      if(distance>=2.01)continue;
      const normal=difference.multiplyScalar(1/distance),overlap=2.01-distance;
      A.mesh.position.addScaledVector(normal,-overlap*.5);
      B.mesh.position.addScaledVector(normal,overlap*.5);
      const relative=B.velocity.clone().sub(A.velocity).dot(normal);
      if(relative<0){
       const impulse=-(1+.82)*relative*.5;
       A.velocity.addScaledVector(normal,-impulse);
       B.velocity.addScaledVector(normal,impulse);
      }
     }
    }
   }
   spheres.forEach(item=>{if(item.accent)item.mesh.material.color.lerp(new THREE.Color(accent),.08);});
   renderer.render(scene,camera);frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();el.removeEventListener("pointermove",updatePointer);el.removeEventListener("pointerdown",press);el.removeEventListener("pointerup",release);el.removeEventListener("pointercancel",release);el.removeEventListener("pointerleave",leave);spheres.forEach(s=>s.mesh.material.dispose());geometry.dispose();reflection.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div ref={host} style={{width:"100%",height:"100%"}}>{webglUnavailable&&<div role="status" style={{height:"100%",display:"grid",placeItems:"center",background:"#182c30",color:"#f6f5f4",textAlign:"center",padding:24}}>This visual needs WebGL. Try closing other graphics-heavy tabs and reloading.</div>}</div>;
}