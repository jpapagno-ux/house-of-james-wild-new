import { withActiveDepartures } from "@/lib/dates";
import type { ShipPathway, ShipRecord } from "../types";
import { launchSafe, statusOf } from "../status";
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
// Wild Pathways (James, 1 Nov 2026): Rooted in Place for the temples and the river's history; no
// Between Tides on a river. Zein Nile Chateau, a six-cabin dahabiya sold as a private charter, is
// Rooted in Place and A Place of Our Own.
const NILE_PATHWAY: ShipPathway = { primary: "PATH-08", secondary: [] };
const FILED: { data: ShipRecord; offerRefs: string[]; pathway?: ShipPathway }[] = [
  { data: NileAdventurer as unknown as ShipRecord, offerRefs: ["ak-sanctuary-nile-adventurer"] },
  { data: NileSeray as unknown as ShipRecord, offerRefs: [] },
  { data: SunBoatIii as unknown as ShipRecord, offerRefs: [] },
  { data: SunBoatIv as unknown as ShipRecord, offerRefs: [] },
  { data: ZeinNileChateau as unknown as ShipRecord, offerRefs: [], pathway: { primary: "PATH-08", secondary: ["PATH-07"] } },
];

// A ship with a `launch` month reads "launching ..." until it passes, then drops the clause (status.ts).
const settled = (d: ShipRecord): ShipRecord => ({
  ...d, status: statusOf(d), answer: launchSafe(d.answer, d), tagline: launchSafe(d.tagline, d),
  seo: { ...d.seo, description: launchSafe(d.seo.description, d) },
});

export const NILE_SHIPS = FILED.map(({ pathway, ...x }) => ({ ...x, data: settled({ ...withActiveDepartures(x.data), pathway: pathway ?? x.data.pathway ?? NILE_PATHWAY, rateBasis: x.data.rateBasis ?? "per-cruise" }) }));
