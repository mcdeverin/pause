import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LiquidOrb from "./LiquidOrb";
import { getOfferings, purchasePackage, restorePurchases, checkEntitlement } from '../lib/revenuecat';
import { PRODUCT_IDS, getLocalizedPrice, formatDailyPrice } from '../lib/pricing';

const FONT = "'Poppins', sans-serif";

export default function PaywallScreen({ theme = "day", onClose, onPurchase, triggerCategory }) {
  const [selected, setSelected] = useState(PRODUCT_IDS.annual);
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Localized store prices — display only.
  const annualPrice = getLocalizedPrice(offerings, "annual");
  const monthlyPrice = getLocalizedPrice(offerings, "monthly");
  const lifetimePrice = getLocalizedPrice(offerings, "lifetime");
  const annualDaily = formatDailyPrice(annualPrice, "annual");
  const monthlyDaily = formatDailyPrice(monthlyPrice, "monthly");

  const ctaLabel = () => {
    if (loading) return '· processing ·';
    if (selected === PRODUCT_IDS.lifetime) return 'get pause+ forever';
    return 'start 7-day free trial';
  };

  const disclosureText = () => {
    if (selected === PRODUCT_IDS.lifetime) return 'one-time purchase · yours forever · no subscription.';
    if (selected === PRODUCT_IDS.monthly) return '7 days free, then $4.99/month. auto-renews until canceled. cancel anytime in Settings.';
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

  const TierPill = ({ id, label, caption, amount, unit, secondary, badge, isLifetime }) => {
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
          padding: "15px 18px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          opacity: 1,
          transition: "all 0.22s ease",
          textAlign: "left",
        }}
      >
        {/* Left: plan name + badge + trial caption */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: FONT,
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.01em",
              color: textColor,
              lineHeight: 1.3,
            }}>
              {label}
            </span>
            {badge && (
              <span style={{
                fontFamily: FONT,
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.03em",
                color: primaryColor,
                border: `1px solid ${primaryColor}`,
                borderRadius: "100px",
                padding: "2px 6px",
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
              fontFamily: FONT,
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.005em",
              color: textColor,
              opacity: 0.62,
              lineHeight: 1.45,
            }}>
              {caption}
            </span>
          )}
        </div>

        {/* Right: daily equivalent + billed amount */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "2px",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: FONT,
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: textColor,
            whiteSpace: "nowrap",
            lineHeight: 1.15,
          }}>
            {amount}
            {unit && (
              <span style={{ fontSize: "11px", fontWeight: 600, opacity: 0.6, letterSpacing: "0" }}>
                {unit}
              </span>
            )}
          </span>
          <span style={{
            fontFamily: FONT,
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.005em",
            color: textColor,
            opacity: 0.62,
            whiteSpace: "nowrap",
            lineHeight: 1.3,
          }}>
            {secondary}
          </span>
        </div>
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
            opacity: 0.4,
            padding: "4px",
            fontFamily: FONT,
            fontSize: "11px",
            letterSpacing: "0.06em",
            fontWeight: 600,
            color: textColor,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
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
            maxWidth: "340px",
            padding: "0 22px",
            boxSizing: "border-box",
            marginTop: "28px",
          }}
        >
          {/* 1. Orb */}
          <LiquidOrb theme={theme} isBreathing={false} size={100} />

          {/* 32pt gap */}
          <div style={{ height: "30px" }} />

          {/* 2. Headline */}
          <p style={{
            fontFamily: FONT,
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "-0.015em",
            color: textColor,
            margin: 0,
            textAlign: "center",
            lineHeight: 1.25,
          }}>
            unlock all of pause+
          </p>

          {/* 20pt gap */}
          <div style={{ height: "14px" }} />

          {/* 3. Subhead */}
          <p style={{
            fontFamily: FONT,
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.005em",
            color: textColor,
            opacity: 0.62,
            margin: 0,
            textAlign: "center",
            lineHeight: 1.6,
          }}>
            box, 4-7-8, coherence, physiological sigh, and more.{" "}
            for focus, energy, and the hardest moments.
          </p>

          {/* 32pt gap */}
          <div style={{ height: "32px" }} />

          {/* 4. Yearly pill */}
          <div style={{ width: "100%" }}>
            <TierPill
              id={PRODUCT_IDS.annual}
              label="yearly"
              caption="7-day free trial"
              amount={annualDaily || annualPrice}
              unit="/day"
              secondary={`${annualPrice} billed annually`}
              badge="save 50%"
            />
          </div>

          {/* 12pt gap */}
          <div style={{ height: "12px" }} />

          {/* 5. Monthly pill */}
          <div style={{ width: "100%" }}>
            <TierPill
              id={PRODUCT_IDS.monthly}
              label="monthly"
              caption="7-day free trial"
              amount={monthlyDaily || monthlyPrice}
              unit="/day"
              secondary={`${monthlyPrice} billed monthly`}
            />
          </div>

          {/* 12pt gap */}
          <div style={{ height: "12px" }} />

          {/* 6. Forever pill */}
          <div style={{ width: "100%" }}>
            <TierPill
              id={PRODUCT_IDS.lifetime}
              label="forever"
              caption="yours to keep"
              amount={lifetimePrice}
              secondary="One-time purchase"
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
              padding: "16px 24px 15px 24px",
              cursor: "pointer",
              fontFamily: FONT,
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.01em",
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
            fontFamily: FONT,
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.005em",
            color: textColor,
            opacity: 0.55,
            margin: 0,
            textAlign: "center",
            lineHeight: 1.6,
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
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "32px",
          }}>
            {[
              { label: "restore", action: handleRestore },
              { label: "terms", action: () => window.open("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/", "_blank") },
              { label: "privacy", action: () => window.open("https://alwayspause.com/privacy", "_blank") },
            ].map(({ label, action }, i, arr) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={action}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: FONT,
                    fontSize: "11px",
                    letterSpacing: "0.01em",
                    fontWeight: 600,
                    color: textColor,
                    opacity: 0.55,
                    padding: 0,
                  }}
                >
                  {label}
                </button>
                {i < arr.length - 1 && (
                  <span style={{ color: textColor, opacity: 0.3, fontSize: "11px" }}>·</span>
                )}
              </span>
            ))}
          </div>

          {error && (
            <p style={{
              fontSize: '12px',
              color: '#ff6b6b',
              opacity: 0.9,
              fontFamily: FONT,
              fontWeight: 500,
              letterSpacing: '0.005em',
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