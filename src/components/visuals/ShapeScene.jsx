import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const clamp = v => Math.max(0,Math.min(1,v));
function Pearls({ breathRef, motionRef }) {
 const group=useRef();
 const pearls=useMemo(()=>Array.from({length:46},(_,i)=>{const a=i*2.39996323, y=1-2*(i+.5)/46, r=Math.sqrt(1-y*y);return [Math.cos(a)*r,y,Math.sin(a)*r,i]}),[]);
 useFrame(({clock},dt)=>{if(!group.current)return;const b=clamp(breathRef.current),t=clock.elapsedTime;group.current.rotation.y+=dt*.085*motionRef.current;group.current.children.forEach((m,i)=>{const [x,y,z]=pearls[i];const swell=.82+b*.34;const flutter=Math.sin(t*.7+i*.7)*.035*motionRef.current;m.position.set(x*(swell+flutter),y*(swell+flutter),z*(swell+flutter));m.scale.setScalar((.11+(i%5)*.018)*(1+b*.15));});});
 return <group ref={group}>{pearls.map((p,i)=><mesh key={i}><sphereGeometry args={[1,18,14]}/><meshPhysicalMaterial color={["#bdb1e9","#d7d7f5","#f6cbd9","#badfe5"][i%4]} metalness={.08} roughness={.12} clearcoat={1} clearcoatRoughness={.1} transparent opacity={.94}/></mesh>)}</group>;
}
function Ribbon({breathRef,motionRef}) {
 const mesh=useRef();const geometry=useMemo(()=>{const points=[];for(let i=0;i<=220;i++){const t=i/220*Math.PI*8;const r=.38+.085*Math.sin(t*2);points.push(new THREE.Vector3(Math.cos(t)*r, (i/220-.5)*2.25,Math.sin(t)*r));}return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),400,.075,9,false);},[]);
 useFrame(({clock},dt)=>{if(!mesh.current)return;mesh.current.rotation.y+=dt*.18*motionRef.current;mesh.current.rotation.z=Math.sin(clock.elapsedTime*.22)*.16*motionRef.current;const b=clamp(breathRef.current);mesh.current.scale.set(.82+b*.45,.78+b*.28,.82+b*.45);});
 return <mesh ref={mesh} geometry={geometry}><meshPhysicalMaterial color="#d8b9e8" metalness={.28} roughness={.2} clearcoat={1} side={THREE.DoubleSide}/></mesh>;
}
function Droplets({breathRef,motionRef}) {
 const group=useRef();const specs=useMemo(()=>Array.from({length:22},(_,i)=>{const a=i*2.4;return {x:Math.cos(a)*(.4+i%4*.15),y:Math.sin(a)*(.4+i%3*.2),z:Math.sin(i*1.8)*.4,size:.13+(i%4)*.055};}),[]);
 useFrame(({clock},dt)=>{if(!group.current)return;const b=clamp(breathRef.current);group.current.rotation.y+=dt*.12*motionRef.current;group.current.children.forEach((m,i)=>{const p=specs[i];const swell=.8+b*.42;m.position.set(p.x*swell,p.y*swell+Math.sin(clock.elapsedTime*.55+i)*.055*motionRef.current,p.z*swell);m.scale.set(p.size*.8,p.size*1.65,p.size*.8);});});
 return <group ref={group}>{specs.map((p,i)=><mesh key={i}><sphereGeometry args={[1,24,16]}/><meshPhysicalMaterial color={["#c6b7f0","#c7e8e8","#f5cbd4"][i%3]} metalness={.08} roughness={.12} clearcoat={1} transparent opacity={.9}/></mesh>)}</group>;
}
function Particles({breathRef,motionRef}) {
 const points=useRef();const base=useMemo(()=>{const count=1700,a=new Float32Array(count*3);for(let i=0;i<count;i++){const phi=i*2.3999632,y=1-2*(i+.5)/count,r=Math.sqrt(1-y*y);a[i*3]=Math.cos(phi)*r;a[i*3+1]=y;a[i*3+2]=Math.sin(phi)*r;}return a;},[]);
 const positions=useMemo(()=>new Float32Array(base),[base]);
 useFrame(({clock},dt)=>{if(!points.current)return;const b=clamp(breathRef.current),t=clock.elapsedTime;points.current.rotation.y+=dt*.09*motionRef.current;for(let i=0;i<base.length;i+=3){const idx=i/3,mod=1+.05*Math.sin(t*.55+idx*.1)*motionRef.current;const scale=(.76+b*.52)*mod;positions[i]=base[i]*scale;positions[i+1]=base[i+1]*scale;positions[i+2]=base[i+2]*scale;}points.current.geometry.attributes.position.needsUpdate=true;});
 return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color="#cbbbed" size={.026} sizeAttenuation transparent opacity={.9} depthWrite={false}/></points>;
}
const shapes={pearls:Pearls,ribbon:Ribbon,droplets:Droplets,particles:Particles};
export default function ShapeScene({kind,breathRef,motionRef}) {
 const Shape=shapes[kind]||Pearls;
 return <Canvas camera={{position:[0,0,4.5],fov:42}} dpr={[1,1.7]} gl={{alpha:true,antialias:true}} style={{width:"100%",height:"100%"}}>
 <ambientLight intensity={1.6}/><directionalLight position={[3,5,5]} intensity={2.4}/><pointLight position={[-3,-2,3]} color="#f3b7d4" intensity={3}/>
 <Shape breathRef={breathRef} motionRef={motionRef}/>
 </Canvas>;
}
