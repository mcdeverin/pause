import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TOTAL_CYCLES = 4;

const DEFAULT_TECHNIQUE = {
  name: "Box Breathing",
  phases: [4, 4, 4, 4],
  phaseLabels: ["inhale", "hold", "exhale", "hold"],
  science: "Used by Navy SEALs to control stress under pressure.",
};

export default function BreathingScreen({ technique, onDone, theme }) {
  try {
    const activeTechnique = technique || DEFAULT_TECHNIQUE;
    
    const phases = Array.isArray(activeTechnique.phases) ? activeTechnique.phases : (typeof activeTechnique.phases === 'string' ? activeTechnique.phases.split(',').map(Number) : []);
    const labels = Array.isArray(activeTechnique.phaseLabels) ? activeTechnique.phaseLabels : (typeof activeTechnique.phaseLabels === 'string' ? activeTechnique.phaseLabels.split(',') : []);
    
    if (!phases.length || !labels.length) {
      return <BreathingScreenContent technique={DEFAULT_TECHNIQUE} onDone={onDone} theme={theme} />;
    }
    
    return <BreathingScreenContent technique={activeTechnique} phases={phases} labels={labels} onDone={onDone} theme={theme} />;
  } catch (error) {
    console.error('BreathingScreen error:', error);
    return <BreathingScreenContent technique={DEFAULT_TECHNIQUE} onDone={onDone} theme={theme} />;
  }
}

function BreathingScreenContent({ technique, phases: propsPhases, labels: propsLabels, onDone, theme }) {
  const phases = propsPhases || (Array.isArray(technique.phases) ? technique.phases : (typeof technique.phases === 'string' ? technique.phases.split(',').map(Number) : []));
  const labels = propsLabels || (Array.isArray(technique.phaseLabels) ? technique.phaseLabels : (typeof technique.phaseLabels === 'string' ? technique.phaseLabels.split(',') : []));

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0]);
  const [orbScale, setOrbScale] = useState(1.0);
  const [progress, setProgress] = useState(0);

  const timerRef = useRef(null);
  const phaseIndexRef = useRef(0);
  const secondsLeftRef = useRef(phases[0]);
  const cycleCountRef = useRef(0);
  const totalSecondsRef = useRef(phases.reduce((a, b) => a + b, 0) * TOTAL_CYCLES);
  const elapsedSecondsRef = useRef(0);

  const isDayTheme = theme === "day";
  const textColor = isDayTheme ? "#111111" : "#F0EDE8";

  useEffect(() => {
    timerRef.current = setInterval(() => {
      secondsLeftRef.current -= 1;

      // Get current phase info
      const currentPhaseIdx = phaseIndexRef.current;
      const currentLabel = labels[currentPhaseIdx].toLowerCase();
      const currentDuration = phases[currentPhaseIdx];
      const secondsElapsed = currentDuration - secondsLeftRef.current;
      const phaseProgress = secondsElapsed / currentDuration;

      // Calculate scale
      let newScale = 1.0;
      if (currentLabel.includes('inhale')) {
        newScale = 1.0 + 0.35 * phaseProgress;
      } else if (currentLabel.includes('exhale')) {
        newScale = 1.35 - 0.35 * phaseProgress;
      } else if (currentLabel.includes('hold')) {
        const prevLabel = currentPhaseIdx > 0 ? labels[currentPhaseIdx - 1].toLowerCase() : '';
        newScale = prevLabel.includes('inhale') ? 1.35 : 1.0;
      }

      setOrbScale(newScale);
      setSecondsLeft(secondsLeftRef.current);

      // Track overall progress
      elapsedSecondsRef.current += 1;
      const overallProgress = Math.min(elapsedSecondsRef.current / totalSecondsRef.current, 1);
      setProgress(overallProgress);

      // Advance phase when count reaches 0
      if (secondsLeftRef.current <= 0) {
        const nextPhaseIdx = (currentPhaseIdx + 1) % phases.length;
        
        // Check if we've completed a full cycle
        if (nextPhaseIdx === 0) {
          cycleCountRef.current += 1;
          
          // End after 4 cycles
          if (cycleCountRef.current >= TOTAL_CYCLES) {
            clearInterval(timerRef.current);
            setProgress(1);
            setTimeout(onDone, 500);
            return;
          }
        }

        phaseIndexRef.current = nextPhaseIdx;
        secondsLeftRef.current = phases[nextPhaseIdx];
        setPhaseIndex(nextPhaseIdx);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phases, labels, onDone]);

  return (
    <motion.div
      className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: theme === "day" ? "#FAFAF8" : "#0D1117",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Technique name - top */}
      <div
        style={{
          position: "absolute",
          top: "64px",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.5em",
            color: textColor,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 200,
            margin: 0,
          }}
        >
          {technique.name.toUpperCase()}
        </p>
      </div>

      {/* Center: Blob only */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 5,
        }}
      >
        {/* Blob container */}
        <div
          style={{
            position: "relative",
            width: "270px",
            height: "270px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Animated blob */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background: theme === "day"
                ? "radial-gradient(circle at 35% 35%, #4A7FA6 0%, #6BA888 100%)"
                : "radial-gradient(circle at 35% 35%, #4A5B9C 0%, #7B9E8C 100%)",
              borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
              boxShadow: "none",
              filter: "none",
              transform: `scale(${orbScale})`,
              transition: "transform 0.95s ease-in-out",
              animation: "liquidMorph 8s ease-in-out infinite",
            }}
          />

          {/* Countdown number */}
          <div
            style={{
              position: "absolute",
              zIndex: 10,
              fontSize: "52px",
              fontWeight: 200,
              color: "#FFFFFF",
              fontFamily: "'Nunito', sans-serif",
              textShadow: "none",
            }}
          >
            {secondsLeft}
          </div>
        </div>
      </div>

      {/* Phase label - positioned below orb center */}
      <div
        style={{
          position: "absolute",
          top: "calc(50% + 160px)",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          zIndex: 5,
        }}
      >
        <p
          style={{
            fontSize: "18px",
            color: textColor,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 300,
            margin: 0,
            textTransform: "lowercase",
            textAlign: "center",
            minHeight: "24px",
            letterSpacing: "0.25em",
          }}
        >
          {labels[phaseIndex]}
        </p>

        {/* Science fact */}
        <p
          style={{
            fontSize: "12px",
            color: textColor,
            fontFamily: "'Nunito', sans-serif",
            fontStyle: "italic",
            fontWeight: 300,
            textAlign: "center",
            maxWidth: "270px",
            lineHeight: 1.9,
            margin: 0,
          }}
        >
          {technique.science}
        </p>
      </div>

      {/* Bottom: Progress bar + done button */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          zIndex: 10,
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            width: "120px",
            height: "1px",
            background: textColor,
              opacity: 0.15,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              background: textColor,
              opacity: 0.5,
              width: `${progress * 100}%`,
            }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Done button */}
        <button
          onClick={onDone}
          style={{
            fontSize: "11px",
            color: textColor,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 300,
            letterSpacing: "0.2em",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "opacity 700ms",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.6")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          · done ·
        </button>
      </div>
    </motion.div>
  );
}