import { Crosshair, EyeOff, Leaf, Moon, Sun } from "lucide-react";
import { FONT, getColors } from "../lib/design";
import { MOMENTS } from "../lib/moments";

const ICONS = { calm: Leaf, focus: Crosshair, wind_down: Moon, reset: Sun };

export default function MomentShortcuts({ theme, onSelect, notice, onHide }) {
  const colors = getColors(theme);

  return (
    <div style={{ padding: "0 20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          margin: "0 0 10px",
        }}
      >
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: "14.5px",
            fontWeight: 700,
            letterSpacing: "0.005em",
            color: colors.secondary,
          }}
        >
          What do you need right now?
        </p>
        <button
          type="button"
          onClick={onHide}
          aria-label="Hide moment shortcuts"
          title="Hide moment shortcuts"
          style={{
            width: 32,
            height: 32,
            marginRight: -6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: colors.tertiary,
            opacity: 0.55,
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(event) => (event.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(event) => (event.currentTarget.style.opacity = "0.55")}
        >
          <EyeOff size={16} strokeWidth={2.2} />
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