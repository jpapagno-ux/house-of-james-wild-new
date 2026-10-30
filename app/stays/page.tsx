import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import { HubShell, HubSection, RecordCard } from "@/components/hub/Hub";
import { HOME } from "@/lib/content/home";
import { LEDGER_COUNTS } from "@/lib/ledger/counts";
import { recordHref } from "@/lib/ledger/urls";
import { VOLUMES } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";
import { PathwayCard, PathwayIndex } from "@/components/pathways/Pathway";
import { PATHWAYS } from "@/lib/pathways";
import { onPathway } from "@/lib/content/pathways";
import { PATHWAYS_ON, pathwayHref } from "@/lib/content/pathways/flag";
import { PATHWAY_CARD_STAY, PROMINENT } from "@/lib/content/pathways/preview";
import { STAYS, altFor } from "@/lib/content/stays";

// /stays: Volume 01 hub shell. Signature stays now; the full browse (by
// land / by water, region, setting) fills from the Ledger export.
const PATH = "/stays";
const V = VOLUMES.find((v) => v.href === PATH)!;
export const metadata = buildMetadata({ title: "Vetted Luxury Stays: Lodges, Camps, Islands and Houses", description: `${LEDGER_COUNTS.stays} live stays in the James Wild & Co Ledger: lodges, camps, islands and houses vetted in person, each with a permanent Ledger ID.`, path: PATH, noindex: false /* approved by James, 28 Oct 2026 */ });

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
        {PATHWAYS_ON && <StaysPathways />}
      </HubShell>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Stays", mainEntity: { "@type": "ItemList", itemListElement: items.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: absoluteUrl(recordHref(s.kind ?? "stay", s.slug)) })) } })} />
    </>
  );
}

// Wild Pathways on the Stays landing (Phase 2C, behind NEXT_PUBLIC_PATHWAYS=on):
// six prominent cards, all eight reachable. Approved by James, 30 Oct 2026
// (card photographs from lib/content/pathways/preview.ts). Off = page unchanged.
function StaysPathways() {
  const hero = (slug: string) => { const s = STAYS.find((x) => x.slug === slug); return s?.hero ? { url: s.hero, alt: altFor(s.hero, s.name, s.country) } : null; };
  const [lead, ...rest] = PROMINENT.map((id) => PATHWAYS[id]);
  return (
    <>
      <HubSection eyebrow="Wild Pathways" title="Six Ways In, and Two More Below" id="pathways-h" more={{ label: "All eight pathways", href: "/pathways" }}>
        <p className="-mt-4 mb-6 max-w-2xl text-[16px] ledger-muted leading-relaxed">A pathway is a collection, not a category: it gathers places by the setting you&rsquo;re drawn to and the way you like to travel. A stay keeps one Ledger ID however many pathways it sits on.</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2"><PathwayCard pathway={lead} image={hero(PATHWAY_CARD_STAY[lead.id])} href={pathwayHref(lead.key)} count={onPathway(lead.id).length} large /></div>
          {rest.map((p) => <PathwayCard key={p.id} pathway={p} image={hero(PATHWAY_CARD_STAY[p.id])} href={pathwayHref(p.key)} count={onPathway(p.id).length} />)}
        </div>
      </HubSection>
      <HubSection eyebrow="Index" title="All Eight Pathways" id="all-pathways"><PathwayIndex hrefFor={(p) => pathwayHref(p.key)} pictured={PROMINENT} /></HubSection>
    </>
  );
}
