import { useState, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import LiquidOrb from "./LiquidOrb";
import NavigationSheet from "./NavigationSheet";
import MomentShortcuts from "./MomentShortcuts";
import { FONT, getBackgroundStyle, getColors } from "../lib/design";

const ORB_MAX = 300;

export default function MainScreen({
  onTap,
  theme = "day",
  onOpenAbout,
  selectedCategory = "All",
  onCategoryChange,
  isPro = false,
  onLockedCategoryTap,
  onOpenPersonalize,
  onOpenMoments,
  onOpenPausePlus,
  showShortcuts = true,
  onSelectMoment,
  shortcutNotice = "",
  background = "classic",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  // The orb stays dominant: it scales with the viewport, and shrinks further
  // when the moment shortcuts share the screen.
  const measureOrb = useCallback(() => {
    if (typeof window === "undefined") return ORB_MAX;
    const heightShare = showShortcuts ? 0.3 : 0.42;
    return Math.round(
      Math.min(ORB_MAX, window.innerWidth * 0.62, window.innerHeight * heightShare)
    );
  }, [showShortcuts]);

  const [orbSize, setOrbSize] = useState(measureOrb);

  useEffect(() => {
    const handleResize = () => setOrbSize(measureOrb());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureOrb]);

  const colors = getColors(theme);
  const categoryLabel = selectedCategory === "All" ? "all breaths" : selectedCategory.toLowerCase();

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        ...getBackgroundStyle(background, theme),
        paddingTop: "calc(env(safe-area-inset-top, 44px) + 6px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 18px)",
        transition: "background 0.4s ease",
      }}
    >
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
            fontFamily: FONT,
            fontSize: "21px",
            fontWeight: 800,
            letterSpacing: "0.01em",
            color: colors.text,
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
            color: colors.text,
            opacity: 0.75,
          }}
        >
          <Menu size={23} strokeWidth={2.2} />
        </button>
      </div>

      {/* Brand heading */}
      <div style={{ margin: "14px 32px 0", textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontFamily: FONT,
            fontSize: "23px",
            fontWeight: 800,
            letterSpacing: "-0.01em",
            color: colors.text,
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
            fontWeight: 500,
            letterSpacing: "0.005em",
            color: colors.secondary,
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
          <LiquidOrb theme={theme} isBreathing={false} size={orbSize} />
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
            fontSize: "17px",
            fontWeight: 700,
            letterSpacing: "0.01em",
            color: colors.text,
          }}
        >
          Tap to pause
        </button>
      </div>

      {showShortcuts && (
        <MomentShortcuts theme={theme} onSelect={onSelectMoment} notice={shortcutNotice} />
      )}

      <p
        style={{
          margin: showShortcuts ? "10px 0 0" : 0,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: "13.5px",
          fontWeight: 600,
          color: colors.tertiary,
          padding: "0 32px",
        }}
      >
        {categoryLabel} · about a minute
      </p>

      <AnimatePresence>
        {menuOpen && (
          <NavigationSheet
            key="nav"
            theme={theme}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            isPro={isPro}
            onLockedCategoryTap={onLockedCategoryTap}
            onOpenPersonalize={onOpenPersonalize}
            onOpenMoments={onOpenMoments}
            onOpenPausePlus={onOpenPausePlus}
            onOpenAbout={onOpenAbout}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}