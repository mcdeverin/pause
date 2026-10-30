import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { FONT, getColors } from "../lib/design";

// The card can be dragged shorter or taller, but never past the space it was
// measured to have, so the text can still never cover the breathing visual.
const MIN_HEIGHT = 120;

// The ⓘ fact card, in a fixed order: approved blurb first, then exactly one
// source line — a real "View source ↗" hyperlink when the technique has a
// stored URL, otherwise "Source: [name]".
export default function TechniqueInfoCard({
  scienceBlurb,
  scienceBlurbSourceUrl,
  scienceBlurbSource,
  theme,
  maxHeight,
  onClose,
  cardRef,
}) {
  const colors = getColors(theme);
  const dragRef = useRef(null);
  const [draggedHeight, setDraggedHeight] = useState(null);

  // Without a measurement yet, the card keeps its natural height.
  const ceiling = maxHeight || null;
  const height = draggedHeight ? Math.min(draggedHeight, ceiling || draggedHeight) : null;

  const startDrag = (event) => {
    const card = cardRef?.current;
    if (!card || !ceiling) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      startY: event.clientY,
      startHeight: card.getBoundingClientRect().height,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const drag = (event) => {
    const state = dragRef.current;
    if (!state) return;
    event.stopPropagation();
    const next = state.startHeight + (event.clientY - state.startY);
    setDraggedHeight(Math.max(MIN_HEIGHT, Math.min(next, ceiling)));
  };

  const endDrag = (event) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    event.stopPropagation();
  };

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
        padding: "16px 20px 30px",
        borderRadius: 18,
        background: colors.glass,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${colors.glassBorder}`,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: height ? `${height}px` : undefined,
        maxHeight: ceiling ? `${ceiling}px` : undefined,
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
          {scienceBlurb}
        </p>
      </div>

      {scienceBlurbSourceUrl ? (
        <a
          href={scienceBlurbSourceUrl}
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
          <span>View source</span>
          <ArrowUpRight size={12} strokeWidth={2.4} aria-hidden="true" />
        </a>
      ) : (
        scienceBlurbSource && (
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
            Source: {scienceBlurbSource}
          </p>
        )
      )}

      {/* Drag grip — pulls the card taller or shorter. */}
      <div
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={(event) => event.stopPropagation()}
        role="separator"
        aria-label="Drag to resize"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "ns-resize",
          touchAction: "none",
        }}
      >
        <span
          style={{
            width: 34,
            height: 4,
            borderRadius: 999,
            background: colors.tertiary,
            opacity: 0.45,
          }}
        />
      </div>
    </div>
  );
}