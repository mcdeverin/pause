import { useEffect, useRef, useState } from "react";
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
import LivePreview from "./LivePreview";

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

export default function PersonalizePanel({ theme, prefs, onSave, onClose }) {
  // Everything below edits a draft. The stored preferences only change through
  // Save My Pause, so closing this panel simply discards the draft.
  const [draft, setDraft] = useState(prefs);
  const [draftTheme, setDraftTheme] = useState(theme);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimerRef = useRef(0);

  const colors = getColors(draftTheme);
  const isDay = draftTheme === "day";

  useEffect(() => () => clearTimeout(savedTimerRef.current), []);

  const update = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setJustSaved(false);
  };

  const updateTheme = (nextTheme) => {
    setDraftTheme(nextTheme);
    setJustSaved(false);
  };

  const handleSave = () => {
    onSave(draft, draftTheme);
    setJustSaved(true);
    clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setJustSaved(false), 2600);
  };

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
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: colors.sheet,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          boxSizing: "border-box",
          boxShadow: "0 -10px 44px rgba(0, 0, 0, 0.20)",
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <div style={{ padding: "18px 22px 0", flexShrink: 0 }}>
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
            Try your choices below, then save the pause that feels right.
          </p>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            padding: "14px 22px 18px",
          }}
        >
          <SectionLabel theme={draftTheme} isFirst>
            Live preview
          </SectionLabel>
          <LivePreview
            theme={draftTheme}
            visual={draft.visual}
            background={draft.background}
            showTimer={draft.showTimer}
            showInstructions={draft.showInstructions}
          />

          {/* Breathing Visual */}
          <SectionLabel theme={draftTheme}>Breathing visual</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {BREATHING_VISUALS.map((option) => (
              <PreviewCard
                key={option.id}
                theme={draftTheme}
                label={option.label}
                description={option.description}
                selected={draft.visual === option.id}
                onSelect={() => update("visual", option.id)}
                previewBackground={colors.track}
                preview={<VisualPreview id={option.id} theme={draftTheme} />}
              />
            ))}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: 600, color: colors.secondary }}>
            Selected: {getVisualLabel(draft.visual)}
          </p>

          {/* Background */}
          <SectionLabel theme={draftTheme}>Background</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {BACKGROUNDS.map((option) => (
              <PreviewCard
                key={option.id}
                theme={draftTheme}
                compact
                label={option.label}
                selected={draft.background === option.id}
                onSelect={() => update("background", option.id)}
                previewBackground={getBackgroundStyle(option.id, draftTheme).background}
                preview={null}
              />
            ))}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: 600, color: colors.secondary }}>
            Selected: {getBackgroundLabel(draft.background)}
          </p>

          {/* Appearance */}
          <SectionLabel theme={draftTheme}>Appearance</SectionLabel>
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
              const active = isDay === (option.id === "day");
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateTheme(option.id)}
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

          {/* Session details */}
          <SectionLabel theme={draftTheme}>During your session</SectionLabel>
          <PreferenceToggle
            theme={draftTheme}
            label="Show Session Timer"
            description="A small countdown in the top corner of your session."
            checked={draft.showTimer}
            onChange={(value) => update("showTimer", value)}
          />
          <PreferenceToggle
            theme={draftTheme}
            label="Show Breathing Instructions"
            description="Show inhale, hold and exhale cues as you breathe."
            checked={draft.showInstructions}
            onChange={(value) => update("showInstructions", value)}
          />
          <PreferenceToggle
            theme={draftTheme}
            label="Show Moment Shortcuts"
            description="Choose a breathing exercise based on what you need."
            checked={draft.showShortcuts}
            onChange={(value) => update("showShortcuts", value)}
          />
          <PreferenceToggle
            theme={draftTheme}
            label="Save My Moments"
            description="Privately save your breathing sessions to see your patterns over time."
            checked={draft.saveMoments}
            onChange={(value) => update("saveMoments", value)}
          />
          {draft.saveMoments && (
            <p style={{ margin: "10px 0 0", fontSize: "12.5px", fontWeight: 500, color: colors.tertiary, lineHeight: 1.55 }}>
              Saved only on this device. Uninstalling the app or moving to a new device clears your
              history, and you can delete it any time in Your Moments.
            </p>
          )}
        </div>

        {/* Sticky save bar */}
        <div
          style={{
            flexShrink: 0,
            padding: "12px 22px calc(env(safe-area-inset-bottom, 20px) + 14px)",
            borderTop: `1px solid ${colors.border}`,
            background: colors.sheet,
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            style={{
              width: "100%",
              minHeight: 52,
              border: "none",
              borderRadius: 50,
              cursor: "pointer",
              background: isDay
                ? "linear-gradient(135deg, #7AA8C4 0%, #96C4AE 100%)"
                : "linear-gradient(135deg, #7481B8 0%, #96C4AE 100%)",
              color: isDay ? "#FAFAF8" : "#F0EDE8",
              fontFamily: FONT,
              fontSize: "17px",
              fontWeight: 800,
              letterSpacing: "0.005em",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(event) => (event.currentTarget.style.opacity = "0.86")}
            onMouseLeave={(event) => (event.currentTarget.style.opacity = "1")}
          >
            Save My Pause
          </button>
          <p
            aria-live="polite"
            style={{
              margin: "8px 0 0",
              minHeight: 17,
              textAlign: "center",
              fontFamily: FONT,
              fontSize: "12.5px",
              fontWeight: 500,
              letterSpacing: "0.005em",
              color: colors.tertiary,
              lineHeight: 1.4,
            }}
          >
            {justSaved ? "saved to this device." : "nothing changes until you save."}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}