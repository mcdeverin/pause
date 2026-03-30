import { motion } from "framer-motion";

const COLORS = {
  day: {
    outer: "#8FAF8F",
    middle: "#6B8F71",
    inner: "#5B8DB8",
    center: "#3A6B9A",
  },
  night: {
    outer: "#7B6BA8",
    middle: "#6B5FA8",
    inner: "#7B6BA8",
    center: "#E8E0D0",
  },
};

export default function CrispOrb({ breathScale = 1, isBreathing = false, theme = "day" }) {
  const colors = COLORS[theme];
  const baseSize = 160;

  const outerSize = baseSize * 1.8;
  const middleSize = baseSize * 1.2;
  const innerSize = baseSize * 0.6;

  const getAnimatedSize = (baseSize, factor = 1) => {
    if (!isBreathing) return baseSize;
    const minScale = 0.9;
    const maxScale = 1.1;
    return baseSize * (minScale + (maxScale - minScale) * (breathScale - 0.7) / 0.9);
  };

  return (
    <div className="flex items-center justify-center w-full my-8">
      <div className="relative" style={{ width: outerSize, height: outerSize }}>
        {/* Outer circle */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: colors.outer,
            opacity: 0.25,
            width: getAnimatedSize(outerSize),
            height: getAnimatedSize(outerSize),
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          transition={{ duration: 0.05 }}
        />

        {/* Middle circle */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: colors.middle,
            opacity: 0.4,
            width: getAnimatedSize(middleSize),
            height: getAnimatedSize(middleSize),
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          transition={{ duration: 0.05 }}
        />

        {/* Inner circle */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: colors.inner,
            opacity: 0.75,
            width: getAnimatedSize(innerSize),
            height: getAnimatedSize(innerSize),
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          transition={{ duration: 0.05 }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute rounded-full"
          style={{
            background: colors.center,
            width: 12,
            height: 12,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
}