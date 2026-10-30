import { BarChart3 } from "lucide-react";
import { FONT, getColors } from "../../lib/design";
import { formatDuration } from "../../lib/moments";

export default function MomentsStats({ theme, stats, label }) {
  const colors = getColors(theme);

  const items = [
    { value: String(stats.pauses), label: "Pauses" },
    { value: formatDuration(stats.seconds), label: "Time breathing" },
    { value: String(stats.daysUsed), label: "Days used" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontFamily: FONT, fontSize: "17px", fontWeight: 800, color: colors.text }}>
            Your Moments
          </p>
          <p style={{ margin: "3px 0 0", fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: colors.tertiary }}>
            {label}
          </p>
        </div>
        <BarChart3 size={19} strokeWidth={2.1} color={colors.tertiary} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              padding: "12px 10px",
              borderRadius: 14,
              background: colors.track,
              textAlign: "left",
            }}
          >
            <p
              className="tnum"
              style={{
                margin: 0,
                fontFamily: FONT,
                fontSize: "20px",
                fontWeight: 800,
                color: colors.text,
                letterSpacing: "-0.01em",
              }}
            >
              {item.value}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontFamily: FONT,
                fontSize: "11.5px",
                fontWeight: 700,
                color: colors.tertiary,
                lineHeight: 1.35,
              }}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}