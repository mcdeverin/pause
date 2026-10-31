import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileText, Mail, ShieldCheck, X } from "lucide-react";
import { FONT, getColors } from "../lib/design";
import PreferenceToggle from "./personalize/PreferenceToggle";
import { isAnalyticsEnabled, setAnalyticsEnabled } from "../lib/analytics";

const PRIVACY_URL = "https://alwayspause.com/privacy";
const TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
const SUPPORT_EMAIL = "hello@alwayspause.com";

function InfoRow({ icon: Icon, label, onClick, theme }) {
  const colors = getColors(theme);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        minHeight: 48,
        padding: "10px 14px",
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        background: "transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: FONT,
        fontSize: "16px",
        fontWeight: 600,
        color: colors.text,
        marginBottom: 8,
      }}
    >
      <Icon size={19} strokeWidth={2.1} color={colors.accent} />
      <span style={{ flex: 1 }}>{label}</span>
      <ExternalLink size={15} strokeWidth={2.1} color={colors.tertiary} />
    </button>
  );
}

function SectionLabel({ children, theme }) {
  const colors = getColors(theme);
  return (
    <p
      style={{
        margin: "24px 0 10px",
        fontFamily: FONT,
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: colors.tertiary,
      }}
    >
      {children}
    </p>
  );
}

export default function AboutLegalSheet({ theme, onClose }) {
  const colors = getColors(theme);
  // Off unless the person has turned it on before. The choice is stored on the
  // device and applied immediately — switching it off clears the analytics
  // client and any identifiers it created.
  const [shareUsage, setShareUsage] = useState(isAnalyticsEnabled);

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: colors.scrim,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label="About Always Pause"
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 48, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          background: colors.sheet,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "18px 22px calc(env(safe-area-inset-bottom, 20px) + 26px)",
          boxSizing: "border-box",
          boxShadow: "0 -10px 44px rgba(0, 0, 0, 0.20)",
          fontFamily: FONT,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span
            style={{
              fontSize: "15px",
              fontWeight: 800,
              letterSpacing: "0.01em",
              color: colors.secondary,
            }}
          >
            always pause.
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close about"
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: colors.secondary,
              flexShrink: 0,
            }}
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>

        <h2 style={{ margin: "2px 0 0", fontSize: "25px", fontWeight: 800, color: colors.text, letterSpacing: "-0.01em" }}>
          About Always Pause
        </h2>

        <p style={{ margin: "10px 0 0", fontSize: "15px", fontWeight: 700, color: colors.text, lineHeight: 1.5 }}>
          A moment for whatever life brings.
        </p>

        <p style={{ margin: "8px 0 0", fontSize: "15px", fontWeight: 500, color: colors.secondary, lineHeight: 1.6 }}>
          Always Pause is a simple breathing companion for real life. Whether you're feeling overwhelmed,
          finding your focus, or taking a break, a moment to breathe is always within reach.
        </p>

        <SectionLabel theme={theme}>Privacy</SectionLabel>
        <PreferenceToggle
          theme={theme}
          label="Share anonymous usage"
          description="Sends anonymous counts of the visuals, backgrounds and techniques you use. Never your photos, exact colours, or identity. Off by default."
          checked={shareUsage}
          onChange={(value) => {
            setShareUsage(value);
            setAnalyticsEnabled(value);
          }}
        />

        <SectionLabel theme={theme}>Legal</SectionLabel>
        <InfoRow
          theme={theme}
          icon={ShieldCheck}
          label="Privacy Policy"
          onClick={() => window.open(PRIVACY_URL, "_blank")}
        />
        <InfoRow
          theme={theme}
          icon={FileText}
          label="Terms of Use"
          onClick={() => window.open(TERMS_URL, "_blank")}
        />

        <SectionLabel theme={theme}>Support</SectionLabel>
        <InfoRow
          theme={theme}
          icon={Mail}
          label="Contact Support"
          onClick={() => window.open(`mailto:${SUPPORT_EMAIL}`, "_blank")}
        />

      </motion.div>
    </motion.div>
  );
}