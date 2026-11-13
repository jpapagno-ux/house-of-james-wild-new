import { withActiveDepartures } from "@/lib/dates";
import type { ShipRecord } from "../types";
import AquaLares from "./aqua-lares.json";

// The Seychelles, Zanzibar and the Arctic (James, 13 Nov 2026): Aqua Expeditions' Aqua Lares, which sails the
// Indian Ocean in the northern winter and Svalbard, Arctic Norway and the Scottish Isles in summer. Built by
// scripts/partners/aqua-build.mjs from aquaexpeditions.com and Aqua's booking data. Photographs: Aqua Expeditions.
export const SEYCHELLES_SHIPS: { data: ShipRecord; offerRefs: string[]; credit: string }[] = [
  { data: withActiveDepartures(AquaLares as unknown as ShipRecord), offerRefs: [], credit: "Aqua Expeditions" },
];
