import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Crosshair, Moon, Sun, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import BackgroundLayer from "./BackgroundLayer";
import { MOMENTS } from "../lib/moments";

const ICONS = { calm: Leaf, focus: Crosshair, wind_down: Moon, reset: Sun };

export default function PauseSetup({ theme, backgroundSettings, photo, onBack, onBegin, busy = false, voiceAvailable = true }) {
  const [moment, setMoment] = useState(null);
  const [voice, setVoice] = useState(false);
  const selected = MOMENTS.find((entry) => entry.id === moment);
  return (
    <motion.main className="screen-fit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "relative", isolation: "isolate", display: "flex", flexDirection: "column", padding: "calc(env(safe-area-inset-top, 44px) + 12px) 24px calc(env(safe-area-inset-bottom, 20px) + 24px)", color: "#fff", boxSizing: "border-box" }}>
      <BackgroundLayer settings={backgroundSettings} theme={theme} photo={photo} />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,27,32,.58), rgba(8,27,32,.20) 45%, rgba(8,27,32,.74))", pointerEvents: "none" }} />
      <header style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button type="button" onClick={onBack} aria-label="Back to home" style={backButton}><ArrowLeft size={22} /></button>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>always pause.</span>
        <span style={{ width: 44 }} />
      </header>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, maxWidth: 520, width: "100%", margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400, fontSize: "clamp(36px, 8vw, 52px)", lineHeight: 1.1, margin: 0 }}>What do you need right now?</h1>
          <p style={{ fontSize: 15, opacity: .92, marginTop: 12 }}>A moment for whatever you're feeling.</p>
        </div>
        <div role="group" aria-label="Choose your moment" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {MOMENTS.map((item) => { const Icon = ICONS[item.id]; const active = moment === item.id; return (
            <button key={item.id} type="button" aria-pressed={active} onClick={() => setMoment(item.id)}
              style={{ ...glass, minHeight: 80, background: active ? "rgba(255,255,255,.28)" : glass.background, borderColor: active ? "#fff" : "rgba(255,255,255,.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14 }}>
              <Icon size={20} strokeWidth={1.8} />{item.label}
            </button>
          ); })}
        </div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 14, fontWeight: 600 }}>How would you like to be guided?</div>
        <div role="group" aria-label="Guidance preference" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button type="button" aria-pressed={voice} disabled={!voiceAvailable} onClick={() => setVoice(true)}
            style={{ ...glass, opacity: voiceAvailable ? 1 : .55, background: voice ? "rgba(255,255,255,.28)" : glass.background, borderColor: voice ? "#fff" : "rgba(255,255,255,.5)", minHeight: 72, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <Volume2 size={20} />Guided by voice
          </button>
          <button type="button" aria-pressed={!voice} onClick={() => setVoice(false)}
            style={{ ...glass, background: !voice ? "rgba(255,255,255,.28)" : glass.background, borderColor: !voice ? "#fff" : "rgba(255,255,255,.5)", minHeight: 72, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <VolumeX size={20} />Quiet guidance
          </button>
        </div>
        {!voiceAvailable && <p style={{ textAlign: "center", fontSize: 12, margin: 0 }}>Voice cues aren't available on this device yet.</p>}
      </div>
      <div style={{ position: "relative", width: "100%", maxWidth: 520, margin: "0 auto" }}>
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
