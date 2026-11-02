// The Deep Sea palette (James, 2 Nov 2026): "Deeper blues and deeper colours. Stick to just blues,
// aquas, and even some aqua turquoise greens, not so much browns and olives. Match the stamps to
// these as well." One source for the colours of the house's buttons, Wild Pathways chips and offer
// stamps. Every fill below carries white text at WCAG AA (4.5:1 or better; ratios in
// docs/brand-colours.md). Light tints sit behind the outlined (secondary) chips.
//
// Rules
// • Buttons and calls to action read --jw-action / --jw-action-deep (app/globals.css), never a hex.
// • House Crimson (#8B2525) is kept for the house seal, the logo and its rule line only.
// • No browns, golds, tans or olives on chips, buttons or offer stamps:
//   scripts/check-palette.mjs flags them.
// • The volume inks (lib/volumes.ts) and The Exceptional Few's per-property palettes are separate.
// • River voyages (James, 2 Nov 2026) carry their own waters set, still no browns, golds or olives:
//   the Amazon in rainforest greens, the Nile in lapis with deep Nile turquoise, and the By River
//   hub between the two. They apply through .theme-waters-* (globals.css) on those hubs and ships.
//
// Kept import-free so plain Node (tests, scripts/check-palette.mjs) can read it.

export type DeepSeaKey = "navy" | "ocean" | "cerulean" | "slate" | "teal" | "aqua" | "turquoise" | "seaGlass";
export type Swatch = { name: string; fill: string; tint: string };

/** The eight deep fills, each with its light tint. */
export const DEEP_SEA: Record<DeepSeaKey, Swatch> = {
  navy: { name: "Deep Navy", fill: "#162D54", tint: "#E9ECF2" },
  ocean: { name: "Ocean Blue", fill: "#1A4A80", tint: "#E8EEF6" },
  cerulean: { name: "Deep Cerulean", fill: "#1C6BAE", tint: "#E8F1F9" },
  slate: { name: "Ink Slate", fill: "#3D4C66", tint: "#ECEFF3" },
  teal: { name: "Deep Teal", fill: "#0C5D61", tint: "#E6F1F1" },
  aqua: { name: "Deep Aqua", fill: "#08697F", tint: "#E5F2F5" },
  turquoise: { name: "Turquoise Green", fill: "#11705A", tint: "#E8F3EF" },
  seaGlass: { name: "Sea Glass", fill: "#4A736D", tint: "#EDF2F1" },
};

/** Marks only (never a text fill): the aqua sun of the On the Horizon stamp, on light and on dark grounds. */
export const STAMP_AQUA = { onLight: "#1A8A8A", onDark: "#8FD6CF" };

/** The main action (buttons, "Plan with James", "Hold a cabin", the phone action bar): ocean blue, deep teal on hover. */
export const ACTION = { fill: DEEP_SEA.ocean.fill, hover: DEEP_SEA.teal.fill };

export type WatersKey = "amazon" | "nile" | "river";
export type WatersSet = { name: string; action: string; hover: string; accent: string; accentDeep: string; light: string; card: string };

/** River voyages: their own set, through the waters context. accent = words and selected chips; card = the quiet panel. */
export const WATERS_PALETTE: Record<WatersKey, WatersSet> = {
  // Emerald, deep jungle green, river teal.
  amazon: { name: "Amazon rainforest", action: "#0A6B4E", hover: "#1D5A3B", accent: "#1A4F36", accentDeep: "#123A27", light: "#C4DCCF", card: "#EEF5F1" },
  // Lapis, deep Nile turquoise. No sand or ochre.
  nile: { name: "Nile lapis", action: "#23428F", hover: "#0A6570", accent: "#1B3471", accentDeep: "#122550", light: "#C5CEE6", card: "#EEF1F8" },
  // The By River hub sits between the two: river teal, lapis on hover.
  river: { name: "By River", action: "#0E6467", hover: "#23428F", accent: "#0E4F52", accentDeep: "#0A3A3C", light: "#C2DCDD", card: "#EDF4F4" },
};

/** The waters context a ship or hub takes, by its registry waters key. Sea waters keep the Deep Sea set. */
export const watersTheme = (waters?: string | null): string => (waters === "amazon" || waters === "nile" || waters === "river" ? `theme-waters-${waters}` : "");
