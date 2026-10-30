import SiteHeader from "@/components/ledger/SiteHeader";
import { HOUSE_LOOP } from "@/lib/content/home";
import JsonLd from "@/components/ledger/JsonLd";
import { AdvisorScroll } from "@/components/advisor/Desk";
import { HubShell, HubSection } from "@/components/hub/Hub";
import { JourneyCard } from "@/components/destination/Journeys";
import { journeysFor } from "@/lib/content/preview/journeys";
import { DoorCard, type Door } from "@/components/destination/Doors";
import { regionBySlug } from "@/lib/content/regions";
import { VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, touristTrip } from "@/lib/schema";
import RouteAtlas from "@/components/journey/RouteAtlas";

// /overland: Volume 05 hub shell. Routes James designed, by country.
const PATH = "/overland";
const V = VOLUMES.find((v) => v.href === PATH)!;
export const metadata = buildMetadata({ title: "Overland Routes Designed by James: Costa Rica, Botswana, South Africa", description: "Land routes James Wild designed, stop by stop, with drive times, what to expect, what to avoid and every stay already vetted in the Ledger.", path: PATH, noindex: false /* approved by James, 28 Oct 2026 */ });

// South Africa's destination card (James, 30 Oct 2026): the country page, with Wild & Co
// Safaris as the cross-reference. Londolozi's own photograph, credited beside the card.
function zaDoor(routes: number): Door {
  const c = regionBySlug("africa")?.countries.find((x) => x.slug === "south-africa");
  return { name: "South Africa", href: "/destinations/africa/south-africa", image: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/wildco/south-africa/sabi-sand/londolozi/londolozi-leopard-cubs-in-tree", imageAlt: "Leopard cubs in a tree at Londolozi, Sabi Sand, South Africa", line: c?.line ?? "The Sabi Sand, Cape Town and the Cape Winelands.", stays: c?.stays ?? 0, routes };
}

export default function OverlandHub() {
  const za = journeysFor("south-africa");
  const groups = [{ name: "Costa Rica", list: journeysFor("costa-rica") }, { name: "Botswana", list: journeysFor("botswana") }, { name: "South Africa", list: za, door: zaDoor(za.length) }];
  const all = groups.flatMap((g) => g.list);
  return (
    <>
      <SiteHeader />
      <HubShell name="Overland" film={{ poster: HOUSE_LOOP.poster, mp4: HOUSE_LOOP.mp4, webm: HOUSE_LOOP.webm, alt: HOUSE_LOOP.label, eyebrow: "The house film", title: "Earn the lodge by road.", credit: "Film by Felix Studios", href: "/#film" }} path={PATH} eyebrow="Volume 05 · Overland" title="Routes James Designed, What to Avoid Included" intro={V.intro} browse={V.browse}
        answer="Overland is James Wild & Co's volume of land routes James designed: the stops in order, the drive or flight times between them, what to expect and what to avoid, and every stay along the way already vetted in the Ledger. Take a route as filed, or let James reshape it around your dates."
        filling="Each route opens its own page with the day-by-day plan, the map and the price builder; more countries are filed as James draws them.">
        <RouteAtlas id="overland-atlas" kind="overland" dest="costa-rica" eyebrow="The route atlas · by land" title="Every Route on One Chart"
          line="Pick a route and the globe flies to it, then plays it day by day: Costa Rica coast to coast, the Sabi Sand to the Cape."
          routes={all.filter((j) => j.kind === "route").map((j) => ({ id: j.href.split("/").pop()!, label: j.title, href: j.href, where: groups.find((g) => g.list.includes(j))!.name }))} />
        {groups.map((g) => (
          <HubSection key={g.name} eyebrow={`${g.list.length} routes`} title={g.name} id={`${g.name}-h`.replace(/\s/g, "-").toLowerCase()}>
            {g.door && (
              <div className="mb-8 grid gap-5 md:grid-cols-[minmax(0,380px)_1fr] items-center">
                <DoorCard d={g.door} />
                <div className="max-w-xl">
                  <p className="ledger-eyebrow ledger-crimson">The destination</p>
                  <p className="ledger-display text-[1.4rem] md:text-[1.6rem] leading-snug mt-1">{g.name}: every stay, the months to go and the routes below.</p>
                  <p className="mt-3 text-[12px] ledger-muted">Photograph courtesy of Londolozi.</p>
                </div>
              </div>
            )}
            <ul className={`grid gap-5 sm:grid-cols-2 ${g.list.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>{g.list.map((j) => <li key={j.ledgerId}><JourneyCard j={j} /></li>)}</ul>
          </HubSection>
        ))}
        <AdvisorScroll volume="overland" title="Who has driven the routes" />
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Overland", mainEntity: { "@type": "ItemList", itemListElement: all.map((j, i) => ({ "@type": "ListItem", position: i + 1, item: touristTrip({ path: j.href, name: j.title, description: j.line }) })) } })} />
    </>
  );
}
