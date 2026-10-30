import { FONT, getColors } from "../../lib/design";

export default function PreviewCard({
  label,
  description,
  selected,
  onSelect,
  theme,
  preview,
  previewBackground,
  compact = false,
}) {
  const colors = getColors(theme);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
        minHeight: 44,
        padding: compact ? 8 : 10,
        borderRadius: 16,
        background: colors.glass,
        border: `2px solid ${selected ? colors.accent : colors.glassBorder}`,
        boxShadow: selected ? `0 0 0 3px ${colors.accentSoft}` : "none",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: FONT,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div
        style={{
          height: compact ? 54 : 88,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: previewBackground || colors.track,
        }}
      >
        {preview}
      </div>

      <span
        style={{
          fontSize: compact ? "13px" : "14px",
          fontWeight: selected ? 700 : 600,
          color: colors.text,
          padding: compact ? "0 2px" : "0 4px",
          lineHeight: 1.35,
        }}
      >
        {label}
      </span>

      {description && !compact && (
        <span
          style={{
            fontSize: "12.5px",
            fontWeight: 500,
            color: colors.secondary,
            padding: "0 4px 4px",
            lineHeight: 1.45,
          }}
        >
          {description}
        </span>
      )}
    </button>
  );
}