import SiteHeader from "@/components/ledger/SiteHeader";
import { FILMS } from "@/lib/content/films";
import JsonLd from "@/components/ledger/JsonLd";
import { AdvisorScroll } from "@/components/advisor/Desk";
import { HubShell, HubSection } from "@/components/hub/Hub";
import { JourneyCard } from "@/components/destination/Journeys";
import { journeysFor } from "@/lib/content/preview/journeys";
import { LEDGER_COUNTS } from "@/lib/ledger/counts";
import { VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, touristTrip } from "@/lib/schema";
import RouteAtlas from "@/components/journey/RouteAtlas";
import Link from "next/link";

// /voyages: Volume 04 hub shell. Small ships and sailing yachts; the
// Aliikai voyages first. Voyage pages build from James's sample files.
const PATH = "/voyages";
const V = VOLUMES.find((v) => v.href === PATH)!;
export const metadata = buildMetadata({ title: "Small-Ship Voyages and Sailing Yachts", description: `Small ships and sailing yachts, never the big ones: ${LEDGER_COUNTS.vessels} vessels in the James Wild & Co Ledger, from Raja Ampat phinisis to polar expedition ships.`, path: PATH, noindex: false /* approved by James, 28 Oct 2026 */ });

export default function VoyagesHub() {
  const voyages = journeysFor("indonesia");
  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader />
      <HubShell name="Voyages" film={{ poster: FILMS.aliikai.poster, alt: FILMS.aliikai.alt, eyebrow: "Aboard Aliikai · Komodo", title: "Small ships and sailing yachts, never the big ones.", credit: FILMS.aliikai.credit, href: `https://www.youtube.com/watch?v=${FILMS.aliikai.id}` }} path={PATH} eyebrow="Volume 04 · Voyages" title="Small Ships and Sailing Yachts, Never the Big Ones" intro={V.intro} browse={V.browse}
        answer={`James Wild & Co's Voyages volume files ${LEDGER_COUNTS.vessels} small ships and sailing yachts and the voyages they sail, from phinisis in Raja Ampat and Komodo to expedition ships in the polar regions. Each voyage lists its ports in order, the cabins and the fare per person, and James, 44 years on the road and sailing since 1989, has sailed many of them himself: Aliikai through Raja Ampat in November 2024 among them.`}
        filling="Ship pages, cabin by cabin, and 2027–2028 departures fill from the Ledger export as each voyage page is built.">
        <RouteAtlas id="voyages-atlas" kind="voyage" dest="raja-ampat" eyebrow="The voyage atlas · by sea" title="Every Voyage on One Chart"
          line="Pick a voyage and the globe sails to it, then plays it day by day: Raja Ampat's karst islands and the Komodo dragons."
          routes={voyages.map((j) => ({ id: j.href.split("/").pop()!.replace(/^aliikai-/, ""), label: j.title, href: j.href, where: "Indonesia" }))} />
        <HubSection eyebrow="Indonesia" title="Aboard Aliikai" id="aliikai-h">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{voyages.map((j) => <li key={j.ledgerId}><JourneyCard j={j} /></li>)}</ul>
          <p className="mt-6 text-[15px]">
            <span className="ledger-eyebrow mr-2">The waters</span>
            <Link href="/destinations/asia/indonesia/raja-ampat" className="underline underline-offset-4 hover:ledger-crimson">Raja Ampat guide</Link>
            <span className="ledger-muted"> · </span>
            <Link href="/destinations/asia/indonesia/komodo" className="underline underline-offset-4 hover:ledger-crimson">Komodo guide</Link>
            <span className="ledger-muted"> · </span>
            <Link href="/destinations/asia/indonesia" className="underline underline-offset-4 hover:ledger-crimson">Everything in Indonesia</Link>
          </p>
        </HubSection>
        <AdvisorScroll volume="voyages" title="Who sails with the small ships" />
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Voyages", mainEntity: { "@type": "ItemList", itemListElement: voyages.map((j, i) => ({ "@type": "ListItem", position: i + 1, item: touristTrip({ path: j.href, name: j.title, description: j.line }) })) } })} />
    </div>
  );
}
