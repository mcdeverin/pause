import { useRef } from "react";
import { FONT, getColors } from "../../lib/design";
import { SPECTRUM_GRADIENT, colorFromHue, hueFromHex, isHexColor } from "../../lib/visualColors";

// A horizontal rainbow slider. Dragging picks a colour from the spectrum, and the
// swatch beside the label shows exactly what was picked — no hex value is ever
// shown or typed.
export default function SpectrumColorSlider({ label, value, theme, onChange }) {
  const colors = getColors(theme);
  const trackRef = useRef(null);
  const draggingRef = useRef(false);

  const current = isHexColor(value) ? value : "#808080";
  const hue = hueFromHex(current);

  const hueAt = (clientX) => {
    const rect = trackRef.current ? trackRef.current.getBoundingClientRect() : null;
    if (!rect || !rect.width) return 0;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return ratio * 360;
  };

  const handlePointerDown = (event) => {
    draggingRef.current = true;
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    onChange(colorFromHue(hueAt(event.clientX)));
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return;
    onChange(colorFromHue(hueAt(event.clientX)));
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const handleKeyDown = (event) => {
    const step =
      event.key === "ArrowLeft" || event.key === "ArrowDown"
        ? -6
        : event.key === "ArrowRight" || event.key === "ArrowUp"
          ? 6
          : 0;
    if (step === 0) return;
    event.preventDefault();
    onChange(colorFromHue(hue + step));
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 9,
        }}
      >
        <p style={{ margin: 0, fontFamily: FONT, fontSize: "14.5px", fontWeight: 700, color: colors.text }}>
          {label}
        </p>
        <span
          aria-hidden="true"
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: current,
            boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.12)",
            flexShrink: 0,
          }}
        />
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={hue}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        style={{
          position: "relative",
          height: 30,
          display: "flex",
          alignItems: "center",
          touchAction: "none",
          cursor: "pointer",
          outlineOffset: 4,
        }}
      >
        <div
          style={{
            width: "100%",
            height: 10,
            borderRadius: 999,
            background: SPECTRUM_GRADIENT,
            boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.08)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: `${(hue / 360) * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 22,
            height: 22,
            borderRadius: 999,
            background: current,
            border: "2.5px solid #FFFFFF",
            boxShadow: "0 1px 5px rgba(0, 0, 0, 0.30)",
          }}
        />
      </div>
    </div>
  );
}