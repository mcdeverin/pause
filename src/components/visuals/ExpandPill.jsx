import React from "react";

// Shared translucent full-screen control for every sensory experience.
export default function ExpandPill({ expanded, onClick, label = "sensory experience" }) {
  return (
    <button type="button" onClick={onClick}
      aria-label={expanded ? "Exit full screen" : `Expand ${label} to full screen`}
      title={expanded ? "Exit full screen" : "Full screen"}
      style={{ position: "absolute", top: 16, right: 16, zIndex: 10,
        width: 46, height: 46, display: "grid", placeItems: "center",
        border: "1px solid rgba(255,255,255,.48)", borderRadius: 16,
        background: "rgba(250,250,252,.78)", color: "#85858d",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 2px 14px rgba(0,0,0,.09)", cursor: "pointer",
        padding: 0 }}>
      <svg width="30" height="30" viewBox="0 0 34 34" fill="none"
        stroke="currentColor" strokeWidth="3.5" strokeLinecap="square"
        strokeLinejoin="miter" aria-hidden="true">
        {expanded
          ? <path d="M31 13 H21 V3 M3 21 H13 V31" />
          : <path d="M21 3 H31 V13 M13 31 H3 V21" />}
      </svg>
    </button>
  );
}
