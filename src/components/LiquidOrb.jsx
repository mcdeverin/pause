import { useState, useEffect } from "react";

export default function LiquidOrb({ theme, isBreathing, technique, size = 260 }) {
  const [scale, setScale] = useState(1.0);
  const [countdown, setCountdown] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(null);

  const isDayTheme = theme === "day";
  const baseSize = size;

  const dayGradient = "radial-gradient(circle at 30% 28%, #5A9FD4 0%, #2E6FA3 30%, #1A8C7A 65%, #4A7C59 100%)";
  const nightGradient = "radial-gradient(circle at 30% 28%, #7B4FC9 0%, #4A2C8A 25%, #1E5FAD 60%, #0E8C7A 100%)";

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
    <>
      <style>{`
        @keyframes liquidMorph {
          0% {
            border-radius: 60% 40% 70% 30% / 50% 60% 40% 70%;
          }
          25% {
            border-radius: 50% 50% 60% 40% / 40% 70% 50% 60%;
          }
          50% {
            border-radius: 40% 60% 30% 70% / 60% 40% 70% 30%;
          }
          75% {
            border-radius: 70% 30% 50% 50% / 30% 70% 60% 40%;
          }
          100% {
            border-radius: 60% 40% 70% 30% / 50% 60% 40% 70%;
          }
        }

        .liquid-blob {
          animation: liquidMorph 8s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          position: "relative",
          width: `${baseSize}px`,
          height: `${baseSize}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Liquid blob */}
        <div
          className="liquid-blob"
          style={{
            position: "absolute",
            width: `${baseSize}px`,
            height: `${baseSize}px`,
            background: isDayTheme ? dayGradient : nightGradient,
            boxShadow: isDayTheme
              ? "0 8px 48px rgba(46, 111, 163, 0.45), 0 2px 16px rgba(26, 140, 122, 0.3), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 8px rgba(0,0,0,0.1)"
              : "0 8px 60px rgba(74, 44, 138, 0.6), 0 2px 20px rgba(14, 140, 122, 0.35), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 8px rgba(0,0,0,0.2)",
            filter: isDayTheme
              ? "drop-shadow(0 0 20px rgba(46, 111, 163, 0.3))"
              : "drop-shadow(0 0 28px rgba(74, 44, 138, 0.5))",
            transform: `scale(${scale})`,
            transition: "transform 0.95s ease-in-out",
          }}
        />

        {/* Countdown number - only show when breathing */}
        {isBreathing && (
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
            {countdown}
          </div>
        )}
      </div>
    </>
  );
}