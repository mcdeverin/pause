import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  BACKGROUNDS,
  BREATHING_VISUALS,
  FONT,
  getBackgroundStyle,
  getColors,
  getVisualLabel,
  getBackgroundLabel,
} from "../../lib/design";
import PreferenceToggle from "./PreferenceToggle";
import PreviewCard from "./PreviewCard";

function SectionLabel({ children, theme, isFirst }) {
  const colors = getColors(theme);
  return (
    <p
      style={{
        margin: isFirst ? "4px 0 12px" : "26px 0 12px",
        fontFamily: FONT,
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: colors.tertiary,
      }}
    >
      {children}
    </p>
  );
}

function VisualPreview({ id, theme }) {
  const colors = getColors(theme);

  if (id === "ring") {
    return (
      <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true">
        <circle cx="32" cy="32" r="25" fill="none" stroke={colors.track} strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r="25"
          fill="none"
          stroke={colors.ringFrom}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="157"
          strokeDashoffset="58"
          transform="rotate(-90 32 32)"
        />
      </svg>
    );
  }

  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
        background: colors.orbGradient,
        animation: "liquidMorph 8s ease-in-out infinite",
      }}
    />
  );
}

export default function PersonalizePanel({ theme, prefs, onChange, onThemeChange, onClose }) {
  const colors = getColors(theme);

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: colors.scrim,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label="Personalize Pause"
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 48, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "92vh",
          overflowY: "auto",
          background: colors.sheet,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "18px 22px calc(env(safe-area-inset-bottom, 20px) + 26px)",
          boxSizing: "border-box",
          boxShadow: "0 -10px 44px rgba(0, 0, 0, 0.20)",
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: colors.text, letterSpacing: "-0.01em" }}>
            Personalize Pause
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close personalization"
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: colors.secondary,
              flexShrink: 0,
            }}
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>

        <p style={{ margin: "2px 0 0", fontSize: "15px", fontWeight: 500, color: colors.secondary, lineHeight: 1.5 }}>
          Shape your breathing experience. Everything here is free and saved on this device.
        </p>

        {/* Breathing Visual */}
        <SectionLabel theme={theme} isFirst={false}>
          Breathing visual
        </SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {BREATHING_VISUALS.map((option) => (
            <PreviewCard
              key={option.id}
              theme={theme}
              label={option.label}
              description={option.description}
              selected={prefs.visual === option.id}
              onSelect={() => onChange("visual", option.id)}
              previewBackground={colors.track}
              preview={<VisualPreview id={option.id} theme={theme} />}
            />
          ))}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: 600, color: colors.secondary }}>
          Selected: {getVisualLabel(prefs.visual)}
        </p>

        {/* Background */}
        <SectionLabel theme={theme}>Background</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {BACKGROUNDS.map((option) => (
            <PreviewCard
              key={option.id}
              theme={theme}
              compact
              label={option.label}
              selected={prefs.background === option.id}
              onSelect={() => onChange("background", option.id)}
              previewBackground={getBackgroundStyle(option.id, theme).background}
              preview={null}
            />
          ))}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: 600, color: colors.secondary }}>
          Selected: {getBackgroundLabel(prefs.background)}
        </p>

        {/* Session details */}
        <SectionLabel theme={theme}>During your session</SectionLabel>
        <PreferenceToggle
          theme={theme}
          label="Show Session Timer"
          description="A small countdown in the top corner of your session."
          checked={prefs.showTimer}
          onChange={(value) => onChange("showTimer", value)}
        />
        <PreferenceToggle
          theme={theme}
          label="Show Breathing Instructions"
          description="Show inhale, hold and exhale cues as you breathe."
          checked={prefs.showInstructions}
          onChange={(value) => onChange("showInstructions", value)}
        />

        {/* Appearance */}
        <SectionLabel theme={theme}>Appearance</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            padding: 5,
            borderRadius: 16,
            background: colors.track,
          }}
        >
          {[
            { id: "day", label: "Light" },
            { id: "night", label: "Dark" },
          ].map((option) => {
            const active = (theme === "day") === (option.id === "day");
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onThemeChange(option.id)}
                aria-pressed={active}
                style={{
                  minHeight: 44,
                  padding: "11px 8px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: active ? colors.sheet : "transparent",
                  color: active ? colors.text : colors.secondary,
                  fontFamily: FONT,
                  fontSize: "15px",
                  fontWeight: 700,
                  boxShadow: active ? "0 1px 4px rgba(0, 0, 0, 0.10)" : "none",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}