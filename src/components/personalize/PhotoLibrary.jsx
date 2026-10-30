import { useRef, useState } from "react";
import { ImagePlus, Plus } from "lucide-react";
import { FONT, getColors } from "../../lib/design";
import { MAX_PHOTOS, preparePhoto } from "../../lib/backgroundPhoto";
import AdjustmentSlider from "./AdjustmentSlider";

const GRID = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
};

// Your Photos: images chosen from the device. They stay on the device, and the
// selected one is dragged in the preview above to reposition it.
export default function PhotoLibrary({
  theme,
  photos,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  zoom = 1,
  onZoomChange,
}) {
  const colors = getColors(theme);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const full = photos.length >= MAX_PHOTOS;

  const handleFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setMessage("");
    try {
      const dataUrl = await preparePhoto(file);
      const result = onAdd(dataUrl);
      if (result && result.stored === false) {
        setMessage("Your photo is ready, but this device was short on space, so it may not survive a restart.");
      }
    } catch (error) {
      setMessage(error && error.message ? error.message : "That photo could not be used.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div style={GRID}>
        {photos.map((photo) => {
          const selected = photo.id === selectedId;
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => onSelect(photo.id)}
              aria-pressed={selected}
              aria-label="Use this photo"
              style={{
                padding: 5,
                borderRadius: 14,
                border: `2px solid ${selected ? colors.accent : colors.glassBorder}`,
                background: colors.glass,
                cursor: "pointer",
                lineHeight: 0,
              }}
            >
              <img
                src={photo.dataUrl}
                alt=""
                style={{
                  width: "100%",
                  height: 74,
                  objectFit: "cover",
                  borderRadius: 10,
                  display: "block",
                  border: `1px solid ${colors.glassBorder}`,
                }}
              />
              <span
                style={{
                  display: "block",
                  marginTop: 6,
                  fontFamily: FONT,
                  fontSize: "12px",
                  fontWeight: selected ? 700 : 600,
                  color: selected ? colors.text : colors.secondary,
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {selected ? "In use" : "Your photo"}
              </span>
            </button>
          );
        })}

        {!full && (
          <button
            type="button"
            onClick={() => fileRef.current && fileRef.current.click()}
            disabled={busy}
            style={{
              minHeight: 108,
              padding: 8,
              borderRadius: 14,
              border: `1px dashed ${colors.pillBorder}`,
              background: colors.glass,
              cursor: busy ? "progress" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              fontFamily: FONT,
              opacity: busy ? 0.7 : 1,
            }}
          >
            <Plus size={18} strokeWidth={2.2} color={colors.tertiary} aria-hidden="true" />
            <span style={{ fontSize: "12px", fontWeight: 700, color: colors.secondary, letterSpacing: "0.01em" }}>
              {busy ? "preparing…" : "Add"}
            </span>
          </button>
        )}
      </div>

      {photos.length === 0 && (
        <p style={{ margin: "10px 0 0", fontFamily: FONT, fontSize: "13px", fontWeight: 500, color: colors.secondary, lineHeight: 1.55 }}>
          Add a photo from your device. It stays on this device and is never uploaded.
        </p>
      )}

      {photos.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10 }}>
          <p style={{ margin: 0, flex: 1, fontFamily: FONT, fontSize: "12.5px", fontWeight: 500, color: colors.tertiary, lineHeight: 1.5 }}>
            Drag the preview above to reposition your photo.
          </p>
          {selectedId && (
            <button
              type="button"
              onClick={() => onRemove(selectedId)}
              style={{
                minHeight: 44,
                padding: "11px 10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontSize: "13.5px",
                fontWeight: 700,
                color: colors.secondary,
                textDecoration: "underline",
                flexShrink: 0,
              }}
            >
              Remove
            </button>
          )}
        </div>
      )}

      {selectedId && (
        <AdjustmentSlider
          label="Photo zoom"
          min={100}
          max={200}
          value={Math.round(zoom * 100)}
          onChange={(next) => onZoomChange(next / 100)}
          hint={
            full
              ? `Zoom in to crop tighter. ${MAX_PHOTOS} photos at most, all kept on this device.`
              : "Zoom in to crop tighter."
          }
          theme={theme}
        />
      )}

      {message && (
        <p
          role="status"
          style={{
            margin: "6px 0 0",
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

      {photos.length === 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <ImagePlus size={15} strokeWidth={2.1} color={colors.tertiary} aria-hidden="true" />
          <span style={{ fontFamily: FONT, fontSize: "12px", fontWeight: 600, color: colors.tertiary }}>
            Stays on this device. Never uploaded.
          </span>
        </div>
      )}
    </>
  );
}