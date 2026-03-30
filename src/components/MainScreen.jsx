import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import CrispOrb from "./CrispOrb";

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme }) {
  const isDarkTheme = theme === "night";
  
  return (
    <motion.div
      className="relative w-screen h-screen flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* App name - fixed at top center */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          paddingTop: "52px",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: "18px",
            letterSpacing: "6px",
            color: "#2C2C2C",
            opacity: 0.6,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            margin: 0,
            display: "block",
          }}
        >
          ALWAYS PAUSE
        </div>
      </div>

      {/* Theme toggle - top right */}
      <motion.button
        onClick={onToggleTheme}
        className="absolute top-8 right-6 p-2 rounded-full transition-all duration-300 hover:opacity-70 z-20"
        style={{
          background: isDarkTheme ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
        }}
        aria-label="Toggle theme"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDarkTheme ? (
          <Moon className="w-4 h-4" style={{ color: "#888888" }} />
        ) : (
          <Sun className="w-4 h-4" style={{ color: "#888888" }} />
        )}
      </motion.button>

      {/* Center: Orb */}
      <div style={{ width: "280px", height: "280px" }}>
        <CrispOrb breathScale={1} isBreathing={false} theme={theme} />
      </div>

      {/* Tap to pause text - below orb */}
      <motion.p
        style={{
          fontSize: "11px",
          letterSpacing: "2px",
          color: "#2C2C2C",
          opacity: 0.35,
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300,
          margin: "32px 0 0 0",
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

      {/* Support button - fixed at bottom center */}
      <button
        onClick={onSupportClick}
        className="fixed bottom-8 left-0 right-0 z-10 transition-opacity duration-500 hover:opacity-60"
        style={{
          fontSize: "10px",
          color: "#2C2C2C",
          opacity: 0.25,
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300,
          background: "none",
          border: "none",
          cursor: "pointer",
          letterSpacing: "1px",
          textAlign: "center",
          margin: "0 auto",
          width: "100%",
        }}
        aria-label="Support Always Pause"
      >
        ♡ support this app
      </button>

      {/* Tap overlay */}
      <button
        onClick={onTap}
        className="fixed inset-0 cursor-pointer focus:outline-none"
        style={{ background: "transparent" }}
        aria-label="Tap to pause"
      />
    </motion.div>
  );
}