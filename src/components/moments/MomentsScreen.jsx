import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { FONT, getBackgroundStyle, getColors } from "../../lib/design";
import {
  PERIODS,
  loadMoments,
  clearMoments,
  getStats,
  getActivity,
  getReflection,
  groupIntoWeeks,
  periodLabel,
} from "../../lib/moments";
import MomentsStats from "./MomentsStats";
import MomentBars from "./MomentBars";
import ReflectionCard from "./ReflectionCard";
import ActivityGrid from "./ActivityGrid";

export default function MomentsScreen({ theme = "day", background = "classic", saveEnabled = false, onClose }) {
  const colors = getColors(theme);
  const [moments, setMoments] = useState(loadMoments);
  const [period, setPeriod] = useState("month");
  const [confirming, setConfirming] = useState(false);

  const stats = useMemo(() => getStats(moments, period), [moments, period]);
  const weeks = useMemo(() => groupIntoWeeks(getActivity(moments, period)), [moments, period]);
  const reflection = getReflection(stats, period);
  const hasHistory = moments.some((record) => record.completed);

  const handleDelete = () => {
    clearMoments();
    setMoments([]);
    setConfirming(false);
  };

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 62,
        boxSizing: "border-box",
        ...getBackgroundStyle(background, theme),
        overflowY: "auto",
        fontFamily: FONT,
        paddingTop: "calc(env(safe-area-inset-top, 44px) + 6px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 24px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div style={{ width: "100%", maxWidth: 520, margin: "0 auto", padding: "0 22px", boxSizing: "border-box" }}>
        {/* Header */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 44 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            style={{
              position: "absolute",
              left: -8,
              top: 0,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: colors.text,
            }}
          >
            <ArrowLeft size={22} strokeWidth={2.2} />
          </button>
          <p style={{ margin: 0, fontSize: "17px", fontWeight: 800, letterSpacing: "0.005em", color: colors.text }}>
            Your Moments
          </p>
        </div>

        {/* Period */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 6,
            padding: 5,
            marginTop: 16,
            borderRadius: 16,
            background: colors.track,
          }}
        >
          {PERIODS.map((option) => {
            const active = period === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPeriod(option.id)}
                aria-pressed={active}
                style={{
                  minHeight: 40,
                  padding: "9px 6px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: active ? colors.sheet : "transparent",
                  color: active ? colors.text : colors.secondary,
                  fontFamily: FONT,
                  fontSize: "13.5px",
                  fontWeight: 700,
                  boxShadow: active ? "0 1px 4px rgba(0, 0, 0, 0.10)" : "none",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {hasHistory ? (
          <div style={{ marginTop: 22 }}>
            <MomentsStats theme={theme} stats={stats} label={periodLabel(period)} />

            {stats.pauses === 0 ? (
              <p
                style={{
                  margin: "20px 0 0",
                  fontFamily: FONT,
                  fontSize: "14px",
                  fontWeight: 500,
                  color: colors.secondary,
                  lineHeight: 1.6,
                }}
              >
                No saved pauses in this stretch yet. Try another time range, or take a moment and it will appear here.
              </p>
            ) : (
              <>
                <div style={{ marginTop: 26 }}>
                  <MomentBars theme={theme} byMoment={stats.byMoment} quick={stats.quick} />
                </div>
                <ReflectionCard theme={theme} text={reflection} />
                <div style={{ marginTop: 26 }}>
                  <ActivityGrid
                    theme={theme}
                    weeks={weeks}
                    caption="Each filled square is a day you took a pause."
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 26 }}>
            <p style={{ margin: 0, fontFamily: FONT, fontSize: "20px", fontWeight: 800, color: colors.text, lineHeight: 1.3 }}>
              {saveEnabled ? "No moments yet." : "Saving is off."}
            </p>
            <p style={{ margin: "8px 0 0", fontFamily: FONT, fontSize: "14.5px", fontWeight: 500, color: colors.secondary, lineHeight: 1.6 }}>
              {saveEnabled
                ? "Finish a breathing session and it will show up here, along with what you reached for. Your history stays on this device."
                : "Turn on Save My Moments in Personalize Pause to keep a private record of your pauses. Nothing is shared with anyone, and breathing works exactly the same without it."}
            </p>
          </div>
        )}

        {/* History controls */}
        <div style={{ marginTop: 30, paddingTop: 16, borderTop: `1px solid ${colors.border}` }}>
          {confirming ? (
            <div>
              <p style={{ margin: 0, fontFamily: FONT, fontSize: "14px", fontWeight: 600, color: colors.text, lineHeight: 1.55 }}>
                This removes every saved pause from this device for good.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    minHeight: 44,
                    padding: "10px 18px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    background: "#C0563F",
                    color: "#FFFFFF",
                    fontFamily: FONT,
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  style={{
                    minHeight: 44,
                    padding: "10px 18px",
                    borderRadius: 999,
                    border: `1px solid ${colors.border}`,
                    cursor: "pointer",
                    background: "transparent",
                    color: colors.text,
                    fontFamily: FONT,
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              style={{
                minHeight: 44,
                padding: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontSize: "14px",
                fontWeight: 700,
                color: colors.secondary,
                textDecoration: "underline",
              }}
            >
              Delete saved history
            </button>
          )}

          <p style={{ margin: "12px 0 0", fontFamily: FONT, fontSize: "12.5px", fontWeight: 500, color: colors.tertiary, lineHeight: 1.55 }}>
            Your moments are saved only on this device. Uninstalling the app or moving to a new device clears them.
          </p>
        </div>
      </div>
    </motion.div>
  );
}