import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F0E8",
        "warm-white": "#FDFAF5",
        ink: "#1A1714",
        "ink-light": "#4A4540",
        "ink-muted": "#8A8480",
        sage: "#7A9E87",
        "sage-light": "#B8D4C0",
        terracotta: "#C4714A",
        "terracotta-light": "#E8C4B0",
        gold: "#C9A84C",
        "gold-light": "#EDD98A",
        lavender: "#8B7BAB",
        "lavender-light": "#C8BFD8",
        rose: "#B5726A",
        border: "rgba(26,23,20,0.1)",
      },
      fontFamily: {
        serif: ["'Noto Serif SC'", "serif"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        input: "10px",
        button: "8px",
        modal: "20px",
      },
      boxShadow: {
        card: "0 2px 20px rgba(26,23,20,0.08)",
        "card-lg": "0 8px 40px rgba(26,23,20,0.12)",
        fab: "0 4px 20px rgba(26,23,20,0.3)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease forwards",
        spin: "spin 0.8s linear infinite",
      },
      maxWidth: {
        content: "1100px",
      },
    },
  },
  plugins: [],
};
export default config;
