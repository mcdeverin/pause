import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getTotalCycleDuration } from "../lib/breathingTechniques";
import LiquidOrb from "./LiquidOrb";

const TOTAL_CYCLES = 4;

export default function BreathingScreen({ technique, onDone, theme }) {
  const [currentPhase, setCurrentPhase] = useState(technique.phases[0]);
  const [countdown, setCountdown] = useState(technique.phases[0].duration);
  const [orbScale, setOrbScale] = useState(1);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  const textColor = theme === "day" ? "#2C2C2C" : "#E8E0D0";

  useEffect(() => {
    let phaseIndex = 0;
    let cycleIndex = 0;
    let secondsInCurrentPhase = 0;
    const phaseDurations = technique.phases.map(p => p.duration);
    const cycleDuration = getTotalCycleDuration(technique);
    const totalSeconds = cycleDuration * TOTAL_CYCLES;

    const tick = () => {
      // Calculate total elapsed
      const totalElapsed = (cycleIndex * cycleDuration) + 
        phaseDurations.slice(0, phaseIndex).reduce((a, b) => a + b, 0) + 
        secondsInCurrentPhase;
      setProgress(Math.min(totalElapsed / totalSeconds, 1));

      // Countdown: remaining seconds in phase
      const remainingInPhase = phaseDurations[phaseIndex] - secondsInCurrentPhase;
      setCountdown(Math.max(remainingInPhase, 1));

      // Set phase label
      setCurrentPhase(technique.phases[phaseIndex]);

      // Calculate orb scale based on phase type
      const phase = technique.phases[phaseIndex];
      const phaseDuration = phaseDurations[phaseIndex];
      const progress = secondsInCurrentPhase / phaseDuration;

      let scale = 1;
      if (phase.label === "inhale") {
        scale = 1 + progress * 0.3; // 1.0 to 1.3
      } else if (phase.label === "exhale") {
        scale = 1.3 - progress * 0.3; // 1.3 to 1.0
      } else if (phase.label === "hold") {
        scale = 1.3; // Stay expanded
      } else if (phase.label === "hold2") {
        scale = 1; // Stay at rest
      } else if (phase.label === "inhale2") {
        // For Physiological Sigh second inhale, minor expansion
        scale = 1 + progress * 0.1; // 1.0 to 1.1
      }
      setOrbScale(scale);

      // Move to next second
      secondsInCurrentPhase++;

      // Check if phase is complete
      if (secondsInCurrentPhase >= phaseDuration) {
        secondsInCurrentPhase = 0;
        phaseIndex++;

        // Check if cycle is complete
        if (phaseIndex >= technique.phases.length) {
          phaseIndex = 0;
          cycleIndex++;

          // Check if all cycles are complete
          if (cycleIndex >= TOTAL_CYCLES) {
            setProgress(1);
            setTimeout(onDone, 500);
            return;
          }
        }
      }

      timerRef.current = setTimeout(tick, 1000);
    };

    timerRef.current = setTimeout(tick, 0);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [technique, onDone]);

  return (
    <motion.div
      className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Technique name - top */}
      <div
        style={{
          position: "absolute",
          top: "48px",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: "13px",
            letterSpacing: "5px",
            color: textColor,
            opacity: 0.55,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            margin: 0,
          }}
        >
          {technique.name.toUpperCase()}
        </p>
      </div>

      {/* Center: Orb with countdown and phase text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          zIndex: 5,
        }}
      >
        {/* Liquid Orb */}
        <LiquidOrb theme={theme} countdown={countdown} orbScale={orbScale} />
        <p
          style={{
            fontSize: "28px",
            color: textColor,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            margin: 0,
            textTransform: "lowercase",
            textAlign: "center",
            minHeight: "32px",
          }}
        >
          {currentPhase.label}
        </p>

        {/* Science fact */}
        <p
          style={{
            fontSize: "12px",
            color: theme === "day" ? "#888888" : "#A0A0A0",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 300,
            textAlign: "center",
            maxWidth: "280px",
            lineHeight: 1.6,
            margin: 0,
            opacity: 0.7,
          }}
        >
          {technique.science}
        </p>
      </div>

      {/* Bottom: Progress bar + done button */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          zIndex: 10,
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            width: "180px",
            height: "1px",
            background: theme === "day"
              ? "rgba(91, 141, 184, 0.15)"
              : "rgba(123, 107, 168, 0.15)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              background: theme === "day"
                ? "rgba(91, 141, 184, 0.6)"
                : "rgba(123, 107, 168, 0.6)",
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
            color: textColor,
            opacity: 0.35,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "opacity 700ms",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.6")}
          onMouseLeave={(e) => (e.target.style.opacity = "0.35")}
        >
          · done ·
        </button>
      </div>
    </motion.div>
  );
}