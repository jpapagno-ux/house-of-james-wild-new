import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import { HubShell, HubSection } from "@/components/hub/Hub";
import { JourneyCard } from "@/components/destination/Journeys";
import { journeysFor } from "@/lib/content/preview/journeys";
import { LEDGER_COUNTS } from "@/lib/ledger/counts";
import { VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, touristTrip } from "@/lib/schema";

// /voyages: Volume 04 hub shell. Small ships and sailing yachts; the
// Aliikai voyages first. Voyage pages build from James's sample files.
const PATH = "/voyages";
const V = VOLUMES.find((v) => v.href === PATH)!;
export const metadata = buildMetadata({ title: "Small-Ship Voyages and Sailing Yachts", description: `Small ships and sailing yachts, never the big ones: ${LEDGER_COUNTS.vessels} vessels in the James Wild & Co Ledger, from Raja Ampat phinisis to polar expedition ships.`, path: PATH, noindex: true });

export default function VoyagesHub() {
  const voyages = journeysFor("indonesia");
  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader />
      <HubShell name="Voyages" path={PATH} eyebrow="Volume 04 · Voyages" title="Small Ships and Sailing Yachts, Never the Big Ones" intro={V.intro} browse={V.browse}
        answer={`James Wild & Co's Voyages volume files ${LEDGER_COUNTS.vessels} small ships and sailing yachts and the voyages they sail, from phinisis in Raja Ampat and Komodo to expedition ships in the polar regions. Each voyage lists its ports in order, the cabins and the fare per person, and James has sailed many of them himself since 1989.`}
        filling="Ship pages, cabin by cabin, and 2027–2028 departures fill from the Ledger export as each voyage page is built.">
        <HubSection eyebrow="Indonesia" title="Aboard Aliikai" id="aliikai-h">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{voyages.map((j) => <li key={j.ledgerId}><JourneyCard j={j} /></li>)}</ul>
        </HubSection>
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Voyages", mainEntity: { "@type": "ItemList", itemListElement: voyages.map((j, i) => ({ "@type": "ListItem", position: i + 1, item: touristTrip({ path: j.href, name: j.title, description: j.line }) })) } })} />
    </div>
  );
}
