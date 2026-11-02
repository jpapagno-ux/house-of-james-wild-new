import VoyageHub from "@/components/ships/VoyageHub";
import { typeHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/rivers: a Voyages type hub (voyages plan, Part 2; James, 1 Nov 2026). Everything on it reads
// the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts.
const H = typeHub("river");
export const metadata = buildMetadata({ title: "Small-Ship River Cruises: Nile and Amazon", description: `Small-ship river cruises filed by James Wild & Co: A&K Sanctuary riverboats and a dahabiya on the Nile, and small river ships in the Amazon of Peru, Ecuador and Brazil.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} />;
}
