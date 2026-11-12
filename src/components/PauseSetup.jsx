import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Crosshair, Moon, Sun, Zap, Layers, ArrowLeft } from "lucide-react";
import BackgroundLayer from "./BackgroundLayer";
import { MOMENTS } from "../lib/moments";

const ICONS = { calm: Leaf, focus: Crosshair, wind_down: Moon, reset: Sun, energy: Zap, explore_all: Layers };

export default function PauseSetup({ theme, backgroundSettings, photo, onBack, onBegin, busy = false, voiceAvailable = true, defaultVoice = false, onVoiceChange }) {
  const [moment, setMoment] = useState(null);
  const [voice, setVoice] = useState(typeof defaultVoice === "string" ? (defaultVoice === "none" ? "none" : "full") : defaultVoice ? "full" : "none");
  const selected = MOMENTS.find((entry) => entry.id === moment);
  return (
    <motion.main className="screen-fit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "relative", isolation: "isolate", display: "flex", flexDirection: "column", padding: "calc(env(safe-area-inset-top, 44px) + 12px) 24px calc(env(safe-area-inset-bottom, 20px) + 16px)", color: "#fff", boxSizing: "border-box" }}>
      <BackgroundLayer settings={backgroundSettings} theme={theme} photo={photo} />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,27,32,.58), rgba(8,27,32,.20) 45%, rgba(8,27,32,.74))", pointerEvents: "none" }} />
      <header style={{ position: "relative", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button type="button" onClick={onBack} aria-label="Back to home" style={backButton}><ArrowLeft size={22} /></button>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>always pause.</span>
        <span style={{ width: 44 }} />
      </header>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, maxWidth: 520, width: "100%", margin: "0 auto", padding: "8px 0", boxSizing: "border-box", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 2 }}>
          <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400, fontSize: "clamp(30px, 6vw, 44px)", lineHeight: 1.1, margin: 0 }}>What do you need right now?</h1>
          <p style={{ fontSize: 15, opacity: .92, marginTop: 6, marginBottom: 4 }}>A moment for whatever you're feeling.</p>
        </div>
        <div role="group" aria-label="Choose your moment" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {MOMENTS.map((item) => { const Icon = ICONS[item.id]; const active = moment === item.id; return (
            <button key={item.id} type="button" aria-pressed={active} onClick={() => setMoment(item.id)}
              style={{ ...glass, minHeight: 58, padding: "7px 10px", background: active ? "rgba(255,255,255,.28)" : glass.background, borderColor: active ? "#fff" : "rgba(255,255,255,.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 14 }}>
              <Icon size={20} strokeWidth={1.8} />{item.label}
            </button>
          ); })}
        </div>
        <div style={{ textAlign: "center", marginTop: 2, fontSize: 13, fontWeight: 500, opacity: .9 }}>Your guidance preference</div>
        <div role="group" aria-label="Guidance preference" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          {[
            { id: "full", title: "Guided", description: "Lauren’s voice" },
            { id: "none", title: "Not Guided", description: "Visual only" },
          ].map((option) => {
            const active = voice === option.id;
            const disabled = !voiceAvailable && option.id !== "none";
            return (
              <button key={option.id} type="button" aria-pressed={active} disabled={disabled}
                onClick={() => { setVoice(option.id); onVoiceChange?.(option.id); }}
                style={{ ...glass, opacity: disabled ? .55 : 1, background: active ? "rgba(255,255,255,.28)" : glass.background, borderColor: active ? "#fff" : "rgba(255,255,255,.5)", minHeight: 52, padding: "7px 12px", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: 2, textAlign: "left" }}>
                <span style={{ fontWeight: 600 }}>{option.title}</span>
                <span style={{ fontSize: 11, lineHeight: 1.3, opacity: .88 }}>{option.description}</span>
              </button>
            );
          })}
        </div>
        {!voiceAvailable && <p style={{ textAlign: "center", fontSize: 12, margin: 0 }}>Voice cues aren't available on this device yet.</p>}
      </div>
      <div style={{ position: "relative", flexShrink: 0, width: "100%", maxWidth: 520, margin: "6px auto 0" }}>
        <button type="button" disabled={!selected || busy} onClick={() => onBegin(selected.id, voice)}
          style={{ width: "100%", border: 0, borderRadius: 999, minHeight: 56, fontSize: 16, fontWeight: 600, background: selected && !busy ? "#f6f1e9" : "#bdbdbd", color: "#213d40", cursor: selected && !busy ? "pointer" : "not-allowed" }}>
          {busy ? "Preparing your moment…" : "Begin this moment →"}
        </button>
      </div>
    </motion.main>
  );
}
const glass = { border: "1px solid rgba(255,255,255,.5)", borderRadius: 22, color: "#fff", background: "rgba(12,35,41,.36)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 };
const backButton = { border: 0, background: "transparent", color: "#fff", width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer" };
