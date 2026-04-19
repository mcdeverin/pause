import { useState } from "react";
import { motion } from "framer-motion";
import LiquidOrb from "./LiquidOrb";

const PLANS = [
  {
    id: "com.workondeck.alwayspause.annual",
    label: "· $29.99 / year · best value ·",
    key: "annual",
  },
  {
    id: "com.workondeck.alwayspause.monthly",
    label: "· $4.99 / month ·",
    key: "monthly",
  },
  {
    id: "com.workondeck.alwayspause.lifetime",
    label: "· $49.99 · forever ·",
    key: "lifetime",
  },
];

export default function PaywallScreen({ theme = "day", onClose, onPurchase, triggerCategory }) {
  const [selected, setSelected] = useState("com.workondeck.alwayspause.annual");

  const isDayTheme = theme === "day";
  const textColor = isDayTheme ? "#111111" : "#F0EDE8";
  const bg = isDayTheme ? "#FAFAF8" : "#0D1117";
  const glassBackground = isDayTheme ? "rgba(255,255,255,0.6)" : "rgba(20,30,50,0.75)";
  const glassBorder = isDayTheme ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.15)";
  const selectedBorder = isDayTheme ? "#4A7FA6" : "#4A5B9C";

  const handlePurchase = () => {
    if (onPurchase) onPurchase(selected);
  };

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        background: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        paddingTop: "env(safe-area-inset-top, 44px)",
        paddingBottom: "env(safe-area-inset-bottom, 24px)",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          width: "100%",
          maxWidth: "320px",
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        {/* Orb */}
        <LiquidOrb theme={theme} isBreathing={false} size={160} />

        {/* Headline */}
        <div style={{ textAlign: "center", marginTop: "4px" }}>
          <p
            style={{
              fontSize: "22px",
              letterSpacing: "0.4em",
              fontWeight: 300,
              color: textColor,
              fontFamily: "'Comfortaa', sans-serif",
              margin: "0 0 10px 0",
            }}
          >
            go deeper.
          </p>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.2em",
              fontWeight: 300,
              color: textColor,
              opacity: 0.55,
              fontFamily: "'Comfortaa', sans-serif",
              margin: 0,
            }}
          >
            unlock focus, energy, and advanced.
          </p>
        </div>

        {/* Pricing cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "100%",
            maxWidth: "280px",
          }}
        >
          {PLANS.map((plan) => {
            const isSelected = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                style={{
                  background: glassBackground,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${isSelected ? selectedBorder : glassBorder}`,
                  borderRadius: "14px",
                  padding: "14px 20px",
                  cursor: "pointer",
                  fontFamily: "'Comfortaa', sans-serif",
                  fontSize: "12px",
                  fontWeight: 300,
                  letterSpacing: "0.15em",
                  color: textColor,
                  opacity: isSelected ? 1 : 0.5,
                  transition: "opacity 0.25s, border-color 0.25s",
                  textAlign: "center",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                {plan.label}
              </button>
            );
          })}
        </div>

        {/* CTA Button */}
        <button
          onClick={handlePurchase}
          style={{
            width: "100%",
            maxWidth: "280px",
            background: glassBackground,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${selectedBorder}`,
            borderRadius: "14px",
            padding: "15px 20px",
            cursor: "pointer",
            fontFamily: "'Comfortaa', sans-serif",
            fontSize: "12px",
            fontWeight: 300,
            letterSpacing: "0.2em",
            color: textColor,
            textAlign: "center",
            boxSizing: "border-box",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          unlock always pause+
        </button>

        {/* Restore purchases */}
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Comfortaa', sans-serif",
            fontSize: "10px",
            letterSpacing: "0.15em",
            fontWeight: 300,
            color: textColor,
            opacity: 0.4,
            padding: 0,
            marginTop: "-8px",
          }}
          onClick={() => {/* restore logic */}}
        >
          restore purchases
        </button>

        {/* Maybe later */}
        <button
          onClick={onClose}
          style={{
            fontSize: "11px",
            color: textColor,
            fontFamily: "'Comfortaa', sans-serif",
            fontWeight: 300,
            letterSpacing: "0.2em",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginTop: "4px",
            transition: "opacity 700ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          · maybe later ·
        </button>
      </div>
    </motion.div>
  );
}