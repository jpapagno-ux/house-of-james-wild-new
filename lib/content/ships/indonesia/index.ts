import type { ShipRecord } from "../types";
import Amandira from "./amandira.json";

// Indonesia's ships on the shared template (Aliikai keeps her own module, lib/content/ships/aliikai.ts).
// Amandira, filed 2 Nov 2026 from aman.com only (photographs: Aman). Aman publishes no rates, dates,
// seasons or children's policy for her, so none are printed; she sails as a private yacht for one party.
// Her Raja Ampat and Amanwana routes are stops in Aman's order (no day numbers or length published).
export const INDONESIA_SHIPS: { data: ShipRecord; offerRefs: string[]; credit: string }[] = [
  { data: Amandira as unknown as ShipRecord, offerRefs: [], credit: "Aman" },
];
