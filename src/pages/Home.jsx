import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SoftBlob from "../components/SoftBlob";
import MainScreen from "../components/MainScreen";
import BreathingScreen from "../components/BreathingScreen";
import SupportScreen from "../components/SupportScreen";
import PaywallScreen from "../components/PaywallScreen";
import { loadTechniques, getRandomTechnique } from "../lib/techniqueLoader";
import { initRevenueCat, checkEntitlement } from "../lib/revenuecat";

export default function Home() {
  const [mode, setMode] = useState("idle");
  const [technique, setTechnique] = useState(null);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const [showSupport, setShowSupport] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingTechnique, setPendingTechnique] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [theme, setTheme] = useState("day");
  const [techniques, setTechniques] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const saved = localStorage.getItem("pauseTheme") || "day";
    setTheme(saved);
  }, []);

  useEffect(() => {
    initRevenueCat()
      .then(() => checkEntitlement())
      .then(pro => setIsPro(pro))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadTechniques()
      .then((loaded) => {
        setTechniques(loaded);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);



  const LOCKED_CATEGORIES = ["Focus", "Energy", "Advanced"];

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



  const bgColor = theme === "day" ? "#F7F5F2" : "#0D1B2A";

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ background: bgColor }}
    >

      {/* Main content */}
      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <MainScreen
            key="main"
            onTap={startBreathing}
            onSupportClick={() => setShowSupport(true)}
            theme={theme}
            onToggleTheme={() => {
              const newTheme = theme === "day" ? "night" : "day";
              setTheme(newTheme);
              localStorage.setItem("pauseTheme", newTheme);
            }}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onHapticsChange={() => setHapticsEnabled(!hapticsEnabled)}
            isPro={isPro}
            onTechniqueSelect={(t) => startBreathing(t)}
          />
        )}
        {mode === "breathing" && technique && (
          <BreathingScreen
            key="breathing"
            technique={technique}
            onDone={stopBreathing}
            theme={theme}
            hapticsEnabled={hapticsEnabled}
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

      {/* Support overlay */}
      <AnimatePresence>
        {showSupport && (
          <SupportScreen key="support" onClose={() => setShowSupport(false)} theme={theme} />
        )}
      </AnimatePresence>
    </div>
  );
}