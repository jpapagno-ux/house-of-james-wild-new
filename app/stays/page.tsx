import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import { HubShell, HubSection, RecordCard } from "@/components/hub/Hub";
import { HOME } from "@/lib/content/home";
import { LEDGER_COUNTS } from "@/lib/ledger/counts";
import { recordHref } from "@/lib/ledger/urls";
import { VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /stays: Volume 01 hub shell. Signature stays now; the full browse (by
// land / by water, region, setting) fills from the Ledger export.
const PATH = "/stays";
const V = VOLUMES.find((v) => v.href === PATH)!;
export const metadata = buildMetadata({ title: "Vetted Luxury Stays: Lodges, Camps, Islands and Houses | James Wild & Co", description: `${LEDGER_COUNTS.stays} live stays in the James Wild & Co Ledger: lodges, camps, islands and houses vetted in person, each with a permanent Ledger ID.`, path: PATH, noindex: true });

export default function StaysHub() {
  const items = HOME.shelf.entries;
  return (
    <>
      <SiteHeader />
      <HubShell name="Stays" path={PATH} eyebrow="Volume 01 · Stays" title="Stays James Has Vetted, by Land and by Water" intro={V.intro} browse={V.browse}
        answer={`James Wild & Co's Stays volume holds ${LEDGER_COUNTS.stays} live stays: safari lodges, island hideaways, mountain and desert retreats and city houses, each vetted in person or by a named partner and filed in the Ledger under a permanent ID. Book a single stay, or build a journey around it with James or an advisor.`}
        filling="The full browse, by land or water, region, setting and who it suits, fills from the Ledger export as each stay page is built.">
        <HubSection eyebrow="From the Ledger" title="A Short Shelf of Signature Stays" id="shelf-h">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map((s) => <li key={s.id}><RecordCard name={s.name} id={s.id} line={s.line} image={s.image} href={recordHref(s.kind ?? "stay", s.slug)} /></li>)}</ul>
        </HubSection>
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Stays", mainEntity: { "@type": "ItemList", itemListElement: items.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: absoluteUrl(recordHref(s.kind ?? "stay", s.slug)) })) } })} />
    </>
  );
}
