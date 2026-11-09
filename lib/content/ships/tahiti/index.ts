import type { ShipRecord } from "../types";
import StarBreeze from "./star-breeze.json";
import WindStar from "./wind-star.json";

// Windstar in French Polynesia (James, 2 Nov 2026): Star Breeze, the 312-guest all-suite yacht that sails Tahiti
// year round, and Wind Star, the 148-guest four-masted sailing yacht that joins her from March 2027 on the
// 7-night Dreams of Tahiti. Facts only from windstarcruises.com (ship pages, voyage pages and terms). Dated sailings,
// day by days and from fares were filed from Windstar's voyage pages on 9 Nov 2026 (per person, double occupancy,
// cruise only; taxes, fees and port expenses extra). James sailed Star Breeze with his wife (James, 9 Nov 2026). Photographs: Windstar's media kit is a follow-up; until then the hero is the house's licensed
// Tahiti lagoon image, captioned as the waters, never as the ship.
export const TAHITI_SHIPS: { data: ShipRecord; offerRefs: string[]; credit?: string }[] = [
  { data: StarBreeze as unknown as ShipRecord, offerRefs: [] },
  { data: WindStar as unknown as ShipRecord, offerRefs: [] },
];
