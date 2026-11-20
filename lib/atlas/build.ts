import "server-only";
import type { AtlasOffer, AtlasRecord, Collection, Interest } from "./match";
import { classifyReserveCamp, classifyRoute, classifyShip, classifyStay, conditionKind, conditionMinStay, decided, shipInterests, stayInterests, type Verdict } from "./classify";
import { parseMonths } from "./match";
import DECISIONS from "./category-decisions.json";
import HOLDS from "./holds.json";
import { STAYS, pageReady, type StayData } from "@/lib/content/stays";
import { RESERVES, campHref, campReady, campStatus } from "@/lib/content/reserves";
import { SHIP_REGISTRY } from "@/lib/content/ships/registry";
import { SHIPS } from "@/lib/content/ships/index";
import { searchItems } from "@/lib/content/ships/search";
import { TRIPS } from "@/lib/content/trips";
import { tripHeroImage } from "@/lib/content/trip-pages";
import { TRIP_PATHWAY_MAP } from "@/lib/content/pathways/trips";
import { JOURNEYS, journeyPath } from "@/lib/content/ships/journeys";
import { POLAR_VOYAGES, voyagePath } from "@/lib/content/polar";
import { TY_DOSSIERS, ty, tyPath } from "@/lib/content/terra-y";
import { COUNTRIES } from "@/lib/content/countries";
import { REGIONS } from "@/lib/site";
import { exceptionalFewFor, exceptionalFewForVessel } from "@/lib/content/exceptional-few";
import { timelessVoyageFor } from "@/lib/content/timeless-voyages";
import { liveOffers, type Offer } from "@/lib/content/offers/offers";
import { offerHref } from "@/lib/content/offers/hub";
import { statusLine, type HouseStatus } from "@/lib/ledger/status";
import { recordHref } from "@/lib/ledger/urls";
import { isPast, today } from "@/lib/dates";

// The Atlas index (Phase 01): one row per thing a traveller can open, derived at build from the same Ledger files the
// pages read. Nothing is stored anywhere new: it is rebuilt with every publish, like /search/index.json and
// /compass/ledger.json. PUBLIC, TRAVELLER-FACING FIELDS ONLY. No net rate, commission, contract term, contact or
// private note may be added to a row: the index is served to every browser (James, 20 Nov 2026).

const decisions = (DECISIONS as { decisions: Record<string, string> }).decisions;
const exclusive = new Set((DECISIONS as { exclusiveUse?: { ids: string[] } }).exclusiveUse?.ids ?? []);
/** Records whose Ledger entry contradicts itself: kept out of the Atlas until reconciled (lib/atlas/holds.json). */
const held = new Set(Object.keys((HOLDS as { held: Record<string, string> }).held));
const KIND_WORD: Record<string, string> = { hotel: "Hotel", guesthouse: "Guesthouse", resort: "Resort", lodge: "Lodge", camp: "Camp", villa: "Villa", private_house: "Private house", riverboat: "Riverboat", dahabiya: "Dahabiya", phinisi: "Phinisi", catamaran: "Catamaran", yacht: "Yacht", schooner: "Schooner", "river-yacht": "River yacht", "motor-yacht": "Motor yacht", "expedition-ship": "Expedition ship", trimaran: "Trimaran", bangka: "Bangka" };
const regionLabel = (slug: string | null) => REGIONS.find((r) => r.slug === slug)?.label ?? null;
const countryOf = (name: string | null) => (name ? COUNTRIES.find((c) => c.name === name || c.name.startsWith(name)) ?? null : null);
/** Best months for a country: every month any of its filed areas calls best. null when no band is filed. */
const bestMonths = (name: string | null): number[] | null => {
  const c = countryOf(name);
  if (!c || !c.months.length) return null;
  return [...new Set(c.months.flatMap((a) => a.months.flatMap((v, i) => (v === "best" ? [i] : []))))].sort((a, b) => a - b);
};
const STANDING: Record<string, number> = { founder_returned: 2, founder_vetted: 2, founder_visited: 2, partner_verified: 1 };

function offersByHref(): Map<string, AtlasOffer[]> {
  const out = new Map<string, AtlasOffer[]>();
  for (const o of liveOffers()) {
    const { href } = offerHref(o);
    if (!href || href.startsWith("/collections/")) continue;
    const row: AtlasOffer = {
      id: o.id, program: o.program, headline: o.headline, from: o.travel.from, to: o.travel.to, bookingWindow: !!o.bookingWindow, checked: o.checked,
      hasConditions: !!(o.conditions && o.conditions.trim()), condition: conditionKind(o.conditions), minStay: conditionMinStay(o.conditions), departure: (o as Offer).departure ?? null, travelUntil: o.sailingsUntil ?? null,
    };
    out.set(href, [...(out.get(href) ?? []), row]);
  }
  return out;
}

const openDepartures = (deps: readonly { date: string; dateTo?: string | null; status?: string | null }[]): [string, string][] =>
  deps.filter((d) => !/full|sold/i.test(d.status ?? "") && !isPast(d.dateTo || d.date)).map((d) => [d.date < today() ? today() : d.date, d.dateTo || d.date] as [string, string]).slice(0, 80);

export function atlasIndex(): AtlasRecord[] {
  const offers = offersByHref();
  const rows: AtlasRecord[] = [];
  const reserveSlugs = new Set(RESERVES.map((r) => r.slug));
  const campSlugs = new Set(RESERVES.flatMap((r) => r.camps.map((c) => c.slug)));
  const africa = new Set(COUNTRIES.filter((c) => c.region === "africa").map((c) => c.name));
  const push = (r: Omit<AtlasRecord, "offers" | "category" | "proposed"> & { verdict: Verdict; keys: (string | null)[] }) => {
    const { verdict, keys, ...rest } = r;
    const v = decided(verdict, keys, decisions);
    rows.push({ ...rest, category: v.category, proposed: v.category ? null : v.proposed, offers: offers.get(rest.href) ?? [] });
  };

  // Stays with a published page. A reserve filed as a stay is listed once, as its reserve (below).
  for (const s of STAYS as StayData[]) {
    if (!pageReady(s) || reserveSlugs.has(s.slug) || (s.ledgerId && held.has(s.ledgerId))) continue;
    const ef = exceptionalFewFor(s.ledgerId);
    const pathways = s.pathway?.status === "approved" ? [s.pathway.primary, ...s.pathway.secondary] : [];
    const own = parseMonths(s.bestMonths), months = own ?? bestMonths(s.country);
    push({
      id: s.ledgerId ?? `stay:${s.slug}`, kind: "stay", name: s.name, href: recordHref("stay", s.slug), filedAs: KIND_WORD[s.category ?? ""] ?? "Stay",
      country: s.country, countries: s.country ? [s.country] : [], region: s.regionSlug, regionLabel: regionLabel(s.regionSlug), tagline: s.tagline, image: s.hero,
      mark: statusLine(s.status as HouseStatus | null, s.statusDate, s.slug), collections: ef ? ["the-exceptional-few"] : [],
      interests: stayInterests({ pathways, tags: s.bestFor ?? [], setting: s.pathway?.setting ?? null, filed: s.category }),
      standing: ef ? 3 : STANDING[s.status ?? ""] ?? 0, bestMonths: months, seasonOf: own ? "place" : months ? "country" : null, familyFiled: (s.bestFor ?? []).some((b) => /famil/i.test(b)), ...(s.ledgerId && exclusive.has(s.ledgerId) ? { exclusiveUse: true } : {}), departures: null, sleeps: null, price: null, booking: s.engine ? "engine" : "request",
      verdict: classifyStay({ filed: s.category, africa: s.regionSlug === "africa", volumes: s.volumes ?? [], primaryPathway: s.pathway?.primary ?? null, inReserve: campSlugs.has(s.slug) || s.reserveChild, isReserve: false }),
      keys: [s.ledgerId, s.slug],
    });
  }

  // Reserves, and the camps, lodges and houses inside them that have a page of their own under the reserve.
  for (const r of RESERVES) {
    const common = { country: r.stay.country, countries: r.stay.country ? [r.stay.country] : [], region: r.stay.regionSlug ?? "africa", regionLabel: regionLabel(r.stay.regionSlug ?? "africa"), bestMonths: bestMonths(r.stay.country), departures: null, price: null, booking: "request" as const };
    push({ ...common, id: r.rsv || `reserve:${r.slug}`, kind: "reserve", name: r.name, href: `/safaris/${r.slug}`, filedAs: "Reserve", tagline: r.stay.tagline, image: r.stay.hero, mark: null, collections: [], interests: ["wildlife"], standing: 0, sleeps: null,
      verdict: classifyStay({ filed: null, africa: true, volumes: ["safaris"], primaryPathway: "PATH-04", inReserve: false, isReserve: true }), keys: [r.rsv, r.slug] });
    for (const c of r.camps) {
      if (!campReady(c)) continue; // a camp filed as a stay is already listed under its stay page
      const st = campStatus(r, c);
      const cap = c.rooms.map((m) => m.capacity).filter((n): n is number => typeof n === "number" && n > 0);
      push({ ...common, id: c.ledgerId ?? `camp:${r.slug}/${c.slug}`, kind: "camp", name: `${c.name}, ${r.name}`, href: campHref(r, c)!, filedAs: c.kind === "camp" ? "Lodge" : c.kind === "residence" ? "Private house" : "Private suite",
        tagline: c.intro || null, image: c.hero, mark: st ? statusLine(st.status, st.date) : null, collections: [], interests: ["wildlife"], standing: st ? STANDING[st.status] ?? 0 : 0, sleeps: cap.length ? Math.max(...cap) : null,
        verdict: classifyReserveCamp(c.kind), keys: [c.ledgerId, `${r.slug}/${c.slug}`, c.slug] });
    }
  }

  // Ships: the voyage finder's own rows (facts, fares and open months), with her dated departures where published.
  for (const x of searchItems()) {
    const reg = SHIP_REGISTRY.find((r) => r.slug === x.slug)!;
    const e = SHIPS.find((s) => s.slug === x.slug);
    const cols: Collection[] = [...(exceptionalFewForVessel(x.slug) ? (["the-exceptional-few"] as const) : []), ...(timelessVoyageFor(x.slug) ? (["timeless-voyages"] as const) : [])];
    const c0 = reg.country[0] ?? null;
    push({
      id: `ship:${x.slug}`, kind: "ship", name: x.name, href: x.href, filedAs: KIND_WORD[reg.kind] ?? "Ship", country: c0, countries: [...reg.country, ...x.where.map(String)], region: countryOf(c0)?.region ?? null, regionLabel: countryOf(c0)?.regionName ?? null,
      tagline: e?.data.tagline ?? null, image: x.image?.url ?? null, mark: null, collections: cols,
      interests: shipInterests({ types: reg.types, waters: reg.waters, activities: reg.traits?.activities ?? [], couples: x.couples, publishesChildPolicy: reg.traits?.minChildAge !== undefined }),
      standing: cols.includes("the-exceptional-few") ? 3 : 0, bestMonths: null, departures: e ? openDepartures(e.data.departures) : [], sleeps: null, minChildAge: reg.traits?.minChildAge ?? null,
      price: x.price ? { amount: x.price.amount, basis: `${x.price.label}, operator's published fare` } : null, booking: "request",
      verdict: classifyShip(reg.types, reg.kind), keys: [x.slug],
    });
  }

  // Polar voyages and the private charter journeys.
  for (const v of POLAR_VOYAGES) push({
    id: `voyage:${v.slug}`, kind: "voyage", name: v.name, href: voyagePath(v.slug), filedAs: "Polar voyage", country: "Antarctica", countries: [...v.regions, "Antarctica", "Polar"], region: "polar-antarctica", regionLabel: "Polar",
    tagline: v.tagline, image: v.hero?.url ?? null, mark: null, collections: [], interests: ["water", "wildlife", "adventure"], standing: 0, bestMonths: null, departures: openDepartures(v.sailings), sleeps: null, minChildAge: null, price: null, booking: "request",
    verdict: { category: "expedition-voyages", proposed: "expedition-voyages", review: false, reason: "Polar voyage" }, keys: [v.slug],
  });
  for (const j of JOURNEYS) push({
    id: `voyage:${j.slug}`, kind: "voyage", name: j.name, href: journeyPath(j.slug), filedAs: "Yacht charter journey", country: "Indonesia", countries: ["Indonesia"], region: countryOf("Indonesia")?.region ?? null, regionLabel: countryOf("Indonesia")?.regionName ?? null,
    tagline: j.line, image: j.hero?.url ?? null, mark: null, collections: [], interests: ["water", "islands", "adventure"], standing: 0, bestMonths: bestMonths("Indonesia"), departures: null, sleeps: null, price: null, booking: "request",
    verdict: { category: "ocean-voyages-and-yachts", proposed: "ocean-voyages-and-yachts", review: false, reason: "Private yacht charter journey" }, keys: [j.slug],
  });

  // Route files: land journeys, safari journeys and voyage routes. A polar route already listed as a voyage is not repeated.
  const listed = new Set(rows.map((r) => r.href));
  for (const [slug, t] of Object.entries(TRIPS)) {
    if (listed.has(t.seo.path)) continue;
    const country = t.crumbs[2] ?? null;
    const pw = TRIP_PATHWAY_MAP.find((e) => e.slug === slug && e.status === "approved");
    const pathways = pw ? [pw.primaryPathway, ...pw.secondaryPathways] : [];
    const interests = new Set<Interest>(stayInterests({ pathways, tags: [], setting: pw?.setting ?? null, filed: null }));
    if (t.kind !== "voyage") interests.add("adventure"); else interests.add("water");
    push({
      id: `route:${slug}`, kind: "route", name: t.h1, href: t.seo.path, filedAs: t.kind === "voyage" ? "Voyage route" : "Overland route", country, countries: country ? [country] : [], region: countryOf(country)?.region ?? null, regionLabel: countryOf(country)?.regionName ?? null,
      tagline: t.sub || null, image: tripHeroImage(t)?.url ?? null, mark: null, collections: [], interests: [...interests], standing: 0, bestMonths: bestMonths(country), departures: null, sleeps: null, price: null, booking: "request",
      verdict: classifyRoute(t.kind === "voyage" ? "voyage" : "overland", !!country && africa.has(country)), keys: [slug],
    });
  }

  // Terra Y expedition dossiers.
  for (const d of TY_DOSSIERS) push({
    id: `dossier:${d.slug}`, kind: "dossier", name: d.title, href: tyPath(d.slug), filedAs: "Expedition dossier", country: null, countries: [d.base], region: null, regionLabel: null,
    tagline: d.line, image: ty(d.hero.id, 900), mark: null, collections: [], interests: ["adventure"], standing: 0, bestMonths: null, departures: null, sleeps: null, price: null, booking: "request",
    verdict: { category: "overland-expeditions", proposed: "overland-expeditions", review: false, reason: "Terra Y expedition dossier" }, keys: [d.slug],
  });

  return rows;
}
