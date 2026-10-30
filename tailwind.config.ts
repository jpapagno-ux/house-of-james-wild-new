import type { Config } from "tailwindcss";

// Ledger design tokens, ported from the approved Base44 home page.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // White pages from 29 Oct 2026 (volume kit); paper.card is the quiet panel tone.
        paper: { DEFAULT: "#FFFFFF", card: "#F6F4F0" },
        ink: { DEFAULT: "#2D2A26", muted: "rgba(45, 42, 38, 0.68)", faint: "rgba(45, 42, 38, 0.55)" },
        // The accent is a CSS variable so a section can re-tint it: crimson by default,
        // sea blues inside .theme-sea (voyages and the Aliikai listings).
        crimson: { DEFAULT: "rgb(var(--jw-accent) / <alpha-value>)", deep: "rgb(var(--jw-accent-deep) / <alpha-value>)", light: "rgb(var(--jw-accent-light) / <alpha-value>)" },
        sea: { DEFAULT: "#1E5F73", deep: "#123B55", teal: "#146663", lagoon: "#2F8A86", shallows: "#46B3AC", mist: "#E3EBEC", light: "#9CCFD8" },
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
