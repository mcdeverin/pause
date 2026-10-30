import { useState } from "react";
import { Check } from "lucide-react";
import { FONT, getColors } from "../../lib/design";
import {
  availableCollections,
  collectionForStyle,
  isCollectionVisible,
  stylesInCollection,
} from "../../lib/visuals";
import VisualThumb from "../visuals/VisualThumb";

// The breathing visual gallery: collection filters and small thumbnails. Only
// styles that exist here are listed, so nothing unfinished can be picked.
export default function VisualGallery({ theme, value, optionsFor, onChange }) {
  const colors = getColors(theme);
  const collections = availableCollections();
  const [collection, setCollection] = useState(() => {
    const saved = collectionForStyle(value);
    // A saved style from a collection that isn't offered now falls back to the
    // first collection that is, so the grid is never empty.
    return isCollectionVisible(saved) ? saved : collections[0].id;
  });
  const styles = stylesInCollection(collection);

  return (
    <div>
      {collections.length > 1 && (
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 4,
          margin: "0 -2px",
        }}
      >
        {collections.map((entry) => {
          const selected = entry.id === collection;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setCollection(entry.id)}
              aria-pressed={selected}
              style={{
                flexShrink: 0,
                minHeight: 40,
                padding: "9px 14px",
                borderRadius: 999,
                border: `1px solid ${selected ? colors.accent : colors.pillBorder}`,
                background: selected ? colors.accent : "transparent",
                color: selected ? (theme === "day" ? "#FFFFFF" : "#0F1E26") : colors.secondary,
                fontFamily: FONT,
                fontSize: "13.5px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "background 0.2s ease, color 0.2s ease",
              }}
            >
              {entry.label}
            </button>
          );
        })}
      </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginTop: collections.length > 1 ? 12 : 0,
        }}
      >
        {styles.map((style) => {
          const selected = style.id === value;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              aria-pressed={selected}
              aria-label={`${style.label} breathing visual`}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 7,
                padding: "9px 6px 10px",
                borderRadius: 18,
                border: `2px solid ${selected ? colors.accent : "transparent"}`,
                background: selected ? colors.accentSoft : "transparent",
                cursor: "pointer",
                fontFamily: FONT,
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
            >
              <VisualThumb id={style.id} theme={theme} options={optionsFor(style.id)} size={62} />
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: selected ? 800 : 600,
                  color: selected ? colors.text : colors.secondary,
                  lineHeight: 1.25,
                  textAlign: "center",
                }}
              >
                {style.label}
              </span>
              {selected && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: colors.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={12} strokeWidth={3.2} color={theme === "day" ? "#FFFFFF" : "#0F1E26"} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}