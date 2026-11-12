import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LiquidSurfaceScene from "../components/visuals/LiquidSurfaceScene";
import LagoonLiquidOrb from "../components/visuals/LagoonLiquidOrb";
import OrbitScene from "../components/visuals/OrbitScene";
import PrismaticWaterScene from "../components/visuals/PrismaticWaterScene";
import NeonNatureScene from "../components/visuals/NeonNatureScene";
import { FONT, HEADING_FONT } from "../lib/design";
import { BACKDROP_PHOTOS, DEFAULT_BACKDROP_PHOTO } from "../lib/crystalStudio";

const STORAGE_KEY = "alwaysPauseOnboardingV1";
const STEPS = [
  { title: "A moment, just for you.", subtitle: "Touch the water. Stay a while.", options: [] },
  { title: "What brings you here?", subtitle: "Choose what feels right. Select all that apply.", key: "goals", multiple: true,
    options: ["Feel calmer", "Sleep better", "Find focus", "Feel energized", "Feel more present", "Just exploring"] },
  { title: "How would you like to pause?", subtitle: "", key: "experience",
    options: ["Guided breathing", "Sensory experiences", "A little of both", "I'm not sure yet"] },
  { title: "When do you need a moment most?", subtitle: "Select all that apply.", key: "moments", multiple: true,
    options: ["When I'm overwhelmed", "Before sleep", "Just a moment during my day", "Whenever I need a reset"] },
  { title: "This moment is yours.", subtitle: "Your space to breathe, explore, and return to yourself.", options: [] },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [exploring, setExploring] = useState(false);
  const [previewChoice, setPreviewChoice] = useState("");
  const [answers, setAnswers] = useState({ goals: [], experience: "", moments: [] });
  const [startedAt] = useState(() => Date.now());
  const photo = BACKDROP_PHOTOS.find((item) => item.id === DEFAULT_BACKDROP_PHOTO) || BACKDROP_PHOTOS[0];
  const current = STEPS[step];
  const explorationKind = answers.experience === "Guided breathing" ? "breathing" : answers.experience === "Sensory experiences" ? "sensory" : "both";
  const explorationCards = explorationKind === "breathing" ? BREATHING_CARDS : explorationKind === "sensory" ? SENSORY_CARDS : [...BREATHING_CARDS.slice(0, 2), ...SENSORY_CARDS.slice(0, 2)];
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

  function back() {
    if (exploring) { setExploring(false); setPreviewChoice(""); return; }
    setStep((value) => Math.max(0, value - 1));
  }

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1, answers, completedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
      }));
    } catch { /* Onboarding still works when local storage is unavailable. */ }
    navigate("/");
  }

  function next() {
    if (exploring) { setExploring(false); setStep(3); return; }
    if (step === STEPS.length - 1) return finish();
    if (!hasSelection) return;
    if (step === 2) { setPreviewChoice(""); setExploring(true); return; }
    setStep((value) => value + 1);
  }

  return (
    <main style={{ position: "fixed", inset: 0, width: "100%", height: "100dvh", overflow: "hidden", background: "#193b3c", color: "white", isolation: "isolate", fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <LiquidSurfaceScene photoUrl={photo?.url} strength={reduceMotion ? 0 : 0.68} viscosity={0.7} paused={Boolean(reduceMotion)} />
      </div>
      {/* The scrim preserves readability while the photograph and water stay visible. */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "linear-gradient(180deg, rgba(5,21,28,.55) 0%, rgba(5,21,28,.08) 35%, rgba(5,21,28,.16) 52%, rgba(5,21,28,.72) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: (exploring || current.options.length > 0) ? "flex-start" : "space-between", padding: "max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom))", pointerEvents: "none" }}>
        <header style={{ width: "100%", maxWidth: 460, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", pointerEvents: "auto" }}>
          <span style={{ fontFamily: HEADING_FONT, fontSize: 22, letterSpacing: "-.035em" }}>always pause</span>
          {(exploring || (step > 0 && step < 4)) && <button onClick={back} style={{ ...textButton, position: "absolute", right: 0 }}>Back</button>}
        </header>
        <AnimatePresence mode="wait">
          <motion.section key={exploring ? "explore" : step} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? {} : { opacity: 0, y: -12 }} transition={{ duration: .32 }}
            style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, marginTop: (exploring || current.options.length > 0) ? "clamp(24px, 5dvh, 72px)" : 0, pointerEvents: "none" }}>
            <h1 style={{ fontFamily: HEADING_FONT, fontSize: "clamp(36px, 8vw, 56px)", fontWeight: 400, lineHeight: 1.12, letterSpacing: "-.035em", margin: 0, textShadow: "0 2px 22px rgba(0,0,0,.22)" }}>{exploring ? "Explore your pause." : current.title}</h1>
            <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0, opacity: .95, textShadow: "0 1px 12px rgba(0,0,0,.4)" }}>{exploring ? "Choose something you’d like to try." : current.subtitle}</p>
          </motion.section>
        </AnimatePresence>
        <div style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 13, flex: (exploring || current.options.length > 0) ? 1 : "none", minHeight: 0, marginTop: (exploring || current.options.length > 0) ? "clamp(16px, 3dvh, 40px)" : 0, pointerEvents: "auto" }}>
          {exploring && <div role="group" aria-label="Explore experiences" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, flex: 1, minHeight: 0 }}>
            {explorationCards.map((card) => <button type="button" key={card.title} aria-pressed={previewChoice === card.title} onClick={() => setPreviewChoice(card.title)} style={{ position: "relative", isolation: "isolate", overflow: "hidden", borderRadius: 22, border: previewChoice === card.title ? "2px solid white" : "1px solid rgba(255,255,255,.5)", background: "rgba(12,35,41,.48)", color: "white", cursor: "pointer", minHeight: 0, padding: 0 }}>
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{card.kind === "breathing" ? <MiniBreathingOrb reducedMotion={reduceMotion} colors={card.colors} period={card.period} /> : <SensoryCardScene title={card.title} reducedMotion={reduceMotion} />}</div>
              <div aria-hidden="true" style={{ position: "absolute", inset: "40% 0 0", background: "linear-gradient(transparent,rgba(7,24,27,.92))", pointerEvents: "none" }} />
              <span style={{ position: "absolute", bottom: 14, left: 8, right: 8, zIndex: 1, fontWeight: 600, fontSize: 14 }}>{card.title}{previewChoice === card.title ? " ✓" : ""}</span>
            </button>)}
          </div>}
          {!exploring && current.options.length > 0 && (
            <div role="group" aria-label={current.title} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: current.options.length <= 4 ? 14 : 10, width: "100%", flex: current.options.length > 0 ? 1 : "none", minHeight: 0, gridTemplateRows: step === 2 ? "minmax(0, 1fr) auto" : current.options.length > 0 ? `repeat(${Math.ceil(current.options.length / 2)}, minmax(0, 1fr))` : undefined }}>
              {current.options.map((option) => {
                const active = current.multiple ? selected.includes(option) : selected === option;
                const featured = step === 2 && (option === "Guided breathing" || option === "Sensory experiences");
                const compact = step === 2 && !featured;
                const preview = featured;
                return <button key={option} type="button" aria-pressed={active} onClick={() => choose(option)}
                  style={{ width: "100%", position: "relative", overflow: "hidden", isolation: "isolate", padding: featured ? 0 : compact ? "13px 8px" : "12px 10px", minHeight: compact ? 52 : 0, borderRadius: compact ? 999 : 22, border: active ? "2px solid white" : "1px solid rgba(255,255,255,.45)", color: "white", background: active ? "rgba(255,255,255,.29)" : "rgba(12,35,41,.33)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", fontSize: 15, fontWeight: active ? 600 : 400, cursor: "pointer", display: "flex", flexDirection: featured ? "column" : "row", justifyContent: featured ? "flex-end" : "center", alignItems: "center", gap: featured ? 0 : 8 }}>
                  {featured && <ExperiencePreview kind={option} reduceMotion={reduceMotion} />}
                  {featured && <div aria-hidden="true" style={{ position: "absolute", inset: "42% 0 0", zIndex: 1, pointerEvents: "none", background: "linear-gradient(transparent, rgba(9,25,29,.76) 75%, rgba(9,25,29,.9))" }} />}
                  <span style={{ position: "relative", zIndex: 2, pointerEvents: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, textAlign: "center", lineHeight: 1.2, padding: featured ? "0 8px 8px" : 0 }}>{option}{active && <span aria-hidden="true">✓</span>}</span>
                  {featured && option === "Guided breathing" && <span style={{ position: "relative", zIndex: 2, pointerEvents: "none", fontSize: 10, opacity: .9, lineHeight: 1.2, paddingBottom: 16 }}>Box · 4-7-8 · Calm</span>}
                  {featured && option === "Sensory experiences" && <span aria-hidden="true" style={{ height: 16, position: "relative", zIndex: 2, pointerEvents: "none" }} />}
                </button>;
              })}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "center", gap: 7, padding: "8px 0" }} aria-label={exploring ? "Explore experiences" : "Step " + (step + 1) + " of 5"}>
            {STEPS.map((_, i) => <span key={i} style={{ width: i === step ? 19 : 6, height: 6, borderRadius: 10, background: i === step ? "white" : "rgba(255,255,255,.45)", transition: "width .25s" }} />)}
          </div>
          <button onClick={next} disabled={!hasSelection} style={{ border: 0, borderRadius: 40, padding: "16px 22px", minHeight: 54, background: hasSelection ? "#f5f1e9" : "#d1d1d1", color: "#263e40", fontSize: 16, fontWeight: 600, cursor: hasSelection ? "pointer" : "not-allowed" }}>
            {exploring ? "Continue →" : step === 0 ? "Begin your journey →" : step === 4 ? "Enter Always Pause →" : "Continue →"}
          </button>
          {(exploring || (step > 0 && step < 4)) && <button onClick={() => { if (exploring) { setExploring(false); setStep(3); } else setStep((value) => value + 1); }} style={{ ...textButton, alignSelf: "center", padding: 5 }}>Skip for now</button>}
          {step === 0 && <span style={{ fontSize: 12, textAlign: "center", opacity: .85 }}>Move your finger across the water</span>}
        </div>
      </div>
    </main>
  );
}
const textButton = { background: "transparent", border: 0, color: "white", fontSize: 13, padding: "8px 4px", cursor: "pointer" };


function ExperiencePreview({ kind, reduceMotion }) {
  const breathing = kind === "Guided breathing";
  return <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: breathing ? "none" : "auto" }}>
    {breathing
      ? <MiniBreathingOrb reducedMotion={reduceMotion} />
      : <OrbitScene accent="#c77d9b" motion={0.45} paused={Boolean(reduceMotion)} />}
  </div>;
}

function SensoryCardScene({ title, reducedMotion }) {
  if (title === "Popcorn") return <OrbitScene accent="#c77d9b" motion={0.45} paused={Boolean(reducedMotion)} />;
  if (title === "Iridescent Water") return <PrismaticWaterScene palette="lagoon" strength={0.7} softness={0.65} motion={0.65} paused={Boolean(reducedMotion)} />;
  if (title === "Neon Paint") return <NeonNatureScene preview />;
  if (title === "Underwater") return <iframe title="Underwater jellyfish preview" src="https://holtsetio.com/lab/aurelia/" loading="lazy" tabIndex={-1} style={{ width: "100%", height: "calc(100% + 250px)", marginTop: -45, border: 0, pointerEvents: "none", background: "#031426" }} />;
  return null;
}

function MiniBreathingOrb({ reducedMotion, colors, period = 8000 }) {
  const [breath, setBreath] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      setBreath((1 - Math.cos(((now - start) / period) * Math.PI * 2)) / 2);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, period]);
  return <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", pointerEvents: "none" }}>
    <div style={{ width: "min(86%, 260px)", aspectRatio: "1", transform: "scale(1.12)" }}><LagoonLiquidOrb breath={breath} reducedMotion={Boolean(reducedMotion)} options={{ colorFrom: colors?.[0], colorTo: colors?.[1] }} /></div>
  </div>;
}

const BREATHING_CARDS = [
  { title: "Box Breathing", kind: "breathing", colors: ["#76C7DF", "#C6E7DB"], period: 8000 },
  { title: "4-7-8 Breathing", kind: "breathing", colors: ["#c5a7ec", "#f1cce6"], period: 9500 },
  { title: "Calming Breath", kind: "breathing", colors: ["#91c9a2", "#e6ebae"], period: 11000 },
  { title: "Slow Breathing", kind: "breathing", colors: ["#f0b48b", "#f5d7b9"], period: 12000 },
];
const SENSORY_CARDS = [
  { title: "Popcorn", kind: "sensory", accent: "#c77d9b" },
  { title: "Iridescent Water", kind: "sensory", accent: "#8accc9" },
  { title: "Neon Paint", kind: "sensory", accent: "#ff388b" },
  { title: "Underwater", kind: "sensory", accent: "#82b7a2" },
];
