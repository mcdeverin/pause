import { blurPixels, clampBlur, clampDim, clampPhotoOffset, clampPhotoZoom } from "../lib/background";
import { getBackgroundTone, isPhotoBackground, isSolidBackground } from "../lib/design";

// Paints the chosen background only. Dimming and blur stop at this layer, so the
// orb, the ring, text and controls are never touched.
// The host element needs position:relative and isolation:isolate.
// The canvas is appearance-independent — Light / Dark never repaints it — so the
// `theme` prop callers still pass is deliberately unused here.
export default function BackgroundLayer({ settings = {}, photo = null, fixed = false }) {
  const {
    background = "classic",
    backgroundDim = 0,
    backgroundBlur = 0,
    customColor,
    gradientFrom,
    gradientTo,
    photoZoom = 1,
    photoOffsetX = 0,
    photoOffsetY = 0,
  } = settings;

  const hasPhoto = isPhotoBackground(background) && Boolean(photo);
  const blur = isSolidBackground(background) ? 0 : blurPixels(clampBlur(backgroundBlur));
  const dim = clampDim(backgroundDim);
  const tone = getBackgroundTone(background, { customColor, gradientFrom, gradientTo });
  const zoom = clampPhotoZoom(photoZoom);

  return (
    <div
      aria-hidden="true"
      style={{
        // `fixed` is for hosts that scroll, so the texture never drifts.
        position: fixed ? "fixed" : "absolute",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        background: "#FAFAF8",
        transition: "background 0.35s ease",
      }}
    >
      {hasPhoto ? (
        <div
          style={{
            position: "absolute",
            // Slightly oversized while blurred so the soft edges never show.
            inset: blur > 0 ? -28 : 0,
            transition: "inset 0.3s ease",
          }}
        >
          <img
            src={photo}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${50 + clampPhotoOffset(photoOffsetX)}% ${50 + clampPhotoOffset(photoOffsetY)}%`,
              transform: zoom > 1 ? `scale(${zoom})` : "none",
              filter: blur > 0 ? `blur(${blur}px)` : "none",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: blur > 0 ? -40 : 0,
            background: tone,
            filter: blur > 0 ? `blur(${blur}px)` : "none",
            transition: "background 0.35s ease, inset 0.3s ease",
          }}
        />
      )}

      {dim > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0, 0, 0, ${dim / 100})`,
            transition: "background 0.2s ease",
          }}
        />
      )}
    </div>
  );
}