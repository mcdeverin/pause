import { useRef, useEffect } from "react";

// Project 3D point to 2D
function project(point, width, height, fov) {
  const factor = fov / (fov + point[2]);
  return [point[0] * factor + width / 2, point[1] * factor + height / 2, factor];
}

// Rotate point around axes
function rotateX(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}
function rotateY(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}
function rotateZ(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
}

// Generate icosahedron vertices and edges
function createIcosahedron(radius) {
  const t = (1 + Math.sqrt(5)) / 2;
  const s = radius / Math.sqrt(1 + t * t);
  const vertices = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(v => [v[0] * s, v[1] * s, v[2] * s]);

  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  // Extract unique edges from faces
  const edgeSet = new Set();
  const edges = [];
  faces.forEach(f => {
    for (let i = 0; i < 3; i++) {
      const a = f[i], b = f[(i + 1) % 3];
      const key = Math.min(a, b) + "-" + Math.max(a, b);
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([a, b]);
      }
    }
  });

  return { vertices, edges };
}

// Inner smaller icosahedron
const outerGeo = createIcosahedron(140);
const innerGeo = createIcosahedron(70);

export default function WireframeOrb({ breathScale = 1 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const scaleRef = useRef(breathScale);

  useEffect(() => {
    scaleRef.current = breathScale;
  }, [breathScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (time) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scale = scaleRef.current;

      ctx.clearRect(0, 0, w, h);

      const rx = time * 0.00003;
      const ry = time * 0.00005;
      const rz = time * 0.00002;

      // Draw a geometry set
      const drawGeo = (geo, color, opacity, scaleMultiplier) => {
        const finalScale = scale * scaleMultiplier;
        const projected = geo.vertices.map(v => {
          let p = [v[0] * finalScale, v[1] * finalScale, v[2] * finalScale];
          p = rotateX(p, rx);
          p = rotateY(p, ry);
          p = rotateZ(p, rz);
          return project(p, w, h, 500);
        });

        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        geo.edges.forEach(([a, b]) => {
          const pa = projected[a];
          const pb = projected[b];
          ctx.moveTo(pa[0], pa[1]);
          ctx.lineTo(pb[0], pb[1]);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      };

      // Outer icosahedron — deep blue
      drawGeo(outerGeo, "#2E5D8E", 0.6, 1);
      // Inner icosahedron — cream, counter-rotation handled via slightly different time offset
      const rx2 = -time * 0.00002;
      const ry2 = -time * 0.00004;
      const rz2 = -time * 0.000015;

      const projectedInner = innerGeo.vertices.map(v => {
        let p = [v[0] * scale * 1, v[1] * scale * 1, v[2] * scale * 1];
        p = rotateX(p, rx2);
        p = rotateY(p, ry2);
        p = rotateZ(p, rz2);
        return project(p, w, h, 500);
      });

      ctx.strokeStyle = "#7B6BA8";
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.25;

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ background: "transparent" }}
    />
  );
}