import BASE from "@/lib/content/search-base.json";
import { RESERVES, campReady } from "@/lib/content/reserves";
import { TRIPS } from "@/lib/content/trips";
import { SHIPS } from "@/lib/content/ships";
import { STAY_PAGES, VESSEL_PAGES } from "@/lib/content/stays";
import { recordHref } from "@/lib/ledger/urls";

// The house search index (/search/index.json), rebuilt from the Ledger on every publish (James, 4 Nov 2026: "if you
// type in Ivory Lodge, it should pull up"). It used to be a file written once on 24 Oct, so lodges and residences
// inside reserves, newer stays, ships and voyage itineraries never reached search. Now:
// - the Oct base list (names, traveller types, taglines) is kept and corrected;
// - every reserve camp, lodge, residence and suite with a page is added under its reserve (Ivory Lodge, Lion Sands);
// - every live stay page, ship page, voyage itinerary and overland route is added if missing.
// Public fields only, as before.
export const dynamic = "force-static";

type Item = { t: "stay" | "destination" | "route"; n: string; u: string; k: string; p: string | null; r: string | null; f: string[]; g: string | null };

export function GET() {
  // A reserve filed long ago as one stay (/stays/lion-sands) now has its own page and lodges; the old row goes.
  const reserveStays = new Set(RESERVES.map((r) => `/stays/${r.slug}`));
  // Only stay pages that are actually filed: drops old entries that now 404 or redirect (e.g. "Wilderness Pelo" → Pelo Camp).
  const live = new Set([...STAY_PAGES, ...VESSEL_PAGES].map((s) => `/stays/${s.slug}`));
  const items: Item[] = (BASE as { items: Item[] }).items.filter((i) => !reserveStays.has(i.u) && (!i.u.startsWith("/stays/") || live.has(i.u)));
  const seen = new Set(items.map((i) => i.u));
  const add = (i: Item) => { if (!seen.has(i.u)) { seen.add(i.u); items.push(i); } };
  const KIND = { camp: "Lodge", residence: "Private house", suite: "Suite" } as const;

  for (const r of RESERVES) {
    add({ t: "stay", n: r.name, u: `/safaris/${r.slug}`, k: "Reserve", p: r.stay.country, r: r.stay.regionSlug ?? "africa", f: [], g: r.stay.tagline });
    for (const c of r.camps) {
      if (!campReady(c)) continue;
      // The lodge's own name, plus its reserve so "Lion Sands" also finds each lodge.
      add({ t: "stay", n: `${c.name}, ${r.name}`, u: `/safaris/${r.slug}/${c.slug}`, k: KIND[c.kind], p: r.stay.country, r: r.stay.regionSlug ?? "africa", f: [], g: c.intro || null });
    }
  }
  for (const s of STAY_PAGES) if (!reserveStays.has(`/stays/${s.slug}`)) add({ t: "stay", n: s.name, u: recordHref("stay", s.slug), k: "Stay", p: s.country ?? null, r: s.regionSlug ?? null, f: [], g: s.tagline ?? null });
  for (const e of SHIPS) add({ t: "stay", n: e.data.name, u: `/voyages/ships/${e.slug}`, k: "Ship", p: null, r: null, f: [], g: null });
  for (const t of Object.values(TRIPS)) {
    add({ t: "route", n: t.h1, u: t.seo.path, k: t.kind === "voyage" ? "Voyage" : "Overland route", p: t.crumbs[2] ?? null, r: null, f: [], g: t.sub || null });
  }
  return Response.json({ builtOn: new Date().toISOString().slice(0, 10), items });
}
