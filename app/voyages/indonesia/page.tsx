import PlanBand from "@/components/destination/PlanBand";
import { HubSection } from "@/components/hub/Hub";
import FieldNoteSet from "@/components/field-notes/FieldNoteSet";
import { FIELD_NOTES, INDONESIA_HUB_NOTES } from "@/lib/field-notes/notes";
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
  return <VoyageHub {...H} after={<><HubSection eyebrow="From the islands" title="What Lives in These Waters?" id="field-notes-h" more={{ label: "All wildlife", href: "/wildlife" }}><FieldNoteSet notes={INDONESIA_HUB_NOTES.map((id) => FIELD_NOTES[id])} /></HubSection><CharterJourneys id="charter-the-whole-yacht" title="Which Week Should You Charter in Indonesia?" /><PlanBand place="Indonesia" compassHref="/compass" where={{ countrySlug: "indonesia", volume: "voyages" }} /></>} />;
}
