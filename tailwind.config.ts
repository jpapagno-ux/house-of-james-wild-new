import type { Config } from "tailwindcss";

// Ledger design tokens: The House Standard (James approved, 2 Nov 2026). lib/palette.ts is the source.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // The House Standard (James approved, 2 Nov 2026; lib/palette.ts HOUSE). Paper, Stone Mist, Warm Stone, Graphite, Ink;
        // one accent (House Crimson); colour comes from photography.
        paper: { DEFAULT: "#FFFFFF", card: "rgb(var(--jw-band-rgb) / <alpha-value>)" }, // card = the section band: Stone Mist (the only band colour); a second band in a row goes Paper (globals.css)
        mist: "#F4F2EF",
        stone: { DEFAULT: "#8C8277", text: "#6B635A" },
        graphite: "#2E2B28",
        keyline: "#CFC8BF",
        ink: { DEFAULT: "#2E2B28", deep: "#1A1816", muted: "#6B635A", faint: "#6B635A" }, // text is Graphite; bg-ink-deep is Ink (darkest grounds)
        // House Crimson, the single accent: the seal, the logo, Ledger IDs, key dates, Plan with James.
        house: { DEFAULT: "var(--jw-crimson)", deep: "var(--jw-crimson-deep)" },
        // The general accent (text-crimson, border-crimson, bg-crimson) is a CSS variable, Graphite under the House
        // Standard, so eyebrows, hovers and active fills stay quiet; protected themes (river waters, The Exceptional
        // Few) re-tint it. For the true crimson use text-house / .house-crimson / .ledger-id.
        crimson: { DEFAULT: "rgb(var(--jw-accent) / <alpha-value>)", deep: "rgb(var(--jw-accent-deep) / <alpha-value>)", light: "rgb(var(--jw-accent-light) / <alpha-value>)" },
        // The main action (James, 2 Nov 2026): buttons and calls to action; a variable so the river waters can re-tint it. lib/palette.ts.
        action: { DEFAULT: "var(--jw-action)", deep: "var(--jw-action-deep)" },
        // Retired accents mapped onto the house tones (House Standard): sea and coast panels become Graphite and Ink,
        // their mists become Stone Mist; rust becomes Graphite on Stone Mist.
        sea: { DEFAULT: "#2E2B28", deep: "#1A1816", teal: "#2E2B28", lagoon: "#6B635A", shallows: "#8C8277", mist: "#F4F2EF", light: "#CFC8BF" },
        coast: { DEFAULT: "#2E2B28", deep: "#1A1816", mist: "#F4F2EF", light: "#CFC8BF" },
        rust: { DEFAULT: "#2E2B28", wash: "#F4F2EF" },
        // Wild Pathways (lib/pathways.ts): read the scoped variables set by .pathway-0n; see globals.css.
        pathway: { DEFAULT: "var(--jw-path)", text: "var(--jw-path-text)", tint: "var(--jw-path-tint)" },
        impact: { panel: "#F4F2EF", copy: "#2E2B28", highlight: "#6B635A" },
        // The Exceptional Few™ (globals.css .theme-ef): contextual, property-driven; variables, never hex.
        ef: { sand: "var(--ef-sand)", earth: "var(--ef-earth)", landscape: "var(--ef-landscape)", shadow: "var(--ef-shadow)", accent: "var(--ef-accent)" },
        // sand grounds retired: bg-sand reads the band (Stone Mist), sand.ink is Warm Stone text.
        sand: { DEFAULT: "rgb(var(--jw-band-rgb) / <alpha-value>)", deep: "rgb(var(--jw-band-rgb) / <alpha-value>)", ink: "#6B635A" },
        forest: { DEFAULT: "#2E2B28", light: "#CFC8BF" },
        // Volume colours: CSS variables generated from lib/volumes.ts (volumeCss(), app/layout.tsx); never a hex here.
        // vol.* = the ink (pins, legends, stamps, dots); leather.* = the 5px volume tab; vol-mist.* = an occasional quiet panel; vol-deep.* = volume words (AA).
        vol: { stays: "var(--vol-stays-ink)", safaris: "var(--vol-safaris-ink)", gatherings: "var(--vol-gatherings-ink)", voyages: "var(--vol-voyages-ink)", europe: "var(--vol-europe-ink)", overland: "var(--vol-overland-ink)" },
        leather: { stays: "var(--vol-stays-leather)", safaris: "var(--vol-safaris-leather)", gatherings: "var(--vol-gatherings-leather)", voyages: "var(--vol-voyages-leather)", europe: "var(--vol-europe-leather)", overland: "var(--vol-overland-leather)" },
        "vol-mist": { stays: "var(--vol-stays-mist)", safaris: "var(--vol-safaris-mist)", gatherings: "var(--vol-gatherings-mist)", voyages: "var(--vol-voyages-mist)", europe: "var(--vol-europe-mist)", overland: "var(--vol-overland-mist)" },
        "vol-deep": { stays: "var(--vol-stays-deep)", safaris: "var(--vol-safaris-deep)", gatherings: "var(--vol-gatherings-deep)", voyages: "var(--vol-voyages-deep)", europe: "var(--vol-europe-deep)", overland: "var(--vol-overland-deep)" },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "'Times New Roman'", "serif"],
        body: ["Manrope", "ui-sans-serif", "system-ui", "-apple-system", "'Segoe UI'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        hand: ["Caveat", "cursive"],
      },
      maxWidth: { ledger: "72rem" },
    },
  },
  plugins: [],
};

export default config;
