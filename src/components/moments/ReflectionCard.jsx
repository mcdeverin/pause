import { Leaf } from "lucide-react";
import { FONT, getColors } from "../../lib/design";

export default function ReflectionCard({ theme, text }) {
  const colors = getColors(theme);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        marginTop: 18,
        padding: "14px 16px",
        borderRadius: 16,
        background: colors.sage,
        border: `1px solid ${colors.sageBorder}`,
      }}
    >
      <Leaf size={17} strokeWidth={2.2} color={colors.accent} style={{ flexShrink: 0, marginTop: 1 }} />
      <p
        style={{
          margin: 0,
          fontFamily: FONT,
          fontSize: "14px",
          fontWeight: 600,
          color: colors.text,
          lineHeight: 1.55,
        }}
      >
        {text}
      </p>
    </div>
  );
}