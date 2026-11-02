import { pathway, type Pathway } from "@/lib/pathways";
import type { ShipCardData } from "@/lib/content/ships/cards";
import { STYLES, nightsWords, usd, voyageFrom, voyagePath, type PolarVoyage } from "./index";

// A polar itinerary on the one Voyages card (components/ships/ShipCard): style and operator,
// name, Antarctica21's line, nights, ships and the lowest published "from". Nothing new is written.
export function voyageCard(v: PolarVoyage): ShipCardData {
  const from = voyageFrom(v);
  const pw = { primary: pathway(v.pathway.primary)!, secondary: v.pathway.secondary.map((p) => pathway(p)).filter((p): p is Pathway => !!p) };
  return {
    slug: v.slug, name: v.name, href: voyagePath(v.slug), eyebrow: `${STYLES[v.style].name} · ${v.operator}`, line: v.tagline,
    image: { url: v.hero.url, alt: v.hero.alt }, credit: v.photoCredit,
    facts: [["Nights", nightsWords(v).replace(" nights", "")], ["Ships", String(v.ships.length)]],
    price: v.status === "sold-out" ? { label: "Status", amount: "Sold out" } : from ? { label: "From", amount: usd(from) } : { label: "Rates", amount: "Ask us" },
    low: from, pathway: pw, types: ["expedition"], waters: [], page: true, status: v.status ?? "sailing",
  };
}
