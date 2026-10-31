import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BACKDROP_PHOTOS, BACKGROUND_CSS, STUDIO_UI } from "@/lib/crystalStudio";

// Experimental ghost study: deliberately isolated from the breathing gallery.
// CSS/SVG mist layers are inexpensive on mobile and can be replaced with a
// dedicated shader after we settle the silhouette and movement.
function SmokeGhost({ breath, settings, variant = "mist", paused = false }) {
  const fullness = 0.74 + breath * settings.expansion / 100;
  const opacity = settings.opacity / 100;
  const wisps = variant === "mist" ? 8 : 5;
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "grid", placeItems: "center", overflow: "hidden" }}>
      <style>{`
        @keyframes ghostDrift { 0%,100% { transform:translate(-50%,-50%) rotate(-7deg) translateY(4px) } 50% { transform:translate(-50%,-50%) rotate(7deg) translateY(-7px) } }
        @keyframes ghostWisp { 0%,100% { opacity:.3; transform:translateY(8px) scale(.88) rotate(-9deg) } 50% { opacity:.72; transform:translateY(-12px) scale(1.12) rotate(12deg) } }
      `}</style>
      <div style={{ position: "relative", width: "52%", height: "65%", transform: `scale(${fullness})`, transition: "transform 90ms linear", filter: `drop-shadow(0 0 ${settings.glow}px rgba(210,229,255,.45))` }}>
        <svg viewBox="0 0 240 280" width="100%" height="100%" style={{ overflow: "visible" }} aria-label="Experimental translucent smoke ghost">
          <defs>
            <radialGradient id={`ghostBody-${variant}`} cx="47%" cy="32%" r="76%">
              <stop offset="0%" stopColor="#fff" stopOpacity={opacity}/>
              <stop offset="43%" stopColor="#eaf5ff" stopOpacity={opacity * .78}/>
              <stop offset="76%" stopColor="#c8d0f5" stopOpacity={opacity * .35}/>
              <stop offset="100%" stopColor="#b5c9ef" stopOpacity="0"/>
            </radialGradient>
            <filter id={`ghostBlur-${variant}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation={variant === "mist" ? settings.softness / 6 : settings.softness / 12}/>
            </filter>
            <filter id={`eyeBlur-${variant}`}><feGaussianBlur stdDeviation="3"/></filter>
          </defs>
          {Array.from({length: wisps}, (_, i) => (
            <ellipse key={i} cx={38 + i * 24} cy={180 + (i % 3) * 16} rx={25 + i % 3 * 9} ry={65 + i % 4 * 11}
              fill={i % 2 ? "#e4e5ff" : "#f6fbff"} opacity={opacity * .32}
              filter={`url(#ghostBlur-${variant})`}
              style={{ transformOrigin: `${38 + i * 24}px 190px`, animation: paused ? "none" : `ghostWisp ${4 + i * .48}s ease-in-out ${-i * .4}s infinite` }}/>
          ))}
          <path d="M120 18 C49 14 27 75 35 136 C41 181 21 216 14 259 C50 234 67 269 96 247 C120 276 144 241 166 259 C193 275 214 241 226 264 C203 209 203 183 206 137 C218 71 183 17 120 18Z"
            fill={`url(#ghostBody-${variant})`} filter={`url(#ghostBlur-${variant})`}/>
          <g opacity={settings.eyes / 100} filter={`url(#eyeBlur-${variant})`}>
            <ellipse cx="91" cy="116" rx="7" ry="11" fill="#53637b"/>
            <ellipse cx="149" cy="116" rx="7" ry="11" fill="#53637b"/>
          </g>
        </svg>
      </div>
    </div>
  );
}

const defaults = { expansion: 55, opacity: 82, softness: 24, glow: 22, eyes: 28, seconds: 8 };
const slider = (label, key, min, max, value, set) => (
  <label key={key} style={{ display: "grid", gap: 6, fontSize: 13 }}>
    <span style={{ display: "flex", justifyContent: "space-between" }}><span>{label}</span><b>{value}</b></span>
    <input type="range" min={min} max={max} value={value} onChange={e => set(key, Number(e.target.value))} style={{ width: "100%" }}/>
  </label>
);

export default function GhostStudio() {
  const [allowed, setAllowed] = useState(null);
  const [settings, setSettings] = useState(defaults);
  const [mode, setMode] = useState("dark");
  const [photoId, setPhotoId] = useState(BACKDROP_PHOTOS[0]?.id);
  const [playing, setPlaying] = useState(true);
  const [manual, setManual] = useState(false);
  const [breath, setBreath] = useState(0);
  const change = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  useEffect(() => {
    base44.auth.me().then(me => setAllowed(me?.role === "admin")).catch(() => setAllowed(true));
  }, []);
  useEffect(() => {
    if (!playing || manual) return;
    let frame;
    const start = performance.now();
    const tick = now => {
      const cycle = ((now - start) / 1000 / settings.seconds) % 1;
      setBreath(cycle < .5 ? cycle * 2 : 2 - cycle * 2);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, manual, settings.seconds]);
  const photo = BACKDROP_PHOTOS.find(p => p.id === photoId) || BACKDROP_PHOTOS[0];
  const background = mode === "photo" ? `url("${photo?.url}") center/cover` : BACKGROUND_CSS[mode] || "#101824";

  if (allowed === false) return <div style={{ minHeight: "100dvh", background: STUDIO_UI.page, color: STUDIO_UI.text, padding: 32 }}>This studio is private. <Link to="/">Back to Pause</Link></div>;
  return (
    <main style={{ minHeight: "100dvh", overflowY: "auto", background: STUDIO_UI.page, color: STUDIO_UI.text, padding: "24px max(18px, calc((100vw - 1180px)/2)) 60px", boxSizing: "border-box" }}>
      <Link to="/" style={{ color: STUDIO_UI.accent, fontSize: 13 }}>← Back to Pause</Link>
      <p style={{ color: STUDIO_UI.accent, letterSpacing: ".2em", fontSize: 11, fontWeight: 800, marginTop: 24 }}>ALWAYS PAUSE · DESIGN STUDIO</p>
      <h1 style={{ fontSize: "clamp(28px,4vw,40px)", margin: "4px 0" }}>Ghost Studio</h1>
      <p style={{ color: STUDIO_UI.muted, marginTop: 4 }}>Explore two smoke silhouettes before adding Ghost to the app.</p>
      <section style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", margin: "22px 0", fontSize: 13 }}>
        <label>Background <select value={mode} onChange={e => setMode(e.target.value)}><option value="dark">Dark</option><option value="light">Light</option><option value="photo">Nature photo</option></select></label>
        {mode === "photo" && <select value={photoId} onChange={e => setPhotoId(e.target.value)}>{BACKDROP_PHOTOS.map(p => <option key={p.id} value={p.id}>{p.label || p.id}</option>)}</select>}
        <button onClick={() => setPlaying(v => !v)}>{playing ? "Pause animation" : "Play animation"}</button>
        <button onClick={() => {setManual(v => !v);setBreath(.5)}}>{manual ? "Auto breathing" : "Manual breathing"}</button>
        <button onClick={() => setSettings(defaults)}>Reset controls</button>
      </section>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,330px),1fr))", gap: 20 }}>
        {["mist","spirit"].map((variant,i) => (
          <section key={variant} style={{ borderRadius: 18, background: "#fff", padding: 12, color: "#243142" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px 12px" }}><b>{i ? "Soft Spirit" : "Living Mist"}</b><span style={{ color: "#66768a", fontSize: 12 }}>{i ? "Defined" : "Airy"}</span></div>
            <div style={{ background, aspectRatio: "1/1", borderRadius: 12, overflow: "hidden" }}>
              <SmokeGhost breath={breath} settings={settings} variant={variant} paused={!playing}/>
            </div>
          </section>
        ))}
      </div>
      <section style={{ maxWidth: 650, marginTop: 24, padding: 20, borderRadius: 18, background: "#fff", color: "#243142" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>Experiment controls</h2>
        <div style={{ display: "grid", gap: 18 }}>
          {slider("Expansion %","expansion",0,75,settings.expansion,change)}
          {slider("Smoke opacity","opacity",15,100,settings.opacity,change)}
          {slider("Edge softness","softness",0,60,settings.softness,change)}
          {slider("Glow","glow",0,60,settings.glow,change)}
          {slider("Eyes visibility","eyes",0,100,settings.eyes,change)}
          {slider("Breathing cycle (seconds)","seconds",4,20,settings.seconds,change)}
          {manual && slider("Manual breath %","breath",0,100,Math.round(breath*100),(_,v)=>setBreath(v/100))}
        </div>
        <p style={{ fontSize: 12, color: "#687587", marginTop: 20 }}>Prototype only. Ghost is not yet selectable in Personalize Pause. Once we approve the look, production will use the app's shared breathing clock.</p>
      </section>
    </main>
  );
}
