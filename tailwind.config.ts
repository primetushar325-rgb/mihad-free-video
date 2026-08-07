import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Premium Golden + Black theme
        gold: {
          50: "#fffbeb",
          100: "#fff3c4",
          200: "#ffe585",
          300: "#ffd24d",
          400: "#ffbb22",
          500: "#f5a623", // primary gold
          600: "#d98a0a",
          700: "#a86308",
          800: "#7a4706",
          900: "#4d2c04",
        },
        ink: {
          50: "#1a1a1a",
          100: "#141414",
          200: "#101010",
          300: "#0d0d0d",
          400: "#0a0a0a",
          500: "#070707",
          600: "#050505",
          700: "#030303",
          800: "#020202",
          900: "#000000",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 25px -5px rgba(245, 166, 35, 0.45)",
        "gold-lg": "0 0 45px -5px rgba(245, 166, 35, 0.6)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #ffd24d 0%, #f5a623 50%, #d98a0a 100%)",
        "gold-shine":
          "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 15px -3px rgba(245,166,35,0.45)" },
          "50%": { boxShadow: "0 0 35px -3px rgba(245,166,35,0.7)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s infinite linear",
        "glow-pulse": "glow-pulse 2.4s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease forwards",
        "slide-up": "slide-up 0.5s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
