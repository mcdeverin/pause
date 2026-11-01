import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Fish({position=[0,0,0],scale=1,offset=0,color="#65b6d2"}) {
 const group=useRef(),tail=useRef(),fin=useRef();
 useFrame(({clock,pointer})=>{const t=clock.elapsedTime+offset;if(!group.current)return;group.current.position.set(position[0]+Math.sin(t*.47)*.65+pointer.x*.25,position[1]+Math.sin(t*.8)*.17+pointer.y*.2,position[2]+Math.cos(t*.35)*.3);group.current.rotation.y=Math.sin(t*.47)*.3-pointer.x*.2;if(tail.current)tail.current.rotation.y=Math.sin(t*5)*.42;if(fin.current)fin.current.rotation.z=Math.sin(t*4)*.25;});
 return <group ref={group} scale={scale}>
 <mesh scale={[1.25,.52,.42]}><sphereGeometry args={[1,28,20]}/><meshPhysicalMaterial color={color} metalness={.23} roughness={.24} clearcoat={1} clearcoatRoughness={.13}/></mesh>
 <mesh position={[.97,.07,.35]}><sphereGeometry args={[.09,12,12]}/><meshStandardMaterial color="#071b23" roughness={.08}/></mesh>
 <mesh position={[1,.09,.416]}><sphereGeometry args={[.027,10,10]}/><meshBasicMaterial color="#ffffff"/></mesh>
 <group ref={tail} position={[-1.13,0,0]}><mesh rotation={[0,0,-Math.PI/2]} position={[-.52,0,0]}><coneGeometry args={[.85,1.1,3]}/><meshPhysicalMaterial color="#6fcae0" side={THREE.DoubleSide} transparent opacity={.82} metalness={.2} roughness={.3}/></mesh></group>
 <group ref={fin} position={[-.18,.43,0]}><mesh rotation={[0,0,-.18]}><coneGeometry args={[.45,.95,3]}/><meshPhysicalMaterial color="#8dd4dd" side={THREE.DoubleSide} transparent opacity={.72}/></mesh></group>
 <mesh position={[-.1,-.45,0]} rotation={[0,0,Math.PI]}><coneGeometry args={[.32,.7,3]}/><meshPhysicalMaterial color="#8dd4dd" side={THREE.DoubleSide} transparent opacity={.7}/></mesh>
 </group>;
}
function Plankton(){const ref=useRef();const coords=useMemo(()=>{const a=new Float32Array(450*3);for(let i=0;i<450;i++){a[i*3]=(Math.random()-.5)*25;a[i*3+1]=(Math.random()-.5)*15;a[i*3+2]=(Math.random()-.5)*22}return a},[]);useFrame(({clock})=>{if(ref.current)ref.current.rotation.y=clock.elapsedTime*.012});return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[coords,3]}/></bufferGeometry><pointsMaterial color="#b2e9e5" size={.045} transparent opacity={.5} sizeAttenuation depthWrite={false}/></points>}
export default function UnderwaterTwoScene(){return <div style={{height:"100%",width:"100%",background:"#062936",position:"relative"}}>
 <Canvas camera={{position:[0,0,8],fov:48}} dpr={[1,1.8]}>
 <color attach="background" args={["#062936"]}/><fog attach="fog" args={["#062936",7,25]}/>
 <ambientLight intensity={1.1}/><directionalLight position={[3,8,6]} intensity={2.4} color="#9cdef0"/><pointLight position={[-5,1,2]} intensity={25} color="#2c9eaf"/>
 <Plankton/><Fish scale={1.15}/><Fish position={[-3,-1.3,-2]} scale={.48} offset={3} color="#d9ad75"/><Fish position={[2.9,1.2,-3]} scale={.38} offset={6} color="#8ccab1"/>
 <OrbitControls enableDamping enablePan={false} minDistance={3} maxDistance={14}/>
 </Canvas>
 <div style={{position:"absolute",bottom:16,left:18,pointerEvents:"none",color:"#d7f3f3",fontSize:12}}>Living Fish · Move to attract fish · Drag to orbit · Scroll to zoom</div>
 </div>}