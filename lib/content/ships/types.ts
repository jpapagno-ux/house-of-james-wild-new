// The shared ship record (one JSON file per ship, lib/content/ships/<group>/<slug>.json).
// Shape agreed for the Nile ships on 1 Nov 2026; Aliikai keeps her own module and
// is mapped onto the same template pieces. Every fact comes from the operator's
// own site (CLAUDE.md, "Sources").

import type { PathwayId } from "@/lib/pathways";

export type ShipImage = { url: string; alt: string; credit?: string };
/** Wild Pathways on a ship (James, 1 Nov 2026): house classification, printed as the same chips as stay pages. */
export type ShipPathway = { primary: PathwayId; secondary: PathwayId[] };
export type ShipDay = { day: number; title: string; place: string; lat: number; lng: number; summary: string };
/** nights null and no days: a private charter whose route is set with the guest. */
export type ShipItinerary = { name: string; nights: number | null; direction: string; days: ShipDay[] };
export type ShipCabin = { type: string; count: number | null; size: string | null; beds: string | null; deck: string | null; features: string[]; image?: ShipImage | null };
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
};
export const isPackage = (d: ShipDeparture) => d.priceBasis === "package";
export const cruiseOnly = (s: Pick<ShipRecord, "departures">) => s.departures.filter((d) => !isPackage(d));
export const packages = (s: Pick<ShipRecord, "departures">) => s.departures.filter(isPackage);
export const isBand = (d: ShipDeparture) => !!d.dateTo;
/** A film: a YouTube id, or an id with a title. null shows the "Film coming soon" panel. */
export type ShipFilm = string | { id: string; title?: string } | null;

export type ShipRecord = {
  slug: string;
  name: string;
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
  suits: { who: string; line: string }[];
  sources: string[];
  film: ShipFilm;
  /** Optional Wild Pathways (house classification, not operator copy). */
  pathway?: ShipPathway;
};

export const filmId = (f: ShipFilm | undefined) => (!f ? null : typeof f === "string" ? f : f.id);

const prices = (d: ShipDeparture) => Object.values(d.prices).filter((p): p is number => typeof p === "number" && p > 0);
const open = (d: ShipDeparture) => !/full|sold/i.test(d.status ?? "");

/** Lowest published cruise fare per person across open departures (all if none open). Package journeys never count. */
export function fromPrice(s: Pick<ShipRecord, "departures">): number | null {
  const cruise = cruiseOnly(s);
  const pool = cruise.filter(open).length ? cruise.filter(open) : cruise;
  const all = pool.flatMap(prices);
  return all.length ? Math.min(...all) : null;
}

/** Lowest published fare per person for one cabin type, from the departures. */
export function cabinFrom(s: Pick<ShipRecord, "departures">, type: string): number | null {
  // A cabin can be priced by deck ("Standard Cabin (Nile Deck)"): its lowest deck is its "from".
  const all = cruiseOnly(s).flatMap((d) => Object.entries(d.prices).filter(([k]) => k === type || k.startsWith(`${type} (`)).map(([, p]) => p)).filter((p): p is number => typeof p === "number" && p > 0);
  return all.length ? Math.min(...all) : null;
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
export function priceLine(s: Pick<ShipRecord, "departures">): { kind: "cruise" | "journey" | "request" | "tba"; label: string; amount: string; basis: string } {
  if (!s.departures.length) return { kind: "tba", label: "Dates", amount: "To be announced", basis: "new dates to be announced, ask James" };
  const f = fromPrice(s);
  if (f) return { kind: "cruise", label: "From", amount: `US$${f.toLocaleString("en-US")}`, basis: "per person, cruise only, two sharing" };
  const j = journeyFrom(s);
  if (j) return { kind: "journey", label: "Journeys from", amount: `US$${j.price.toLocaleString("en-US")}`, basis: `per person for A&K's full ${j.name} journey, not the cruise alone` };
  return { kind: "request", label: "Rates", amount: "On request", basis: "private charter, priced on enquiry" };
}

/** "4 to 7 nights" or "4 nights". */
export function nightsLabel(s: Pick<ShipRecord, "itineraries">): string {
  const n = [...new Set(s.itineraries.map((i) => i.nights).filter((x): x is number => typeof x === "number"))].sort((a, b) => a - b);
  if (!n.length) return "";
  return n.length === 1 ? `${n[0]} nights` : `${n[0]} to ${n[n.length - 1]} nights`;
}

export const factOf = (s: Pick<ShipRecord, "facts">, re: RegExp) => s.facts.find(([k]) => re.test(k))?.[1] ?? null;

/** Strips em and en dashes from partner copy (house rule: none in visible copy). */
export function undash(t: string): string {
  const M = "(January|February|March|April|May|June|July|August|September|October|November|December)";
  return t.replace(new RegExp(`${M}\\s+-\\s+${M}`, "g"), "$1 to $2").replace(/(\w)\s+-\s+(\w)/g, "$1, $2").replace(/\s*[\u2014]\s*/g, ", ").replace(/(\d)\s*\u2013\s*(\d)/g, "$1 to $2").replace(/\s*\u2013\s*/g, ", ");
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
