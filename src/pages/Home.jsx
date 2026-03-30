import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import WireframeOrb from "../components/WireframeOrb";
import AmbientGlow from "../components/AmbientGlow";
import MainScreen from "../components/MainScreen";
import BreathingScreen from "../components/BreathingScreen";
import { getRandomTechnique } from "../lib/breathingTechniques";

export default function Home() {
  const [mode, setMode] = useState("idle"); // "idle" | "breathing"
  const [technique, setTechnique] = useState(null);
  const [breathScale, setBreathScale] = useState(1);
  const animRef = useRef(null);

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

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "#0A0806" }}
    >
      {/* Ambient glow behind orb */}
      <AmbientGlow breathScale={breathScale} isBreathing={mode === "breathing"} />

      {/* 3D wireframe orb */}
      <WireframeOrb breathScale={breathScale} />

      {/* UI overlays */}
      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <MainScreen key="main" onTap={startBreathing} />
        )}
        {mode === "breathing" && technique && (
          <BreathingScreen
            key="breathing"
            technique={technique}
            onDone={stopBreathing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}