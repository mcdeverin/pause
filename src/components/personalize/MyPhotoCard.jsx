import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { FONT, getColors } from "../../lib/design";
import { preparePhoto } from "../../lib/backgroundPhoto";
import AdjustmentSlider from "./AdjustmentSlider";

// My Photo: the picker itself is a file input, which iOS opens as its native
// photo library. The chosen image is optimised on the device and kept locally.
export default function MyPhotoCard({ theme, photo, zoom = 1, onPicked, onRemove, onZoomChange }) {
  const colors = getColors(theme);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const handleFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setMessage("");
    try {
      const dataUrl = await preparePhoto(file);
      const stored = onPicked(dataUrl);
      if (stored === false) {
        setMessage("Your photo is ready, but your device was short on space, so it may not survive a restart.");
      }
    } catch (error) {
      setMessage(error && error.message ? error.message : "That photo could not be used.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 12,
        padding: "14px 14px 4px",
        borderRadius: 18,
        border: `1px solid ${colors.border}`,
        background: colors.glass,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: colors.track,
            flexShrink: 0,
          }}
        >
          {photo ? (
            <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <ImagePlus size={17} strokeWidth={2.2} color={colors.tertiary} />
          )}
        </span>

        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontFamily: FONT, fontSize: "14.5px", fontWeight: 700, color: colors.text }}>
            {photo ? "Your photo" : "No photo yet"}
          </p>
          <p style={{ margin: "2px 0 0", fontFamily: FONT, fontSize: "12.5px", fontWeight: 500, color: colors.tertiary, lineHeight: 1.45 }}>
            Stays on this device. Never uploaded.
          </p>
        </div>
      </div>

      <p
        style={{
          margin: "12px 0 0",
          fontFamily: FONT,
          fontSize: "13px",
          fontWeight: 500,
          color: colors.secondary,
          lineHeight: 1.55,
        }}
      >
        Preview your own photo behind the breathing visual. Drag the preview above to reposition it,
        and use the adjustments below to dim or soften it.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <button
          type="button"
          onClick={() => fileRef.current && fileRef.current.click()}
          disabled={busy}
          style={{
            minHeight: 44,
            padding: "11px 20px",
            borderRadius: 999,
            border: `1px solid ${colors.border}`,
            background: colors.sheet,
            color: colors.text,
            fontFamily: FONT,
            fontSize: "14.5px",
            fontWeight: 700,
            cursor: busy ? "progress" : "pointer",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? "preparing…" : photo ? "Change My Photo" : "Choose My Photo"}
        </button>

        {photo && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              minHeight: 44,
              padding: "11px 6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT,
              fontSize: "13.5px",
              fontWeight: 700,
              color: colors.secondary,
              textDecoration: "underline",
            }}
          >
            Remove
          </button>
        )}
      </div>

      {photo && (
        <AdjustmentSlider
          label="Photo zoom"
          min={100}
          max={200}
          value={Math.round(zoom * 100)}
          onChange={(next) => onZoomChange(next / 100)}
          hint="Zoom in to crop tighter."
          theme={theme}
        />
      )}

      {message && (
        <p
          role="status"
          style={{
            margin: "4px 0 10px",
            fontFamily: FONT,
            fontSize: "12.5px",
            fontWeight: 500,
            color: colors.secondary,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      )}

      <div style={{ height: photo ? 4 : 10 }} />
    </div>
  );
}