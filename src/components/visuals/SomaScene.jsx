import { useEffect, useRef } from "react";
import * as THREE from "three";

// Original tactile gradient and swirling particle sphere for Sensory Studio.
export default function SomaScene({ softness=0.7, depth=0.55, paused=false, motion=0.6 }) {
 const host=useRef(null),options=useRef({softness,depth,paused,motion});
 options.current={softness,depth,paused,motion};
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.style.cssText="display:block;width:100%;height:100%;touch-action:none";
  el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);
  camera.position.z=2;
  const uniforms={uTime:{value:0},uTouch:{value:new THREE.Vector2(-10,-10)},uPress:{value:0},uSoftness:{value:.7},uDepth:{value:.55},uAspect:{value:1},uMotion:{value:.6}};
  const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,fragmentShader:`
   precision highp float;
   varying vec2 vUv;
   uniform float uTime,uPress,uSoftness,uDepth,uAspect,uMotion;
   uniform vec2 uTouch;
   void main(){
    vec2 p=vUv;vec2 d=(p-uTouch)*vec2(uAspect,1.);
    float radius=length(d);
    float spread=mix(.12,.38,uSoftness);
    float dent=exp(-radius*radius/(spread*spread))*uPress*uDepth;
    vec2 shifted=p+d*dent*.10;
    float wave=sin(radius*32.-uTime*5.)*exp(-radius*12.)*uPress*.028;
    shifted+=normalize(d+vec2(.0001))*wave;
    vec3 peach=vec3(1.,.68,.48),pink=vec3(1.,.51,.60),cream=vec3(1.,.89,.68);
    vec3 col=mix(peach,pink,smoothstep(.15,1.15,shifted.y+shifted.x*.24));
    col=mix(col,cream,smoothstep(.45,1.1,shifted.x-shifted.y*.6)*.5);
    col*=1.-dent*.36;
    col+=vec3(1.,.75,.62)*exp(-pow((radius-spread*.62)/(.024+.018*uSoftness),2.))*dent*.34;
    float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
    col+=(grain-.5)*.012;
    gl_FragColor=vec4(col,1.);
   }`});
  const background=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);
  scene.add(background);
  // Particle orb: points on nested spherical shells, with dense drifting coral clouds.
  const count=13000,positions=new Float32Array(count*3),colors=new Float32Array(count*3),sizes=new Float32Array(count);
  const random=(i,k)=>{const n=Math.sin(i*127.1+k*311.7)*43758.5453;return n-Math.floor(n);};
  for(let i=0;i<count;i++){
   const theta=random(i,1)*Math.PI*2,z=random(i,2)*2-1,rad=Math.sqrt(1-z*z);
   const r=.55+Math.pow(random(i,3),.4)*.45;
   const idx=i*3;
   positions[idx]=Math.cos(theta)*rad*r;positions[idx+1]=z*r;positions[idx+2]=Math.sin(theta)*rad*r;
   const hue=random(i,4);
   colors[idx]=1;colors[idx+1]=.19+hue*.35;colors[idx+2]=.18+hue*.28;
   sizes[i]=random(i,5)>.91?2.6:1.0;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute("position",new THREE.BufferAttribute(positions,3));
  geo.setAttribute("color",new THREE.BufferAttribute(colors,3));
  geo.setAttribute("aSize",new THREE.BufferAttribute(sizes,1));
  const orbUniforms={uTime:uniforms.uTime,uTouch:uniforms.uTouch,uPress:uniforms.uPress,uMotion:uniforms.uMotion};
  const particles=new THREE.ShaderMaterial({uniforms:orbUniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`
   attribute float aSize;varying vec3 vColor;
   uniform float uTime,uPress,uMotion;uniform vec2 uTouch;
   void main(){
    vColor=color;
    vec3 p=position;
    float twist=.28*sin(p.y*5.+uTime*.14*uMotion)+.22*cos(p.z*4.-uTime*.2*uMotion);
    float a=twist+uTime*.055*uMotion;
    p.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;
    p+=normalize(p+vec3(.001))*.015*sin(uTime*.8+p.y*18.);
    vec4 mv=modelViewMatrix*vec4(p,1.);
    gl_Position=projectionMatrix*mv;
    gl_PointSize=min(5.,aSize*(1.2+1.2*(p.z+1.)));`
   ,fragmentShader:`varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5);float alpha=1.-smoothstep(.22,.5,d);gl_FragColor=vec4(vColor,alpha*.83);}`,vertexColors:true});
  const points=new THREE.Points(geo,particles);
  points.position.set(-.36,.02,0);points.scale.setScalar(.76);
  scene.add(points);
  const halo=new THREE.Mesh(new THREE.CircleGeometry(.79,96),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;void main(){float r=length(vUv-.5)*2.;float edge=smoothstep(.75,1.,r);vec3 c=mix(vec3(1.,.48,.46),vec3(1.,.94,.82),edge);gl_FragColor=vec4(c,.14*(1.-smoothstep(.95,1.,r))+.27*exp(-pow((r-.97)/.022,2.)));}`}));
  halo.position.set(-.36,.02,-.05);scene.add(halo);
  let pressing=false,frame,previous=performance.now(),elapsed=0,pressLevel=0;
  const touch=e=>{const rect=el.getBoundingClientRect();uniforms.uTouch.value.set((e.clientX-rect.left)/rect.width,1-(e.clientY-rect.top)/rect.height);};
  const down=e=>{pressing=true;touch(e);el.setPointerCapture?.(e.pointerId);};
  const move=e=>touch(e);
  const up=()=>{pressing=false;};
  const leave=()=>{if(!pressing)uniforms.uTouch.value.set(-10,-10);};
  el.addEventListener("pointerdown",down);el.addEventListener("pointermove",move);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up);el.addEventListener("pointerleave",leave);
  const resize=()=>{const w=el.clientWidth||1,h=el.clientHeight||1;renderer.setSize(w,h,false);uniforms.uAspect.value=w/h;camera.left=-w/h;camera.right=w/h;camera.top=1;camera.bottom=-1;camera.updateProjectionMatrix();background.scale.x=w/h;};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const tick=now=>{const dt=Math.min(.05,(now-previous)/1000);previous=now;const o=options.current;if(!o.paused)elapsed+=dt;
   pressLevel+=( (pressing?1:0)-pressLevel)*Math.min(1,dt*(pressing?12:3.2));
   uniforms.uTime.value=elapsed;uniforms.uPress.value=pressLevel;uniforms.uSoftness.value=o.softness;uniforms.uDepth.value=o.depth;uniforms.uMotion.value=o.motion;
   points.rotation.y=elapsed*.035*o.motion;points.rotation.z=Math.sin(elapsed*.15)*.07;
   renderer.render(scene,camera);frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();el.removeEventListener("pointerdown",down);el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);el.removeEventListener("pointerleave",leave);geo.dispose();particles.dispose();halo.geometry.dispose();halo.material.dispose();background.geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div ref={host} style={{width:"100%",height:"100%"}}/>;
}