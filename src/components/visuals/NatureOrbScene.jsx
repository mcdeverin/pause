import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// A living botanical orb made from instanced leaves, not a photographic texture.
export default function NatureOrbScene({ breathRef, motionRef, density=950, palette="forest" }) {
 const host=useRef(null),options=useRef({});options.current={density,palette};
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
  renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
  renderer.domElement.style.cssText="display:block;width:100%;height:100%";el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,30);camera.position.z=4.7;
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);
  room.dispose();scene.environment=env.texture;
  scene.add(new THREE.HemisphereLight(0xf8ffdb,0x244a36,2.6));
  const sun=new THREE.DirectionalLight(0xffe6ad,4.5);sun.position.set(-3,5,6);scene.add(sun);
  const fill=new THREE.DirectionalLight(0x9adfc4,2);fill.position.set(4,-2,3);scene.add(fill);
  const coreGeo=new THREE.SphereGeometry(.86,64,48);
  const coreMat=new THREE.MeshStandardMaterial({color:0x476d43,roughness:.92,metalness:0});
  const core=new THREE.Mesh(coreGeo,coreMat);scene.add(core);
  // Slightly curved pointed leaves; many share a single draw call.
  const leafGeo=new THREE.BufferGeometry();
  leafGeo.setAttribute("position",new THREE.Float32BufferAttribute([
   0,0,0, -.10,.18,.055, 0,.48,0,
   0,0,0, 0,.48,0, .10,.18,.055
  ],3));
  leafGeo.setIndex([0,1,2,3,4,5]);leafGeo.computeVertexNormals();
  const mat=new THREE.MeshPhysicalMaterial({side:THREE.DoubleSide,roughness:.68,clearcoat:.12,vertexColors:false});
  const leaves=new THREE.InstancedMesh(leafGeo,mat,1600);
  leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),axis=new THREE.Vector3();
  const palettes={
   forest:["#245b39","#397b46","#6a9d51","#9ebc67","#d3bd73"],
   meadow:["#548f58","#8eaf6a","#c7bf77","#f0c98b","#d9a5a1"],
   fern:["#174d42","#307765","#5da38b","#91c2a3","#c3d9a3"]
  };
  const data=[];
  for(let i=0;i<1600;i++){
   const y=1-2*(i+.5)/1600,angle=i*2.39996323,r=Math.sqrt(1-y*y);
   const normal=new THREE.Vector3(Math.cos(angle)*r,y,Math.sin(angle)*r);
   data.push({normal,spin:(i*1.618)%6.283,size:.55+((i*47)%101)/160,phase:i*.17});
  }
  const updateLeaves=()=>{
   const {density,palette}=options.current,colors=palettes[palette]||palettes.forest;
   const count=Math.max(100,Math.min(1600,Math.round(density)));
   leaves.count=count;
   for(let i=0;i<count;i++){
    const d=data[i];axis.copy(d.normal);
    dummy.position.copy(axis).multiplyScalar(.81);
    dummy.quaternion.setFromUnitVectors(up,axis);
    dummy.rotateY(d.spin);
    dummy.scale.setScalar(d.size*(.85+(i%7)*.055));
    dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);
    leaves.setColorAt(i,new THREE.Color(colors[i%colors.length]));
   }
   leaves.instanceMatrix.needsUpdate=true;
   if(leaves.instanceColor)leaves.instanceColor.needsUpdate=true;
  };
  let previousDensity=-1,previousPalette="";
  scene.add(leaves);
  const resize=()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  let frame,stopped=false;const start=performance.now();
  const tick=now=>{
   if(stopped)return;
   const o=options.current;
   if(o.density!==previousDensity||o.palette!==previousPalette){updateLeaves();previousDensity=o.density;previousPalette=o.palette;}
   const t=(now-start)*.001,motion=Math.max(0,motionRef?.current??.6),breath=Math.max(0,Math.min(1,breathRef?.current??.4));
   const scale=.89+.17*breath;
   core.scale.setScalar(scale);leaves.scale.setScalar(scale);
   leaves.rotation.y=t*.08*motion;core.rotation.y=leaves.rotation.y;
   leaves.rotation.z=Math.sin(t*.2)*.065*motion;core.rotation.z=leaves.rotation.z;
   renderer.render(scene,camera);frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);
  return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();leafGeo.dispose();mat.dispose();coreGeo.dispose();coreMat.dispose();env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
 },[breathRef,motionRef]);
 return <div ref={host} style={{width:"100%",height:"100%"}}/>;
}
