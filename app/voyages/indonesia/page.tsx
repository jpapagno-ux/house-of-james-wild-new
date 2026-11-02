import VoyageHub from "@/components/ships/VoyageHub";
import { watersHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/indonesia: a Voyages waters hub (voyages plan, Part 2; James, 1 Nov 2026). Everything on it reads
// the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts.
const H = watersHub("indonesia");
export const metadata = buildMetadata({ title: "Raja Ampat and Komodo Phinisi Voyages", description: `What does a Raja Ampat phinisi cost? Aliikai shared voyages and nightly cabin rates, whole-yacht charter, and the phinisis James files in Indonesia.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} />;
}
