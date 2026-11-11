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
 const image=c.getImageData(0,0,w,h); const texture=new THREE.DataTexture(new Uint8Array(image.data),w,h,THREE.RGBAFormat); texture.colorSpace=THREE.SRGBColorSpace; texture.flipY=true; texture.needsUpdate=true; texture.generateMipmaps=true; texture.minFilter=THREE.LinearMipmapLinearFilter; texture.magFilter=THREE.LinearFilter; return texture;
}
function Koi({index,interaction,paused}){
 const root=useRef(),body=useRef(),tail=useRef(),left=useRef(),right=useRef();
 const seed=index*7.13+1.6;
 const texture=useMemo(()=>makeKoiTexture(index),[index]);
 const shape=useMemo(()=>{
  // Rounded, tapered koi body: cross-section rings give the fish genuine depth.
  const vertices=[],uvs=[],indices=[];
  const segments=38,sides=20;
  for(let j=0;j<=segments;j++){
   const u=j/segments,x=-1.48+u*2.96;
   const fullness=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.68);
   const shoulder=1+.17*Math.exp(-Math.pow((u-.72)/.17,2));
   const width=.48*fullness*shoulder,depth=.22*fullness;
   for(let k=0;k<=sides;k++){
    const a=k/sides*Math.PI*2;
    vertices.push(x,Math.cos(a)*width,Math.sin(a)*depth);
    uvs.push(u,.5+Math.cos(a)*.5);
   }
  }
  for(let j=0;j<segments;j++)for(let k=0;k<sides;k++){
   const a=j*(sides+1)+k,b=a+sides+1;
   indices.push(a,b,a+1,b,b+1,a+1);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  geo.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
  geo.setIndex(indices);geo.computeVertexNormals();
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
  <mesh geometry={shape} position={[-.16,-.2,-.33]} scale={[1.1,1.12,.18]}><meshBasicMaterial color="#00140e" transparent opacity={.24} depthWrite={false}/></mesh>
  <group ref={tail} position={[-1.35,0,-.01]}>
   <mesh position={[-.33,.2,0]} rotation={[0,0,-.36]} scale={[.55,.22,.025]}><sphereGeometry args={[1,20,12]}/><meshPhysicalMaterial color="#f2e9d7" transparent opacity={.72} roughness={.7} side={THREE.DoubleSide}/></mesh>
   <mesh position={[-.33,-.2,0]} rotation={[0,0,.36]} scale={[.55,.22,.025]}><sphereGeometry args={[1,20,12]}/><meshPhysicalMaterial color="#f2e9d7" transparent opacity={.72} roughness={.7} side={THREE.DoubleSide}/></mesh>
  </group>
  <group ref={left} position={[-.12,.38,.015]}><mesh position={[-.16,.24,0]} rotation={[0,0,.48]} scale={[.43,.19,.028]}><sphereGeometry args={[1,18,12]}/><meshPhysicalMaterial color="#d8d2c1" transparent opacity={.66} side={THREE.DoubleSide}/></mesh></group>
  <group ref={right} position={[-.12,-.38,.015]}><mesh position={[-.16,-.24,0]} rotation={[0,0,-.48]} scale={[.43,.19,.028]}><sphereGeometry args={[1,18,12]}/><meshPhysicalMaterial color="#d8d2c1" transparent opacity={.66} side={THREE.DoubleSide}/></mesh></group>
  <group ref={body}>
   <mesh geometry={shape} position={[0,0,.045]}><meshPhysicalMaterial map={texture} roughness={.43} metalness={.04} clearcoat={.7} clearcoatRoughness={.24} side={THREE.DoubleSide}/></mesh>
   <mesh position={[1.03,.205,.18]}><sphereGeometry args={[.047,12,10]}/><meshBasicMaterial color="#151b18"/></mesh>
   <mesh position={[1.03,-.205,.18]}><sphereGeometry args={[.047,12,10]}/><meshBasicMaterial color="#151b18"/></mesh>
   <mesh position={[1.43,0,.045]} scale={[.09,.11,.01]}><sphereGeometry args={[1,12,10]}/><meshBasicMaterial color="#d9b5a4"/></mesh>
  </group>
 </group>;
}
function Water({interaction,paused}){
 
 const rings=useRef([]),meshes=useRef([]),surface=useRef();
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
  <mesh position={[0,0,-.45]}><planeGeometry args={[50,40]}/><meshBasicMaterial color="#214a3d" transparent opacity={.46}/></mesh>
  <mesh position={[0,0,.43]}>
   <planeGeometry args={[50,40]}/>
   <shaderMaterial ref={surface} transparent depthWrite={false} uniforms={{time:{value:0}}}
    vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
    fragmentShader={`uniform float time;varying vec2 vUv;
      void main(){
       vec2 p=vUv*vec2(13.0,9.0);
       float a=sin(p.x*3.1+sin(p.y*2.4+time*.34)+time*.47);
       float b=sin(p.y*4.4+sin(p.x*2.1-time*.28)-time*.39);
       float caustic=pow(max(0.0,a*b),5.0);
       float glint=pow(max(0.0,sin(p.x*1.4+p.y*2.3+time*.23)),16.0);
       vec3 color=vec3(.43,.76,.66)*caustic+vec3(.28,.55,.5)*glint;
       gl_FragColor=vec4(color,clamp(caustic*.16+glint*.055,0.0,.20));
      }`}/>
  </mesh>
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
   <ambientLight intensity={1.05}/><directionalLight position={[-3,5,9]} intensity={2.3}/><directionalLight position={[5,-4,6]} intensity={.65} color="#c1f0df"/><Pond interaction={interaction} paused={paused}/>
  </Canvas>
  <div style={{position:"absolute",bottom:18,left:20,color:"#e5f5eb",fontSize:13,textShadow:"0 2px 8px #001b16",pointerEvents:"none"}}>Touch the water · Hold to invite a curious koi · Drag to make ripples</div>
 </div>;
}
