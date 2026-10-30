import { useState, useCallback, useEffect } from "react";
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

const LOCKED_CATEGORIES = ["Focus", "Energy", "Advanced"];

export default function Home() {
  const [mode, setMode] = useState("idle");
  const [technique, setTechnique] = useState(null);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const [showSupport, setShowSupport] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [pendingTechnique, setPendingTechnique] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [theme, setTheme] = useState("day");
  const [techniques, setTechniques] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [preferences, setPreferences] = useState(loadPreferences);

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

  const startBreathing = useCallback((forcedTechnique = null) => {
    if (techniques.length === 0) return;
    const filtered = selectedCategory === "All"
      ? (isPro ? techniques : techniques.filter(t => !LOCKED_CATEGORIES.includes(t.category)))
      : techniques.filter(t => t.category === selectedCategory);
    const pool = filtered.length > 0 ? filtered : techniques;
    const t = forcedTechnique || getRandomTechnique(pool);

    if (!isPro && LOCKED_CATEGORIES.includes(t.category)) {
      setPendingTechnique(t);
      setShowPaywall(true);
      return;
    }

    setTechnique(t);
    setMode("breathing");
  }, [techniques, selectedCategory, isPro]);

  const stopBreathing = useCallback(() => {
    setMode("idle");
    setTechnique(null);
  }, []);

  const openPaywall = useCallback(() => {
    setPendingTechnique(null);
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
            onOpenPausePlus={openPaywall}
            onLockedCategoryTap={openPaywall}
          />
        )}
        {mode === "breathing" && technique && (
          <BreathingScreen
            key="breathing"
            technique={technique}
            onDone={stopBreathing}
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
            onClose={() => { setShowPaywall(false); setPendingTechnique(null); }}
            onPurchase={() => {
              setIsPro(true);
              setShowPaywall(false);
              if (pendingTechnique) {
                setTechnique(pendingTechnique);
                setMode("breathing");
                setPendingTechnique(null);
              }
            }}
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