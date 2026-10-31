import { ImageIcon } from "lucide-react";
import { FONT, getColors } from "../../lib/design";

const GRID = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
};

// The photographic collections. Real curated images only — an unpopulated
// collection shows a clean empty state rather than stand-in photography.
export default function PhotoGallery({ theme, value, onSelect, images, emptyCopy, seasonTabs = null }) {
  const colors = getColors(theme);

  return (
    <>
      {seasonTabs && (
        <div
          role="tablist"
          aria-label="Seasons"
          style={{ display: "flex", gap: 6, overflowX: "auto", margin: "0 0 10px", paddingBottom: 2 }}
        >
          {seasonTabs.seasons.map((season) => {
            const selected = season.id === seasonTabs.value;
            return (
              <button
                key={season.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => seasonTabs.onChange(season.id)}
                style={{
                  flexShrink: 0,
                  minHeight: 34,
                  padding: "7px 12px",
                  borderRadius: 999,
                  border: `1px solid ${selected ? colors.accent : colors.pillBorder}`,
                  background: selected ? colors.accentSoft : "transparent",
                  color: selected ? colors.text : colors.secondary,
                  fontFamily: FONT,
                  fontSize: "12.5px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {season.label}
              </button>
            );
          })}
        </div>
      )}

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