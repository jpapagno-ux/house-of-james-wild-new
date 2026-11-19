import type { ShipRecord } from "../types";
import WindSurf from "./wind-surf.json";

// Windstar in the Mediterranean (James, 19 Nov 2026: "Europe voyages ... Yes approved go"). Wind Surf, the 346-guest
// five-masted sailing yacht: Treasures of the Greek Isles weekly from Athens (May to October 2027 and 2028) and the spring
// and autumn voyages between Lisbon, Barcelona, Rome and Athens. Facts, day by days, dated sailings and from fares only
// from windstarcruises.com (ship page and voyage pages, read 19 Nov 2026). Only Wind Surf's own dates are filed; the same
// itineraries on Star Legend and Star Explorer are not. Photographs from Windstar's own site (partner, credit Windstar);
// the media kit is a follow-up, as the hero is small.
export const MEDITERRANEAN_SHIPS: { data: ShipRecord; offerRefs: string[]; credit?: string }[] = [
  { data: WindSurf as unknown as ShipRecord, offerRefs: ["wind-surf"], credit: "Windstar" },
];
