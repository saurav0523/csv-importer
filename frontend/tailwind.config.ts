import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1120",
          900: "#111827",
          800: "#1F2937",
          700: "#374151",
          500: "#6B7280",
          300: "#D1D5DB",
          100: "#F3F4F6",
          50: "#F9FAFB",
        },
        brand: {
          DEFAULT: "#2D5B4F",
          50: "#EEF5F2",
          100: "#D7E9E1",
          300: "#8FBFAC",
          500: "#3F7864",
          600: "#2D5B4F",
          700: "#1F4038",
          900: "#0F211C",
        },
        signal: {
          amber: "#D9822B",
          amberDark: "#B4661B",
          rust: "#B24A3E",
          gold: "#C9A227",
        },
        surface: "#FAF9F6",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 33, 28, 0.06), 0 8px 24px -12px rgba(15, 33, 28, 0.12)",
        panel: "0 1px 0 rgba(15,33,28,0.04), 0 20px 40px -24px rgba(15,33,28,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(45, 91, 79, 0.35)" },
          "100%": { boxShadow: "0 0 0 12px rgba(45, 91, 79, 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "pulse-ring": "pulse-ring 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
