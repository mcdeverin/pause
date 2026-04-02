import { Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiquidOrb from "./LiquidOrb";

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme }) {
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
        <button
          onClick={() => window.open('https://buymeacoffee.com/pause', '_blank')}
          style={{
            fontSize: "10px",
            color: textColor,
            fontFamily: "'Comfortaa', sans-serif",
            fontWeight: 300,
            background: "none",
            border: "none",
            cursor: "pointer",
            margin: 0,
            padding: 0,
          }}
        >
          ♡ support this app
        </button>
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