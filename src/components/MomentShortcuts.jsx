import { Crosshair, EyeOff, Leaf, Moon, Sun } from "lucide-react";
import { FONT, FROST_GLASS, FROST_INK, getColors } from "../lib/design";
import { MOMENTS } from "../lib/moments";

const ICONS = { calm: Leaf, focus: Crosshair, wind_down: Moon, reset: Sun };

export default function MomentShortcuts({ theme, ink, onSelect, notice, onHide }) {
  // These sit on the chosen background rather than on an interface surface, so
  // they follow the canvas ink that MainScreen worked out.
  const colors = ink || getColors(theme);

  return (
    <div style={{ padding: "0 20px" }}>
      {/* The prompt and its hide control are one glass capsule: the whole pill
          hides the shortcuts, and the translucent surface keeps it readable over
          any photograph or colour. */}
      <div style={{ display: "flex", justifyContent: "center", margin: "0 0 10px" }}>
        <button
          type="button"
          onClick={onHide}
          aria-label="Hide moment shortcuts"
          title="Hide moment shortcuts"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            maxWidth: "100%",
            minHeight: 36,
            padding: "0 12px 0 15px",
            borderRadius: 999,
            ...FROST_GLASS,
            cursor: "pointer",
            color: FROST_INK,
            fontFamily: FONT,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.005em",
            lineHeight: 1.35,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(event) => (event.currentTarget.style.opacity = "0.86")}
          onMouseLeave={(event) => (event.currentTarget.style.opacity = "1")}
        >
          <span>What do you need right now?</span>
          <EyeOff size={16} strokeWidth={2.2} style={{ opacity: 0.7, flexShrink: 0 }} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {MOMENTS.map((moment) => {
          const Icon = ICONS[moment.id];
          return (
            <button
              key={moment.id}
              type="button"
              onClick={() => onSelect(moment.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                minHeight: 54,
                padding: "11px 13px",
                borderRadius: 16,
                border: "none",
                cursor: "pointer",
                background: colors.momentTints[moment.id],
                color: colors.momentInk[moment.id],
                fontFamily: FONT,
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.005em",
                lineHeight: 1.25,
                textAlign: "left",
              }}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span>{moment.label}</span>
            </button>
          );
        })}
      </div>

      {notice && (
        <p
          style={{
            margin: "8px 2px 0",
            textAlign: "center",
            fontFamily: FONT,
            fontSize: "12.5px",
            fontWeight: 600,
            color: colors.secondary,
            lineHeight: 1.45,
          }}
        >
          {notice}
        </p>
      )}
    </div>
  );
}