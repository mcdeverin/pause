import { useEffect, useRef } from "react";

const LIGHT_COLORS = {
  center: "#5B8DB8",
  edge: "#8FAF8F",
};

const DARK_COLORS = {
  center: "#7B6BA8",
  edge: "#2E5D8E",
};

export default function SoftBreathingOrb({ breathScale, theme }) {
  const svgRef = useRef(null);

  const colors = theme === "dark" ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const container = svg.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);

    const centerX = w / 2;
    const centerY = h / 2;
    const baseRadius = Math.min(w, h) * 0.15;
    const radius = baseRadius * breathScale;

    // Update gradient
    const gradient = svg.querySelector("#breathGradient");
    if (gradient) {
      gradient.querySelector(".center-stop").setAttribute("stop-color", colors.center);
      gradient.querySelector(".edge-stop").setAttribute("stop-color", colors.edge);
    }

    // Update circle
    const circle = svg.querySelector("#breathCircle");
    if (circle) {
      circle.setAttribute("cx", centerX);
      circle.setAttribute("cy", centerY);
      circle.setAttribute("r", radius);
    }

    // Handle window resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breathScale, colors]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0"
      style={{
        filter: "drop-shadow(0 0 40px rgba(0, 0, 0, 0.08))",
      }}
    >
      <defs>
        <radialGradient id="breathGradient">
          <stop offset="0%" className="center-stop" stopColor={colors.center} stopOpacity="0.8" />
          <stop offset="70%" className="edge-stop" stopColor={colors.edge} stopOpacity="0.4" />
          <stop offset="100%" stopColor={colors.edge} stopOpacity="0" />
        </radialGradient>
        <filter id="softBlur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
        </filter>
      </defs>
      <circle
        id="breathCircle"
        fill="url(#breathGradient)"
        filter="url(#softBlur)"
        style={{
          transition: "r 0.05s linear",
        }}
      />
    </svg>
  );
}