import { motion } from "framer-motion";

export default function AmbientGlow({ breathScale = 1, isBreathing = false }) {
  const size = isBreathing ? breathScale * 320 : 280;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Primary glow */}
      <motion.div
        className="absolute rounded-full"
        animate={{
          width: size,
          height: size,
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "radial-gradient(circle, rgba(123, 107, 168, 0.06) 0%, rgba(123, 107, 168, 0.02) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Secondary warm glow */}
      <motion.div
        className="absolute rounded-full"
        animate={{
          width: size * 1.8,
          height: size * 1.8,
        }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "radial-gradient(circle, rgba(123, 107, 168, 0.02) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}