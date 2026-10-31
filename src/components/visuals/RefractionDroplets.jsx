import { Suspense, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

// Adapted from Three.js webgl_effects_stereo (MIT License).
// The optical look comes from CubeRefractionMapping and the Park3Med cubemap,
// not from the StereoEffect (which only creates the side-by-side camera views).
const cubeUrls = ["px.jpg","nx.jpg","py.jpg","ny.jpg","pz.jpg","nz.jpg"].map(
  file => `https://threejs.org/examples/textures/cube/Park3Med/${file}`
);
function DropletField({ breathRef, motionRef }) {
  const env = useLoader(THREE.CubeTextureLoader, cubeUrls);
  env.mapping = THREE.CubeRefractionMapping;
  const group = useRef();
  const data = useMemo(() => Array.from({length:36},(_,i)=>{
    const angle=i*2.399963229728653;
    const radius=.38+Math.sqrt((i+.5)/36)*1.8;
    return { x:Math.cos(angle)*radius, y:Math.sin(angle)*radius*.84, z:Math.sin(i*1.9)*.75,
      size:.09+((i*7)%13)/13*.26, phase:i*.71 };
  }),[]);
  useFrame(({clock},dt)=>{
    if(!group.current)return;
    const t=clock.elapsedTime, b=Math.max(0,Math.min(1,breathRef.current));
    group.current.rotation.y+=dt*.055*motionRef.current;
    group.current.children.forEach((mesh,i)=>{
      const p=data[i],expand=.87+b*.24;
      mesh.position.set(p.x*expand+Math.sin(t*.3+p.phase)*.075*motionRef.current,
        p.y*expand+Math.cos(t*.38+p.phase)*.09*motionRef.current,
        p.z+Math.sin(t*.2+p.phase)*.07*motionRef.current);
      mesh.scale.setScalar(p.size*(1+b*.17));
    });
  });
  return <group ref={group}>{data.map((p,i)=><mesh key={i}>
    <sphereGeometry args={[1,32,20]}/>
    <meshBasicMaterial color="#ffffff" envMap={env} refractionRatio={.95}/>
  </mesh>)}</group>;
}
export default function RefractionDroplets({breathRef,motionRef}) {
  return <Suspense fallback={null}><DropletField breathRef={breathRef} motionRef={motionRef}/></Suspense>;
}
