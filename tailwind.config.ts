import type { Config } from "tailwindcss";

// Ledger design tokens, ported from the approved Base44 home page.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#F4F1ED", card: "#EAE6DF" },
        ink: { DEFAULT: "#2D2A26", muted: "rgba(45, 42, 38, 0.68)", faint: "rgba(45, 42, 38, 0.55)" },
        crimson: { DEFAULT: "#8B2525", deep: "#6E1C1C", light: "#E8A598" },
        coast: { DEFAULT: "#22656E", deep: "#1D4F56", mist: "#E4EEEC", light: "#A9D3D6" },
        rust: { DEFAULT: "#94512F", wash: "#F7EFE6" },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "'Times New Roman'", "serif"],
        body: ["'EB Garamond'", "Georgia", "'Times New Roman'", "serif"],
        hand: ["Caveat", "cursive"],
      },
      maxWidth: { ledger: "72rem" },
    },
  },
  plugins: [],
};

export default config;
