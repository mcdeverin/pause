import { useState } from "react";
import LivingOpalVisual from "../components/visuals/LivingOpalVisual";

const PRESETS = {
  "Soft Opal": ["#b6e8e4", "#a9d4f2", "#d3bafa", "#f2c8dc", "#fff0d6", "#b2e8df"],
  "Moonstone": ["#f9f6f0", "#c9d9e9", "#e7e1f4", "#d7ecf0", "#e9d8e9", "#c2cfe2"],
  "Mercury": ["#c7d0db", "#f5f6f8", "#8395ab", "#d4dce4", "#738599", "#f0f2f4"],
  "Sea Glass": ["#4dbbb1", "#b9e9d8", "#7fb5cc", "#d9f0e3", "#5e9fa5", "#c5e8e9"],
  "Halloween": ["#f5ad60", "#c28ce2", "#4a385e", "#f5d8ad", "#8e77b4", "#eb9fca"],
};
const DEFAULT = {
  colors: PRESETS["Soft Opal"],
  frequency: 0.85, amplitude: 0.75, speed: 1, metallic: 0.82,
  smoothness: 0.92, light: 1.3, blend: 0.45, size: 1,
  breathStrength: 0.22, breath: 0.5,
};
const SLIDERS = [
  ["frequency", "Shape frequency", 0.1, 3, 0.05],
  ["amplitude", "Deformation / wobble", 0, 2, 0.05],
  ["speed", "Movement speed", 0, 3, 0.05],
  ["metallic", "Metallic finish", 0, 1, 0.01],
  ["smoothness", "Surface gloss", 0.05, 1, 0.01],
  ["light", "Lighting intensity", 0.1, 3, 0.05],
  ["blend", "Color flow", 0, 3, 0.05],
  ["size", "Orb size", 0.5, 1.35, 0.01],
  ["breathStrength", "Breathing expansion", 0, 0.5, 0.01],
  ["breath", "Manual breath position", 0, 1, 0.01],
];
export default function VisualLab() {
  const [settings, setSettings] = useState(DEFAULT);
  const [background, setBackground] = useState("dark");
  const [playing, setPlaying] = useState(true);
  const [message, setMessage] = useState("");
  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));
  const copy = async () => {
    const json = JSON.stringify(settings, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setMessage("Settings copied — paste them into ChatGPT to save your favorite look.");
    } catch {
      setMessage("Copy unavailable; select the JSON below and copy manually.");
    }
  };
  const dark = background === "dark";
  return (
    <main style={{ minHeight: "100vh", background: "#11151d", color: "#f6f4f3", fontFamily: "Inter, system-ui, sans-serif", padding: "26px 20px" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        <header style={{ marginBottom: 22 }}>
          <div style={{ letterSpacing: "0.22em", fontSize: 11, color: "#b6bac6", textTransform: "uppercase" }}>Always Pause · Design Studio</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 500, margin: "8px 0" }}>Living Opal Lab</h1>
          <p style={{ color: "#b6bac6", margin: 0 }}>Explore color, tone, shape, light, movement and breath. Nothing here changes your saved app settings.</p>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 22 }}>
          <section style={{ borderRadius: 24, background: dark ? "radial-gradient(circle at 50% 42%, #303344, #141720 76%)" : "radial-gradient(circle at 50% 42%, #ffffff, #e6e5e9 76%)", minHeight: 440, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
            <div style={{ width: "min(100%, 460px)", aspectRatio: "1", maxHeight: 450 }}>
              <LivingOpalVisual animate={playing} labSettings={settings} />
            </div>
            <div style={{ position: "absolute", bottom: 20, display: "flex", gap: 8 }}>
              <button onClick={() => setPlaying(v => !v)} style={pill}>{playing ? "Pause motion" : "Play motion"}</button>
              <button onClick={() => setBackground(v => v === "dark" ? "light" : "dark")} style={pill}>{dark ? "Light background" : "Dark background"}</button>
            </div>
          </section>
          <section style={{ borderRadius: 24, background: "#202530", padding: 24, maxHeight: "78vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 19, margin: "0 0 14px", fontWeight: 550 }}>Color stories</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {Object.entries(PRESETS).map(([name, colors]) => <button key={name} onClick={() => update("colors", [...colors])} style={{ ...pill, background: "#303746" }}>{name}</button>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 25 }}>
              {settings.colors.map((color, i) => <label key={i} style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12, color: "#c4c9d3" }}>
                Tone {i + 1}
                <input aria-label={`Tone ${i + 1}`} type="color" value={color} onChange={e => update("colors", settings.colors.map((v, j) => j === i ? e.target.value : v))} style={{ width: "100%", height: 42, cursor: "pointer", border: "none", borderRadius: 10, background: "transparent" }} />
                <span style={{ fontFamily: "monospace", fontSize: 11 }}>{color}</span>
              </label>)}
            </div>
            <h2 style={{ fontSize: 19, margin: "0 0 18px", fontWeight: 550 }}>Sculpt & finish</h2>
            {SLIDERS.map(([key, label, min, max, step]) => <label key={key} style={{ display: "block", marginBottom: 19 }}>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, marginBottom: 9 }}>
                <span>{label}</span><span style={{ color: "#b6bac6", fontVariantNumeric: "tabular-nums" }}>{settings[key].toFixed(2)}</span>
              </span>
              <input type="range" min={min} max={max} step={step} value={settings[key]} onChange={e => update(key, Number(e.target.value))} style={{ width: "100%", accentColor: "#d3bafa" }} />
            </label>)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
              <button onClick={copy} style={{ ...pill, background: "#cbb7f2", color: "#1c1d29" }}>Copy my settings</button>
              <button onClick={() => { setSettings({ ...DEFAULT, colors: [...DEFAULT.colors] }); setMessage(""); }} style={pill}>Reset</button>
            </div>
            {message && <p role="status" style={{ fontSize: 12, color: "#d5c6f5", lineHeight: 1.5 }}>{message}</p>}
            <details style={{ marginTop: 16 }}>
              <summary style={{ fontSize: 12, cursor: "pointer", color: "#b6bac6" }}>View settings JSON</summary>
              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 11 }}>{JSON.stringify(settings, null, 2)}</pre>
            </details>
          </section>
        </div>
        <p style={{ color: "#8d95a3", fontSize: 12, marginTop: 20 }}>Development-only playground · Adapted from Knower Coder's MIT-licensed animated-blob. Not available in production builds.</p>
      </div>
    </main>
  );
}
const pill = { border: "1px solid #555c6b", color: "#f5f4f8", background: "#252b38", borderRadius: 999, padding: "10px 14px", fontSize: 12, cursor: "pointer" };
