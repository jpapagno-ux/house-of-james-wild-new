import { withActiveDepartures } from "@/lib/dates";
import type { ShipPathway, ShipRecord } from "../types";
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
// Wild Pathways (house classification, 1 Nov 2026, for James's approval): Rooted in Place first for the
// temples and the river's history, Between Tides second; Zein Nile Chateau, a six-suite dahabiya sold as
// a private charter, also A Place of Our Own.
const NILE_PATHWAY: ShipPathway = { primary: "PATH-08", secondary: ["PATH-02"] };
const FILED: { data: ShipRecord; offerRefs: string[]; pathway?: ShipPathway }[] = [
  { data: NileAdventurer as unknown as ShipRecord, offerRefs: ["ak-sanctuary-nile-adventurer"] },
  { data: NileSeray as unknown as ShipRecord, offerRefs: [] },
  { data: SunBoatIii as unknown as ShipRecord, offerRefs: [] },
  { data: SunBoatIv as unknown as ShipRecord, offerRefs: [] },
  { data: ZeinNileChateau as unknown as ShipRecord, offerRefs: [], pathway: { primary: "PATH-08", secondary: ["PATH-02", "PATH-07"] } },
];

export const NILE_SHIPS = FILED.map(({ pathway, ...x }) => ({ ...x, data: { ...withActiveDepartures(x.data), pathway: x.data.pathway ?? pathway ?? NILE_PATHWAY } }));
