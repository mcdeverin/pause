import { STUDIO_UI } from "@/lib/crystalStudio";

const pillBase = {
  minHeight: 34,
  padding: "0 13px",
  borderRadius: 999,
  border: `1px solid ${STUDIO_UI.border}`,
  background: STUDIO_UI.card,
  color: STUDIO_UI.text,
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        ...pillBase,
        background: active ? STUDIO_UI.accent : STUDIO_UI.card,
        borderColor: active ? STUDIO_UI.accent : STUDIO_UI.border,
        color: active ? "#FFFFFF" : STUDIO_UI.text,
      }}
    >
      {children}
    </button>
  );
}

function Group({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <span
        style={{
          fontSize: 9.5,
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: STUDIO_UI.muted,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export default function StudioToolbar({
  modes,
  mode,
  onModeChange,
  auto,
  onToggleAuto,
  sync,
  onToggleSync,
  bothPlaying,
  onToggleBoth,
  onMatchSizes,
  quality,
  onQualityChange,
  manual,
  onManualChange,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "12px 18px",
        padding: "12px 16px",
        borderRadius: 18,
        border: `1px solid ${STUDIO_UI.border}`,
        background: STUDIO_UI.card,
      }}
    >
      <Group label="Background">
        {modes.map((entry) => (
          <Pill key={entry.id} active={mode === entry.id} onClick={() => onModeChange(entry.id)}>
            {entry.label}
          </Pill>
        ))}
      </Group>

      <Group label="Breathing">
        <Pill active={auto} onClick={onToggleAuto}>
          {auto ? "Auto" : "Manual"}
        </Pill>
        <Pill active={sync} onClick={onToggleSync}>
          Sync both
        </Pill>
      </Group>

      <Group label="Motion">
        <Pill active={!bothPlaying} onClick={onToggleBoth}>
          {bothPlaying ? "Pause both" : "Resume both"}
        </Pill>
        <button type="button" onClick={onMatchSizes} style={pillBase}>
          Match sizes
        </button>
      </Group>

      <Group label="Quality">
        <Pill active={quality === "high"} onClick={() => onQualityChange("high")}>
          High
        </Pill>
        <Pill active={quality === "balanced"} onClick={() => onQualityChange("balanced")}>
          Balanced
        </Pill>
      </Group>

      {!auto && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 220, flex: 1 }}>
          <span style={{ fontSize: 11, color: STUDIO_UI.muted, whiteSpace: "nowrap" }}>Manual breath</span>
          <input
            type="range"
            className="pause-slider"
            min={0}
            max={1}
            step={0.01}
            value={manual}
            onChange={(event) => onManualChange(Number(event.target.value))}
            aria-label="Manual breathing progress"
            style={{ "--pause-track": STUDIO_UI.track, "--pause-thumb": STUDIO_UI.accent, flex: 1 }}
          />
        </label>
      )}
    </div>
  );
}