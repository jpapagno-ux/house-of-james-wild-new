import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import { HubShell, HubSection, RecordCard } from "@/components/hub/Hub";
import { PreviewNote } from "@/components/record/Sections";
import { PathwayChips, PathwayIndex } from "@/components/pathways/Pathway";
import { PATHWAY_LIST, pathway } from "@/lib/pathways";
import { onPathway } from "@/lib/content/pathways";
import { pathwayPreviewHref, stayPreviewHref } from "@/lib/content/pathways/preview";
import { altFor } from "@/lib/content/stays";
import { VOLUME_STYLES } from "@/lib/volumes";
import { buildMetadata } from "@/lib/seo";

// PREVIEW · one pathway's collection page: the records on it (primary or
// secondary) under their own canonical cards. Noindex. The future live route
// would be /pathways/[key]; records never get a second URL here.

export function generateStaticParams() { return PATHWAY_LIST.map((p) => ({ key: p.key })); }
export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params; const p = pathway(key);
  return buildMetadata({ title: `${p?.name ?? "Pathway"}: ${p?.setting ?? ""} (preview)`, description: p?.line ?? "", path: pathwayPreviewHref(key), noindex: true });
}

export default async function PathwayPreview({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params; const p = pathway(key);
  if (!p) notFound();
  const items = onPathway(p.id, { includeDrafts: true });
  return (
    <>
      <SiteHeader />
      <div className={`pathway-${p.id.slice(-2)}`}>
        <HubShell name={p.name} path={pathwayPreviewHref(p.key)} eyebrow={`Wild Pathways · ${p.id}`} title={p.name} intro={`${p.setting}. ${p.line}`}
          answer={`${p.name} is one of the eight Wild Pathways at James Wild & Co: ${p.setting.toLowerCase()}, gathered from across the volumes it most often draws on (${p.volumes.map((v) => VOLUME_STYLES[v].label).join(", ")}). Every entry keeps its own Ledger ID and page; a pathway only collects.`}
          filling="Entries arrive as James approves each record's pathway classification in the Ledger.">
          <div className="mt-8"><PreviewNote>Preview, 30 Oct 2026. Accent {p.accent}{p.proposed ? ` (addendum proposed ${p.proposed})` : ""}; text {p.text}; tint {p.tint}. Entries below are draft classifications.</PreviewNote></div>
          <HubSection eyebrow="On this pathway" title={items.length ? `${items.length} ${items.length === 1 ? "Entry" : "Entries"} So Far` : "Filling From the Ledger"} id="entries-h">
            {items.length ? (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((r) => (
                  <li key={r.slug} className="flex flex-col gap-3">
                    <RecordCard name={r.stay.name} id={r.ledgerId ?? r.slug} line={r.stay.tagline ?? r.primary.setting} image={{ url: r.stay.hero ?? "", alt: altFor(r.stay.hero ?? "", r.stay.name, r.stay.country) }} href={stayPreviewHref(r.slug)} eyebrow={r.primaryPathway === p.id ? "Primary pathway" : "Also on this pathway"} />
                    <PathwayChips primary={r.primary} secondary={r.secondary} hrefFor={(x) => pathwayPreviewHref(x.key)} />
                  </li>
                ))}
              </ul>
            ) : <p className="text-[15px] ledger-muted">No sample record has been classified on {p.name} yet; the Phase 1 map covers five stays.</p>}
          </HubSection>
          <HubSection eyebrow="Index" title="The Other Pathways" id="others-h"><PathwayIndex hrefFor={(x) => pathwayPreviewHref(x.key)} pictured={PATHWAY_LIST.map((x) => x.id)} /></HubSection>
        </HubShell>
      </div>
    </>
  );
}
