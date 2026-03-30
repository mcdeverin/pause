import { motion } from "framer-motion";

const COLORS = {
  day: {
    outer: "rgba(143, 175, 143, 0.25)",
    middle: "rgba(107, 143, 113, 0.35)",
    inner: "rgba(91, 141, 184, 0.7)",
    center: "#3A6B9A",
  },
  night: {
    outer: "rgba(46, 93, 142, 0.2)",
    middle: "rgba(123, 107, 168, 0.3)",
    inner: "rgba(123, 107, 168, 0.6)",
    center: "#E8E0D0",
  },
};

export default function SoftBlob({ breathScale = 1, isBreathing = false, theme = "day" }) {
  const colors = COLORS[theme] || COLORS.day;
  const baseSize = 180;
  const outerRing = baseSize * 1.6;
  const middleRing = baseSize * 1.2;
  const innerCircle = baseSize * 0.7;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: outerRing,
          height: outerRing,
          background: colors.outer,
          filter: "blur(40px)",
        }}
        animate={
          isBreathing
            ? {
                transform: [`scale(${1 - breathScale * 0.15})`, `scale(${1 + breathScale * 0.1})`],
              }
            : {}
        }
        transition={{ duration: 0.1 }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: middleRing,
          height: middleRing,
          background: colors.middle,
          filter: "blur(35px)",
        }}
        animate={
          isBreathing
            ? {
                transform: [`scale(${1 - breathScale * 0.2})`, `scale(${1 + breathScale * 0.15})`],
              }
            : {}
        }
        transition={{ duration: 0.1 }}
      />

      {/* Inner circle */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: innerCircle,
          height: innerCircle,
          background: colors.inner,
          filter: "blur(20px)",
        }}
        animate={
          isBreathing
            ? {
                transform: [`scale(${1 - breathScale * 0.25})`, `scale(${1 + breathScale * 0.2})`],
              }
            : {}
        }
        transition={{ duration: 0.1 }}
      />

      {/* Center dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 12,
          height: 12,
          background: colors.center,
          boxShadow: `0 0 20px ${colors.center}33`,
        }}
        animate={
          isBreathing
            ? {
                scale: [1 - breathScale * 0.15, 1 + breathScale * 0.1],
              }
            : {}
        }
        transition={{ duration: 0.1 }}
      />
    </motion.div>
  );
}