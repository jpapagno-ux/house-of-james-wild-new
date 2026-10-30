import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import { HubShell, HubSection } from "@/components/hub/Hub";
import { PathwayCard, PathwayIndex } from "@/components/pathways/Pathway";
import { PATHWAY_LIST, PATHWAYS } from "@/lib/pathways";
import { onPathway } from "@/lib/content/pathways";
import { PATHWAYS_ON, pathwayHref } from "@/lib/content/pathways/flag";
import { PATHWAY_CARD_STAY, PROMINENT } from "@/lib/content/pathways/preview";
import { STAYS, altFor } from "@/lib/content/stays";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { breadcrumbs, graph, ids } from "@/lib/schema";

// /pathways: the eight Wild Pathways (Phase 2C). Behind NEXT_PUBLIC_PATHWAYS=on;
// noindex until approved. Card photographs are the approved landing picks
// (lib/content/pathways/preview.ts) until each pathway has its own hero.

const PATH = "/pathways";
export const metadata = buildMetadata({ title: "Wild Pathways: Eight Ways Into the James Wild & Co Ledger", description: "Rainforest, islands, mountains, wildlife, stillness, hidden places, private houses and heritage: eight editorial collections of stays vetted by James Wild & Co.", path: PATH, noindex: false /* approved by James, 30 Oct 2026 */ });

export default function PathwaysIndex() {
  if (!PATHWAYS_ON) notFound();
  const hero = (slug: string) => { const s = STAYS.find((x) => x.slug === slug); return s?.hero ? { url: s.hero, alt: altFor(s.hero, s.name, s.country) } : null; };
  const [lead, ...rest] = PROMINENT.map((id) => PATHWAYS[id]);
  return (
    <>
      <SiteHeader />
      <HubShell name="Pathways" path={PATH} eyebrow="Wild Pathways" title="Six Volumes. Countless Pathways. One Wild Ledger." intro="A pathway is a collection, not a category: it gathers places by the setting you're drawn to and the way you like to travel. A stay keeps one Ledger ID however many pathways it sits on."
        answer="Wild Pathways are eight editorial collections across the James Wild & Co Ledger: Into the Green (rainforest and jungle), Between Tides (islands and oceans), Above It All (mountains and highlands), Where the Wild Lives (wildlife and wilderness), The Art of Stillness (wellness and restoration), Off the Map (hidden and undiscovered), A Place of Our Own (private residences) and Rooted in Place (heritage and culture). Each entry is vetted by James or a named partner and keeps a permanent Ledger ID."
        filling="Each collection fills as James approves records' pathways in the Ledger." closeTitle="Not sure which pathway is yours?">
        <HubSection eyebrow="The eight" title="Six Ways In, and Two More Below" id="pathways-h">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2"><PathwayCard pathway={lead} image={hero(PATHWAY_CARD_STAY[lead.id])} href={pathwayHref(lead.key)} count={onPathway(lead.id).length} large /></div>
            {rest.map((p) => <PathwayCard key={p.id} pathway={p} image={hero(PATHWAY_CARD_STAY[p.id])} href={pathwayHref(p.key)} count={onPathway(p.id).length} />)}
          </div>
        </HubSection>
        <HubSection eyebrow="Index" title="All Eight Pathways" id="all-pathways"><PathwayIndex hrefFor={(p) => pathwayHref(p.key)} pictured={PROMINENT} /></HubSection>
      </HubShell>
      <JsonLd data={graph(
        { "@type": "CollectionPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Wild Pathways", isPartOf: { "@id": ids.website }, publisher: { "@id": ids.house },
          mainEntity: { "@type": "ItemList", numberOfItems: PATHWAY_LIST.length, itemListElement: PATHWAY_LIST.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: absoluteUrl(`/pathways/${p.key}`) })) } },
        breadcrumbs([{ name: "Home", path: "/" }, { name: "Pathways", path: PATH }]),
      )} />
    </>
  );
}
