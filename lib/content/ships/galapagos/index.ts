import { withActiveDepartures } from "@/lib/dates";
import type { ShipRecord } from "../types";
import Origin from "./ecoventura-origin-yacht.json";
import Theory from "./ecoventura-theory-yacht.json";
import Evolve from "./ecoventura-evolve-yacht.json";
import Alya from "./alya-catamaran-galapagos.json";
import Sirius from "./sirius-yacht-galapagos.json";
import Horizon from "./galapagos-horizon-trimaran.json";
import Infinity_ from "./infinity-yacht-galapagos.json";
import SeaStar from "./new-galapagos-sea-star.json";
import NaturalParadise from "./natural-paradise-yacht.json";
import GrandMajestic from "./grand-majestic-yacht.json";
import Angel from "./galapagos-angel-yacht.json";
import Calipso from "./calipso-yacht-galapagos.json";
import Monserrat from "./monserrat-yacht-galapagos.json";
import Stella from "./galaxy-stella-yacht.json";
import EcoGalaxy from "./ecogalaxy-catamaran.json";
import Bonita from "./galaxy-bonita-yacht.json";
import Orion from "./galaxy-orion-yacht.json";
import Hermes from "./hermes-galapagos.json";

// The Galápagos yachts, filed 1 Nov 2026 from ecoventura.com and Galaxy Cruises' own site and
// booking feed (photographs: each operator). Ecoventura publishes one weekly schedule for its
// three yachts together, so each page prints it as the fleet schedule (`fleetSchedule`).
// Past departures drop here (lib/dates.ts). No offers: Ecoventura's end inside 30 days and
// Galaxy's promotional fares are undated (house rule). Ecoventura's minimum child age differs
// between its own pages, so it is left out (glance: "Ask us"); Galaxy publishes no cabin sizes
// or balcony counts, so none are printed.
//
// The portfolio (James, 2 Nov 2026): seven Royal Galapagos yachts, Vianatura's Monserrat and four more
// Galaxy Cruises yachts, from each operator's own site; photographs partner approved, credited to the
// operator. Only Galapagos Horizon has dated departures we could read (Royal Galapagos' booking engine, to
// 6 July 2027); the others print their published fares by year and length with "Ask us for dates"
// (`published`), never a made-up date. Calipso's diving weeks are held; Monserrat has no readable day by
// day, so her routes are listed by name and length. Horizon's three dated departure deals are Final Calls
// in the Offer Ledger (lib/content/offers/offers.ts).
const rec = (x: unknown) => withActiveDepartures(x as ShipRecord);
export const GALAPAGOS_SHIPS: { data: ShipRecord; offerRefs: string[]; credit: string }[] = [
  { data: rec(Origin), offerRefs: [], credit: "Ecoventura" },
  { data: rec(Theory), offerRefs: [], credit: "Ecoventura" },
  { data: rec(Evolve), offerRefs: [], credit: "Ecoventura" },
  { data: rec(Alya), offerRefs: [], credit: "Galaxy Cruises" },
  { data: rec(Sirius), offerRefs: [], credit: "Galaxy Cruises" },
  { data: rec(Horizon), offerRefs: ["galapagos-horizon-trimaran"], credit: "Royal Galapagos" },
  ...[Infinity_, SeaStar, NaturalParadise, GrandMajestic, Angel, Calipso].map((x) => ({ data: rec(x), offerRefs: [], credit: "Royal Galapagos" })),
  { data: rec(Monserrat), offerRefs: [], credit: "Vianatura" },
  ...[Stella, EcoGalaxy, Bonita, Orion].map((x) => ({ data: rec(x), offerRefs: [], credit: "Galaxy Cruises" })),
  // Via Natura's Hermes (filed 2 Nov 2026 from vianatura.com; photographs: Vianatura). No dated departures are
  // published, so she carries fares by cruise length (lengthFares) and "Ask us for dates".
  { data: rec(Hermes), offerRefs: [], credit: "Vianatura" },
];
