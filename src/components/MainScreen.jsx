import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import LiquidOrb from "./LiquidOrb";
import NavigationSheet from "./NavigationSheet";
import { FONT, getBackgroundStyle, getColors } from "../lib/design";

const ORB_MAX = 300;

export default function MainScreen({
  onTap,
  theme = "day",
  onToggleTheme,
  selectedCategory = "All",
  onCategoryChange,
  isPro = false,
  onLockedCategoryTap,
  onOpenPersonalize,
  onOpenPausePlus,
  background = "classic",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orbSize, setOrbSize] = useState(() =>
    Math.min(ORB_MAX, Math.round((typeof window !== "undefined" ? window.innerWidth : 390) * 0.72))
  );

  useEffect(() => {
    const handleResize = () => setOrbSize(Math.min(ORB_MAX, Math.round(window.innerWidth * 0.72)));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "0.16em",
            color: colors.text,
            lineHeight: 1,
          }}
        >
          PAUSE
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

      {/* Selected category */}
      <p
        style={{
          margin: "10px 0 0",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: colors.secondary,
        }}
      >
        {categoryLabel}
      </p>

      {/* Orb + invitation */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
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
          tap to breathe
        </button>
      </div>

      <p
        style={{
          margin: 0,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: "14px",
          fontWeight: 500,
          color: colors.tertiary,
          padding: "0 32px",
        }}
      >
        four guided breaths, about a minute
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
            onToggleTheme={onToggleTheme}
            onOpenPersonalize={onOpenPersonalize}
            onOpenPausePlus={onOpenPausePlus}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}