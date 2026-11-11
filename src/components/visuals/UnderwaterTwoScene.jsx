import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const palettes=[
 ["#f7f0df","#ee6a2b","#d9481d"],["#f4f0e5","#d84427","#c73c24"],
 ["#e9e7da","#303c3b","#e36b2e"],["#e8e6dc","#dc8a31","#e25728"],
 ["#e7e8e0","#252d31","#a7a7a0"],["#f3ece2","#ed6d27","#f5b045"]
];
const bounds={x:7.6,y:5.1};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

function makeKoiTexture(index) {
 const canvas=document.createElement("canvas");canvas.width=768;canvas.height=320;
 const c=canvas.getContext("2d"), w=canvas.width,h=canvas.height;
 const white=["#eee9dd","#f6eee4","#dedfd7","#f0e4cb","#e3e5de","#f1e8d7"][index];
 const base=c.createLinearGradient(0,0,0,h);
 base.addColorStop(0,"#9e9d91");base.addColorStop(.17,white);base.addColorStop(.48,"#fff8e9");base.addColorStop(.82,white);base.addColorStop(1,"#8a968e");
 c.fillStyle=base;c.fillRect(0,0,w,h);
 const patterns=[
  [[.2,.48,.18,.38],[.48,.44,.16,.48],[.73,.56,.12,.4]],
  [[.31,.5,.21,.48],[.65,.48,.16,.5]],
  [[.19,.5,.15,.4],[.48,.3,.14,.25],[.58,.67,.12,.26],[.79,.5,.13,.3]],
  [[.27,.5,.15,.36],[.54,.52,.21,.48],[.8,.43,.09,.29]],
  [[.25,.47,.17,.43],[.61,.54,.22,.38]],
  [[.18,.5,.2,.42],[.45,.44,.11,.32],[.7,.5,.18,.43]]
 ];
 const red=["#d74a26","#d74821","#dc652c","#d8852b","#292f2e","#d64b23"][index];
 for(const [x,y,rx,ry] of patterns[index]){
  c.save();c.translate(x*w,y*h);c.rotate((x-.5)*.8);
  const g=c.createRadialGradient(0,0,4,0,0,rx*w);
  g.addColorStop(0,red);g.addColorStop(.68,red);g.addColorStop(1,red+"00");
  c.fillStyle=g;c.beginPath();c.ellipse(0,0,rx*w,ry*h,0,0,Math.PI*2);c.fill();c.restore();
 }
 // Fine overlapping scale outlines, subtle enough not to resemble a grid.
 c.strokeStyle="rgba(66,70,62,.10)";c.lineWidth=1;
 for(let row=0;row<12;row++)for(let col=0;col<34;col++){
  const x=col*24+(row%2)*12,y=row*27;
  c.beginPath();c.arc(x,y,16,.05,Math.PI-.05);c.stroke();
 }
 const shine=c.createLinearGradient(0,0,0,h);shine.addColorStop(0,"#ffffff00");shine.addColorStop(.3,"#ffffff33");shine.addColorStop(.48,"#ffffff5a");shine.addColorStop(.64,"#ffffff00");c.fillStyle=shine;c.fillRect(0,0,w,h);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function Koi({index,interaction,paused}){
 const root=useRef(),body=useRef(),tail=useRef(),left=useRef(),right=useRef();
 const seed=index*7.13+1.6;
 const texture=useMemo(()=>makeKoiTexture(index),[index]);
 const shape=useMemo(()=>{
  const sh=new THREE.Shape();
  sh.moveTo(1.48,0);
  sh.bezierCurveTo(1.35,.23,1.04,.32,.77,.38);
  sh.bezierCurveTo(.22,.58,-.53,.49,-.94,.25);
  sh.bezierCurveTo(-1.18,.15,-1.4,.09,-1.47,0);
  sh.bezierCurveTo(-1.4,-.09,-1.18,-.15,-.94,-.25);
  sh.bezierCurveTo(-.53,-.49,.22,-.58,.77,-.38);
  sh.bezierCurveTo(1.04,-.32,1.35,-.23,1.48,0);
  const geo=new THREE.ShapeGeometry(sh,28);
  const uv=geo.attributes.uv, pos=geo.attributes.position;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+1.5)/3,(pos.getY(i)+.6)/1.2);
  return geo;
 },[]);
 const state=useRef({x:Math.sin(seed)*5,y:Math.cos(seed*1.4)*3,angle:seed*2.1,speed:.35+index*.055,decision:0,target:seed*2.1});
 useFrame(({clock},dt)=>{
  if(paused||!root.current)return;
  const s=state.current,t=clock.elapsedTime,d=clamp(dt,0,.04),i=interaction.current;
  s.decision-=d;
  if(s.decision<=0){s.decision=1.5+(index%4)*.65;s.target+=Math.sin(t*.61+seed)*1.15;}
  const dx=i.x-s.x,dy=i.y-s.y,dist=Math.hypot(dx,dy);
  let desired=s.target,velocity=s.speed;
  if(i.active&&dist<5){
   const direction=Math.atan2(dy,dx),approach=i.stillness>.4&&i.intensity<.65;
   const curious=[.95,.3,.75,.45,.8,.55][index];
   desired=direction+(!approach&&curious<.6?Math.PI:0);
   velocity=s.speed+(approach?.12:.5);
  }
  if(Math.abs(s.x)>6.3||Math.abs(s.y)>4)desired=Math.atan2(-s.y,-s.x);
  const diff=Math.atan2(Math.sin(desired-s.angle),Math.cos(desired-s.angle));
  s.angle+=clamp(diff,-d*.85,d*.85);
  s.x=clamp(s.x+Math.cos(s.angle)*velocity*d,-7.2,7.2);
  s.y=clamp(s.y+Math.sin(s.angle)*velocity*d,-4.8,4.8);
  root.current.position.set(s.x,s.y,.26+Math.sin(t*.6+seed)*.03);
  root.current.rotation.z=s.angle;
  const wag=Math.sin(t*(3.5+velocity*2)+seed);
  if(tail.current)tail.current.rotation.z=wag*.38;
  if(body.current)body.current.rotation.z=wag*.017;
  if(left.current)left.current.rotation.z=.4+wag*.22;
  if(right.current)right.current.rotation.z=-.4-wag*.22;
 });
 return <group ref={root} scale={.72+index%3*.13}>
  <mesh position={[-.12,-.16,-.22]} scale={[1.12,1.1,1]}><primitive object={shape} attach="geometry"/><meshBasicMaterial color="#00160f" transparent opacity={.34} depthWrite={false}/></mesh>
  <group ref={tail} position={[-1.35,0,-.01]}>
   <mesh position={[-.33,.2,0]} rotation={[0,0,-.36]} scale={[.55,.22,.025]}><sphereGeometry args={[1,20,12]}/><meshPhysicalMaterial color="#f2e9d7" transparent opacity={.72} roughness={.7} side={THREE.DoubleSide}/></mesh>
   <mesh position={[-.33,-.2,0]} rotation={[0,0,.36]} scale={[.55,.22,.025]}><sphereGeometry args={[1,20,12]}/><meshPhysicalMaterial color="#f2e9d7" transparent opacity={.72} roughness={.7} side={THREE.DoubleSide}/></mesh>
  </group>
  <group ref={left} position={[-.12,.38,.015]}><mesh position={[-.16,.24,0]} rotation={[0,0,.48]} scale={[.43,.19,.028]}><sphereGeometry args={[1,18,12]}/><meshPhysicalMaterial color="#d8d2c1" transparent opacity={.66} side={THREE.DoubleSide}/></mesh></group>
  <group ref={right} position={[-.12,-.38,.015]}><mesh position={[-.16,-.24,0]} rotation={[0,0,-.48]} scale={[.43,.19,.028]}><sphereGeometry args={[1,18,12]}/><meshPhysicalMaterial color="#d8d2c1" transparent opacity={.66} side={THREE.DoubleSide}/></mesh></group>
  <group ref={body}>
   <mesh geometry={shape} position={[0,0,.045]}><meshBasicMaterial map={texture} side={THREE.DoubleSide}/></mesh>
   <mesh position={[.98,.24,.075]}><sphereGeometry args={[.047,12,10]}/><meshBasicMaterial color="#151b18"/></mesh>
   <mesh position={[.98,-.24,.075]}><sphereGeometry args={[.047,12,10]}/><meshBasicMaterial color="#151b18"/></mesh>
   <mesh position={[1.32,0,.075]} scale={[.09,.11,.01]}><sphereGeometry args={[1,12,10]}/><meshBasicMaterial color="#d9b5a4"/></mesh>
  </group>
 </group>;
}
function Water({interaction,paused}){
 
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
