import { useState } from "react";
import { FONT, getColors } from "../../lib/design";

const CELL = 26;
const GAP = 6;

export default function ActivityGrid({ theme, weeks, caption }) {
  const colors = getColors(theme);
  const [selectedKey, setSelectedKey] = useState(null);

  const days = weeks.flat().filter(Boolean);
  const fallbackKey = days.length > 0 ? days[days.length - 1].key : null;
  const activeKey = selectedKey && days.some((day) => day.key === selectedKey) ? selectedKey : fallbackKey;
  const activeDay = days.find((day) => day.key === activeKey);

  const heatColor = (count) =>
    count === 0 ? colors.heatEmpty : colors.heat[Math.min(count - 1, colors.heat.length - 1)];

  return (
    <div>
      <p style={{ margin: 0, fontFamily: FONT, fontSize: "15px", fontWeight: 700, color: colors.text }}>
        Your activity
      </p>
      <p style={{ margin: "4px 0 12px", fontFamily: FONT, fontSize: "12.5px", fontWeight: 500, color: colors.tertiary, lineHeight: 1.5 }}>
        {caption}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${CELL}px)`, gap: GAP }}>
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            if (!day) {
              return <span key={`empty-${weekIndex}-${dayIndex}`} style={{ width: CELL, height: CELL }} />;
            }
            const isActive = day.key === activeKey;
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedKey(day.key)}
                aria-pressed={isActive}
                aria-label={`${day.date.toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                })}: ${day.count} ${day.count === 1 ? "pause" : "pauses"}`}
                style={{
                  width: CELL,
                  height: CELL,
                  padding: 0,
                  borderRadius: 7,
                  cursor: "pointer",
                  background: heatColor(day.count),
                  border: isActive ? `2px solid ${colors.accent}` : "2px solid transparent",
                }}
              />
            );
          })
        )}
      </div>

      {activeDay && (
        <p
          style={{
            margin: "10px 0 0",
            fontFamily: FONT,
            fontSize: "12.5px",
            fontWeight: 600,
            color: colors.secondary,
          }}
        >
          {activeDay.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
          {activeDay.count === 0
            ? "No pauses"
            : `${activeDay.count} ${activeDay.count === 1 ? "pause" : "pauses"}`}
        </p>
      )}
    </div>
  );
}