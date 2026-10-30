import type { Config } from "tailwindcss";

// Ledger design tokens, ported from the approved Base44 home page.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // White pages from 29 Oct 2026 (volume kit); paper.card is the quiet panel tone.
        paper: { DEFAULT: "#FFFFFF", card: "#F6F4F0" },
        ink: { DEFAULT: "#2D2A26", muted: "rgba(45, 42, 38, 0.68)", faint: "rgba(45, 42, 38, 0.68)" /* was 0.55; AA fix, 30 Oct 2026 */ },
        // The accent is a CSS variable so a section can re-tint it: crimson by default,
        // sea blues inside .theme-sea (voyages and the Aliikai listings).
        crimson: { DEFAULT: "rgb(var(--jw-accent) / <alpha-value>)", deep: "rgb(var(--jw-accent-deep) / <alpha-value>)", light: "rgb(var(--jw-accent-light) / <alpha-value>)" },
        sea: { DEFAULT: "#1E5F73", deep: "#123B55", teal: "#146663", lagoon: "#2F8A86", shallows: "#46B3AC", mist: "#E3EBEC", light: "#9CCFD8" },
        coast: { DEFAULT: "#22656E", deep: "#1D4F56", mist: "#E4EEEC", light: "#A9D3D6" },
        rust: { DEFAULT: "#94512F", wash: "#F7EFE6" },
        // Wild Pathways (lib/pathways.ts): read the scoped variables set by .pathway-0n; see globals.css.
        pathway: { DEFAULT: "var(--jw-path)", text: "var(--jw-path-text)", tint: "var(--jw-path-tint)" },
        impact: { panel: "#E6E9DD", copy: "#405A45", highlight: "#94512F" },
        // House chrome (30 Oct 2026): warm neutrals for bands between white pages,
        // never for the page itself; and one tone per volume for dots, tabs and rails.
        sand: { DEFAULT: "#EFEAE0", deep: "#E4DDD0", ink: "#6B6257" },
        forest: { DEFAULT: "#2F4034", light: "#B9C7B0" },
        vol: { stays: "#8B2525", safaris: "#A5692A", gatherings: "#405A45", voyages: "#1E5F73", overland: "#94512F", europe: "#5B3A5E" },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "'Times New Roman'", "serif"],
        body: ["Manrope", "ui-sans-serif", "system-ui", "-apple-system", "'Segoe UI'", "sans-serif"],
        hand: ["Caveat", "cursive"],
      },
      maxWidth: { ledger: "72rem" },
    },
  },
  plugins: [],
};

export default config;
