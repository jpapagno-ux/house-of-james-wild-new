// Sister properties: lodges owned or run by the same group. Each stay page in a
// group shows its live sisters, so a guest can move between them. Add a group
// with its stay slugs; only stays with a built page appear.
//   Green Safaris (greensafaris.com): Zambia only. Kaya Mawa (Malawi) is left out:
//   the house does not sell Malawi (James, 31 Oct 2026).
import { STAYS, pageReady, type StayData } from "@/lib/content/stays";

export type SisterGroup = { key: string; name: string; line: string; slugs: string[] };

export const GROUPS: SisterGroup[] = [
  {
    key: "green-safaris",
    name: "Green Safaris",
    line: "Eco lodges and camps across Zambia, from the Zambezi above Victoria Falls to Kafue, South Luangwa and the Lower Zambezi.",
    slugs: ["tongabezi", "sindabezi-island-camp", "ila-safari-lodge", "chisa-busanga-camp", "shawa-luangwa-camp", "sausage-tree-camp", "potato-bush-camp"],
  },
];

export function sistersFor(slug: string): { group: SisterGroup; stays: StayData[] } | null {
  const group = GROUPS.find((g) => g.slugs.includes(slug));
  if (!group) return null;
  const stays = group.slugs.filter((s) => s !== slug).map((s) => STAYS.find((x) => x.slug === s)).filter((x): x is StayData => !!x && pageReady(x));
  return stays.length ? { group, stays } : null;
}
