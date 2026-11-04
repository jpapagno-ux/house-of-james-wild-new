import { volumeMark } from "@/lib/volumes";
// The four legend categories used on every destination map, and the
// "New to the Ledger" window. Same legend, same order, on every page.
// Colours are the volumes' bases (lib/volumes.ts volumeMark, the Heritage set, James 2 Nov 2026):
// Stays limestone, Voyages verdigris, Gatherings terracotta, Safaris burnt ochre. A stay filed
// under the Europe volume pins in Europe's olive (MapItem.color).
export type MapCategory = "stay" | "vessel" | "residence" | "reserve";

export const CATEGORIES: Record<MapCategory, { label: string; sub: string; color: string; shape: "circle" | "anchor" | "house" | "diamond" }> = {
  stay: { label: "Stays", sub: "Hotels, lodges, camps & resorts", color: volumeMark("stays"), shape: "circle" },
  vessel: { label: "Vessel departures", sub: "Small ships, yachts & cruise ports", color: volumeMark("voyages"), shape: "anchor" },
  residence: { label: "Residences & gatherings", sub: "Family homes for the generations", color: volumeMark("gatherings"), shape: "house" },
  reserve: { label: "African reserves", sub: "Parks, conservancies & concessions", color: volumeMark("safaris"), shape: "diamond" },
};
export const CATEGORY_ORDER: MapCategory[] = ["stay", "vessel", "residence", "reserve"];

export const NEW_WINDOW_DAYS = 60;
export function isNewToLedger(created: string | null | undefined, now = Date.now()) {
  if (!created) return false;
  const t = Date.parse(created);
  return Number.isFinite(t) && now - t < NEW_WINDOW_DAYS * 864e5;
}
