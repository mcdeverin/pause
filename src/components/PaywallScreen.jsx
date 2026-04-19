import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import LiquidOrb from "./LiquidOrb";

export default function PaywallScreen({ theme = "day", onClose, onPurchase, triggerCategory }) {
  const [selected, setSelected] = useState("com.workondeck.alwayspause.annual");

  const isDayTheme = theme === "day";
  const textColor = isDayTheme ? "#111111" : "#F0EDE8";
  const bg = isDayTheme ? "#FAFAF8" : "#0D1117";
  const glassBackground = isDayTheme ? "rgba(255,255,255,0.55)" : "rgba(20,30,50,0.7)";
  const glassBorder = isDayTheme ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)";
  const primaryColor = isDayTheme ? "#4A7FA6" : "#4A5B9C";
  const primaryTint = isDayTheme ? "rgba(74,127,166,0.07)" : "rgba(74,91,156,0.12)";
  const primaryBorder = primaryColor;

  const handlePurchase = () => {
    if (onPurchase) onPurchase(selected);
  };

  const PricePill = ({ id, label, sublabel }) => {
    const isSelected = selected === id;
    const isBestValue = id === "com.workondeck.alwayspause.annual";
    return (
      <button
        onClick={() => setSelected(id)}
        style={{
          background: isSelected ? primaryTint : glassBackground,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${isSelected ? primaryBorder : glassBorder}`,
          borderRadius: "50px",
          padding: "13px 24px",
          cursor: "pointer",
          fontFamily: "'Comfortaa', sans-serif",
          fontSize: "12px",
          fontWeight: 300,
          letterSpacing: "0.15em",
          color: textColor,
          opacity: isSelected ? 1 : 0.55,
          transition: "all 0.25s ease",
          textAlign: "center",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
        }}
      >
        <span>{label}</span>
        {sublabel && (
          <span style={{ fontSize: "10px", opacity: 0.6, letterSpacing: "0.1em" }}>{sublabel}</span>
        )}
      </button>
    );
  };

  return (
    <>
    <style>{`
      .paywall-scroll::-webkit-scrollbar { display: none; }
    `}</style>
    <motion.div
      className="paywall-scroll"
      style={{
        position: "fixed",
        inset: 0,
        background: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        zIndex: 50,
        paddingTop: "env(safe-area-inset-top, 44px)",
        paddingBottom: "env(safe-area-inset-bottom, 40px)",
        overflowY: "scroll",
        overflowX: "hidden",
        boxSizing: "border-box",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 44px) + 12px)",
          right: "20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          opacity: 0.3,
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.3")}
      >
        <X size={16} color={textColor} />
      </button>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0px",
          width: "100%",
          maxWidth: "320px",
          padding: "0 28px",
          boxSizing: "border-box",
          minHeight: "100%",
          justifyContent: "center",
        }}
      >
        {/* Orb */}
        <div style={{ marginBottom: "20px", marginTop: "40px" }}>
          <LiquidOrb theme={theme} isBreathing={false} size={120} />
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: "6px" }}>
          <p
            style={{
              fontSize: "20px",
              letterSpacing: "0.35em",
              fontWeight: 300,
              color: textColor,
              fontFamily: "'Comfortaa', sans-serif",
              margin: "0 0 10px 0",
            }}
          >
            go deeper with pause+
          </p>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.18em",
              fontWeight: 300,
              color: textColor,
              opacity: 0.5,
              fontFamily: "'Comfortaa', sans-serif",
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            17 more techniques — for focus,<br />energy, and hard moments.
          </p>
        </div>

        {/* Subscription group */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
            marginTop: "24px",
          }}
        >
          {/* Best value label */}
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.25em",
                fontWeight: 300,
                color: primaryColor,
                fontFamily: "'Comfortaa', sans-serif",
                opacity: 0.8,
                textTransform: "lowercase",
              }}
            >
              · best value ·
            </span>
          </div>
          <PricePill
            id="com.workondeck.alwayspause.annual"
            label="· $29.99 / year ·"
            sublabel="~$2.50 / month"
          />
          <PricePill
            id="com.workondeck.alwayspause.monthly"
            label="· $4.99 / month ·"
            sublabel="billed monthly"
          />
        </div>

        {/* Forever option — separated with extra breathing room */}
        <div
          style={{
            width: "100%",
            marginTop: "20px",
            paddingTop: "18px",
            borderTop: `1px solid ${isDayTheme ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)"}`,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.25em",
                fontWeight: 300,
                color: textColor,
                fontFamily: "'Comfortaa', sans-serif",
                opacity: 0.45,
                textTransform: "lowercase",
              }}
            >
              · own it ·
            </span>
          </div>
          <PricePill
            id="com.workondeck.alwayspause.lifetime"
            label="· $49.99 · forever ·"
            sublabel="one-time purchase"
          />
        </div>

        {/* CTA Button */}
        <button
          onClick={handlePurchase}
          style={{
            width: "100%",
            marginTop: "24px",
            background: isDayTheme ? "linear-gradient(135deg, #4A7FA6 0%, #6BA888 100%)" : "linear-gradient(135deg, #4A5B9C 0%, #6BA888 100%)",
            border: "none",
            borderRadius: "50px",
            padding: "15px 24px",
            cursor: "pointer",
            fontFamily: "'Comfortaa', sans-serif",
            fontSize: "12px",
            fontWeight: 300,
            letterSpacing: "0.2em",
            color: isDayTheme ? "#FAFAF8" : "#F0EDE8",
            textAlign: "center",
            boxSizing: "border-box",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          unlock pause+
        </button>

        {/* Bottom row: restore + maybe later */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "18px",
            marginTop: "16px",
            marginBottom: "20px",
          }}
        >
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Comfortaa', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.12em",
              fontWeight: 300,
              color: textColor,
              opacity: 0.3,
              padding: 0,
            }}
          >
            restore purchases
          </button>

          <span style={{ color: textColor, opacity: 0.2, fontSize: "10px" }}>·</span>

          <button
            onClick={onClose}
            style={{
              fontSize: "10px",
              color: textColor,
              fontFamily: "'Comfortaa', sans-serif",
              fontWeight: 300,
              letterSpacing: "0.2em",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              opacity: 0.4,
              transition: "opacity 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
          >
            · maybe later ·
          </button>
        </div>
      </div>
    </motion.div>
    </>
  );
}