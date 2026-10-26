import { STAYS, staysIn } from "./stays";
import { RESERVES } from "./reserves";
import { journeysFor } from "./preview/journeys";
import type { Count } from "@/components/destination/LedgerCounter";

// Live counts for a place, worked out from the Ledger exports at build time,
// so they grow on their own as records are filed.
// Residences: private villas, homesteads and farm houses filed as stays, plus
// residences on a reserve.
const RESIDENCE = /\b(villa|villas|homestead|farm house|residence)\b/i;
export const isResidence = (name: string, category: string | null) => RESIDENCE.test(name) && !/^la residence$/i.test(name.trim()) && category !== "hotel-only";

export function countryCounts(slug: string): Count[] {
  const stays = staysIn(slug);
  const reserves = RESERVES.filter((r) => r.stay.countrySlug === slug);
  const residences = stays.filter((s) => isResidence(s.name, s.category)).length + reserves.reduce((n, r) => n + r.camps.filter((c) => c.kind === "residence").length, 0);
  const voyages = journeysFor(slug).filter((j) => j.kind === "voyage").length;
  return [
    { label: "Stays", n: stays.length },
    { label: "Residences", n: residences },
    { label: "Voyages", n: voyages },
    { label: "Reserves", n: reserves.length },
  ];
}

export function regionCounts(region: string, countrySlugs: string[], stayCount: number): Count[] {
  const per = countrySlugs.map(countryCounts);
  const sum = (i: number) => per.reduce((n, c) => n + c[i].n, 0);
  const reserves = RESERVES.filter((r) => r.stay.regionSlug === region).length;
  const stays = Math.max(stayCount, STAYS.filter((s) => s.regionSlug === region).length);
  return [
    { label: "Stays", n: stays },
    { label: "Residences", n: sum(1) },
    { label: "Voyages", n: sum(2) },
    { label: "Reserves", n: Math.max(reserves, sum(3)) },
  ];
}
