import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Experimental 3D crystal. A rigid, faceted gemstone: no noise or liquid deformation.
// Breathing changes scale; slow rotation and moving light reveal the facets.
export const CRYSTAL_DEFAULTS = {
  tint: "#f4f8ff",
  edge: "#c5d4e4",
  facets: 2,
  opacity: 1,
  roughness: 0.015,
  metalness: 0,
  transmission: 0.97,
  dispersion: 0.16,
  ior: 1.52,
  thickness: 2.5,
  edges: 0.06,
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
  dark = false,
  testPattern = false,
}) {
  const hostRef = useRef(null);
  const settingsRef = useRef(settings);
  const activeRef = useRef(animate && !reducedMotion);
  const breathRef = useRef(breath);
  const darkRef = useRef(dark);
  const patternRef = useRef(testPattern);
  const [failed, setFailed] = useState(false);
  settingsRef.current = settings;
  activeRef.current = animate && !reducedMotion;
  breathRef.current = breath;
  darkRef.current = dark;
  patternRef.current = testPattern;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let renderer, observer, frame = 0, disposed = false;
    let pmrem, room, environment;
    let geometry, edgesGeometry, backdropGeometry, backdropMaterial, backdropTexture;
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
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;
      // A matching scene backdrop gives the transmission pass something to refract.
      // The final app integration will need its actual background rendered here.
      scene.background = null;
      // Put the test artwork inside WebGL, behind the glass, so the
      // transmission pass can actually refract its pixels.
      const patternCanvas = document.createElement("canvas");
      patternCanvas.width = 1024;
      patternCanvas.height = 1024;
      const ctx = patternCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#f3f0f6";
        ctx.fillRect(0, 0, 1024, 1024);
        ctx.strokeStyle = "#a9a1bd";
        ctx.lineWidth = 5;
        for (let x = -1024; x < 2048; x += 90) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 460, 1024); ctx.stroke();
        }
        ctx.fillStyle = "#6b607e";
        ctx.font = "600 66px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ALWAYS PAUSE", 512, 410);
        ctx.font = "38px sans-serif";
        ctx.fillText("GLASS REFRACTION TEST", 512, 625);
      }
      backdropTexture = new THREE.CanvasTexture(patternCanvas);
      backdropTexture.colorSpace = THREE.SRGBColorSpace;
      backdropGeometry = new THREE.PlaneGeometry(28, 28);
      backdropMaterial = new THREE.MeshBasicMaterial({ map: backdropTexture, toneMapped: false });
      const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
      backdrop.position.z = -5;
      backdrop.visible = testPattern;
      scene.add(backdrop);
      pmrem = new THREE.PMREMGenerator(renderer);
      room = new RoomEnvironment();
      environment = pmrem.fromScene(room);
      scene.environment = environment.texture;
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
        thickness: CRYSTAL_DEFAULTS.thickness,
        dispersion: CRYSTAL_DEFAULTS.dispersion,
        ior: CRYSTAL_DEFAULTS.ior,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        flatShading: true,
        transparent: false,
        opacity: 1,
        side: THREE.FrontSide,
      });
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: CRYSTAL_DEFAULTS.edge,
        transparent: true,
        opacity: CRYSTAL_DEFAULTS.edges,
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
        backdropGeometry?.dispose();
      backdropMaterial?.dispose();
      backdropTexture?.dispose();
      geometry?.dispose();
        edgesGeometry?.dispose();
        geometry = new THREE.IcosahedronGeometry(3.05, level);
        // Split faces for hard normals, giving each cut a separate reflection.
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
          shellMaterial.opacity = 1;
          shellMaterial.dispersion = s.dispersion ?? 0.16;
          shellMaterial.ior = s.ior ?? 1.52;
          shellMaterial.thickness = s.thickness ?? 2.5;
          edgeMaterial.opacity = s.edges ?? 0.06;
          shellMaterial.roughness = s.roughness ?? 0.015;
          shellMaterial.metalness = s.metalness ?? 0;
          shellMaterial.transmission = s.transmission ?? 0.97;
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
      environment?.dispose();
      room?.dispose();
      pmrem?.dispose();
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
