// The six volumes of the house (approved by James, 29 Oct 2026).
// One source for each volume's leather colour, stamp-pad ink, line icon,
// stamp shape and stamp words. Pages, cards, stamps and offer marks read
// from here; nothing else hard-codes a volume colour.
//
// Rules (The House Standard, James approved 2 Nov 2026)
// • Pages are paper, mist and ink. A volume is told apart by a thin leather
//   TAB (about 5px edge) in its leather, never by coloured sections, buttons,
//   chips or fills. Map pins, legends and stamps keep the volume inks (small marks).
// • House Crimson stays for the JW seal, the logo, Ledger IDs, key dates and
//   "Plan with James". It is never a volume colour.
// • The Heritage set (natural pigments, warm to cool; James confirmed 2 Nov 2026):
//   Gatherings Terracotta, Safaris Burnt Ochre, Overland Saffron, Europe Olive,
//   Voyages Verdigris, Stays Limestone. Each has a base (the 5px tab, map pins and
//   stamps: `leather` = `pad`), a deep (volume words, AA on Paper: `deep`), a light
//   (marks on dark grounds) and a mist (an occasional quiet panel: `tint`).
//   Base saffron, ochre and limestone fail AA as text: words always use the deep.
// • This file is the only place a volume colour is written. Swap the set here.
// • Founder marks print only from Ledger data (lib/ledger/status.ts).

export type VolumeKey = "stays" | "safaris" | "gatherings" | "voyages" | "europe" | "overland";
export type StampShape = "circle" | "postage" | "scallop" | "porthole" | "arch" | "octagon";
export type TimeMarkKind = "hourglass" | "candle" | "shipclock" | "sundial";
export type VolumeIcon = "key" | "acacia" | "house" | "sail" | "dome" | "summit";

export type VolumeStyle = {
  key: VolumeKey;
  roman: string;
  label: string;
  short: string;
  leather: string; // the binding: the volume tab (about 5px edge)
  leatherName: string;
  pad: string; // the base: map pins, legends, stamps and dots (equal to leather in the Heritage set; never words)
  rgb: string; // the base as "r g b" (no longer re-tints --jw-accent)
  deep: string; // volume words (AA on Paper and the volume mist)
  light: string; // "r g b": marks on dark grounds and photographs
  tint: string; // quiet panels: Mist for every volume under the House Standard (no coloured fills)
  icon: VolumeIcon;
  stamp: StampShape;
  words: [string, string];
  ring: [string, string]; // text round the stamp edge, top and bottom
  timeMark: TimeMarkKind; // for Worth Another Night / Time Rewarded
  finalCall?: "Last berths" | "Open seats"; // late-departure savings
};

export const VOLUME_STYLES: Record<VolumeKey, VolumeStyle> = {
  stays: {
    key: "stays", roman: "I", label: "Stays", short: "Stays",
    leather: "#8C8277", leatherName: "Limestone", pad: "#8C8277", rgb: "140 130 119", deep: "#3D3934", light: "207 200 191", tint: "#F4F2EF",
    icon: "key", stamp: "circle", words: ["Slept", "Here"], ring: ["JAMES WILD & CO", "EXPLORING SINCE 1982"], timeMark: "hourglass",
  },
  safaris: {
    key: "safaris", roman: "II", label: "Safaris & Reserves", short: "Safaris",
    leather: "#C2621E", leatherName: "Burnt Ochre", pad: "#C2621E", rgb: "194 98 30", deep: "#6B3510", light: "237 185 138", tint: "#FBF0E6",
    icon: "acacia", stamp: "postage", words: ["First", "Light"], ring: ["AFRICA · RESERVE POST", "VOL II"], timeMark: "hourglass",
  },
  gatherings: {
    key: "gatherings", roman: "III", label: "Gatherings", short: "Gatherings",
    leather: "#A2482E", leatherName: "Terracotta", pad: "#A2482E", rgb: "162 72 46", deep: "#5A2418", light: "221 164 142", tint: "#F7EDE8",
    icon: "house", stamp: "scallop", words: ["One", "Roof"], ring: ["GATHERING VERIFIED", "THREE GENERATIONS"], timeMark: "candle",
  },
  voyages: {
    key: "voyages", roman: "IV", label: "Voyages", short: "Voyages",
    leather: "#3F7A70", leatherName: "Verdigris", pad: "#3F7A70", rgb: "63 122 112", deep: "#1E3F3A", light: "169 204 196", tint: "#EDF4F2",
    icon: "sail", stamp: "porthole", words: ["Sailed", "Her"], ring: ["SHIP'S LOG", "SIGNED ABOARD"], timeMark: "shipclock", finalCall: "Last berths",
  },
  europe: {
    key: "europe", roman: "V", label: "Europe", short: "Europe",
    leather: "#6E7537", leatherName: "Olive", pad: "#6E7537", rgb: "110 117 55", deep: "#353A1E", light: "194 199 154", tint: "#F2F3E8",
    icon: "dome", stamp: "arch", words: ["Grand", "Tour"], ring: ["JAMES WILD & CO", "VOL V"], timeMark: "sundial",
  },
  overland: {
    key: "overland", roman: "VI", label: "Overland & Expeditions", short: "Overland",
    leather: "#C4952A", leatherName: "Saffron", pad: "#C4952A", rgb: "196 149 42", deep: "#6B5212", light: "233 207 142", tint: "#FAF4E4",
    icon: "summit", stamp: "octagon", words: ["Off the", "Map"], ring: ["FIELD PERMIT", "BY ROAD · BY FOOT"], timeMark: "sundial", finalCall: "Open seats",
  },
};

/** "r g b" → "#RRGGBB". */
const hex = (rgb: string) => "#" + rgb.split(" ").map((n) => (+n).toString(16).padStart(2, "0")).join("").toUpperCase();
/** A volume's colour for words and rules on Paper (eyebrows, section rules, prices): its deep value, AA on Paper.
 *  Under the Heritage set the bases (saffron, ochre, limestone) fail AA as text, so every word reads the deep. */
export const volumeInk = (k: VolumeKey) => VOLUME_STYLES[k].deep;
/** A volume's base for small marks on Paper: map pins, legends, dots and stamps. Never words. */
export const volumeMark = (k: VolumeKey) => VOLUME_STYLES[k].pad;
/** A volume's leather: the thin volume tab (about 5px edge). Never a section, button, chip or fill. */
export const volumeLeather = (k: VolumeKey) => VOLUME_STYLES[k].leather;
/** A volume's light ink, for marks on dark grounds (footer tabs on crimson, stamps on photographs). */
export const volumeLightInk = (k: VolumeKey) => hex(VOLUME_STYLES[k].light);
/** The volume a top-level path opens (/stays, /safaris … /destinations/europe). */
export const volumeForHref = (href: string): VolumeKey | null => {
  const k = href === "/destinations/europe" ? "europe" : href.replace(/^\//, "").split("/")[0];
  return (k as VolumeKey) in VOLUME_STYLES ? (k as VolumeKey) : null;
};

// On the Horizon (James, 2 Nov 2026): the offers stamp's colour set, derived from the Voyages tokens
// so it sits inside the navy volume: the ink is the Voyages pad, the sea a step toward its light tint,
// the deep its hover, and the rising sun in sea aqua (James, 2 Nov 2026: the brass sun is retired;
// "match the stamps to these as well"). `onDark` is the set for navy or photographic grounds: the
// Voyages light tint, with the aqua lifted toward white. The two aquas equal STAMP_AQUA in
// lib/palette.ts (scripts/check-palette.mjs holds them in step; this file stays import-free).
const mix = (a: string, b: string, t: number) => "#" + [0, 2, 4].map((i) => Math.round(parseInt(a.slice(1 + i, 3 + i), 16) * (1 - t) + parseInt(b.slice(1 + i, 3 + i), 16) * t).toString(16).padStart(2, "0")).join("").toUpperCase();
const SUN_AQUA = "#1A8A8A", SUN_AQUA_DARK = "#8FD6CF"; // = STAMP_AQUA in lib/palette.ts
export type HorizonTokens = { ink: string; sea: string; deep: string; sun: string; ground: string };
export const HORIZON: { onLight: HorizonTokens; onDark: HorizonTokens } = {
  onLight: { ink: VOLUME_STYLES.voyages.pad, sea: mix(VOLUME_STYLES.voyages.pad, hex(VOLUME_STYLES.voyages.light), 0.35), deep: VOLUME_STYLES.voyages.deep, sun: SUN_AQUA, ground: VOLUME_STYLES.voyages.tint },
  onDark: { ink: hex(VOLUME_STYLES.voyages.light), sea: mix(hex(VOLUME_STYLES.voyages.light), VOLUME_STYLES.voyages.pad, 0.3), deep: "#FFFFFF", sun: SUN_AQUA_DARK, ground: VOLUME_STYLES.voyages.leather },
};

/** Alias of volumeInk: a volume's words use its deep value. */
export const volumeText = (k: VolumeKey) => VOLUME_STYLES[k].deep;
/** A volume's mist: an occasional quiet panel, never a section band. */
export const volumeMist = (k: VolumeKey) => VOLUME_STYLES[k].tint;

/**
 * The volume CSS, generated from VOLUME_STYLES and injected once by app/layout.tsx, so no volume hex lives in
 * app/globals.css or tailwind.config.ts and a new volume set is one edit here. Per volume it sets
 *   :root                          --vol-<k>-leather, --vol-<k>-ink, --vol-<k>-deep, --vol-<k>-light (Tailwind vol.*, leather.*)
 *   .vol-<k>                       --vol (the ink, for pins, dots and stamps)
 *   .theme-vol-<k> / -page scope   --vol-leather (the 5px tab), --vol, --vol-deep
 * Voyages also covers .theme-sea and .theme-sea-page (the voyage pages and the Aliikai listings).
 */
export function volumeCss(): string {
  const root = VOLUME_ORDER.map((k) => { const v = VOLUME_STYLES[k]; return `--vol-${k}-leather: ${v.leather}; --vol-${k}-ink: ${v.pad}; --vol-${k}-deep: ${v.deep}; --vol-${k}-light: ${hex(v.light)}; --vol-${k}-mist: ${v.tint};`; }).join(" ");
  const rules = VOLUME_ORDER.map((k) => {
    const v = VOLUME_STYLES[k];
    const scope = [`.theme-vol-${k}`, `:root:has(.theme-vol-${k}-page)`, ...(k === "voyages" ? [".theme-sea", ":root:has(.theme-sea-page)"] : [])].join(", ");
    return `.vol-${k} { --vol: ${v.pad}; }\n${scope} { --vol-leather: ${v.leather}; --vol: ${v.pad}; --vol-deep: ${v.deep}; --vol-mist: ${v.tint}; }`;
  }).join("\n");
  return `:root { ${root} }\n${rules}`;
}

export const VOLUME_ORDER: VolumeKey[] = ["stays", "safaris", "gatherings", "voyages", "europe", "overland"];

// Compatibility map for the Wild Pathways brief (Foundation V1.3 §3), whose
// VOL-01…06 numbering differs from the romans James approved on 29 Oct 2026.
// The brief's IDs are aliases only: nothing live is renumbered, and pages,
// stamps and Ledger IDs keep reading the keys and romans above.
export type VolumeBriefId = "VOL-01" | "VOL-02" | "VOL-03" | "VOL-04" | "VOL-05" | "VOL-06";
export const VOLUME_BRIEF_ID: Record<VolumeKey, VolumeBriefId> = { stays: "VOL-01", voyages: "VOL-02", safaris: "VOL-03", gatherings: "VOL-04", overland: "VOL-05", europe: "VOL-06" };
export const VOLUME_BY_BRIEF_ID: Record<VolumeBriefId, VolumeKey> = { "VOL-01": "stays", "VOL-02": "voyages", "VOL-03": "safaris", "VOL-04": "gatherings", "VOL-05": "overland", "VOL-06": "europe" };

/** The house's older four-plus-one volume names map onto the six. */
export function volumeStyle(v: string | undefined | null): VolumeStyle {
  return VOLUME_STYLES[(v as VolumeKey) in VOLUME_STYLES ? (v as VolumeKey) : "stays"];
}

/** Month and year for a passport stamp, from an ISO date or a bare year. */
export function stampDate(date?: string | number | null): string | null {
  if (date == null || date === "") return null;
  const s = String(date);
  const m = /^(\d{4})-(\d{2})/.exec(s);
  if (!m) return /^\d{4}$/.test(s) ? s : null;
  // The Ledger files a year-only visit as 1 January: print the year alone, never a month nobody filed.
  if (/^\d{4}-01-01/.test(s)) return m[1];
  const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${MON[Number(m[2]) - 1]} ${m[1]}`;
}

/** Entry number for a record's ink stamp: the last four digits of its Ledger ID. */
export function entryNo(ledgerId?: string | null): string | null {
  const m = /(\d{4})$/.exec(ledgerId ?? "");
  return m ? m[1] : null;
}
/** Text round a record's coordinate roundel. */
export function roundelText(name: string, pin: { lat: number; lng: number }, roman: string): string {
  const ns = `${Math.abs(pin.lat).toFixed(2)}°${pin.lat >= 0 ? "N" : "S"}`;
  const ew = `${Math.abs(pin.lng).toFixed(2)}°${pin.lng >= 0 ? "E" : "W"}`;
  return `${ns} · ${ew} · ${name} · Vol ${roman}`;
}
/** Founder seal label: only the two marks James has earned in person. */
export function sealFor(stamp?: string | null): string | null {
  return stamp === "Founder favorite" ? "Founder favorite" : stamp === "Field verified" ? "Founder stayed" : null;
}
