import { Info } from "lucide-react";
import { FONT } from "../lib/design";

// The fact card: technique name on the left, the ⓘ toggle on the right, and —
// once opened — the blurb with an optional source link at the bottom left.
export default function InfoCard({
  cardRef,
  name,
  science,
  sourceUrl,
  colors,
  open,
  onToggle,
  maxHeight,
}) {
  return (
    <div
      ref={cardRef}
      style={{
        position: "absolute",
        top: "calc(env(safe-area-inset-top, 44px) + 46px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 30,
        width: "calc(100vw - 32px)",
        maxWidth: 340,
        boxSizing: "border-box",
        padding: open ? "12px 16px 14px" : "0 16px",
        borderRadius: 18,
        background: open ? colors.glass : "transparent",
        backdropFilter: open ? "blur(20px)" : "none",
        WebkitBackdropFilter: open ? "blur(20px)" : "none",
        border: `1px solid ${open ? colors.glassBorder : "transparent"}`,
        transition: "background 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <p
          style={{
            flex: 1,
            margin: 0,
            fontFamily: FONT,
            fontSize: "19px",
            fontWeight: 700,
            letterSpacing: "0.01em",
            textTransform: "lowercase",
            textAlign: "left",
            color: colors.text,
            lineHeight: 1.3,
            overflowWrap: "anywhere",
          }}
        >
          {name}
        </p>

        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Hide technique details" : "About this technique"}
          aria-expanded={open}
          style={{
            width: 44,
            height: 44,
            marginRight: -10,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: colors.tertiary,
          }}
        >
          <Info size={17} strokeWidth={2.2} />
        </button>
      </div>

      {open && (
        <div
          style={{
            marginTop: 4,
            maxHeight: maxHeight ? `${maxHeight}px` : undefined,
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: FONT,
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: 1.65,
              color: colors.text,
              textAlign: "left",
            }}
          >
            {science}
          </p>

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "4px 0",
                fontFamily: FONT,
                fontSize: "12.5px",
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: colors.accent,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              View source ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}