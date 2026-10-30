import { FONT, getColors } from "../../lib/design";

// A quiet, right-aligned pill. It stays on screen at all times and only fades
// when there is nothing left to restore.
export default function RestoreDefaultsButton({ theme, disabled, onClick }) {
  const colors = getColors(theme);

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-disabled={disabled}
        style={{
          minHeight: 32,
          padding: "7px 14px",
          borderRadius: 999,
          border: `1px solid ${colors.pillBorder}`,
          background: colors.pill,
          cursor: disabled ? "default" : "pointer",
          fontFamily: FONT,
          fontSize: "12.5px",
          fontWeight: 600,
          letterSpacing: "0.01em",
          lineHeight: 1.2,
          color: colors.tertiary,
          opacity: disabled ? 0.45 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        Restore Defaults
      </button>
    </div>
  );
}