// The four legend categories used on every destination map, and the
// "New to the Ledger" window. Same legend, same order, on every page.
export type MapCategory = "stay" | "vessel" | "residence" | "reserve";

export const CATEGORIES: Record<MapCategory, { label: string; sub: string; color: string; shape: "circle" | "anchor" | "house" | "diamond" }> = {
  stay: { label: "Stays", sub: "Hotels, lodges, camps & resorts", color: "#8B2525", shape: "circle" },
  vessel: { label: "Vessel departures", sub: "Small ships, yachts & cruise ports", color: "#1E2A38", shape: "anchor" },
  residence: { label: "Residences & gatherings", sub: "Family homes for the generations", color: "#94512F", shape: "house" },
  reserve: { label: "African reserves", sub: "Parks, conservancies & concessions", color: "#866127", shape: "diamond" },
};
export const CATEGORY_ORDER: MapCategory[] = ["stay", "vessel", "residence", "reserve"];

export const NEW_WINDOW_DAYS = 60;
export function isNewToLedger(created: string | null | undefined, now = Date.now()) {
  if (!created) return false;
  const t = Date.parse(created);
  return Number.isFinite(t) && now - t < NEW_WINDOW_DAYS * 864e5;
}
