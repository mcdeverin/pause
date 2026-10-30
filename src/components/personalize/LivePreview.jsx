import { useMemo, useState } from "react";
import BreathingRing from "../BreathingRing";
import SessionTimerPill from "../SessionTimerPill";
import { FONT, getBackgroundStyle, getColors } from "../../lib/design";
import useBreathingClock from "../../hooks/useBreathingClock";

// Equal Breathing (Sama Vritti) already exists in the technique library. Its 5s
// inhale and 5s exhale are used exactly as stored — only the cycle count is short
// so the preview can loop gently.
const PREVIEW_PHASES = [5, 5];
const PREVIEW_LABELS = ["inhale", "exhale"];
const PREVIEW_CYCLES = 4;

// Orb geometry, matching the real session's resting scale and travel.
const ORB_MIN_SCALE = 1;
const ORB_RANGE = 0.22;

// A compact, always-labelled preview of the user's draft choices. It runs on the
// same shared clock and breath maths as a real session, but it has no completion
// path: nothing here reports a session, so it never reaches Your Moments.
export default function LivePreview({
  theme,
  visual = "orb",
  background = "classic",
  showTimer = true,
  showInstructions = true,
}) {
  const colors = getColors(theme);
  const [loop, setLoop] = useState(0);

  // Fresh array identities are what restart the shared clock for the next loop.
  // The clock itself, and every technique duration, is untouched.
  const phases = useMemo(() => PREVIEW_PHASES.slice(), [loop]);
  const labels = useMemo(() => PREVIEW_LABELS.slice(), [loop]);

  const clock = useBreathingClock({
    phases,
    labels,
    cycles: PREVIEW_CYCLES,
    onComplete: () => setLoop((value) => value + 1),
  });

  const breath = Math.min(Math.max(clock.breath || 0, 0), 1);
  const orbScale = ORB_MIN_SCALE + ORB_RANGE * breath;

  return (
    <div
      role="img"
      aria-label={`Live preview of your pause using ${visual === "ring" ? "the breathing ring" : "the organic orb"}. This is not a real session.`}
      style={{
        height: "clamp(150px, 25vh, 204px)",
        boxSizing: "border-box",
        padding: "10px 12px",
        borderRadius: 22,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${colors.glassBorder}`,
        transition: "background 0.35s ease",
        ...getBackgroundStyle(background, theme),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          minHeight: 26,
        }}
      >
        {showTimer ? <SessionTimerPill seconds={clock.timeRemaining} theme={theme} /> : <span />}
        <span
          style={{
            fontFamily: FONT,
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: colors.tertiary,
            background: colors.pill,
            border: `1px solid ${colors.pillBorder}`,
            borderRadius: 999,
            padding: "5px 9px",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          preview only
        </span>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {visual === "ring" ? (
          <div style={{ width: "min(118px, 22vh)", aspectRatio: "1 / 1" }}>
            <BreathingRing theme={theme} fill={breath} showLabel={false} />
          </div>
        ) : (
          <div
            style={{
              width: "min(104px, 20vh)",
              height: "min(104px, 20vh)",
              borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
              background: colors.orbGradient,
              transform: `scale(${orbScale})`,
              transition: "transform 0.12s linear",
              animation: "liquidMorph 8s ease-in-out infinite",
            }}
          />
        )}
      </div>

      <p
        aria-live="polite"
        style={{
          margin: 0,
          minHeight: 20,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "0.01em",
          textTransform: "lowercase",
          color: colors.text,
          lineHeight: 1.3,
          visibility: showInstructions ? "visible" : "hidden",
        }}
      >
        {clock.label}
      </p>
    </div>
  );
}