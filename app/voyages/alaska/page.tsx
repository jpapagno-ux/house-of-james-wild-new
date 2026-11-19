import VoyageHub from "@/components/ships/VoyageHub";
import { watersHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/alaska: the Alaska waters hub (James, 19 Nov 2026), UnCruise Adventures' seven boats, read from the ships
// registry through lib/content/ships/hubs.ts.
const H = watersHub("alaska");
export const metadata = buildMetadata({ title: "Small-Ship Alaska Cruises: Glacier Bay, Inside Passage and the Aleutians", description: "Small-ship Alaska cruises with UnCruise Adventures: seven boats for 22 to 88 guests, Glacier Bay, Sitka, Misty Fjords, Prince William Sound and the Aleutians, with every 2027 and 2028 sailing and fare.", path: H.path, image: H.cards[0]?.image ?? undefined });

export default function Page() {
  return <VoyageHub {...H} />;
}
