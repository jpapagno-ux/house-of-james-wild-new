import VoyageHub from "@/components/ships/VoyageHub";
import { typeHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/sailing: a Voyages type hub (voyages plan, Part 2; James, 1 Nov 2026). Everything on it reads
// the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts.
const H = typeHub("sailing");
export const metadata = buildMetadata({ title: "Small Sailing Ships and Phinisi Yachts", description: `Hand-built phinisis in Indonesia, Aliikai among them: cabins, every published sailing and whole-yacht charter, filed by James Wild & Co.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} />;
}
