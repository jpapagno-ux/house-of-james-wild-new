import type { PathwayKey } from "@/lib/pathways";

// The Wild Pathways each region leads with, shown as small theme chips under the region's answer
// (James, 30 Oct 2026: "Pathways stay as small theme chips, e.g. Where the Wild Lives on Africa,
// linking to the pathway. They never replace a volume colour"). All approved by James, 31 Oct 2026.
// Chosen from each region's settings.
export const REGION_PATHWAYS: Record<string, PathwayKey[]> = {
  africa: ["where-the-wild-lives"],
  asia: ["between-tides", "rooted-in-place"],
  "central-america": ["into-the-green", "between-tides"],
  "caribbean-mexico": ["between-tides"],
  "south-america": ["above-it-all", "where-the-wild-lives"],
  oceania: ["between-tides"],
  europe: ["rooted-in-place"],
  "usa-canada": ["above-it-all", "a-place-of-our-own"],
  "polar-antarctica": ["off-the-map"],
  "polar-arctic": ["off-the-map"],
};
