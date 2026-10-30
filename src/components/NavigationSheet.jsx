import { motion } from "framer-motion";
import {
  Crosshair,
  FileText,
  Flame,
  Layers,
  Leaf,
  Lock,
  Moon,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { FONT, getColors } from "../lib/design";

const CATEGORIES = [
  { id: "All", label: "All", icon: Layers },
  { id: "Calm", label: "Calm", icon: Leaf },
  { id: "Sleep", label: "Sleep", icon: Moon },
  { id: "Focus", label: "Focus", icon: Crosshair },
  { id: "Energy", label: "Energy", icon: Zap },
  { id: "Advanced", label: "Advanced", icon: Flame },
];

const LOCKED_CATEGORIES = ["Focus", "Energy", "Advanced"];

function SheetRow({ icon: Icon, label, onClick, active, locked, muted, accent, theme, trailing }) {
  const colors = getColors(theme);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        minHeight: 48,
        padding: "10px 14px",
        borderRadius: 14,
        border: "none",
        background: active ? colors.accentSoft : "transparent",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: FONT,
        fontSize: "16px",
        fontWeight: active ? 700 : 600,
        color: muted ? colors.tertiary : accent ? colors.accent : colors.text,
      }}
    >
      <Icon size={19} strokeWidth={2.1} color={active || accent ? colors.accent : colors.tertiary} />
      <span style={{ flex: 1 }}>{label}</span>
      {locked && <Lock size={15} color={colors.tertiary} />}
      {trailing}
    </button>
  );
}

export default function NavigationSheet({
  theme,
  selectedCategory,
  onCategoryChange,
  isPro,
  onLockedCategoryTap,
  onToggleTheme,
  onOpenPersonalize,
  onOpenPausePlus,
  onClose,
}) {
  const colors = getColors(theme);

  const handleCategory = (id) => {
    const locked = !isPro && LOCKED_CATEGORIES.includes(id);
    onClose();
    if (locked) {
      if (onLockedCategoryTap) onLockedCategoryTap(id);
      return;
    }
    onCategoryChange(id);
  };

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        background: colors.scrim,
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.nav
        role="dialog"
        aria-label="Menu"
        onClick={(event) => event.stopPropagation()}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(88vw, 372px)",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          paddingTop: "calc(env(safe-area-inset-top, 44px) + 10px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 20px) + 12px)",
          background: colors.sheet,
          boxShadow: "-14px 0 44px rgba(0, 0, 0, 0.20)",
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px 6px 20px",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              color: colors.text,
            }}
          >
            PAUSE
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
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
            }}
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px" }}>
          <p
            style={{
              margin: "10px 14px 6px",
              fontSize: "12.5px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: colors.tertiary,
            }}
          >
            Breathing
          </p>

          {CATEGORIES.map((category) => (
            <SheetRow
              key={category.id}
              theme={theme}
              icon={category.icon}
              label={category.label}
              active={selectedCategory === category.id}
              locked={!isPro && LOCKED_CATEGORIES.includes(category.id)}
              onClick={() => handleCategory(category.id)}
            />
          ))}

          <div style={{ height: 1, margin: "12px 14px", background: colors.border }} />

          <SheetRow
            theme={theme}
            icon={SlidersHorizontal}
            label="Personalize Pause"
            onClick={() => {
              onClose();
              onOpenPersonalize();
            }}
          />

          <SheetRow
            theme={theme}
            icon={theme === "day" ? Sun : Moon}
            label={theme === "day" ? "Light appearance" : "Dark appearance"}
            onClick={onToggleTheme}
            trailing={
              <span style={{ fontSize: "13px", fontWeight: 600, color: colors.tertiary }}>
                {theme === "day" ? "tap for dark" : "tap for light"}
              </span>
            }
          />

          <SheetRow
            theme={theme}
            icon={ShieldCheck}
            label="Privacy"
            onClick={() => window.open("https://alwayspause.com/privacy", "_blank")}
          />

          <SheetRow
            theme={theme}
            icon={FileText}
            label="Terms"
            onClick={() =>
              window.open(
                "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
                "_blank"
              )
            }
          />

          <div style={{ height: 1, margin: "12px 14px", background: colors.border }} />

          <SheetRow
            theme={theme}
            icon={Sparkles}
            label={isPro ? "Pause+ · manage" : "Unlock Pause+"}
            accent={!isPro}
            onClick={() => {
              onClose();
              onOpenPausePlus();
            }}
          />
        </div>
      </motion.nav>
    </motion.div>
  );
}