import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const palettes=[
 ["#f7f0df","#ee6a2b","#d9481d"],["#f4f0e5","#d84427","#c73c24"],
 ["#e9e7da","#303c3b","#e36b2e"],["#e8e6dc","#dc8a31","#e25728"],
 ["#e7e8e0","#252d31","#a7a7a0"],["#f3ece2","#ed6d27","#f5b045"]
];
const bounds={x:7.6,y:5.1};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function Koi({index,interaction,paused}){
 const ref=useRef(),tail=useRef(),left=useRef(),right=useRef();
 const seed=useMemo(()=>index*7.13+1.6,[index]);
 const state=useRef({x:Math.sin(seed)*5,y:Math.cos(seed*1.4)*3,angle:seed*2.1,speed:.36+index*.045,interest:0,decision:0,target:seed*2.1});
 const personality=useMemo(()=>({curiosity:[.9,.45,.7,.25,.8,.55][index],fear:[.28,.9,.48,.7,.35,.6][index]}),[index]);
 const colors=palettes[index];
 useFrame(({clock},dt)=>{
  if(paused||!ref.current)return;
  const s=state.current,t=clock.elapsedTime,d=clamp(dt,0,.04),i=interaction.current;
  s.decision-=d;
  if(s.decision<=0){s.decision=1.5+(index%4)*.65;s.target+=Math.sin(t*.61+seed)*.9;}
  const dx=i.x-s.x,dy=i.y-s.y,dist=Math.hypot(dx,dy);
  let desired=s.target,velocity=s.speed;
  if(i.active&&dist<4.5){
   const direction=Math.atan2(dy,dx);
   const approach=i.stillness>.3&&i.intensity<.7;
   const pull=approach?personality.curiosity:-personality.fear;
   desired=direction+(pull<0?Math.PI:0);
   velocity=s.speed+(approach?.15:.65)*Math.abs(pull);
   s.interest=clamp(s.interest+d*(approach?.3:-.6),0,1);
  }else{s.interest=clamp(s.interest-d*.12,0,1);}
  if(Math.abs(s.x)>bounds.x-1||Math.abs(s.y)>bounds.y-1)desired=Math.atan2(-s.y,-s.x);
  let diff=Math.atan2(Math.sin(desired-s.angle),Math.cos(desired-s.angle));
  s.angle+=clamp(diff,-d*1.1,d*1.1);
  s.x=clamp(s.x+Math.cos(s.angle)*velocity*d,-bounds.x,bounds.x);
  s.y=clamp(s.y+Math.sin(s.angle)*velocity*d,-bounds.y,bounds.y);
  ref.current.position.set(s.x,s.y,.25+Math.sin(t*.9+seed)*.035);
  ref.current.rotation.z=s.angle;
  const wag=Math.sin(t*(3.6+velocity*2)+seed);
  if(tail.current)tail.current.rotation.z=wag*.34;
  if(left.current)left.current.rotation.z=.3+wag*.18;
  if(right.current)right.current.rotation.z=-.3-wag*.18;
 });
 return <group ref={ref} scale={.68+index%3*.12}>
  <mesh position={[-.1,-.12,-.18]} scale={[1.7,.57,.1]}><sphereGeometry args={[1,20,12]}/><meshBasicMaterial color="#00160f" transparent opacity={.3} depthWrite={false}/></mesh>
  <mesh scale={[1.35,.49,.22]}><sphereGeometry args={[1,36,20]}/><meshPhysicalMaterial color={colors[0]} roughness={.42} clearcoat={.4}/></mesh>
  <mesh position={[.65,.01,.17]} scale={[.36,.33,.07]}><sphereGeometry args={[1,18,12]}/><meshStandardMaterial color={colors[1]}/></mesh>
  <mesh position={[-.4,.18,.19]} scale={[.46,.23,.06]} rotation={[0,0,-.3]}><sphereGeometry args={[1,18,12]}/><meshStandardMaterial color={colors[2]}/></mesh>
  <mesh position={[-.68,-.11,.18]} scale={[.31,.27,.06]}><sphereGeometry args={[1,18,12]}/><meshStandardMaterial color={colors[1]}/></mesh>
  <mesh position={[1.03,.24,.08]} scale={[.055,.055,.045]}><sphereGeometry args={[1,10,8]}/><meshBasicMaterial color="#182120"/></mesh>
  <mesh position={[1.03,-.24,.08]} scale={[.055,.055,.045]}><sphereGeometry args={[1,10,8]}/><meshBasicMaterial color="#182120"/></mesh>
  <group ref={tail} position={[-1.25,0,0]}>
   <mesh position={[-.36,.22,0]} rotation={[0,0,-.42]}><sphereGeometry args={[.65,.23,.055,16,10]}/><meshStandardMaterial color={colors[0]} transparent opacity={.86} side={THREE.DoubleSide}/></mesh>
   <mesh position={[-.36,-.22,0]} rotation={[0,0,.42]}><sphereGeometry args={[.65,.23,.055,16,10]}/><meshStandardMaterial color={colors[0]} transparent opacity={.86} side={THREE.DoubleSide}/></mesh>
  </group>
  <group ref={left} position={[-.1,.39,.02]}><mesh position={[-.15,.23,0]} rotation={[0,0,.6]}><sphereGeometry args={[.42,.18,.045,16,10]}/><meshStandardMaterial color={colors[0]} transparent opacity={.72}/></mesh></group>
  <group ref={right} position={[-.1,-.39,.02]}><mesh position={[-.15,-.23,0]} rotation={[0,0,-.6]}><sphereGeometry args={[.42,.18,.045,16,10]}/><meshStandardMaterial color={colors[0]} transparent opacity={.72}/></mesh></group>
 </group>;
}
function Water({interaction,paused}){
 const {viewport}=useThree();
 const rings=useRef([]),meshes=useRef([]);
 useFrame((_,dt)=>{
  if(!paused){
   const i=interaction.current;
   if(i.pulse>0){rings.current.push({x:i.x,y:i.y,age:0});i.pulse=0;}
   for(const r of rings.current)r.age+=dt;
   rings.current=rings.current.filter(r=>r.age<2.2);
  }
  meshes.current.forEach((m,k)=>{if(!m)return;const r=rings.current[rings.current.length-1-k];m.visible=!!r;if(!r)return;m.position.set(r.x,r.y,.48);m.scale.setScalar(.15+r.age*2.25);m.material.opacity=Math.sin(Math.PI*r.age/2.2)*.27;});
 });
 return <><mesh position={[0,0,-.6]}><planeGeometry args={[50,40]}/><meshBasicMaterial color="#102e2b"/></mesh>
  <mesh position={[0,0,-.45]}><planeGeometry args={[50,40]}/><meshBasicMaterial color="#163e36" transparent opacity={.55}/></mesh>
  {Array.from({length:12},(_,k)=><mesh key={k} ref={el=>meshes.current[k]=el} visible={false} position={[0,0,.48]}><ringGeometry args={[.96,1,96]}/><meshBasicMaterial color="#c4f0e2" transparent opacity={.2} depthWrite={false} side={THREE.DoubleSide}/></mesh>)}
 </>;
}
function Pond({interaction,paused}){
 const {camera,size}=useThree();
 const pointer=(e,kind)=>{
  e.stopPropagation();
  const p=e.point,i=interaction.current,now=performance.now();
  const distance=Math.hypot(p.x-i.x,p.y-i.y);
  i.intensity=kind==="down"?0:clamp(distance*2.4,0,1);
  i.stillness=kind==="down"?0:distance<.035?i.stillness+.06:0;
  i.x=p.x;i.y=p.y;i.active=true;i.last=now;
  if(kind==="down"||now-i.lastPulse>100){i.pulse=1;i.lastPulse=now;}
 };
 useFrame((_,dt)=>{const i=interaction.current;if(i.active){i.stillness=clamp(i.stillness+dt*.4,0,1);i.intensity*=.96;if(performance.now()-i.last>1500)i.active=false;}});
 return <><Water interaction={interaction} paused={paused}/>{Array.from({length:6},(_,i)=><Koi key={i} index={i} interaction={interaction} paused={paused}/>)}
 <mesh position={[0,0,.6]} onPointerDown={e=>pointer(e,"down")} onPointerMove={e=>{if(e.buttons||e.pointerType==="touch")pointer(e,"move")}} onPointerUp={e=>{interaction.current.active=false;e.stopPropagation()}}><planeGeometry args={[40,30]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh></>;
}
export default function UnderwaterTwoScene({paused=false}){
 const interaction=useRef({x:0,y:0,active:false,intensity:0,stillness:0,pulse:0,last:0,lastPulse:0});
 return <div style={{height:"100%",width:"100%",position:"relative",background:"#102e2b",touchAction:"none"}}>
  <Canvas orthographic camera={{position:[0,0,18],zoom:60,near:.1,far:100}} dpr={[1,1.7]} gl={{antialias:true,alpha:false}} style={{touchAction:"none"}}>
   <ambientLight intensity={1.7}/><directionalLight position={[-3,5,9]} intensity={2}/><Pond interaction={interaction} paused={paused}/>
  </Canvas>
  <div style={{position:"absolute",bottom:18,left:20,color:"#e5f5eb",fontSize:13,textShadow:"0 2px 8px #001b16",pointerEvents:"none"}}>Touch the water · Hold to invite a curious koi · Drag to make ripples</div>
 </div>;
}
