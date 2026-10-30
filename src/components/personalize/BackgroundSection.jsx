import { useState } from "react";
import { ImagePlus } from "lucide-react";
import {
  BACKGROUNDS,
  CUSTOM_COLOR_ID,
  MY_PHOTO_ID,
  FONT,
  getBackgroundTone,
  getColors,
  isSolidBackground,
} from "../../lib/design";
import { sanitizeHex } from "../../lib/background";
import PreviewCard from "./PreviewCard";
import MyPhotoCard from "./MyPhotoCard";

const TILE_GRID = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };

// Presets are starting points: any colour is allowed, and your own photo sits
// alongside them as an equal option.
export default function BackgroundSection({
  draft,
  theme,
  onSelectBackground,
  onCustomColor,
  photo,
  onPhotoPicked,
  onPhotoRemoved,
  onPhotoZoom,
}) {
  const colors = getColors(theme);
  const [hexText, setHexText] = useState(draft.customColor || "");

  const selectCustom = () => onSelectBackground(CUSTOM_COLOR_ID);

  const applyHex = (raw) => {
    setHexText(raw);
    const clean = sanitizeHex(raw);
    if (clean) onCustomColor(clean);
  };

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
            previewBackground={getBackgroundTone(option.id, theme)}
            preview={null}
          />
        ))}

        <PreviewCard
          theme={theme}
          compact
          label="Custom Color"
          selected={draft.background === CUSTOM_COLOR_ID}
          onSelect={selectCustom}
          previewBackground={draft.customColor}
          preview={null}
        />

        <PreviewCard
          theme={theme}
          compact
          label="My Photo"
          selected={draft.background === MY_PHOTO_ID}
          onSelect={() => onSelectBackground(MY_PHOTO_ID)}
          previewBackground={colors.track}
          preview={
            photo ? (
              <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <ImagePlus size={19} strokeWidth={2.1} color={colors.tertiary} />
            )
          }
        />
      </div>

      {draft.background === CUSTOM_COLOR_ID && (
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
            style={{
              width: 48,
              height: 44,
              padding: 3,
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              background: colors.sheet,
              cursor: "pointer",
              flexShrink: 0,
            }}
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
      )}

      {draft.background === CUSTOM_COLOR_ID && (
        <p style={{ margin: "6px 0 0", fontFamily: FONT, fontSize: "12.5px", fontWeight: 500, color: colors.tertiary, lineHeight: 1.5 }}>
          Any colour works. Blur stays off for solid colours.
        </p>
      )}

      {draft.background === MY_PHOTO_ID && (
        <MyPhotoCard
          theme={theme}
          photo={photo}
          zoom={draft.photoZoom}
          onPicked={onPhotoPicked}
          onRemove={onPhotoRemoved}
          onZoomChange={onPhotoZoom}
        />
      )}

      <p style={{ margin: "10px 0 0", fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: colors.secondary, lineHeight: 1.5 }}>
        {isSolidBackground(draft.background, theme)
          ? "Selected: a single, even tone."
          : draft.background === MY_PHOTO_ID
            ? "Selected: your own photo."
            : "Selected: a soft gradient."}
      </p>
    </>
  );
}