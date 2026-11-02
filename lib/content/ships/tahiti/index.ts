import type { ShipRecord } from "../types";
import StarBreeze from "./star-breeze.json";
import WindStar from "./wind-star.json";

// Windstar in French Polynesia (James, 2 Nov 2026): Star Breeze, the 312-guest all-suite yacht that sails Tahiti
// year round, and Wind Star, the 148-guest four-masted sailing yacht that joins her from March 2027 on the
// 7-night Dreams of Tahiti. Facts only from windstarcruises.com (ship pages and the 2 Sep 2025 release). Windstar
// publishes no dated day by day the house can file, so no departures are listed; routes are by name only.
// James has sailed Windstar in French Polynesia with his wife, but which ship is not yet stated: no page names a
// ship he sailed. Photographs: Windstar's media kit is a follow-up; until then the hero is the house's licensed
// Tahiti lagoon image, captioned as the waters, never as the ship.
export const TAHITI_SHIPS: { data: ShipRecord; offerRefs: string[]; credit?: string }[] = [
  { data: StarBreeze as unknown as ShipRecord, offerRefs: [] },
  { data: WindStar as unknown as ShipRecord, offerRefs: [] },
];
