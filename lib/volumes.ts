// The six volumes of the house (approved by James, 29 Oct 2026).
// One source for each volume's leather colour, stamp-pad ink, line icon,
// stamp shape and stamp words. Pages, cards, stamps and offer marks read
// from here; nothing else hard-codes a volume colour.
//
// Rules
// • Pages are white. A volume's colour appears only on labels, buttons, the
//   rule above the manifest and its marks.
// • House Oxblood stays for the JW seal and Ledger IDs.
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
  leather: string; // the binding: buttons, labels, rules
  leatherName: string;
  pad: string; // stamp-pad ink, a step brighter so it reads on white
  rgb: string; // leather as "r g b" for the --jw-accent variable
  deep: string; // hover
  light: string; // "r g b" tint
  tint: string; // hex tint for quiet panels
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
    leather: "#2E3B2C", leatherName: "Bottle Green", pad: "#3E5A3A", rgb: "46 59 44", deep: "#1F281E", light: "201 214 196", tint: "#F1F4EF",
    icon: "key", stamp: "circle", words: ["Slept", "Here"], ring: ["JAMES WILD & CO", "EXPLORING SINCE 1982"], timeMark: "hourglass",
  },
  safaris: {
    key: "safaris", roman: "II", label: "Safaris & Reserves", short: "Safaris",
    leather: "#6B4226", leatherName: "Saddle Leather", pad: "#7A4A24", rgb: "107 66 38", deep: "#4F301B", light: "226 206 186", tint: "#F7F1EB",
    icon: "acacia", stamp: "postage", words: ["First", "Light"], ring: ["AFRICA · RESERVE POST", "VOL II"], timeMark: "hourglass",
  },
  gatherings: {
    key: "gatherings", roman: "III", label: "Gatherings", short: "Gatherings",
    leather: "#651D22", leatherName: "Claret", pad: "#86232C", rgb: "101 29 34", deep: "#4A1418", light: "232 196 198", tint: "#F8F0F0",
    icon: "house", stamp: "scallop", words: ["One", "Roof"], ring: ["GATHERING VERIFIED", "THREE GENERATIONS"], timeMark: "candle",
  },
  voyages: {
    key: "voyages", roman: "IV", label: "Voyages", short: "Voyages",
    leather: "#1E2939", leatherName: "Admiralty Navy", pad: "#2A3D5C", rgb: "30 41 57", deep: "#121A26", light: "190 201 218", tint: "#EFF2F6",
    icon: "sail", stamp: "porthole", words: ["Sailed", "Her"], ring: ["SHIP'S LOG", "SIGNED ABOARD"], timeMark: "shipclock", finalCall: "Last berths",
  },
  europe: {
    key: "europe", roman: "V", label: "Europe", short: "Europe",
    leather: "#3B2634", leatherName: "Aubergine", pad: "#4E2E46", rgb: "59 38 52", deep: "#271822", light: "214 196 208", tint: "#F5F0F3",
    icon: "dome", stamp: "arch", words: ["Grand", "Tour"], ring: ["JAMES WILD & CO", "VOL V"], timeMark: "sundial",
  },
  overland: {
    key: "overland", roman: "VI", label: "Overland & Expeditions", short: "Overland",
    leather: "#46452A", leatherName: "Field Olive", pad: "#4D4C27", rgb: "70 69 42", deep: "#302F1C", light: "214 212 186", tint: "#F4F4EE",
    icon: "summit", stamp: "octagon", words: ["Off the", "Map"], ring: ["FIELD PERMIT", "BY ROAD · BY FOOT"], timeMark: "sundial", finalCall: "Open seats",
  },
};

export const VOLUME_ORDER: VolumeKey[] = ["stays", "safaris", "gatherings", "voyages", "europe", "overland"];

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
  const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${MON[Number(m[2]) - 1]} ${m[1]}`;
}
