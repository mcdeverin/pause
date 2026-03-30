import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import CrispOrb from "./CrispOrb";

const THEME_COLORS = {
  day: {
    text: "#2C2C2C",
    secondary: "#888888",
  },
  night: {
    text: "#E8E0D0",
    secondary: "#A0A0A0",
  },
};

export default function MainScreen({ onTap, onSupportClick, theme = "day", onToggleTheme }) {
  const colors = THEME_COLORS[theme] || THEME_COLORS.day;
  
  return (
    <motion.div
      className="w-full min-h-screen flex flex-col items-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header with title and theme toggle */}
      <div className="w-full pt-12 flex items-center justify-between">
        <h1
          className="font-cormorant text-[9px] sm:text-[10px] font-light tracking-[0.4em] uppercase"
          style={{ color: colors.text }}
        >
          Always Pause
        </h1>
        
        <motion.button
          onClick={onToggleTheme}
          className="p-2 rounded-full transition-all duration-300 hover:opacity-70"
          style={{
            background: theme === "day" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.08)",
          }}
          aria-label="Toggle theme"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme === "day" ? (
            <Sun className="w-4 h-4" style={{ color: colors.secondary }} />
          ) : (
            <Moon className="w-4 h-4" style={{ color: colors.secondary }} />
          )}
        </motion.button>
      </div>

      {/* Main content area with flex layout */}
      <div className="flex-1 flex flex-col items-center justify-center w-full py-8">
        {/* Orb */}
        <CrispOrb breathScale={1} isBreathing={false} theme={theme} />
      </div>

      {/* Bottom section: tap prompt, divider, support */}
      <div className="flex flex-col items-center gap-4 pb-12 sm:pb-16">
        {/* Tap to pause text */}
        <motion.p
          className="font-cormorant text-[10px] sm:text-[11px] font-light tracking-[0.45em]"
          style={{ color: colors.text }}
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          t a p &nbsp;&nbsp; t o &nbsp;&nbsp; p a u s e
        </motion.p>

        {/* Divider */}
        <div className="w-48 h-px" style={{ background: colors.secondary, opacity: 0.3 }} />

        {/* Support button */}
        <button
          onClick={onSupportClick}
          className="transition-opacity duration-500 hover:opacity-60"
          style={{ color: colors.secondary }}
          aria-label="Support Always Pause"
        >
          <p className="font-cormorant text-[9px] font-light tracking-[0.3em]">
            ♡ &nbsp; support
          </p>
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