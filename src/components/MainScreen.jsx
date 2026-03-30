import { Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiquidOrb from "./LiquidOrb";

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme }) {
  const navigate = useNavigate();
  const isDayTheme = theme === "day";
  const bgColor = isDayTheme ? "#F7F5F2" : "#0D1B2A";
  const textColor = isDayTheme ? "#2C2C2C" : "#E8E0D0";
  const secondaryColor = isDayTheme ? "#888888" : "#A0A0A0";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: bgColor,
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
          top: "90px",
          left: 0,
          right: 0,
          width: "100%",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: "13px",
            letterSpacing: "5px",
            fontWeight: 300,
            color: textColor,
            opacity: 0.7,
            fontFamily: "'Cormorant Garamond', serif",
            margin: 0,
          }}
        >
          ALWAYS PAUSE
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
          opacity: 0.4,
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
          <Moon className="w-[22px] h-[22px]" style={{ color: secondaryColor }} />
        ) : (
          <Sun className="w-[22px] h-[22px]" style={{ color: secondaryColor }} />
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
          gap: "24px",
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
          <LiquidOrb theme={theme} countdown={null} orbScale={1} />
        </button>
        <button
          onClick={onTap}
          style={{
            fontSize: "11px",
            letterSpacing: "1.5px",
            color: textColor,
            opacity: 0.45,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "center",
            margin: 0,
            padding: 0,
          }}
        >
          tap to pause
        </button>
      </div>

      {/* Support and footer links - bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
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
          onClick={onSupportClick}
          style={{
            fontSize: "10px",
            color: textColor,
            opacity: 0.2,
            fontFamily: "'Cormorant Garamond', serif",
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
            opacity: 0.25,
            fontFamily: "'Cormorant Garamond', serif",
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
            onMouseEnter={(e) => (e.target.style.opacity = "0.5")}
            onMouseLeave={(e) => (e.target.style.opacity = "0.25")}
          >
            Privacy
          </button>
          <span>|</span>
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
            onMouseEnter={(e) => (e.target.style.opacity = "0.5")}
            onMouseLeave={(e) => (e.target.style.opacity = "0.25")}
          >
            Terms
          </button>
        </div>
      </div>
    </div>
  );
}