import { useState } from "react";
import { BACKGROUNDS, CUSTOM_COLOR_ID, CUSTOM_GRADIENT_ID, FONT, getColors } from "../../lib/design";
import { sanitizeHex } from "../../lib/background";
import PreviewCard from "./PreviewCard";
import PlusTag from "./PlusTag";

const TILE_GRID = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };

function gradientCss(from, to) {
  return `linear-gradient(180deg, ${from} 0%, ${to} 100%)`;
}

const FIELD = {
  width: 44,
  height: 44,
  padding: 3,
  borderRadius: 12,
  cursor: "pointer",
  flexShrink: 0,
};

// The Color category: the curated gradients, one flat colour of your own, or a
// two-colour gradient you build yourself.
export default function ColorBackgrounds({
  draft,
  theme,
  onSelectBackground,
  onCustomColor,
  onGradientColors,
  isPro = false,
}) {
  const colors = getColors(theme);
  const [hexText, setHexText] = useState(draft.customColor || "");

  const applyHex = (raw) => {
    setHexText(raw);
    const clean = sanitizeHex(raw);
    if (clean) onCustomColor(clean);
  };

  const gradientText = (key, fallback) =>
    key === "from" ? draft.gradientFrom || fallback : draft.gradientTo || fallback;

  return (
    <>
      <div style={TILE_GRID}>
        {BACKGROUNDS.map((option) => (
          <PreviewCard
            key={option.id}
            theme={theme}
            compact
            label={option.label}
            selected={draft.background === option.id}
            onSelect={() => onSelectBackground(option.id)}
            previewBackground={option.tone}
            preview={null}
          />
        ))}

        <PreviewCard
          theme={theme}
          compact
          label="Solid Color"
          selected={draft.background === CUSTOM_COLOR_ID}
          onSelect={() => onSelectBackground(CUSTOM_COLOR_ID)}
          previewBackground={draft.customColor}
          preview={null}
        />

        <div style={{ position: "relative" }}>
          {!isPro && <PlusTag theme={theme} />}
          <PreviewCard
            theme={theme}
            compact
            label="Custom Gradient"
            selected={draft.background === CUSTOM_GRADIENT_ID}
            onSelect={() => onSelectBackground(CUSTOM_GRADIENT_ID)}
            previewBackground={gradientCss(gradientText("from"), gradientText("to"))}
            preview={null}
          />
        </div>
      </div>

      {draft.background === CUSTOM_COLOR_ID && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <input
              type="color"
              aria-label="Pick a background color"
              value={draft.customColor}
              onChange={(event) => {
                const next = event.target.value.toUpperCase();
                setHexText(next);
                onCustomColor(next);
              }}
              style={{ ...FIELD, border: `1px solid ${colors.border}`, background: colors.sheet }}
            />
            <input
              type="text"
              aria-label="Background color hex value"
              value={hexText}
              onChange={(event) => applyHex(event.target.value)}
              onBlur={() => setHexText(draft.customColor)}
              placeholder="#E7EDEA"
              maxLength={7}
              spellCheck={false}
              autoComplete="off"
              style={{
                flex: 1,
                minWidth: 0,
                height: 44,
                boxSizing: "border-box",
                padding: "0 12px",
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                background: colors.sheet,
                color: colors.text,
                fontFamily: FONT,
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            />
          </div>
          <p style={{ margin: "6px 0 0", fontFamily: FONT, fontSize: "12.5px", fontWeight: 500, color: colors.tertiary, lineHeight: 1.5 }}>
            Any colour works. Blur stays off for a single tone.
          </p>
        </>
      )}

      {draft.background === CUSTOM_GRADIENT_ID && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            {[
              { key: "from", label: "Top color" },
              { key: "to", label: "Bottom color" },
            ].map((stop) => (
              <label
                key={stop.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: 7,
                  borderRadius: 13,
                  border: `1px solid ${colors.border}`,
                  background: colors.sheet,
                  fontFamily: FONT,
                  cursor: "pointer",
                }}
              >
                <input
                  type="color"
                  aria-label={stop.label}
                  value={stop.key === "from" ? draft.gradientFrom : draft.gradientTo}
                  onChange={(event) =>
                    onGradientColors({ [stop.key]: event.target.value.toUpperCase() })
                  }
                  style={{
                    width: 34,
                    height: 34,
                    padding: 2,
                    borderRadius: 9,
                    border: `1px solid ${colors.border}`,
                    background: colors.sheet,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: colors.secondary,
                    }}
                  >
                    {stop.label}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      color: colors.text,
                    }}
                  >
                    {stop.key === "from" ? draft.gradientFrom : draft.gradientTo}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p style={{ margin: "6px 0 0", fontFamily: FONT, fontSize: "12.5px", fontWeight: 500, color: colors.tertiary, lineHeight: 1.5 }}>
            Two tones blended softly from top to bottom.
          </p>
        </>
      )}
    </>
  );
}