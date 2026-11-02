import VoyageHub from "@/components/ships/VoyageHub";
import { watersHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/amazon: a Voyages waters hub (voyages plan, Part 2; James, 1 Nov 2026). Everything on it reads
// the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts.
const H = watersHub("amazon");
export const metadata = buildMetadata({ title: "Small-Ship Amazon River Cruises in Peru", description: `Small-ship Amazon cruises from Nauta, near Iquitos, Peru: andBeyond Amazon Explorer, 15 suites for 32 guests, 3, 4 or 7 nights. Ecuador and Brazil to follow.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} />;
}
