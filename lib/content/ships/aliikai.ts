import ra from "../trips/10-day-raja-ampat-north.json";
import { SAMPLE_ALIIKAI as S } from "../preview/aliikai";
import type { Trip } from "../trips";
import { activeGroups, endOf } from "@/lib/dates";
import type { ShipCabin, ShipDeparture, ShipItinerary, ShipPathway, ShipRecord } from "./types";

// The Aliikai vessel profile. Yacht, spaces, cabins and the 2027 schedule come
// from aliikai-voyage.com (filed on the voyage records, checked 26 Oct 2026, and
// mirrored to Airtable: Voyages & Expeditions Guide Library). The ship's story
// is the owner's own copy from the library record VSL-2026-882896.
const T = ra as unknown as Trip;
const V = T.vessel!;

// Each 2027 sailing group, and the voyage page that tells its day by day (when built).
const PAGES: Record<string, { href: string; name: string }> = {
  "Raja Ampat · North & Central": { href: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north", name: "10 Day Raja Ampat North" },
  "Komodo National Park": { href: "/voyages/komodo/aliikai-5-day-komodo-island", name: "5 Day Komodo Island" },
};
const WHERE: Record<string, { waters: string; months: string; from: string }> = {
  "Raja Ampat · North & Central": { waters: "Raja Ampat", months: "February, November, December", from: "Sorong" },
  "Raja Ampat · North & Central, shorter": { waters: "Raja Ampat", months: "February", from: "Sorong" },
  "Raja Ampat · South & Central": { waters: "Raja Ampat and Misool", months: "January to April, December", from: "Sorong" },
  "Sorong ↔ Ambon": { waters: "Raja Ampat to the Banda Sea", months: "April and October", from: "Sorong or Ambon" },
  "Spice Islands": { waters: "Banda Sea", months: "October", from: "port to confirm" },
  "Komodo & whale sharks": { waters: "Komodo, with whale sharks", months: "July", from: "port to confirm" },
  "Komodo National Park": { waters: "Komodo", months: "May to September", from: "Labuan Bajo" },
};

// Only sailings still to come (lib/dates.ts): "from", "to" and every count read these.
const groups = activeGroups(T.departures!.groups).map((g) => ({ ...g, this: false }));
const all = groups.flatMap((g) => g.sailings);
const low = all.length ? Math.min(...all.map((x) => x.price)) : null;
const high = all.length ? Math.max(...all.map((x) => x.price)) : null;
const filed = T.departures!.groups.flatMap((g) => g.sailings.map((x) => x.price));
const FILED_LOW = Math.min(...filed), FILED_HIGH = Math.max(...filed);
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;

export const ALIIKAI_SHIP = {
  slug: "aliikai",
  name: "Aliikai",
  ledgerId: "VSL-2026-882896",
  // Wild Pathways (James, 1 Nov 2026): Between Tides first (the water is the activity), Off the Map for
  // the Wayag and Misool routes and the Banda Sea crossings, A Place of Our Own for the whole-yacht charter.
  pathway: { primary: "PATH-02", secondary: ["PATH-06", "PATH-07"] } as ShipPathway,
  path: "/voyages/ships/aliikai",
  seo: {
    title: "Aliikai Phinisi Yacht: Raja Ampat & Komodo Liveaboard, 2027 Rates",
    description: `Aliikai, a 40m hand-built phinisi with 7 cabins for 14 guests, sails Raja Ampat, Komodo and the Spice Islands. ${low !== null ? `2027 voyages from ${usd(low)} pp, or` : "New dates to be announced;"} charter the whole yacht.`,
    keywords: ["Aliikai", "Aliikai yacht", "Aliikai Voyage", "Raja Ampat liveaboard", "Komodo liveaboard", "phinisi charter Indonesia", "luxury phinisi Raja Ampat"],
  },
  tagline: "A hand-built phinisi for fourteen, sailing Raja Ampat, Komodo and the Spice Islands",
  answer: `Aliikai is a 40-metre traditional phinisi, hand-built in Bulukumba, South Sulawesi and refitted in 2020, with seven en-suite cabins over three decks for up to 14 guests (15 on a private charter), a crew of twelve and an expedition leader, and a full dive centre with Nitrox. She sails Komodo from May to September, the Spice Islands in October and Raja Ampat from November to April. ${low !== null && high !== null ? `2027 shared voyages run 3 to 11 nights from ${usd(low)} to ${usd(high)} per person, double occupancy, plus 11% tax` : "New shared-voyage dates are to be announced"}; the whole yacht charters for US$10,900 a night. James sailed Raja Ampat aboard her in November 2024.`,
  quote: T.approve.quote,
  facts: V.facts.filter(([k]) => k !== "Ledger") as [string, string][],
  blurb: V.blurb,
  gallery: V.gallery ?? [],
  spaces: V.spaces ?? [],
  cabins: V.cabins ?? [],
  source: V.source,
  story: S.ship,
  why: S.whyStayHere,
  onlyHere: S.onlyHere,
  groups,
  low,
  high,
  pages: PAGES,
  where: WHERE,
  depNote: T.dep_note,
  depSource: T.departures!.source,
  charter: { rate: 10900, text: "The whole yacht, up to 15 guests, crewed and catered: US$10,900 a night plus 11% tax. Minimum 7 nights in Raja Ampat, 3 nights in Komodo. Your route, your dates." },
  proof: "James sailed Raja Ampat aboard Aliikai with his son in November 2024, ten days from Sorong to the Wayag karsts and back. It's the Raja Ampat voyage he would book again.",
  // Best-suited travellers, first-timers first, each pointed at the voyage that fits them.
  suits: [
    { who: "First-time Raja Ampat travellers", line: "The classic northern loop in the calm season, every transfer handled from Sorong.", href: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north", voyage: "10 Day Raja Ampat North" },
    { who: "First-timers to Indonesia", line: "Padar, Pink Beach, the mantas and the dragons in four nights, an hour's flight from Bali.", href: "/voyages/komodo/aliikai-5-day-komodo-island", voyage: "5 Day Komodo Island" },
    { who: "Divers and snorkellers", line: "A full dive centre with Nitrox, guided dives, and snorkelling every day for those who stay on top." },
    { who: "Couples", line: "Seven cabins, dinner on deck and the owner's cabins' private balconies at sunset." },
    { who: "Families", line: "Every cabin takes two, the Asmat bow cabin takes a third, and the upper cabins convert to twins." },
    { who: "Private groups", line: "Charter the whole yacht for up to 15 and draw your own route.", href: "#charter", voyage: "Private charter" },
  ] as { who: string; line: string; href?: string; voyage?: string }[],
  firstTime: { ...((ra as unknown as Trip).firstTime!), title: "Your First Raja Ampat, Aboard Aliikai" },
  founder: {
    title: "Sailed before it was filed",
    p1: "James sailed Raja Ampat aboard Aliikai in November 2024, ten days from Sorong to the Wayag karsts and back, with his son.",
    p2: "That voyage is why she's in the Ledger. The Komodo, Spice Islands and repositioning routes are hers too; he hasn't sailed those aboard her yet, and the pages say so.",
  },
  faqs: [
    ["How much does a voyage on Aliikai cost?", `${low !== null && high !== null ? `2027 shared voyages run from ${usd(low)} per person${low === FILED_LOW ? " for 3 nights in Komodo" : ""} to ${usd(high)}${high === FILED_HIGH ? " for the 11-night crossing between Sorong and Ambon" : ""}, in an ocean-view cabin with portholes, double occupancy, plus 11% tax.` : "New shared-voyage dates and fares are to be announced; ask James."} By the night, per person: US$850 in an ocean-view cabin, US$990 in a deluxe ocean-view cabin with windows and US$1,150 in an owner's cabin with a private balcony. Travelling solo, the single supplement is 50% of the nightly rate.`],
    ["Is Aliikai a good choice for a first trip to Raja Ampat?", "Yes. Her 10 Day Raja Ampat North is the route we recommend for a first visit: Wayag, the Passage, Penemu and the mantas at Arborek on one Sorong round trip, in the calm season, with airport transfers, meals and guided snorkelling and diving included. James sailed it aboard her in November 2024, and he has been designing journeys since 1982."],
    ["Where and when does Aliikai sail?", "Komodo National Park from May to September (with two whale shark voyages in July), the Spice Islands of the Banda Sea in October, and Raja Ampat from November to April, with crossings between Sorong and Ambon in April and late October."],
    ["How many guests does Aliikai take?", "Up to 14 guests on shared voyages and 15 on a private charter, in seven en-suite, air-conditioned cabins over three decks. Every cabin takes two; the Asmat bow cabin takes a third."],
    ["Can we charter Aliikai privately?", "Yes. The whole yacht is US$10,900 a night plus 11% tax for up to 15 guests, with a minimum of 7 nights in Raja Ampat and 3 nights in Komodo. The route is yours to draw."],
    ["Is diving included aboard Aliikai?", "Guided diving and snorkelling with Nitrox are part of every voyage, with a dive centre, a warm shower for night dives and a ventilated camera room aboard."],
    ["Has James sailed aboard Aliikai?", "Yes. James sailed Raja Ampat aboard Aliikai in November 2024. That voyage is the 10 Day Raja Ampat North."],
  ] as [string, string][],
};

// The 10 Day Raja Ampat North, day by day, for the animated itinerary on her
// page. Days from the voyage file; positions are the approximate day stops
// used on the voyage chart (no day has filed coordinates yet).
const POS: [number, number][] = [
  [-0.88, 131.25], [-0.556, 130.687], [-0.42, 130.62], [-0.565, 130.28], [-0.165, 130.05],
  [-0.27, 130.2], [-0.567, 130.52], [-0.6, 130.6], [-0.83, 130.78], [-0.88, 131.25],
];
type TripDay = { n: string; title: string; line: string; body: string };
export const ALIIKAI_ITINERARY: ShipItinerary = {
  name: "10 Day Raja Ampat North",
  nights: 9,
  direction: "Sorong round trip",
  days: ((ra as unknown as { days: TripDay[] }).days).map((d, i) => ({
    day: i + 1,
    title: d.line,
    place: d.title,
    lat: POS[i]?.[0] ?? POS[0][0],
    lng: POS[i]?.[1] ?? POS[0][1],
    summary: d.body,
  })),
};

// ---------------------------------------------------------------------------
// Aliikai on the shared ship record (voyages plan, 1 Nov 2026): the same shape as the
// Nile ships, so one template prints every vessel. Every value is read from the module
// above (aliikai-voyage.com via the voyage records); nothing is new copy except headings.
// She is priced by the night (`rateBasis: "per-night"`): each cabin carries its nightly
// rate, and each sailing its published voyage fare in an ocean-view cabin with portholes.

const S0 = ALIIKAI_SHIP;
// Cabins as filed; Koon & Savu and Dayak & Abui are two cabins each (seven in all).
const COUNTS: Record<string, number> = { "Deluxe Ocean View · Koon & Savu": 2, "Ocean View · Dayak & Abui": 2 };
const CABINS: ShipCabin[] = S0.cabins.map((c) => ({
  type: c.name, count: COUNTS[c.name] ?? 1, size: null, beds: `${c.bed}, sleeps ${c.sleeps}`, deck: c.deck,
  features: c.feats, image: c.photos[0] ?? null, night: c.night,
}));
/** The cabin the published voyage fares are for (ocean view with portholes). */
export const ALIIKAI_FARE_CABIN = "Ocean View · Dayak & Abui";
const DEPARTURES: ShipDeparture[] = groups.flatMap((g) => g.sailings.map((x) => {
  const [, leg] = x.date.split(" · ");
  return {
    date: endOf(x.date) ?? x.date, itinerary: g.name.replace("↔", "to"), direction: leg ?? `From ${WHERE[g.name]?.from ?? "port to confirm"}`,
    status: x.status, prices: { [ALIIKAI_FARE_CABIN]: x.price }, nights: x.nights, voyage: PAGES[g.name]?.href,
  };
}));

export const ALIIKAI_RECORD: ShipRecord = {
  slug: "aliikai",
  name: "Aliikai",
  brandLine: "a hand-built phinisi",
  operator: "Aliikai Voyage",
  type: "phinisi",
  waters: "Indonesia",
  country: "Indonesia",
  status: "sailing",
  seo: S0.seo,
  tagline: S0.tagline,
  answer: S0.answer,
  quote: S0.quote,
  // Charter sits in the overview (audit, 1 Nov 2026); the glance bar keeps route, nights, guests and ages.
  facts: [...S0.facts, ["Charter", `The whole yacht, ${usd(S0.charter.rate)} a night plus 11% tax`]],
  overview: [S0.blurb, S0.charter.text],
  why: [...S0.why.paragraphs, ...S0.onlyHere],
  hero: S0.gallery[0],
  gallery: S0.gallery,
  cabins: CABINS,
  deckPlans: [],
  itineraries: [ALIIKAI_ITINERARY],
  departures: DEPARTURES,
  pricesNote: "Voyage fares are per person in an ocean-view cabin with portholes, double occupancy, plus 11% tax and 7% Florida sales tax; the other cabins are priced by the night (see Cabins). Travelling solo, the single supplement is 50% of the nightly rate.",
  inclusions: [],
  children: "",
  faqs: S0.faqs,
  suits: S0.suits,
  sources: [S0.source, S0.depSource].filter(Boolean) as string[],
  film: null,
  pathway: S0.pathway,
  rateBasis: "per-night",
  glance: { route: "Raja Ampat, Komodo, Banda Sea", guests: "14, or 15 on charter" },
  proofLine: "Field verified · 2024 · James sailed Raja Ampat aboard Aliikai in November 2024",
};
