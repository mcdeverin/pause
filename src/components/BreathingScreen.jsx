import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTotalCycleDuration } from "../lib/breathingTechniques";

const TOTAL_CYCLES = 4;

export default function BreathingScreen({ technique, onDone }) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [breathScale, setBreathScale] = useState(1);
  const animFrameRef = useRef(null);
  const phaseStartRef = useRef(Date.now());
  const totalDuration = getTotalCycleDuration(technique) * TOTAL_CYCLES;

  const currentPhase = technique.phases[currentPhaseIndex];

  const getTargetScale = useCallback((label) => {
    if (label === "inhale") return 1.6;
    if (label === "exhale") return 0.7;
    return breathScale; // hold keeps current
  }, [breathScale]);

  useEffect(() => {
    const startTime = Date.now();
    phaseStartRef.current = startTime;
    let phaseIdx = 0;
    let cycles = 0;
    let phaseStart = startTime;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      // Overall progress
      setProgress(Math.min(elapsed / totalDuration, 1));

      // Phase progress
      const phaseElapsed = now - phaseStart;
      const phaseDuration = technique.phases[phaseIdx].duration;
      const phaseProgress = Math.min(phaseElapsed / phaseDuration, 1);

      // Calculate breath scale based on phase
      const phase = technique.phases[phaseIdx];
      if (phase.label === "inhale") {
        setBreathScale(0.7 + phaseProgress * 0.9);
      } else if (phase.label === "exhale") {
        setBreathScale(1.6 - phaseProgress * 0.9);
      }
      // hold: keep current scale

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
      className="absolute inset-0 flex flex-col items-center justify-between z-10 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Technique name */}
      <div className="pt-16 sm:pt-20 text-center">
        <p
          className="font-cormorant text-[10px] sm:text-[11px] font-light tracking-[0.35em] uppercase"
          style={{ color: "#1C1C1E" }}
        >
          {technique.name}
        </p>
      </div>

      {/* Phase label — center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-24 sm:gap-32">
        <div className="h-8" />
        <AnimatePresence mode="wait">
          <motion.p
            key={currentPhase.label + currentPhaseIndex}
            className="font-cormorant text-xl sm:text-2xl font-light tracking-[0.3em]"
            style={{ color: "#1C1C1E" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentPhase.label}
          </motion.p>
        </AnimatePresence>

        {/* Science fact */}
        <motion.p
          className="font-cormorant italic text-[10px] sm:text-[11px] font-light max-w-[260px] sm:max-w-[300px] text-center leading-relaxed px-6"
          style={{ color: "#6B6B6B" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 2 }}
        >
          {technique.science}
        </motion.p>
      </div>

      {/* Bottom: progress line + done */}
      <div className="pb-12 sm:pb-16 w-full flex flex-col items-center gap-6 pointer-events-auto">
        {/* Progress line */}
        <div className="w-40 sm:w-52 h-px relative overflow-hidden" style={{ background: "rgba(46, 93, 142, 0.15)" }}>
          <motion.div
            className="absolute top-0 left-0 h-full"
            style={{
              background: "rgba(46, 93, 142, 0.6)",
              width: `${progress * 100}%`,
            }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Done button */}
        <button
          onClick={onDone}
          className="font-cormorant text-[10px] font-light tracking-[0.35em] cursor-pointer transition-colors duration-700 hover:opacity-60"
          style={{ color: "#1C1C1E" }}
        >
          · &nbsp;done&nbsp; ·
        </button>
      </div>
    </motion.div>
  );
}

export function useBreathScale() {
  return 1;
}