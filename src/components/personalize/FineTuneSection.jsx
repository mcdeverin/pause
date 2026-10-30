import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FONT, getColors } from "../../lib/design";
import { PALETTES, getStyle } from "../../lib/visuals";
import AdjustmentSlider from "./AdjustmentSlider";

function swatchBackground(option) {
  if (!option) return "transparent";
  if (option.rim) return `conic-gradient(from 20deg, ${option.rim.join(", ")})`;
  if (option.colours) return `linear-gradient(135deg, ${option.colours.join(", ")})`;
  if (option.from) return `linear-gradient(135deg, ${option.from}, ${option.to})`;
  if (option.outer) return `linear-gradient(135deg, ${option.inner}, ${option.outer})`;
  return option.tint || "transparent";
}

function PaletteControl({ control, value, theme, onChange }) {
  const colors = getColors(theme);
  const palette = PALETTES[control.palette];

  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ margin: "0 0 8px", fontFamily: FONT, fontSize: "14.5px", fontWeight: 700, color: colors.text }}>
        {control.label}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {palette.options.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={selected}
              aria-label={option.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                minHeight: 40,
                padding: "7px 12px 7px 7px",
                borderRadius: 999,
                border: `1.5px solid ${selected ? colors.accent : colors.pillBorder}`,
                background: selected ? colors.accentSoft : "transparent",
                color: selected ? colors.text : colors.secondary,
                fontFamily: FONT,
                fontSize: "13px",
                fontWeight: selected ? 700 : 600,
                cursor: "pointer",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: swatchBackground(option),
                  boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
                  flexShrink: 0,
                }}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Contextual controls for the selected visual only — nothing that does not apply
// to it is ever shown, and the section starts closed.
export default function FineTuneSection({ theme, styleId, options, onChange }) {
  const colors = getColors(theme);
  const [open, setOpen] = useState(false);
  const style = getStyle(styleId);

  if (style.controls.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 12,
        borderRadius: 16,
        border: `1px solid ${colors.glassBorder}`,
        background: colors.glass,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        style={{
          width: "100%",
          minHeight: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "12px 14px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: FONT,
          textAlign: "left",
        }}
      >
        <span>
          <span style={{ display: "block", fontSize: "14.5px", fontWeight: 700, color: colors.text }}>
            Fine-tune {style.label.toLowerCase()}
          </span>
          <span style={{ display: "block", marginTop: 2, fontSize: "12.5px", fontWeight: 500, color: colors.tertiary }}>
            Optional. It looks lovely as it is.
          </span>
        </span>
        <ChevronDown
          size={18}
          strokeWidth={2.2}
          color={colors.secondary}
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          {style.controls.map((control) =>
            control.type === "palette" ? (
              <PaletteControl
                key={control.key}
                control={control}
                value={options[control.key]}
                theme={theme}
                onChange={(next) => onChange(control.key, next)}
              />
            ) : (
              <AdjustmentSlider
                key={control.key}
                label={control.label}
                min={control.min}
                max={control.max}
                value={options[control.key]}
                hint={control.hint}
                theme={theme}
                onChange={(next) => onChange(control.key, next)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}