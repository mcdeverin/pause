import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import MainScreen from "../components/MainScreen";
import BreathingScreen from "../components/BreathingScreen";
import SupportScreen from "../components/SupportScreen";
import PaywallScreen from "../components/PaywallScreen";
import PersonalizePanel from "../components/personalize/PersonalizePanel";
import AboutLegalSheet from "../components/AboutLegalSheet";
import { loadTechniques, getRandomTechnique } from "../lib/techniqueLoader";
import { initRevenueCat, checkEntitlement } from "../lib/revenuecat";
import { loadPreferences, savePreferences } from "../lib/preferences";
import { addStoredPhoto, getStoredPhotos, removeStoredPhoto } from "../lib/backgroundPhoto";
import { resolveBackgroundImage } from "../lib/backgroundImage";
import BackgroundLayer from "../components/BackgroundLayer";
import { MOMENTS, addMoment } from "../lib/moments";
import MomentsScreen from "../components/moments/MomentsScreen";
import { track } from "../lib/analytics";
import { describeSavedBackground, describeVisual } from "../lib/analyticsProps";

const LOCKED_CATEGORIES = ["Focus", "Energy", "Advanced"];

export default function Home() {
  const [mode, setMode] = useState("idle");
  const [technique, setTechnique] = useState(null);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const [showSupport, setShowSupport] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const [pendingTechnique, setPendingTechnique] = useState(null);
  const [pendingMoment, setPendingMoment] = useState(null);
  const [shortcutNotice, setShortcutNotice] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [techniques, setTechniques] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [preferences, setPreferences] = useState(loadPreferences);
  const [photos, setPhotos] = useState(getStoredPhotos);

  // Light / Dark restyles the interface only — the background keeps its own canvas.
  const theme = preferences.appearance === "dark" ? "night" : "day";

  // The photograph in use is whatever the saved preferences point at — a curated
  // collection image or one of this device's own photos.
  const photo = resolveBackgroundImage(preferences, photos);
  const sessionMomentRef = useRef(null);
  const noticeTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(noticeTimerRef.current), []);

  const flashNotice = useCallback((message) => {
    setShortcutNotice(message);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setShortcutNotice(""), 4200);
  }, []);

  useEffect(() => {
    initRevenueCat()
      .then(() => checkEntitlement())
      .then((pro) => setIsPro(pro))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadTechniques()
      .then((loaded) => setTechniques(loaded))
      .catch(() => {});
  }, []);

  // Personalization — appearance included — is drafted inside the panel and only
  // committed here on save, so closing without saving changes nothing.
  const commitPreferences = useCallback((nextPreferences) => {
    setPreferences(nextPreferences);
    savePreferences(nextPreferences);
    // Reported on save only — never while a draft is being previewed.
    track("breathing_visual_saved", { visual_id: describeVisual(nextPreferences) });
    track("background_saved", describeSavedBackground(nextPreferences));
  }, []);

  // Hiding the moment shortcuts happens straight from the home screen, outside
  // the personalization draft, so it saves immediately.
  const updatePreference = useCallback((key, value) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      savePreferences(next);
      return next;
    });
  }, []);

  // Photos are stored on the device as soon as they're picked, so the library
  // survives a restart; which one is in use is part of the saved preferences.
  const handlePhotoAdded = useCallback((dataUrl) => {
    const result = addStoredPhoto(dataUrl);
    setPhotos(result.photos);
    return result;
  }, []);

  const handlePhotoRemoved = useCallback((id) => {
    setPhotos(removeStoredPhoto(id));
  }, []);

  const beginSession = useCallback((chosenTechnique, moment) => {
    sessionMomentRef.current = moment || null;
    setTechnique(chosenTechnique);
    setMode("breathing");
    track("breathing_session_started", {
      technique_id: chosenTechnique?.id || null,
      visual_id: describeVisual(preferences),
    });
  }, [preferences]);

  const startBreathing = useCallback((forcedTechnique = null) => {
    if (techniques.length === 0) return;
    const filtered = selectedCategory === "All"
      ? (isPro ? techniques : techniques.filter(t => !LOCKED_CATEGORIES.includes(t.category)))
      : techniques.filter(t => t.category === selectedCategory);
    const pool = filtered.length > 0 ? filtered : techniques;
    const t = forcedTechnique || getRandomTechnique(pool);

    if (!isPro && LOCKED_CATEGORIES.includes(t.category)) {
      setPendingMoment(null);
      setPendingTechnique(t);
      setShowPaywall(true);
      return;
    }

    beginSession(t, null);
  }, [techniques, selectedCategory, isPro, beginSession]);

  // Moment shortcuts only use their mapped category — never a fallback
  // technique, and never a premium category that isn't unlocked.
  const startMoment = useCallback((momentId) => {
    const moment = MOMENTS.find((entry) => entry.id === momentId);
    if (!moment) return;
    if (techniques.length === 0) {
      flashNotice("Your techniques are still loading. Try again in a moment.");
      return;
    }

    // Only techniques with usable phase data — a shortcut never falls back to
    // a stand-in technique behind the user's back.
    const pool = techniques.filter((t) => {
      if (!moment.categories.includes(t.category)) return false;
      const parsed = String(t.phases || "").split(",").map(Number);
      return parsed.length > 0 && !parsed.some(isNaN);
    });
    if (pool.length === 0) {
      flashNotice("No breathing exercise fits that one yet.");
      return;
    }

    const t = getRandomTechnique(pool);
    if (!isPro && LOCKED_CATEGORIES.includes(t.category)) {
      setPendingMoment(moment.id);
      setPendingTechnique(t);
      setShowPaywall(true);
      return;
    }

    beginSession(t, moment.id);
  }, [techniques, isPro, beginSession, flashNotice]);

  const finishSession = useCallback((result) => {
    const endedTechnique = technique;
    const elapsed = result?.elapsedSeconds || 0;

    if (endedTechnique && preferences.saveMoments && elapsed >= 1) {
      addMoment({
        id: result.sessionId,
        completed_at: new Date().toISOString(),
        technique_id: endedTechnique.id || null,
        technique_name: endedTechnique.name,
        moment: sessionMomentRef.current,
        duration_seconds: Math.round(elapsed),
        completed: Boolean(result.completed),
      });
    }

    track("breathing_session_ended", {
      technique_id: endedTechnique?.id || null,
      completed: Boolean(result?.completed),
      duration_seconds: Math.round(elapsed),
      visual_id: describeVisual(preferences),
    });

    sessionMomentRef.current = null;
    setMode("idle");
    setTechnique(null);
  }, [technique, preferences]);

  const openPaywall = useCallback(() => {
    setPendingTechnique(null);
    setPendingMoment(null);
    setShowPaywall(true);
  }, []);

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ position: "relative", isolation: "isolate" }}
    >
      <BackgroundLayer settings={preferences} theme={theme} photo={photo} />

      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <MainScreen
            key="main"
            onTap={() => startBreathing()}
            onSupportClick={() => setShowSupport(true)}
            theme={theme}
            onOpenAbout={() => setShowAbout(true)}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onHapticsChange={() => setHapticsEnabled(!hapticsEnabled)}
            isPro={isPro}
            backgroundSettings={preferences}
            photo={photo}
            visual={preferences.visual}
            visualOptions={preferences.visualOptions}
            onHideShortcuts={() => updatePreference("showShortcuts", false)}
            onShowShortcuts={() => updatePreference("showShortcuts", true)}
            onOpenPersonalize={() => setShowPersonalize(true)}
            onOpenMoments={() => setShowMoments(true)}
            onOpenPausePlus={openPaywall}
            onLockedCategoryTap={openPaywall}
            showShortcuts={preferences.showShortcuts}
            onSelectMoment={startMoment}
            shortcutNotice={shortcutNotice}
          />
        )}
        {mode === "breathing" && technique && (
          <BreathingScreen
            key="breathing"
            technique={technique}
            onDone={finishSession}
            theme={theme}
            hapticsEnabled={hapticsEnabled}
            visual={preferences.visual}
            visualOptions={preferences.visualOptions}
            backgroundSettings={preferences}
            photo={photo}
            showTimer={preferences.showTimer}
            showInstructions={preferences.showInstructions}
          />
        )}
      </AnimatePresence>

      {/* Personalization */}
      <AnimatePresence>
        {showPersonalize && (
          <PersonalizePanel
            key="personalize"
            theme={theme}
            prefs={preferences}
            photos={photos}
            onSave={commitPreferences}
            onAddPhoto={handlePhotoAdded}
            onRemovePhoto={handlePhotoRemoved}
            onClose={() => setShowPersonalize(false)}
          />
        )}
      </AnimatePresence>

      {/* Paywall overlay */}
      <AnimatePresence>
        {showPaywall && (
          <PaywallScreen
            key="paywall"
            theme={theme}
            triggerCategory={pendingTechnique?.category}
            onClose={() => { setShowPaywall(false); setPendingTechnique(null); setPendingMoment(null); }}
            onPurchase={() => {
              setIsPro(true);
              setShowPaywall(false);
              if (pendingTechnique) {
                beginSession(pendingTechnique, pendingMoment);
                setPendingTechnique(null);
                setPendingMoment(null);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Your Moments */}
      <AnimatePresence>
        {showMoments && (
          <MomentsScreen
            key="moments"
            theme={theme}
            backgroundSettings={preferences}
            photo={photo}
            saveEnabled={preferences.saveMoments}
            onClose={() => setShowMoments(false)}
          />
        )}
      </AnimatePresence>

      {/* About & Legal */}
      <AnimatePresence>
        {showAbout && (
          <AboutLegalSheet key="about" theme={theme} onClose={() => setShowAbout(false)} />
        )}
      </AnimatePresence>

      {/* Support overlay */}
      <AnimatePresence>
        {showSupport && (
          <SupportScreen key="support" onClose={() => setShowSupport(false)} theme={theme} />
        )}
      </AnimatePresence>
    </div>
  );
}