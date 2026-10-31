import { ImageIcon } from "lucide-react";
import { FONT, getColors } from "../../lib/design";
import PlusTag from "./PlusTag";
import { isPremiumBackground } from "../../lib/access";

const GRID = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
};

// The photographic collections. Real curated images only — an unpopulated
// collection shows a clean empty state rather than stand-in photography.
export default function PhotoGallery({ theme, value, onSelect, images, emptyCopy, isPro = false }) {
  const colors = getColors(theme);

  return (
    <>
      {images.length === 0 ? (
        <div
          style={{
            padding: "22px 18px",
            borderRadius: 18,
            border: `1px dashed ${colors.pillBorder}`,
            background: colors.glass,
            textAlign: "center",
          }}
        >
          <ImageIcon size={20} strokeWidth={2} color={colors.tertiary} aria-hidden="true" />
          <p
            style={{
              margin: "8px 0 0",
              fontFamily: FONT,
              fontSize: "13px",
              fontWeight: 600,
              color: colors.secondary,
              lineHeight: 1.5,
            }}
          >
            {emptyCopy}
          </p>
        </div>
      ) : (
        <div style={GRID}>
          {images.map((image) => {
            const selected = image.id === value;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelect(image.id)}
                aria-pressed={selected}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: 6,
                  borderRadius: 14,
                  border: `2px solid ${selected ? colors.accent : colors.glassBorder}`,
                  background: colors.glass,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                {!isPro && isPremiumBackground(image.id) && <PlusTag theme={theme} />}
                <span
                  style={{
                    display: "block",
                    height: 78,
                    borderRadius: 10,
                    overflow: "hidden",
                    background: image.tone || colors.track,
                  }}
                >
                  {/* Lazy, low-priority thumbnails: only the photographs actually on
                      screen are requested, so opening the panel stays light. */}
                  <img
                    src={image.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      display: "block",
                    }}
                  />
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: selected ? 700 : 600,
                    color: colors.text,
                    lineHeight: 1.3,
                    textAlign: "center",
                  }}
                >
                  {image.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}