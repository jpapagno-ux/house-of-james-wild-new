import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import SafeLink from "@/components/ledger/SafeLink";
import { HubShell, HubSection } from "@/components/hub/Hub";
import { REGIONS } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /destinations: the ten regions and their live countries, from the Ledger.
const PATH = "/destinations";
export const metadata = buildMetadata({ title: "Destinations: Ten Regions, Vetted Country by Country | James Wild & Co", description: "Africa, Asia, the Americas, Europe, Oceania and the polar regions: the countries where James Wild & Co has vetted stays, ships and routes.", path: PATH, noindex: true });

export default function DestinationsHub() {
  const countries = REGIONS.reduce((n, r) => n + r.countries.length, 0);
  return (
    <>
      <SiteHeader />
      <HubShell name="Destinations" path={PATH} eyebrow="Destinations" title="Ten Regions, Vetted Country by Country" intro="Every region and country where the Ledger holds stays, ships or routes, from the Okavango to the Antarctic Peninsula."
        answer={`James Wild & Co plans journeys across ten regions and ${countries} live countries, from Africa and Central America to Oceania and the polar regions. Each country page holds the vetted stays, routes and voyages filed there, the best months to go and the Compass to start planning.`}
        filling="Region and country pages are built from the Ledger, starting with Central America and Costa Rica, then Africa.">
        <HubSection eyebrow="The ten regions" title="Where the House Goes" id="regions-h">
          <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {REGIONS.map((r) => (
              <li key={r.href} className="border-t ledger-rule pt-3">
                <SafeLink href={r.href} className="ledger-display text-[1.3rem] hover:ledger-crimson" fallback={<span className="ledger-display text-[1.3rem]">{r.label}</span>}>{r.label}</SafeLink>
                {r.countries.length > 0 && <ul className="mt-2 space-y-1">{r.countries.map((c) => <li key={c.href}><SafeLink href={c.href} className="text-[15px] ledger-muted hover:ledger-crimson" fallback={<span className="text-[15px] ledger-muted">{c.label}</span>}>{c.label}</SafeLink></li>)}</ul>}
              </li>
            ))}
          </ul>
        </HubSection>
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Destinations", mainEntity: { "@type": "ItemList", itemListElement: REGIONS.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.label, url: absoluteUrl(r.href) })) } })} />
    </>
  );
}
