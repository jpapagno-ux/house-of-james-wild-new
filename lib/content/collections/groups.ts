// Sister properties: lodges owned or run by the same group. Each stay page in a
// group shows its live sisters, so a guest can move between them. Add a group
// with its stay slugs; only stays with a built page appear.
//   Green Safaris (greensafaris.com): Zambia only. Kaya Mawa (Malawi) is left out:
//   the house does not sell Malawi (James, 31 Oct 2026).
//   Natural Selection and African Bush Camps added 31 Oct 2026 (brand sites).
import { STAYS, pageReady, type StayData } from "@/lib/content/stays";

export type SisterGroup = { key: string; name: string; line: string; slugs: string[] };

export const GROUPS: SisterGroup[] = [
  {
    key: "governors-camp-collection",
    name: "Governors' Camp Collection",
    line: "Tented camps on the Mara River in the Masai Mara, in the Marsh Pride's territory, and Loldia House above Lake Naivasha in the Great Rift Valley.",
    slugs: ["governors-camp", "governors-il-moran-camp", "loldia-house"],
  },
  {
    key: "green-safaris",
    name: "Green Safaris",
    line: "Eco lodges and camps across Zambia, from the Zambezi above Victoria Falls to Kafue, South Luangwa and the Lower Zambezi.",
    slugs: ["tongabezi", "sindabezi-island-camp", "ila-safari-lodge", "chisa-busanga-camp", "shawa-luangwa-camp", "sausage-tree-camp", "potato-bush-camp"],
  },
  {
    key: "natural-selection",
    name: "Natural Selection",
    line: "Camps across Botswana and Namibia. Skybeds is booked together with a stay at Tuludi or another Khwai Private Reserve camp.",
    slugs: ["tuludi-khwai", "skybeds-khwai", "sans-camp", "shipwreck-lodge-namibia", "kwessi-dunes-camp", "hoanib-valley-camp", "hoanib-elephant-camp", "etosha-mountain-lodge"],
  },
  {
    key: "african-bush-camps",
    name: "African Bush Camps",
    line: "Camps in Botswana, Zambia and Zimbabwe, from the Linyanti and the Lower Zambezi to Hwange and Mana Pools.",
    slugs: ["linyanti-ebony-camp", "linyanti-expedition-camp", "somalisa-acacia", "somalisa", "nyamatusi-camp", "lolebezi-lodge"],
  },
  {
    key: "nimali-africa",
    name: "Nimali Africa",
    line: "Tented camps in northern Tanzania, four hours' game drive apart, from the central Serengeti to the Mara River.",
    slugs: ["nimali-serengeti", "nimali-mara"],
  },
  {
    key: "kayumanis",
    name: "Kayumanis",
    line: "Private pool villa estates across Bali: Ubud, Nusa Dua, Jimbaran and Sanur, each bookable live.",
    slugs: ["kayumanis-ubud", "kayumanis-nusa-dua", "kayumanis-jimbaran-private-estates", "kayumanis-sanur"],
  },
  {
    key: "nayara",
    name: "Nayara Resorts",
    line: "One house, three countries: the Arenal rainforest in Costa Rica, a private island in Panama's Bocas del Toro, the Atacama desert and Rapa Nui in Chile. Photographs courtesy of Nayara Resorts.",
    slugs: ["nayara-gardens", "nayara-tented-camp", "arenal-springs-camp-by-nayara", "nayara-bocas-del-toro", "nayara-alto-atacama", "nayara-hangaroa"],
  },
  {
    key: "more-collection",
    name: "MORE Collection",
    line: "The More family's lodges and hotels in South Africa: Lion Sands in the Sabi Sand, Monwana in Thornybush, Marataba in the malaria-free Waterberg and Cape Cadogan in Cape Town.",
    slugs: ["lion-sands", "monwana-thornybush", "marataba", "cape-cadogan-boutique-hotel"],
  },
];

export function sistersFor(slug: string): { group: SisterGroup; stays: StayData[] } | null {
  const group = GROUPS.find((g) => g.slugs.includes(slug));
  if (!group) return null;
  const stays = group.slugs.filter((s) => s !== slug).map((s) => STAYS.find((x) => x.slug === s)).filter((x): x is StayData => !!x && pageReady(x));
  return stays.length ? { group, stays } : null;
}
