import { useEffect, useState } from "react";
import { breathScale } from "../../lib/breathExpansion";
import loadGlassOrb from "../../lib/glassOrb";

// Liquid glass: the breath only scales it, exactly like the original orb, so both
// read at the same pace. The slow sway is decoration and never tracks breathing.
export default function GlassOrb({ breath = 0, reducedMotion = false, animate = true }) {
  const [source, setSource] = useState(null);

  useEffect(() => {
    let active = true;
    loadGlassOrb().then((value) => {
      if (active) setSource(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const scale = breathScale(breath);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: reducedMotion || !animate ? "none" : "pauseSway 16s ease-in-out infinite",
        }}
      >
        {source ? (
          <img
            src={source}
            alt=""
            aria-hidden="true"
            draggable="false"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: `scale(${scale})`,
              transition: reducedMotion ? "none" : "transform 0.12s linear",
              filter: "drop-shadow(0 10px 26px rgba(78, 108, 128, 0.22))",
              WebkitUserSelect: "none",
            }}
          />
        ) : (
          // Stands in for the artwork only while it decodes, so the space never
          // jumps and no black rectangle is ever shown.
          <div
            aria-hidden="true"
            style={{
              width: "72%",
              height: "72%",
              borderRadius: "50%",
              transform: `scale(${scale})`,
              transition: reducedMotion ? "none" : "transform 0.12s linear",
              background:
                "radial-gradient(circle at 34% 30%, #FAD9B5 0%, #D1C6F2 42%, #A5E3E0 78%, rgba(165, 227, 224, 0) 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
}