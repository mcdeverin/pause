import { useEffect, useRef } from "react";

// Reliable 2D particle field for the black-and-white sensory experience.
export default function WhiteParticlesScene({ paused = false, preview = false }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, w = 1, h = 1, last = 0, time = 0;
    const pointer = { x: 0, y: 0, active: false };
    const dots = Array.from({length: 230}, (_, i) => ({
      x: ((i * 0.61803398875 + 0.19) % 1),
      y: ((i * 0.754877666 + 0.37) % 1),
      size: 0.65 + ((i * 0.41421356) % 1) * 1.75,
      phase: i * 2.39996,
      speed: 0.15 + ((i * 0.31830989) % 1) * 0.55,
      depth: 0.3 + ((i * 0.271828) % 1) * 0.7
    }));
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width); h = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = now => {
      const dt = last ? Math.min((now-last)/1000, .05) : 0;
      last = now;
      if (!paused && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) time += dt;
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
      for (const dot of dots) {
        const drift = time * dot.speed * 5;
        const x = (dot.x * w + Math.sin(time*.23+dot.phase)*9 + w) % w;
        const y = (dot.y * h - drift % h + h) % h;
        const dx = pointer.active ? (pointer.x - w/2) * dot.depth * -.035 : 0;
        const dy = pointer.active ? (pointer.y - h/2) * dot.depth * -.035 : 0;
        const alpha = .55 + .4 * (0.5 + 0.5*Math.sin(time*.8+dot.phase));
        ctx.beginPath(); ctx.arc((x+dx+w)%w, (y+dy+h)%h, dot.size * (preview ? .9 : 1), 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    const move = e => { const r = canvas.getBoundingClientRect(); pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.active=true; };
    const leave = () => { pointer.active=false; };
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    canvas.addEventListener("pointermove",move); canvas.addEventListener("pointerleave",leave);
    resize(); raf=requestAnimationFrame(draw);
    return () => {cancelAnimationFrame(raf);observer.disconnect();canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerleave",leave);};
  }, [paused, preview]);
  return <canvas ref={canvasRef} aria-label="White floating particles against a black background" style={{display:"block",width:"100%",height:"100%",background:"#000",touchAction:"pan-y"}}/>;
}