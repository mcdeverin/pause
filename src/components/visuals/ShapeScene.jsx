import { useEffect, useRef } from "react";
import * as THREE from "three";

// Native Three.js scene: no React Three Fiber or Drei dependency.
// Existing React Three Fiber prototypes remain in Git history.
export default function ShapeScene({ kind, breathRef, motionRef, background = "photo", photoUrl, backgroundSettings = {} }) {
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
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
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
    let screenPhotoTexture = null;
    let screenPhotoCanvas = null;
    let photoImage = null;
    let photoNeedsRedraw = false;
    let redrawPhoto = () => {};
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
      particleMaterial = new THREE.PointsMaterial({ color: "#d7dce1", size: .026, sizeAttenuation: true, transparent: true, opacity: .9, depthWrite: false });
      particles = new THREE.Points(particleGeometry, particleMaterial);
      group.add(particles);
    } else {
      const droplets = kind === "droplets" || kind === "dropletsSingle" || kind === "dropletsHalo";
      const count = kind === "dropletsSingle" ? 1 : 46;
      if (droplets) { camera.fov = 60; camera.position.z = 3; camera.updateProjectionMatrix(); }
      // Use the original Three.js example's refract(view, normal, ratio)
      // calculation, but sample the ACTUAL selected app photo at the sphere's
      // screen position, not a fixed Park3Med cube environment.
      // This canvas is only a texture input; it is NEVER drawn as a rectangle.
      const material = droplets && background === "transparent"
        ? new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
              uPhoto: { value: null },
              uHasPhoto: { value: 0 },
              uViewport: { value: new THREE.Vector2(1, 1) },
              uCanvasOrigin: { value: new THREE.Vector2(0, 0) },
              uCanvasSize: { value: new THREE.Vector2(1, 1) },
              uSphereRadius: { value: 50 },
            },
            vertexShader: `
              varying vec3 vNormal;
              varying vec3 vView;
              void main() {
                vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
                vNormal = normalize(normalMatrix * normal);
                vView = normalize(-viewPos.xyz);
                gl_Position = projectionMatrix * viewPos;
              }
            `,
            fragmentShader: `
              uniform sampler2D uPhoto;
              uniform float uHasPhoto;
              uniform vec2 uViewport;
              uniform vec2 uCanvasOrigin;
              uniform vec2 uCanvasSize;
              uniform float uSphereRadius;
              varying vec3 vNormal;
              varying vec3 vView;
              void main() {
                vec3 n = normalize(vNormal);
                vec3 eye = normalize(vView);
                // Same optical principle as webgl_effects_stereo.html:
                // refract() redirects our sample using the sphere's normals.
                vec3 direction = refract(-eye, n, 0.95);
                float facing = clamp(dot(eye, n), 0.0, 1.0);
                float fresnel = pow(1.0 - facing, 3.3);
                float glint = pow(max(dot(n, normalize(vec3(-0.4, 0.68, 0.61))), 0.0), 95.0);
                float glint2 = pow(max(dot(n, normalize(vec3(0.68, -0.43, 0.59))), 0.0), 125.0);

                // gl_FragCoord is local to the WebGL canvas. Convert to
                // viewport coordinates to align with BackgroundLayer's image.
                vec2 localTopLeft = vec2(gl_FragCoord.x, uCanvasSize.y - gl_FragCoord.y);
                vec2 globalTopLeft = uCanvasOrigin + localTopLeft;
                vec2 photoUV = vec2(globalTopLeft.x / uViewport.x, 1.0 - globalTopLeft.y / uViewport.y);

                // The interior bends what is ACTUALLY behind it. No skybox,
                // fixed reflection photo, background plane or CSS square.
                vec2 displacement = direction.xy * (uSphereRadius / uViewport) * 0.72;
                vec2 distortedUV = clamp(photoUV + vec2(displacement.x, -displacement.y), vec2(0.001), vec2(0.999));

                if (uHasPhoto > 0.5) {
                  vec3 behind = texture2D(uPhoto, distortedUV).rgb;
                  // Subtle thickness and dark Fresnel silhouette preserve
                  // dense water glass instead of a soap bubble outline.
                  vec3 glass = behind * (1.0 - 0.25 * fresnel);
                  glass = mix(glass, vec3(0.95, 0.98, 1.0), glint * 0.82 + glint2 * 0.40);
                  gl_FragColor = vec4(glass, 1.0);
                } else {
                  // Solid/gradient backgrounds: leave the app canvas visible
                  // instead of inventing an internal photograph.
                  float alpha = clamp(0.045 + fresnel * 0.60 + glint * 0.82 + glint2 * 0.48, 0.0, 0.96);
                  gl_FragColor = vec4(vec3(0.92, 0.96, 0.98), alpha);
                }
              }
            `,
          })
        : droplets
        ? new THREE.MeshPhysicalMaterial({
            color: 0xffffff, metalness: 0, roughness: 0.015,
            transmission: 1, thickness: 1.2, ior: 1.33,
            clearcoat: 1, clearcoatRoughness: 0.01,
            transparent: false, depthWrite: true
          })
        : null;
      if (droplets && background === "transparent" && photoUrl) {
        screenPhotoCanvas = document.createElement("canvas");
        const context = screenPhotoCanvas.getContext("2d");
        // Do not upload an empty 0x0 canvas as a WebGL texture.
        // Create the texture only after the selected image has been drawn.
        redrawPhoto = () => {
          if (!context || !photoImage || !photoImage.naturalWidth || disposed) return;
          const vw = Math.max(1, window.innerWidth), vh = Math.max(1, window.innerHeight);
          const resolution = Math.min(1, 2048 / Math.max(vw, vh));
          screenPhotoCanvas.width = Math.max(1, Math.round(vw * resolution));
          screenPhotoCanvas.height = Math.max(1, Math.round(vh * resolution));
          context.setTransform(resolution, 0, 0, resolution, 0, 0);
          context.clearRect(0, 0, vw, vh);
          const fitScale = Math.max(vw / photoImage.naturalWidth, vh / photoImage.naturalHeight);
          const fitW = photoImage.naturalWidth * fitScale;
          const fitH = photoImage.naturalHeight * fitScale;
          const offsetX = Math.max(-100, Math.min(100, Number(backgroundSettings.photoOffsetX) || 0));
          const offsetY = Math.max(-100, Math.min(100, Number(backgroundSettings.photoOffsetY) || 0));
          // CSS object-position uses a fraction of the excess cover area.
          const x = (vw - fitW) * (0.5 + offsetX / 100);
          const y = (vh - fitH) * (0.5 + offsetY / 100);
          const zoom = Math.max(1, Number(backgroundSettings.photoZoom) || 1);
          context.save();
          context.translate(vw / 2, vh / 2);
          context.scale(zoom, zoom);
          context.translate(-vw / 2, -vh / 2);
          const blur = Number(backgroundSettings.backgroundBlur) || 0;
          context.filter = blur > 0 ? `blur(${Math.min(30, blur)}px)` : "none";
          context.drawImage(photoImage, x, y, fitW, fitH);
          context.restore();
          const dim = Math.min(100, Math.max(0, Number(backgroundSettings.backgroundDim) || 0)) / 100;
          if (dim > 0) {
            context.fillStyle = `rgba(0,0,0,${dim})`;
            context.fillRect(0, 0, vw, vh);
          }
          if (!screenPhotoTexture) {
            screenPhotoTexture = new THREE.CanvasTexture(screenPhotoCanvas);
            screenPhotoTexture.colorSpace = THREE.SRGBColorSpace;
            screenPhotoTexture.wrapS = THREE.ClampToEdgeWrapping;
            screenPhotoTexture.wrapT = THREE.ClampToEdgeWrapping;
            material.uniforms.uPhoto.value = screenPhotoTexture;
          }
          screenPhotoTexture.needsUpdate = true;
          material.uniforms.uHasPhoto.value = 1;
        };
        photoImage = new Image();
        photoImage.crossOrigin = "anonymous";
        photoImage.onload = redrawPhoto;
        photoImage.onerror = () => console.warn("Rain Droplet cannot load the selected background for refraction", photoUrl);
        photoImage.src = photoUrl;
      }
      if (droplets && background !== "transparent") {
        // Three.js transmission samples the actual scene behind the glass.
        // Never use the Park3Med cubemap: it cannot match the selected photo.
        const canvas = document.createElement("canvas");
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
        if (background === "dark") {
          gradient.addColorStop(0, "#414956"); gradient.addColorStop(1, "#11151c");
        } else {
          gradient.addColorStop(0, "#ffffff"); gradient.addColorStop(1, "#e8ebed");
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
        const spec = kind === "dropletsSingle"
          ? { x: 0, y: 0, z: 0, size: .88 }
          : droplets
          ? { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, size: .11 + (i % 5) * .018 }
          : { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, size: .11 + (i % 5) * .018 };
        const mat = material || new THREE.MeshPhysicalMaterial({ color: colors[i % 4], metalness: .08, roughness: .12, clearcoat: 1, transparent: true, opacity: .94 });
        const mesh = new THREE.Mesh(geometry, mat);
        group.add(mesh);
        objects.push({ mesh, spec, index: i });
      }
    }
    const materialForScreenPhoto = (kind === "droplets" || kind === "dropletsSingle" || kind === "dropletsHalo") && background === "transparent" ? objects[0]?.mesh.material : null;
    const resize = () => {
      if (!renderer || !element.isConnected) return;
      const width = Math.max(1, element.clientWidth), height = Math.max(1, element.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (kind === "dropletsSingle" && background !== "transparent") {
        // The photo plane must remain in the WebGL transmission pass, but its
        // rectangular bounds must not show over the page-wide CSS photograph.
        // Clip only the glass sphere footprint in the final transparent canvas.
        const sphereRadius = .88 * 1.18;
        const distance = camera.position.z;
        const radiusPx = (sphereRadius / (distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) * height / 2;
        const mask = `radial-gradient(circle ${Math.ceil(radiusPx + 3)}px at center, black 97%, transparent 100%)`;
        renderer.domElement.style.maskImage = mask;
        renderer.domElement.style.webkitMaskImage = mask;
      }
      if (materialForScreenPhoto) {
        const rect = element.getBoundingClientRect();
        const uniforms = materialForScreenPhoto.uniforms;
        uniforms.uViewport.value.set(window.innerWidth, window.innerHeight);
        uniforms.uCanvasOrigin.value.set(rect.left, rect.top);
        uniforms.uCanvasSize.value.set(width, height);
        redrawPhoto();
      }
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
      if (materialForScreenPhoto) {
        const rect = element.getBoundingClientRect();
        const uniforms = materialForScreenPhoto.uniforms;
        uniforms.uCanvasOrigin.value.set(rect.left, rect.top);
        uniforms.uSphereRadius.value = (kind === "dropletsSingle" ? .88 : .16) * (.92 + b * .12) * (1 + b * .18) / (camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * element.clientHeight / 2;
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
      screenPhotoTexture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [kind, breathRef, motionRef, background, photoUrl, backgroundSettings]);
  return <div ref={host} style={{ width: "100%", height: "100%" }} />;
}
