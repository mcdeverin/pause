import { FONT, getColors } from "../../lib/design";

export default function PreferenceToggle({ label, description, checked, onChange, theme }) {
  const colors = getColors(theme);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 0",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT,
            fontSize: "16px",
            fontWeight: 600,
            color: colors.text,
            lineHeight: 1.35,
          }}
        >
          {label}
        </p>
        {description && (
          <p
            style={{
              margin: "3px 0 0",
              fontFamily: FONT,
              fontSize: "13px",
              fontWeight: 500,
              color: colors.secondary,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        style={{
          width: 56,
          height: 44,
          padding: 0,
          border: "none",
          background: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: "block",
            position: "relative",
            width: 50,
            height: 30,
            borderRadius: "999px",
            background: checked ? colors.accent : colors.track,
            transition: "background 0.25s ease",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: checked ? 23 : 3,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#FFFFFF",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.18)",
              transition: "left 0.25s ease",
            }}
          />
        </span>
      </button>
    </div>
  );
}