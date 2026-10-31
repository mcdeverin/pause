import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { breathScale } from "../../lib/breathExpansion";

/*
 * Living Opal 2.0 for Always Pause.
 * Deformation, shading and coloring adapted from:
 * https://github.com/knowercoder/animated-blob
 * Copyright (c) 2025 Knower Coder — MIT License.
 * See THIRD_PARTY_LICENSES/animated-blob-LICENSE.txt for full notice.
 *
 * Integration, breath synchronization, palette, lifecycle, and fallback
 * customized for Always Pause. No external textures or network calls.
 */
const vertexShader = ` 
        attribute vec3 tangent;

        uniform float u_time;         
        uniform vec3 _mousePos;
        uniform float _frequency; 
        uniform float _amplitude;  
        
        uniform float _wiggleDampening;
        uniform float _wiggleFrequency;
        uniform float _wiggleAmplitude;
        uniform float _wiggleSpeed;

        uniform float _mouseRotate;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 PositionVS;        
        varying vec3 PositionWS;
        varying vec3 PositionOS;

        vec3 mod289(vec3 x)
        {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289(vec4 x)
        {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x)
        {
        return mod289(((x*34.0)+10.0)*x);
        }

        vec4 taylorInvSqrt(vec4 r)
        {
        return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec3 fade(vec3 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
        }

        float pnoise(vec3 P, vec3 rep)
        {
        vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
        vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
        Pi0 = mod289(Pi0);
        Pi1 = mod289(Pi1);
        vec3 Pf0 = fract(P); // Fractional part for interpolation
        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);

        vec4 gx0 = ixy0 * (1.0 / 7.0);
        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        vec4 gx1 = ixy1 * (1.0 / 7.0);
        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;

        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);

        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
        return 2.2 * n_xyz;
        }

        mat4 createRotationMatrix(vec3 angles) {
            float cosX = cos(angles.x);
            float sinX = sin(angles.x);
            float cosY = cos(angles.y);
            float sinY = sin(angles.y);
            float cosZ = cos(angles.z);
            float sinZ = sin(angles.z);
    
            mat4 rotationX = mat4(
                1.0, 0.0, 0.0, 0.0,
                0.0, cosX, -sinX, 0.0,
                0.0, sinX, cosX, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            mat4 rotationY = mat4(
                cosY, 0.0, sinY, 0.0,
                0.0, 1.0, 0.0, 0.0,
                -sinY, 0.0, cosY, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            mat4 rotationZ = mat4(
                cosZ, -sinZ, 0.0, 0.0,
                sinZ, cosZ, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            return rotationZ * rotationY * rotationX;
        }


        
        void main() {
            vUv = uv;
            //vNormal = normalize(normalMatrix * normal);
            float time = u_time * 0.5;
            vec3 rep = vec3(10.0);
            float frequency = _frequency;
            float amplitude = _amplitude;
            PositionOS = position;

            vec3 mousepos = _mousePos;
            float mdistance = length(mousepos - position);
            vec3 wiggleOffset = normal * sin(-time * _wiggleSpeed + mdistance * _wiggleFrequency) * clamp(1.0/mdistance, 0.0, 1.0) * _wiggleDampening * _wiggleAmplitude;
            
            vec3 rotateOffset = -(createRotationMatrix(vec3(0.0, _mouseRotate,  0.0)) * vec4(position, 1.0)).xyz + position;

            float displacement = pnoise((position + wiggleOffset + rotateOffset) * frequency + time, rep) * amplitude;            
            vec3 newPosition = position + normal * displacement;

            vec3 posPlusTangent = position + tangent * 0.01;
            displacement = pnoise((posPlusTangent + wiggleOffset + rotateOffset) * frequency + time, rep) * amplitude;
            posPlusTangent = posPlusTangent + normal * displacement;

            vec3 bitangent = cross(normal, tangent);
            vec3 posPlusBitangent = position + bitangent * 0.01;
            displacement = pnoise((posPlusBitangent + wiggleOffset + rotateOffset) * frequency + time, rep) * amplitude;
            posPlusBitangent = posPlusBitangent + normal * displacement;

            vec3 modifiedTangent = posPlusTangent - newPosition;
            vec3 modifiedBitangent = posPlusBitangent - newPosition;
            vec3 modifiedNormal = cross(modifiedTangent, modifiedBitangent);
            vNormal = normalize(modifiedNormal);
            vNormal = normalize(normalMatrix * vNormal);
            
            PositionWS = vec3(modelMatrix * vec4(newPosition, 1.0));
            PositionVS = vec3(modelViewMatrix * vec4(newPosition, 1.0));

            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `;
const fragmentShader = `            
        uniform vec3 _baseColor1;
        uniform vec3 _baseColor2;        
        uniform vec3 _baseColor3;
        uniform vec3 _baseColor4;
        uniform vec3 _baseColor5;
        uniform vec3 _baseColor6;   
        uniform vec3 _colorsAngle;  
        uniform float _colorSinusoidal; 
        uniform float _segmentColor1;  
        uniform float _segmentColor2; 
        uniform float _segmentColor3; 
        uniform float _segmentColor4; 
        uniform float _segmentColor5; 
        uniform float _segmentColor6; 
        uniform float _metallic;
        uniform float _smoothness;

        uniform float _lightintensity;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 PositionWS;
        varying vec3 PositionVS;  
        varying vec3 PositionOS;
        
        mat4 createRotationMatrix(vec3 angles) {
            float cosX = cos(angles.x);
            float sinX = sin(angles.x);
            float cosY = cos(angles.y);
            float sinY = sin(angles.y);
            float cosZ = cos(angles.z);
            float sinZ = sin(angles.z);
    
            mat4 rotationX = mat4(
                1.0, 0.0, 0.0, 0.0,
                0.0, cosX, -sinX, 0.0,
                0.0, sinX, cosX, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            mat4 rotationY = mat4(
                cosY, 0.0, sinY, 0.0,
                0.0, 1.0, 0.0, 0.0,
                -sinY, 0.0, cosY, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            mat4 rotationZ = mat4(
                cosZ, -sinZ, 0.0, 0.0,
                sinZ, cosZ, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            return rotationZ * rotationY * rotationX;
        }

        vec3 SegmentColor2(vec3 poitionos) {
            vec3 angles = vec3(radians(_colorsAngle.x), radians(_colorsAngle.y), radians(_colorsAngle.z));
            mat4 rotationMatrix = createRotationMatrix(angles);
            vec4 transformedPosition = rotationMatrix * vec4(poitionos, 1.0);
        
            transformedPosition.y += sin(transformedPosition.x);
            float segmentIndex = (transformedPosition.y + 4.0) / 8.0 * 6.0;
            float segmentIndexFloor = floor(segmentIndex);
            float segmentFraction = segmentIndex - segmentIndexFloor;
        
            // Use a sine wave pattern to modulate the fraction
            float sineFraction = 0.5 * (1.0 - cos(segmentFraction * 3.14159265));
        
            vec3 color0 = _baseColor1;  
            vec3 color1 = _baseColor2;  
            vec3 color2 = _baseColor3;  
            vec3 color3 = _baseColor4;  
            vec3 color4 = _baseColor5;  
            vec3 color5 = _baseColor6;  
        
            vec3 colorA;
            vec3 colorB;
        
            if (segmentIndexFloor == 0.0) {
                colorA = color0;
                colorB = color1;
            } else if (segmentIndexFloor == 1.0) {
                colorA = color1;
                colorB = color2;
            } else if (segmentIndexFloor == 2.0) {
                colorA = color2;
                colorB = color3;
            } else if (segmentIndexFloor == 3.0) {
                colorA = color3;
                colorB = color4;
            } else if (segmentIndexFloor == 4.0) {
                colorA = color4;
                colorB = color5;
            } else {
                colorA = color5;
                colorB = color0; // Wrap around for a cyclic color
            }
        
            return mix(colorA, colorB, sineFraction);
        }
        
        

        void main() {           
            
            vec2 uv = vUv;
            vec3 vnormal = normalize(vNormal);

            vec3 albedo = SegmentColor2(PositionOS);

            //vec3 indirectLight = vec3(0.15);
            vec3 mate = vec3(0.18) * albedo;
            //diffuse            
            vec3 lightdir = normalize(vec3(0.8, 0.4, 0.7));
            float sunDiffuse = clamp(dot(vnormal, lightdir), 0.0, 1.0);
            float skyDiffuse = clamp(0.5 + 0.5 * dot(vnormal, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);// * (1.0 - metallic); 
            float bounceDiffuse = clamp(0.5 + 0.5 * dot(vnormal, vec3(0.0, -1.0, 0.0)), 0.0, 1.0);       

            vec3 diffuseCol = mate * vec3(7.0, 4.5, 3.0) * sunDiffuse * _lightintensity;
            diffuseCol += mate * vec3(0.5, 0.8, 0.9) * skyDiffuse;
            diffuseCol += mate * vec3(0.7, 0.3, 0.2) * bounceDiffuse * (1.0 - _metallic);

            // specular
            vec3 viewDir = normalize(-PositionVS);
            vec3 reflectDir = reflect(-lightdir, vnormal);  
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), _smoothness * 128.0);   
            vec3 specular = vec3(1.0) * spec * 1.5 * _metallic; 
            // specular += mate * vec3(0.5, 0.8, 0.9) * skyDiffuse;
            // specular += mate * vec3(0.7, 0.3, 0.2) * bounceDiffuse;
            

            vec3 finalcol = (diffuseCol + specular);
            finalcol = pow(finalcol, vec3(0.4545));
            gl_FragColor = vec4(finalcol, 1.0);
        }
    `;

export default function LivingOpalVisual({
  breath = 0,
  animate = true,
  reducedMotion = false,
  labSettings,
}) {
  const canvasHost = useRef(null);
  const breathRef = useRef(breath);
  const movingRef = useRef(animate && !reducedMotion);
  const settingsRef = useRef(labSettings);
  const [webglFailed, setWebglFailed] = useState(false);
  breathRef.current = breath;
  movingRef.current = animate && !reducedMotion;
  settingsRef.current = labSettings;

  useEffect(() => {
    const host = canvasHost.current;
    if (!host) return undefined;

    let renderer;
    let geometry;
    let material;
    let observer;
    let frame = 0;
    let disposed = false;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.domElement.style.cssText =
        "display:block;width:100%;height:100%;pointer-events:none;";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      // Leave room for the full 55% inhale expansion and shader deformation.
      // Otherwise the WebGL viewport cuts the orb into a visible square.
      camera.position.z = 16.5;

      // Significantly fewer vertices than the 300 x 300 desktop demo.
      // The shader still deforms the mesh on the GPU.
      geometry = new THREE.SphereGeometry(4, 72, 48);
      geometry.computeTangents();

      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: false,
        depthWrite: true,
        uniforms: {
          u_time: { value: 0 },
          _mousePos: { value: new THREE.Vector3(0, 0, 4) },
          _wiggleDampening: { value: 0 },
          _wiggleFrequency: { value: 1.5 },
          _wiggleAmplitude: { value: 0 },
          _wiggleSpeed: { value: 7 },
          _mouseRotate: { value: 0 },
          _baseColor1: { value: new THREE.Color("#b6e8e4") },
          _baseColor2: { value: new THREE.Color("#a9d4f2") },
          _baseColor3: { value: new THREE.Color("#d3bafa") },
          _baseColor4: { value: new THREE.Color("#f2c8dc") },
          _baseColor5: { value: new THREE.Color("#fff0d6") },
          _baseColor6: { value: new THREE.Color("#b2e8df") },
          _colorsAngle: { value: new THREE.Vector3(0, 0, -28) },
          _colorSinusoidal: { value: 0.45 },
          _segmentColor1: { value: 0.1 },
          _segmentColor2: { value: 0.1 },
          _segmentColor3: { value: 0.1 },
          _segmentColor4: { value: 0.1 },
          _segmentColor5: { value: 0.1 },
          _segmentColor6: { value: 0.1 },
          _frequency: { value: 0.85 },
          _amplitude: { value: 0.75 },
          _metallic: { value: 0.82 },
          _smoothness: { value: 0.92 },
          _lightintensity: { value: 1.3 },
        },
      });

      const blob = new THREE.Mesh(geometry, material);
      scene.add(blob);

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

      let lastFrame = performance.now();
      let elapsed = 0;
      const draw = (now) => {
        if (disposed) return;
        const delta = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
        lastFrame = now;
        if (!document.hidden) {
          const s = settingsRef.current;
          if (movingRef.current) elapsed += delta * (s?.speed ?? 1);
          material.uniforms._frequency.value = s?.frequency ?? 0.85;
          material.uniforms._amplitude.value = s?.amplitude ?? 0.75;
          material.uniforms._metallic.value = s?.metallic ?? 0.82;
          material.uniforms._smoothness.value = s?.smoothness ?? 0.92;
          material.uniforms._lightintensity.value = s?.light ?? 1.3;
          material.uniforms._colorSinusoidal.value = s?.blend ?? 0.45;
          if (s?.colors) s.colors.forEach((hex, i) => {
            const u = material.uniforms[`_baseColor${i + 1}`];
            if (u && /^#[0-9a-fA-F]{6}$/.test(hex)) u.value.set(hex);
          });
          material.uniforms.u_time.value = elapsed;
          material.uniforms._colorsAngle.value.z =
            -28 + (movingRef.current ? Math.sin(elapsed * 0.28) * 10 : 0);

          // The existing breathing clock controls expansion; visual motion
          // never decides when an inhale, hold, or exhale starts.
          const b = THREE.MathUtils.clamp(breathRef.current, 0, 1);
          const scale = breathScale(b);
          blob.scale.setScalar(scale);
          blob.rotation.y = movingRef.current ? elapsed * 0.09 : 0;
          blob.rotation.z = movingRef.current ? Math.sin(elapsed * 0.2) * 0.06 : 0;
          renderer.render(scene, camera);
        }
        frame = requestAnimationFrame(draw);
      };
      frame = requestAnimationFrame(draw);
      return () => {
        disposed = true;
        cancelAnimationFrame(frame);
        observer?.disconnect();
        if (!observer) window.removeEventListener("resize", resize);
        geometry?.dispose();
        material?.dispose();
        renderer?.dispose();
        renderer?.domElement?.remove();
      };
    } catch (error) {
      console.warn("Living Opal 3D unavailable:", error);
      setWebglFailed(true);
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.domElement?.remove();
    }
    return undefined;
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {webglFailed && (
        <div style={{
          position: "absolute",
          inset: "20%",
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 25%, #fff5e8, #d8c6f2 50%, #9ce5df)",
        }} />
      )}
      <div ref={canvasHost} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
