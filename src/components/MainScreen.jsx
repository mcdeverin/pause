import { motion } from "framer-motion";

export default function MainScreen({ onTap }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-between z-10 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* App name */}
      <div className="pt-16 sm:pt-20">
        <h1
          className="font-cormorant text-[10px] sm:text-[11px] font-light tracking-[0.5em] uppercase"
          style={{ color: "rgba(245, 236, 215, 0.3)" }}
        >
          PAUSE
        </h1>
      </div>

      {/* Center tap area */}
      <button
        onClick={onTap}
        className="pointer-events-auto absolute inset-0 cursor-pointer focus:outline-none"
        aria-label="Tap to pause"
      />

      {/* Tap prompt */}
      <div className="pb-20 sm:pb-24">
        <motion.p
          className="font-cormorant text-[10px] sm:text-[11px] font-light tracking-[0.45em]"
          style={{ color: "rgba(245, 236, 215, 0.18)" }}
          animate={{ opacity: [0.18, 0.35, 0.18] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          t a p &nbsp;&nbsp; t o &nbsp;&nbsp; p a u s e
        </motion.p>
      </div>
    </motion.div>
  );
}