// Adapted from ElevenLabs UI Orb (MIT License): https://github.com/elevenlabs/ui
// Copyright ElevenLabs contributors; see ELEVENLABS-UI-LICENSE.md
// Vanilla Three.js renderer: Base44 preview does not resolve React Three Fiber.
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Orb({
  colors = ["#CADCFC", "#A0B9D1"],
  colorsRef,
  seed = 420,
  agentState = null,
  volumeMode = "auto",
  manualInput = 0,
  manualOutput = 0.3,
  inputVolumeRef,
  outputVolumeRef,
  getInputVolume,
  getOutputVolume,
  className,
}) {
  const host = useRef(null);
  const live = useRef({});
  live.current = { colors, colorsRef, agentState, volumeMode, manualInput, manualOutput, inputVolumeRef, outputVolumeRef, getInputVolume, getOutputVolume };
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
    catch (error) { console.warn("Orb WebGL unavailable", error); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-4, 4, 4, -4, .1, 20);
    camera.position.z = 5;
    const noiseData = new Uint8Array(256 * 256 * 4);
    let randomSeed = (seed || 420) >>> 0;
    const random = () => { randomSeed = (1664525 * randomSeed + 1013904223) >>> 0; return randomSeed / 4294967296; };
    for (let i = 0; i < noiseData.length; i += 4) {
      const value = Math.floor(random() * 256);
      noiseData[i] = noiseData[i+1] = noiseData[i+2] = value;
      noiseData[i+3] = 255;
    }
    const noise = new THREE.DataTexture(noiseData, 256, 256, THREE.RGBAFormat);
    noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
    noise.needsUpdate = true;
    const loader = new THREE.TextureLoader();
    let loadedNoise = null;
    loader.load("https://storage.googleapis.com/eleven-public-cdn/images/perlin-noise.png", texture => {
      if (disposed) { texture.dispose(); return; }
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      loadedNoise = texture;
      uniforms.uPerlinTexture.value = texture;
    }, undefined, () => {});
    const uniforms = {
      uColor1: { value: new THREE.Color(colors[0]) },
      uColor2: { value: new THREE.Color(colors[1]) },
      uOffsets: { value: Array.from({length: 7}, () => random() * Math.PI * 2) },
      uPerlinTexture: { value: noise },
      uTime: { value: 0 },
      uAnimation: { value: .1 },
      uInverted: { value: 0 },
      uInputVolume: { value: 0 },
      uOutputVolume: { value: 0 },
      uOpacity: { value: 0 },
    };
    const geometry = new THREE.CircleGeometry(3.5, 64);
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    let disposed = false;
    let frame = 0;
    let previous = performance.now();
    let input = 0, output = 0, speed = .1;
    const resize = () => {
      const width = element.clientWidth || 240, height = element.clientHeight || 240;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.left = -4 * aspect; camera.right = 4 * aspect;
      camera.top = 4; camera.bottom = -4;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const tick = now => {
      if (disposed) return;
      const dt = Math.min((now - previous) / 1000, .05);
      previous = now;
      const props = live.current;
      const chosen = props.colorsRef?.current || props.colors;
      uniforms.uColor1.value.lerp(new THREE.Color(chosen[0] || "#CADCFC"), .08);
      uniforms.uColor2.value.lerp(new THREE.Color(chosen[1] || "#A0B9D1"), .08);
      uniforms.uInverted.value = document.documentElement.classList.contains("dark") ? 1 : 0;
      const manual = props.volumeMode === "manual";
      const targetIn = manual ? (props.manualInput ?? props.inputVolumeRef?.current ?? props.getInputVolume?.() ?? 0) : .3;
      const targetOut = manual ? (props.manualOutput ?? props.outputVolumeRef?.current ?? props.getOutputVolume?.() ?? .3) : .3;
      input += (Math.max(0, Math.min(1, targetIn)) - input) * .2;
      output += (Math.max(0, Math.min(1, targetOut)) - output) * .2;
      speed += (.1 + (1 - (output - 1) ** 2) * .9 - speed) * .12;
      uniforms.uTime.value += dt * .5;
      uniforms.uAnimation.value += dt * speed;
      uniforms.uInputVolume.value = input;
      uniforms.uOutputVolume.value = output;
      uniforms.uOpacity.value = Math.min(1, uniforms.uOpacity.value + dt * 2);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      geometry.dispose(); material.dispose(); noise.dispose(); loadedNoise?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === element) element.removeChild(renderer.domElement);
    };
  }, [seed]);
  return <div ref={host} className={className} style={{ width: "100%", height: "100%", position: "relative" }} />;
}

const vertexShader = /* glsl */ `
uniform float uTime;
uniform sampler2D uPerlinTexture;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uAnimation;
uniform float uInverted;
uniform float uOffsets[7];
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uInputVolume;
uniform float uOutputVolume;
uniform float uOpacity;
uniform sampler2D uPerlinTexture;
varying vec2 vUv;

const float PI = 3.14159265358979323846;

// Draw a single oval with soft edges and calculate its gradient color
bool drawOval(vec2 polarUv, vec2 polarCenter, float a, float b, bool reverseGradient, float softness, out vec4 color) {
    vec2 p = polarUv - polarCenter;
    float oval = (p.x * p.x) / (a * a) + (p.y * p.y) / (b * b);

    float edge = smoothstep(1.0, 1.0 - softness, oval);

    if (edge > 0.0) {
        float gradient = reverseGradient ? (1.0 - (p.x / a + 1.0) / 2.0) : ((p.x / a + 1.0) / 2.0);
        // Flatten gradient toward middle value for more uniform appearance
        gradient = mix(0.5, gradient, 0.1);
        color = vec4(vec3(gradient), 0.85 * edge);
        return true;
    }
    return false;
}

// Map grayscale value to a 4-color ramp (color1, color2, color3, color4)
vec3 colorRamp(float grayscale, vec3 color1, vec3 color2, vec3 color3, vec3 color4) {
    if (grayscale < 0.33) {
        return mix(color1, color2, grayscale * 3.0);
    } else if (grayscale < 0.66) {
        return mix(color2, color3, (grayscale - 0.33) * 3.0);
    } else {
        return mix(color3, color4, (grayscale - 0.66) * 3.0);
    }
}

vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

// 2D noise for the ring
float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    float n = mix(
        mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
            dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y
    );

    return 0.5 + 0.5 * n;
}

float sharpRing(vec3 decomposed, float time) {
    float ringStart = 1.0;
    float ringWidth = 0.3;
    float noiseScale = 5.0;

    float noise = mix(
        noise2D(vec2(decomposed.x, time) * noiseScale),
        noise2D(vec2(decomposed.y, time) * noiseScale),
        decomposed.z
    );

    noise = (noise - 0.5) * 2.5;

    return ringStart + noise * ringWidth * 1.5;
}

float smoothRing(vec3 decomposed, float time) {
    float ringStart = 0.9;
    float ringWidth = 0.2;
    float noiseScale = 6.0;

    float noise = mix(
        noise2D(vec2(decomposed.x, time) * noiseScale),
        noise2D(vec2(decomposed.y, time) * noiseScale),
        decomposed.z
    );

    noise = (noise - 0.5) * 5.0;

    return ringStart + noise * ringWidth;
}

float flow(vec3 decomposed, float time) {
    return mix(
        texture(uPerlinTexture, vec2(time, decomposed.x / 2.0)).r,
        texture(uPerlinTexture, vec2(time, decomposed.y / 2.0)).r,
        decomposed.z
    );
}

void main() {
    // Normalize vUv to be centered around (0.0, 0.0)
    vec2 uv = vUv * 2.0 - 1.0;

    // Convert uv to polar coordinates
    float radius = length(uv);
    float theta = atan(uv.y, uv.x);
    if (theta < 0.0) theta += 2.0 * PI; // Normalize theta to [0, 2*PI]

    // Decomposed angle is used for sampling noise textures without seams:
    // float noise = mix(sample(decomposed.x), sample(decomposed.y), decomposed.z);
    vec3 decomposed = vec3(
        // angle in the range [0, 1]
        theta / (2.0 * PI),
        // angle offset by 180 degrees in the range [1, 2]
        mod(theta / (2.0 * PI) + 0.5, 1.0) + 1.0,
        // mixing factor between two noises
        abs(theta / PI - 1.0)
    );

    // Add noise to the angle for a flow-like distortion (reduced for flatter look)
    float noise = flow(decomposed, radius * 0.03 - uAnimation * 0.2) - 0.5;
    theta += noise * mix(0.08, 0.25, uOutputVolume);

    // Initialize the base color to white
    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

    // Original parameters for the ovals in polar coordinates
    float originalCenters[7] = float[7](0.0, 0.5 * PI, 1.0 * PI, 1.5 * PI, 2.0 * PI, 2.5 * PI, 3.0 * PI);

    // Parameters for the animated centers in polar coordinates
    float centers[7];
    for (int i = 0; i < 7; i++) {
        centers[i] = originalCenters[i] + 0.5 * sin(uTime / 20.0 + uOffsets[i]);
    }

    float a, b;
    vec4 ovalColor;

    // Check if the pixel is inside any of the ovals
    for (int i = 0; i < 7; i++) {
        float noise = texture(uPerlinTexture, vec2(mod(centers[i] + uTime * 0.05, 1.0), 0.5)).r;
        a = 0.5 + noise * 0.3; // Increased for more coverage
        b = noise * mix(3.5, 2.5, uInputVolume); // Increased height for fuller appearance
        bool reverseGradient = (i % 2 == 1); // Reverse gradient for every second oval

        // Calculate the distance in polar coordinates
        float distTheta = min(
            abs(theta - centers[i]),
            min(
                abs(theta + 2.0 * PI - centers[i]),
                abs(theta - 2.0 * PI - centers[i])
            )
        );
        float distRadius = radius;

        float softness = 0.6; // Increased softness for flatter, less pronounced edges

        // Check if the pixel is inside the oval in polar coordinates
        if (drawOval(vec2(distTheta, distRadius), vec2(0.0, 0.0), a, b, reverseGradient, softness, ovalColor)) {
            // Blend the oval color with the existing color
            color.rgb = mix(color.rgb, ovalColor.rgb, ovalColor.a);
            color.a = max(color.a, ovalColor.a); // Max alpha
        }
    }
    
    // Calculate both noisy rings
    float ringRadius1 = sharpRing(decomposed, uTime * 0.1);
    float ringRadius2 = smoothRing(decomposed, uTime * 0.1);
    
    // Adjust rings based on input volume (reduced for flatter appearance)
    float inputRadius1 = radius + uInputVolume * 0.2;
    float inputRadius2 = radius + uInputVolume * 0.15;
    float opacity1 = mix(0.2, 0.6, uInputVolume);
    float opacity2 = mix(0.15, 0.45, uInputVolume);

    // Blend both rings
    float ringAlpha1 = (inputRadius2 >= ringRadius1) ? opacity1 : 0.0;
    float ringAlpha2 = smoothstep(ringRadius2 - 0.05, ringRadius2 + 0.05, inputRadius1) * opacity2;
    
    float totalRingAlpha = max(ringAlpha1, ringAlpha2);
    
    // Apply screen blend mode for combined rings
    vec3 ringColor = vec3(1.0); // White ring color
    color.rgb = 1.0 - (1.0 - color.rgb) * (1.0 - ringColor * totalRingAlpha);

    // Define colours to ramp against greyscale (could increase the amount of colours in the ramp)
    vec3 color1 = vec3(0.0, 0.0, 0.0); // Black
    vec3 color2 = uColor1; // Darker Color
    vec3 color3 = uColor2; // Lighter Color
    vec3 color4 = vec3(1.0, 1.0, 1.0); // White

    // Convert grayscale color to the color ramp
    float luminance = mix(color.r, 1.0 - color.r, uInverted);
    color.rgb = colorRamp(luminance, color1, color2, color3, color4); // Apply the color ramp

    // Apply fade-in opacity
    color.a *= uOpacity;

    gl_FragColor = color;
}
`
