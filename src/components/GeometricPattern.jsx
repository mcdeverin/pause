export default function GeometricPattern({ theme = "light" }) {
  const bgColor = theme === "light" ? "#F7F5F2" : "#0D1B2A";
  const patternColor = theme === "light" ? "rgba(91, 141, 184, 0.08)" : "rgba(123, 107, 168, 0.12)";
  
  return (
    <div
      className="absolute inset-0"
      style={{
        background: bgColor,
        backgroundImage: `
          linear-gradient(45deg, ${patternColor} 1px, transparent 1px),
          linear-gradient(-45deg, ${patternColor} 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        backgroundPosition: "0 0, 30px 30px",
      }}
    />
  );
}