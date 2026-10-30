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
import { getBackgroundStyle } from "../lib/design";
import { MOMENTS, addMoment } from "../lib/moments";
import MomentsScreen from "../components/moments/MomentsScreen";

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
  const [theme, setTheme] = useState("day");
  const [techniques, setTechniques] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [preferences, setPreferences] = useState(loadPreferences);
  const sessionMomentRef = useRef(null);
  const noticeTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(noticeTimerRef.current), []);

  const flashNotice = useCallback((message) => {
    setShortcutNotice(message);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setShortcutNotice(""), 4200);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("pauseTheme") || "day";
    setTheme(saved);
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

  const updatePreference = useCallback((key, value) => {
    setPreferences((previous) => {
      const next = { ...previous, [key]: value };
      savePreferences(next);
      return next;
    });
  }, []);

  const applyTheme = useCallback((nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem("pauseTheme", nextTheme);
  }, []);

  const beginSession = useCallback((chosenTechnique, moment) => {
    sessionMomentRef.current = moment || null;
    setTechnique(chosenTechnique);
    setMode("breathing");
  }, []);

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

    sessionMomentRef.current = null;
    setMode("idle");
    setTechnique(null);
  }, [technique, preferences.saveMoments]);

  const openPaywall = useCallback(() => {
    setPendingTechnique(null);
    setPendingMoment(null);
    setShowPaywall(true);
  }, []);

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ ...getBackgroundStyle(preferences.background, theme), transition: "background 0.4s ease" }}
    >
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
            background={preferences.background}
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
            background={preferences.background}
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
            onChange={updatePreference}
            onThemeChange={applyTheme}
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
            background={preferences.background}
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