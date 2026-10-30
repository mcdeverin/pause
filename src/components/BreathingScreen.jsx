import { useState, useEffect, useRef, useMemo } from "react";
import { Info } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import BreathingRing from "./BreathingRing";
import SessionTimerPill from "./SessionTimerPill";
import { FONT, getBackgroundStyle, getColors } from "../lib/design";
import { fillForPhase } from "../lib/breathing";

const TOTAL_CYCLES = 4;

const DEFAULT_TECHNIQUE = {
  name: "Box Breathing",
  phases: "4,4,4,4",
  phaseLabels: "inhale,hold,exhale,hold",
  science: "Used by Navy SEALs to control stress under pressure.",
};

const FALLBACK_PHASES = DEFAULT_TECHNIQUE.phases.split(",").map(Number);
const FALLBACK_LABELS = DEFAULT_TECHNIQUE.phaseLabels.split(",");

export default function BreathingScreen({
  technique,
  onDone,
  theme = "day",
  hapticsEnabled = true,
  visual = "orb",
  background = "classic",
  showTimer = true,
  showInstructions = true,
}) {
  const activeTechnique = technique || DEFAULT_TECHNIQUE;
  const reducedMotion = useReducedMotion();

  // Parsed once per technique so re-renders (e.g. a preference change) never
  // restart the session.
  const phases = useMemo(
    () => String(activeTechnique.phases || "").split(",").map(Number),
    [activeTechnique.phases]
  );
  const labels = useMemo(
    () => String(activeTechnique.phaseLabels || "").split(",").map((value) => value.trim()),
    [activeTechnique.phaseLabels]
  );

  const phasesValid = phases.length > 0 && !phases.some(isNaN);
  const activePhases = phasesValid ? phases : FALLBACK_PHASES;
  const activeLabels = useMemo(() => {
    const source = phasesValid ? labels : FALLBACK_LABELS;
    return activePhases.map((_, index) => source[index] || source[source.length - 1] || "");
  }, [phasesValid, labels, activePhases]);

  const colors = getColors(theme);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(activePhases[0]);
  const [orbScale, setOrbScale] = useState(1.0);
  const [breathFill, setBreathFill] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(
    () => activePhases.reduce((a, b) => a + b, 0) * TOTAL_CYCLES
  );
  const [showInfo, setShowInfo] = useState(false);

  const timerRef = useRef(null);
  const phaseIndexRef = useRef(0);
  const secondsLeftRef = useRef(activePhases[0]);
  const cycleCountRef = useRef(0);
  const totalSecondsRef = useRef(activePhases.reduce((a, b) => a + b, 0) * TOTAL_CYCLES);
  const elapsedSecondsRef = useRef(0);

  // ── Haptic feedback ──────────────────────────────────────────────
  const triggerHaptic = (label) => {
    if (!hapticsEnabled || !navigator.vibrate) return;
    const l = label.toLowerCase();
    if (l.includes("inhale")) {
      navigator.vibrate([80, 40, 80]); // soft double pulse — breathe in
    } else if (l.includes("exhale")) {
      navigator.vibrate([40, 30, 40, 30, 40]); // gentle triple fade — breathe out
    } else if (l.includes("hold")) {
      navigator.vibrate(150); // single sustained — stay still
    }
  };
  // ────────────────────────────────────────────────────────────────

  useEffect(() => {
    triggerHaptic(activeLabels[0]);

    timerRef.current = setInterval(() => {
      secondsLeftRef.current -= 1;

      const currentPhaseIdx = phaseIndexRef.current;
      const currentLabel = activeLabels[currentPhaseIdx];
      const previousLabel = currentPhaseIdx > 0 ? activeLabels[currentPhaseIdx - 1] : "";
      const currentDuration = activePhases[currentPhaseIdx];
      const secondsElapsed = currentDuration - secondsLeftRef.current;
      const phaseProgress = secondsElapsed / currentDuration;

      // Orb scale
      let newScale = 1.0;
      const lowered = currentLabel.toLowerCase();
      if (lowered.includes("inhale")) {
        newScale = 1.0 + 0.35 * phaseProgress;
      } else if (lowered.includes("exhale")) {
        newScale = 1.35 - 0.35 * phaseProgress;
      } else if (lowered.includes("hold")) {
        newScale = previousLabel.toLowerCase().includes("inhale") ? 1.35 : 1.0;
      }

      setOrbScale(newScale);
      setBreathFill(fillForPhase(currentLabel, phaseProgress, previousLabel));
      setSecondsLeft(secondsLeftRef.current);

      // Overall progress + remaining time (same tick, same source of truth)
      elapsedSecondsRef.current += 1;
      setProgress(Math.min(elapsedSecondsRef.current / totalSecondsRef.current, 1));
      setTimeRemaining(Math.max(totalSecondsRef.current - elapsedSecondsRef.current, 0));

      // Advance phase when countdown hits 0
      if (secondsLeftRef.current <= 0) {
        const nextPhaseIdx = (currentPhaseIdx + 1) % activePhases.length;

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
        secondsLeftRef.current = activePhases[nextPhaseIdx];
        setPhaseIndex(nextPhaseIdx);

        triggerHaptic(activeLabels[nextPhaseIdx]);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activePhases, activeLabels, onDone, hapticsEnabled]);

  const currentLabel = activeLabels[phaseIndex] || "";
  const showRingLabel = showInstructions && visual === "ring";
  const showBottomLabel = showInstructions && visual !== "ring";

  return (
    <motion.div
      className="w-screen h-screen overflow-hidden flex flex-col"
      style={{
        position: "relative",
        boxSizing: "border-box",
        ...getBackgroundStyle(background, theme),
        paddingTop: "calc(env(safe-area-inset-top, 44px) + 6px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 12px)",
        transition: "background 0.4s ease",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.3 : 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top bar: timer + info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          minHeight: 44,
          padding: "0 16px",
        }}
      >
        <div style={{ minWidth: 84 }}>{showTimer && <SessionTimerPill seconds={timeRemaining} theme={theme} />}</div>

        <button
          type="button"
          onClick={() => setShowInfo((value) => !value)}
          aria-label="About this technique"
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: colors.tertiary,
          }}
        >
          <Info size={17} strokeWidth={2.2} />
        </button>
      </div>

      {/* Technique name */}
      <p
        style={{
          margin: "4px 24px 0",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: "19px",
          fontWeight: 700,
          letterSpacing: "0.01em",
          textTransform: "lowercase",
          color: colors.text,
          lineHeight: 1.35,
        }}
      >
        {activeTechnique.name}
      </p>

      {/* Science fact */}
      {showInfo && (
        <div
          onClick={() => setShowInfo(false)}
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top, 44px) + 104px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 30,
            width: "calc(100vw - 48px)",
            maxWidth: 300,
            padding: "16px 20px",
            borderRadius: 18,
            background: colors.glass,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${colors.glassBorder}`,
            cursor: "pointer",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: FONT,
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: 1.65,
              color: colors.text,
              textAlign: "center",
            }}
          >
            {activeTechnique.science}
          </p>
        </div>
      )}

      {/* Visualisation */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 24px",
        }}
      >
        {visual === "ring" ? (
          <div style={{ width: "min(300px, 74vw)", aspectRatio: "1 / 1" }}>
            <BreathingRing
              theme={theme}
              fill={breathFill}
              label={currentLabel}
              showLabel={showRingLabel}
              reducedMotion={reducedMotion}
            />
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              width: "min(290px, 74vw)",
              height: "min(290px, 74vw)",
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
                background: colors.orbGradient,
                borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
                transform: `scale(${orbScale})`,
                transition: reducedMotion ? "transform 0.3s linear" : "transform 0.95s ease-in-out",
                animation: reducedMotion ? "none" : "liquidMorph 8s ease-in-out infinite",
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom: instruction + progress + done */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "0 24px",
        }}
      >
        {showBottomLabel ? (
          <p
            style={{
              margin: 0,
              minHeight: 34,
              display: "flex",
              alignItems: "center",
              textAlign: "center",
              fontFamily: FONT,
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "0.01em",
              textTransform: "lowercase",
              color: colors.text,
              lineHeight: 1.3,
            }}
          >
            {currentLabel}
          </p>
        ) : (
          <span className="sr-only" aria-live="polite">
            {currentLabel}
          </span>
        )}

        <div
          style={{
            width: "min(180px, 60vw)",
            height: 4,
            borderRadius: 999,
            background: colors.track,
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
              borderRadius: 999,
              background: `linear-gradient(90deg, ${colors.ringFrom} 0%, ${colors.ringTo} 100%)`,
            }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <button
          type="button"
          onClick={onDone}
          style={{
            minHeight: 44,
            padding: "10px 28px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: "16px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: colors.secondary,
          }}
        >
          done
        </button>
      </div>
    </motion.div>
  );
}