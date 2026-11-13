import { withActiveDepartures } from "@/lib/dates";
import type { ShipRecord } from "../types";
import AquaMekong from "./aqua-mekong.json";

// The Mekong (James, 13 Nov 2026): Aqua Expeditions' Aqua Mekong, built by scripts/partners/aqua-build.mjs from
// aquaexpeditions.com and Aqua's booking data (every route, departure and fare). Photographs: Aqua Expeditions.
// Day positions are approximate. Past departures drop here (lib/dates.ts).
export const MEKONG_SHIPS: { data: ShipRecord; offerRefs: string[]; credit: string }[] = [
  { data: withActiveDepartures(AquaMekong as unknown as ShipRecord), offerRefs: [], credit: "Aqua Expeditions" },
];
