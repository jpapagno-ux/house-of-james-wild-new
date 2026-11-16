import "server-only";
import staysData from "@/lib/content/stays.json";
import fxData from "@/lib/content/rates/fx.json";
import explorer from "@/lib/content/ships/polar/magellan-explorer.json";
import sandRiver from "@/lib/content/trips/the-sand-river-by-road.json";
import pioneer from "@/lib/content/trips/three-generations-at-pioneer.json";
import { POLAR_VOYAGES } from "@/lib/content/polar";
import { roomsFor } from "@/lib/content/stay-rooms";
import type { Fx, Policy, SeasonRule } from "./journey";

// The Journey Cart's example products (Booking & Checkout Studio, Sessions 03 and 03b), read from the
// records the site already holds. Nothing here is a new ID, a new rate or a new product record:
//   Leeu House               STY-2026-000149   the house booking engine (ALBIE by TAG), live, at request time
//   Ellerman House           STY-2026-000075   Ellerman House's published rates in rand (lib/content/stay-rooms.ts;
//                                              James, 15 Nov 2026: build the pilot from published rates), or its
//                                              contracted card once that is published in Airtable
//   Ellerman House Villas    STY-2026-000075   the same record's two villas, sold whole (a residence example)
//   Casali di Casole         STY-2026-000650   its published nightly rates per residence, in euros (a Gatherings example)
//   Magellan Explorer        VSL-2026-000034   Antarctica21's published from fares, as filed in the polar voyage files
//   The Sand River by Road   ITN-LAND-2026-202031   a land journey: route prices are not final, so the house quotes it
//   Three Generations at Pioneer  ITN-LAND-2026-982652   a family land journey, the same
// Supplier payment policies say only what is on file. "Not on file" is the honest answer for most of them.

type Stay = { slug: string; name: string; ledgerId: string; hero: string; tagline: string; experiences: { items: string[] } };
const stay = (ledgerId: string) => (staysData as unknown as { stays: Stay[] }).stays.find((s) => s.ledgerId === ledgerId) as Stay;

export type FeeRow = { name: string; state: "included" | "added" | "not_on_file" | "not_applied"; note: string };
export type Unit = { name: string; key: string; sleeps: number | null; facts: string; note: string | null };
export type StayProduct = { type: "stay"; key: string; slug: string; ledgerId: string; name: string; supplier: string; place: string; hero: string; alt: string; line: string; volume: string; unitWord: string; pricing: "albie" | "published"; engineProperty: string | null; pilotRoom: string | null; units: Unit[]; rules: SeasonRule[]; currency: string; rateSource: string; maxAdults: number; experiences: string[]; fees: FeeRow[]; inclusions: string[]; exclusions: string[]; inclusionsNote: string; policy: Policy };
export type Sailing = { date: string; dateTo: string | null; fromUsd: number | null; status: string | null; code: string | null };
export type VoyageOption = { slug: string; name: string; nights: number; route: string; checked: string; sailings: Sailing[]; inclusions: string[]; exclusions: string[]; optional: string[] };
export type VoyageProduct = { type: "voyage"; key: string; slug: string; ledgerId: string; name: string; supplier: string; place: string; hero: string; alt: string; line: string; volume: string; cabins: { type: string; size: string | null; beds: string | null }[]; voyages: VoyageOption[]; pricesNote: string; fees: FeeRow[]; policy: Policy };
export type JourneyProduct = { type: "journey"; key: string; slug: string; ledgerId: string; name: string; supplier: string; place: string; hero: string; alt: string; line: string; volume: string; nights: number; maxTravelers: number; stops: { name: string; line: string }[]; inclusions: string[]; exclusions: string[]; fees: FeeRow[]; policy: Policy };
export type Product = StayProduct | VoyageProduct | JourneyProduct;
export type Catalogue = { today: string; fx: Record<string, Fx>; products: Product[] };

const FLORIDA: FeeRow = { name: "Florida sales tax", state: "not_applied", note: "Not applied. The house adds no Florida sales tax (James, 15 Nov 2026)." };
const NOT_ON_FILE = "Not on file.";
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const tidy = (s: string) => s.replace(/\s*\[[^\]]*\]/g, "").replace(/[\u2013\u2014]/g, " to ").replace(/\s+/g, " ").trim();

// Each published season as night ranges (first night to last night, inclusive), written out from the season
// labels in lib/content/stay-rooms.ts. A season with no range here prices nothing.
const WINDOWS: Record<string, Record<string, { ranges: [string, string][]; minNights?: number; priority?: number }>> = {
  "ellerman-house": {
    h26: { ranges: [["2026-11-01", "2026-11-30"]] },
    p27: { ranges: [["2026-12-01", "2027-02-28"]] },
    h27: { ranges: [["2027-03-01", "2027-04-30"], ["2027-10-01", "2027-11-30"]] },
    l27: { ranges: [["2027-05-01", "2027-09-30"]] },
  },
  "casali-di-casole": {
    ba: { ranges: [["2027-06-12", "2027-06-18"], ["2027-09-11", "2027-09-17"]] },
    ss: { ranges: [["2027-06-12", "2027-06-18"], ["2027-09-11", "2027-09-17"]], minNights: 5, priority: 1 },
  },
};

/** A stay's published rooms and rates as cart units and night-by-night rules. `pick` chooses which rooms this product sells. */
export function published(staySlug: string, pick: (r: { name: string; basis?: string }) => boolean, defaultSleeps: number | null) {
  const file = roomsFor(staySlug);
  if (!file) return { units: [] as Unit[], rules: [] as SeasonRule[], currency: "USD", included: [] as string[], excluded: [] as string[], note: "" };
  const win = WINDOWS[staySlug] ?? {};
  const label = new Map(file.seasons.map((s) => [s.key, s.label]));
  const units: Unit[] = [], rules: SeasonRule[] = [];
  for (const r of file.rooms.filter(pick)) {
    const m = r.facts.join(" ").match(/Sleeps (\d+)/);
    const sleeps = m ? Number(m[1]) : defaultSleeps;
    const key = slug(r.name);
    units.push({ name: r.name, key, sleeps, facts: r.facts.join(" · "), note: r.rates.length ? (r.basis ?? null) : (r.note ?? "Rate on enquiry") });
    for (const rate of r.rates) for (const [a, b] of win[rate.season]?.ranges ?? []) {
      rules.push({ season: label.get(rate.season) ?? rate.season, roomKey: key, stayStart: a, stayEnd: b, baseOccupancy: sleeps ?? 99, amountMinor: rate.rate * 100, priority: win[rate.season].priority ?? 0, minNights: win[rate.season].minNights });
    }
  }
  return { units, rules, currency: file.currency, included: file.included, excluded: file.excluded, note: file.notes[0] ?? "" };
}

// Antarctica21 departures of Magellan Explorer that are filed in the Polar Crossings Voyage Ledger (Airtable base
// appJw4szEBFc9Uyf2, Departures table), with the Departure Code Airtable builds for each. Read 15 Nov 2026.
// Session 01 named this code the canonical departure ID. Sailings not filed there have no code, and none is made up.
const DEPARTURE_CODES: Record<string, Record<string, string>> = {
  "classic-antarctica-air-cruise": Object.fromEntries(["2026-11-20", "2026-12-30", "2027-01-14", "2027-01-19", "2027-01-24", "2027-01-29", "2027-02-03", "2027-02-08", "2027-02-20", "2027-02-25", "2027-03-02"].map((d) => [d, `PCS-A21-CLA-${d.slice(2).replace(/-/g, "")}-ME`])),
  "polar-circle-air-cruise": { "2027-02-13": "PCS-A21-POL-270213-ME", "2028-02-15": "PCS-A21-POL-280215-ME" },
  "antarctica-express-air-cruise": { "2026-11-17": "PCS-A21-EXP-261117-ME" },
};

const HOUSE_QUOTES: Policy = {
  payNow: { supported: false, basis: "Route prices are not final, so there is no amount to charge. The house quotes the journey against your dates." },
  deposit: null, depositNote: "The deposit is set with the house's quote, from each lodge's own terms.",
  payAtProperty: { supported: false, basis: "Does not apply to a journey of several lodges." },
  balance: "Set with the quote.", cancellation: "Set with the quote, from each lodge's own terms.",
};

type TripFile = { id: string; h1: string; sub: string; ledgerline: string; answer: string; lodges: { name: string; line: string }[]; incl: string[]; excl: string[]; seo: { path: string } };
function journey(t: TripFile, maxTravelers: number): JourneyProduct {
  return {
    type: "journey", key: t.id, slug: t.id, ledgerId: t.ledgerline.match(/>([A-Z0-9-]+)<\/span>/)?.[1] ?? "", name: t.h1, supplier: "James Wild & Co", place: tidy(t.sub.split("·").slice(2).join("·")),
    hero: "", alt: "", line: tidy(t.sub.split("·").slice(0, 2).join("·")), volume: "Overland journey", nights: Number(t.sub.match(/(\d+) Nights/)?.[1] ?? 0), maxTravelers,
    stops: t.lodges.map((l) => ({ name: l.name, line: tidy(l.line) })), inclusions: t.incl.map(tidy), exclusions: t.excl.map(tidy),
    fees: [{ name: "Park, reserve and gate fees", state: "not_on_file", note: "Itemised lodge by lodge with the quote. Where the route lists a fee as not included, it is shown under Not included." }, FLORIDA],
    policy: HOUSE_QUOTES,
  };
}

export function pilotCatalogue(today: string): Catalogue {
  const leeu = stay("STY-2026-000149"), ellerman = stay("STY-2026-000075"), casali = stay("STY-2026-000650");
  const ship = explorer as unknown as { slug: string; name: string; ledgerId: string; operator: string; tagline: string; hero: { url: string; alt: string }; cabins: { type: string; size: string | null; beds: string | null }[]; pricesNote: string };
  const eRooms = published("ellerman-house", (r) => !r.basis, 2), eVillas = published("ellerman-house", (r) => Boolean(r.basis), null), cRes = published("casali-di-casole", () => true, null);

  const voyages: VoyageOption[] = POLAR_VOYAGES
    .filter((v) => v.operator === "Antarctica21" && v.status !== "sold-out")
    .map((v) => ({
      slug: v.slug, name: v.name, nights: v.nights, route: v.route, checked: v.checked,
      sailings: v.sailings.filter((s) => s.ship === ship.slug && s.date >= today).map((s) => ({ date: s.date, dateTo: s.dateTo ?? null, fromUsd: typeof s.prices.From === "number" ? s.prices.From : null, status: s.status, code: DEPARTURE_CODES[v.slug]?.[s.date] ?? null })),
      inclusions: v.inclusions, exclusions: v.exclusions, optional: v.optional.map((o) => o.name),
    }))
    .filter((v) => v.sailings.length > 0)
    .sort((a, b) => b.sailings.length - a.sailings.length);

  const ellermanPolicy: Policy = {
    payNow: { supported: false, basis: "Ellerman House's payment terms are not on file, and its rate card in Airtable is still a draft." },
    deposit: null, depositNote: "Deposit terms are open on the draft rate card. The house confirms them with the quote.",
    payAtProperty: { supported: false, basis: "Not stated. Ellerman House's payment terms are not on file." },
    balance: NOT_ON_FILE, cancellation: "Not on file. The house confirms deposit and cancellation terms with your quote, before anything is charged.",
  };
  const ellermanFees: FeeRow[] = [
    { name: "South African VAT", state: "not_on_file", note: "Whether the published rate includes VAT is open on the draft rate card." },
    { name: "Tourism levy", state: "not_on_file", note: "Open on the draft rate card." },
    FLORIDA,
  ];
  const ellermanBase = { type: "stay" as const, slug: ellerman.slug, ledgerId: ellerman.ledgerId, supplier: "Ellerman House", place: "Bantry Bay, Cape Town, South Africa", hero: ellerman.hero, alt: "Ellerman House above Bantry Bay, Cape Town", pricing: "published" as const, engineProperty: null, pilotRoom: null, currency: "ZAR", rateSource: "Ellerman House's published rates, read from its own site on 10 Nov 2026", fees: ellermanFees, inclusions: eRooms.included, exclusions: eRooms.excluded, inclusionsNote: "", policy: ellermanPolicy };

  return {
    today,
    fx: Object.fromEntries(Object.entries(fxData.rates).map(([c, rate]) => [c, { rate, date: fxData.date, source: fxData.source }])),
    products: [
      {
        type: "stay", key: "leeu-house", slug: leeu.slug, ledgerId: leeu.ledgerId, name: "Leeu House", supplier: "Leeu Collection", place: "Franschhoek, South Africa",
        hero: leeu.hero, alt: "Leeu House, Franschhoek", line: leeu.tagline, volume: "Stay", unitWord: "Room",
        pricing: "albie", engineProperty: "leeu-house", pilotRoom: "Classic Room", units: [], rules: [], currency: "USD", rateSource: "", maxAdults: 4, experiences: leeu.experiences.items,
        fees: [
          { name: "South African VAT", state: "not_on_file", note: "The booking engine returns one total for the room and plan. Whether VAT sits inside that total is not stated in the feed." },
          { name: "Tourism levy", state: "not_on_file", note: "Not itemised by the booking engine feed." },
          { name: "Other mandatory charges", state: "not_on_file", note: "None are itemised by the feed. The house confirms with Leeu Collection before anything is charged." },
          FLORIDA,
        ],
        inclusions: [], exclusions: [],
        inclusionsNote: "What the rate includes follows the rate plan the booking engine prices (shown on the line). The plan's own inclusion list is not in the feed, so none is printed here.",
        policy: {
          payNow: { supported: true, basis: "Paid on the house booking engine (ALBIE by TAG), which collects the payment and settles with Leeu Collection. The house site takes no payment for this stay; this preview simulates the hand-off." },
          deposit: null, depositNote: "Deposit terms are not in the booking engine feed and no contracted card is on file for Leeu House.",
          payAtProperty: { supported: false, basis: "Not stated by Leeu Collection or by the booking engine feed." },
          balance: NOT_ON_FILE, cancellation: "Follows the rate plan the engine prices. The plan's cancellation terms are not in the feed.",
        },
      },
      { ...ellermanBase, key: "ellerman-house", name: "Ellerman House", line: ellerman.tagline, volume: "Stay", unitWord: "Room category", units: eRooms.units, rules: eRooms.rules, maxAdults: 2, experiences: ellerman.experiences.items },
      { ...ellermanBase, key: "ellerman-house-villas", name: "Ellerman House Villas", line: "Villa One and Villa Two, below the house: each taken whole, with a private chef and hospitality team.", volume: "Residence", unitWord: "Villa", units: eVillas.units, rules: eVillas.rules, maxAdults: 10, experiences: [] },
      {
        type: "stay", key: "casali-di-casole", slug: casali.slug, ledgerId: casali.ledgerId, name: "Casali di Casole", supplier: "Casali di Casole", place: "Tuscany, Italy",
        hero: casali.hero, alt: "Casali di Casole, Tuscany", line: casali.tagline, volume: "Residence · Gatherings", unitWord: "Residence",
        pricing: "published", engineProperty: null, pilotRoom: null, units: cRes.units, rules: cRes.rules, currency: cRes.currency, rateSource: "Casali di Casole's published nightly rates, read from its own booking engine on 12 Nov 2026", maxAdults: 16, experiences: [],
        fees: [
          { name: "Italian VAT (10%)", state: "included", note: "Included in the published nightly rate, per Casali di Casole." },
          { name: "Local tourist tax", state: "not_on_file", note: "Not stated on the pages read." },
          FLORIDA,
        ],
        inclusions: cRes.included, exclusions: cRes.excluded, inclusionsNote: "",
        policy: {
          payNow: { supported: false, basis: "No trade agreement or payment terms are on file for Casali di Casole." },
          deposit: null, depositNote: "Deposit terms are not on file.",
          payAtProperty: { supported: false, basis: "Not stated." },
          balance: NOT_ON_FILE, cancellation: NOT_ON_FILE,
        },
      },
      {
        type: "voyage", key: ship.slug, slug: ship.slug, ledgerId: ship.ledgerId, name: ship.name, supplier: ship.operator, place: "Antarctica, from Punta Arenas",
        hero: ship.hero.url, alt: ship.hero.alt, line: ship.tagline, volume: "Voyage",
        cabins: ship.cabins.map((c) => ({ type: c.type, size: c.size, beds: c.beds })), voyages, pricesNote: ship.pricesNote,
        fees: [
          { name: "IAATO passenger fee", state: "included", note: "Included in the fare, per Antarctica21's inclusions." },
          { name: "Port charges and other taxes", state: "not_on_file", note: "Antarctica21's fare breakdown is not on file." },
          { name: "Single supplement", state: "not_on_file", note: "None in the Single Veranda Cabin; 85% or 100% in shared categories, per Antarctica21. The figure depends on the cabin fare, which is not on file." },
          FLORIDA,
        ],
        policy: {
          payNow: { supported: false, basis: "Antarctica21's fares by cabin are not on file. The from fare is the ship's lowest published fare, not this booking's fare. Voyages are booked with Antarctica21 through the house, never through the booking engine." },
          deposit: null, depositNote: "Antarctica21's deposit and payment schedule are not on file.",
          payAtProperty: { supported: false, basis: "Does not apply to a voyage." },
          balance: NOT_ON_FILE, cancellation: "Not on file, apart from Antarctica21's published flight contingency: a full refund of the cruise fare if guests cannot fly out by 2 PM on Day 4 (air-cruises from Punta Arenas).",
          travelerNote: "Antarctica21 refunds the cruise fare in full if guests cannot fly out by 2 PM on Day 4 (air-cruises from Punta Arenas).",
        },
      },
      journey(sandRiver as unknown as TripFile, 12),
      journey(pioneer as unknown as TripFile, 12),
    ],
  };
}

/** Slugs the preview rate-card route may read. */
export const CARD_SLUGS = ["ellerman-house", "leeu-house"];
