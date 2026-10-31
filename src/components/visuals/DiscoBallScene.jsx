import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export default function DiscoBallScene({ speed = .35, paused = false, hue = "pink" }) {
 const host=useRef(null), controls=useRef({speed,paused,hue});
 controls.current={speed,paused,hue};
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.45;
  renderer.domElement.style.cssText="width:100%;height:100%;display:block;touch-action:none";
  el.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,0,9.5);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();
  scene.add(new THREE.AmbientLight(0xffd8ff,1.2));
  const lighting=[["#ff66d4",115,-5,4,4],["#ffe5a0",110,5,0,5],["#8f9cff",100,-3,-3,5],["#ffffff",85,2,6,3]];
  lighting.forEach(([color,intensity,x,y,z])=>{const l=new THREE.PointLight(color,intensity,25);l.position.set(x,y,z);scene.add(l);});
  const ball=new THREE.Group();scene.add(ball);
  const core=new THREE.Mesh(new THREE.SphereGeometry(3.04,48,32),new THREE.MeshStandardMaterial({color:"#77718b",metalness:.9,roughness:.22}));
  ball.add(core);
  const rows=44, radius=3.075;
  const tiles=[];
  for(let row=1;row<rows;row++){
   const theta=Math.PI*row/rows;
   const count=Math.max(8,Math.round(2*Math.PI*Math.sin(theta)*rows/Math.PI));
   for(let col=0;col<count;col++){
    const phi=(col+(row%2)*.5)*Math.PI*2/count;
    const n=new THREE.Vector3(Math.sin(theta)*Math.cos(phi),Math.cos(theta),Math.sin(theta)*Math.sin(phi));
    tiles.push({n,theta,phi,w:2*Math.PI*radius*Math.sin(theta)/count*.91,h:Math.PI*radius/rows*.88,row,col});
   }
  }
  const geo=new THREE.PlaneGeometry(1,1);
  const mat=new THREE.MeshPhysicalMaterial({color:"#ffffff",metalness:.88,roughness:.11,clearcoat:1,clearcoatRoughness:.08,side:THREE.DoubleSide});
  const mesh=new THREE.InstancedMesh(geo,mat,tiles.length);
  mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const dummy=new THREE.Object3D(),color=new THREE.Color(),up=new THREE.Vector3(0,0,1);
  tiles.forEach((tile,i)=>{
   dummy.position.copy(tile.n).multiplyScalar(radius);
   dummy.quaternion.setFromUnitVectors(up,tile.n);
   dummy.scale.set(tile.w,tile.h,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
   const random=Math.sin(i*127.1+tile.row*311.7)*43758.5453;
   const r=random-Math.floor(random);
   color.setHSL((.67+r*.24)%1,.28+r*.28,.54+r*.22);
   mesh.setColorAt(i,color);
  });
  mesh.instanceColor.needsUpdate=true;ball.add(mesh);
  const pointer={x:0,y:0},onMove=e=>{const r=el.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width-.5)*2;pointer.y=((e.clientY-r.top)/r.height-.5)*2;};
  el.addEventListener("pointermove",onMove);
  let frame,previous=performance.now(),rotation=0;
  const resize=()=>{const w=el.clientWidth||1,h=el.clientHeight||1;camera.aspect=w/h;camera.position.z=h>w?11.5:9.5;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const tick=now=>{
   const dt=Math.min(.05,(now-previous)/1000);previous=now;
   if(!controls.current.paused)rotation+=dt*controls.current.speed*.33;
   ball.rotation.y=rotation+pointer.x*.12;
   ball.rotation.x=-.12+pointer.y*.09;
   const tint=controls.current.hue;
   lighting[0] && scene.children.forEach(obj=>{if(obj.isPointLight&&obj.position.x===-5)obj.color.set(tint==="blue"?"#5b9cff":tint==="gold"?"#ffb14b":"#ff66d4");});
   renderer.render(scene,camera);frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();el.removeEventListener("pointermove",onMove);geo.dispose();mat.dispose();core.geometry.dispose();core.material.dispose();env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div ref={host} style={{width:"100%",height:"100%"}}/>;
}