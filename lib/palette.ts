// THE HOUSE STANDARD (James approved, 2 Nov 2026; warm neutrals and the Heritage volumes confirmed the same day).
// One source for the house's colours. A restrained, studio approach: five warm tones, one accent, one gradient.
// Photography carries the colour; pages are paper, stone mist and ink. Replaces the Deep Sea buttons, the
// Tidewater sea-green/aqua bands and the leathers (Field Olive included). app/globals.css carries the same
// values as --jw-* tokens; scripts/check-palette.mjs fails the build on drift, on a colour outside the house in a
// button, chip or band, or on text below AA.
//
// Rules
// • Pages are Paper. Stone Mist is the only band colour; two bands never sit in a row (the second goes Paper).
// • Warm Stone is for numerals, keylines and large secondary words; small text uses Warm Stone text (AA).
// • House Crimson is the single accent: the seal, the logo and its rule, Ledger IDs, key dates and the
//   main action "Plan with James". One or two crimson touches per screen. No other accent on general pages.
// • The one gradient, Ink to Garnet (from the warm ink), is only for hero photo fades, the ticker band and the opening.
// • Volumes (lib/volumes.ts, the Heritage set) show as a 5px tab, map pins and an occasional volume-mist panel;
//   never sections, buttons or chips. Volume words use the volume's deep value.
// • Warm mists are allowed as quiet panels: Stone Mist and the six volume mists, these exact tints only.
//   Still no parchment textures, no browns, golds or tans as grounds.
// • Buttons, chips, fields and tabs are squared (2px), never pills.
// • Protected and unchanged: the river waters (below), The Exceptional Few's per-property palettes,
//   the seal artwork and founder marks.
//
// Kept import-free so plain Node (tests, scripts/check-palette.mjs) can read it.

export type HouseToneKey = "paper" | "mist" | "stone" | "stoneText" | "graphite" | "ink" | "keyline" | "hairline";
export const HOUSE = {
  paper: "#FFFFFF", // page ground, cards
  mist: "#F4F2EF", // Stone Mist: the only band colour
  stone: "#8C8277", // Warm Stone: numerals, keylines, large secondary words
  stoneText: "#6B635A", // Warm Stone text: small secondary text (AA on Paper and Stone Mist)
  graphite: "#2E2B28", // text, rules, active chips
  ink: "#1A1816", // darkest grounds, the footer
  keyline: "#CFC8BF", // light keylines: secondary button and chip borders, rules
  hairline: "#DCD7D0", // borders: fine card rules
};

/** The footer (James, 2 Nov 2026): a warm Ink ground fading to garnet-black, ivory and stone type, labels in a soft
 *  crimson, warm rules. On Ink: body 14.6:1, soft 8.3:1, legal 4.9:1, label 8.6:1. */
export const FOOTER = { ground: "#1A1816", groundEnd: "#241A19", body: "#E9E4DE", soft: "#B8AFA5", legal: "#8C8277", label: "#D7A7AA", rule: "#3D3934", field: "#5A534B" };

/** The single accent. */
export const CRIMSON = { fill: "#8B2525", deep: "#6E1C1C" };

/** The one gradient, Ink to Garnet: hero photo fades, the ticker band and the opening only. */
export const GRADIENT = { stops: ["#1A1816", "#2E2B28", "#3A1C1F", "#5A1F23"], heroFade: "rgba(38,20,22,0.88)" };

/** What's Coming (James approved on the design canvas, 2 Nov 2026): the only tints it adds to the house set, all on
 *  dark grounds (the Ink to Garnet hero, the ticker band). Blush: the hero eyebrow and the board's offer "%";
 *  blush soft: the hero count line; dot: the board's opening dots. Its oxblood corner guards are the gradient's
 *  garnet stops (GRADIENT.stops[3] to [2]) and its numerals Warm Stone, so they need no token of their own.
 *  scripts/check-palette.mjs holds components/coming and app/whats-coming to the house set plus these. */
export const COMING_TINTS = { blush: "#E8C4C6", blushSoft: "#E9DCDD", dot: "#C24A4A" };

/** The 3D terrain pilot (components/maps/terrain, preview only): the basemap restyled to the house. Land is Stone Mist
 *  with two warmer covers, water a soft verdigris-tinted neutral, roads and borders the house keylines, labels Graphite
 *  on a Paper halo, hillshade in warm graphite shadows and paper highlights, the sky and fog in warm mist. Route lines
 *  and pins are the volume bases (lib/volumes.ts) and the active stop House Crimson, so they need no token here. */
export const TERRAIN = {
  ground: "#F4F2EF", landcover: "#EEEBE6", park: "#ECE9E2", water: "#E4EBE8", waterLine: "#C9D6D1",
  road: "#DCD7D0", boundary: "#CFC8BF", label: "#2E2B28", labelSoft: "#6B635A", halo: "#FFFFFF",
  shadow: "#2E2B28", highlight: "#FFFFFF", accent: "#8C8277", sky: "#F4F2EF", horizon: "#FFFFFF", fog: "#F4F2EF",
};

/** The main action ("Plan with James"): crimson on Paper, white keylines on dark or photographs. */
export const ACTION = { fill: CRIMSON.fill, hover: CRIMSON.deep };

/** Every colour a general page may show (chromatic or neutral). The audit and the palette check read it. */
export const HOUSE_SET = [HOUSE.paper, HOUSE.mist, HOUSE.stone, HOUSE.stoneText, HOUSE.graphite, HOUSE.ink, HOUSE.keyline, HOUSE.hairline, CRIMSON.fill, CRIMSON.deep, ...GRADIENT.stops];

// Wild Pathways keep their colour only as a small 6px dot beside the printed name (chips are squared
// graphite outlines). These are the eight dot colours; they never fill a chip, button or band.
export type DeepSeaKey = "navy" | "ocean" | "cerulean" | "slate" | "teal" | "aqua" | "turquoise" | "seaGlass";
export type Swatch = { name: string; fill: string; tint: string };
export const DEEP_SEA: Record<DeepSeaKey, Swatch> = {
  navy: { name: "Deep Navy", fill: "#162D54", tint: "#FFFFFF" },
  ocean: { name: "Ocean Blue", fill: "#1A4A80", tint: "#FFFFFF" },
  cerulean: { name: "Deep Cerulean", fill: "#1C6BAE", tint: "#FFFFFF" },
  slate: { name: "Ink Slate", fill: "#3D4C66", tint: "#FFFFFF" },
  teal: { name: "Deep Teal", fill: "#0C5D61", tint: "#FFFFFF" },
  aqua: { name: "Deep Aqua", fill: "#08697F", tint: "#FFFFFF" },
  turquoise: { name: "Turquoise Green", fill: "#11705A", tint: "#FFFFFF" },
  seaGlass: { name: "Sea Glass", fill: "#4A736D", tint: "#FFFFFF" },
};

/** Marks only (never a text fill): the aqua sun of the On the Horizon stamp, on light and on dark grounds. */
export const STAMP_AQUA = { onLight: "#1A8A8A", onDark: "#8FD6CF" };

// River voyages (James, 2 Nov 2026), protected under the House Standard: their own set through the waters
// context (.theme-waters-*), still no browns, golds or olives. Their buttons are squared like every other.
export type WatersKey = "amazon" | "nile" | "river";
export type WatersSet = { name: string; action: string; hover: string; accent: string; accentDeep: string; light: string; card: string };

/** River voyages: their own set, through the waters context. accent = words and selected chips; card = the card (Paper; their pale band is set in globals.css). */
export const WATERS_PALETTE: Record<WatersKey, WatersSet> = {
  // Emerald, deep jungle green, river teal.
  amazon: { name: "Amazon rainforest", action: "#0A6B4E", hover: "#1D5A3B", accent: "#1A4F36", accentDeep: "#123A27", light: "#C4DCCF", card: "#FFFFFF" },
  // Lapis, deep Nile turquoise. No sand or ochre.
  nile: { name: "Nile lapis", action: "#23428F", hover: "#0A6570", accent: "#1B3471", accentDeep: "#122550", light: "#C5CEE6", card: "#FFFFFF" },
  // The By River hub sits between the two: river teal, lapis on hover.
  river: { name: "By River", action: "#0E6467", hover: "#23428F", accent: "#0E4F52", accentDeep: "#0A3A3C", light: "#C2DCDD", card: "#FFFFFF" },
};

/** The waters context a ship or hub takes, by its registry waters key. Sea waters follow the House Standard. */
export const watersTheme = (waters?: string | null): string => (waters === "amazon" || waters === "nile" || waters === "river" ? `theme-waters-${waters}` : "");
