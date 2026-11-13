// One house search, opened from anywhere (James, 13 Nov 2026: "a client can type in the name of a stay, a vessel, a
// cruise, a destination, a country, an advisor ... and easy to navigate back to where they started from").
// The header owns the search panel; any page can open it, with words already typed or limited to one place, by
// calling openSearch(). The panel remembers where a reader went from a result, so the page they land on can offer
// the way back (BackToSearch).

export type SearchScope = {
  /** What the reader sees: "Italy", "Africa", "The Galápagos". */
  name: string;
  /** The region slug, when the scope is a whole region ("africa"). */
  region?: string;
  /** Country names an entry may be filed under for this place ("Ecuador", "French Polynesia"). */
  countries?: string[];
};

export type SearchOpen = { q?: string; scope?: SearchScope | null };

const EVENT = "jw:search";

export function openSearch(detail: SearchOpen = {}) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<SearchOpen>(EVENT, { detail }));
}

export function onOpenSearch(fn: (d: SearchOpen) => void) {
  const h = (e: Event) => fn((e as CustomEvent<SearchOpen>).detail ?? {});
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

// ---- the way back -------------------------------------------------------------------------------------------------

/** Where the reader came from when they chose a result: the words, the scope, the page they searched on. */
export type Trail = { q: string; scope: SearchScope | null; from: string; fromTitle: string; to: string; at: number };
const TRAIL = "jw:search-trail";
const RECENT = "jw:recent";
const TRAIL_LIFE = 3 * 60 * 60 * 1000; // three hours

const path = (u: string) => u.split(/[?#]/)[0].replace(/\/$/, "") || "/";

export function leaveTrail(t: Omit<Trail, "at">) {
  try { sessionStorage.setItem(TRAIL, JSON.stringify({ ...t, at: Date.now() })); } catch { /* storage off: no way back, no harm */ }
}

/** The trail, when the reader is on the page a search sent them to (or one step on from it, inside the same entry). */
export function trailHere(pathname: string): Trail | null {
  try {
    const t = JSON.parse(sessionStorage.getItem(TRAIL) || "null") as Trail | null;
    if (!t || Date.now() - t.at > TRAIL_LIFE) return null;
    const here = path(pathname), to = path(t.to);
    return here === to || here.startsWith(to + "/") ? t : null;
  } catch { return null; }
}

export function clearTrail() { try { sessionStorage.removeItem(TRAIL); } catch { /* */ } }

export type Recent = { n: string; u: string; k: string };

export function remember(r: Recent) {
  try {
    const list = (JSON.parse(localStorage.getItem(RECENT) || "[]") as Recent[]).filter((x) => x.u !== r.u);
    localStorage.setItem(RECENT, JSON.stringify([r, ...list].slice(0, 6)));
  } catch { /* */ }
}

export function recents(): Recent[] {
  try { return JSON.parse(localStorage.getItem(RECENT) || "[]") as Recent[]; } catch { return []; }
}

// Ships and voyages are filed under the operator's country names; a few destination pages go by another name.
const ALSO: Record<string, string[]> = {
  tahiti: ["French Polynesia"],
  "ecuador-galapagos": ["Ecuador", "Galápagos"],
  chile: ["Chile"],
  "spain-isla-mallorca": ["Spain", "Mallorca"],
  "polar-antarctica": ["Antarctica", "Antarctica Cruises"],
  "polar-arctic": ["Arctic Cruises", "Svalbard", "Greenland", "Iceland"],
};

/** The scope for a country page. */
export const countryScope = (name: string, slug: string): SearchScope => ({ name, countries: [name, ...(ALSO[slug] ?? [])] });
/** The scope for a region page: everything filed in the region, by region or by any of its countries. */
export const regionScope = (name: string, slug: string, countries: string[]): SearchScope => ({ name, region: slug, countries: [...countries, ...(ALSO[slug] ?? [])] });
