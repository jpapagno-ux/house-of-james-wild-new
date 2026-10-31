import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import FaqBlock from "@/components/ledger/FaqBlock";
import IggiPanel from "@/components/iggi/IggiPanel";
import { IGGI_ON } from "@/lib/iggi/flag";
import { HubShell, HubSection, RecordCard } from "@/components/hub/Hub";
import { PathwayChips, PathwayIndex } from "@/components/pathways/Pathway";
import { PATHWAY_LIST, pathway } from "@/lib/pathways";
import { onPathway } from "@/lib/content/pathways";
import { PATHWAYS_ON, pathwayHref } from "@/lib/content/pathways/flag";
import { PATHWAY_ANSWER, PATHWAY_FAQS, PATHWAY_SEO } from "@/lib/content/pathways/copy";
import { altFor } from "@/lib/content/stays";
import { VOLUME_STYLES } from "@/lib/volumes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { faqPage, graph, ids } from "@/lib/schema";

// /pathways/[key]: one Wild Pathway's collection page (Phase 2C). Lists the
// Ledger records James has APPROVED on it, each under its own canonical card
// and URL; a pathway only collects, it never makes a second page for a stay.
// Behind NEXT_PUBLIC_PATHWAYS=on (404 otherwise) and noindex until James
// approves the pages and they join LIVE_ROUTES in lib/site.ts.

export const dynamicParams = false;
export function generateStaticParams() { return PATHWAYS_ON ? PATHWAY_LIST.map((p) => ({ key: p.key })) : []; }

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params; const p = pathway(key);
  if (!p) return {};
  return buildMetadata({ title: PATHWAY_SEO[p.id].title, description: PATHWAY_SEO[p.id].description, path: `/pathways/${p.key}`, noindex: false /* approved by James, 30 Oct 2026 */ });
}

export default async function PathwayPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params; const p = pathway(key);
  if (!PATHWAYS_ON || !p) notFound();
  const items = onPathway(p.id); // approved only
  const path = `/pathways/${p.key}`;
  const trail = [{ name: "Home", path: "/" }, { name: "Pathways", path: "/pathways" }, { name: p.name, path }];
  return (
    <>
      <SiteHeader />
      <div className={`pathway-${p.id.slice(-2)}`}>
        <HubShell name={p.name} path={path} trail={trail} eyebrow={`Wild Pathways · ${p.id}`} title={p.name} intro={`${p.setting}. ${p.line}`}
          answer={PATHWAY_ANSWER[p.id]} filling="Entries arrive as James approves each record's pathway in the Ledger." closeTitle={`Drawn to ${p.name.toLowerCase()}?`}>
          <HubSection eyebrow="On this pathway" title={items.length ? `${items.length} ${items.length === 1 ? "Entry" : "Entries"} in the Ledger` : "Filling From the Ledger"} id="entries-h">
            {items.length ? (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((r) => (
                  <li key={r.slug} className="flex flex-col gap-3">
                    <RecordCard name={r.stay.name} id={r.ledgerId ?? r.slug} line={r.stay.tagline ?? r.primary.setting} image={{ url: r.stay.hero ?? "", alt: altFor(r.stay.hero ?? "", r.stay.name, r.stay.country) }} href={r.href} eyebrow={r.stay.country ?? undefined} />
                    <PathwayChips primary={r.primary} secondary={r.secondary} hrefFor={(x) => pathwayHref(x.key)} />
                  </li>
                ))}
              </ul>
            ) : <p className="text-[15px] ledger-muted">No approved entry yet on {p.name}. The volumes it draws on: {p.volumes.map((v) => VOLUME_STYLES[v].label).join(", ")}.</p>}
          </HubSection>
          {IGGI_ON && <IggiPanel ctx={{ entityType: "pathway", entitySlug: p.key, pathway: p.id, ledgerId: p.id, sourcePage: path, volume: p.volumes[0] ?? "stays" }} heading={`Ask Iggi about ${p.name}`} lead={`Iggi keeps to stays the house has approved on this Pathway, and says which Ledger entry each answer comes from.`} />}
          <FaqBlock faqs={PATHWAY_FAQS[p.id]} title={`Questions About ${p.name}`} />
          <HubSection eyebrow="Index" title="The Other Pathways" id="others-h"><PathwayIndex hrefFor={(x) => pathwayHref(x.key)} pictured={PATHWAY_LIST.map((x) => x.id)} /></HubSection>
        </HubShell>
      </div>
      <JsonLd data={graph(
        { "@type": "CollectionPage", "@id": absoluteUrl(`${path}#page`), url: absoluteUrl(path), name: p.name, description: p.line, isPartOf: { "@id": ids.website }, publisher: { "@id": ids.house },
          mainEntity: { "@type": "ItemList", name: `${p.name}: ${p.setting}`, numberOfItems: items.length, itemListElement: items.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.stay.name, url: absoluteUrl(r.href) })) } },
      )} />
    </>
  );
}
