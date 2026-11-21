import { useState } from "react";
import { Link } from "react-router-dom";
import { getAnalyticsChoice, setAnalyticsEnabled } from "@/lib/analytics";
import { isWebsite } from "@/lib/googleTag";
import { FONT, PAUSE } from "@/lib/design";

// Website-only consent prompt. Shown once, until the visitor chooses; the
// choice can be changed any time with "Share anonymous usage" in About.
// Sits at the top so it never covers onboarding or the breathing controls,
// and the app stays fully usable without answering it.
export default function AnalyticsConsentBanner() {
  const [visible, setVisible] = useState(() => isWebsite() && getAnalyticsChoice() === null);
  if (!visible) return null;

  const choose = (allow) => {
    setAnalyticsEnabled(allow);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Analytics choice"
      style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top, 0px) + 10px)",
        left: 12,
        right: 12,
        zIndex: 1000,
        maxWidth: 520,
        margin: "0 auto",
        padding: "14px 16px",
        borderRadius: 18,
        background: "rgba(255,255,255,.96)",
        boxShadow: "0 10px 30px rgba(20,30,28,.18)",
        color: PAUSE.ink,
        fontFamily: FONT,
        fontSize: 14,
        lineHeight: 1.45,
      }}
    >
      <p style={{ margin: 0 }}>
        Can we use Google Analytics cookies to see how people find and use Always Pause?
        No ads, and we never sell data.{" "}
        <Link to="/privacy" style={{ color: PAUSE.accent, fontWeight: 600 }}>Privacy</Link>
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
        <button
          onClick={() => choose(false)}
          style={{ height: 38, padding: "0 16px", borderRadius: 999, border: "1px solid rgba(38,48,44,.18)", background: "transparent", color: PAUSE.ink, fontFamily: FONT, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          No thanks
        </button>
        <button
          onClick={() => choose(true)}
          style={{ height: 38, padding: "0 18px", borderRadius: 999, border: 0, background: PAUSE.accent, color: "#fff", fontFamily: FONT, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Allow
        </button>
      </div>
    </div>
  );
}
