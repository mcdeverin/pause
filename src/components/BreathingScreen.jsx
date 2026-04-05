import { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

const TOTAL_CYCLES = 4;

const DEFAULT_TECHNIQUE = {
  name: "Box Breathing",
  phases: "4,4,4,4",
  phaseLabels: "inhale,hold,exhale,hold",
  science: "Used by Navy SEALs to control stress under pressure.",
};

export default function BreathingScreen({ technique, onDone, theme, hapticsEnabled }) {
  const activeTechnique = technique || DEFAULT_TECHNIQUE;

  const phases = String(activeTechnique.phases || "").split(",").map(Number);
  const labels = String(activeTechnique.phaseLabels || "").split(",").map(s => s.trim());

  if (!phases.length || phases.some(isNaN)) {
    const fb = DEFAULT_TECHNIQUE;
    const fbPhases = fb.phases.split(",").map(Number);
    const fbLabels = fb.phaseLabels.split(",");
    return <BreathingScreenContent technique={fb} phases={fbPhases} labels={fbLabels} onDone={onDone} theme={theme} hapticsEnabled={hapticsEnabled} />;
  }

  return <BreathingScreenContent technique={activeTechnique} phases={phases} labels={labels} onDone={onDone} theme={theme} hapticsEnabled={hapticsEnabled} />;
}

function BreathingScreenContent({ technique, phases, labels, onDone, theme, hapticsEnabled }) {

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0]);
  const [orbScale, setOrbScale] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const timerRef = useRef(null);
  const phaseIndexRef = useRef(0);
  const secondsLeftRef = useRef(phases[0]);
  const cycleCountRef = useRef(0);
  const totalSecondsRef = useRef(phases.reduce((a, b) => a + b, 0) * TOTAL_CYCLES);
  const elapsedSecondsRef = useRef(0);

  const isDayTheme = theme === "day";
  const textColor = isDayTheme ? "#111111" : "#F0EDE8";

  // ── Haptic feedback ──────────────────────────────────────────────
  const triggerHaptic = (label) => {
    if (!hapticsEnabled || !navigator.vibrate) return;
    const l = label.toLowerCase();
    if (l.includes("inhale")) {
      navigator.vibrate([80, 40, 80]);        // soft double pulse — breathe in
    } else if (l.includes("exhale")) {
      navigator.vibrate([40, 30, 40, 30, 40]); // gentle triple fade — breathe out
    } else if (l.includes("hold")) {
      navigator.vibrate(150);                  // single sustained — stay still
    }
  };
  // ────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Haptic on the very first phase when session starts
    triggerHaptic(labels[0]);

    timerRef.current = setInterval(() => {
      secondsLeftRef.current -= 1;

      const currentPhaseIdx = phaseIndexRef.current;
      const currentLabel = labels[currentPhaseIdx].toLowerCase();
      const currentDuration = phases[currentPhaseIdx];
      const secondsElapsed = currentDuration - secondsLeftRef.current;
      const phaseProgress = secondsElapsed / currentDuration;

      // Calculate orb scale
      let newScale = 1.0;
      if (currentLabel.includes("inhale")) {
        newScale = 1.0 + 0.35 * phaseProgress;
      } else if (currentLabel.includes("exhale")) {
        newScale = 1.35 - 0.35 * phaseProgress;
      } else if (currentLabel.includes("hold")) {
        const prevLabel = currentPhaseIdx > 0 ? labels[currentPhaseIdx - 1].toLowerCase() : "";
        newScale = prevLabel.includes("inhale") ? 1.35 : 1.0;
      }

      setOrbScale(newScale);
      setSecondsLeft(secondsLeftRef.current);

      // Overall progress
      elapsedSecondsRef.current += 1;
      const overallProgress = Math.min(elapsedSecondsRef.current / totalSecondsRef.current, 1);
      setProgress(overallProgress);

      // Advance phase when countdown hits 0
      if (secondsLeftRef.current <= 0) {
        const nextPhaseIdx = (currentPhaseIdx + 1) % phases.length;

        if (nextPhaseIdx === 0) {
          cycleCountRef.current += 1;
          if (cycleCountRef.current >= TOTAL_CYCLES) {
            clearInterval(timerRef.current);
            setProgress(1);
            setTimeout(onDone, 500);
            return;
          }
        }

        phaseIndexRef.current = nextPhaseIdx;
        secondsLeftRef.current = phases[nextPhaseIdx];
        setPhaseIndex(nextPhaseIdx);

        // ── Haptic fires on every phase transition ──
        triggerHaptic(labels[nextPhaseIdx]);
        // ────────────────────────────────────────────
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phases, labels, onDone]);

  return (
    <motion.div
      className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: theme === "day" ? "#FAFAF8" : "#0D1117",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Technique name + info */}
      <div
        style={{
          position: "absolute",
          top: "13vh",
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.5em",
            color: textColor,
            fontFamily: "'Comfortaa', sans-serif",
            fontWeight: 300,
            margin: 0,
          }}
        >
          {technique.name.toUpperCase()}
        </p>
        <button
          onClick={() => setShowInfo((v) => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", opacity: 0.45 }}
        >
          <Info size={13} color={textColor} />
        </button>
      </div>

      {/* Science fact popup */}
      {showInfo && (
        <div
          onClick={() => setShowInfo(false)}
          style={{
            position: "absolute",
            top: "13vh",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
            background: isDayTheme ? "rgba(255,255,255,0.6)" : "rgba(20,30,50,0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${isDayTheme ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "14px",
            padding: "16px 20px",
            maxWidth: "260px",
            width: "calc(100vw - 48px)",
            cursor: "pointer",
          }}
        >
          <p style={{
            fontSize: "12px",
            color: textColor,
            fontFamily: "'Comfortaa', sans-serif",
            fontStyle: "italic",
            fontWeight: 300,
            lineHeight: 1.8,
            margin: 0,
            textAlign: "center",
          }}>
            {technique.science}
          </p>
        </div>
      )}

      {/* Orb */}
      <div
        style={{
          position: "absolute",
          top: "45vh",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 5,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(270px, 72vw)",
            height: "min(270px, 72vw)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: theme === "day"
                ? "radial-gradient(circle at 35% 35%, #4A7FA6 0%, #6BA888 100%)"
                : "radial-gradient(circle at 35% 35%, rgba(74, 91, 140, 0.9) 0%, rgba(155, 142, 196, 0.7) 60%, rgba(155, 142, 196, 0.5) 100%)",
              borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
              transform: `scale(${orbScale})`,
              transition: "transform 0.95s ease-in-out",
              animation: "liquidMorph 8s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Bottom: phase label + progress bar + done */}
      <div
        style={{
          position: "absolute",
          top: "75vh",
          bottom: "20px",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2vh",
          zIndex: 5,
          padding: "0 24px",
        }}
      >
        {/* Phase label */}
        <p
          style={{
            fontSize: "18px",
            color: textColor,
            fontFamily: "'Comfortaa', sans-serif",
            fontWeight: 300,
            margin: 0,
            textTransform: "lowercase",
            textAlign: "center",
            minHeight: "24px",
            letterSpacing: "0.25em",
            flexShrink: 0,
          }}
        >
          {labels[phaseIndex]}
        </p>

        {/* Progress bar */}
        <div
          style={{
            width: "120px",
            height: "3px",
            borderRadius: "999px",
            background: isDayTheme ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              borderRadius: "999px",
              background: isDayTheme ? "#4A7FA6" : "#4A5B9C",
            }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Done button */}
        <button
          onClick={onDone}
          style={{
            fontSize: "11px",
            marginTop: "2px",
            color: textColor,
            fontFamily: "'Comfortaa', sans-serif",
            fontWeight: 300,
            letterSpacing: "0.2em",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "opacity 700ms",
            padding: 0,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.6")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          · done ·
        </button>
      </div>
    </motion.div>
  );
}