import VoyageHub from "@/components/ships/VoyageHub";
import { typeHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/charter: a Voyages type hub (voyages plan, Part 2; James, 1 Nov 2026). Everything on it reads
// the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts.
const H = typeHub("charter");
export const metadata = buildMetadata({ title: "Private Yacht and Small-Ship Charters", description: `Take the whole ship: a phinisi in Indonesia, Galápagos yachts or a Nile riverboat and dahabiya, chartered for your party. Aliikai from US$10,900 a night.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} />;
}
