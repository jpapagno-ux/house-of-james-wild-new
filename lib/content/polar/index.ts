import { today } from "@/lib/dates";
import { activeMonths, lowestFrom, withoutDated, type MonthDeparture } from "@/lib/content/ships/months";
import type { ShipDeparture, ShipImage } from "@/lib/content/ships/types";
import type { PathwayId } from "@/lib/pathways";
import PolarCircle from "./voyages/polar-circle-air-cruise.json";
import Classic from "./voyages/classic-antarctica-air-cruise.json";
import Express from "./voyages/antarctica-express-air-cruise.json";
import SouthGeorgiaAir from "./voyages/antarctica-south-georgia-air-cruise.json";
import Inaugural from "./voyages/magellan-discoverer-inaugural-air-cruise.json";
import FSGA from "./voyages/falklands-south-georgia-antarctica.json";
import FSG from "./voyages/falklands-south-georgia.json";
import Falklands from "./voyages/falkland-islands.json";
import Patagonia from "./voyages/patagonia-chilean-fjords.json";

// Polar Crossings on James Wild & Co (James, 2 Nov 2026): the house's polar arm under To the Edges,
// at /voyages/polar, with every Antarctica21 itinerary on a page of its own. Each voyage file is
// filed from antarctica21.com (lib/content/polar/voyages/<slug>.json; photographs Antarctica21).
// What the operator does not publish is null or left out, never filled in: exact departure dates
// and fares by cabin sit in Antarctica21's live booking tool, so departures are month groups
// (lib/content/ships/months.ts) until James files the dates. Dated sailings then go in `sailings`
// and run through the shared dates grid. Promise nothing about crossing the Antarctic Circle:
// Antarctica21 says "toward the Polar Circle".

export type PolarStyle = "fly-both" | "fly-one" | "sail-both";
export type PolarDay = { day: number; title: string; place: string; lat: number; lng: number; summary: string; label?: string; indicative?: boolean };
/** An exact sailing, once filed from the operator's booking tool: date, ship, fares by cabin. */
export type PolarSailing = { date: string; dateTo?: string | null; ship: string; prices: Record<string, number>; status: string | null };
export type PolarVoyage = {
  slug: string; name: string; operatorName: string; operator: string;
  style: PolarStyle; flight: string; route: string; short: string;
  nights: number; nightsText: string | null; days: number; daysText: string | null;
  start: { place: string; airportOrPort: string }; end: { place: string; airportOrPort: string };
  ships: string[]; guests: string;
  regions: string[]; length: "short" | "medium" | "long"; monthChips: string[]; months: string[];
  seo: { title: string; description: string; keywords: string[] };
  tagline: string; answer: string; overview: string[];
  hero: ShipImage; gallery: ShipImage[];
  itinerary: PolarDay[]; itineraryNote: string | null;
  fromByShip: Record<string, number>;
  departures: MonthDeparture[]; sailings: PolarSailing[];
  inclusions: string[]; exclusions: string[]; optional: { name: string; note?: string }[];
  children: string; faqs: [string, string][]; suits: { who: string; line: string }[];
  pathway: { primary: PathwayId; secondary: PathwayId[] };
  status: "sold-out" | "not-open" | null;
  photoCredit: string; sources: string[]; checked: string;
};

export const POLAR_PATH = "/voyages/polar";
export const POLAR_CROSSINGS_URL = "https://polarcrossings.com";
export const voyagePath = (slug: string) => `${POLAR_PATH}/${slug}`;

/** The two Antarctica21 ships, by slug. Their pages are /voyages/ships/<slug>. */
export const POLAR_SHIP_NAMES: Record<string, string> = { "magellan-explorer": "Magellan Explorer", "magellan-discoverer": "Magellan Discoverer" };
export const shipName = (slug: string) => POLAR_SHIP_NAMES[slug] ?? slug;

/** The filters, in the order the categories proposal sets (trip style first). */
export const STYLES: Record<PolarStyle, { name: string; line: string }> = {
  "fly-both": { name: "Fly both ways", line: "About two hours over the Drake Passage each way, from Punta Arenas." },
  "fly-one": { name: "Fly one way, sail the other", line: "One leg across the Drake by sea, one in the air." },
  "sail-both": { name: "Sail both ways", line: "Sea voyages with no flight: the Falklands, South Georgia and the Chilean fjords." },
};
export const REGIONS: Record<string, string> = { peninsula: "Antarctic Peninsula", "polar-circle": "Toward the Polar Circle", "south-georgia-falklands": "South Georgia and the Falklands", patagonia: "Patagonia" };
export const LENGTHS: Record<PolarVoyage["length"], string> = { short: "Up to 7 nights", medium: "8 to 10 nights", long: "16 nights or more" };
export const MONTH_CHIPS: Record<string, string> = { "sep-oct": "September to October", nov: "November", dec: "December", season: "Late November to March", feb: "February", mar: "March", apr: "April" };

// Above It All is not used for voyages yet (James, 1 Nov 2026, voyages plan Part 3), so it is
// left off the polar pages even where the research suggested it.
const voyagePathway = (p: PolarVoyage["pathway"]) => ({ primary: p.primary, secondary: p.secondary.filter((x) => x !== "PATH-03" && x !== p.primary).slice(0, 2) });

/** A filed sailing as the shared dates grid reads it (itinerary = the ship, so chips colour by ship). */
export const sailingAsDeparture = (v: Pick<PolarVoyage, "name" | "route">, s: PolarSailing): ShipDeparture => ({
  date: s.date, dateTo: s.dateTo ?? null, itinerary: shipName(s.ship), direction: v.route, status: s.status, prices: s.prices, priceBasis: "cruise", voyage: v.name,
});

function settle(raw: unknown, on: string): PolarVoyage {
  const v = raw as PolarVoyage;
  const sailings = v.sailings.filter((s) => (s.dateTo ?? s.date) >= on);
  return { ...v, pathway: voyagePathway(v.pathway), sailings, departures: withoutDated(activeMonths(v.departures, on), sailings) };
}

const ON = today();
/** In the order the house lists them: fly both ways, fly one way, then the sea voyages; shortest first within each. */
export const POLAR_VOYAGES: PolarVoyage[] = [PolarCircle, Classic, Express, SouthGeorgiaAir, Inaugural, FSGA, FSG, Falklands, Patagonia]
  .map((x) => settle(x, ON))
  .sort((a, b) => Object.keys(STYLES).indexOf(a.style) - Object.keys(STYLES).indexOf(b.style) || a.nights - b.nights);

export const polarVoyage = (slug: string) => POLAR_VOYAGES.find((v) => v.slug === slug);
export const voyagesFor = (ship: string) => POLAR_VOYAGES.filter((v) => v.ships.includes(ship));

/** The lowest "from" to show for a voyage: its per-ship fares, else its remaining month groups. Never a conflicting figure. */
export function voyageFrom(v: PolarVoyage): number | null {
  if (v.status === "sold-out") return null;
  const ship = Object.values(v.fromByShip);
  return ship.length ? Math.min(...ship) : lowestFrom(v.departures);
}
export const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
export const nightsWords = (v: Pick<PolarVoyage, "nights" | "nightsText">) => `${v.nightsText ?? v.nights} nights`;
export const daysWords = (v: Pick<PolarVoyage, "days" | "daysText">) => `${v.daysText ?? v.days} days`;
/** "February" / "November and March" / "Late November to March". */
export function monthsWords(v: PolarVoyage): string {
  if (v.months.length) return v.months.length > 1 ? `${v.months.slice(0, -1).join(", ")} and ${v.months[v.months.length - 1]}` : v.months[0];
  return v.monthChips.includes("season") ? "Late November to March" : "Ask us";
}

/** The facts every polar page can rely on (Antarctica21's own pages, read 2 Nov 2026). */
export const POLAR_FACTS = {
  flight: "Antarctica21 flies only when the weather on King George Island allows. Outbound it keeps trying from Day 1 until 2 PM on Day 4, covering the Day 1 hotel, meals and Punta Arenas tours while guests wait, and refunds 100% of the cruise fare if guests still cannot fly. On the way back the ship keeps cruising until the flight is cleared, or guests fly up to a day early. No refund applies on itineraries that start in Ushuaia.",
  luggage: "25 kg (55 lb) per person on the flights, hand luggage included, with no single item over 20 kg. Extra allowance cannot be bought.",
  insurance: "Antarctica21 requires medical insurance with aero medical evacuation cover.",
  single: "Dedicated single cabins carry no single supplement. In shared cabin categories Antarctica21 charges an 85% supplement on some cabins and 100% on the rest.",
  hotel: "Punta Arenas nights are at the Cabo de Hornos Hotel or similar.",
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** The voyage's route file (scripts/build-polar-maps.py): one per ship, the same days on either. */
export const polarRouteId = (v: Pick<PolarVoyage, "route" | "nights" | "ships">, ship: string = v.ships[0]) => `${ship}-${slugify(v.route)}-${v.nights}n`;
