import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import BreathingVisual from "./visuals/BreathingVisual";
import SessionTimerPill from "./SessionTimerPill";
import { FONT, getColors } from "../lib/design";
import BackgroundLayer from "./BackgroundLayer";
import useBreathingClock from "../hooks/useBreathingClock";

const TOTAL_CYCLES = 4;

const DEFAULT_TECHNIQUE = {
  name: "Box Breathing",
  phases: "4,4,4,4",
  phaseLabels: "inhale,hold,exhale,hold",
  science: "When your mind is busy, four predictable phases give you something steady to follow.",
};

const FALLBACK_PHASES = DEFAULT_TECHNIQUE.phases.split(",").map(Number);
const FALLBACK_LABELS = DEFAULT_TECHNIQUE.phaseLabels.split(",");

export default function BreathingScreen({
  technique,
  onDone,
  theme = "day",
  hapticsEnabled = true,
  visual = "orb",
  visualOptions = {},
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

  // Only a real stored http(s) link is shown — never a placeholder.
  const sourceUrl = useMemo(() => {
    const raw = activeTechnique.sourceUrl;
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : null;
  }, [activeTechnique.sourceUrl]);

  const sourceTitle =
    typeof activeTechnique.sourceLabel === "string" && activeTechnique.sourceLabel.trim()
      ? activeTechnique.sourceLabel.trim()
      : null;

  const [showInfo, setShowInfo] = useState(false);
  const [infoMaxHeight, setInfoMaxHeight] = useState(null);

  const finishedRef = useRef(false);
  const sessionIdRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const hapticPhaseRef = useRef(-1);
  const infoCardRef = useRef(null);
  const visualRef = useRef(null);

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

  // Haptics fire on phase changes, from the same clock as the visuals.
  useEffect(() => {
    if (clock.phaseIndex === hapticPhaseRef.current) return;
    hapticPhaseRef.current = clock.phaseIndex;
    triggerHaptic(currentLabel);
  }, [clock.phaseIndex, currentLabel]);

  // The information card is height-capped to the space above the breathing
  // visual, so its text can never reach or cover the animation. On a very short
  // screen the card scrolls instead of growing downwards.
  useEffect(() => {
    if (!showInfo) return undefined;
    const measure = () => {
      const card = infoCardRef.current;
      const visualBox = visualRef.current;
      if (!card || !visualBox) return;
      const available = visualBox.getBoundingClientRect().top - card.getBoundingClientRect().top - 14;
      setInfoMaxHeight(Math.max(80, Math.round(available)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [showInfo]);

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
          ref={infoCardRef}
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
            maxHeight: infoMaxHeight ? `${infoMaxHeight}px` : undefined,
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
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

          {sourceUrl ? (
            <button
              type="button"
              onClick={(event) => {
                // Tapping the source must not count as tapping the card closed.
                event.stopPropagation();
                window.open(sourceUrl, "_blank");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                width: "fit-content",
                margin: "8px auto 0",
                padding: "6px 0",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontSize: "12.5px",
                fontWeight: 600,
                letterSpacing: "0.01em",
                color: colors.text,
              }}
            >
              <span style={{ borderBottom: `1px dotted ${colors.tertiary}`, paddingBottom: 2 }}>
                View source
              </span>
              <ArrowUpRight size={12} strokeWidth={2.4} />
            </button>
          ) : (
            sourceTitle && (
              <p
                style={{
                  margin: "8px 0 0",
                  fontFamily: FONT,
                  fontSize: "12.5px",
                  fontWeight: 500,
                  letterSpacing: "0.005em",
                  lineHeight: 1.5,
                  color: colors.tertiary,
                  textAlign: "center",
                }}
              >
                Source: {sourceTitle}
              </p>
            )
          )}
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
        <div ref={visualRef} style={{ width: "min(290px, 74vw)", aspectRatio: "1 / 1" }}>
          <BreathingVisual
            id={visual}
            breath={breath}
            theme={theme}
            options={visualOptions?.[visual]}
            reducedMotion={reducedMotion}
            label={currentLabel}
            showLabel={showRingLabel}
          />
        </div>
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