import BASE from "@/lib/content/search-base.json";
import { RESERVES, campReady } from "@/lib/content/reserves";
import { TRIPS } from "@/lib/content/trips";
import { SHIPS } from "@/lib/content/ships";
import { STAY_PAGES, VESSEL_PAGES } from "@/lib/content/stays";
import { recordHref } from "@/lib/ledger/urls";
import { EF_CARDS, EF_PATH, efCardForHref } from "@/lib/content/exceptional-few-cards";
import { COUNTRIES } from "@/lib/content/countries";
import { WATERS_HUBS } from "@/lib/content/ships/registry";
import { REGIONS, VOLUMES } from "@/lib/site";
import { WD } from "@/lib/content/white-desert";
import { JOURNEYS, journeyPath } from "@/lib/content/ships/journeys";
import PLACES from "@/lib/content/places-library.json";

// The house search index (/search/index.json), rebuilt from the Ledger on every publish (James, 4 Nov 2026: "if you
// type in Ivory Lodge, it should pull up"). It used to be a file written once on 24 Oct, so lodges and residences
// inside reserves, newer stays, ships and voyage itineraries never reached search. Now:
// - the Oct base list (names, traveller types, taglines) is kept and corrected;
// - every reserve camp, lodge, residence and suite with a page is added under its reserve (Ivory Lodge, Lion Sands);
// - every live stay page, ship page, voyage itinerary and overland route is added if missing.
// Public fields only, as before.
export const dynamic = "force-static";

// c: every country the entry belongs to (a ship sails several), so a search scoped to a country or region finds it.
type Item = { t: "stay" | "destination" | "route" | "page"; n: string; u: string; k: string; p: string | null; r: string | null; f: string[]; g: string | null; c?: string[] };

// The house's own sections, so "polar", "journal" or "advisors" lands on the right door (James, 13 Nov 2026: "users
// can find whatever they need quickly").
const PAGES: [string, string, string][] = [
  ["Polar voyages: Antarctica and the Arctic", "/voyages/polar", "Expedition ships to the Antarctic Peninsula, South Georgia and the Arctic"],
  ["All destinations", "/destinations", "Every region and country in the Ledger"],
  ["The Atlas", "/atlas", "Every stay, camp and ship on one map"],
  ["The Compass", "/compass", "The founder's compass: where to go, by what you want from it"],
  ["The Journal", "/journal", "Field notes and stories from the road"],
  ["Advisors", "/advisors", "The advisors who plan with James, and the places they know"],
  ["The Ledger", "/the-ledger", "How every stay, camp and ship is vetted and numbered"],
  ["What's coming", "/whats-coming", "Lodges and ships opening soon"],
  ["Offers", "/offers", "On the Horizon: current offers from the house's partners"],
  ["Plan with James", "/plan", "Tell James where you are thinking of going"],
];

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
  // A ship: its cruise line and waters, so "Windstar", "HX" or "Galápagos" finds her; her countries for a scoped search.
  const regionOf = (country: string) => COUNTRIES.find((c) => c.name === country || c.name.startsWith(country))?.region ?? null;
  for (const e of SHIPS) {
    const waters = e.reg.waters.map((w) => WATERS_HUBS[w]?.name).filter(Boolean).join(", ");
    // Audit, 13 Nov 2026 (James: "not able to find yachts or vessels by name ... cruises in the Galapagos"): the
    // words people type for a ship ("yacht", "cruise", "boat") and her own itinerary names go with her.
    const itins = (e.data.itineraries ?? []).map((i) => i.name).filter(Boolean);
    const g = [e.reg.operator, waters, "Yacht, cruise, small ship", itins.join(", ")].filter(Boolean).join(" · ") || null;
    const r = regionOf(e.reg.country[0] ?? "") ?? (e.reg.waters.includes("antarctica") ? "polar-antarctica" : null);
    add({ t: "stay", n: e.data.name, u: `/voyages/ships/${e.slug}`, k: "Ship", p: e.reg.country[0] ?? null, r, f: [], g, c: e.reg.country });
    // Each published itinerary as a voyage of its own, so "Northern Islands" or "8 day Galapagos" lands on it.
    (e.data.itineraries ?? []).forEach((it) => {
      if (!it.name) return;
      const nights = it.nights ? `${it.nights} nights` : "";
      items.push({ t: "route", n: `${it.name}, ${e.data.name}`, u: it.href ?? `/voyages/ships/${e.slug}#itinerary`, k: "Voyage", p: e.reg.country[0] ?? null, r, f: [], g: [nights, e.reg.operator, waters, "cruise itinerary"].filter(Boolean).join(" · "), c: e.reg.country });
    });
  }
  // The cruising waters, so "Galapagos cruises", "Nile cruise" or "Raja Ampat yacht" finds the hub of each.
  for (const w of Object.values(WATERS_HUBS)) add({ t: "destination", n: `${w.name} cruises and yachts`, u: w.path, k: "Cruising waters", p: w.countries[0] ?? null, r: regionOf(w.countries[0] ?? ""), f: [], g: `${w.question} Ships, yachts and voyages in ${w.name}`, c: w.countries });
  // The private charter journeys (Komodo and Flores, Raja Ampat and Misool).
  for (const j of JOURNEYS) add({ t: "route", n: j.name, u: journeyPath(j.slug), k: "Voyage", p: "Indonesia", r: regionOf("Indonesia"), f: [], g: [j.line, j.park, "yacht charter cruise"].filter(Boolean).join(" · "), c: ["Indonesia"] });
  for (const t of Object.values(TRIPS)) {
    const p = t.crumbs[2] ?? null;
    add({ t: "route", n: t.h1, u: t.seo.path, k: t.kind === "voyage" ? "Voyage" : "Overland route", p, r: p ? regionOf(p) : null, f: [], g: t.sub || null });
  }
  // White Desert is a feature page of its own, not a library stay.
  add({ t: "stay", n: WD.name, u: WD.path, k: "Fly-in camp", p: "Antarctica", r: "polar-antarctica", f: ["adventure", "luxury"], g: WD.tagline, c: ["Antarctica"] });
  // Every region and country page, not only the 36 in the October list.
  for (const r of REGIONS) add({ t: "destination", n: r.label, u: r.href, k: "Region", p: null, r: r.slug, f: [], g: r.countries.map((c) => c.label).join(", ") || null });
  for (const c of COUNTRIES) add({ t: "destination", n: c.name, u: `/destinations/${c.region}/${c.slug}`, k: "Destination", p: c.regionName, r: c.region, f: [], g: c.subtitle || null, c: [c.name] });
  // Places within a country (the Alentejo, Raja Ampat and so on) that have their own page.
  for (const pl of (PLACES as { places: { slug: string; name: string; parentSlug: string; regionSlug: string; subtitle?: string }[] }).places) {
    const c = COUNTRIES.find((x) => x.slug === pl.parentSlug);
    if (c) add({ t: "destination", n: pl.name, u: `/destinations/${pl.regionSlug}/${pl.parentSlug}/${pl.slug}`, k: "Place", p: c.name, r: pl.regionSlug, f: [], g: pl.subtitle ?? null, c: [c.name] });
  }
  for (const v of VOLUMES) add({ t: "page", n: v.label, u: v.href, k: "Section", p: null, r: null, f: [], g: v.intro ?? null });
  for (const [n, u, g] of PAGES) add({ t: "page", n, u, k: "Section", p: null, r: null, f: [], g });
  // The Exceptional Few: the collection itself, and its number on each place it holds.
  items.unshift({ t: "stay", n: "The Exceptional Few", u: EF_PATH, k: "Collection", p: null, r: null, f: [], g: `${EF_CARDS.length} hand-numbered stays and ships: ${EF_CARDS.map((c) => c.name).join(", ")}` });
  for (const i of items) { const c = efCardForHref(i.u); if (c) i.g = `The Exceptional Few, ${c.label}. ${i.g ?? ""}`.trim(); }
  return Response.json({ builtOn: new Date().toISOString().slice(0, 10), items });
}
