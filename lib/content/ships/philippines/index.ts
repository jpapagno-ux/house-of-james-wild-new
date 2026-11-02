import type { ShipRecord } from "../types";
import Tao from "./tao-philippines.json";

// The Philippines on the shared template (2 Nov 2026). TAO Philippines, from taophilippines.com only (photographs:
// TAO Philippines). An island expedition by local bangka between El Nido and Coron with nights in TAO's own camps,
// classified Off the Map and Rooted in Place. TAO sells departures through its own calendar, so no fares are printed.
export const PHILIPPINES_SHIPS: { data: ShipRecord; offerRefs: string[]; credit: string }[] = [
  { data: Tao as unknown as ShipRecord, offerRefs: [], credit: "TAO Philippines" },
];
