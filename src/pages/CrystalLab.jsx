import { useState } from "react";
import CrystalPrototype, { CRYSTAL_DEFAULTS } from "../components/visuals/CrystalPrototype";

const PRESETS = {
  "Clear Quartz": { tint: "#e4eff9", edge: "#a5bbd3", transmission: 0.35, metalness: 0.06, opacity: 0.94 },
  "Moonstone": { tint: "#d7d9f4", edge: "#b0c4df", transmission: 0.22, metalness: 0.12, opacity: 0.94 },
  "Rose Quartz": { tint: "#f3c7d8", edge: "#d9a1bd", transmission: 0.16, metalness: 0.08, opacity: 0.97 },
  "Aquamarine": { tint: "#9edcdd", edge: "#6ba7b8", transmission: 0.28, metalness: 0.08, opacity: 0.95 },
  "Amethyst": { tint: "#b7a2eb", edge: "#816bb2", transmission: 0.18, metalness: 0.18, opacity: 0.97 },
};
const CONTROLS = [
  ["facets", "Facet complexity", 0, 2, 1],
  ["opacity", "Opacity", 0.2, 1, 0.01],
  ["transmission", "Glass transmission", 0, 0.8, 0.01],
  ["roughness", "Surface roughness", 0, 1, 0.01],
  ["metalness", "Reflective metalness", 0, 1, 0.01],
  ["light", "Key light", 0, 5, 0.05],
  ["rotation", "Rotation speed", 0, 1.5, 0.01],
  ["size", "Crystal size", 0.55, 1.4, 0.01],
  ["breathStrength", "Breathing expansion", 0, 0.45, 0.01],
  ["breath", "Manual breath position", 0, 1, 0.01],
];
const buttonStyle = { border: "1px solid #596172", background: "#303748", color: "#f7f7fa", borderRadius: 999, padding: "10px 14px", fontSize: 12, cursor: "pointer" };

export default function CrystalLab() {
  const [settings, setSettings] = useState({ ...CRYSTAL_DEFAULTS });
  const [dark, setDark] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [notice, setNotice] = useState("");
  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      setNotice("Copied! Paste these settings into ChatGPT when you find your favorite.");
    } catch {
      setNotice("Clipboard unavailable. You can copy the JSON from below.");
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#11151d", color: "#f7f6f8", fontFamily: "Inter, system-ui, sans-serif", padding: "26px 20px" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        <header style={{ marginBottom: 22 }}>
          <div style={{ letterSpacing: "0.22em", fontSize: 11, color: "#b6bac6", textTransform: "uppercase" }}>Always Pause · Design Studio</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 500, margin: "8px 0" }}>Crystal Lab</h1>
          <p style={{ color: "#b6bac6", margin: 0 }}>A solid, faceted gemstone. It breathes and rotates, but never melts or morphs.</p>
          <nav style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 13 }}>
            <a href="/visual-lab" style={{ color: "#cdb9fa" }}>Living Lab</a>
            <span style={{ color: "#a9adba" }}>Crystal Lab</span>
          </nav>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 22 }}>
          <section style={{
            borderRadius: 24, minHeight: 440, position: "relative", overflow: "hidden",
            background: dark ? "radial-gradient(circle at 50% 42%, #32394c, #141720 76%)" : "radial-gradient(circle at 50% 42%, #ffffff, #e7e5ed 76%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: "min(100%, 460px)", aspectRatio: "1", maxHeight: 450 }}>
              <CrystalPrototype settings={settings} animate={playing} />
            </div>
            <div style={{ position: "absolute", bottom: 20, display: "flex", gap: 8 }}>
              <button style={buttonStyle} onClick={() => setPlaying(p => !p)}>{playing ? "Pause rotation" : "Play rotation"}</button>
              <button style={buttonStyle} onClick={() => setDark(d => !d)}>{dark ? "Light background" : "Dark background"}</button>
            </div>
          </section>
          <section style={{ borderRadius: 24, background: "#202530", padding: 24, maxHeight: "78vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 19, margin: "0 0 14px", fontWeight: 550 }}>Gemstone palettes</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
              {Object.entries(PRESETS).map(([name, preset]) => (
                <button key={name} style={buttonStyle} onClick={() => setSettings(s => ({ ...s, ...preset }))}>{name}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
              {[["tint", "Gemstone color"], ["edge", "Facet edge color"]].map(([key, label]) => (
                <label key={key} style={{ fontSize: 12, color: "#c4c9d3", display: "grid", gap: 7 }}>
                  {label}
                  <input type="color" value={settings[key]} onChange={e => update(key, e.target.value)} style={{ width: "100%", height: 44, border: "none", background: "transparent", cursor: "pointer" }} />
                  <span style={{ fontFamily: "monospace", fontSize: 11 }}>{settings[key]}</span>
                </label>
              ))}
            </div>
            <h2 style={{ fontSize: 19, margin: "0 0 18px", fontWeight: 550 }}>Cut, light & movement</h2>
            {CONTROLS.map(([key, label, min, max, step]) => (
              <label key={key} style={{ display: "block", marginBottom: 18 }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, marginBottom: 8 }}>
                  <span>{label}</span><span style={{ color: "#b6bac6", fontVariantNumeric: "tabular-nums" }}>{key === "facets" ? settings[key] : settings[key].toFixed(2)}</span>
                </span>
                <input type="range" min={min} max={max} step={step} value={settings[key]} onChange={e => update(key, Number(e.target.value))} style={{ width: "100%", accentColor: "#d3bafa" }} />
              </label>
            ))}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={{ ...buttonStyle, background: "#cbb7f2", color: "#1c1d29" }} onClick={copy}>Copy my settings</button>
              <button style={buttonStyle} onClick={() => setSettings({ ...CRYSTAL_DEFAULTS })}>Reset</button>
            </div>
            {notice && <p role="status" style={{ fontSize: 12, color: "#d5c6f5" }}>{notice}</p>}
            <details style={{ marginTop: 16 }}>
              <summary style={{ fontSize: 12, cursor: "pointer", color: "#b6bac6" }}>View settings JSON</summary>
              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 11 }}>{JSON.stringify(settings, null, 2)}</pre>
            </details>
          </section>
        </div>
        <p style={{ color: "#8d95a3", fontSize: 12, marginTop: 20 }}>Development-only prototype. The Crystal visual in Personalize Pause is unchanged until we approve a design.</p>
      </div>
    </main>
  );
}
