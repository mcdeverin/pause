import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";
import LiquidOrb from "./LiquidOrb";
import { getOfferings, purchasePackage, restorePurchases, checkEntitlement } from '../lib/revenuecat';

export default function PaywallScreen({ theme = "day", onClose, onPurchase, triggerCategory }) {
  const [selected, setSelected] = useState("com.workondeck.alwayspause.annual");
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getOfferings().then(o => {
      setOfferings(o);
      console.log('DEFAULT OFFERING:', JSON.stringify(o?.all?.default));
    }).catch(console.error);
  }, []);

  const isDayTheme = theme === "day";
  const textColor = isDayTheme ? "#111111" : "#F0EDE8";
  const bg = isDayTheme ? "#FAFAF8" : "#0D1117";
  const glassBackground = isDayTheme ? "rgba(255,255,255,0.55)" : "rgba(20,30,50,0.7)";
  const glassBorder = isDayTheme ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)";
  const primaryColor = isDayTheme ? "#4A7FA6" : "#4A5B9C";
  const primaryTint = isDayTheme ? "rgba(74,127,166,0.07)" : "rgba(74,91,156,0.12)";
  const primaryBorder = primaryColor;
  const lifetimeBorder = isDayTheme ? "rgba(210,185,160,0.55)" : "rgba(210,185,160,0.3)";

  const ctaLabel = () => {
    if (loading) return '· processing ·';
    if (selected === "alwayspause_lifetime") return 'get pause+ forever';
    return 'start 7-day free trial';
  };

  const disclosureText = () => {
    if (selected === "alwayspause_lifetime") return 'one-time purchase. yours forever.';
    if (selected === "com.workondeck.alwayspause.monthly") return '7 days free, then $4.99/month. auto-renews monthly until canceled. cancel anytime in Settings.';
    return '7 days free, then $29.99/year. auto-renews yearly until canceled. cancel anytime in Settings.';
  };

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const freshOfferings = await getOfferings();
      const defaultOffering = freshOfferings?.all?.default;
      const packages = defaultOffering?.availablePackages;

      console.log('packages:', JSON.stringify(packages?.map(p => ({
        identifier: p.identifier,
        productId: p.product?.identifier
      }))));

      const pkg = packages?.find(
        p => p.product?.identifier === selected
      );

      console.log('selected:', selected);
      console.log('found pkg:', pkg?.identifier);

      if (!pkg) throw new Error('Package not found: ' + selected);

      await purchasePackage(pkg);
      const isPro = await checkEntitlement();
      if (isPro) onPurchase(selected);
      else setError('purchase completed but entitlement not found.');
    } catch (e) {
      console.log('PURCHASE ERROR:', JSON.stringify(e));
      if (!e.userCancelled) {
        setError('purchase failed. please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setError(null);
    try {
      await restorePurchases();
      const isPro = await checkEntitlement();
      if (isPro) onPurchase('restored');
      else setError('no previous purchase found.');
    } catch (e) {
      setError('restore failed. please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PricePill = ({ id, label, sublabel, badge, isLifetime }) => {
    const isSelected = selected === id;
    const selectedBg = isSelected ? primaryTint : glassBackground;
    const unselectedBorder = isLifetime
      ? lifetimeBorder
      : glassBorder;
    const selectedBorder = isSelected ? primaryBorder : unselectedBorder;
    return (
      <button
        onClick={() => setSelected(id)}
        style={{
          background: selectedBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${selectedBorder}`,
          borderRadius: "50px",
          padding: "13px 24px",
          cursor: "pointer",
          fontFamily: "'Comfortaa', sans-serif",
          fontSize: "12px",
          fontWeight: 300,
          letterSpacing: "0.15em",
          color: textColor,
          opacity: isSelected ? 1 : 0.55,
          transition: "all 0.25s ease",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <span style={{ flex: 1, textAlign: "center" }}>
          <span style={{ display: "block" }}>{label}</span>
          {sublabel && (
            <span style={{ display: "block", fontSize: "10px", opacity: 0.6, letterSpacing: "0.1em", marginTop: "2px" }}>{sublabel}</span>
          )}
        </span>
        {badge && (
          <span style={{
            fontSize: "8px",
            letterSpacing: "0.12em",
            color: primaryColor,
            opacity: 0.85,
            whiteSpace: "nowrap",
            fontWeight: 300,
            flexShrink: 0,
          }}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
    <style>{`
      .paywall-scroll::-webkit-scrollbar { display: none; }
      .paywall-scroll { overflow-y: auto !important; }
      html, body { overflow: visible !important; }
    `}</style>
    <motion.div
      className="paywall-scroll"
      style={{
        position: "fixed",
        inset: 0,
        background: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        zIndex: 50,
        paddingTop: "env(safe-area-inset-top, 44px)",
        paddingBottom: "env(safe-area-inset-bottom, 34px)",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 44px) + 16px)",
          right: "20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          opacity: 0.28,
          padding: "4px",
          fontFamily: "'Comfortaa', sans-serif",
          fontSize: "9px",
          letterSpacing: "0.22em",
          fontWeight: 300,
          color: textColor,
          transition: "opacity 0.2s",
          textTransform: "lowercase",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.55")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.28")}
      >
        close
      </button>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0px",
          width: "100%",
          maxWidth: "320px",
          padding: "0 28px",
          boxSizing: "border-box",
          justifyContent: "center",
        }}
      >
        {/* Orb */}
        <div style={{ marginBottom: "14px", marginTop: "32px" }}>
          <LiquidOrb theme={theme} isBreathing={false} size={100} />
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: "4px" }}>
          <p
            style={{
              fontSize: "18px",
              letterSpacing: "0.35em",
              fontWeight: 300,
              color: textColor,
              fontFamily: "'Comfortaa', sans-serif",
              margin: "0 0 8px 0",
            }}
          >
            go deeper with pause+
          </p>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.18em",
              fontWeight: 300,
              color: textColor,
              opacity: 0.5,
              fontFamily: "'Comfortaa', sans-serif",
              margin: "0 0 5px 0",
              lineHeight: 1.6,
            }}
          >
            box, 4-7-8, coherence, physiological sigh.
          </p>
          <p
            style={{
              fontSize: "10px",
              letterSpacing: "0.16em",
              fontWeight: 300,
              color: textColor,
              opacity: 0.35,
              fontFamily: "'Comfortaa', sans-serif",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            for focus, energy, and hard moments.
          </p>
        </div>

        {/* Subscription group */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
            marginTop: "18px",
          }}
        >
          {/* Best value label */}
          <div style={{ textAlign: "center", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.25em",
                fontWeight: 300,
                color: primaryColor,
                fontFamily: "'Comfortaa', sans-serif",
                opacity: 0.8,
                textTransform: "lowercase",
              }}
            >
              · best value ·
            </span>
          </div>
          <PricePill
            id="com.workondeck.alwayspause.annual"
            label="· $29.99 / year · 7 days free ·"
            sublabel="$2.50 / month, billed annually"
            badge="save 50%"
          />
          <PricePill
            id="com.workondeck.alwayspause.monthly"
            label="· $4.99 / month · 7 days free ·"
            sublabel="billed monthly"
          />
        </div>

        {/* Forever option */}
        <div
          style={{
            width: "100%",
            marginTop: "14px",
            paddingTop: "14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.25em",
                fontWeight: 300,
                color: textColor,
                fontFamily: "'Comfortaa', sans-serif",
                opacity: 0.35,
                textTransform: "lowercase",
              }}
            >
              · · ·
            </span>
          </div>
          <PricePill
            id="alwayspause_lifetime"
            label="· $49.99 · forever ·"
            sublabel="no subscription · yours forever"
            isLifetime
          />
        </div>

        {/* Tier-aware disclosure */}
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.08em",
            fontWeight: 300,
            color: textColor,
            opacity: 0.3,
            fontFamily: "'Comfortaa', sans-serif",
            textAlign: "center",
            margin: "20px 0 0 0",
            lineHeight: 1.6,
          }}
        >
          {disclosureText()}
        </p>

        {/* CTA Button */}
        <button
          onClick={handlePurchase}
          style={{
            width: "100%",
            marginTop: "28px",
            background: isDayTheme
              ? "linear-gradient(135deg, #5C8FAF 0%, #7DB898 100%)"
              : "linear-gradient(135deg, #5A6BAA 0%, #7DB898 100%)",
            border: "none",
            borderRadius: "50px",
            padding: "16px 24px 14px 24px",
            cursor: "pointer",
            fontFamily: "'Comfortaa', sans-serif",
            fontSize: "12px",
            fontWeight: 300,
            letterSpacing: "0.2em",
            color: isDayTheme ? "#FAFAF8" : "#F0EDE8",
            textAlign: "center",
            boxSizing: "border-box",
            transition: "opacity 0.2s",
          }}
          disabled={loading}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {ctaLabel()}
        </button>

        {/* Bottom row: restore + privacy + terms */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "18px",
            marginTop: "14px",
            marginBottom: "32px",
          }}
        >
          {[
            { label: "Restore", action: handleRestore },
            { label: "Privacy", action: () => { onClose(); navigate("/privacy"); } },
            { label: "Terms", action: () => { onClose(); navigate("/terms"); } },
          ].map(({ label, action }, i, arr) => (
            <>
              <button
                key={label}
                onClick={action}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Comfortaa', sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  fontWeight: 300,
                  color: textColor,
                  opacity: 0.3,
                  padding: 0,
                }}
              >
                {label}
              </button>
              {i < arr.length - 1 && (
                <span key={label + "-sep"} style={{ color: textColor, opacity: 0.2, fontSize: "10px" }}>·</span>
              )}
            </>
          ))}
        </div>

        {error && (
          <p style={{
            fontSize: '10px',
            color: '#ff6b6b',
            opacity: 0.8,
            fontFamily: 'Comfortaa',
            letterSpacing: '0.1em',
            marginTop: '4px',
            textAlign: 'center',
          }}>
            {error}
          </p>
        )}
      </div>
    </motion.div>
    </>
  );
}