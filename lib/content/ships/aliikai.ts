import ra from "../trips/10-day-raja-ampat-north.json";
import { SAMPLE_ALIIKAI as S } from "../preview/aliikai";
import type { Trip } from "../trips";

// The Aliikai vessel profile. Yacht, spaces, cabins and the 2027 schedule come
// from aliikai-voyage.com (filed on the voyage records, checked 26 Oct 2026, and
// mirrored to Airtable: Voyages & Expeditions Guide Library). The ship's story
// is the owner's own copy from the library record STY-2026-882896.
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

const groups = T.departures!.groups.map((g) => ({ ...g, this: false }));
const all = groups.flatMap((g) => g.sailings);
const low = Math.min(...all.map((x) => x.price));
const high = Math.max(...all.map((x) => x.price));

export const ALIIKAI_SHIP = {
  slug: "aliikai",
  name: "Aliikai",
  ledgerId: "STY-2026-882896",
  path: "/voyages/ships/aliikai",
  seo: {
    title: "Aliikai Phinisi Yacht: Raja Ampat & Komodo Liveaboard, 2027 Rates",
    description: `Aliikai, a 40m hand-built phinisi with 7 cabins for 14 guests, sails Raja Ampat, Komodo and the Spice Islands. 2027 voyages from US$${low.toLocaleString("en-US")} pp, or charter the whole yacht.`,
    keywords: ["Aliikai", "Aliikai yacht", "Aliikai Voyage", "Raja Ampat liveaboard", "Komodo liveaboard", "phinisi charter Indonesia", "luxury phinisi Raja Ampat"],
  },
  tagline: "A hand-built phinisi for fourteen, sailing Raja Ampat, Komodo and the Spice Islands",
  answer: `Aliikai is a 40-metre traditional phinisi, hand-built in Bulukumba, South Sulawesi and refitted in 2020, with seven en-suite cabins over three decks for up to 14 guests (15 on a private charter), a crew of twelve and an expedition leader, and a full dive centre with Nitrox. She sails Komodo from May to September, the Spice Islands in October and Raja Ampat from November to April. 2027 shared voyages run 3 to 11 nights from US$${low.toLocaleString("en-US")} to US$${high.toLocaleString("en-US")} per person, double occupancy, plus 11% tax; the whole yacht charters for US$10,900 a night. James sailed Raja Ampat aboard her in November 2024.`,
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
    ["How much does a voyage on Aliikai cost?", `2027 shared voyages run from US$${low.toLocaleString("en-US")} per person for 3 nights in Komodo to US$${high.toLocaleString("en-US")} for the 11-night crossing between Sorong and Ambon, in an ocean-view cabin with portholes, double occupancy, plus 11% tax. By the night, per person: US$850 in an ocean-view cabin, US$990 in a deluxe ocean-view cabin with windows and US$1,150 in an owner's cabin with a private balcony. Travelling solo, the single supplement is 50% of the nightly rate.`],
    ["Is Aliikai a good choice for a first trip to Raja Ampat?", "Yes. Her 10 Day Raja Ampat North is the route we recommend for a first visit: Wayag, the Passage, Penemu and the mantas at Arborek on one Sorong round trip, in the calm season, with airport transfers, meals and guided snorkelling and diving included. James sailed it aboard her in November 2024, and he has been designing journeys since 1983."],
    ["Where and when does Aliikai sail?", "Komodo National Park from May to September (with two whale shark voyages in July), the Spice Islands of the Banda Sea in October, and Raja Ampat from November to April, with crossings between Sorong and Ambon in April and late October."],
    ["How many guests does Aliikai take?", "Up to 14 guests on shared voyages and 15 on a private charter, in seven en-suite, air-conditioned cabins over three decks. Every cabin takes two; the Asmat bow cabin takes a third."],
    ["Can we charter Aliikai privately?", "Yes. The whole yacht is US$10,900 a night plus 11% tax for up to 15 guests, with a minimum of 7 nights in Raja Ampat and 3 nights in Komodo. The route is yours to draw."],
    ["Is diving included aboard Aliikai?", "Guided diving and snorkelling with Nitrox are part of every voyage, with a dive centre, a warm shower for night dives and a ventilated camera room aboard."],
    ["Has James sailed aboard Aliikai?", "Yes. James sailed Raja Ampat aboard Aliikai in November 2024. That voyage is the 10 Day Raja Ampat North."],
  ] as [string, string][],
};
