import { useEffect, useRef, useState } from "react";

// Private Sensory Studio experiment. Neon Paint is intentionally untouched.
const COLORS = ["#e9b5da", "#91d8d5", "#b8a9f3", "#f6c69c", "#e8e8ed"];
const MAX_PARTICLES = 1250;
const random = (min, max) => min + Math.random() * (max - min);

export default function SmokeScene({ backgroundMode = "dark", paused = false, preview = false }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: 0, y: 0, px: 0, py: 0, active: false, vx: 0, vy: 0, hold: 0, charge: 0 });
  const colorRef = useRef(COLORS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [clearVersion, clear] = useState(0);
  colorRef.current = color;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    let raf = 0, last = 0, tick = 0;
    const pointer = pointerRef.current;
    particlesRef.current = [];

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    // Layered, small particles form continuous, high-detail ribbons rather than blurry blobs.
    const emit = (x, y, count, tint, impulseX = 0, impulseY = 0) => {
      const particles = particlesRef.current;
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        const angle = random(0, Math.PI * 2);
        const speed = random(0.08, 0.55);
        const px = x + random(-4, 4), py = y + random(-4, 4);
        particles.push({
          x: px, y: py, oldX: px, oldY: py,
          vx: Math.cos(angle) * speed + impulseX * .12,
          vy: Math.sin(angle) * speed - random(.25, .65) + impulseY * .12,
          age: 0, life: random(105, 210), width: random(1.1, 3.8),
          tint, offset: random(-100, 100), spin: random(.6, 1.4)
        });
      }
    };

    const burst = (x, y, power, tint) => {
      const particles = particlesRef.current;
      const count = Math.round(85 + power * 180);
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        const angle = (i / count) * Math.PI * 2 + random(-.09,.09);
        const speed = random(1.1, 2.9) * (1 + power * 1.9);
        particles.push({x,y,oldX:x,oldY:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,age:0,life:random(45,105),width:random(.8,2.5),tint:i%5===0?"#fffbea":tint,offset:random(-100,100),spin:random(.3,.8),firework:true});
      }
    };

    const draw = now => {
      const dt = Math.min((now - (last || now)) / 16.667, 2);
      last = now;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = backgroundMode === "light" ? "#faf6ef" : "#071321";
      ctx.fillRect(0, 0, w, h);

      if (!paused) {
        tick += dt;
        if (pointer.active) {
          pointer.hold += dt;
          pointer.charge = Math.min(1, pointer.hold / 95);
          emit(pointer.x, pointer.y, Math.max(1,Math.round(2+pointer.charge*5)), colorRef.current);
        }
        if (preview && Math.floor(tick) % 4 === 0) {
          emit(w * (.5 + Math.sin(tick * .012) * .14), h * .72, 2, COLORS[0]);
        }
        for (const p of particlesRef.current) {
          p.age += dt;
          p.oldX = p.x; p.oldY = p.y;
          // Two spatial scales of curl create folding, drifting wisps.
          if (p.firework) {
            p.vx *= Math.pow(.982,dt);
            p.vy = p.vy*Math.pow(.982,dt)+.024*dt;
            p.x += p.vx*dt; p.y += p.vy*dt;
            continue;
          }
          const a = Math.sin(p.y * .013 + tick * .009 + p.offset) +
                    .55 * Math.cos(p.x * .025 - tick * .016 + p.offset);
          const b = Math.cos(p.x * .014 - tick * .011 + p.offset) -
                    .55 * Math.sin(p.y * .023 + tick * .013);
          p.vx = (p.vx + a * .027 * p.spin * dt) * Math.pow(.989, dt);
          p.vy = (p.vy + b * .021 * dt - .018 * dt) * Math.pow(.991, dt);
          if (pointer.active) {
            const dx = p.x - pointer.x, dy = p.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 135) {
              const influence = (1 - dist / 135) ** 2 * dt;
              // Finger movement carries smoke with it and creates a small vortex.
              p.vx += (pointer.vx * .075 - dy * .011) * influence;
              p.vy += (pointer.vy * .075 + dx * .011) * influence;
            }
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
        particlesRef.current = particlesRef.current.filter(p =>
          p.age < p.life && p.x > -50 && p.x < w + 50 && p.y > -50 && p.y < h + 50
        );
        pointer.vx *= .75; pointer.vy *= .75;
      }

      // Thin, translucent filaments plus a restrained soft halo give the smoke depth.
      ctx.lineCap = "round";
      for (const p of particlesRef.current) {
        const fadeIn = Math.min(1, p.age / 10);
        const fadeOut = Math.max(0, 1 - p.age / p.life) ** 1.35;
        const alpha = fadeIn * fadeOut;
        const tailX = p.x - p.vx * 5, tailY = p.y - p.vy * 5;
        ctx.strokeStyle = p.tint;
        ctx.globalAlpha = alpha * (backgroundMode === "light" ? .17 : .24);
        ctx.lineWidth = p.width * 3.2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.quadraticCurveTo(p.oldX, p.oldY, p.x, p.y);
        ctx.stroke();
        ctx.globalAlpha = alpha * (backgroundMode === "light" ? .4 : .58);
        ctx.lineWidth = p.width * .55;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.quadraticCurveTo(p.oldX, p.oldY, p.x, p.y);
        ctx.stroke();
      }
      if (pointer.active) {
        const radius = 12 + pointer.charge * 32;
        ctx.globalAlpha = .3 + pointer.charge*.5;
        ctx.strokeStyle = colorRef.current;
        ctx.lineWidth = 2 + pointer.charge*2;
        ctx.beginPath();ctx.arc(pointer.x,pointer.y,radius,0,Math.PI*2);ctx.stroke();
        ctx.globalAlpha = .12 + pointer.charge*.15;
        ctx.fillStyle = colorRef.current;
        ctx.beginPath();ctx.arc(pointer.x,pointer.y,radius*.65,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const coords = e => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = e => {
      if (paused) return;
      const { x, y } = coords(e);
      Object.assign(pointer, { x, y, px: x, py: y, active: true, vx: 0, vy: 0, hold: 0, charge: 0 });
      canvas.setPointerCapture(e.pointerId);
      emit(x, y, 18, colorRef.current);
    };
    const move = e => {
      if (!pointer.active || paused) return;
      const { x, y } = coords(e);
      const dx = x - pointer.x, dy = y - pointer.y;
      const distance = Math.hypot(dx, dy);
      pointer.vx = dx; pointer.vy = dy;
      // Interpolate along the stroke to prevent dotted trails during quick gestures.
      const steps = Math.min(24, Math.max(1, Math.ceil(distance / 5)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        emit(pointer.x + dx * t, pointer.y + dy * t, 2, colorRef.current, dx / steps, dy / steps);
      }
      pointer.x = x; pointer.y = y;
    };
    const up = () => {
      if (pointer.active && !paused) burst(pointer.x,pointer.y,Math.max(.12,pointer.charge),colorRef.current);
      pointer.active = false; pointer.vx = 0; pointer.vy = 0; pointer.hold = 0; pointer.charge = 0;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("lostpointercapture", up);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      for (const [event, handler] of [["pointerdown", down], ["pointermove", move], ["pointerup", up], ["pointercancel", up], ["lostpointercapture", up]]) canvas.removeEventListener(event, handler);
      particlesRef.current = [];
    };
  }, [backgroundMode, paused, preview, clearVersion]);

  return <div style={{ width: "100%", height: "100%", position: "relative" }}>
    <canvas ref={canvasRef} aria-label="Interactive fireworks; press and hold to grow a glowing burst, then release to launch fireworks" style={{ display: "block", width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }} />
    {!preview && <div style={{ position: "absolute", left: 16, bottom: 16, right: 16, display: "flex", flexWrap: "wrap", gap: 9, alignItems: "center", padding: 10, borderRadius: 16, background: "#ffffffdd" }}>
      {COLORS.map(c => <button key={c} type="button" aria-label={"Fireworks color " + c} aria-pressed={color === c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: color === c ? "3px solid #263e40" : "2px solid white", cursor: "pointer" }} />)}
      <button type="button" onClick={() => clear(n => n + 1)} style={{ marginLeft: "auto", border: "1px solid #aaa", borderRadius: 12, padding: "8px 14px", background: "white", cursor: "pointer" }}>Clear</button>
    </div>}
  </div>;
}
