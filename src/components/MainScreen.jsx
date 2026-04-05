import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiquidOrb from "./LiquidOrb";

const CATEGORIES = ["All", "Calm", "Sleep", "Focus", "Energy", "Advanced"];

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme, selectedCategory = "All", onCategoryChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Menu - top left */}
      <div style={{ position: "absolute", top: "16px", left: "24px", zIndex: 20 }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Comfortaa', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.2em",
            color: isDayTheme ? "#333" : "rgba(255,255,255,0.6)",
            fontWeight: 300,
            padding: 0,
            opacity: 0.7,
          }}
        >
          menu
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
                left: 0,
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
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { onCategoryChange(cat); setMenuOpen(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 18px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Comfortaa', sans-serif",
                    fontSize: "12px",
                    letterSpacing: "0.1em",
                    fontWeight: selectedCategory === cat ? 600 : 300,
                    color: selectedCategory === cat
                      ? isDayTheme ? "#1C3A5E" : "#FFFFFF"
                      : isDayTheme ? "#444" : "rgba(255,255,255,0.65)",
                  }}
                >
                  {cat}
                </button>
              ))}
              {/* Separator */}
              <div style={{
                margin: "6px 14px",
                height: "1px",
                background: isDayTheme ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)",
              }} />
              {[{ label: "Privacy", path: "/privacy" }, { label: "Terms", path: "/terms" }].map(({ label, path }) => (
                <button
                  key={label}
                  onClick={() => { setMenuOpen(false); navigate(path); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 18px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Comfortaa', sans-serif",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    fontWeight: 300,
                    color: isDayTheme ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* App name - top center */}
      <div
        style={{
          position: "absolute",
          top: "100px",
          left: 0,
          right: 0,
          width: "100%",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.5em",
            fontWeight: 600,
            color: textColor,
            fontFamily: "'Comfortaa', sans-serif",
            margin: 0,
          }}
        >
          PAUSE
        </p>
      </div>

      {/* Theme toggle - top right */}
      <button
        onClick={onToggleTheme}
        style={{
          position: "absolute",
          top: "16px",
          right: "24px",
          background: "none",
          border: "none",
          cursor: "pointer",
          opacity: 0.5,
          zIndex: 20,
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "32px",
          height: "32px",
        }}
        aria-label="Toggle theme"
      >
        {isDayTheme ? (
          <Moon className="w-[22px] h-[22px]" style={{ color: "#1C1C1C" }} />
        ) : (
          <Sun className="w-[22px] h-[22px]" style={{ color: "#FFFFFF" }} />
        )}
      </button>

      {/* Center section - orb + tap text */}
      <div
        style={{
          position: "absolute",
          top: "54%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "64px",
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
            fontSize: "12px",
            letterSpacing: "0.12em",
            color: isDayTheme ? "#333333" : "#F0EDE8",
            fontFamily: "'Comfortaa', sans-serif",
            fontWeight: 300,
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