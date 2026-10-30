import { Clock } from "lucide-react";
import { FONT, formatClock, getColors } from "../lib/design";

// Compact countdown pill. It only displays the session's existing remaining
// time — it never runs its own timer.
export default function SessionTimerPill({ seconds, theme }) {
  const colors = getColors(theme);

  return (
    <div
      aria-label={`${Math.max(0, Math.round(seconds))} seconds remaining`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 15px",
        borderRadius: "999px",
        background: colors.glass,
        border: `1px solid ${colors.glassBorder}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        fontFamily: FONT,
        color: colors.text,
      }}
    >
      <Clock size={14} strokeWidth={2.4} color={colors.tertiary} aria-hidden="true" />
      <span className="tnum" style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "0.02em" }}>
        {formatClock(seconds)}
      </span>
    </div>
  );
}