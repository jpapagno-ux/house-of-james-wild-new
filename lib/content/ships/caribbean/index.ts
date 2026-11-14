import { withActiveDepartures } from "@/lib/dates";
import type { ShipRecord } from "../types";
import FourSeasonsI from "./four-seasons-i.json";

// Timeless Voyages (James, 13 Nov 2026): Four Seasons Yachts' Four Seasons I, in service since 20 March 2026. She winters
// in the Caribbean and the Bahamas and summers in the Mediterranean; filed here under her winter waters. Facts, fares and
// images only from fourseasonsyachts.com and press.fourseasons.com, read 13 Nov 2026. Every image is the brand's own
// rendering and is labelled so. Fares are per suite for the voyage (fareUnit "suite"), shown as published and never
// converted to per person. Each sailing carries its lowest published fare; fares by suite follow from the brand's fare sheet.
const live = (x: unknown) => withActiveDepartures(x as ShipRecord);
export const CARIBBEAN_SHIPS: { data: ShipRecord; offerRefs: string[]; credit?: string }[] = [
  { data: live(FourSeasonsI), offerRefs: [], credit: "Four Seasons Yachts (renderings)" },
];
