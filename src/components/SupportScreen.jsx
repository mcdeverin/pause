import { motion } from "framer-motion";
import { X } from "lucide-react";

const THEME_COLORS = {
  day: {
    overlay: "rgba(247, 245, 242, 0.95)",
    text: "#2C2C2C",
    secondary: "#6E6E6E",
    tertiary: "rgba(44, 44, 44, 0.62)",
    buttonBg: "rgba(91, 141, 184, 0.15)",
    buttonBorder: "rgba(91, 141, 184, 0.3)",
    buttonText: "#2C2C2C",
  },
  night: {
    overlay: "rgba(13, 27, 42, 0.95)",
    text: "#E8E0D0",
    secondary: "#B4B4B4",
    tertiary: "rgba(232, 224, 208, 0.6)",
    buttonBg: "rgba(123, 107, 168, 0.2)",
    buttonBorder: "rgba(123, 107, 168, 0.3)",
    buttonText: "#E8E0D0",
  },
};

export default function SupportScreen({ onClose, theme }) {
  const colors = THEME_COLORS[theme];
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: colors.overlay }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative w-full max-w-sm mx-4 flex flex-col items-center"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 transition-opacity duration-300 hover:opacity-60"
          style={{ color: colors.secondary }}
          aria-label="Close support"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center space-y-8">
          {/* App name */}
          <h1
            className="font-sans text-3xl font-semibold tracking-[0.01em]"
            style={{ color: colors.text }}
          >
            Always Pause
          </h1>

          {/* Message */}
          <p
            className="font-sans text-base font-normal leading-relaxed max-w-md"
            style={{ color: colors.secondary }}
          >
            This app is completely free. Always. If it's brought you even one moment of calm, consider supporting its existence.
          </p>

          {/* Tip buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              className="px-8 py-3 rounded-sm transition-all duration-500 font-sans text-sm font-medium tracking-[0.01em] hover:opacity-80"
              style={{
                background: colors.buttonBg,
                color: colors.buttonText,
                border: `1px solid ${colors.buttonBorder}`,
              }}
            >
              ♡ Leave a tip — $1.99
            </button>
            <button
              className="px-8 py-3 rounded-sm transition-all duration-500 font-sans text-sm font-medium tracking-[0.01em] hover:opacity-80"
              style={{
                background: colors.buttonBg,
                color: colors.buttonText,
                border: `1px solid ${colors.buttonBorder}`,
              }}
            >
              ☕ Buy us a coffee — $4.99
            </button>
          </div>

          {/* Footer text */}
          <p
            className="font-sans text-xs font-normal tracking-[0.01em]"
            style={{ color: colors.tertiary }}
          >
            100% goes toward keeping Always Pause free and ad-free forever.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}