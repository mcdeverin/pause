import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { drawBackdrop, getBackdropPhoto, PRISMATIC_DEFAULTS } from "@/lib/crystalStudio";

const RADIUS = 3.05;

// A studio built out of emissive panels, baked into an environment map. The long
// strip lights are what a real cut-crystal sphere reflects as crisp highlights.
function createStudioEnvironment(renderer) {
  const envScene = new THREE.Scene();
  const created = [];

  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 64;
  skyCanvas.height = 256;
  const skyCtx = skyCanvas.getContext("2d");
  if (skyCtx) {
    const grad = skyCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.38, "#f4f1fa");
    grad.addColorStop(0.66, "#cfc9dc");
    grad.addColorStop(1, "#6d6879");
    skyCtx.fillStyle = grad;
    skyCtx.fillRect(0, 0, 64, 256);
  }
  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  skyTexture.colorSpace = THREE.SRGBColorSpace;
  const skyGeometry = new THREE.SphereGeometry(70, 32, 24);
  const skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide });
  envScene.add(new THREE.Mesh(skyGeometry, skyMaterial));
  created.push(skyGeometry, skyMaterial, skyTexture);

  const panel = (width, height, color, level, position, rotation) => {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(level),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    envScene.add(mesh);
    created.push(geometry, material);
  };

  panel(34, 34, "#ffffff", 2.6, [0, 40, 4], [Math.PI / 2, 0, 0]);
  panel(7, 46, "#ffffff", 2.2, [-34, 6, 8], [0, Math.PI / 2, 0]);
  panel(5, 40, "#f2e9ff", 1.6, [34, 2, -6], [0, -Math.PI / 2, 0]);
  panel(40, 26, "#cfc6e6", 0.9, [0, 4, -40], [0, Math.PI, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(envScene, 0.03);
  pmrem.dispose();
  created.forEach((item) => item.dispose());
  return target.texture;
}

const RIM_UNIFORMS = {
  uColor: { value: new THREE.Color("#e8f1ff") },
  uStrength: { value: 0.55 },
};

const RIM_VERTEX = `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const RIM_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    float fresnel = pow(1.0 - clamp(abs(dot(vNormalW, vViewDir)), 0.0, 1.0), 3.0);
    gl_FragColor = vec4(uColor * uStrength, fresnel);
  }
`;

// Option A: a rigid, densely faceted glass sphere. Geometry is generated once per
// facet level and shared by the shell and its Fresnel edge, and the facets never
// deform — breathing only scales the whole object.
export default function PrismaticGlass({
  settings = PRISMATIC_DEFAULTS,
  breathRef,
  mode = "light",
  photo = null,
  playing = true,
  quality = "high",
  reducedMotion = false,
  transparentCanvas = false,
  sessionBreathing = false,
}) {
  const hostRef = useRef(null);
  const live = useRef({ settings, breathRef, mode, photo, playing, quality, reducedMotion, transparentCanvas, sessionBreathing });
  live.current = { settings, breathRef, mode, photo, playing, quality, reducedMotion, transparentCanvas, sessionBreathing };
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setFailed(true);
      return undefined;
    }

    const pixelRatioFor = (value) =>
      Math.min(window.devicePixelRatio || 1, value === "high" ? 2 : 1.25);

    let disposed = false;
    let frame = 0;
    let elapsed = 0;
    let last = performance.now();
    let currentBackdrop = null;
    let currentQuality = live.current.quality;
    let detail = -1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
    camera.position.set(0, 0, 10.7);

    renderer.setPixelRatio(pixelRatioFor(currentQuality));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(renderer.domElement);

    const environment = createStudioEnvironment(renderer);
    scene.environment = environment;

    // The artwork lives inside the scene, so the transmission pass refracts it.
    const backdropGeometry = new THREE.PlaneGeometry(1, 1);
    const backdropMaterial = new THREE.MeshBasicMaterial({ toneMapped: false, depthWrite: false });
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.position.z = -8;
    scene.add(backdrop);
    backdrop.visible = !live.current.transparentCanvas;
    let backdropTexture = null;

    // Rebuilt only when the mode or the photograph changes. A photograph decodes
    // asynchronously, so the neutral gradient is painted first and swapped for
    // the photo on the frame it becomes available.
    const applyBackdrop = (nextMode, nextPhoto) => {
      const image = nextMode === "photo" ? getBackdropPhoto(nextPhoto) : null;
      const ready = Boolean(image && image.complete && image.naturalWidth > 0);
      const state =
        nextMode === "photo" ? (ready ? `photo:${nextPhoto}` : "photo:pending") : nextMode;
      if (currentBackdrop === state) return;
      currentBackdrop = state;
      backdropTexture?.dispose();
      backdropTexture = new THREE.CanvasTexture(drawBackdrop(nextMode, 1024, image));
      backdropTexture.colorSpace = THREE.SRGBColorSpace;
      backdropMaterial.map = backdropTexture;
      backdropMaterial.needsUpdate = true;
    };

    const gem = new THREE.Group();
    scene.add(gem);

    const material = new THREE.MeshPhysicalMaterial({
      color: PRISMATIC_DEFAULTS.tint,
      metalness: 0,
      roughness: PRISMATIC_DEFAULTS.roughness,
      transmission: 1,
      thickness: PRISMATIC_DEFAULTS.thickness,
      ior: PRISMATIC_DEFAULTS.ior,
      dispersion: PRISMATIC_DEFAULTS.dispersion,
      iridescence: PRISMATIC_DEFAULTS.iridescence,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [120, 420],
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      specularIntensity: 1,
      envMapIntensity: PRISMATIC_DEFAULTS.reflection,
      flatShading: true,
      transparent: false,
      side: THREE.FrontSide,
    });

    const rimMaterial = new THREE.ShaderMaterial({
      uniforms: RIM_UNIFORMS,
      vertexShader: RIM_VERTEX,
      fragmentShader: RIM_FRAGMENT,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const crystal = new THREE.Mesh(undefined, material);
    const rim = new THREE.Mesh(undefined, rimMaterial);
    rim.scale.setScalar(1.006);
    gem.add(crystal, rim);

    let shellGeometry = null;
    const setDetail = (next) => {
      const level = THREE.MathUtils.clamp(Math.round(next), 0, 5);
      if (level === detail) return;
      detail = level;
      shellGeometry?.dispose();
      shellGeometry = new THREE.IcosahedronGeometry(RADIUS, level);
      // Non-indexed geometry + this call = one flat normal per facet.
      shellGeometry.computeVertexNormals();
      crystal.geometry = shellGeometry;
      rim.geometry = shellGeometry;
    };

    const key = new THREE.DirectionalLight(0xffffff, PRISMATIC_DEFAULTS.key);
    const fill = new THREE.DirectionalLight(0xc9dcff, PRISMATIC_DEFAULTS.fill);
    const topLight = new THREE.DirectionalLight(0xfff6ea, 0.7);
    topLight.position.set(0, 9, 4);
    scene.add(key, fill, topLight);

    const resize = () => {
      if (disposed) return;
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const distance = camera.position.z - backdrop.position.z;
      const visible = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      backdrop.scale.set(visible * camera.aspect * 1.25, visible * 1.25, 1);
    };
    resize();

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(resize);
      observer.observe(host);
    } else {
      window.addEventListener("resize", resize);
    }

    const draw = (now) => {
      if (disposed) return;
      frame = requestAnimationFrame(draw);
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (document.hidden) return;

      const {
        settings: s,
        breathRef: sharedBreath,
        mode: nextMode,
        photo: nextPhoto,
        playing: isPlaying,
        quality: nextQuality,
        reducedMotion: reduce,
      } = live.current;

      if (nextQuality !== currentQuality) {
        currentQuality = nextQuality;
        renderer.setPixelRatio(pixelRatioFor(nextQuality));
        resize();
      }

      // Keep the real backdrop inside the transmission pass even in production.
      // The canvas is circularly clipped below, so no rectangular studio panel appears.
      backdrop.visible = true;
      applyBackdrop(nextMode, nextPhoto);
      if (isPlaying && !reduce) elapsed += dt;

      setDetail(s.facets ?? PRISMATIC_DEFAULTS.facets);
      material.color.set(s.tint || PRISMATIC_DEFAULTS.tint);
      material.transmission = s.transmission ?? 1;
      material.ior = s.ior ?? PRISMATIC_DEFAULTS.ior;
      material.thickness = s.thickness ?? PRISMATIC_DEFAULTS.thickness;
      material.dispersion = s.dispersion ?? PRISMATIC_DEFAULTS.dispersion;
      material.roughness = s.roughness ?? PRISMATIC_DEFAULTS.roughness;
      material.envMapIntensity = s.reflection ?? PRISMATIC_DEFAULTS.reflection;
      material.iridescence = s.iridescence ?? PRISMATIC_DEFAULTS.iridescence;
      scene.environmentIntensity = s.environment ?? PRISMATIC_DEFAULTS.environment;
      RIM_UNIFORMS.uStrength.value = s.edges ?? PRISMATIC_DEFAULTS.edges;

      key.intensity = s.key ?? PRISMATIC_DEFAULTS.key;
      fill.intensity = s.fill ?? PRISMATIC_DEFAULTS.fill;
      const angle = THREE.MathUtils.degToRad(s.lightAngle ?? PRISMATIC_DEFAULTS.lightAngle);
      key.position.set(Math.cos(angle) * 9, 6.5, Math.sin(angle) * 9);
      fill.position.set(-Math.cos(angle) * 8, -3.5, -Math.sin(angle) * 8);

      const breath = THREE.MathUtils.clamp(sharedBreath?.current ?? 0.3, 0, 1);
      const gemScale = live.current.sessionBreathing
        ? 1 + 0.35 * breath
        : (s.size ?? 1) * (0.89 + (s.breathStrength ?? 0.19) * breath);
      gem.scale.setScalar(gemScale);
      if (live.current.transparentCanvas) {
        // The perspective-projected silhouette of the sphere; outside stays transparent.
        const projectedRadius = Math.atan((RADIUS * gemScale * 1.015) / camera.position.z) /
          THREE.MathUtils.degToRad(camera.fov / 2) * 50;
        renderer.domElement.style.clipPath = `circle(${projectedRadius.toFixed(2)}% at 50% 50%)`;
      } else {
        renderer.domElement.style.clipPath = "none";
      }
      gem.rotation.y = reduce ? 0.6 : elapsed * (s.rotation ?? PRISMATIC_DEFAULTS.rotation);
      gem.rotation.x = 0.16 + (reduce ? 0 : Math.sin(elapsed * 0.16) * 0.07);
      gem.position.y = reduce ? 0 : Math.sin(elapsed * 0.5) * (s.float ?? PRISMATIC_DEFAULTS.float);

      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (!observer) window.removeEventListener("resize", resize);
      shellGeometry?.dispose();
      backdropGeometry.dispose();
      backdropMaterial.dispose();
      backdropTexture?.dispose();
      material.dispose();
      rimMaterial.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div aria-hidden="true" style={{ width: "100%", height: "100%", position: "relative" }}>
      {failed && (
        <div
          style={{
            position: "absolute",
            inset: "24%",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #ffffff, #dfe7f4 52%, #c3b9d8)",
            boxShadow: "inset 10px 10px 30px #ffffffaa, 0 16px 40px #a9a2bd55",
          }}
        />
      )}
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}