import { Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiquidOrb from "./LiquidOrb";

const CATEGORIES = ["All", "Calm", "Sleep", "Focus", "Energy", "Advanced"];

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme, selectedCategory = "All", onCategoryChange }) {
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
          gap: "72px",
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
        {/* Category filter strip */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            padding: "4px 0",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            maxWidth: "320px",
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                style={{
                  flexShrink: 0,
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: `1px solid ${isDayTheme ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"}`,
                  background: isSelected
                    ? isDayTheme ? "rgba(50,80,120,0.18)" : "rgba(255,255,255,0.15)"
                    : isDayTheme ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  boxShadow: isSelected ? "0 2px 12px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.05)",
                  color: isSelected
                    ? isDayTheme ? "#1C3A5E" : "#FFFFFF"
                    : isDayTheme ? "#555555" : "rgba(255,255,255,0.55)",
                  fontFamily: "'Comfortaa', sans-serif",
                  fontSize: "10px",
                  fontWeight: isSelected ? 600 : 300,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "all 300ms ease",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button
          onClick={onTap}
          style={{
            fontSize: "12px",
            letterSpacing: "0.12em",
            color: isDayTheme ? "#333333" : "#F0EDE8",
            opacity: 1,
            fontFamily: "'Comfortaa', sans-serif",
            fontStyle: "normal",
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