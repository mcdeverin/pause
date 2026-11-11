import { useState, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import BreathingVisual from "./visuals/BreathingVisual";
import NavigationSheet from "./NavigationSheet";
import { FONT, HEADING_FONT, isPhotoBackground } from "../lib/design";
import { getCanvasInk } from "../lib/canvasInk";
import BackgroundLayer from "./BackgroundLayer";
import { usePhotoLightness } from "../hooks/usePhotoLightness";

const ORB_MAX = 300;

export default function MainScreen({
  onTap,
  theme = "day",
  onOpenAbout,
  selectedCategory = "All",
  onCategoryChange,
  isPro = false,
  isOwner = false,
  lockedCategories = [],
  onLockedCategoryTap,
  onOpenPersonalize,
  onOpenMoments,
  onOpenPausePlus,
  showShortcuts = true,
  onSelectMoment,
  shortcutNotice = "",
  backgroundSettings = {},
  photo = null,
  visual = "orb",
  visualOptions = {},
  onHideShortcuts,
  onShowShortcuts,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tourStep, setTourStep] = useState(() => {
    try { return localStorage.getItem("alwaysPauseTourPendingV1") === "true" ? 0 : -1; } catch { return -1; }
  });
  const finishTour = () => {
    try { localStorage.removeItem("alwaysPauseTourPendingV1"); localStorage.setItem("alwaysPauseTourSeenV1", "true"); } catch { /* optional tour */ }
    setTourStep(-1);
    setMenuOpen(false);
  };
  const nextTour = () => setTourStep((step) => Math.min(step + 1, 3));
  const tourCards = [
    { title: "Your moment starts here.", body: "Tap the orb whenever you want a pause. You can choose what you need before a breathing session begins.", examples: ["Feel calmer", "Find focus", "Wind down"] },
    { title: "Breathe your way.", body: "Choose Guided to hear breathing cues, or Not Guided to follow the orb quietly.", examples: ["Guided", "Not Guided"] },
    { title: "Explore your senses.", body: "The Sensory menu has experiences to explore beyond breathing. Try one whenever you want a different kind of pause.", examples: ["Breathing techniques", "Sensory experiences"] },
    { title: "Make it yours.", body: "Personalize your orb, colors, and background. Your choices stay saved until you change them.", examples: ["Classic orb", "Colors", "Background"] },
  ];
  // The orb stays dominant and scales with the viewport.
  const measureOrb = useCallback(() => {
    if (typeof window === "undefined") return ORB_MAX;
    const heightShare = 0.42;
    return Math.round(
      Math.min(ORB_MAX, window.innerWidth * 0.62, window.innerHeight * heightShare)
    );
  }, []);

  const [orbSize, setOrbSize] = useState(measureOrb);

  useEffect(() => {
    const handleResize = () => setOrbSize(measureOrb());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureOrb]);

  // Text and icons sit straight on the chosen background, so the ink adapts to
  // it. The background itself is never touched.
  const photoBackground =
    isPhotoBackground(backgroundSettings.background) && Boolean(photo);
  const photoLightness = usePhotoLightness(photoBackground ? photo : null);
  const ink = getCanvasInk(theme, backgroundSettings, {
    hasPhoto: photoBackground,
    photoLightness,
  });

  return (
    <div
      className="screen-fit"
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        isolation: "isolate",
        paddingTop: "calc(env(safe-area-inset-top, 44px) + 6px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 18px)",
      }}
    >
      <BackgroundLayer settings={backgroundSettings} theme={theme} photo={photo} />

      {/* Soft top scrim protects white copy over bright nature photographs. */}
      {photoBackground && <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: "44%", background: "linear-gradient(to bottom, rgba(9,27,35,.62), rgba(9,27,35,.40) 65%, transparent)", pointerEvents: "none", zIndex: 0 }} />}

      {/* Header: wordmark + menu */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 44,
          padding: "0 10px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: HEADING_FONT,
            fontSize: "22px",
            fontWeight: 400,
            letterSpacing: "-0.035em",
            color: photoBackground ? "#FFFFFF" : ink.text,
            textShadow: photoBackground ? "0 2px 10px rgba(0,0,0,.55)" : ink.shadow,
            lineHeight: 1,
          }}
        >
          always pause.
        </p>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          style={{
            position: "absolute",
            top: 0,
            right: 6,
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: ink.text,
            opacity: 0.85,
          }}
        >
          <Menu size={23} strokeWidth={2.2} />
        </button>
      </div>

      {/* Keep the heading in normal layout flow so it never overlaps the orb
          on mobile web browsers with shorter usable viewports. */}
      <div
        style={{
          margin: "clamp(20px, 4vh, 44px) 24px 0",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: HEADING_FONT,
            fontSize: "clamp(36px, 7vw, 52px)",
            fontWeight: 400,
            letterSpacing: "-0.035em",
            color: photoBackground ? "#FFFFFF" : ink.text,
            textShadow: photoBackground ? "0 2px 16px rgba(0,0,0,.5)" : ink.shadow,
            lineHeight: 1.25,
          }}
        >
          Take a moment.
        </p>
        <p
          style={{
            margin: "6px 0 0",
            fontFamily: FONT,
            fontSize: "15px",
            fontWeight: 400,
            letterSpacing: "0.005em",
            color: photoBackground ? "#FFFFFF" : ink.secondary,
            textShadow: photoBackground ? "0 2px 12px rgba(0,0,0,.75), 0 1px 3px rgba(0,0,0,.6)" : ink.shadow,
            lineHeight: 1.45,
          }}
        >
          Whenever you need one.
        </p>
      </div>

      {/* Orb + invitation */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          padding: "0 24px",
        }}
      >
        <button
          type="button"
          onClick={onTap}
          aria-label="Start breathing"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* The resting visual is whichever one they chose — at rest, not breathing.
              The ring rests as a complete circle instead of an empty track. */}
          <div style={{ width: orbSize, height: orbSize }}>
            <BreathingVisual
              id={visual}
              breath={visual === "ring" ? 1 : 0}
              theme={theme}
              options={visualOptions?.[visual]}
              photo={photo}
              backgroundSettings={backgroundSettings}
            />
          </div>
        </button>

        <button
          type="button"
          onClick={onTap}
          style={{
            minHeight: 44,
            padding: "10px 26px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: "15px",
            fontWeight: 500,
            letterSpacing: "0.015em",
            color: ink.text,
            textShadow: ink.shadow,
          }}
        >
          Tap to pause
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <NavigationSheet
            key="nav"
            theme={theme}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            isPro={isPro}
            isOwner={isOwner}
            lockedCategories={lockedCategories}
            onLockedCategoryTap={onLockedCategoryTap}
            onOpenPersonalize={onOpenPersonalize}
            onOpenMoments={onOpenMoments}
            onOpenPausePlus={onOpenPausePlus}
            onOpenAbout={onOpenAbout}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      {tourStep >= 0 && (
        <div role="dialog" aria-modal="true" aria-label="Welcome to Always Pause" style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(6,23,28,.38)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, pointerEvents: "auto" }}>
          <div style={{ width: "min(420px, 100%)", maxHeight: "min(85dvh, 650px)", overflowY: "auto", borderRadius: 24, background: "#f7f3ed", color: "#203b3c", padding: "clamp(20px, 5vw, 32px)", boxShadow: "0 14px 50px rgba(0,0,0,.25)" }}>
            <div style={{ fontSize: 12, letterSpacing: ".12em", opacity: .65, marginBottom: 18 }}>A LITTLE TOUR · {tourStep + 1} OF 4</div>
            <h2 style={{ fontFamily: HEADING_FONT, fontWeight: 400, fontSize: "clamp(27px, 6vw, 34px)", lineHeight: 1.15, margin: "0 0 12px" }}>{tourCards[tourStep].title}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.55, margin: "0 0 20px" }}>{tourCards[tourStep].body}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9, marginBottom: 24 }}>
              {tourCards[tourStep].examples.map((example) => (
                <div key={example} style={{ border: "1px solid #c4d4cf", background: "#e8efeb", borderRadius: 14, padding: "15px 10px", textAlign: "center", fontSize: 14 }}>{example}</div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
              {tourCards.map((_, i) => <span key={i} style={{ width: i === tourStep ? 18 : 6, height: 6, borderRadius: 8, background: i === tourStep ? "#244749" : "#bdc8c4" }} />)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <button type="button" onClick={finishTour} style={{ border: 0, background: "none", color: "#496064", cursor: "pointer", padding: "12px 0" }}>Skip tour</button>
              <button type="button" onClick={tourStep === 3 ? finishTour : nextTour} style={{ border: 0, background: "#244749", color: "white", padding: "12px 22px", borderRadius: 25, cursor: "pointer" }}>{tourStep === 3 ? "Start exploring" : "Continue →"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}