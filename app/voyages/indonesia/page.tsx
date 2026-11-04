import VoyageHub from "@/components/ships/VoyageHub";
import CharterJourneys from "@/components/ships/CharterJourneys";
import { watersHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/indonesia: a Voyages waters hub (voyages plan, Part 2; James, 1 Nov 2026). Everything on it reads
// the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts. The two signature
// charter weeks (James, 2 Nov 2026) sit after the chart as "Charter the whole yacht".
const H = watersHub("indonesia");
export const metadata = buildMetadata({ title: "Raja Ampat and Komodo Phinisi Voyages and Charters", description: `What does a Raja Ampat phinisi cost? Aliikai's shared voyages, Rascal Voyages, Silolona Sojourns and Celestia chartered whole, published nightly rates and two charter weeks.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} after={<CharterJourneys id="charter-the-whole-yacht" title="Which Week Should You Charter in Indonesia?" />} />;
}
