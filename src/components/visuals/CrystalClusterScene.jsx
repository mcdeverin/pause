import { useEffect, useRef } from "react";
import * as THREE from "three";

// Connected faceted crystal forms built from BufferGeometry, with flat normals.
function crystalGeometry(radius, height, sides = 6) {
  const positions = [];
  const add = (a,b,c) => positions.push(...a,...b,...c);
  const ring = (y,r,offset=0) => Array.from({length:sides},(_,i)=>{const a=i*Math.PI*2/sides+offset;return [Math.cos(a)*r,y,Math.sin(a)*r];});
  const bottom=ring(-height*.42,radius*.64), middle=ring(-height*.16,radius), top=ring(height*.32,radius*.9);
  for(let i=0;i<sides;i++){const j=(i+1)%sides;add(bottom[i],middle[j],middle[i]);add(bottom[i],bottom[j],middle[j]);add(middle[i],middle[j],top[j]);add(middle[i],top[j],top[i]);add(top[i],top[j],[0,height*.58,0]);add([0,-height*.48,0],bottom[j],bottom[i]);}
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  geometry.computeVertexNormals();
  return geometry;
}
export default function CrystalClusterScene({breathRef, background="photo", photoUrl}) {
  const host=useRef(null);
  useEffect(()=>{
    const el=host.current;if(!el)return;
    let disposed=false,frame=0,texture=null;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,30);
    camera.position.set(0,.1,5.7);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
    renderer.setSize(Math.max(1,el.clientWidth),Math.max(1,el.clientHeight),false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff,2.1));
    const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(2,4,5);scene.add(key);
    const fill=new THREE.DirectionalLight(0xb4b8ff,2);fill.position.set(-3,-1,2);scene.add(fill);
    const group=new THREE.Group();scene.add(group);
    const materials=["#f1e9ff","#d8eafa","#f7e4ef","#d5f3ee"].map(color=>new THREE.MeshPhysicalMaterial({color,metalness:0,roughness:.06,transmission:.86,thickness:1.1,ior:1.48,clearcoat:1,clearcoatRoughness:.04,flatShading:true,side:THREE.DoubleSide}));
    const pieces=[];
    for(let i=0;i<19;i++){
      const angle=i*2.39996323,ring=Math.sqrt((i+.3)/19);
      const height=.85+(i%5)*.18,radius=.19+(i%4)*.035;
      const geometry=crystalGeometry(radius,height,5+(i%3));
      const mesh=new THREE.Mesh(geometry,materials[i%materials.length]);
      const base=new THREE.Vector3(Math.cos(angle)*ring*.88,Math.sin(angle)*ring*.7,Math.sin(i*1.7)*.25);
      mesh.position.copy(base);
      mesh.rotation.set(Math.sin(i*2)*.3,angle*.2,Math.cos(i*1.6)*.36);
      group.add(mesh);pieces.push({mesh,base});
    }
    let backdrop=null;
    if(background==="photo"&&photoUrl){
      const loader=new THREE.TextureLoader();loader.setCrossOrigin("anonymous");
      loader.load(photoUrl,t=>{if(disposed){t.dispose();return;}texture=t;t.colorSpace=THREE.SRGBColorSpace;
        backdrop=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshBasicMaterial({map:t,depthWrite:false}));
        backdrop.position.z=-4;scene.add(backdrop);
      },undefined,()=>{});
    }
    const resize=()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
    const observer=new ResizeObserver(resize);observer.observe(el);resize();
    const tick=()=>{if(disposed)return;const b=THREE.MathUtils.clamp(breathRef.current??.4,0,1);
      for(const {mesh,base} of pieces){const expansion=.89+b*.18;mesh.position.copy(base).multiplyScalar(expansion);mesh.scale.setScalar(.92+b*.16);}
      renderer.render(scene,camera);frame=requestAnimationFrame(tick);
    };frame=requestAnimationFrame(tick);
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();pieces.forEach(({mesh})=>mesh.geometry.dispose());materials.forEach(m=>m.dispose());if(backdrop){backdrop.geometry.dispose();backdrop.material.dispose();}texture?.dispose();renderer.dispose();renderer.domElement.remove();};
  },[breathRef,background,photoUrl]);
  return <div ref={host} style={{width:"100%",height:"100%"}}/>;
}
