import { useState, useEffect } from "react";
import BlobShape from "./BlobShape";

export default function LiquidOrb({ theme, isBreathing, technique, size = 260 }) {
  const [scale, setScale] = useState(1.0);
  const [countdown, setCountdown] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(null);

  const baseSize = size;

  useEffect(() => {
    if (!isBreathing || !technique) {
      setScale(1.0);
      return;
    }

    let phaseIndex = 0;
    let count = technique.phases[0].duration;
    let timerRef = null;

    const calculateScale = (phase, duration, remaining) => {
      const elapsed = duration - remaining;
      const progress = elapsed / duration;

      if (phase.label === "inhale" || phase.label === "inhale2") {
        if (phase.label === "inhale2") {
          return 1.0 + 0.1 * progress;
        }
        return 1.0 + 0.3 * progress;
      } else if (phase.label === "hold") {
        return 1.3;
      } else if (phase.label === "exhale") {
        return 1.3 - 0.3 * progress;
      } else if (phase.label === "hold2") {
        return 1.0;
      }

      return 1.0;
    };

    const tick = () => {
      const phase = technique.phases[phaseIndex];
      const newScale = calculateScale(phase, technique.phases[phaseIndex].duration, count);

      setScale(newScale);
      setCountdown(Math.max(count, 1));
      setCurrentPhase(phase);

      count--;

      if (count < 0) {
        phaseIndex++;
        if (phaseIndex >= technique.phases.length) {
          phaseIndex = 0;
        }
        count = technique.phases[phaseIndex].duration;
      }

      timerRef = setTimeout(tick, 1000);
    };

    timerRef = setTimeout(tick, 0);

    return () => {
      if (timerRef) clearTimeout(timerRef);
      setScale(1.0);
    };
  }, [isBreathing, technique]);

  return (
    <div
      style={{
        position: "relative",
        width: `${baseSize}px`,
        height: `${baseSize}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      {/* Liquid blob */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${scale})`,
          transition: "transform 0.95s ease-in-out",
        }}
      >
        <BlobShape theme={theme} />
      </div>

      {/* Countdown number - only show when breathing */}
      {isBreathing && (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            fontSize: "32px",
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.95)",
            fontFamily: "'Poppins', sans-serif",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {countdown}
        </div>
      )}
    </div>
  );
}