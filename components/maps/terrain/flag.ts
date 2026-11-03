// The 3D terrain ("See it in 3D") gate: an explicit allow-list of pages (James approved the Komodo pilot live,
// 3 Nov 2026). Each call site names its page; anything not listed renders nothing, so the MapLibre chunks never load
// there. NEXT_PUBLIC_TERRAIN_PILOT=false at build is a kill switch that turns every page off.
export const TERRAIN_PAGES = [
  "voyages/indonesia/komodo-and-flores-charter",
  "voyages/ships/natural-paradise-yacht",
  "stays/ulum-moab",
  "destinations/oceania/tahiti#tahaa",
] as const;
export type TerrainPage = (typeof TERRAIN_PAGES)[number];

export const terrainOn = (page: string): page is TerrainPage =>
  process.env.NEXT_PUBLIC_TERRAIN_PILOT !== "false" && (TERRAIN_PAGES as readonly string[]).includes(page);
