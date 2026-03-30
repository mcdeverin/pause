import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LiquidOrb from "./LiquidOrb";

const TOTAL_CYCLES = 4;

export default function BreathingScreen({ technique, onDone, theme }) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(technique.phases[0]);

  const textColor = theme === "day" ? "#2C2C2C" : "#E8E0D0";

  // Track progress for the progress bar
  const getTotalCycleDuration = (tech) => {
    return tech.phases.reduce((sum, p) => sum + p.duration, 0);
  };

  useEffect(() => {
    let phaseIndex = 0;
    let cycleIndex = 0;
    let secondsElapsed = 0;
    const phaseDurations = technique.phases.map(p => p.duration);
    const cycleDuration = getTotalCycleDuration(technique);
    const totalSeconds = cycleDuration * TOTAL_CYCLES;
    let timerRef = null;

    const tick = () => {
      secondsElapsed++;
      setProgress(Math.min(secondsElapsed / totalSeconds, 1));

      // Check if all cycles are done
      if (cycleIndex >= TOTAL_CYCLES) {
        setProgress(1);
        setTimeout(onDone, 500);
        return;
      }

      timerRef = setTimeout(tick, 1000);
    };

    timerRef = setTimeout(tick, 0);

    return () => {
      if (timerRef) clearTimeout(timerRef);
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
        <LiquidOrb theme={theme} isBreathing={true} technique={technique} />
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
          {currentPhase?.label || "inhale"}
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