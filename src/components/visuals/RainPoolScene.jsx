import { useEffect, useRef } from "react";

// A quiet, continuously raining pool. Canvas 2D keeps this mobile-friendly.
export default function RainPoolScene({ speed = 0.55 }) {
  const canvasRef = useRef(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    let width = 1, height = 1, raf = 0, last = 0, clock = 0, spawn = 0;
    let visible = true;
    const rings = [];
    const drops = [];
    const random = (a, b) => a + Math.random() * (b - a);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      width = Math.max(1, r.width);
      height = Math.max(1, r.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const splash = (x, y, intensity = 1) => {
      if (rings.length > 190) rings.shift();
      rings.push({ x, y, age: 0, size: random(22, 54) * intensity, strength: random(.3, .75) });
    };
    const pointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      splash(event.clientX - rect.left, event.clientY - rect.top, 1.7);
    };
    canvas.addEventListener("pointerdown", pointer);
    const onVisibility = () => { visible = !document.hidden; last = 0; };
    document.addEventListener("visibilitychange", onVisibility);
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      if (!last) last = now;
      const dt = Math.min((now - last) / 1000, .05);
      last = now;
      clock += dt;
      const rate = .2 + Math.max(0, Math.min(1, speedRef.current)) * 1.8;
      const background = ctx.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, "#202f2c");
      background.addColorStop(.38, "#4c5c49");
      background.addColorStop(.72, "#6d7659");
      background.addColorStop(1, "#273e3b");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
      // Soft reflected foliage, blurred by the water's surface.
      ctx.save();
      ctx.filter = "blur(32px)";
      for (let i = 0; i < 7; i++) {
        const x = width * (.1 + (i * .179) % .9);
        const y = height * (.1 + (i * .29) % .85);
        const g = ctx.createRadialGradient(x, y, 0, x, y, width * .33);
        g.addColorStop(0, i % 2 ? "rgba(189,201,131,.22)" : "rgba(17,38,34,.29)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();
      // Fine, almost imperceptible surface shimmer.
      ctx.strokeStyle = "rgba(224,233,207,.055)";
      ctx.lineWidth = .65;
      for (let i = 0; i < 28; i++) {
        const y = (i * 41.7 + Math.sin(clock * .3 + i) * 7) % height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= width + 12; x += 12)
          ctx.lineTo(x, y + Math.sin(x * .025 + clock * .55 + i) * 2);
        ctx.stroke();
      }
      spawn += dt * (4 + rate * 23) * (width * height / (390 * 700));
      while (spawn >= 1) {
        spawn--;
        const x = random(0, width), y = random(0, height);
        splash(x, y, random(.65, 1.25));
        if (drops.length < 65 && Math.random() < .4)
          drops.push({ x, y: y - random(9, 24), end: y, life: 0, duration: random(.09, .2) / rate });
      }
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.life += dt;
        if (d.life >= d.duration) { drops.splice(i, 1); continue; }
        const p = d.life / d.duration;
        ctx.strokeStyle = "rgba(226,236,221," + (.12 * (1 - p)) + ")";
        ctx.lineWidth = .75;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y + (d.end - d.y) * p);
        ctx.lineTo(d.x + .5, d.y + (d.end - d.y) * p - 5);
        ctx.stroke();
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.age += dt * (.65 + rate * .3);
        if (r.age > 2.8) { rings.splice(i, 1); continue; }
        const fade = Math.pow(1 - r.age / 2.8, 1.7) * r.strength;
        for (let j = 0; j < 3; j++) {
          const radius = r.age * (r.size * 1.35) - j * 8;
          if (radius <= 0) continue;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, radius, radius * .42, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(232,244,223," + (fade * (.56 - j * .13)) + ")";
          ctx.lineWidth = j === 0 ? 1.15 : .7;
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(r.x + 1, r.y + 1.5, radius + 1.5, radius * .42 + 1, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(8,29,31," + (fade * .42) + ")";
          ctx.lineWidth = .9;
          ctx.stroke();
        }
      }
      const vignette = ctx.createRadialGradient(width / 2, height / 2, width * .12, width / 2, height / 2, Math.max(width, height) * .78);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(7,18,18,.33)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", pointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return <canvas ref={canvasRef} aria-label="Continuous rain falling onto a still pool of water" style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }} />;
}
