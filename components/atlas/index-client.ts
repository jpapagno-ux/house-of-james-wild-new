import type { AtlasRecord } from "@/lib/atlas/match";

// The Atlas index in the browser: fetched once per visit and shared by the results and by the Where field, which
// offers record names (stays, camps, ships, voyages, routes) beside places once the index has arrived.
let INDEX: Promise<AtlasRecord[]> | null = null;
export const loadIndex = (): Promise<AtlasRecord[]> =>
  (INDEX ??= fetch("/atlas/index.json").then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); }).then((j: { records: AtlasRecord[] }) => j.records).catch((e) => { INDEX = null; throw e; }));
