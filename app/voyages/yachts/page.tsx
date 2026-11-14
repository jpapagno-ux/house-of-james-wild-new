import VoyageHub from "@/components/ships/VoyageHub";
import { typeHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/yachts: the "By Yacht" type hub (James, 13 Nov 2026: ocean yachts with suites, Four Seasons I first).
// Everything on it reads the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts.
const H = typeHub("yacht");
export const metadata = buildMetadata({ title: "Luxury Yacht Voyages: Four Seasons I", description: `Ocean yachts with suites and a marina at the stern: Four Seasons I in the Caribbean, the Bahamas and the Mediterranean, with every published sailing, its day by day and each suite's fare.`, path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} />;
}
