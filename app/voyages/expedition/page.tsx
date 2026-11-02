import VoyageHub from "@/components/ships/VoyageHub";
import { typeHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/expedition: a Voyages type hub (voyages plan, Part 2; James, 1 Nov 2026). Everything on it reads
// the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts.
const H = typeHub("expedition");
export const metadata = buildMetadata({ title: "Small Expedition Ships: Galápagos and Antarctica", description: `Small expedition yachts and catamarans in the Galápagos from Ecoventura and Galaxy Cruises, and Polar Crossings: every Antarctica21 air-cruise and polar voyage, with routes, cabins and fares.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} />;
}
