import VoyageHub from "@/components/ships/VoyageHub";
import { watersHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/galapagos: a Voyages waters hub (voyages plan, Part 2; James, 1 Nov 2026). Everything on it reads
// the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts.
const H = watersHub("galapagos");
export const metadata = buildMetadata({ title: "Galápagos Yacht or Catamaran Cruise", description: `Galápagos yacht or catamaran? Ecoventura Origin, Theory and Evolve and Galaxy Cruises Alya and Galaxy Sirius compared by guests, nights and fares from.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} />;
}
