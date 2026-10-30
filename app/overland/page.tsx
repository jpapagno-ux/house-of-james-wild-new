import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import { HubShell, HubSection } from "@/components/hub/Hub";
import { JourneyCard } from "@/components/destination/Journeys";
import { journeysFor } from "@/lib/content/preview/journeys";
import { VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, touristTrip } from "@/lib/schema";

// /overland: Volume 05 hub shell. Routes James designed, by country.
const PATH = "/overland";
const V = VOLUMES.find((v) => v.href === PATH)!;
export const metadata = buildMetadata({ title: "Overland Routes Designed by James: Costa Rica, Botswana and More", description: "Land routes James Wild designed, stop by stop, with drive times, what to expect, what to avoid and every stay already vetted in the Ledger.", path: PATH, noindex: false /* approved by James, 28 Oct 2026 */ });

export default function OverlandHub() {
  const groups = [{ name: "Costa Rica", list: journeysFor("costa-rica") }, { name: "Botswana", list: journeysFor("botswana") }];
  const all = groups.flatMap((g) => g.list);
  return (
    <>
      <SiteHeader />
      <HubShell name="Overland" path={PATH} eyebrow="Volume 05 · Overland" title="Routes James Designed, What to Avoid Included" intro={V.intro} browse={V.browse}
        answer="Overland is James Wild & Co's volume of land routes James designed: the stops in order, the drive or flight times between them, what to expect and what to avoid, and every stay along the way already vetted in the Ledger. Take a route as filed, or let James reshape it around your dates."
        filling="Each route opens its own page with the day-by-day plan, the map and the price builder; more countries are filed as James draws them.">
        {groups.map((g) => (
          <HubSection key={g.name} eyebrow={`${g.list.length} routes`} title={g.name} id={`${g.name}-h`.replace(/\s/g, "-").toLowerCase()}>
            <ul className={`grid gap-5 sm:grid-cols-2 ${g.list.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>{g.list.map((j) => <li key={j.ledgerId}><JourneyCard j={j} /></li>)}</ul>
          </HubSection>
        ))}
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Overland", mainEntity: { "@type": "ItemList", itemListElement: all.map((j, i) => ({ "@type": "ListItem", position: i + 1, item: touristTrip({ path: j.href, name: j.title, description: j.line }) })) } })} />
    </>
  );
}
