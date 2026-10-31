import { useMemo, useState } from "react";
import { Copy, RotateCcw } from "lucide-react";
import { STUDIO_UI } from "@/lib/crystalStudio";

function formatValue(control, value) {
  if (control.type === "color") return value;
  if (control.integer) return String(value);
  if (control.unit) return `${value}${control.unit}`;
  return Number(value).toFixed(2);
}

// Schema-driven controls, so both crystals share one look without sharing state.
export default function StudioControls({ schema, values, onChange, onReset }) {
  const [notice, setNotice] = useState("");
  const groups = useMemo(() => {
    const map = new Map();
    schema.forEach((control) => {
      if (!map.has(control.group)) map.set(control.group, []);
      map.get(control.group).push(control);
    });
    return Array.from(map.entries());
  }, [schema]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(values, null, 2));
      setNotice("Settings copied as JSON.");
    } catch {
      setNotice("Clipboard unavailable — select the values and copy manually.");
    }
    setTimeout(() => setNotice(""), 2600);
  };

  return (
    <div
      style={{
        background: STUDIO_UI.card,
        border: `1px solid ${STUDIO_UI.border}`,
        borderRadius: 20,
        padding: "16px 18px 14px",
      }}
    >
      {groups.map(([group, controls], index) => (
        <div key={group} style={{ marginTop: index === 0 ? 0 : 16 }}>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: STUDIO_UI.accent,
            }}
          >
            {group}
          </p>
          {controls.map((control) =>
            control.type === "color" ? (
              <label
                key={control.key}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}
              >
                <span style={{ fontSize: 12.5, color: STUDIO_UI.muted }}>{control.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: STUDIO_UI.muted }}>
                    {values[control.key]}
                  </span>
                  <input
                    type="color"
                    value={values[control.key]}
                    onChange={(event) => onChange(control.key, event.target.value)}
                    aria-label={control.label}
                    style={{
                      width: 30,
                      height: 26,
                      padding: 0,
                      border: `1px solid ${STUDIO_UI.border}`,
                      borderRadius: 8,
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  />
                </span>
              </label>
            ) : (
              <label key={control.key} style={{ display: "block", marginBottom: 10 }}>
                <span
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    fontSize: 12.5,
                    color: STUDIO_UI.muted,
                    marginBottom: 4,
                  }}
                >
                  <span>{control.label}</span>
                  <span style={{ color: STUDIO_UI.text, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {formatValue(control, values[control.key])}
                  </span>
                </span>
                <input
                  type="range"
                  className="pause-slider"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={values[control.key]}
                  onChange={(event) => onChange(control.key, Number(event.target.value))}
                  aria-label={control.label}
                  style={{ "--pause-track": STUDIO_UI.track, "--pause-thumb": STUDIO_UI.accent }}
                />
              </label>
            )
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button type="button" onClick={copy} style={actionStyle}>
          <Copy size={13} strokeWidth={2.2} />
          Copy settings
        </button>
        <button type="button" onClick={onReset} style={actionStyle}>
          <RotateCcw size={13} strokeWidth={2.2} />
          Reset
        </button>
      </div>
      <p role="status" style={{ margin: "8px 0 0", minHeight: 15, fontSize: 11.5, color: STUDIO_UI.muted }}>
        {notice}
      </p>
    </div>
  );
}

const actionStyle = {
  flex: 1,
  minHeight: 38,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  borderRadius: 12,
  border: `1px solid ${STUDIO_UI.border}`,
  background: STUDIO_UI.page,
  color: STUDIO_UI.text,
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};