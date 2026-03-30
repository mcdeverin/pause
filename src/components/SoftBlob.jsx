import { motion } from "framer-motion";

export default function SoftBlob({ breathScale = 1, isBreathing = false }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="relative w-64 h-64 sm:w-80 sm:h-80"
        style={{
          filter: "blur(0.5px)",
        }}
      >
        {/* Outer soft glow layer */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: breathScale * 1.15,
            opacity: isBreathing ? 0.4 : 0.25,
          }}
          transition={{
            type: "tween",
            duration: 0.5,
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(circle at 40% 40%, rgba(91, 141, 184, 0.2) 0%, rgba(143, 175, 143, 0.1) 50%, transparent 80%)`,
          }}
        />

        {/* Main breathing blob */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: breathScale,
          }}
          transition={{
            type: "tween",
            duration: 0.5,
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(circle at 35% 35%, #5B8DB8 0%, #7BA5A5 30%, #8FAF8F 65%, rgba(143, 175, 143, 0.5) 100%)`,
            boxShadow: `0 20px 60px rgba(91, 141, 184, 0.15), inset -10px -10px 30px rgba(0, 0, 0, 0.05)`,
            filter: "blur(1px)",
          }}
        />

        {/* Subtle organic irregularity via noise effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: breathScale,
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            type: "tween",
            duration: 0.5,
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(ellipse 80% 100% at 45% 45%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`,
            filter: "blur(2px)",
          }}
        />
      </motion.div>
    </div>
  );
}