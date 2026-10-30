import { ArrowUpRight } from "lucide-react";
import { FONT, getColors } from "../lib/design";

// The ⓘ fact card, in a fixed order: approved blurb first, then exactly one
// source line — a real "View source ↗" hyperlink when the technique has a
// stored URL, otherwise "Source: [name]".
export default function TechniqueInfoCard({
  science,
  sourceUrl,
  sourceLabel,
  theme,
  maxHeight,
  onClose,
  cardRef,
}) {
  const colors = getColors(theme);

  return (
    <div
      ref={cardRef}
      onClick={onClose}
      style={{
        position: "absolute",
        top: "calc(env(safe-area-inset-top, 44px) + 104px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 30,
        width: "calc(100vw - 48px)",
        maxWidth: 300,
        padding: "16px 20px",
        borderRadius: 18,
        background: colors.glass,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${colors.glassBorder}`,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Only the blurb scrolls when space runs short, so the source line
          below is never clipped out of view. */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
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
            textAlign: "center",
          }}
        >
          {science}
        </p>
      </div>

      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            // Opening the source must not count as tapping the card closed.
            event.stopPropagation();
          }}
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            width: "fit-content",
            margin: "8px auto 0",
            padding: "6px 0",
            fontFamily: FONT,
            fontSize: "12.5px",
            fontWeight: 600,
            letterSpacing: "0.01em",
            color: colors.text,
            textDecoration: "none",
            borderBottom: `1px dotted ${colors.tertiary}`,
          }}
        >
          <span>View source ↗</span>
          <ArrowUpRight size={12} strokeWidth={2.4} aria-hidden="true" />
        </a>
      ) : (
        sourceLabel && (
          <p
            style={{
              flexShrink: 0,
              margin: "8px 0 0",
              fontFamily: FONT,
              fontSize: "12.5px",
              fontWeight: 500,
              letterSpacing: "0.005em",
              lineHeight: 1.5,
              color: colors.tertiary,
              textAlign: "center",
            }}
          >
            Source: {sourceLabel}
          </p>
        )
      )}
    </div>
  );
}