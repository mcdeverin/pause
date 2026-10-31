import { FONT, getColors } from "../../lib/design";

// The one premium marker used everywhere. Small, quiet and never in the way of
// a tap, so an option can still be previewed before anyone decides.
export default function PlusTag({ theme }) {
  const colors = getColors(theme);

  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 6,
        right: 6,
        padding: "2px 6px",
        borderRadius: 999,
        background: colors.sheet,
        border: `1px solid ${colors.pillBorder}`,
        color: colors.tertiary,
        fontFamily: FONT,
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        lineHeight: 1.5,
        pointerEvents: "none",
      }}
    >
      Plus
    </span>
  );
}