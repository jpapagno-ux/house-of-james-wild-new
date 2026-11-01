import { withActiveDepartures } from "@/lib/dates";
import type { ShipRecord } from "../types";
import NileAdventurer from "./nile-adventurer.json";
import NileSeray from "./nile-seray.json";
import SunBoatIii from "./sun-boat-iii.json";
import SunBoatIv from "./sun-boat-iv.json";
import ZeinNileChateau from "./zein-nile-chateau.json";

// The A&K Sanctuary Nile fleet (Abercrombie & Kent), filed 1 Nov 2026 from
// abercrombiekent.com. Photographs: A&K Sanctuary. `offerRefs` lists any other
// slug the Offer Ledger files the ship under (the Base44 Stay slug).
// Departures and season bands past their end are dropped here (lib/dates.ts),
// so every table, "from" price and compare row reads only what is still to sail.
const FILED: { data: ShipRecord; offerRefs: string[] }[] = [
  { data: NileAdventurer as unknown as ShipRecord, offerRefs: ["ak-sanctuary-nile-adventurer"] },
  { data: NileSeray as unknown as ShipRecord, offerRefs: [] },
  { data: SunBoatIii as unknown as ShipRecord, offerRefs: [] },
  { data: SunBoatIv as unknown as ShipRecord, offerRefs: [] },
  { data: ZeinNileChateau as unknown as ShipRecord, offerRefs: [] },
];

export const NILE_SHIPS = FILED.map((x) => ({ ...x, data: withActiveDepartures(x.data) }));
