import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SoftBlob from "../components/SoftBlob";
import MainScreen from "../components/MainScreen";
import BreathingScreen from "../components/BreathingScreen";
import SupportScreen from "../components/SupportScreen";
import { getRandomTechnique } from "../lib/breathingTechniques";

export default function Home() {
  const [mode, setMode] = useState("idle");
  const [technique, setTechnique] = useState(null);
  const [breathScale, setBreathScale] = useState(1);
  const [showSupport, setShowSupport] = useState(false);
  const [theme, setTheme] = useState("day");
  const animRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("pauseTheme") || "day";
    setTheme(saved);
  }, []);

  const startBreathing = useCallback(() => {
    const t = getRandomTechnique();
    setTechnique(t);
    setMode("breathing");
  }, []);

  const stopBreathing = useCallback(() => {
    setMode("idle");
    setBreathScale(1);
    setTechnique(null);
  }, []);

  useEffect(() => {
    if (mode !== "breathing" || !technique) return;

    let phaseIdx = 0;
    let phaseStart = Date.now();
    let currentScale = 1;

    const tick = () => {
      const now = Date.now();
      const phaseElapsed = now - phaseStart;
      const phase = technique.phases[phaseIdx];

      if (!phase) return;

      const phaseProgress = Math.min(phaseElapsed / phase.duration, 1);
      const eased = phaseProgress < 0.5
        ? 2 * phaseProgress * phaseProgress
        : 1 - Math.pow(-2 * phaseProgress + 2, 2) / 2;

      if (phase.label === "inhale") {
        currentScale = 0.7 + eased * 0.9;
      } else if (phase.label === "exhale") {
        currentScale = 1.6 - eased * 0.9;
      }

      setBreathScale(currentScale);

      if (phaseElapsed >= phase.duration) {
        phaseIdx++;
        if (phaseIdx >= technique.phases.length) {
          phaseIdx = 0;
        }
        phaseStart = now;
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [mode, technique]);

  const bgColor = theme === "day" ? "#F7F5F2" : "#0D1B2A";

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ background: bgColor }}
    >

      {/* Main content */}
      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <MainScreen
            key="main"
            onTap={startBreathing}
            onSupportClick={() => setShowSupport(true)}
            theme={theme}
            onToggleTheme={() => {
              const newTheme = theme === "day" ? "night" : "day";
              setTheme(newTheme);
              localStorage.setItem("pauseTheme", newTheme);
            }}
          />
        )}
        {mode === "breathing" && technique && (
          <BreathingScreen
            key="breathing"
            technique={technique}
            onDone={stopBreathing}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Support overlay */}
      <AnimatePresence>
        {showSupport && (
          <SupportScreen key="support" onClose={() => setShowSupport(false)} theme={theme} />
        )}
      </AnimatePresence>
    </div>
  );
}