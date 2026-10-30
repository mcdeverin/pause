import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { FONT, getColors, isSolidBackground, MY_PHOTO_ID } from "../../lib/design";
import { resolveOptions } from "../../lib/visuals";
import { BLUR_MAX, DIM_MAX, clampBlur, clampDim, clampPhotoOffset, clampPhotoZoom } from "../../lib/background";
import PreferenceToggle from "./PreferenceToggle";
import LivePreview from "./LivePreview";
import VisualGallery from "./VisualGallery";
import FineTuneSection from "./FineTuneSection";
import BackgroundSection from "./BackgroundSection";
import AdjustmentSlider from "./AdjustmentSlider";

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


export default function PersonalizePanel({
  theme,
  prefs,
  photo = null,
  onSave,
  onPhotoPicked,
  onPhotoRemoved,
  onClose,
}) {
  // Everything below edits a draft. The stored preferences only change through
  // Save My Pause, so closing this panel simply discards the draft.
  const [draft, setDraft] = useState(prefs);
  const [draftTheme, setDraftTheme] = useState(theme);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimerRef = useRef(0);

  const colors = getColors(draftTheme);
  const isDay = draftTheme === "day";
  const solidBackground = isSolidBackground(draft.background, draftTheme);

  useEffect(() => () => clearTimeout(savedTimerRef.current), []);

  const update = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setJustSaved(false);
  };

  const updateTheme = (nextTheme) => {
    setDraftTheme(nextTheme);
    setJustSaved(false);
  };

  // Fine-tuning edits the draft options of the style in use, nothing else.
  const updateVisualOption = (key, value) => {
    setDraft((current) => {
      const styleId = current.visual;
      const merged = {
        ...resolveOptions(styleId, current.visualOptions?.[styleId]),
        [key]: value,
      };
      return {
        ...current,
        visualOptions: { ...current.visualOptions, [styleId]: merged },
      };
    });
    setJustSaved(false);
  };

  const selectBackground = (id) => {
    setDraft((current) => {
      const next = { ...current, background: id };
      // Blur means nothing on a flat colour, so it isn't carried into one.
      if (isSolidBackground(id, draftTheme)) next.backgroundBlur = 0;
      return next;
    });
    setJustSaved(false);
  };

  const panPhoto = ({ x, y }) => {
    setDraft((current) => ({
      ...current,
      photoOffsetX: clampPhotoOffset(x),
      photoOffsetY: clampPhotoOffset(y),
    }));
    setJustSaved(false);
  };

  const handlePhotoPicked = (dataUrl) => {
    const stored = onPhotoPicked(dataUrl);
    setDraft((current) => ({
      ...current,
      background: MY_PHOTO_ID,
      photoZoom: 1,
      photoOffsetX: 0,
      photoOffsetY: 0,
    }));
    setJustSaved(false);
    return stored;
  };

  const handlePhotoRemoved = () => {
    onPhotoRemoved();
    setDraft((current) =>
      current.background === MY_PHOTO_ID
        ? { ...current, background: "classic", photoZoom: 1, photoOffsetX: 0, photoOffsetY: 0 }
        : current
    );
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
          <LivePreview theme={draftTheme} settings={draft} photo={photo} onPhotoPan={panPhoto} />

          {/* Breathing visuals */}
          <SectionLabel theme={draftTheme}>Breathing visuals</SectionLabel>
          <VisualGallery
            theme={draftTheme}
            value={draft.visual}
            optionsFor={(id) => resolveOptions(id, draft.visualOptions?.[id])}
            onChange={(id) => update("visual", id)}
          />
          <FineTuneSection
            theme={draftTheme}
            styleId={draft.visual}
            options={resolveOptions(draft.visual, draft.visualOptions?.[draft.visual])}
            onChange={updateVisualOption}
          />

          {/* Background */}
          <SectionLabel theme={draftTheme}>Background</SectionLabel>
          <BackgroundSection
            draft={draft}
            theme={draftTheme}
            onSelectBackground={selectBackground}
            onCustomColor={(hex) => update("customColor", hex)}
            photo={photo}
            onPhotoPicked={handlePhotoPicked}
            onPhotoRemoved={handlePhotoRemoved}
            onPhotoZoom={(zoom) => update("photoZoom", clampPhotoZoom(zoom))}
          />

          {/* Background adjustments */}
          <SectionLabel theme={draftTheme}>Background adjustments</SectionLabel>
          <AdjustmentSlider
            label="Dimming"
            value={clampDim(draft.backgroundDim)}
            max={DIM_MAX}
            onChange={(value) => update("backgroundDim", value)}
            theme={draftTheme}
          />
          <AdjustmentSlider
            label="Soft Blur"
            value={clampBlur(draft.backgroundBlur)}
            max={BLUR_MAX}
            disabled={solidBackground}
            onChange={(value) => update("backgroundBlur", value)}
            hint={
              solidBackground
                ? "A solid color has nothing to soften, so blur stays off."
                : "Softens the background only. Your breathing visual stays sharp."
            }
            theme={draftTheme}
          />

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