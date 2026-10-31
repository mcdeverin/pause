import { useEffect, useRef } from "react";
import * as THREE from "three";

// Native Three.js scene: no React Three Fiber or Drei dependency.
// Existing React Three Fiber prototypes remain in Git history.
export default function ShapeScene({ kind, breathRef, motionRef, background = "photo", photoUrl }) {
  const host = useRef(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer, frame = 0, disposed = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 4.5;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.setClearColor(0x000000, 0);
      element.appendChild(renderer.domElement);
    } catch (error) {
      console.error("Three.js renderer unavailable", error);
      return;
    }
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const light = new THREE.DirectionalLight(0xffffff, 2.4);
    light.position.set(3, 5, 5);
    scene.add(light);
    const pink = new THREE.PointLight(0xf3b7d4, 3);
    pink.position.set(-3, -2, 3);
    scene.add(pink);
    const group = new THREE.Group();
    scene.add(group);
    const objects = [];
    const geometry = new THREE.SphereGeometry(1, 32, 24);
    const colors = ["#bdb1e9", "#d7d7f5", "#f6cbd9", "#badfe5"];
    let backdropMesh = null;
    let backdropTexture = null;
    let backdropAspect = 1;
    let environment = null;
    let ribbonGeometry = null;
    let particleGeometry = null;
    let particleMaterial = null;
    let particleBase = null;
    let particles = null;
    if (kind === "ribbon") {
      const points = [];
      for (let i = 0; i <= 220; i++) {
        const t = i / 220 * Math.PI * 8;
        const radius = .38 + .085 * Math.sin(t * 2);
        points.push(new THREE.Vector3(Math.cos(t) * radius, (i / 220 - .5) * 2.25, Math.sin(t) * radius));
      }
      ribbonGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 400, .075, 9, false);
      group.add(new THREE.Mesh(ribbonGeometry, new THREE.MeshPhysicalMaterial({ color: "#d8b9e8", metalness: .28, roughness: .2, clearcoat: 1, side: THREE.DoubleSide })));
    } else if (kind === "particles") {
      const count = 1700;
      particleBase = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const phi = i * 2.3999632, y = 1 - 2 * (i + .5) / count, radius = Math.sqrt(1 - y * y);
        particleBase[i * 3] = Math.cos(phi) * radius;
        particleBase[i * 3 + 1] = y;
        particleBase[i * 3 + 2] = Math.sin(phi) * radius;
      }
      particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(particleBase), 3));
      particleMaterial = new THREE.PointsMaterial({ color: "#cbbbed", size: .026, sizeAttenuation: true, transparent: true, opacity: .9, depthWrite: false });
      particles = new THREE.Points(particleGeometry, particleMaterial);
      group.add(particles);
    } else {
      const droplets = kind === "droplets" || kind === "dropletsSingle" || kind === "dropletsHalo";
      const count = droplets ? 140 : 46;
      if (droplets) { camera.fov = 60; camera.position.z = 3; camera.updateProjectionMatrix(); }
      const material = droplets
        ? new THREE.MeshPhysicalMaterial({
            color: 0xffffff, metalness: 0, roughness: 0.015,
            transmission: 1, thickness: 1.2, ior: 1.33,
            clearcoat: 1, clearcoatRoughness: 0.01,
            transparent: false, depthWrite: true
          })
        : null;
      if (droplets) {
        // Three.js transmission samples the actual scene behind the glass.
        // Never use the Park3Med cubemap: it cannot match the selected photo.
        const canvas = document.createElement("canvas");
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
        if (background === "dark") {
          gradient.addColorStop(0, "#414956"); gradient.addColorStop(1, "#11151c");
        } else {
          gradient.addColorStop(0, "#fdfcfa"); gradient.addColorStop(1, "#e3ddef");
        }
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 1024);
        backdropTexture = new THREE.CanvasTexture(canvas);
        backdropTexture.colorSpace = THREE.SRGBColorSpace;
        const planeMaterial = new THREE.MeshBasicMaterial({ map: backdropTexture, side: THREE.DoubleSide, toneMapped: false });
        backdropMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), planeMaterial);
        backdropMesh.position.z = -8;
        scene.add(backdropMesh);
        if (background === "photo" && photoUrl) {
          const image = new Image();
          image.crossOrigin = "anonymous";
          image.onload = () => {
            if (disposed) return;
            const width = image.naturalWidth, height = image.naturalHeight;
            if (!width || !height) return;
            // Draw a center-cropped, square cover image; UV cropping below
            // adjusts it again to the card aspect ratio.
            const scale = Math.max(1024 / width, 1024 / height);
            ctx.drawImage(image, (1024 - width * scale) / 2, (1024 - height * scale) / 2, width * scale, height * scale);
            backdropTexture.needsUpdate = true;
          };
          image.onerror = () => console.warn("Nature photo could not be loaded for glass refraction", photoUrl);
          image.src = photoUrl;
        }
      }
      for (let i = 0; i < count; i++) {
        const angle = i * 2.399963229728653;
        const y = 1 - 2 * (i + .5) / count;
        const radius = Math.sqrt(1 - y * y);
        const spec = droplets
          ? { x: (Math.sin(i * 127.1) * 43758.5453 % 1) * 5, y: (Math.sin(i * 311.7) * 15731.743 % 1) * 5, z: -1.5 - (i % 11) * .34, size: .1 * (1 + (i % 7) / 3) }
          : { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, size: .11 + (i % 5) * .018 };
        const mat = material || new THREE.MeshPhysicalMaterial({ color: colors[i % 4], metalness: .08, roughness: .12, clearcoat: 1, transparent: true, opacity: .94 });
        const mesh = new THREE.Mesh(geometry, mat);
        group.add(mesh);
        objects.push({ mesh, spec, index: i });
      }
    }
    const resize = () => {
      if (!renderer || !element.isConnected) return;
      const width = Math.max(1, element.clientWidth), height = Math.max(1, element.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (backdropMesh) {
        const distance = camera.position.z - backdropMesh.position.z;
        const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
        backdropMesh.scale.set(visibleHeight * camera.aspect, visibleHeight, 1);
        const uv = backdropTexture;
        if (camera.aspect > 1) { uv.repeat.set(1, 1 / camera.aspect); uv.offset.set(0, (1 - 1 / camera.aspect) / 2); }
        else { uv.repeat.set(camera.aspect, 1); uv.offset.set((1 - camera.aspect) / 2, 0); }
        uv.needsUpdate = true;
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const dropletsMode = kind === "droplets" || kind === "dropletsSingle" || kind === "dropletsHalo";
    const start = performance.now();
    let last = start;
    const animate = now => {
      if (disposed) return;
      const dt = Math.min((now - last) / 1000, .06);
      last = now;
      const t = (now - start) / 1000;
      const b = Math.max(0, Math.min(1, breathRef.current ?? .4));
      const motion = motionRef.current ?? .6;
      group.rotation.y += dropletsMode ? 0 : dt * (kind === "ribbon" ? .18 : .085) * motion;
      if (kind === "ribbon") {
        group.rotation.z = Math.sin(t * .22) * .16 * motion;
        group.scale.set(.82 + b * .45, .78 + b * .28, .82 + b * .45);
      } else if (kind === "particles") {
        const position = particleGeometry.attributes.position;
        for (let i = 0; i < particleBase.length; i += 3) {
          const mod = 1 + .05 * Math.sin(t * .55 + i / 3 * .1) * motion;
          const scale = (.76 + b * .52) * mod;
          position.array[i] = particleBase[i] * scale;
          position.array[i + 1] = particleBase[i + 1] * scale;
          position.array[i + 2] = particleBase[i + 2] * scale;
        }
        position.needsUpdate = true;
      } else {
        for (const { mesh, spec, index } of objects) {
          if (dropletsMode) {
            const expand = .92 + b * .12;
            mesh.position.set(spec.x * expand, spec.y * expand, spec.z * expand);
            mesh.scale.setScalar(spec.size * (1 + b * .18));
          } else {
            const swell = .82 + b * .34 + Math.sin(t * .7 + index * .7) * .035 * motion;
            mesh.position.set(spec.x * swell, spec.y * swell, spec.z * swell);
            mesh.scale.setScalar(spec.size * (1 + b * .15));
          }
        }
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      group.traverse(object => { if (object.material && object.material !== undefined) { const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(mat => mat.dispose()); } });
      geometry.dispose();
      ribbonGeometry?.dispose();
      particleGeometry?.dispose();
      particleMaterial?.dispose();
      environment?.dispose();
      if (backdropMesh) { backdropMesh.geometry.dispose(); backdropMesh.material.dispose(); }
      backdropTexture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind, breathRef, motionRef, background, photoUrl]);
  return <div ref={host} style={{ width: "100%", height: "100%" }} />;
}
