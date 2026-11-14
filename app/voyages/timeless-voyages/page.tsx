import { notFound } from "next/navigation";
import TimelessCollection from "@/components/ships/TimelessCollection";
import { TIMELESS_VOYAGES } from "@/lib/content/timeless-voyages";
import { TIMELESS_VOYAGES_ON, TV_PATH } from "@/lib/content/timeless-voyages-flag";
import { buildMetadata } from "@/lib/seo";

// /voyages/timeless-voyages: the Timeless Voyages collection (James, 13 Nov 2026). Behind TIMELESS_VOYAGES_ON: not
// found and noindex until James approves it; the review copy is /preview/voyages/timeless-voyages.
export const metadata = buildMetadata({ title: "Timeless Voyages: A Collection of Ships Chosen One at a Time", description: "Timeless Voyages is James Wild & Co's collection of ships chosen one at a time, Four Seasons I among the first: every suite, every published sailing and the fare as each operator publishes it.", path: TV_PATH, noindex: !TIMELESS_VOYAGES_ON });

export default function Page() {
  if (!TIMELESS_VOYAGES_ON) notFound();
  return <TimelessCollection rows={TIMELESS_VOYAGES} />;
}
