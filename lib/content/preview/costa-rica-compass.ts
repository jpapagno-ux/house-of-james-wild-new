// Costa Rica Compass: the destination's guided finder. Three questions (who,
// which Costa Rica, when) read the Ledger and return a shortlist, a held-back
// hidden place and three ways to hand over to a person.
//
// Traveller types per stay are DRAFTS (2–3 each, approved to be drafted on
// 24 Oct 2026) awaiting James's sign-off; they become Stay.best_for in the
// library once approved. Regions group the Ledger's own area names.

export type Traveller = "honeymoon" | "family" | "adventure" | "wildlife" | "wellness" | "solo";
export type Region = "volcano" | "cloud" | "caribbean" | "pacific" | "river";
export type Season = "dry" | "green";

export const TRAVELLERS: { id: Traveller; label: string }[] = [
  { id: "honeymoon", label: "Honeymoon & couples" },
  { id: "family", label: "Family, all ages" },
  { id: "adventure", label: "Adventure" },
  { id: "wildlife", label: "Wildlife & photography" },
  { id: "wellness", label: "Wellness & rest" },
  { id: "solo", label: "Solo" },
];

// bearing = where the needle points on the compass rose, from San José.
export const REGIONS: { id: Region; label: string; line: string; bearing: number; areas: string[] }[] = [
  { id: "volcano", label: "Volcano & rainforest", line: "Arenal, hot springs and the forest canopy", bearing: 320, areas: ["Arenal & La Fortuna"] },
  { id: "cloud", label: "Cloud forest", line: "Monteverde's mist, bridges and quetzals", bearing: 300, areas: ["Monteverde Cloud Forest"] },
  { id: "caribbean", label: "Caribbean coast", line: "Afro-Caribbean villages, reef and jungle beach", bearing: 95, areas: ["South Caribbean Coast"] },
  { id: "pacific", label: "Pacific coast & Osa", line: "Whales, national parks and the wildest peninsula", bearing: 210, areas: ["Manuel Antonio", "Costa Ballena", "Osa Peninsula"] },
  { id: "river", label: "River & jungle", line: "The Pacuare, reached only by raft", bearing: 75, areas: ["Pacuare River"] },
];

export const SEASONS: { id: Season; label: string; line: string }[] = [
  { id: "dry", label: "December to April", line: "Dry season, the classic months" },
  { id: "green", label: "May to November", line: "Green season: fewer people, the Caribbean at its best" },
];

// Draft traveller types (slug → types). Awaiting approval.
export const DRAFT_TYPES: Record<string, Traveller[]> = {
  "aguas-claras": ["honeymoon", "family", "solo"],
  "amor-arenal": ["honeymoon", "wellness"],
  "arenal-springs-camp-by-nayara": ["honeymoon", "family"],
  "arenas-del-mar-resort": ["family", "wildlife", "honeymoon"],
  "kura-boutique-resort": ["honeymoon", "wellness"],
  "lapa-rios-lodge": ["wildlife", "adventure"],
  "nayara-gardens": ["honeymoon", "family"],
  "nayara-tented-camp": ["honeymoon", "wellness"],
  "noah-forest-by-tifakara": ["wellness", "honeymoon"],
  "pacuare-lodge": ["adventure", "honeymoon"],
  "senda-monteverde-lodge": ["wildlife", "family", "adventure"],
  "tabacon-thermal-resort-spa": ["wellness", "family"],
  "the-art-villa": ["family", "wellness"],
};

/** Green-season fit from the record's own best-months text. */
export function fitsSeason(bestMonths: string, season: Season) {
  const m = bestMonths.toLowerCase();
  if (season === "dry") return /dec|jan|feb|mar|apr/.test(m);
  return /may|jun|jul|aug|sep|oct|nov|january–december/.test(m);
}
