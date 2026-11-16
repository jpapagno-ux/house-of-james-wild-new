import data from "./voyages.json";
import { isPast } from "@/lib/dates";
import type { ShipDay, ShipImage } from "../types";

// SeaDream Yacht Club's published voyages, one record each (James, 16 Nov 2026: "their itineraries one by one",
// one page per voyage). Written by scripts/partners/seadream-build.mjs from seadream.com; never edited by hand.
// A voyage keeps its page after it has sailed (the page says so and points at the sailings still to come), so a
// link or a search result never lands on nothing; lists and the finder show only what is still to sail.
export type OperatorVoyage = {
  slug: string; number: string; ship: string; shipName: string; title: string; date: string; dateTo: string; nights: number;
  region: string; regionName: string; from: string; to: string; direction: string; countries: string[]; bahamas: boolean;
  collection: string[]; waitlisted: boolean; calls: string[]; hero: ShipImage | null;
  days: (ShipDay & { date: string })[]; prices: Record<string, number>; from$: number | null; maiden: boolean; route?: string;
};
export const SEADREAM_READ: string = data.read;
export const SEADREAM_ALL = data.voyages as unknown as OperatorVoyage[];
export const SEADREAM_VOYAGES = SEADREAM_ALL.filter((v) => !isPast(v.dateTo));
export const seadreamPath = (v: Pick<OperatorVoyage, "ship" | "slug">) => `/voyages/ships/${v.ship}/${v.slug}`;
export const seadreamVoyage = (ship: string, slug: string) => SEADREAM_ALL.find((v) => v.ship === ship && v.slug === slug);
export const SEADREAM_HUB = "/partners/seadream-yacht-club";
/** The other sailings of the same itinerary still to come, soonest first. */
export const sameVoyage = (v: OperatorVoyage) => SEADREAM_VOYAGES.filter((x) => x.title === v.title && x.slug !== v.slug).slice(0, 6);
/** The sailings either side of this one aboard the same yacht (back to back voyages join here). */
export function neighbours(v: OperatorVoyage): { before: OperatorVoyage | null; after: OperatorVoyage | null } {
  const mine = SEADREAM_ALL.filter((x) => x.ship === v.ship);
  const i = mine.findIndex((x) => x.slug === v.slug);
  return { before: i > 0 ? mine[i - 1] : null, after: i >= 0 && i < mine.length - 1 ? mine[i + 1] : null };
}
/** The finder's rows: only what a filter or a card needs, so the client bundle stays small. */
export type FinderRow = { href: string; title: string; ship: string; shipName: string; date: string; dateTo: string; nights: number; region: string; regionName: string; direction: string; bahamas: boolean; from$: number | null; waitlisted: boolean; maiden: boolean; calls: string };
export const finderRows = (): FinderRow[] => SEADREAM_VOYAGES.map((v) => ({ href: seadreamPath(v), title: v.title, ship: v.ship, shipName: v.shipName, date: v.date, dateTo: v.dateTo, nights: v.nights, region: v.region, regionName: v.regionName, direction: v.direction, bahamas: v.bahamas, from$: v.from$, waitlisted: v.waitlisted, maiden: v.maiden, calls: v.calls.join(", ") }));
