import type { PathwayKey } from "@/lib/pathways";

// The Wild Pathways each region leads with, shown as small theme chips under the region's answer
// (James, 30 Oct 2026: "Pathways stay as small theme chips, e.g. Where the Wild Lives on Africa,
// linking to the pathway. They never replace a volume colour"). Africa is James's example; the
// rest are proposed for his review, from each region's settings.
export const REGION_PATHWAYS: Record<string, PathwayKey[]> = {
  africa: ["where-the-wild-lives"],
  asia: ["between-tides", "rooted-in-place"], // [proposed]
  "central-america": ["into-the-green", "between-tides"], // [proposed]
  "caribbean-mexico": ["between-tides"], // [proposed]
  "south-america": ["above-it-all", "where-the-wild-lives"], // [proposed]
  oceania: ["between-tides"], // [proposed]
  europe: ["rooted-in-place"], // [proposed]
  "usa-canada": ["above-it-all", "a-place-of-our-own"], // [proposed]
  "polar-antarctica": ["off-the-map"], // [proposed]
  "polar-arctic": ["off-the-map"], // [proposed]
};
