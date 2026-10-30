import { FONT, getColors } from "../../lib/design";
import { BACKGROUND_CATEGORIES } from "../../lib/backgroundGallery";

// The five background categories. They scroll sideways on narrow screens so the
// row never wraps or overflows the sheet.
export default function CategoryTabs({ theme, value, onChange }) {
  const colors = getColors(theme);

  return (
    <div
      role="tablist"
      aria-label="Background categories"
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 4,
        margin: "0 -2px",
      }}
    >
      {BACKGROUND_CATEGORIES.map((category) => {
        const selected = category.id === value;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(category.id)}
            style={{
              flexShrink: 0,
              minHeight: 38,
              padding: "8px 14px",
              borderRadius: 999,
              border: `1px solid ${selected ? colors.accent : colors.pillBorder}`,
              background: selected ? colors.accent : "transparent",
              color: selected ? (theme === "day" ? "#FFFFFF" : "#0F1E26") : colors.secondary,
              fontFamily: FONT,
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "background 0.2s ease, color 0.2s ease",
            }}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}