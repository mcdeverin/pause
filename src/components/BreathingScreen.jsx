import { useState, useEffect, useRef, useMemo } from "react";
import { Info } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import BreathingRing from "./BreathingRing";
import SessionTimerPill from "./SessionTimerPill";
import { FONT, getColors } from "../lib/design";
import BackgroundLayer from "./BackgroundLayer";
import useBreathingClock from "../hooks/useBreathingClock";

const TOTAL_CYCLES = 4;

// Orb geometry: resting scale with empty lungs, plus this much at full lungs.
const ORB_MIN_SCALE = 1.0;
const ORB_RANGE = 0.35;

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
  backgroundSettings = {},
  photo = null,
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

  const [showInfo, setShowInfo] = useState(false);

  const finishedRef = useRef(false);
  const sessionIdRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const hapticPhaseRef = useRef(-1);

  // Ends the session exactly once and reports the real elapsed breathing time,
  // so a repeated callback can never record the same pause twice.
  const finish = (payload) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onDone({
      sessionId: sessionIdRef.current,
      completed: Boolean(payload?.completed),
      elapsedSeconds: payload?.elapsedSeconds || 0,
    });
  };

  // ── Haptic feedback ──────────────────────────────────────────────
  const triggerHaptic = (label) => {
    if (!hapticsEnabled || !navigator.vibrate) return;
    const l = String(label || "").toLowerCase();
    if (/(inhale|sniff|belly|chest|collar)/.test(l)) {
      navigator.vibrate([80, 40, 80]); // soft double pulse — breathe in
    } else if (/(exhale|hum)/.test(l)) {
      navigator.vibrate([40, 30, 40, 30, 40]); // gentle triple fade — breathe out
    } else if (/hold/.test(l)) {
      navigator.vibrate(150); // single sustained — stay still
    }
  };
  // ────────────────────────────────────────────────────────────────

  // One session clock drives the countdown, the cues, the progress bar and both
  // visualisations — there is no separate timing engine for orb and ring.
  const clock = useBreathingClock({
    phases: activePhases,
    labels: activeLabels,
    cycles: TOTAL_CYCLES,
    onComplete: finish,
  });

  const { label: currentLabel, breath, progress, timeRemaining } = clock;
  const orbScale = ORB_MIN_SCALE + ORB_RANGE * breath;

  // Haptics fire on phase changes, from the same clock as the visuals.
  useEffect(() => {
    if (clock.phaseIndex === hapticPhaseRef.current) return;
    hapticPhaseRef.current = clock.phaseIndex;
    triggerHaptic(currentLabel);
  }, [clock.phaseIndex, currentLabel]);

  const handleDone = () => {
    const elapsed = clock.cancel();
    finish({ completed: false, elapsedSeconds: Math.round(elapsed) });
  };
  const showRingLabel = showInstructions && visual === "ring";
  const showBottomLabel = showInstructions && visual !== "ring";

  return (
    <motion.div
      className="w-screen h-screen overflow-hidden flex flex-col"
      style={{
        position: "relative",
        boxSizing: "border-box",
        isolation: "isolate",
        paddingTop: "calc(env(safe-area-inset-top, 44px) + 6px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 12px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.3 : 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <BackgroundLayer settings={backgroundSettings} theme={theme} photo={photo} />

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
              fill={breath}
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
                // The scale already tracks the clock continuously; this only
                // smooths the last few frames.
                transition: reducedMotion ? "none" : "transform 0.12s linear",
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
            transition={{ duration: reducedMotion ? 0.2 : 0.15, ease: "linear" }}
          />
        </div>

        <button
          type="button"
          onClick={handleDone}
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