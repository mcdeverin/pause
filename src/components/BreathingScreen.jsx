import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LiquidOrb from "./LiquidOrb";

export default function BreathingScreen({ technique, onDone, theme }) {
  const phases = technique.phases.split(',').map(Number);
  const labels = technique.phaseLabels.split(',');

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0]);
  const [orbScale, setOrbScale] = useState(1.0);

  const textColor = theme === "day" ? "#2C2C2C" : "#E8E0D0";

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Move to next phase
          setPhaseIndex(prevPhase => {
            const nextPhase = (prevPhase + 1) % phases.length;
            const nextLabel = labels[nextPhase].toLowerCase();
            if (nextLabel.includes('inhale')) setOrbScale(1.0);
            else if (nextLabel.includes('exhale')) setOrbScale(1.3);
            else setOrbScale(1.3);
            return nextPhase;
          });
          return phases[(phaseIndex + 1) % phases.length];
        }
        // Mid-phase scale update
        const currentLabel = labels[phaseIndex].toLowerCase();
        const phaseDuration = phases[phaseIndex];
        const elapsed = phaseDuration - prev + 1;
        const progress = elapsed / phaseDuration;
        if (currentLabel.includes('inhale')) {
          setOrbScale(1.0 + 0.35 * progress);
        } else if (currentLabel.includes('exhale')) {
          setOrbScale(1.35 - 0.35 * progress);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phaseIndex, phases, labels]);

  return (
    <motion.div
      className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Technique name - top */}
      <div
        style={{
          position: "absolute",
          top: "48px",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: "13px",
            letterSpacing: "5px",
            color: textColor,
            opacity: 0.55,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            margin: 0,
          }}
        >
          {technique.name.toUpperCase()}
        </p>
      </div>

      {/* Center: Orb with countdown and phase text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          zIndex: 5,
        }}
      >
        {/* Blob with countdown */}
        <div
          style={{
            position: "relative",
            width: "260px",
            height: "260px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "260px",
              height: "260px",
              background: theme === "day"
                ? "radial-gradient(circle at 35% 35%, rgba(91, 141, 184, 0.9) 0%, rgba(143, 175, 143, 0.7) 60%, rgba(143, 175, 143, 0.5) 100%)"
                : "radial-gradient(circle at 35% 35%, rgba(74, 91, 140, 0.9) 0%, rgba(155, 142, 196, 0.7) 60%, rgba(155, 142, 196, 0.5) 100%)",
              borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
              boxShadow: theme === "day"
                ? "0 0 60px rgba(91, 141, 184, 0.25), inset 0 0 40px rgba(255, 255, 255, 0.1)"
                : "0 0 60px rgba(74, 91, 140, 0.25), inset 0 0 40px rgba(255, 255, 255, 0.05)",
              filter: theme === "day"
                ? "drop-shadow(0 0 30px rgba(143, 175, 143, 0.15))"
                : "drop-shadow(0 0 30px rgba(155, 142, 196, 0.15))",
              transform: `scale(${orbScale})`,
              transition: "transform 0.9s ease-in-out",
              animation: "liquidMorph 8s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              zIndex: 10,
              fontSize: "32px",
              fontWeight: 200,
              color: "rgba(255, 255, 255, 0.95)",
              fontFamily: "'Cormorant Garamond', serif",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            {secondsLeft}
          </div>
        </div>
        <p
          style={{
            fontSize: "28px",
            color: textColor,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            margin: 0,
            textTransform: "lowercase",
            textAlign: "center",
            minHeight: "32px",
          }}
        >
          {labels[phaseIndex]}
        </p>

        {/* Science fact */}
        <p
          style={{
            fontSize: "12px",
            color: theme === "day" ? "#888888" : "#A0A0A0",
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 300,
            textAlign: "center",
            maxWidth: "280px",
            lineHeight: 1.6,
            margin: 0,
            opacity: 0.7,
          }}
        >
          {technique.science}
        </p>
      </div>

      {/* Bottom: Done button */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            zIndex: 10,
          }}
        >

        {/* Done button */}
        <button
          onClick={onDone}
          style={{
            fontSize: "10px",
            color: textColor,
            opacity: 0.35,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "opacity 700ms",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.6")}
          onMouseLeave={(e) => (e.target.style.opacity = "0.35")}
        >
          · done ·
        </button>
      </div>
    </motion.div>
  );
}