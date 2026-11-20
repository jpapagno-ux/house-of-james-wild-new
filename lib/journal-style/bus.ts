// JWC-STYLE-01: two small page events, so separate islands on the stay page can talk without a shared parent.
//  • photos: open the photograph viewer, optionally on a section tab or a given photograph;
//  • trip: the dates, travellers and room a traveller has chosen (the dates bar, a room ticket, a room photograph),
//    kept for the visit in sessionStorage so the request form already has them. Import-free.
export const PHOTOS_EVENT = "jw:journal-photos";
export const TRIP_EVENT = "jw:journal-trip";
export type PhotosAsk = { tab?: string; src?: string };
export type Trip = { arrive: string; depart: string; adults: number; children: number; room: string };
export const EMPTY_TRIP: Trip = { arrive: "", depart: "", adults: 2, children: 0, room: "" };
const key = (slug: string) => `jw:trip:${slug}`;

export function openPhotos(ask: PhotosAsk = {}) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<PhotosAsk>(PHOTOS_EVENT, { detail: ask }));
}
export function readTrip(slug: string): Trip {
  try { const v = JSON.parse(window.sessionStorage.getItem(key(slug)) ?? "null"); if (v && typeof v === "object") return { ...EMPTY_TRIP, ...v }; } catch { /* no store */ }
  return EMPTY_TRIP;
}
export function setTrip(slug: string, patch: Partial<Trip>) {
  if (typeof window === "undefined") return;
  const next = { ...readTrip(slug), ...patch };
  try { window.sessionStorage.setItem(key(slug), JSON.stringify(next)); } catch { /* kept for this page only */ }
  window.dispatchEvent(new CustomEvent<Trip>(TRIP_EVENT, { detail: next }));
}
