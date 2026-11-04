import VoyageHub from "@/components/ships/VoyageHub";
import ShipCard from "@/components/ships/ShipCard";
import FleetBrowser from "@/components/ships/FleetBrowser";
import IslandStays from "@/components/ships/IslandStays";
import { galapagosFleet, watersHub } from "@/lib/content/ships/hubs";
import { partnerBySlug, partnerPath } from "@/lib/content/partners";
import { PATHWAY_LIST } from "@/lib/pathways";
import { buildMetadata } from "@/lib/seo";

// /voyages/galapagos: a Voyages waters hub (voyages plan, Part 2; James, 1 Nov 2026). Everything on it reads
// the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts. With 17 ships from
// four partners (James, 2 Nov 2026) the fleet is grouped by partner and tier, with filter chips (FleetBrowser).
const H = watersHub("galapagos");
const F = galapagosFleet();
export const metadata = buildMetadata({ title: "Galápagos Yacht and Catamaran Cruises", description: `Galápagos yacht or catamaran? ${H.cards.length} small ships from Royal Galapagos, Galaxy Cruises, Ecoventura and Vianatura, by tier, guests, nights and fares from.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  const credits = [...new Set(H.cards.map((c) => c.credit).filter(Boolean))].join(", ");
  const ships = (
    <FleetBrowser
      credits={credits}
      pathwayNames={Object.fromEntries(PATHWAY_LIST.map((p) => [p.key, p.name]))}
      sections={F.sections.map((s) => ({ operator: s.operator, line: s.line, tiers: s.tiers, href: partnerBySlug(s.partner) ? partnerPath(s.partner) : undefined }))}
      items={F.items.map((i) => ({ ...i, node: <ShipCard c={H.cards.find((c) => c.slug === i.slug)!} /> }))}
    />
  );
  return <VoyageHub {...H} ships={ships} after={<IslandStays />} />;
}
