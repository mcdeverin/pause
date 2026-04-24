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
  const glassBorder = isDayTheme ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.13)";
  const primaryColor = isDayTheme ? "#4A7FA6" : "#4A5B9C";
  const primaryTint = isDayTheme ? "rgba(74,127,166,0.07)" : "rgba(74,91,156,0.12)";
  const lifetimeBorder = isDayTheme ? "rgba(210,185,160,0.45)" : "rgba(210,185,160,0.25)";

  const ctaLabel = () => {
    if (loading) return '· processing ·';
    if (selected === "alwayspause_lifetime") return 'get pause+ forever';
    return 'start 7-day free trial';
  };

  const disclosureText = () => {
    if (selected === "alwayspause_lifetime") return 'one-time purchase · yours forever · no subscription.';
    if (selected === "com.workondeck.alwayspause.monthly") return '7 days free, then $4.99/month. auto-renews until canceled. cancel anytime in Settings.';
    return '7 days free, then $29.99/year. auto-renews until canceled. cancel anytime in Settings.';
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

      const pkg = packages?.find(p => p.product?.identifier === selected);

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

  const TierPill = ({ id, label, caption, price, badge, isLifetime }) => {
    const isSelected = selected === id;
    const border = isSelected
      ? primaryColor
      : isLifetime ? lifetimeBorder : glassBorder;
    const pillBg = isSelected ? primaryTint : glassBackground;

    return (
      <button
        onClick={() => setSelected(id)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: pillBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${border}`,
          borderRadius: "18px",
          padding: "14px 20px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          opacity: 1,
          transition: "all 0.22s ease",
          textAlign: "left",
        }}
      >
        {/* Left: label + badge + caption */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{
              fontFamily: "'Comfortaa', sans-serif",
              fontSize: "13px",
              fontWeight: 300,
              letterSpacing: "0.12em",
              color: textColor,
              opacity: 1,
            }}>
              {label}
            </span>
            {badge && (
              <span style={{
                fontFamily: "'Comfortaa', sans-serif",
                fontSize: "7px",
                fontWeight: 600,
                letterSpacing: "0.16em",
                color: primaryColor,
                border: `1px solid ${primaryColor}`,
                borderRadius: "100px",
                padding: "2px 6px",
                opacity: 1,
                textTransform: "uppercase",
                lineHeight: 1.4,
                flexShrink: 0,
              }}>
                {badge}
              </span>
            )}
          </div>
          {caption && (
            <span style={{
              fontFamily: "'Comfortaa', sans-serif",
              fontSize: "9px",
              fontWeight: 300,
              letterSpacing: "0.1em",
              color: textColor,
              opacity: 0.75,
              lineHeight: 1.4,
            }}>
              {caption}
            </span>
          )}
        </div>

        {/* Right: price */}
        <span style={{
          fontFamily: "'Comfortaa', sans-serif",
          fontSize: "17px",
          fontWeight: 300,
          letterSpacing: "0.04em",
          color: textColor,
          opacity: 1,
          flexShrink: 0,
        }}>
          {price}
        </span>
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
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.55")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.28")}
        >
          close
        </button>

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "320px",
            padding: "0 24px",
            boxSizing: "border-box",
            marginTop: "28px",
          }}
        >
          {/* 1. Orb */}
          <LiquidOrb theme={theme} isBreathing={false} size={100} />

          {/* 32pt gap */}
          <div style={{ height: "32px" }} />

          {/* 2. Headline */}
          <p style={{
            fontFamily: "'Comfortaa', sans-serif",
            fontSize: "18px",
            fontWeight: 300,
            letterSpacing: "0.3em",
            color: textColor,
            margin: 0,
            textAlign: "center",
            lineHeight: 1.4,
          }}>
            unlock all of pause+
          </p>

          {/* 20pt gap */}
          <div style={{ height: "20px" }} />

          {/* 3. Subhead */}
          <p style={{
            fontFamily: "'Comfortaa', sans-serif",
            fontSize: "11px",
            fontWeight: 300,
            letterSpacing: "0.15em",
            color: textColor,
            opacity: 0.45,
            margin: 0,
            textAlign: "center",
            lineHeight: 1.7,
          }}>
            box, 4-7-8, coherence, physiological sigh, and more.{" "}
            for focus, energy, and the hardest moments.
          </p>

          {/* 40pt gap */}
          <div style={{ height: "40px" }} />

          {/* 4. Yearly pill */}
          <div style={{ width: "100%" }}>
            <TierPill
              id="com.workondeck.alwayspause.annual"
              label="yearly"
              caption="7-day free trial · $2.50/mo billed annually"
              price="$29.99"
              badge="save 50%"
            />
          </div>

          {/* 12pt gap */}
          <div style={{ height: "12px" }} />

          {/* 5. Monthly pill */}
          <div style={{ width: "100%" }}>
            <TierPill
              id="com.workondeck.alwayspause.monthly"
              label="monthly"
              caption="7-day free trial · billed monthly"
              price="$4.99"
            />
          </div>

          {/* 12pt gap */}
          <div style={{ height: "12px" }} />

          {/* 6. Forever pill */}
          <div style={{ width: "100%" }}>
            <TierPill
              id="alwayspause_lifetime"
              label="forever"
              caption="one-time · yours to keep"
              price="$49.99"
              isLifetime
            />
          </div>

          {/* 32pt gap */}
          <div style={{ height: "32px" }} />

          {/* 7. CTA */}
          <button
            onClick={handlePurchase}
            disabled={loading}
            style={{
              width: "100%",
              background: isDayTheme
                ? "linear-gradient(135deg, #7AA8C4 0%, #96C4AE 100%)"
                : "linear-gradient(135deg, #7481B8 0%, #96C4AE 100%)",
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
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {ctaLabel()}
          </button>

          {/* 16pt gap */}
          <div style={{ height: "16px" }} />

          {/* 8. Disclosure */}
          <p style={{
            fontFamily: "'Comfortaa', sans-serif",
            fontSize: "9px",
            fontWeight: 300,
            letterSpacing: "0.08em",
            color: textColor,
            opacity: 0.28,
            margin: 0,
            textAlign: "center",
            lineHeight: 1.7,
          }}>
            {disclosureText()}
          </p>

          {/* 12pt gap */}
          <div style={{ height: "12px" }} />

          {/* 9. Bottom row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            marginBottom: "32px",
          }}>
            {[
              { label: "restore", action: handleRestore },
              { label: "terms", action: () => window.open("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/", "_blank") },
              { label: "privacy", action: () => window.open("https://alwayspause.com/privacy", "_blank") },
            ].map(({ label, action }, i, arr) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <button
                  onClick={action}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Comfortaa', sans-serif",
                    fontSize: "9px",
                    letterSpacing: "0.14em",
                    fontWeight: 300,
                    color: textColor,
                    opacity: 0.28,
                    padding: 0,
                  }}
                >
                  {label}
                </button>
                {i < arr.length - 1 && (
                  <span style={{ color: textColor, opacity: 0.18, fontSize: "9px" }}>·</span>
                )}
              </span>
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