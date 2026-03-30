import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SoftBlob from "../components/SoftBlob";
import SoftBreathingOrb from "../components/SoftBreathingOrb";
import GeometricPattern from "../components/GeometricPattern";
import MainScreen from "../components/MainScreen";
import BreathingScreen from "../components/BreathingScreen";
import SupportScreen from "../components/SupportScreen";
import { getRandomTechnique } from "../lib/breathingTechniques";

export default function Home() {
  const [mode, setMode] = useState("idle"); // "idle" | "breathing"
  const [technique, setTechnique] = useState(null);
  const [breathScale, setBreathScale] = useState(1);
  const [showSupport, setShowSupport] = useState(false);
  const [theme, setTheme] = useState("light");
  const [backgroundStyle, setBackgroundStyle] = useState("soft");
  const animRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("pauseTheme") || "light";
    setTheme(saved);
    const savedBg = localStorage.getItem("pauseBackgroundStyle") || "soft";
    setBackgroundStyle(savedBg);
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

  // Breathing scale animation loop
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
      // Smooth easing
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

  const bgColor = theme === "light" ? "#F7F5F2" : "#0D1B2A";

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: bgColor }}
    >
      {/* Background styles */}
      {backgroundStyle === "soft" && <SoftBlob breathScale={breathScale} isBreathing={mode === "breathing"} />}
      {backgroundStyle === "geometric" && <GeometricPattern theme={theme} />}
      {backgroundStyle === "breathing" && <SoftBreathingOrb breathScale={breathScale} theme={theme} />}

      {/* UI overlays */}
      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <MainScreen key="main" onTap={startBreathing} onSupportClick={() => setShowSupport(true)} theme={theme} onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")} />
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