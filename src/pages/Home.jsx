import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
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
import { isFreeTechnique } from "../lib/access";

export default function Home() {
  const [mode, setMode] = useState("idle");
  const [technique, setTechnique] = useState(null);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const [showSupport, setShowSupport] = useState(false);
  // { source, featureId, featureCategory, introductory } — null when closed.
  const [paywall, setPaywall] = useState(null);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  // A personalization draft waiting on a purchase, so it can be applied after.
  const [pendingDraft, setPendingDraft] = useState(null);
  const [shortcutNotice, setShortcutNotice] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
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

  // The app's own admin account sees every exercise, visual and background. This
  // is a role check, never a change to the subscription itself.
  useEffect(() => {
    base44.auth
      .me()
      .then((me) => setIsOwner(me?.role === "admin"))
      .catch(() => {});
  }, []);

  const hasFullAccess = isPro || isOwner;

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

  // If the exercise library has not arrived yet — a slow first load on a phone —
  // fetch it again rather than swallowing the tap, which looked like a dead button.
  const ensureTechniques = useCallback(async () => {
    if (techniques.length > 0) return techniques;
    try {
      const loaded = await loadTechniques();
      setTechniques(loaded);
      return loaded;
    } catch {
      return [];
    }
  }, [techniques]);

  const hasUsablePhases = (technique) => {
    const parsed = String(technique.phases || "").split(",").map(Number);
    return parsed.length > 0 && !parsed.some(isNaN);
  };

  // A category is locked only when nothing free lives in it, so the menu never
  // marks an exercise's home as premium by accident.
  const lockedCategories = useMemo(() => {
    const categories = [...new Set(techniques.map((technique) => technique.category).filter(Boolean))];
    return categories.filter(
      (category) => !techniques.some((t) => t.category === category && isFreeTechnique(t))
    );
  }, [techniques]);

  const startBreathing = useCallback(async (forcedTechnique = null) => {
    const available = await ensureTechniques();
    if (available.length === 0) {
      flashNotice("Your exercises could not load. Check your connection and tap again.");
      return;
    }

    const inCategory =
      selectedCategory === "All"
        ? available
        : available.filter((t) => t.category === selectedCategory);
    // Free breathing is unlimited, but only for the starter exercises.
    const playable = hasFullAccess ? inCategory : inCategory.filter(isFreeTechnique);
    const pool =
      playable.length > 0
        ? playable
        : hasFullAccess
          ? available
          : available.filter(isFreeTechnique);
    if (pool.length === 0) {
      flashNotice("No breathing exercise fits that one yet.");
      return;
    }

    beginSession(forcedTechnique || getRandomTechnique(pool), null);
  }, [ensureTechniques, selectedCategory, hasFullAccess, beginSession, flashNotice]);

  // Choosing how you feel is always free: a shortcut uses the free exercises in
  // its own category where it can, and otherwise a starter exercise — it never
  // opens the offer.
  const startMoment = useCallback(async (momentId) => {
    const moment = MOMENTS.find((entry) => entry.id === momentId);
    if (!moment) return;

    const available = await ensureTechniques();
    if (available.length === 0) {
      flashNotice("Your techniques are still loading. Try again in a moment.");
      return;
    }

    const inMoment = available.filter(
      (t) => moment.categories.includes(t.category) && hasUsablePhases(t)
    );
    const playable = hasFullAccess ? inMoment : inMoment.filter(isFreeTechnique);
    const pool =
      playable.length > 0
        ? playable
        : available.filter((t) => isFreeTechnique(t) && hasUsablePhases(t));
    if (pool.length === 0) {
      flashNotice("No breathing exercise fits that one yet.");
      return;
    }

    beginSession(getRandomTechnique(pool), moment.id);
  }, [ensureTechniques, hasFullAccess, beginSession, flashNotice]);

  const openPaywall = useCallback((context = {}) => {
    // Interest in a specific premium feature, recorded once per attempt.
    if (context.featureId) {
      track("premium_feature_selected", {
        feature_id: context.featureId,
        feature_category: context.featureCategory || "unknown",
      });
    }
    setPaywall({
      source: context.source || "menu",
      featureId: context.featureId || null,
      featureCategory: context.featureCategory || null,
      introductory: Boolean(context.introductory),
    });
  }, []);

  // A premium option was chosen in the panel: the draft is kept so a purchase can
  // apply exactly what they were looking at.
  const requestUpgrade = useCallback((feature, draft) => {
    setPendingDraft(draft || null);
    openPaywall({ ...feature, source: feature.featureCategory });
  }, [openPaywall]);

  const closePaywall = useCallback(() => {
    setPaywall(null);
    setPendingDraft(null);
  }, []);

  const handlePaywallPurchase = useCallback(() => {
    const context = paywall;
    setIsPro(true);
    setPaywall(null);

    // Apply what they were doing before the offer appeared.
    if (pendingDraft) {
      commitPreferences(pendingDraft);
      setPendingDraft(null);
      setShowPersonalize(false);
    }
    if (context?.featureCategory === "technique" && context.featureId) {
      setSelectedCategory(context.featureId);
    }
  }, [paywall, pendingDraft, commitPreferences]);

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

    // The one-time introduction: only after a session they actually finished, and
    // only ever once. Kept apart from the subscription, which RevenueCat owns.
    if (result?.completed && !hasFullAccess && !preferences.introOfferSeen) {
      const next = { ...preferences, introOfferSeen: true };
      setPreferences(next);
      savePreferences(next);
      openPaywall({ source: "intro", introductory: true });
    }
  }, [technique, preferences, hasFullAccess, openPaywall]);

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
            isPro={hasFullAccess}
            backgroundSettings={preferences}
            photo={photo}
            visual={preferences.visual}
            visualOptions={preferences.visualOptions}
            onHideShortcuts={() => updatePreference("showShortcuts", false)}
            onShowShortcuts={() => updatePreference("showShortcuts", true)}
            onOpenPersonalize={() => setShowPersonalize(true)}
            onOpenMoments={() => setShowMoments(true)}
            onOpenPausePlus={() => openPaywall({ source: "menu" })}
            lockedCategories={lockedCategories}
            onLockedCategoryTap={(category) =>
              openPaywall({
                source: "technique_category",
                featureId: category,
                featureCategory: "technique",
              })
            }
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
            isPro={hasFullAccess}
            onRequestUpgrade={requestUpgrade}
          />
        )}
      </AnimatePresence>

      {/* Paywall overlay */}
      <AnimatePresence>
        {paywall && (
          <PaywallScreen
            key="paywall"
            theme={theme}
            source={paywall.source}
            introductory={paywall.introductory}
            onClose={closePaywall}
            onPurchase={handlePaywallPurchase}
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