import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiquidOrb from "./LiquidOrb";

const CATEGORIES = ["All", "Calm", "Sleep", "Focus", "Energy", "Advanced"];

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme, selectedCategory = "All", onCategoryChange, previewTechnique }) {
  const [showInfo, setShowInfo] = useState(false);
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
            </div>
          </>
        )}
      </div>

      {/* App name - top center */}
      <div
        style={{
          position: "absolute",
          top: "80px",
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
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "48px",
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

        {/* Technique name + info */}
        {previewTechnique && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <p style={{
              fontSize: "11px",
              letterSpacing: "0.2em",
              color: isDayTheme ? "#555" : "rgba(255,255,255,0.55)",
              fontFamily: "'Comfortaa', sans-serif",
              fontWeight: 300,
              margin: 0,
              textTransform: "lowercase",
            }}>
              {previewTechnique.name}
            </p>
            <button
              onClick={() => setShowInfo(true)}
              style={{
                background: isDayTheme ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)",
                border: `1px solid ${isDayTheme ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)"}`,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                fontSize: "10px",
                color: isDayTheme ? "#3A6B9A" : "rgba(255,255,255,0.6)",
                fontFamily: "serif",
                lineHeight: 1,
                flexShrink: 0,
              }}
              aria-label="Info"
            >
              i
            </button>
          </div>
        )}

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

      {/* Info popup */}
      {showInfo && previewTechnique && (
        <div
          onClick={() => setShowInfo(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDayTheme ? "rgba(255,255,255,0.65)" : "rgba(20,30,50,0.65)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${isDayTheme ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.15)"}`,
              borderRadius: "20px",
              padding: "28px 28px",
              maxWidth: "300px",
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <p style={{
              fontSize: "11px",
              letterSpacing: "0.25em",
              color: isDayTheme ? "#3A6B9A" : "rgba(255,255,255,0.5)",
              fontFamily: "'Comfortaa', sans-serif",
              fontWeight: 600,
              margin: "0 0 12px 0",
              textTransform: "uppercase",
            }}>
              {previewTechnique.name}
            </p>
            <p style={{
              fontSize: "13px",
              color: isDayTheme ? "#333333" : "rgba(255,255,255,0.8)",
              fontFamily: "'Comfortaa', sans-serif",
              fontWeight: 300,
              lineHeight: 1.8,
              margin: 0,
              fontStyle: "italic",
            }}>
              {previewTechnique.science}
            </p>
          </div>
        </div>
      )}

      {/* Support and footer links - bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: textColor,
            fontFamily: "'Comfortaa', sans-serif",
            fontWeight: 300,
            display: "flex",
            gap: "8px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => navigate("/privacy")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: "inherit",
              padding: 0,
              margin: 0,
              transition: "opacity 300ms",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = isDayTheme ? "0.4" : "0.5")}
            onMouseLeave={(e) => (e.target.style.opacity = isDayTheme ? "0.15" : "0.2")}
          >
            Privacy
          </button>
          <span>·</span>
          <button
            onClick={() => navigate("/terms")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: "inherit",
              padding: 0,
              margin: 0,
              transition: "opacity 300ms",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = isDayTheme ? "0.4" : "0.5")}
            onMouseLeave={(e) => (e.target.style.opacity = isDayTheme ? "0.15" : "0.2")}
          >
            Terms
          </button>
        </div>
      </div>
    </div>
  );
}