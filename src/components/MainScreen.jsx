import { Sun, Moon } from "lucide-react";

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme }) {
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
            opacity: 0.55,
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
        {/* Orb */}
        <button
          onClick={onTap}
          style={{
            position: "relative",
            width: "180px",
            height: "180px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          aria-label="Start breathing"
        >
          {/* Outer circle */}
          <div
            style={{
              position: "absolute",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: isDayTheme ? "#8FAF8F" : "#7B6BA8",
              opacity: 0.2,
              top: 0,
              left: 0,
            }}
          />
          {/* Middle circle */}
          <div
            style={{
              position: "absolute",
              width: "130px",
              height: "130px",
              borderRadius: "50%",
              background: isDayTheme ? "#6B8F71" : "#7B6BA8",
              opacity: 0.3,
              top: "25px",
              left: "25px",
            }}
          />
          {/* Inner circle */}
          <div
            style={{
              position: "absolute",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: isDayTheme ? "#5B8DB8" : "#7B6BA8",
              opacity: 0.65,
              top: "50px",
              left: "50px",
            }}
          />
          {/* Center dot */}
          <div
            style={{
              position: "absolute",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: isDayTheme ? "#3A6B9A" : "#E8E0D0",
              top: "80px",
              left: "80px",
            }}
          />
        </button>

        {/* Tap to pause text */}
        <button
          onClick={onTap}
          style={{
            fontSize: "11px",
            letterSpacing: "2px",
            color: textColor,
            opacity: 0.35,
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

      {/* Support link - bottom center */}
      <button
        onClick={onSupportClick}
        style={{
          position: "absolute",
          bottom: "36px",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
          fontSize: "10px",
          color: textColor,
          opacity: 0.25,
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
    </div>
  );
}