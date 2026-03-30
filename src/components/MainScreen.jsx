import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import CrispOrb from "./CrispOrb";

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme }) {
  const isDarkTheme = theme === "night";
  
  return (
    <div
      className="relative"
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* TOP ZONE - App name */}
      <div
        style={{
          position: "absolute",
          top: "48px",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: "13px",
            letterSpacing: "5px",
            color: "#2C2C2C",
            opacity: 0.5,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            margin: 0,
            display: "block",
          }}
        >
          ALWAYS PAUSE
        </div>
      </div>

      {/* THEME TOGGLE - Top right */}
      <motion.button
        onClick={onToggleTheme}
        className="rounded-full transition-all duration-300 hover:opacity-60"
        style={{
          position: "absolute",
          top: "44px",
          right: "24px",
          width: "28px",
          height: "28px",
          background: "transparent",
          opacity: 0.4,
          zIndex: 20,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
        aria-label="Toggle theme"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDarkTheme ? (
          <Moon className="w-6 h-6" style={{ color: "#888888" }} />
        ) : (
          <Sun className="w-6 h-6" style={{ color: "#888888" }} />
        )}
      </motion.button>

      {/* MIDDLE ZONE - Orb centered */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 5,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Orb */}
        <div style={{ width: "220px", height: "220px" }}>
          <CrispOrb breathScale={1} isBreathing={false} theme={theme} />
        </div>

        {/* Tap to pause text - below orb */}
        <motion.p
          style={{
            fontSize: "11px",
            letterSpacing: "1.5px",
            color: "#2C2C2C",
            opacity: 0.35,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            margin: 0,
            marginTop: "24px",
            textAlign: "center",
            wordSpacing: "normal",
          }}
          animate={{ opacity: [0.25, 0.45, 0.25] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          tap to pause
        </motion.p>
      </motion.div>

      {/* BOTTOM ZONE - Support button */}
      <button
        onClick={onSupportClick}
        className="transition-opacity duration-500 hover:opacity-60"
        style={{
          position: "absolute",
          bottom: "40px",
          left: 0,
          right: 0,
          zIndex: 10,
          fontSize: "10px",
          color: "#2C2C2C",
          opacity: 0.25,
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300,
          background: "none",
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.5px",
          textAlign: "center",
          margin: "0 auto",
          width: "100%",
          padding: 0,
        }}
        aria-label="Support Always Pause"
      >
        ♡ support this app
      </button>

      {/* Tap overlay */}
      <button
        onClick={onTap}
        className="fixed inset-0 cursor-pointer focus:outline-none z-0"
        style={{ background: "transparent" }}
        aria-label="Tap to pause"
      />
    </div>
  );
}