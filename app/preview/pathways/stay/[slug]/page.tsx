import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { Features, Overview, PreviewNote, RecordHero, RecordNav, SectionHead, WhyChose } from "@/components/record/Sections";
import TalkToUs from "@/components/record/TalkToUs";
import MarginNote from "@/components/notes/MarginNote";
import ImpactNote from "@/components/impact/ImpactNote";
import FollowThePathway from "@/components/pathways/FollowThePathway";
import { PathwayChips } from "@/components/pathways/Pathway";
import { verdictFor } from "@/lib/content/verdicts";
import { onPathway, pathwayStays } from "@/lib/content/pathways";
import { pathwayPreviewHref, stayPreviewHref } from "@/lib/content/pathways/preview";
import { altFor } from "@/lib/content/stays";
import { statusLine, type HouseStatus } from "@/lib/ledger/status";
import { suitedTo } from "@/lib/ledger/travel-types";
import { VOLUME_BRIEF_ID, VOLUME_STYLES } from "@/lib/volumes";
import { buildMetadata } from "@/lib/seo";

// PREVIEW · the featured-stay template with Wild Pathways (brief §9): The
// Arrival › Why James Chose It › The Stay › Best Suited For › Where Your Stay
// Gives Back › Field Notes › Follow the Pathway › Connect with an Advisor.
// Built from the record's own library text and the draft pathway map; the
// live /stays/[slug] page is untouched. Noindex.

const records = () => pathwayStays({ includeDrafts: true });
export function generateStaticParams() { return records().map((r) => ({ slug: r.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = records().find((x) => x.slug === slug);
  return buildMetadata({ title: `${r?.stay.name ?? "Stay"} on ${r?.primary.name ?? "its pathway"} (preview)`, description: "Preview of the stay template with Wild Pathways and the Impact Note.", path: stayPreviewHref(slug), noindex: true });
}

export default async function StayPathwayPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = records().find((x) => x.slug === slug);
  if (!r || !r.stay.hero) notFound();
  const s = r.stay;
  const hero = { url: s.hero!, alt: altFor(s.hero!, s.name, s.country) };
  const status = statusLine(s.status as HouseStatus, s.statusDate);
  const verdict = verdictFor(`stay:${s.slug}`);
  const suited = suitedTo([s.tagline, ...s.why.map((w) => w.body), ...s.features.paras, ...s.features.items, ...s.experiences.paras].join(" "), s.bestFor, 5);
  const why = s.why.length ? s.why.map((w) => ({ title: w.title ?? undefined, body: w.body })) : [{ body: s.tagline ?? "Filed in the Ledger." }];
  const related = onPathway(r.primaryPathway, { includeDrafts: true }).filter((x) => x.slug !== r.slug).map((x) => ({ ...x, href: stayPreviewHref(x.slug) }));
  const volumes = r.volumes.map((v) => `${VOLUME_STYLES[v].label} (${VOLUME_STYLES[v].roman} · ${VOLUME_BRIEF_ID[v]})`).join(", ");

  return (
    <>
      <SiteHeader />
      <main id="main" className="theme-vol-stays-page">
        {/* The Arrival */}
        <RecordHero image={hero} eyebrow={`${s.country ?? "The Ledger"} · ${r.primary.name}`} title={s.name} tagline={s.tagline ?? undefined} glance={<PathwayChips primary={r.primary} secondary={r.secondary} hrefFor={(p) => pathwayPreviewHref(p.key)} />} />
        <RecordNav items={[["Why James chose it", "#why"], ["The stay", "#stay"], ["Best suited for", "#suited"], ["Gives back", "#gives-back"], ["Follow the pathway", "#pathway"]]} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Stays", path: "/preview/pathways/stays" }, { name: s.name, path: stayPreviewHref(s.slug) }]} /></div>
          <div className="mt-6"><PreviewNote>Preview of the featured-stay template, 30 Oct 2026. Pathway classification is a house draft ({r.classifiedBy}); impact statements print with their status and source. The live page for this stay is unchanged.</PreviewNote></div>

          <Overview quote={s.quote ?? undefined} answer={s.tagline ?? ""} facts={[["Ledger ID", r.ledgerId ?? "pending"], ["Country", s.country ?? ""], ["Primary pathway", `${r.primary.name} · ${r.primary.id}`], ["Also on", r.secondary.map((p) => p.name).join(", ") || "—"], ["Volumes", volumes], ["Status", status ?? "Filed"]]} paragraphs={s.rooms.paras.slice(0, 1)} />

          {/* Why James Chose It: the record's approved assessment, with his verdict in the margin where one exists. */}
          <WhyChose id="why" eyebrow="Why James chose it" title={verdict ? "What Earned It the Ledger, in James's Words" : "What Earned It the Ledger"} blocks={why} status={<>{status && <p className="ledger-eyebrow ledger-crimson">{status}</p>}{verdict && <div className="mt-4"><MarginNote line={verdict.text[0]} where={verdict.where} when={verdict.when} /></div>}</>} />

          {/* The Stay */}
          {(s.rooms.items.length > 0 || s.rooms.paras.length > 0) && <Features id="stay" eyebrow="The stay" title="Where You'll Sleep" icon="tree-ring" items={s.rooms.items.length ? s.rooms.items : undefined} body={s.rooms.paras[0]} />}
          {(s.features.items.length > 0 || s.features.paras.length > 0) && <Features id="features" eyebrow="What sets it apart" title="Why It's Not Just Another Pretty Place" icon="frond" items={s.features.items.length ? s.features.items : undefined} body={s.features.paras[0]} />}

          {/* Best Suited For */}
          <section id="suited" className="mt-16 md:mt-24 scroll-mt-32 border-t ledger-rule pt-8" aria-labelledby="suited-heading">
            <SectionHead eyebrow="Best suited for" title="Who'll Love It, and Who Might Not" />
            <ul className="mt-6 flex flex-wrap gap-2">{suited.map((x) => <li key={x} className="border ledger-border px-3 py-1.5 text-[14.5px]">{x}</li>)}</ul>
            <p className="mt-4 text-[14px] ledger-muted max-w-xl">Read from the record&rsquo;s own words and its Ledger tags; never guessed. Intentions on file: {r.intentions.map((i) => i.replace(/_/g, " ")).join(", ")}.</p>
          </section>

          {/* Where Your Stay Gives Back */}
          <ImpactNote name={s.name} statements={r.impact} />

          {/* Follow the Pathway */}
          <FollowThePathway primary={r.primary} secondary={r.secondary} related={related} pathwayHref={(p) => pathwayPreviewHref(p.key)} />

          {/* Save to My Ledger (flag-gated SaveToFolio stays as is) + Connect with an Advisor */}
          <TalkToUs name={s.name} planHref={`/plan?place=${encodeURIComponent(s.name)}`} />
        </div>
      </main>
    </>
  );
}
