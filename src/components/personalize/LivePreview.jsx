import { useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import BackgroundLayer from "../BackgroundLayer";
import BreathingVisual from "../visuals/BreathingVisual";
import SessionTimerPill from "../SessionTimerPill";
import { clampPhotoOffset } from "../../lib/background";
import { FONT, getColors, isPhotoBackground } from "../../lib/design";
import { getCanvasInk } from "../../lib/canvasInk";
import { getStyleLabel } from "../../lib/visuals";
import useBreathingClock from "../../hooks/useBreathingClock";

// Equal Breathing (Sama Vritti) already exists in the technique library. Its 5s
// inhale and 5s exhale are used exactly as stored — only the cycle count is short
// so the preview can loop gently.
const PREVIEW_PHASES = [5, 5];
const PREVIEW_LABELS = ["inhale", "exhale"];
const PREVIEW_CYCLES = 4;

// A compact, always-labelled preview of the user's draft choices. It runs on the
// same shared clock, breath maths and background layer as a real session, but it
// has no completion path: nothing here reports a session, so it never reaches
// Your Moments.
export default function LivePreview({ theme, settings = {}, photo = null, onPhotoPan }) {
  const colors = getColors(theme);
  // The annotations inside the preview sit on the canvas itself, so they use the
  // same adaptive ink as a real session.
  const ink = getCanvasInk(theme, settings, {
    hasPhoto: isPhotoBackground(settings.background) && Boolean(photo),
  });
  const [loop, setLoop] = useState(0);
  const panRef = useRef(null);

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

  const reducedMotion = useReducedMotion();
  const breath = Math.min(Math.max(clock.breath || 0, 0), 1);
  const visualLabel = getStyleLabel(settings.visual || "orb");
  const canPan = isPhotoBackground(settings.background) && Boolean(photo) && Boolean(onPhotoPan);

  const handlePanStart = (event) => {
    if (!canPan) return;
    panRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: settings.photoOffsetX || 0,
      offsetY: settings.photoOffsetY || 0,
      width: event.currentTarget.clientWidth || 1,
      height: event.currentTarget.clientHeight || 1,
    };
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePanMove = (event) => {
    const start = panRef.current;
    if (!start) return;
    // A larger crop offset shifts the photo the other way, so the drag is
    // inverted to keep the photo under the finger.
    const x = clampPhotoOffset(start.offsetX - ((event.clientX - start.x) / start.width) * 100);
    const y = clampPhotoOffset(start.offsetY - ((event.clientY - start.y) / start.height) * 100);
    onPhotoPan({ x, y });
  };

  const handlePanEnd = () => {
    panRef.current = null;
  };

  return (
    <div
      role="group"
      aria-label={`Live preview of your pause using the ${visualLabel} visual. This is not a real session.`}
      onPointerDown={handlePanStart}
      onPointerMove={handlePanMove}
      onPointerUp={handlePanEnd}
      onPointerCancel={handlePanEnd}
      onPointerLeave={handlePanEnd}
      style={{
        position: "relative",
        isolation: "isolate",
        height: "clamp(150px, 25vh, 204px)",
        boxSizing: "border-box",
        padding: "10px 12px",
        borderRadius: 22,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${colors.glassBorder}`,
        touchAction: canPan ? "none" : "auto",
        cursor: canPan ? "grab" : "default",
      }}
    >
      <BackgroundLayer settings={settings} theme={theme} photo={photo} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          minHeight: 26,
        }}
      >
        {settings.showTimer ? <SessionTimerPill seconds={clock.timeRemaining} theme={theme} /> : <span />}
        <span
          style={{
            fontFamily: FONT,
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: ink.tertiary,
            background: ink.pill,
            border: `1px solid ${ink.pillBorder}`,
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
        <div style={{ width: "min(112px, 22vh)", aspectRatio: "1 / 1" }}>
          <BreathingVisual
            id={settings.visual}
            breath={breath}
            theme={theme}
            options={settings.visualOptions?.[settings.visual]}
            reducedMotion={reducedMotion}
            showLabel={false}
          />
        </div>
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
          // One neutral, background-adaptive colour for every visual — the cue
          // never takes on the visual's own gradient.
          color: ink.text,
          textShadow: ink.shadow,
          lineHeight: 1.3,
          visibility: settings.showInstructions ? "visible" : "hidden",
        }}
      >
        {clock.label}
      </p>
    </div>
  );
}