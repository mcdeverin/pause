import { useEffect, useRef } from "react";
import * as THREE from "three";

// Original Always Pause shader, written for this project.
// No third-party shader source, textures, or assets have been copied.
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uBreath;
uniform vec2 uResolution;

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  p.x *= uResolution.x / max(uResolution.y, 1.0);
  float a = atan(p.y, p.x);
  float t = uTime;
  float breathing = clamp(uBreath, 0.0, 1.0);
  float warp = sin(a * 3.0 + t * 0.72) * 0.025
             + sin(a * 5.0 - t * 0.48) * 0.018
             + sin(a * 8.0 + t * 0.31) * 0.009;
  float radius = 0.50 + 0.12 * breathing + warp;
  float dist = length(p) - radius;
  float alpha = 1.0 - smoothstep(-0.005, 0.005, dist);
  if (alpha < 0.002) discard;

  vec2 q = p / max(radius, 0.01);
  float current = sin(q.x * 5.0 + q.y * 3.0 + t * 0.65)
                + 0.6 * sin(q.y * 7.0 - q.x * 4.0 - t * 0.42);
  vec3 aqua = vec3(0.52, 0.89, 0.86);
  vec3 lilac = vec3(0.75, 0.68, 0.95);
  vec3 peach = vec3(0.99, 0.76, 0.67);
  vec3 color = mix(aqua, lilac, smoothstep(-1.5, 1.5, current));
  color = mix(color, peach, 0.36 * smoothstep(0.1, 1.3,
    sin(q.y * 4.0 + q.x * 2.0 - t * 0.52)));
  float highlight = pow(max(0.0, 1.0 -
    length((q - vec2(-0.28, 0.35)) * vec2(1.0, 1.2))), 4.0);
  color += vec3(0.18, 0.15, 0.13) * highlight;
  color = mix(color, vec3(0.49, 0.73, 0.83),
    0.25 * smoothstep(0.62, 1.0, length(q)));
  gl_FragColor = vec4(min(color, vec3(1.0)), alpha);
}
`;

// Takes the same breath value as all existing visuals; no independent timer.
export default function LivingOpalVisual({
  breath = 0, animate = true, reducedMotion = false,
}) {
  const containerRef = useRef(null);
  const breathRef = useRef(breath);
  const movingRef = useRef(animate && !reducedMotion);
  breathRef.current = breath;
  movingRef.current = animate && !reducedMotion;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let renderer, geometry, material, observer, frame = 0;
    let disposed = false;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true, antialias: false, powerPreference: "low-power",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.domElement.style.cssText =
        "width:100%;height:100%;display:block;pointer-events:none";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader, transparent: true, depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uBreath: { value: breathRef.current },
          uResolution: { value: new THREE.Vector2(1, 1) },
        },
      });
      scene.add(new THREE.Mesh(geometry, material));

      const resize = () => {
        if (disposed) return;
        const width = Math.max(1, container.clientWidth);
        const height = Math.max(1, container.clientHeight);
        renderer.setSize(width, height, false);
        material.uniforms.uResolution.value.set(width, height);
      };
      resize();
      observer = new ResizeObserver(resize);
      observer.observe(container);

      let lastFrame = performance.now();
      let elapsed = 0;
      const draw = (now) => {
        if (disposed) return;
        if (!document.hidden) {
          if (movingRef.current) elapsed += Math.min(0.05, (now - lastFrame) / 1000);
          material.uniforms.uTime.value = elapsed;
          material.uniforms.uBreath.value = breathRef.current;
          renderer.render(scene, camera);
        }
        lastFrame = now;
        frame = requestAnimationFrame(draw);
      };
      frame = requestAnimationFrame(draw);
    } catch (error) {
      console.warn("Living Opal WebGL unavailable:", error);
    }
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.domElement?.remove();
    };
  }, []);

  return (
    <div aria-hidden="true" style={{ position: "relative", width: "100%", height: "100%" }}>
      <div style={{
        position: "absolute", inset: "20%", borderRadius: "50%",
        background: "radial-gradient(circle at 30% 25%, #fff5e8, #d8c6f2 50%, #9ce5df)",
        transform: `scale(${1 + 0.2 * breath})`,
      }} />
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
