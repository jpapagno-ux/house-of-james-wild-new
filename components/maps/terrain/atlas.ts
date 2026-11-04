// The country atlas: shared types and pure helpers, no MapLibre import, so plain Node tests read it.

export type AtlasImage = { url: string; alt: string };
/** James's own note on a place, signed and dated ("James, 2024"). Filled only from text already on his record in the
 *  repo (lib/content/advisors.ts); empty for James to supply everywhere else. */
export type JamesNote = { text: string; year: number };
/** "Ask James" / "Ask Anthony" on a card: an advisor whose own Desk entries carry this record. */
export type AtlasAsk = { first: string; href: string };
/** The diver-down flag (red with a white diagonal) marks dive sites, on the map and in the list. It is a real-world
 *  signal, drawn in House Crimson as the Ledger chart draws it (LedgerChart, the Philippines). */
export const DIVE_FLAG = { red: "#8B2525", stripe: "#FFFFFF" };
/** One Ledger entry on the map: a stay or a voyage. Colour is its volume's mark (lib/volumes.ts), passed in as data. */
export type AtlasEntry = {
  id: string; kind: "stay" | "voyage"; name: string; sub: string; lat: number; lng: number; color: string; href: string;
  image: AtlasImage | null; mark: string | null; start?: string; alsoHref?: string;
  ledgerId?: string | null; jamesNote?: JamesNote | null; ask?: AtlasAsk[];
};
/** A point on an official layer: a park or World Heritage component, a dive site, a volcano. */
export type AtlasPoint = { id: string; name: string; group: string; line: string; url: string; lat: number; lng: number; level?: number; jamesNote?: JamesNote | null };
export type AtlasStop = { label: string; lat: number; lng: number; zoom: number; water?: "komodo" | "raja-ampat" };
/** A voyage's sailed line on the atlas: the route file's own legs (scripts/sealanes.py sea lanes, the same geometry the
 *  voyage pages and the engraved chart draw), turns rounded as the 3D voyage map rounds them. */
export type AtlasRoute = { id: string; name: string; water: "komodo" | "raja-ampat" | "other"; legs: [number, number][][] };
export type AtlasData = {
  routes: AtlasRoute[];
  entries: AtlasEntry[]; parks: AtlasPoint[]; dives: AtlasPoint[]; volcanoes: AtlasPoint[]; flight: AtlasStop[];
  volcanoAsOf: string | null; volcanoSource: string;
};
export type AtlasLayer = "pins" | "parks" | "dives" | "volcanoes";

/** One pin per filed point: entries at exactly the same coordinates (three yachts leaving Sebayor) share a pin and a
 *  card, in order. Nothing is nudged, so no position is invented. */
export type AtlasPin = { key: string; lat: number; lng: number; color: string; ids: string[]; label: string };
export function pinsOf(entries: AtlasEntry[]): AtlasPin[] {
  const by = new Map<string, AtlasPin>();
  for (const e of entries) {
    const key = `${e.lat.toFixed(5)},${e.lng.toFixed(5)}`;
    const p = by.get(key);
    if (p) { p.ids.push(e.id); if (p.color !== e.color) p.color = e.color; continue; }
    by.set(key, { key, lat: e.lat, lng: e.lng, color: e.color, ids: [e.id], label: e.name });
  }
  for (const p of by.values()) if (p.ids.length > 1) {
    const names = [...new Set(p.ids.map((id) => entries.find((e) => e.id === id)!.name))];
    p.label = names.length > 1 ? `${names[0]} and ${names.length - 1} more` : names[0];
  }
  return [...by.values()];
}

/** [[w, s], [e, n]] round a set of points. */
export function boundsOfPoints(pts: { lat: number; lng: number }[]): [[number, number], [number, number]] {
  const xs = pts.map((p) => p.lng), ys = pts.map((p) => p.lat);
  return [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
}

/** Banned in visible copy (house rules): em and en dashes, and the stock travel words. */
export const BANNED = [/—/, /–/, /bucket list/i, /hidden gem/i, /bespoke/i, /curated/i, /off the beaten path/i, /once in a lifetime/i, /unforgettable/i, /five-star/i, /paradise/i, /authentic experience/i, /wanderlust/i, /seamless/i];
export const cleanCopy = (s: string) => !BANNED.some((r) => r.test(s));

/** "James, 2024": how a James note is signed. */
export const signed = (n: JamesNote) => `James, ${n.year}`;
