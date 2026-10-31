import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
export default function LiquidChromeScene({breathRef,motionRef,depth=.2}){
 const host=useRef(null),settings=useRef({});settings.current={depth};
 useEffect(()=>{
 const el=host.current;if(!el)return;
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 el.appendChild(renderer.domElement);
 renderer.domElement.style.cssText="width:100%;height:100%;display:block";
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,30);camera.position.z=4.4;
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room);
 room.dispose();scene.environment=env.texture;
 const lights=[[0xffffff,50,-3,4,5],[0x9dffe1,30,3,-1,3],[0xffa5f1,30,-3,-2,4]];
 lights.forEach(([color,intensity,x,y,z])=>{const light=new THREE.PointLight(color,intensity,12);light.position.set(x,y,z);scene.add(light);});
 const geometry=new THREE.SphereGeometry(1,128,96),position=geometry.attributes.position,base=position.array.slice();
 const material=new THREE.MeshPhysicalMaterial({color:0xc5c6c9,metalness:1,roughness:.14,clearcoat:1,envMapIntensity:2});
 const mesh=new THREE.Mesh(geometry,material);scene.add(mesh);
 const resize=()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
 const observer=new ResizeObserver(resize);observer.observe(el);resize();
 let frame,stopped=false;const start=performance.now();
 const tick=now=>{
 if(stopped)return;const t=(now-start)*.001,motion=motionRef?.current??.6,breath=breathRef?.current??.4;
 for(let i=0;i<position.count;i++){
 const k=i*3,x=base[k],y=base[k+1],z=base[k+2],a=Math.atan2(z,x),lat=Math.asin(y);
 const fade=Math.pow(Math.max(0,1-y*y),1.2);
 const wave=Math.sin(4*a+lat*2.6+t*.13*motion)*.7+Math.sin(2*a-lat*3.1-t*.09*motion)*.3;
 const r=(1+Math.min(.35,settings.current.depth)*fade*wave)*(.9+.18*breath);
 position.array[k]=x*r;position.array[k+1]=y*r;position.array[k+2]=z*r;
 }
 position.needsUpdate=true;geometry.computeVertexNormals();
 mesh.rotation.y=t*.07*motion;renderer.render(scene,camera);frame=requestAnimationFrame(tick);
 };
 frame=requestAnimationFrame(tick);
 return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();geometry.dispose();material.dispose();env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
 },[breathRef,motionRef]);
 return <div ref={host} style={{width:"100%",height:"100%"}}/>;
}
