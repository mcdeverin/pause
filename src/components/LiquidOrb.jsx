export default function LiquidOrb({ theme, countdown, orbScale, size = 260 }) {
  const isDayTheme = theme === "day";
  const baseSize = size;
  const scaledSize = baseSize * orbScale;

  const dayGradient = "radial-gradient(circle at 35% 35%, rgba(91, 141, 184, 0.9) 0%, rgba(143, 175, 143, 0.7) 60%, rgba(143, 175, 143, 0.5) 100%)";
  const nightGradient = "radial-gradient(circle at 35% 35%, rgba(74, 91, 140, 0.9) 0%, rgba(155, 142, 196, 0.7) 60%, rgba(155, 142, 196, 0.5) 100%)";

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
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
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
            width: `${scaledSize}px`,
            height: `${scaledSize}px`,
            background: isDayTheme ? dayGradient : nightGradient,
            boxShadow: isDayTheme
              ? "0 0 60px rgba(91, 141, 184, 0.25), inset 0 0 40px rgba(255, 255, 255, 0.1)"
              : "0 0 60px rgba(74, 91, 140, 0.25), inset 0 0 40px rgba(255, 255, 255, 0.05)",
            filter: isDayTheme
              ? "drop-shadow(0 0 30px rgba(143, 175, 143, 0.15))"
              : "drop-shadow(0 0 30px rgba(155, 142, 196, 0.15))",
          }}
        />

        {/* Countdown number */}
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
      </div>
    </>
  );
}