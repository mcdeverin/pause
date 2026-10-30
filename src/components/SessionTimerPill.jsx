import { Circle } from "lucide-react";
import { FONT, formatClock, getColors } from "../lib/design";

// Compact frosted countdown pill shown in the top-left of a session.
// It only displays the session's existing remaining time — it never runs
// its own timer, so it always matches the breathing engine.
export default function SessionTimerPill({ seconds, theme }) {
  const colors = getColors(theme);
  const remaining = Math.max(0, Math.round(seconds || 0));

  return (
    <div
      aria-label={`${remaining} seconds remaining`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 13px 6px 11px",
        borderRadius: "999px",
        background: colors.pill,
        border: `1px solid ${colors.pillBorder}`,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        color: colors.pillText,
        fontFamily: FONT,
        lineHeight: 1,
      }}
    >
      <Circle size={11} strokeWidth={2.6} color={colors.pillText} aria-hidden="true" />
      <span className="tnum" style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "0.02em" }}>
        {formatClock(remaining)}
      </span>
    </div>
  );
}