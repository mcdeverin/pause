import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Independent, procedural iridescent sculpture study. No third-party assets.
export default function IridescentBlobScene({ breathRef, motionRef, waves = 3.4, depth = .36, twist = 1.6 }) {
 const host = useRef(null), settings = useRef({});
 settings.current = { waves, depth, twist };
 useEffect(() => {
  const el = host.current;
  if (!el) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
  catch (e) { console.warn("Iridescent Blob unavailable", e); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, 1, .1, 50);
  camera.position.z = 4.7;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, .05);
  room.dispose();
  scene.environment = env.texture;
  scene.add(new THREE.HemisphereLight(0xe5faff, 0x6152b9, 2.2));
  const addLight = (color, intensity, x, y, z) => {
   const light = new THREE.PointLight(color, intensity, 12);
   light.position.set(x, y, z); scene.add(light);
  };
  addLight(0xffffff, 55, -3, 5, 5);
  addLight(0xff7de9, 40, 3, -2, 4);
  addLight(0x5a9fff, 35, -4, -2, 3);
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#9ce7ed"; ctx.fillRect(0, 0, 512, 512);
  const spots = [
   [130,120,225,"#9ce6f0"],[360,160,230,"#f3a4ec"],
   [260,350,230,"#7d62ef"],[440,430,180,"#f8d58a"],
   [60,430,180,"#bbadff"],[270,230,135,"#eafaff"]
  ];
  for (const [x,y,r,col] of spots) {
   const g=ctx.createRadialGradient(x,y,0,x,y,r);
   g.addColorStop(0,col); g.addColorStop(1,"#9ce7ed00");
   ctx.fillStyle=g; ctx.fillRect(0,0,512,512);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.SphereGeometry(1, 128, 96);
  const original = new Float32Array(geo.attributes.position.array);
  const pos = geo.attributes.position;
  const material = new THREE.MeshPhysicalMaterial({
   map:texture,metalness:.68,roughness:.27,clearcoat:.85,
   clearcoatRoughness:.12,iridescence:.65,iridescenceIOR:1.4,
   iridescenceThicknessRange:[150,420],envMapIntensity:1.25
  });
  const mesh = new THREE.Mesh(geo,material);
  scene.add(mesh);
  let frame, stopped=false;
  const resize=()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);
   camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const start=performance.now();
  const animate=(now)=>{
   if(stopped)return;
   const t=(now-start)*.001, motion=Math.max(0,motionRef?.current??.6);
   const breath=Math.max(0,Math.min(1,breathRef?.current??.4));
   const {waves,depth,twist}=settings.current;
   for(let i=0;i<pos.count;i++){
    const k=i*3,x=original[k],y=original[k+1],z=original[k+2];
    const a=Math.atan2(z,x),lat=Math.asin(Math.max(-1,Math.min(1,y)));
    // Longitude must be periodic: fractional angular frequencies split the sphere at its UV seam.
    // Blend adjacent whole-number harmonics instead of multiplying longitude by a fractional count.
    const n=Math.max(1,Math.min(8,waves));
    const low=Math.floor(n),high=Math.min(8,low+1),blend=n-low;
    const swirl=lat*twist*2.1+t*.12*motion;
    const primary=THREE.MathUtils.lerp(Math.sin(low*a+swirl),Math.sin(high*a+swirl),blend);
    const secondary=Math.sin(2*a-lat*3.1+t*.09*motion);
    // Longitude is undefined at the poles. Fade all angular waves to zero there,
    // otherwise the top/bottom vertices pull apart into visible triangular slits.
    const poleFade=Math.pow(Math.max(0,1-y*y),1.15);
    const folds=(.72*primary+.22*secondary)*poleFade;
    const bulge=.055*Math.sin(4*lat+3*a+t*.17*motion)*poleFade;
    const safeDepth=Math.min(depth,.42);
    const radius=(1+safeDepth*folds+bulge)*(.89+.2*breath);
    pos.array[k]=x*radius;pos.array[k+1]=y*radius;pos.array[k+2]=z*radius;
   }
   pos.needsUpdate=true;geo.computeVertexNormals();
   // SphereGeometry duplicates vertices along its UV seam. Average their normals
   // so a continuous surface does not display a sharp lighting crease.
   const normals=geo.attributes.normal,columns=129,rows=97;
   for(let row=1;row<rows-1;row++){
    const a=row*columns,b=a+columns-1;
    const nx=(normals.getX(a)+normals.getX(b))*.5;
    const ny=(normals.getY(a)+normals.getY(b))*.5;
    const nz=(normals.getZ(a)+normals.getZ(b))*.5;
    const length=Math.hypot(nx,ny,nz)||1;
    normals.setXYZ(a,nx/length,ny/length,nz/length);
    normals.setXYZ(b,nx/length,ny/length,nz/length);
   }
   normals.needsUpdate=true;
   mesh.rotation.y=t*.085*motion;mesh.rotation.z=Math.sin(t*.15)*.14;
   renderer.render(scene,camera);
   frame=requestAnimationFrame(animate);
  };
  frame=requestAnimationFrame(animate);
  return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();geo.dispose();
   material.dispose();texture.dispose();env.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
 },[breathRef,motionRef]);
 return <div ref={host} style={{width:"100%",height:"100%"}}/>;
}
