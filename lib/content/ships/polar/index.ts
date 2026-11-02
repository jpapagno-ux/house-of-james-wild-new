import type { ShipRecord } from "../types";
import type { MonthDeparture } from "../months";
import { statusOf } from "../status";
import { voyagePath, voyagesFor } from "@/lib/content/polar";
import Explorer from "./magellan-explorer.json";
import Discoverer from "./magellan-discoverer.json";

// Antarctica21's two ships (filed 2 Nov 2026 from antarctica21.com; photographs and renderings
// Antarctica21). Polar Crossings sits under To the Edges (James, 2 Nov 2026), so they join the
// registry on the shared ship template. Their itineraries and departures are not copied into the
// ship files: they come from the polar voyage files (lib/content/polar), one source for the
// voyage pages, the ship pages and the atlas. Departures stay month groups (Antarctica21 keeps
// exact dates in its booking tool); a voyage's filed sailings become the ship's dated departures.
// Left out as unpublished or in conflict: cabin counts, Magellan Explorer's draft unit and flag,
// the 76-guest figure in her deck plan notes (her page header says 88).

function withVoyages(raw: unknown): ShipRecord {
  const s = raw as ShipRecord;
  const vs = voyagesFor(s.slug);
  const monthly: MonthDeparture[] = vs.flatMap((v) => v.departures.map((g) => ({
    ...g, prices: (typeof g.prices[s.slug] === "number" ? { From: g.prices[s.slug] } : {}) as Record<string, number>, itinerary: v.name, href: voyagePath(v.slug),
  })));
  const departures = vs.flatMap((v) => v.sailings.filter((x) => x.ship === s.slug).map((x) => ({
    date: x.date, dateTo: x.dateTo ?? null, itinerary: v.name, direction: v.route, status: x.status, prices: x.prices, priceBasis: "cruise" as const, voyage: v.name,
  })));
  const rec: ShipRecord = {
    ...s, departures, monthly,
    itineraries: vs.map((v) => ({ name: v.name, nights: v.nights, direction: v.route, short: `${v.short} · ${v.nights} nights`, href: voyagePath(v.slug), days: v.itinerary })),
  };
  return { ...rec, status: statusOf(rec) };
}

export const POLAR_SHIPS: { data: ShipRecord; offerRefs: string[]; credit: string }[] = [
  { data: withVoyages({ ...Explorer }), offerRefs: [], credit: "Antarctica21" },
  { data: withVoyages({ ...Discoverer, launch: "2026-12" }), offerRefs: [], credit: "Antarctica21" },
];
