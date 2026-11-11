import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LiquidSurfaceScene from "../components/visuals/LiquidSurfaceScene";
import LagoonLiquidOrb from "../components/visuals/LagoonLiquidOrb";
import OrbitScene from "../components/visuals/OrbitScene";
import { FONT, HEADING_FONT } from "../lib/design";
import { BACKDROP_PHOTOS, DEFAULT_BACKDROP_PHOTO } from "../lib/crystalStudio";

const STORAGE_KEY = "alwaysPauseOnboardingV1";
const STEPS = [
  { title: "A moment, just for you.", subtitle: "Touch the water. Stay a while.", options: [] },
  { title: "What brings you here?", subtitle: "Choose what feels right. Select all that apply.", key: "goals", multiple: true,
    options: ["Feel calmer", "Sleep better", "Find focus", "Feel energized", "Feel more present", "Just exploring"] },
  { title: "How would you like to pause?", subtitle: "There's no wrong way.", key: "experience",
    options: ["Guided breathing", "Sensory experiences", "A little of both", "I'm not sure yet"] },
  { title: "When do you need a moment most?", subtitle: "Select all that apply.", key: "moments", multiple: true,
    options: ["When I'm overwhelmed", "Before sleep", "Just a moment during my day", "Whenever I need a reset"] },
  { title: "This moment is yours.", subtitle: "Your space to breathe, explore, and return to yourself.", options: [] },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ goals: [], experience: "", moments: [] });
  const [startedAt] = useState(() => Date.now());
  const photo = BACKDROP_PHOTOS.find((item) => item.id === DEFAULT_BACKDROP_PHOTO) || BACKDROP_PHOTOS[0];
  const current = STEPS[step];
  const selected = answers[current.key] || (current.multiple ? [] : "");
  const hasSelection = !current.key || (current.multiple ? selected.length > 0 : Boolean(selected));

  useEffect(() => {
    // Prevent the native page from scrolling over the full-screen water canvas.
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function choose(option) {
    if (current.multiple) {
      setAnswers((prev) => ({
        ...prev,
        [current.key]: prev[current.key].includes(option)
          ? prev[current.key].filter((value) => value !== option)
          : [...prev[current.key], option],
      }));
    } else {
      setAnswers((prev) => ({ ...prev, [current.key]: option }));
    }
  }

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1, answers, completedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
      }));
    } catch { /* Onboarding still works when local storage is unavailable. */ }
    try { localStorage.setItem("alwaysPauseTourPendingV1", "true"); } catch { /* optional tour */ }
    navigate("/");
  }

  function next() {
    if (step === STEPS.length - 1) return finish();
    if (!hasSelection) return;
    setStep((value) => value + 1);
  }

  return (
    <main style={{ position: "fixed", inset: 0, width: "100%", height: "100dvh", overflow: "hidden", background: "#193b3c", color: "white", isolation: "isolate", fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <LiquidSurfaceScene photoUrl={photo?.url} strength={reduceMotion ? 0 : 0.68} viscosity={0.7} paused={Boolean(reduceMotion)} />
      </div>
      {/* The scrim preserves readability while the photograph and water stay visible. */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "linear-gradient(180deg, rgba(5,21,28,.55) 0%, rgba(5,21,28,.08) 35%, rgba(5,21,28,.16) 52%, rgba(5,21,28,.72) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: current.options.length > 0 ? "flex-start" : "space-between", padding: "max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom))", pointerEvents: "none" }}>
        <header style={{ width: "100%", maxWidth: 460, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", pointerEvents: "auto" }}>
          <span style={{ fontFamily: HEADING_FONT, fontSize: 22, letterSpacing: "-.035em" }}>always pause</span>
          {step > 0 && step < 4 && <button onClick={() => setStep((value) => value - 1)} style={{ ...textButton, position: "absolute", right: 0 }}>Back</button>}
        </header>
        <AnimatePresence mode="wait">
          <motion.section key={step} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? {} : { opacity: 0, y: -12 }} transition={{ duration: .32 }}
            style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, marginTop: current.options.length > 0 ? "clamp(24px, 5dvh, 72px)" : 0, pointerEvents: "none" }}>
            <h1 style={{ fontFamily: HEADING_FONT, fontSize: "clamp(36px, 8vw, 56px)", fontWeight: 400, lineHeight: 1.12, letterSpacing: "-.035em", margin: 0, textShadow: "0 2px 22px rgba(0,0,0,.22)" }}>{current.title}</h1>
            <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0, opacity: .95, textShadow: "0 1px 12px rgba(0,0,0,.4)" }}>{current.subtitle}</p>
          </motion.section>
        </AnimatePresence>
        <div style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 13, flex: current.options.length > 0 ? 1 : "none", minHeight: 0, marginTop: current.options.length > 0 ? "clamp(16px, 3dvh, 40px)" : 0, pointerEvents: "auto" }}>
          {current.options.length > 0 && (
            <div role="group" aria-label={current.title} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: current.options.length <= 4 ? 14 : 10, width: "100%", flex: current.options.length > 0 ? 1 : "none", minHeight: 0, gridTemplateRows: step === 2 ? "minmax(0, 1fr) auto" : current.options.length > 0 ? `repeat(${Math.ceil(current.options.length / 2)}, minmax(0, 1fr))` : undefined }}>
              {current.options.map((option) => {
                const active = current.multiple ? selected.includes(option) : selected === option;
                const featured = step === 2 && (option === "Guided breathing" || option === "Sensory experiences");
                const compact = step === 2 && !featured;
                const preview = featured;
                return <button key={option} type="button" aria-pressed={active} onClick={() => choose(option)}
                  style={{ width: "100%", padding: featured ? "18px 10px" : compact ? "13px 8px" : "12px 10px", minHeight: compact ? 52 : 0, borderRadius: compact ? 999 : 22, border: active ? "1px solid white" : "1px solid rgba(255,255,255,.45)", color: "white", background: active ? "rgba(255,255,255,.29)" : "rgba(12,35,41,.33)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", fontSize: 15, fontWeight: active ? 600 : 400, cursor: "pointer", display: "flex", flexDirection: preview ? "column" : "row", justifyContent: "center", alignItems: "center", gap: preview ? 10 : 8 }}>
                  {preview && <ExperiencePreview kind={option} reduceMotion={reduceMotion} />}
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, textAlign: "center", lineHeight: 1.2 }}>{option}{active && <span aria-hidden="true">✓</span>}</span>
                  {preview && option === "Guided breathing" && <span style={{ fontSize: 10, opacity: .85, lineHeight: 1.2 }}>Box · 4-7-8 · Calm</span>}
                </button>;
              })}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 7, padding: "8px 0" }} aria-label={"Step " + (step + 1) + " of 5"}>
            {STEPS.map((_, i) => <span key={i} style={{ width: i === step ? 19 : 6, height: 6, borderRadius: 10, background: i === step ? "white" : "rgba(255,255,255,.45)", transition: "width .25s" }} />)}
          </div>
          <button onClick={next} disabled={!hasSelection} style={{ border: 0, borderRadius: 40, padding: "16px 22px", minHeight: 54, background: hasSelection ? "#f5f1e9" : "#d1d1d1", color: "#263e40", fontSize: 16, fontWeight: 600, cursor: hasSelection ? "pointer" : "not-allowed" }}>
            {step === 0 ? "Begin your journey →" : step === 4 ? "Enter Always Pause →" : "Continue →"}
          </button>
          {step > 0 && step < 4 && <button onClick={() => setStep((value) => value + 1)} style={{ ...textButton, alignSelf: "center", padding: 5 }}>Skip for now</button>}
          {step === 0 && <span style={{ fontSize: 12, textAlign: "center", opacity: .85 }}>Move your finger across the water</span>}
        </div>
      </div>
    </main>
  );
}
const textButton = { background: "transparent", border: 0, color: "white", fontSize: 13, padding: "8px 4px", cursor: "pointer" };


function ExperiencePreview({ kind, reduceMotion }) {
  const breathing = kind === "Guided breathing";
  const sensory = kind === "Sensory experiences";
  if (!breathing && !sensory) return null;
  return <div aria-hidden="true" style={{ width: "min(100%, 170px)", height: "clamp(90px, 15dvh, 155px)", position: "relative", overflow: "hidden", borderRadius: 18, flexShrink: 1 }}>
    {breathing ? <MiniBreathingOrb reducedMotion={reduceMotion} /> : <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden" }} onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()}><OrbitScene accent="#c77d9b" motion={0.45} paused={Boolean(reduceMotion)} /></div>}
  </div>;
}

function MiniBreathingOrb({ reducedMotion }) {
  const [breath, setBreath] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      // Four-second inhale, four-second exhale; preview only, not a session clock.
      setBreath((1 - Math.cos(((now - start) / 8000) * Math.PI * 2)) / 2);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);
  return <div style={{ width: "100%", height: "100%", padding: 9, boxSizing: "border-box", pointerEvents: "none" }}><LagoonLiquidOrb breath={breath} reducedMotion={Boolean(reducedMotion)} /></div>;
}
