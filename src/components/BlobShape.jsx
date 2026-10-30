import { useMemo } from "react";

// Organic blob outline drawn as a real curve, so no edge can render as a straight cut.
const BLOB_PATH =
  "M100,14 C132,10 168,30 182,64 C196,98 180,140 148,166 C116,192 68,190 40,164 C12,138 6,92 26,60 C46,28 68,18 100,14 Z";

let idCounter = 0;

export default function BlobShape({ theme = "day", animate = true }) {
  const isDayTheme = theme === "day";
  const gradientId = useMemo(() => `orb-grad-${++idCounter}`, []);

  return (
    <svg
      className={animate ? "liquid-blob-shape" : undefined}
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="35%" r="78%">
          {isDayTheme ? (
            <>
              <stop offset="0%" stopColor="#4A7FA6" />
              <stop offset="100%" stopColor="#6BA888" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#4A5B8C" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#9B8EC4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#9B8EC4" stopOpacity="0.5" />
            </>
          )}
        </radialGradient>
      </defs>
      <path d={BLOB_PATH} fill={`url(#${gradientId})`} />
    </svg>
  );
}