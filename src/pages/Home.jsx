import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AdaptiveHome from "../components/AdaptiveHome";
import MomentChooser from "../components/MomentChooser";
import TechniqueBrowser from "../components/TechniqueBrowser";
import BreathingScreen from "../components/BreathingScreen";
import SupportScreen from "../components/SupportScreen";
import PaywallScreen from "../components/PaywallScreen";
import PersonalizePanel from "../components/personalize/PersonalizePanel";
import AboutLegalSheet from "../components/AboutLegalSheet";
import { loadTechniques, getRandomTechnique } from "../lib/techniqueLoader";
import { initRevenueCat, checkEntitlement, addEntitlementListener } from "../lib/revenuecat";
import { loadPreferences, savePreferences } from "../lib/preferences";
import { addStoredPhoto, getStoredPhotos, removeStoredPhoto } from "../lib/backgroundPhoto";
import { resolveBackgroundImage } from "../lib/backgroundImage";
import BackgroundLayer from "../components/BackgroundLayer";
import { MOMENTS, addMoment } from "../lib/moments";
import MomentsScreen from "../components/moments/MomentsScreen";
import { track } from "../lib/analytics";
import { describeSavedBackground, describeVisual } from "../lib/analyticsProps";
import { isFreeTechnique } from "../lib/access";
import { loadNarrationManifest } from "../lib/narration";
import { getTimeCanvas } from "../lib/design";
import { personalizeMoment } from "../lib/onboardingProfile";

// Records whose phase string can't be read are never offered.
const hasUsablePhases = (technique) => {
  const parsed = String(technique?.phases || "").split(",").map(Number);
  return parsed.length > 0 && !parsed.some(isNaN);
};

// The chooser opens on the same moment the home button suggests.
function getSuggestedMoment(){const time=getTimeCanvas();return personalizeMoment(time.key,time.moment);}
export default function Home() {
  useEffect(() => { void loadNarrationManifest(); }, []);
  const [mode, setMode] = useState("idle");
  const [sessionVoice, setSessionVoice] = useState("none");
  const [browseMoment, setBrowseMoment] = useState(null);
  const [browseTechniques, setBrowseTechniques] = useState([]);
  const [technique, setTechnique] = useState(null);
  const [hapticsEnabled] = useState(true);
  // A technique chosen from the browser that needs Always Pause+; it starts
  // straight after a successful purchase.
  const [pendingTechnique, setPendingTechnique] = useState(null);

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
  const [preferences, setPreferences] = useState(loadPreferences);
  const [photos, setPhotos] = useState(getStoredPhotos);

  // Light / Dark restyles the interface only — the background keeps its own canvas.
  const theme = (new Date().getHours() >= 21 || new Date().getHours() < 5) ? "night" : "day";

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
    let cancelled = false;
    let removeListener;
    (async () => {
      try {
        await initRevenueCat();
      } catch {
        return; // Web preview or RevenueCat unavailable: stay on the free tier.
      }
      const pro = await checkEntitlement();
      if (!cancelled) setIsPro(pro);
      try {
        removeListener = await addEntitlementListener((nextPro) => {
          if (!cancelled) setIsPro(nextPro);
        });
      } catch {
        // Listener unavailable: the launch check above still applies.
      }
    })();
    return () => {
      cancelled = true;
      removeListener?.();
    };
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

  // One way into a session for both the home button and the chooser. Free users
  // get the free techniques for that moment; if a moment has none, a free
  // starter plays instead, so the button never does nothing.
  const startForMoment = useCallback(async (momentId, guided) => {
    const available = await ensureTechniques();
    const moment = MOMENTS.find((m) => m.id === momentId);
    const usable = available.filter(hasUsablePhases);
    const inMoment = usable.filter((t) => moment?.categories.includes(t.category));
    const allowed = hasFullAccess ? inMoment : inMoment.filter(isFreeTechnique);
    const pool = allowed.length
      ? allowed
      : hasFullAccess ? usable : usable.filter(isFreeTechnique);
    if (!pool.length) {
      flashNotice("Your exercises could not load. Close the app and try again.");
      return;
    }
    setSessionVoice(guided ? "full" : "none");
    beginSession(getRandomTechnique(pool), momentId);
  }, [ensureTechniques, hasFullAccess, beginSession, flashNotice]);

  // The full list, with Always Pause+ techniques visible but marked.
  const openBrowser = useCallback(async (guided) => {
    const available = await ensureTechniques();
    setSessionVoice(guided ? "full" : "none");
    setBrowseMoment("explore_all");
    setBrowseTechniques(available.filter(hasUsablePhases));
    setMode("browse");
  }, [ensureTechniques]);

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
    setPendingTechnique(null);
  }, []);

  const requestTechnique = useCallback((chosen) => {
    setPendingTechnique(chosen);
    openPaywall({ source: "technique", featureId: chosen.id, featureCategory: "technique" });
  }, [openPaywall]);

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
    // Start the technique they picked before the offer appeared.
    if (context?.featureCategory === "technique" && pendingTechnique) {
      const chosen = pendingTechnique;
      setPendingTechnique(null);
      beginSession(chosen, null);
    }
  }, [paywall, pendingDraft, pendingTechnique, commitPreferences, beginSession]);

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
          <AdaptiveHome key="main" onStart={(momentId) => startForMoment(momentId, preferences.voiceGuide)} onExplore={() => setMode("choose")}
            onPersonalize={() => setShowPersonalize(true)} onMoments={() => setShowMoments(true)} onAbout={() => setShowAbout(true)} onPlus={() => openPaywall({source:"menu"})} />
        )}
        {mode === "choose" && <MomentChooser key="choose" initialMoment={getSuggestedMoment()} initialGuided={preferences.voiceGuide}
          onBack={() => setMode("idle")}
          onBegin={(momentId, guided) => startForMoment(momentId, guided)}
          onBrowse={(guided) => openBrowser(guided)} />}
        {mode === "browse" && (
          <TechniqueBrowser key="technique-browser" techniques={browseTechniques} momentId={browseMoment}
            theme={theme} backgroundSettings={preferences} photo={photo}
            isLocked={(t) => !hasFullAccess && !isFreeTechnique(t)}
            onLocked={requestTechnique}
            onBack={() => setMode("choose")}
            onChoose={(chosen) => beginSession(chosen, null)} />
        )}
        {mode === "breathing" && technique && (
          <BreathingScreen
            key="breathing"
            technique={technique}
            momentId={sessionMomentRef.current || "calm"}
            onDone={finishSession}
            theme={theme}
            hapticsEnabled={hapticsEnabled}
            visual={preferences.visual}
            visualOptions={preferences.visualOptions}
            backgroundSettings={preferences}
            photo={photo}
            showTimer={preferences.showTimer}
            showInstructions={preferences.showInstructions}
            voiceGuide={sessionVoice !== "none"}
            narrationMode={sessionVoice}
          />
        )}
      </AnimatePresence>

      {/* Short notices (for example, when the library could not load). */}
      {shortcutNotice && (
        <div role="status" style={{ position: "fixed", left: 16, right: 16, bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)", zIndex: 60, margin: "0 auto", maxWidth: 420, padding: "12px 16px", borderRadius: 16, background: "rgba(20,26,24,.88)", color: "#fff", fontSize: 14, lineHeight: 1.4, textAlign: "center" }}>
          {shortcutNotice}
        </div>
      )}

      {/* Personalize: retain all existing controls, previews and save/upgrade flows. */}
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