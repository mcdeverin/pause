import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Experimental 3D crystal. A rigid, faceted gemstone: no noise or liquid deformation.
// Breathing changes scale; slow rotation and moving light reveal the facets.
export const CRYSTAL_DEFAULTS = {
  tint: "#d7d9f4",
  edge: "#b0c4df",
  facets: 1,
  opacity: 0.94,
  roughness: 0.12,
  metalness: 0.12,
  transmission: 0.22,
  light: 2.4,
  rotation: 0.25,
  size: 1,
  breathStrength: 0.19,
  breath: 0.5,
};

export default function CrystalPrototype({
  settings = CRYSTAL_DEFAULTS,
  animate = true,
  reducedMotion = false,
  breath,
}) {
  const hostRef = useRef(null);
  const settingsRef = useRef(settings);
  const activeRef = useRef(animate && !reducedMotion);
  const breathRef = useRef(breath);
  const [failed, setFailed] = useState(false);
  settingsRef.current = settings;
  activeRef.current = animate && !reducedMotion;
  breathRef.current = breath;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let renderer, observer, frame = 0, disposed = false;
    let geometry, edgesGeometry;
    const materials = [];
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0, 10.7);

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true, antialias: true, powerPreference: "low-power",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.cssText =
        "display:block;width:100%;height:100%;pointer-events:none";
      host.appendChild(renderer.domElement);

      const gem = new THREE.Group();
      scene.add(gem);
      // An icosahedral cut stays angular as it turns. Rebuilt only when facet detail changes.
      const shellMaterial = new THREE.MeshPhysicalMaterial({
        color: CRYSTAL_DEFAULTS.tint,
        metalness: CRYSTAL_DEFAULTS.metalness,
        roughness: CRYSTAL_DEFAULTS.roughness,
        transmission: CRYSTAL_DEFAULTS.transmission,
        thickness: 1.1,
        ior: 1.48,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        flatShading: true,
        transparent: true,
        opacity: CRYSTAL_DEFAULTS.opacity,
        side: THREE.FrontSide,
      });
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: CRYSTAL_DEFAULTS.edge,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });
      materials.push(shellMaterial, edgeMaterial);
      const shell = new THREE.Mesh(undefined, shellMaterial);
      const lines = new THREE.LineSegments(undefined, edgeMaterial);
      gem.add(shell, lines);

      let detail = -1;
      const rebuild = (next) => {
        const level = THREE.MathUtils.clamp(Math.round(next), 0, 2);
        if (detail === level) return;
        detail = level;
        geometry?.dispose();
        edgesGeometry?.dispose();
        geometry = new THREE.IcosahedronGeometry(3.05, level);
        // Split faces for hard normals, giving each cut a separate reflection.
        geometry = geometry.toNonIndexed ? geometry : geometry;
        geometry.computeVertexNormals();
        edgesGeometry = new THREE.EdgesGeometry(geometry, 17);
        shell.geometry = geometry;
        lines.geometry = edgesGeometry;
      };

      const ambient = new THREE.AmbientLight(0xffffff, 0.95);
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(-4, 6, 8);
      const fill = new THREE.DirectionalLight(0x9ebce8, 1.3);
      fill.position.set(5, -2, 3);
      const blush = new THREE.DirectionalLight(0xf4d2e7, 0.75);
      blush.position.set(0, -5, -2);
      scene.add(ambient, key, fill, blush);

      const resize = () => {
        if (disposed) return;
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(resize);
        observer.observe(host);
      } else {
        window.addEventListener("resize", resize);
      }

      let elapsed = 0;
      let last = performance.now();
      const draw = (now) => {
        if (disposed) return;
        const s = settingsRef.current;
        if (!document.hidden) {
          const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
          if (activeRef.current) elapsed += dt;
          rebuild(s.facets ?? 1);
          shellMaterial.color.set(s.tint ?? CRYSTAL_DEFAULTS.tint);
          edgeMaterial.color.set(s.edge ?? CRYSTAL_DEFAULTS.edge);
          shellMaterial.opacity = s.opacity ?? 0.94;
          shellMaterial.roughness = s.roughness ?? 0.12;
          shellMaterial.metalness = s.metalness ?? 0.12;
          shellMaterial.transmission = s.transmission ?? 0.22;
          key.intensity = s.light ?? 2.4;
          const b = THREE.MathUtils.clamp(breathRef.current ?? s.breath ?? 0.5, 0, 1);
          const scale = (s.size ?? 1) * (0.89 + (s.breathStrength ?? 0.19) * b);
          gem.scale.setScalar(scale);
          gem.rotation.y = activeRef.current ? elapsed * (s.rotation ?? 0.25) : 0.35;
          gem.rotation.x = activeRef.current ? 0.15 + Math.sin(elapsed * 0.13) * 0.12 : 0.18;
          key.position.x = activeRef.current ? -4 + Math.sin(elapsed * 0.24) * 2 : -4;
          renderer.render(scene, camera);
        }
        last = now;
        frame = requestAnimationFrame(draw);
      };
      frame = requestAnimationFrame(draw);
    } catch (error) {
      console.warn("Crystal prototype WebGL unavailable:", error);
      setFailed(true);
    }
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (!observer) window.removeEventListener("resize", resize);
      geometry?.dispose();
      edgesGeometry?.dispose();
      materials.forEach((material) => material.dispose());
      renderer?.dispose();
      renderer?.domElement?.remove();
    };
  }, []);

  return (
    <div aria-hidden="true" style={{ width: "100%", height: "100%", position: "relative" }}>
      {failed && (
        <div style={{
          position: "absolute", inset: "23%", borderRadius: "24%",
          transform: "rotate(45deg)",
          background: "linear-gradient(135deg,#f9fcff,#c6d5ed 48%,#e4cce9)",
          boxShadow: "inset 12px 12px 28px #ffffff88, 0 12px 35px #b7b5cf55",
        }} />
      )}
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
