import { useState, useEffect } from "react";
import { Sun, Moon, Vibrate, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiquidOrb from "./LiquidOrb";

const CATEGORIES = ["All", "Calm", "Sleep", "Focus", "Energy", "Advanced"];
const LOCKED_CATEGORIES = ["Focus", "Energy", "Advanced"];

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme, selectedCategory = "All", onCategoryChange, onHapticsChange, isPro = false, onTechniqueSelect, onLockedCategoryTap }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const navigate = useNavigate();

  const handleHapticsToggle = () => {
    setHapticsEnabled(v => !v);
    if (onHapticsChange) onHapticsChange();
  };
  const isDayTheme = theme === "day";
  const textColor = isDayTheme ? "#111111" : "#F0EDE8";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: theme === "day" ? "#FAFAF8" : "#0D1117",
        paddingTop: "env(safe-area-inset-top, 44px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Menu - top left */}
      <div style={{ position: "absolute", top: "7.5vh", right: "24px", zIndex: 20 }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            opacity: 0.45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
          }}
          aria-label="Menu"
        >
          <svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="18" height="1.5" rx="0.75" fill={isDayTheme ? "#1C1C1C" : "#FFFFFF"} />
            <rect y="5.75" width="18" height="1.5" rx="0.75" fill={isDayTheme ? "#1C1C1C" : "#FFFFFF"} />
            <rect y="11.5" width="18" height="1.5" rx="0.75" fill={isDayTheme ? "#1C1C1C" : "#FFFFFF"} />
          </svg>
        </button>
        {menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 19 }}
            />
            <div
              style={{
                position: "absolute",
                top: "28px",
                right: 0,
                background: isDayTheme ? "rgba(255,255,255,0.7)" : "rgba(20,30,50,0.75)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${isDayTheme ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.15)"}`,
                borderRadius: "14px",
                padding: "8px 0",
                minWidth: "130px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                zIndex: 20,
              }}
            >
              {CATEGORIES.map((cat) => {
                const isLocked = !isPro && LOCKED_CATEGORIES.includes(cat);
                const isSelected = selectedCategory === cat;
                const accentColor = isDayTheme ? "#4A7FA6" : "#6BA888";
                const baseColor = isDayTheme ? "#333" : "rgba(255,255,255,0.85)";
                const lockedColor = isDayTheme ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)";
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      if (isLocked) {
                        setMenuOpen(false);
                        if (onLockedCategoryTap) onLockedCategoryTap(cat);
                        return;
                      }
                      onCategoryChange(cat);
                      setMenuOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "9px 18px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px",
                      letterSpacing: "0.005em",
                      fontWeight: isSelected ? 600 : 400,
                      color: isLocked ? lockedColor : baseColor,
                    }}
                  >
                    {/* fixed-width dot gutter so text never shifts */}
                    <span style={{ display: "flex", alignItems: "center", gap: "0px", letterSpacing: "0" }}>
                      <span style={{
                        display: "inline-block",
                        width: "12px",
                        textAlign: "left",
                        color: accentColor,
                        opacity: isSelected ? 1 : 0,
                        fontSize: "14px",
                        lineHeight: 1,
                        transition: "opacity 0.2s",
                      }}>·</span>
                      <span>{cat}</span>
                    </span>
                    {isLocked && <Lock size={10} style={{ flexShrink: 0, marginLeft: "6px", opacity: 0.5 }} />}
                  </button>
                );
              })}
              {/* Separator */}
              <div style={{
                margin: "6px 14px",
                height: "1px",
                background: isDayTheme ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)",
              }} />
              {/* Haptics Toggle */}
              <div
                onClick={handleHapticsToggle}
                style={{
                  display: "none",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 18px",
                  cursor: "pointer",
                }}
              >
                <Vibrate size={14} color={isDayTheme ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)"} />
                {/* Toggle pill */}
                <div style={{
                  width: "32px",
                  height: "18px",
                  borderRadius: "9px",
                  background: hapticsEnabled ? "#4A7FA6" : "rgba(0,0,0,0.15)",
                  position: "relative",
                  transition: "background 0.25s",
                  flexShrink: 0,
                  marginLeft: "12px",
                }}>
                  <div style={{
                    position: "absolute",
                    top: "3px",
                    left: hapticsEnabled ? "17px" : "3px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.25s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </div>
              </div>
              {/* Theme Toggle */}
              <div
                onClick={onToggleTheme}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 18px",
                  cursor: "pointer",
                }}
              >
                {isDayTheme
                  ? <Sun size={14} color="rgba(0,0,0,0.4)" />
                  : <Moon size={14} color="rgba(255,255,255,0.35)" />}
                {/* Toggle pill */}
                <div style={{
                  width: "32px",
                  height: "18px",
                  borderRadius: "9px",
                  background: !isDayTheme ? "#4A7FA6" : "rgba(0,0,0,0.15)",
                  position: "relative",
                  transition: "background 0.25s",
                  flexShrink: 0,
                  marginLeft: "12px",
                }}>
                  <div style={{
                    position: "absolute",
                    top: "3px",
                    left: !isDayTheme ? "17px" : "3px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.25s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </div>
              </div>
              {[
                { label: "Privacy", url: "https://alwayspause.com/privacy" },
                { label: "Terms", url: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" }
              ].map(({ label, url }) => (
                <button
                  key={label}
                  onClick={() => { setMenuOpen(false); window.open(url, "_blank"); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 18px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "12px",
                    letterSpacing: "0.005em",
                    fontWeight: 400,
                    color: isDayTheme ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {label}
                </button>
              ))}
              {/* Separator */}
              <div style={{
                margin: "6px 14px",
                height: "1px",
                background: isDayTheme ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)",
              }} />
              {/* Pause+ row */}
              <button
                onClick={() => { setMenuOpen(false); if (onLockedCategoryTap) onLockedCategoryTap(); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "7px 18px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  fontWeight: isPro ? 300 : 400,
                  color: isPro
                    ? (isDayTheme ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)")
                    : (isDayTheme ? "#4A7FA6" : "#6BA888"),
                }}
              >
                {isPro ? "· pause+ · manage" : "unlock pause+"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* App name - top center */}
      <div
        style={{
          position: "absolute",
          top: "18vh",
          left: 0,
          right: 0,
          width: "100%",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.22em",
            fontWeight: 600,
            color: textColor,
            fontFamily: "'DM Sans', sans-serif",
            margin: 0,
          }}
        >
          PAUSE
        </p>
      </div>


      {/* Center section - orb + tap text */}
      <div
        style={{
          position: "absolute",
          top: "54vh",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5vh",
          zIndex: 5,
        }}
      >
        {/* Liquid Orb Button */}
        <button
          onClick={onTap}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Start breathing"
        >
          <LiquidOrb theme={theme} isBreathing={false} size={270} />
        </button>

        {/* Tap to breathe */}
        <button
          onClick={onTap}
          style={{
            fontSize: "13px",
            letterSpacing: "0.015em",
            color: isDayTheme ? "#333333" : "#F0EDE8",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "center",
            margin: 0,
            padding: 0,
          }}
        >
          tap to breathe
        </button>
      </div>

    </div>
  );
}