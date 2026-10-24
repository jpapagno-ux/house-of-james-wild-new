// Natural settings. Each one has its own ink, used ONLY inside that setting's luggage tag,
// VIP stamp and VIP card (and its dot in the Ledger). The interface stays rust and navy.
// Airtable: Residences › "Setting" (single select) — the names must match these labels exactly.
export type SettingKey = "mountain" | "jungle" | "coast" | "desert" | "savanna" | "polar";

export type Setting = { key: SettingKey; name: string; ink: string; stock: string; sub: string };

export const SETTINGS: Record<SettingKey, Setting> = {
  mountain: { key: "mountain", name: "Mountain", ink: "#33505F", stock: "#E8ECEA", sub: "Peaks · pine · high meadow" },
  jungle: { key: "jungle", name: "Jungle", ink: "#2E5A3F", stock: "#E7ECE2", sub: "Rainforest · river · rice terrace" },
  coast: { key: "coast", name: "Coast & Island", ink: "#22656E", stock: "#E4EEEC", sub: "Reef · lagoon · white sand" },
  desert: { key: "desert", name: "Desert", ink: "#A1512F", stock: "#F1E7DA", sub: "Canyon · mesa · hot spring" },
  savanna: { key: "savanna", name: "Savanna", ink: "#866127", stock: "#F0E8D6", sub: "Grassland · acacia · river" },
  polar: { key: "polar", name: "Polar & Ice", ink: "#3C6487", stock: "#E7EDF2", sub: "Ice · fjord · tundra" },
};

export const SETTING_ORDER: SettingKey[] = ["mountain", "jungle", "coast", "desert", "savanna", "polar"];

// Airtable label → key. Unknown or empty falls back to mountain so a new stay never breaks a page.
export function settingFrom(label?: string): SettingKey {
  const l = (label || "").toLowerCase();
  if (l.startsWith("jungle") || l.includes("rainforest")) return "jungle";
  if (l.startsWith("coast") || l.includes("island") || l.includes("beach")) return "coast";
  if (l.startsWith("desert")) return "desert";
  if (l.startsWith("savanna") || l.includes("safari")) return "savanna";
  if (l.startsWith("polar") || l.includes("ice")) return "polar";
  return "mountain";
}
