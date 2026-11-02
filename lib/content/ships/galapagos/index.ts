import { withActiveDepartures } from "@/lib/dates";
import type { ShipRecord } from "../types";
import Origin from "./ecoventura-origin-yacht.json";
import Theory from "./ecoventura-theory-yacht.json";
import Evolve from "./ecoventura-evolve-yacht.json";
import Alya from "./alya-catamaran-galapagos.json";
import Sirius from "./sirius-yacht-galapagos.json";
import Hermes from "./hermes-galapagos.json";

// The Galápagos yachts, filed 1 Nov 2026 from ecoventura.com and Galaxy Cruises' own site and
// booking feed (photographs: each operator). Ecoventura publishes one weekly schedule for its
// three yachts together, so each page prints it as the fleet schedule (`fleetSchedule`).
// Past departures drop here (lib/dates.ts). No offers: Ecoventura's end inside 30 days and
// Galaxy's promotional fares are undated (house rule). Ecoventura's minimum child age differs
// between its own pages, so it is left out (glance: "Ask us"); Galaxy publishes no cabin sizes
// or balcony counts, so none are printed.
const rec = (x: unknown) => withActiveDepartures(x as ShipRecord);
export const GALAPAGOS_SHIPS: { data: ShipRecord; offerRefs: string[]; credit: string }[] = [
  { data: rec(Origin), offerRefs: [], credit: "Ecoventura" },
  { data: rec(Theory), offerRefs: [], credit: "Ecoventura" },
  { data: rec(Evolve), offerRefs: [], credit: "Ecoventura" },
  { data: rec(Alya), offerRefs: [], credit: "Galaxy Cruises" },
  { data: rec(Sirius), offerRefs: [], credit: "Galaxy Cruises" },
  // Via Natura's Hermes (filed 2 Nov 2026 from vianatura.com; photographs: Vianatura). No dated departures are
  // published, so she carries fares by cruise length (lengthFares) and "Ask us for dates".
  { data: rec(Hermes), offerRefs: [], credit: "Vianatura" },
];
