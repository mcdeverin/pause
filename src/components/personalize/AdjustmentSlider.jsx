import { useId } from "react";
import { FONT, getColors } from "../../lib/design";

// A themed range control used for background dimming and blur.
export default function AdjustmentSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  disabled = false,
  hint,
  theme,
}) {
  const colors = getColors(theme);
  const inputId = useId();
  const current = Math.round(value || 0);

  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <label
          htmlFor={inputId}
          style={{
            fontFamily: FONT,
            fontSize: "14.5px",
            fontWeight: 700,
            color: disabled ? colors.tertiary : colors.text,
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontFamily: FONT,
            fontSize: "14px",
            fontWeight: 700,
            color: colors.secondary,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {current}%
        </span>
      </div>

      <input
        id={inputId}
        className="pause-slider"
        type="range"
        min={min}
        max={max}
        step={1}
        value={current}
        disabled={disabled}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          "--pause-track": colors.track,
          "--pause-thumb": theme === "day" ? "#FFFFFF" : "#F5F5F2",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      />

      {hint && (
        <p
          id={`${inputId}-hint`}
          style={{
            margin: "2px 0 0",
            fontFamily: FONT,
            fontSize: "12.5px",
            fontWeight: 500,
            color: colors.tertiary,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}