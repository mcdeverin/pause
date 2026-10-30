import { FONT, getColors } from "../../lib/design";
import { MOMENTS } from "../../lib/moments";

export default function MomentBars({ theme, byMoment, quick }) {
  const colors = getColors(theme);
  const highest = Math.max(1, ...MOMENTS.map((moment) => byMoment[moment.id] || 0));

  return (
    <div>
      <p style={{ margin: 0, fontFamily: FONT, fontSize: "15px", fontWeight: 700, color: colors.text }}>
        What brought you here
      </p>

      <div style={{ marginTop: 12 }}>
        {MOMENTS.map((moment) => {
          const count = byMoment[moment.id] || 0;
          const width = count === 0 ? 0 : Math.max(6, (count / highest) * 100);
          return (
            <div
              key={moment.id}
              style={{
                display: "grid",
                gridTemplateColumns: "88px 1fr 26px",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 600, color: colors.secondary }}>
                {moment.label}
              </span>
              <span
                style={{
                  display: "block",
                  height: 8,
                  borderRadius: 999,
                  background: colors.track,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${width}%`,
                    borderRadius: 999,
                    background: colors.momentInk[moment.id],
                  }}
                />
              </span>
              <span
                className="tnum"
                style={{
                  fontFamily: FONT,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: colors.text,
                  textAlign: "right",
                }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {quick > 0 && (
        <p style={{ margin: "2px 0 0", fontFamily: FONT, fontSize: "12px", fontWeight: 600, color: colors.tertiary, lineHeight: 1.5 }}>
          Plus {quick} quick {quick === 1 ? "pause" : "pauses"} started straight from the orb.
        </p>
      )}
    </div>
  );
}