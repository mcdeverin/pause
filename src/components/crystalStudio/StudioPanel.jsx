import { Maximize2, Minimize2, Pause, Play } from "lucide-react";
import { STUDIO_UI } from "@/lib/crystalStudio";

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: 34,
        height: 34,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 11,
        border: `1px solid ${STUDIO_UI.border}`,
        background: STUDIO_UI.card,
        color: STUDIO_UI.text,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function StudioPanel({
  label,
  tag,
  background,
  playing,
  onTogglePlay,
  onExpand,
  expanded = false,
  controls,
  children,
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: STUDIO_UI.text }}>{label}</h2>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: STUDIO_UI.accent,
            }}
          >
            {tag}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <IconButton label={playing ? "Pause rotation" : "Resume rotation"} onClick={onTogglePlay}>
            {playing ? <Pause size={14} strokeWidth={2.2} /> : <Play size={14} strokeWidth={2.2} />}
          </IconButton>
          <IconButton label={expanded ? "Back to both" : "Enlarge this crystal"} onClick={onExpand}>
            {expanded ? <Minimize2 size={14} strokeWidth={2.2} /> : <Maximize2 size={14} strokeWidth={2.2} />}
          </IconButton>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 24,
          overflow: "hidden",
          background,
          border: `1px solid ${STUDIO_UI.border}`,
          boxShadow: "0 18px 40px rgba(44, 48, 46, 0.10)",
        }}
      >
        {children}
      </div>

      {controls}
    </section>
  );
}