import { useEffect, useRef, useState } from "react";

// Independent smoke experiment: no changes to Neon Paint.
const COLORS = ["#e9b5da", "#91d8d5", "#b8a9f3", "#f6c69c", "#e8e8ed"];
export default function SmokeScene({ backgroundMode = "dark", paused = false, preview = false }) {
  const canvasRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0, active: false, lastX: 0, lastY: 0 });
  const particles = useRef([]);
  const colorRef = useRef(COLORS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [seed, setSeed] = useState(0);
  colorRef.current = color;
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame = 0, raf, previous = 0, mounted = true;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const spawn = (x, y, amount, tint) => {
      for (let i = 0; i < amount && particles.current.length < 650; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 1.1;
        particles.current.push({
          x: x + (Math.random() - .5) * 12, y: y + (Math.random() - .5) * 12,
          vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - .45,
          radius: 10 + Math.random() * 18, age: 0, life: 100 + Math.random() * 95,
          tint
        });
      }
    };
    const render = t => {
      if (!mounted) return;
      const dt = Math.min((t - (previous || t)) / 16.67, 2);
      previous = t;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = backgroundMode === "light" ? "#faf6ef" : "#071321";
      ctx.fillRect(0, 0, w, h);
      if (!paused) {
        frame++;
        if (preview && frame % 3 === 0) spawn(w * (.5 + Math.sin(frame / 85) * .15), h * .72, 2, COLORS[frame % COLORS.length]);
        particles.current.forEach(p => {
          p.age += dt;
          const curl = Math.sin(p.y * .021 + frame * .018 + p.x * .012) * .11;
          p.vx = (p.vx + curl * dt) * .993;
          p.vy = (p.vy - .009 * dt) * .996;
          if (pointer.current.active) {
            const dx = p.x - pointer.current.x, dy = p.y - pointer.current.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 1 && distance < 110) {
              const force = (1 - distance / 110) * .3 * dt;
              p.vx += dx / distance * force;
              p.vy += dy / distance * force;
            }
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.radius += .12 * dt;
        });
        particles.current = particles.current.filter(p => p.age < p.life && p.x > -100 && p.x < w + 100 && p.y > -100);
      }
      ctx.globalCompositeOperation = "source-over";
      for (const p of particles.current) {
        const alpha = Math.min(1, p.age / 24) * Math.pow(Math.max(0, 1 - p.age / p.life), 1.5) * .16;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.7);
        g.addColorStop(0, p.tint + Math.round(alpha * 255).toString(16).padStart(2, "0"));
        g.addColorStop(.42, p.tint + Math.round(alpha * 115).toString(16).padStart(2, "0"));
        g.addColorStop(1, p.tint + "00");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * 2.7, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    const down = e => {
      const r = canvas.getBoundingClientRect();
      pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top, lastX: e.clientX - r.left, lastY: e.clientY - r.top, active: true };
      canvas.setPointerCapture(e.pointerId);
      spawn(pointer.current.x, pointer.current.y, 24, colorRef.current);
    };
    const move = e => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (pointer.current.active && !paused) {
        const d = Math.hypot(x - pointer.current.lastX, y - pointer.current.lastY);
        spawn(x, y, Math.min(16, Math.max(2, Math.round(d / 3))), colorRef.current);
      }
      pointer.current.x = x; pointer.current.y = y;
      pointer.current.lastX = x; pointer.current.lastY = y;
    };
    const up = () => { pointer.current.active = false; };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => { mounted = false; cancelAnimationFrame(raf); observer.disconnect(); canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up); particles.current = []; };
  }, [backgroundMode, paused, preview, seed]);
  return <div style={{ width: "100%", height: "100%", position: "relative" }}>
    <canvas ref={canvasRef} aria-label="Interactive colored smoke; drag to create and swirl smoke" style={{ display: "block", width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }} />
    {!preview && <div style={{ position: "absolute", left: 16, bottom: 16, right: 16, display: "flex", flexWrap: "wrap", gap: 9, alignItems: "center", padding: 10, borderRadius: 16, background: "#ffffffdd" }}>
      {COLORS.map(c => <button key={c} type="button" aria-label={"Smoke color " + c} aria-pressed={color === c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: color === c ? "3px solid #263e40" : "2px solid white", cursor: "pointer" }} />)}
      <button type="button" onClick={() => setSeed(n => n + 1)} style={{ marginLeft: "auto", border: "1px solid #aaa", borderRadius: 12, padding: "8px 14px", background: "white", cursor: "pointer" }}>Clear</button>
    </div>}
  </div>;
}
