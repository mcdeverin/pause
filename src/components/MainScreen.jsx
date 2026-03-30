import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

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
      className="absolute inset-0 flex flex-col items-center justify-between z-10 pointer-events-none overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="relative z-20 w-full pt-6 sm:pt-8 px-6 flex items-center justify-between pointer-events-none">
        {/* App name */}
        <div>
          <h1
            className="font-cormorant text-[9px] sm:text-[10px] font-light tracking-[0.4em] uppercase"
            style={{ color: colors.text }}
          >
            Always Pause
          </h1>
        </div>
        {/* Theme toggle */}
        <motion.button
          onClick={onToggleTheme}
          className="pointer-events-auto p-2 rounded-full transition-all duration-300 hover:opacity-70"
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

      {/* Center tap area */}
      <button
        onClick={onTap}
        className="pointer-events-auto absolute inset-0 cursor-pointer focus:outline-none"
        aria-label="Tap to pause"
      />

      {/* Tap prompt */}
      <div className="pb-0 flex flex-col items-center">
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

        {/* Support button */}
        <button
          onClick={onSupportClick}
          className="mt-40 sm:mt-48 pointer-events-auto transition-opacity duration-500 hover:opacity-60"
          style={{ color: colors.secondary }}
          aria-label="Support Always Pause"
        >
          <p className="font-cormorant text-[9px] font-light tracking-[0.3em]">
            ♡ &nbsp; support this app
          </p>
        </button>
      </div>
    </motion.div>
  );
}