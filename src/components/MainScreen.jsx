import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import CrispOrb from "./CrispOrb";

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme }) {
  const isDarkTheme = theme === "night";
  
  return (
    <motion.div
      className="w-full min-h-screen flex flex-col items-center justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-6" style={{ paddingTop: "60px" }}>
        <div
          style={{
            fontSize: "12px",
            letterSpacing: "4px",
            color: "#2C2C2C",
            opacity: 0.5,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
          }}
        >
          ALWAYS PAUSE
        </div>
        
        <motion.button
          onClick={onToggleTheme}
          className="p-2 rounded-full transition-all duration-300 hover:opacity-70"
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
      </div>

      {/* Center: Orb */}
      <div className="flex-1 flex items-center justify-center w-full" style={{ minHeight: "40vh" }}>
        <div style={{ width: "280px", height: "280px" }}>
          <CrispOrb breathScale={1} isBreathing={false} theme={theme} />
        </div>
      </div>

      {/* Tap to pause text */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <motion.p
          style={{
            fontSize: "11px",
            letterSpacing: "3px",
            color: "#2C2C2C",
            opacity: 0.35,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            margin: 0,
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
      </div>

      {/* Bottom: Support button */}
      <div className="w-full flex items-center justify-center px-6" style={{ paddingBottom: "40px" }}>
        <button
          onClick={onSupportClick}
          className="transition-opacity duration-500 hover:opacity-60"
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
          }}
          aria-label="Support Always Pause"
        >
          ♡ support this app
        </button>
      </div>

      {/* Tap to activate breathing overlay */}
      <button
        onClick={onTap}
        className="fixed inset-0 cursor-pointer focus:outline-none"
        style={{ background: "transparent" }}
        aria-label="Tap to pause"
      />
    </motion.div>
  );
}