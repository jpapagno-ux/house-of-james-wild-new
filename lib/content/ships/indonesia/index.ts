import { withActiveDepartures } from "@/lib/dates";
import type { ShipRecord } from "../types";
import Amandira from "./amandira.json";
import Rascal from "./rascal.json";
import Rebel from "./rebel.json";
import ElAleph from "./el-aleph.json";
import Silolona from "./silolona.json";
import SiDatuBua from "./si-datu-bua.json";
import Celestia from "./celestia.json";
import AquaBlu from "./aqua-blu.json";

// Indonesia's ships on the shared template (Aliikai keeps her own module, lib/content/ships/aliikai.ts).
// Amandira, filed 2 Nov 2026 from aman.com only (photographs: Aman). Aman publishes no rates, dates,
// seasons or children's policy for her, so none are printed; she sails as a private yacht for one party.
// Her Raja Ampat and Amanwana routes are stops in Aman's order (no day numbers or length published).
//
// The Indonesian fleets (James, 2 Nov 2026): Rascal Voyages' Rascal, Rebel and El Aleph (rascalvoyages.com, its
// yacht information and itinerary PDFs), Silolona Sojourns' Silolona and Si Datu Bua (silolona.com) and Celestia
// (celestiayacht.com), each with her operator's photographs. Rascal and Rebel print Rascal Voyages' published
// Komodo and Raja Ampat itineraries; the charter-only yachts carry the two signature charter journeys instead
// (lib/content/ships/journeys.ts). Rates only as published: whole-yacht nightly rates (charterRates), never dates.
const rec = (x: unknown) => withActiveDepartures(x as ShipRecord);
export const INDONESIA_SHIPS: { data: ShipRecord; offerRefs: string[]; credit: string }[] = [
  { data: Amandira as unknown as ShipRecord, offerRefs: [], credit: "Aman" },
  ...[Rascal, Rebel, ElAleph].map((x) => ({ data: rec(x), offerRefs: [], credit: "Rascal Voyages" })),
  ...[Silolona, SiDatuBua].map((x) => ({ data: rec(x), offerRefs: [], credit: "Silolona Sojourns" })),
  { data: rec(Celestia), offerRefs: [], credit: "Celestia Yacht" },
  // Aqua Expeditions' Aqua Blu (scripts/partners/aqua-build.mjs, 13 Nov 2026): every route, departure and fare.
  { data: rec(AquaBlu), offerRefs: [], credit: "Aqua Expeditions" },
];
