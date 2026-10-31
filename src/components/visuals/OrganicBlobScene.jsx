import { useEffect, useRef } from "react";
import * as THREE from "three";

// Original procedural blob study inspired by organic surface deformation.
// Intentionally independent of the Blobmixer source and production visuals.
export default function OrganicBlobScene({ breathRef, motionRef }) {
  const host = useRef(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (error) {
      console.warn("Organic Blob WebGL unavailable", error);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
    camera.position.set(0, 0, 4.6);
    scene.add(new THREE.HemisphereLight(0xf4f8ff, 0xb0a2c5, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const fill = new THREE.PointLight(0xb9d9ff, 38, 12);
    fill.position.set(3, 1, 3);
    scene.add(fill);
    const rose = new THREE.PointLight(0xffb6dc, 22, 12);
    rose.position.set(-3, -2, 2);
    scene.add(rose);

    const geometry = new THREE.SphereGeometry(1, 160, 112);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xe8d7f6,
      metalness: .12,
      roughness: .17,
      clearcoat: 1,
      clearcoatRoughness: .12,
      iridescence: .95,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 430],
      side: THREE.FrontSide,
    });
    const uniforms = { time: { value: 0 }, breath: { value: .4 }, motion: { value: .6 } };
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, { uBlobTime: uniforms.time, uBlobBreath: uniforms.breath, uBlobMotion: uniforms.motion });
      shader.vertexShader = `
        uniform float uBlobTime;
        uniform float uBlobBreath;
        uniform float uBlobMotion;
        float blobWave(vec3 p) {
          float t = uBlobTime * (.16 + .35 * uBlobMotion);
          float broad = sin(p.x * 3.1 + t) * cos(p.y * 2.6 - t * .7);
          broad += .55 * sin(p.y * 4.4 + p.z * 2.7 - t * 1.2);
          broad += .32 * cos(p.z * 5.3 - p.x * 3.2 + t * .8);
          return broad;
        }
        vec3 blobDeform(vec3 p) {
          float strength = .14 + .045 * uBlobMotion;
          return p * (1.0 + strength * blobWave(normalize(p)));
        }
      ` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
         vec3 pA = blobDeform(position + vec3(.004, 0., 0.));
         vec3 pB = blobDeform(position + vec3(0., .004, 0.));
         vec3 pC = blobDeform(position + vec3(0., 0., .004));
         vec3 dx = pA - blobDeform(position);
         vec3 dy = pB - blobDeform(position);
         vec3 dz = pC - blobDeform(position);
         vec3 correctedNormal = normalize(vec3(
           dot(cross(dy, dz), objectNormal),
           dot(cross(dz, dx), objectNormal),
           dot(cross(dx, dy), objectNormal)
         ));
         // Finite-difference radial derivative approximation for smooth lighting.
         objectNormal = normalize(mix(objectNormal, correctedNormal, .45));`
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         transformed = blobDeform(position) * (0.88 + .24 * uBlobBreath);`
      );
    };
    material.customProgramCacheKey = () => "organic-blob-studio-v1";
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    let frame = 0, stopped = false;
    const resize = () => {
      const width = Math.max(1, element.clientWidth);
      const height = Math.max(1, element.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const start = performance.now();
    const animate = now => {
      if (stopped) return;
      uniforms.time.value = (now - start) / 1000;
      uniforms.breath.value = Math.max(0, Math.min(1, breathRef?.current ?? .4));
      uniforms.motion.value = Math.max(0, Math.min(1, motionRef?.current ?? .6));
      mesh.rotation.y = uniforms.time.value * .09 * uniforms.motion.value;
      mesh.rotation.z = Math.sin(uniforms.time.value * .12) * .08 * uniforms.motion.value;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [breathRef, motionRef]);
  return <div ref={host} style={{ width: "100%", height: "100%" }} />;
}
