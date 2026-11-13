// The shared ship record (one JSON file per ship, lib/content/ships/<group>/<slug>.json).
// Shape agreed for the Nile ships on 1 Nov 2026; Aliikai keeps her own module and
// is mapped onto the same template pieces. Every fact comes from the operator's
// own site (CLAUDE.md, "Sources").

import type { PathwayId } from "@/lib/pathways";
import { lowestFrom, type MonthDeparture } from "./months.ts";
import { isPast, today } from "../../dates.ts";

export type ShipImage = { url: string; alt: string; credit?: string };
/** Wild Pathways on a ship (James, 1 Nov 2026): house classification, printed as the same chips as stay pages. */
export type ShipPathway = { primary: PathwayId; secondary: PathwayId[] };
/** `label`: a day block the operator publishes as one ("Days 3 to 6"); `indicative`: the research split a
 *  published block across days, so the order is a guide only (the page says so). */
/** `mode`: how the guest reaches this day's place from the one before. Absent means the vessel sails it; "air" only
 *  where the operator's own day says the guest flies. The one field the engraved route chart (via
 *  scripts/build-ship-maps.py) and the 3D terrain map (TerrainStop.mode) both read. */
export type ShipDay = { day: number; title: string; place: string; lat: number; lng: number; summary: string; label?: string; indicative?: boolean; mode?: "air" | "sea" | "road" };
/** nights null and no days: a private charter whose route is set with the guest. nights null with days: the operator
 *  lists the stops in order but publishes no length (Amandira), so the days are labelled stops, never nights. */
/** `short`: the atlas chip label where directions repeat (polar voyages); `href`: the voyage's own page. */
export type ShipItinerary = { name: string; nights: number | null; direction: string; days: ShipDay[]; short?: string; href?: string };
/** `night`: the published rate per person per night (ships priced by the night, `rateBasis: "per-night"`). */
export type ShipCabin = { type: string; count: number | null; size: string | null; beds: string | null; deck: string | null; features: string[]; image?: ShipImage | null; night?: number | null };
/** A published fare card (James, 2 Nov 2026): where an operator publishes fares by year and length but no
 *  dated departures we can read (Royal Galapagos, Galaxy Cruises, Vianatura), the page prints the fares as
 *  published, by year and length, with "Ask us for dates". Never a made-up date. `charter`: the whole-yacht
 *  price for that length, when published. A year drops out once it has passed (lib/dates.ts). */
export type PublishedFareRow = { length: string; nights: number | null; prices: Record<string, number>; charter?: number | null; note?: string };
export type PublishedFares = { year: string; rows: PublishedFareRow[] };
export type ShipDeckPlan = { deck: string; image: ShipImage; cabins: string[] };
/** A departure, or (A&K) a season band: `date` to `dateTo`, one fare for every sailing in it. */
// priceBasis "package": the fare is for a whole A&K land and cruise journey (never a cruise fare);
// `date` is then the boarding day and `package` names the journey.
export type ShipPackage = { name: string; code?: string; days?: number; start?: string; end?: string; url?: string };
export type ShipDeparture = {
  date: string; dateTo?: string | null; season?: string | null; itinerary: string; direction: string; status: string | null;
  prices: Record<string, number | null>; priceBasis?: "cruise" | "package"; package?: ShipPackage | null;
  cabinsLeft?: Record<string, number> | null; note?: string | null; voyage?: string;
  singlePrices?: Record<string, number | null>; childPrices?: Record<string, number | null>;
  /** Nights on this sailing, when sailings differ in length (Aliikai). */
  nights?: number;
};
export const isPackage = (d: ShipDeparture) => d.priceBasis === "package";
export const cruiseOnly = (s: Pick<ShipRecord, "departures">) => s.departures.filter((d) => !isPackage(d));
export const packages = (s: Pick<ShipRecord, "departures">) => s.departures.filter(isPackage);
export const isBand = (d: ShipDeparture) => !!d.dateTo;
/** How the operator prices her: the whole cruise per person (A&K), or per person per night by cabin (Aliikai). */
export type RateBasis = "per-cruise" | "per-night";
/** A fare by cruise length (Via Natura publishes no dated departures, only a fare for each length and year):
 *  per person and, where published, the full-vessel charter, both in USD, keyed by year. */
export type LengthFare = { duration: string; nights: number; perPerson: Record<string, number>; charter?: Record<string, number> };
/** A film: a YouTube id, or an id with a title. null shows the "Film coming soon" panel. */
export type ShipFilm = string | { id: string; title?: string } | null;

export type ShipRecord = {
  slug: string;
  name: string;
  /** The vessel's Ledger ID from the Base44 library (VSL-…, the house prefix for vessels; reclassified from STY- on 13 Nov 2026), shown in the overview. */
  ledgerId?: string;
  brandLine: string;
  operator: string;
  type: "riverboat" | "dahabiya" | string;
  waters: string;
  country: string;
  status: string;
  seo: { title: string; description: string; keywords: string[] };
  tagline: string;
  answer: string;
  facts: [string, string][];
  overview: string[];
  why: string[];
  hero: ShipImage;
  gallery: ShipImage[];
  cabins: ShipCabin[];
  deckPlans: ShipDeckPlan[];
  itineraries: ShipItinerary[];
  departures: ShipDeparture[];
  pricesNote: string;
  inclusions: string[];
  exclusions?: string[];
  children: string;
  faqs: [string, string][];
  /** Who she suits; `href` and `voyage` point a traveller at the voyage that fits them. */
  suits: { who: string; line: string; href?: string; voyage?: string }[];
  sources: string[];
  film: ShipFilm;
  /** Optional Wild Pathways (house classification, not operator copy). */
  pathway?: ShipPathway;
  /** How fares are published; "per-cruise" when absent. */
  rateBasis?: RateBasis;
  /** First sailing month or day ("2026-11"): the status reads "launching <month>" until it has passed. */
  launch?: string;
  /** A line in the house voice above the answer (Aliikai: James's own words). */
  quote?: string;
  /** Glance-bar wording where the facts would run long (Aliikai's guests line). */
  glance?: Partial<Record<"route" | "guests" | "ages" | "nights", string>>;
  /** false when the operator publishes no dates or fares at all (MV Premium): the panel says "Ask us". */
  datesPublished?: boolean;
  /** The operator publishes one schedule for a fleet (Ecoventura): Dates & rates says so. */
  fleetSchedule?: string;
  /** Status line under "Why we chose her", in place of the operator line. */
  proofLine?: string;
  /** Departures known only by month (lib/content/ships/months.ts), until exact dates are filed. */
  monthly?: MonthDeparture[];
  /** Fares as published, by year and length (see PublishedFares). */
  published?: PublishedFares[];
  /** A line under the published fares (what the operator does not publish). */
  publishedNote?: string;
  /** The occupancy basis as the operator gives it ("per person, as published" where it is not stated). */
  fareBasis?: string;
  /** The unit the operator prices in: "suite" where a fare buys the whole suite for the voyage (Four Seasons Yachts;
   *  James, 13 Nov 2026: shown as published, never converted to per person). Absent means per person. */
  fareUnit?: "suite";
  /** Route combinations the operator sells (Monserrat's A+B and so on). */
  combinations?: { name: string; nights: number }[];
  /** Shown in place of the day by day when the operator publishes none we can read. */
  routesNote?: string;
  /** Fares by cruise length when no dated departures are published (Hermes): the panel says "Ask us for dates". */
  lengthFares?: LengthFare[];
  /** Payment and cancellation terms as the operator publishes them, printed under Dates & rates. */
  terms?: string[];
  /** Whole-yacht charter rates as the operator publishes them (Indonesia, James, 2 Nov 2026): one per year or
   *  one standing rate, in USD, with the basis in words ("a night for the whole yacht, plus taxes"). */
  charterRates?: { label: string; rate: number }[];
  charterBasis?: string;
  /** A published "from" for single cabins on the operator's scheduled voyages (Rascal and Rebel), dates on request. */
  cabinFrom?: { rate: number; basis: string };
  /** A line under the gallery credit (Silolona: some photographs may show her sister). */
  galleryNote?: string;
  /** The founder's testimony for a vetted vessel he has not been aboard (the NIHI Rote wording, lib/ledger/status.ts). */
  founder?: { eyebrow: string; proof: string };
};

/** The lowest published whole-yacht nightly rate, still current (a year label drops once it has passed). */
export function charterFrom(s: { charterRates?: { label: string; rate: number }[] }, on: string = today()): number | null {
  const live = (s.charterRates ?? []).filter((r) => !/^\d{4}$/.test(r.label) || !isPast(r.label, on));
  return live.length ? Math.min(...live.map((r) => r.rate)) : null;
}

/** The fare unit in words: "per suite" for a ship priced by the suite, otherwise "per person" (short: "pp"). */
export const fareUnitOf = (s: Pick<ShipRecord, "fareUnit">) => (s.fareUnit === "suite" ? { long: "per suite", short: "per suite" } : { long: "per person", short: "pp" });

/** The rate basis in words, for Dates & rates and the cabin cards. */
export const rateBasisOf = (s: Pick<ShipRecord, "rateBasis">): RateBasis => s.rateBasis ?? "per-cruise";

export const filmId = (f: ShipFilm | undefined) => (!f ? null : typeof f === "string" ? f : f.id);

const prices = (d: ShipDeparture) => Object.values(d.prices).filter((p): p is number => typeof p === "number" && p > 0);
const open = (d: ShipDeparture) => !/full|sold/i.test(d.status ?? "");

/** The lowest per-person fare by cruise length, any year (Hermes). */
export function lengthFrom(s: { lengthFares?: LengthFare[] }): { price: number; fare: LengthFare; year: string } | null {
  let best: { price: number; fare: LengthFare; year: string } | null = null;
  for (const f of s.lengthFares ?? []) for (const [year, p] of Object.entries(f.perPerson)) if (p > 0 && (!best || p < best.price)) best = { price: p, fare: f, year };
  return best;
}

/** Lowest published cruise fare per person across open departures (all if none open). Package journeys never count. */
/** Published fare years still current (a year counts to 31 December, lib/dates.ts). */
export const currentPublished = (s: { published?: PublishedFares[] }, on: string = today()) => (s.published ?? []).filter((y) => !isPast(y.year, on));
/** Lowest published per person fare across the years still current; whole-yacht prices never count. */
export function publishedFrom(s: { published?: PublishedFares[] }, cabin?: string): number | null {
  const all = currentPublished(s).flatMap((y) => y.rows.flatMap((r) => Object.entries(r.prices).filter(([k]) => !cabin || k === cabin).map(([, v]) => v))).filter((v) => v > 0);
  return all.length ? Math.min(...all) : null;
}

export function fromPrice(s: Pick<ShipRecord, "departures"> & { monthly?: MonthDeparture[]; published?: PublishedFares[]; lengthFares?: LengthFare[] }): number | null {
  const cruise = cruiseOnly(s);
  if (!cruise.length && s.lengthFares?.length) return lengthFrom(s)?.price ?? null;
  if (!cruise.length && s.monthly?.length) return lowestFrom(s.monthly);
  if (!cruise.length && s.published?.length) return publishedFrom(s);
  const pool = cruise.filter(open).length ? cruise.filter(open) : cruise;
  const all = pool.flatMap(prices);
  return all.length ? Math.min(...all) : null;
}

/** Lowest published fare per person for one cabin type, from the departures. */
export function cabinFrom(s: Pick<ShipRecord, "departures"> & Partial<Pick<ShipRecord, "cabins" | "rateBasis" | "published">>, type: string): number | null {
  // Priced by the night: the cabin's own published nightly rate.
  if (s.rateBasis === "per-night") return s.cabins?.find((c) => c.type === type)?.night ?? null;
  // A cabin can be priced by deck ("Standard Cabin (Nile Deck)"): its lowest deck is its "from".
  const all = cruiseOnly(s).flatMap((d) => Object.entries(d.prices).filter(([k]) => k === type || k.startsWith(`${type} (`)).map(([, p]) => p)).filter((p): p is number => typeof p === "number" && p > 0);
  return all.length ? Math.min(...all) : publishedFrom(s, type);
}

/** Cabin types that carry a price on at least one departure, in cabin order. */
export function pricedCabins(s: Pick<ShipRecord, "departures" | "cabins">): string[] {
  const seen = new Set(s.departures.flatMap((d) => Object.keys(d.prices).filter((k) => typeof d.prices[k] === "number")));
  const all = [...seen];
  const ordered = s.cabins.flatMap((c) => all.filter((k) => k === c.type || k.startsWith(`${c.type} (`)));
  return [...ordered, ...[...seen].filter((t) => !ordered.includes(t))];
}

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthLabel = (iso: string) => `${MON[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
export const dayLabel = (iso: string) => `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1].slice(0, 3)} ${iso.slice(0, 4)}`;

/** Departures grouped by month (season bands by the year they start), in date order. */
export function byMonth(deps: ShipDeparture[]): [string, ShipDeparture[]][] {
  const out = new Map<string, ShipDeparture[]>();
  for (const d of [...deps].sort((a, b) => a.date.localeCompare(b.date))) {
    const k = isBand(d) ? d.date.slice(0, 4) : d.date.slice(0, 7);
    out.set(k, [...(out.get(k) ?? []), d]);
  }
  return [...out.entries()].map(([k, v]) => [k.length === 4 ? `Seasons starting in ${k}` : monthLabel(`${k}-01`), v]);
}

/** "1 Oct to 30 Nov 2026" for a band, "10 Jan 2027" for a sailing. */
export function whenLabel(d: ShipDeparture): string {
  if (!d.dateTo) return dayLabel(d.date);
  const a = dayLabel(d.date), b = dayLabel(d.dateTo);
  return a.slice(-4) === b.slice(-4) ? `${a.slice(0, -5)} to ${b}` : `${a} to ${b}`;
}

/** A partner's price note made fit to print: no links, no filing notes, no offer terms (offers have their own panel). */
export function publicNote(t: string): string {
  return undash(t)
    .replace(/\s*\(https?:\/\/[^)]+\)/g, "")
    .replace(/\s*\("priceBasis"[^)]*\)/g, "")
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .filter((x) => !/dateTo|departure entry is a band|honeymoon offer|priceBasis|cabinsLeft|voyage code|in departures|https?:|^(Not )?included:/i.test(x))
    .join(" ");
}

/** The cheapest A&K land and cruise journey that sails aboard her (for "Journeys from"). */
export function journeyFrom(s: Pick<ShipRecord, "departures">): { price: number; name: string } | null {
  let best: { price: number; name: string } | null = null;
  for (const d of packages(s)) for (const p of prices(d)) if (!best || p < best.price) best = { price: p, name: d.package?.name ?? d.itinerary };
  return best;
}

/** What a card or glance bar says about price: a cruise fare, an A&K journey fare (labelled), or on request. */
// Ship records reach the pages with past departures already removed (lib/dates.ts,
// withActiveDepartures), so every "from" here reads only what is still to sail.
export function priceLine(s: Pick<ShipRecord, "departures"> & { monthly?: MonthDeparture[]; published?: PublishedFares[]; fareBasis?: string; lengthFares?: LengthFare[]; charterRates?: { label: string; rate: number }[]; charterBasis?: string }): { kind: "cruise" | "journey" | "request" | "tba" | "charter"; label: string; amount: string; basis: string } {
  // Fares by cruise length only (no dated departures published): the lowest, with its length and year.
  const lf = !s.departures.length ? lengthFrom(s) : null;
  if (lf) return { kind: "cruise", label: "From", amount: `US$${lf.price.toLocaleString("en-US")}`, basis: `per person, cruise only, ${lf.fare.nights} nights, ${lf.year} fare` };
  // Month-level departures only (dates in the operator's booking tool): the lowest published "from".
  const m = !s.departures.length && s.monthly?.length ? lowestFrom(s.monthly) : null;
  if (m) return { kind: "cruise", label: "From", amount: `US$${m.toLocaleString("en-US")}`, basis: "per person, double cabin, as the operator shows it" };
  // Fares published by year and length, no dated departures: the lowest, on the operator's own basis.
  const pf = !s.departures.length ? publishedFrom(s) : null;
  if (pf) return { kind: "cruise", label: "From", amount: `US$${pf.toLocaleString("en-US")}`, basis: `${s.fareBasis ?? "per person, as published"}, cruise only` };
  // Whole-yacht charter only, at a published nightly rate (Rascal Voyages, Celestia): the yacht, never a per person fare.
  const ch = !s.departures.length ? charterFrom(s) : null;
  if (ch) return { kind: "charter", label: "Charter from", amount: `US$${ch.toLocaleString("en-US")}`, basis: s.charterBasis ?? "a night for the whole yacht, as published" };
  // No published (or no remaining) dates or fares: "Ask us", never an invented "from".
  if (!s.departures.length) return { kind: "tba", label: "Rates", amount: "Ask us", basis: "no published dates or fares to show; ask James" };
  const f = fromPrice(s);
  if (f) return { kind: "cruise", label: "From", amount: `US$${f.toLocaleString("en-US")}`, basis: s.fareBasis ? `${s.fareBasis}, cruise only` : "per person, cruise only, two sharing" };
  const j = journeyFrom(s);
  if (j) return { kind: "journey", label: "Journeys from", amount: `US$${j.price.toLocaleString("en-US")}`, basis: `per person for A&K's full ${j.name} journey, not the cruise alone` };
  return { kind: "request", label: "Rates", amount: "On request", basis: "private charter, priced on enquiry" };
}

/** "4 to 7 nights" or "4 nights". */
export function nightsLabel(s: Pick<ShipRecord, "itineraries"> & Partial<Pick<ShipRecord, "departures" | "lengthFares" | "glance" | "combinations">>): string {
  if (s.glance?.nights) return s.glance.nights;
  // Sailings that carry their own length (Aliikai) give the true range; then fares by length (Hermes); else the
  // itineraries and any combinations the operator sells (Monserrat's routes stack to 14 nights).
  const dep = (s.departures ?? []).map((d) => d.nights).filter((x): x is number => typeof x === "number");
  const fares = (s.lengthFares ?? []).map((f) => f.nights);
  const n = [...new Set(dep.length ? dep : fares.length ? fares : [...s.itineraries.map((i) => i.nights), ...(s.combinations ?? []).map((c) => c.nights)].filter((x): x is number => typeof x === "number"))].sort((a, b) => a - b);
  if (!n.length) return "";
  return n.length === 1 ? `${n[0]} nights` : `${n[0]} to ${n[n.length - 1]} nights`;
}

export const factOf = (s: Pick<ShipRecord, "facts">, re: RegExp) => s.facts.find(([k]) => re.test(k))?.[1] ?? null;

/** Strips em and en dashes from partner copy (house rule: none in visible copy). */
export function undash(t: string): string {
  const M = "(January|February|March|April|May|June|July|August|September|October|November|December)";
  const S = "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*";
  return t.replace(new RegExp(`${M}\\s+-\\s+${M}`, "g"), "$1 to $2").replace(new RegExp(`\\b(${S})\\s*[\u2013\u2014-]\\s*(${S})\\b`, "g"), "$1 to $3").replace(/(\w)\s+-\s+(\w)/g, "$1, $2").replace(/\s*[\u2014]\s*/g, ", ").replace(/(\d)\s*\u2013\s*(\d)/g, "$1 to $2").replace(/\s*\u2013\s*/g, ", ");
}

/** One colour per cabin type, shared by the cabin cards, the deck-plan legend and Dates & rates.
 *  Cabin keys, never volume colours (those live only in lib/volumes.ts). A priced variant
 *  ("Standard Cabin (Nile Deck)") takes its cabin type's colour. */
const CABIN_KEYS = ["#2F6F73", "#B5813E", "#6B6492", "#7D8F4E", "#A4553F", "#4F7FA8"];
export function cabinColour(types: string[], name: string): string {
  const i = types.findIndex((t) => name === t || name.startsWith(`${t} (`));
  return CABIN_KEYS[Math.max(0, i) % CABIN_KEYS.length];
}

/** The route in a few words, the same on the glance bar, the hub cards and the compare table. */
export function routeOf(s: Pick<ShipRecord, "itineraries" | "waters">): string {
  const dirs = [...new Set(s.itineraries.filter((i) => i.days.length).map((i) => i.direction))];
  const [a, b] = (dirs[0] ?? "").split(" to ");
  if (dirs.length === 2 && dirs.includes(`${b} to ${a}`)) return `${[a, b].sort().reverse().join(" and ")}, either way`;
  return dirs[0] ?? s.waters;
}
