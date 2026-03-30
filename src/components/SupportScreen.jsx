import { motion } from "framer-motion";
import { X } from "lucide-react";
import SoftBlob from "./SoftBlob";

export default function SupportScreen({ onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(247, 245, 242, 0.98)" }}
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
          style={{ color: "#888888" }}
          aria-label="Close support"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Small decorative blob at top */}
        <div className="mb-8">
          <div className="w-32 h-32 sm:w-40 sm:h-40">
            <SoftBlob breathScale={1.2} isBreathing={true} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-8">
          {/* App name */}
          <h1
            className="font-serif text-2xl sm:text-3xl font-light tracking-[0.2em]"
            style={{ color: "#2C2C2C" }}
          >
            Always Pause
          </h1>

          {/* Message */}
          <p
            className="font-serif text-base font-light italic leading-relaxed max-w-md"
            style={{ color: "#666666" }}
          >
            This app is completely free. Always. If it's brought you even one moment of calm, consider supporting its existence.
          </p>

          {/* Tip buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              className="px-8 py-3 rounded-sm transition-all duration-500 font-serif text-sm tracking-[0.15em] hover:opacity-80"
              style={{
                background: "rgba(91, 141, 184, 0.1)",
                color: "#2C2C2C",
                border: "1px solid rgba(91, 141, 184, 0.25)",
              }}
            >
              ♡ Leave a tip — $1.99
            </button>
            <button
              className="px-8 py-3 rounded-sm transition-all duration-500 font-serif text-sm tracking-[0.15em] hover:opacity-80"
              style={{
                background: "rgba(143, 175, 143, 0.08)",
                color: "#2C2C2C",
                border: "1px solid rgba(143, 175, 143, 0.2)",
              }}
            >
              ☕ Buy us a coffee — $4.99
            </button>
          </div>

          {/* Footer text */}
          <p
            className="font-serif text-xs font-light tracking-[0.1em]"
            style={{ color: "#AAAAAA" }}
          >
            100% goes toward keeping Always Pause free and ad-free forever.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}