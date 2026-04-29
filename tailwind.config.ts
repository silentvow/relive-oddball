import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Page surfaces
        cream: {
          DEFAULT: "#F5EBD8",
          card: "#FAF4E5",
          deep: "#EFE5CB",
        },
        ink: {
          DEFAULT: "#3A3530",
          soft: "#6F665A",
          mute: "#8A7E6E",
          ghost: "#B5A990",
        },
        edge: {
          DEFAULT: "#DECEB0",
          soft: "#C9BBA0",
        },
        // Rank-segment colors (1-3 / 4-6 / 7-9 / 10-12 / 13-15)
        rank: {
          hot: "#C49B8C",       // 1-3
          warm: "#D9BFA8",      // 4-6
          mid: "#DDC987",       // 7-9
          cool: "#C5D4A8",      // 10-12
          cold: "#B8D4C4",      // 13-15
        },
        // Heatmap ramp
        heat: {
          faint: "#ECE2CB",
          light: "#DCC499",
          medium: "#B89366",
          peak: "#8E6F3A",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        slot: "14px",
        card: "16px",
        frame: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
