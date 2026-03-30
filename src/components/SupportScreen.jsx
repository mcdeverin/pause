import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function SupportScreen({ onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(13, 27, 42, 0.95)" }}
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
          style={{ color: "rgba(232, 224, 208, 0.4)" }}
          aria-label="Close support"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center space-y-8">
          {/* App name */}
          <h1
            className="font-cormorant text-4xl font-light tracking-[0.2em]"
            style={{ color: "#E8E0D0" }}
          >
            Always Pause
          </h1>

          {/* Message */}
          <p
            className="font-cormorant text-lg font-light italic leading-relaxed max-w-md"
            style={{ color: "rgba(232, 224, 208, 0.85)" }}
          >
            This app is completely free. Always. If it's brought you even one moment of calm, consider supporting its existence.
          </p>

          {/* Tip buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              className="px-8 py-3 rounded-sm transition-all duration-500 font-cormorant text-sm tracking-[0.15em] hover:opacity-80"
              style={{
                background: "rgba(46, 93, 142, 0.3)",
                color: "#E8E0D0",
                border: "1px solid rgba(46, 93, 142, 0.4)",
              }}
            >
              ♡ Leave a tip — $1.99
            </button>
            <button
              className="px-8 py-3 rounded-sm transition-all duration-500 font-cormorant text-sm tracking-[0.15em] hover:opacity-80"
              style={{
                background: "rgba(123, 107, 168, 0.2)",
                color: "#E8E0D0",
                border: "1px solid rgba(123, 107, 168, 0.3)",
              }}
            >
              ☕ Buy us a coffee — $4.99
            </button>
          </div>

          {/* Footer text */}
          <p
            className="font-cormorant text-xs font-light tracking-[0.1em]"
            style={{ color: "rgba(232, 224, 208, 0.35)" }}
          >
            100% goes toward keeping Always Pause free and ad-free forever.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}