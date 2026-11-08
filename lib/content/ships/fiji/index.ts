import type { ShipRecord } from "../types";
import YasawaPrincessII from "./yasawa-princess-ii.json";

// Fiji (James, 5 to 7 Nov 2026): Blue Lagoon Cruises' MV Yasawa Princess II, new in 2026, 44 guests on 3, 4 and
// 7-night Yasawa cruises from Port Denarau. Facts and photographs only from bluelagooncruises.com. Positions on the
// day by day are approximate. Captain Cook Cruises' Caledonian Sky, also on James's list, ended her Fiji voyages
// in November 2024 and is not filed.
export const FIJI_SHIPS: { data: ShipRecord; offerRefs: string[]; credit?: string }[] = [
  { data: YasawaPrincessII as unknown as ShipRecord, offerRefs: [], credit: "Blue Lagoon Cruises" },
];
