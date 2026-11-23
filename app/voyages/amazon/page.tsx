import VoyageHub from "@/components/ships/VoyageHub";
import { HubSection } from "@/components/hub/Hub";
import FieldNoteCard from "@/components/field-notes/FieldNoteCard";
import { FIELD_NOTES } from "@/lib/field-notes/notes";
import { watersHub } from "@/lib/content/ships/hubs";
import { buildMetadata } from "@/lib/seo";

// /voyages/amazon: a Voyages waters hub (voyages plan, Part 2; James, 1 Nov 2026). Everything on it reads
// the ships registry (lib/content/ships/registry.ts) through lib/content/ships/hubs.ts.
const H = watersHub("amazon");
export const metadata = buildMetadata({ title: "Small-Ship Amazon River Cruises", description: `Small-ship Amazon river cruises in Peru, Ecuador and Brazil: andBeyond Amazon Explorer, Aria Amazon, Delfin III, Anakonda and MV Premium, with routes and fares.`, path: H.path, image: H.cards[0]?.image ?? undefined });


export default function Page() {
  return (
    <VoyageHub {...H} after={
      <HubSection eyebrow="From the river" title="What Lives in These Waters?" id="field-notes-h">
        <FieldNoteCard note={FIELD_NOTES["pink-river-dolphin"]} />
      </HubSection>
    } />
  );
}
