import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTotalCycleDuration } from "../lib/breathingTechniques";
import CrispOrb from "./CrispOrb";

const TOTAL_CYCLES = 4;

export default function BreathingScreen({ technique, onDone, theme }) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [breathScale, setBreathScale] = useState(1);
  const animFrameRef = useRef(null);
  const totalDuration = getTotalCycleDuration(technique) * TOTAL_CYCLES;

  const currentPhase = technique.phases[currentPhaseIndex];

  useEffect(() => {
    const startTime = Date.now();
    let phaseIdx = 0;
    let cycles = 0;
    let phaseStart = startTime;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      setProgress(Math.min(elapsed / totalDuration, 1));

      const phaseElapsed = now - phaseStart;
      const phaseDuration = technique.phases[phaseIdx].duration;
      const phaseProgress = Math.min(phaseElapsed / phaseDuration, 1);

      const phase = technique.phases[phaseIdx];
      if (phase.label === "inhale") {
        setBreathScale(0.7 + phaseProgress * 0.9);
      } else if (phase.label === "exhale") {
        setBreathScale(1.6 - phaseProgress * 0.9);
      }

      if (phaseElapsed >= phaseDuration) {
        phaseIdx++;
        if (phaseIdx >= technique.phases.length) {
          phaseIdx = 0;
          cycles++;
          if (cycles >= TOTAL_CYCLES) {
            setProgress(1);
            setCycleCount(cycles);
            setTimeout(onDone, 1500);
            return;
          }
          setCycleCount(cycles);
        }
        setCurrentPhaseIndex(phaseIdx);
        phaseStart = now;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [technique, totalDuration, onDone]);

  return (
    <motion.div
      className="w-full min-h-screen flex flex-col items-center justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Technique name at top */}
      <div style={{ paddingTop: "60px", width: "100%", textAlign: "center" }}>
        <p
          style={{
            fontSize: "13px",
            letterSpacing: "2px",
            color: "#2C2C2C",
            opacity: 0.7,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {technique.name}
        </p>
      </div>

      {/* Center: Orb with phase word and science fact below */}
      <div className="flex-1 flex flex-col items-center justify-center w-full" style={{ minHeight: "50vh", paddingLeft: "24px", paddingRight: "24px" }}>
        {/* Orb */}
        <div style={{ width: "280px", height: "280px", marginBottom: "24px" }}>
          <CrispOrb breathScale={breathScale} isBreathing={true} theme={theme} />
        </div>

        {/* Phase label */}
        <div style={{ marginTop: "24px", marginBottom: "16px" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentPhase.label + currentPhaseIndex}
              style={{
                fontSize: "28px",
                color: "#2C2C2C",
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                margin: 0,
                textTransform: "lowercase",
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {currentPhase.label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Science fact */}
        <motion.p
          style={{
            fontSize: "12px",
            color: "#888888",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 300,
            textAlign: "center",
            maxWidth: "280px",
            lineHeight: 1.6,
            margin: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 2 }}
        >
          {technique.science}
        </motion.p>
      </div>

      {/* Bottom: Progress bar + done button */}
      <div className="w-full flex flex-col items-center" style={{ paddingBottom: "40px", gap: "20px" }}>
        {/* Progress bar */}
        <div style={{ width: "180px", height: "1px", background: "rgba(91, 141, 184, 0.15)", position: "relative", overflow: "hidden" }}>
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              background: "rgba(91, 141, 184, 0.6)",
              width: `${progress * 100}%`,
            }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Done button */}
        <button
          onClick={onDone}
          style={{
            fontSize: "10px",
            color: "#2C2C2C",
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "opacity 700ms",
          }}
          className="hover:opacity-60"
        >
          · done ·
        </button>
      </div>
    </motion.div>
  );
}