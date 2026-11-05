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

// The country atlas (Indonesia first). James said "go" to a preview on 3 Nov 2026 and then approved it going live
// ("approved all move forward"), so it shows wherever this code is deployed, production included once the PR merges.
// The terrain kill switch (NEXT_PUBLIC_TERRAIN_PILOT=false) turns it off everywhere.
export const ATLAS_COUNTRIES = ["indonesia", "botswana", "tahiti", "thailand"] as const;
export const atlasOn = (country: string) =>
  process.env.NEXT_PUBLIC_TERRAIN_PILOT !== "false" && (ATLAS_COUNTRIES as readonly string[]).includes(country);
