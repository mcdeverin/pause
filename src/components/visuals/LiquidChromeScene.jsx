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
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 el.appendChild(renderer.domElement);
 renderer.domElement.style.cssText="width:100%;height:100%;display:block";
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,30);camera.position.z=4.4;
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room);
 room.dispose();scene.environment=env.texture;
 const lights=[[0xffffff,50,-3,4,5],[0x9dffe1,30,3,-1,3],[0xffa5f1,30,-3,-2,4]];
 lights.forEach(([color,intensity,x,y,z])=>{const light=new THREE.PointLight(color,intensity,12);light.position.set(x,y,z);scene.add(light);});
 const geometry=new THREE.SphereGeometry(1,80,60),position=geometry.attributes.position,base=position.array.slice();
 const material=new THREE.MeshPhysicalMaterial({color:0xd6d9df,metalness:.82,roughness:.2,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:2.4});
 const mesh=new THREE.Mesh(geometry,material);scene.add(mesh);
 const vertices=Array.from({length:position.count},(_,i)=>{
 const k=i*3,x=base[k],y=base[k+1],z=base[k+2];
 const a=Math.atan2(z,x),lat=Math.asin(THREE.MathUtils.clamp(y,-1,1));
 return {x,y,z,a,lat,fade:Math.pow(Math.max(0,1-y*y),1.2)};
 });
 const resize=()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
 const observer=new ResizeObserver(resize);observer.observe(el);resize();
 let frame,stopped=false,lastGeometryUpdate=0;const start=performance.now();
 const tick=now=>{
 if(stopped)return;const t=(now-start)*.001,motion=motionRef?.current??.6,breath=breathRef?.current??.4;
 if(now-lastGeometryUpdate>33){
 lastGeometryUpdate=now;
 const depth=Math.min(.26,Math.max(0,settings.current.depth));
 for(let i=0;i<vertices.length;i++){
 const {x,y,z,a,lat,fade}=vertices[i],k=i*3;
 const wave=Math.sin(4*a+lat*2.6+t*.42*motion)*.7+Math.sin(2*a-lat*3.1-t*.29*motion)*.3;
 const radius=(1+depth*fade*wave)*(.9+.18*breath);
 position.array[k]=x*radius;position.array[k+1]=y*radius;position.array[k+2]=z*radius;
 }
 position.needsUpdate=true;geometry.computeVertexNormals();
 const normals=geometry.attributes.normal,cols=81;
 for(let row=1;row<60;row++){
 const a=row*cols,b=a+cols-1;
 const nx=normals.getX(a)+normals.getX(b),ny=normals.getY(a)+normals.getY(b),nz=normals.getZ(a)+normals.getZ(b),len=Math.hypot(nx,ny,nz)||1;
 normals.setXYZ(a,nx/len,ny/len,nz/len);normals.setXYZ(b,nx/len,ny/len,nz/len);
 }
 normals.needsUpdate=true;
 }
 mesh.rotation.y=t*.15*motion;
 mesh.rotation.z=Math.sin(t*.23)*.075*motion;
 renderer.render(scene,camera);frame=requestAnimationFrame(tick);
 };
 frame=requestAnimationFrame(tick);
 return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();geometry.dispose();material.dispose();env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
 },[breathRef,motionRef]);
 return <div ref={host} style={{width:"100%",height:"100%"}}/>;
}
