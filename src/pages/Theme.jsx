import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const THEME_COLORS = {
  light: {
    bg: "#F7F5F2",
    text: "#2C2C2C",
    secondary: "#888888",
    cardBg: "rgba(255, 255, 255, 0.4)",
    cardBorder: "rgba(91, 141, 184, 0.2)",
    activeBorder: "rgba(91, 141, 184, 0.6)",
  },
  dark: {
    bg: "#0D1B2A",
    text: "#E8E0D0",
    secondary: "#A0A0A0",
    cardBg: "rgba(255, 255, 255, 0.05)",
    cardBorder: "rgba(123, 107, 168, 0.2)",
    activeBorder: "rgba(123, 107, 168, 0.6)",
  },
};

export default function Theme() {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState("light");
  const colors = THEME_COLORS[currentTheme];

  useEffect(() => {
    const saved = localStorage.getItem("pauseTheme") || "light";
    setCurrentTheme(saved);
  }, []);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem("pauseTheme", theme);
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col"
      style={{ background: colors.bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="pt-8 px-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="p-2 transition-opacity duration-300 hover:opacity-60"
          style={{ color: colors.secondary }}
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1
          className="font-cormorant text-[18px] font-light tracking-[0.3em]"
          style={{ color: colors.text }}
        >
          Theme
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Light theme card */}
        <motion.button
          onClick={() => handleThemeChange("light")}
          className="w-full max-w-xs p-8 rounded-lg transition-all duration-500 cursor-pointer"
          style={{
            background: currentTheme === "light" ? colors.cardBg : "transparent",
            border: `2px solid ${
              currentTheme === "light" ? colors.activeBorder : colors.cardBorder
            }`,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full mx-auto"
              style={{ background: "#F7F5F2", border: "2px solid #5B8DB8" }}
            />
            <div>
              <p
                className="font-cormorant text-[13px] font-light tracking-[0.25em] uppercase"
                style={{ color: colors.text }}
              >
                Light
              </p>
              <p
                className="font-cormorant text-[11px] font-light mt-2 italic"
                style={{ color: colors.secondary }}
              >
                Warm, calm & inviting
              </p>
            </div>
          </div>
        </motion.button>

        {/* Dark theme card */}
        <motion.button
          onClick={() => handleThemeChange("dark")}
          className="w-full max-w-xs p-8 rounded-lg transition-all duration-500 cursor-pointer"
          style={{
            background: currentTheme === "dark" ? colors.cardBg : "transparent",
            border: `2px solid ${
              currentTheme === "dark" ? colors.activeBorder : colors.cardBorder
            }`,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full mx-auto"
              style={{ background: "#0D1B2A", border: "2px solid #7B6BA8" }}
            />
            <div>
              <p
                className="font-cormorant text-[13px] font-light tracking-[0.25em] uppercase"
                style={{ color: colors.text }}
              >
                Dark
              </p>
              <p
                className="font-cormorant text-[11px] font-light mt-2 italic"
                style={{ color: colors.secondary }}
              >
                Soft, restful & gentle
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Footer indicator */}
      <div className="pb-12 text-center">
        <p
          className="font-cormorant text-[10px] font-light tracking-[0.2em]"
          style={{ color: colors.secondary }}
        >
          changes apply everywhere
        </p>
      </div>
    </motion.div>
  );
}