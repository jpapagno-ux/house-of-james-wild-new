import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import Image from "next/image";
import { GuardLink } from "@/components/ledger/SafeLink";
import { REGION_DATA } from "@/lib/content/regions";
import { HubShell, HubSection } from "@/components/hub/Hub";
import { REGIONS } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";
import { AdvisorChips } from "@/components/advisor/Desk";

// /destinations: the ten regions and their live countries, from the Ledger.
const PATH = "/destinations";
export const metadata = buildMetadata({ title: "Destinations: Ten Regions, Vetted Country by Country", description: "Africa, Asia, the Americas, Europe, Oceania and the polar regions: the countries where James Wild & Co has vetted stays, ships and routes.", path: PATH, noindex: false /* approved by James, 28 Oct 2026 */ });

export default function DestinationsHub() {
  const countries = REGION_DATA.reduce((n, r) => n + r.countries.length, 0);
  const stays = REGION_DATA.reduce((n, r) => n + r.stayCount, 0);
  return (
    <>
      <SiteHeader />
      <HubShell name="Destinations" path={PATH} eyebrow="Destinations" title="Ten Regions, Vetted Country by Country" intro="Every region and country where the Ledger holds stays, ships or routes, from the Okavango to the Antarctic Peninsula."
        answer={`James Wild & Co plans journeys across ten regions and ${countries} live countries, with ${stays} vetted stays filed in the Ledger, from Africa and Central America to Oceania and the polar regions. Each region page shows its countries, the stays we would send you to and the journeys the house has drawn there.`}
        filling="Region pages are built from the Ledger export; country pages follow, starting with Costa Rica and Botswana.">
        <HubSection eyebrow="The ten regions" title="Where the House Goes" id="regions-h">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REGION_DATA.map((r) => (
              <li key={r.slug}>
                <GuardLink as="div" href={`/destinations/${r.slug}`} className="group relative block aspect-[4/3] overflow-hidden bg-ink text-white">
                  {r.hero && <Image src={r.hero} alt={`${r.name}: ${r.tagline}`} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <span className="absolute left-5 right-5 bottom-4">
                    <span className="block ledger-eyebrow !text-white/80">{r.stayCount ? `${r.stayCount} stays · ${r.countries.length} ${r.countries.length === 1 ? "country" : "countries"}` : "Being filed now"}</span>
                    <span className="block ledger-display text-[1.8rem] leading-tight mt-1">{r.name}</span>
                    {r.countries.length > 0 && <span className="block text-[13.5px] text-white/85 mt-1 line-clamp-1">{r.countries.map((c) => c.name).join(" · ")}</span>}
                    <AdvisorChips regionSlug={r.slug} light className="mt-2" />
                  </span>
                </GuardLink>
              </li>
            ))}
          </ul>
        </HubSection>
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Destinations", mainEntity: { "@type": "ItemList", itemListElement: REGIONS.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.label, url: absoluteUrl(r.href) })) } })} />
    </>
  );
}
