import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { PreviewNote } from "@/components/record/Sections";
import CompassPreview, { type PreviewRecord } from "@/components/pathways/CompassPreview";
import { pathwayStays } from "@/lib/content/pathways";
import { pathwayPreviewHref, stayPreviewHref } from "@/lib/content/pathways/preview";
import { PATHWAY_LIST } from "@/lib/pathways";
import { verdictFor } from "@/lib/content/verdicts";
import { statusLine, type HouseStatus } from "@/lib/ledger/status";
import { buildMetadata } from "@/lib/seo";

// PREVIEW · the Compass pathway adapter (brief §7): a reading in the
// Compass's vocabulary returns Ledger IDs, pathways, volumes and reasons.
// Iggi leads; James appears only where a Field Verdict is already approved.
// The live /compass and its Costa Rica reading are untouched. Noindex.

export const metadata = buildMetadata({ title: "The Compass with Wild Pathways (preview)", description: "Preview of the Compass pathway adapter, traveller and trade views.", path: "/preview/pathways/compass", noindex: true });

export default function CompassPathwaysPreview() {
  const pathwayHref = Object.fromEntries(PATHWAY_LIST.map((p) => [p.id, pathwayPreviewHref(p.key)]));
  // Only plain data crosses to the client component: no stay objects, no joined pathway objects.
  const records: PreviewRecord[] = pathwayStays({ includeDrafts: true }).map((r) => {
    const v = verdictFor(`stay:${r.slug}`);
    return { slug: r.slug, ledgerId: r.ledgerId, primaryPathway: r.primaryPathway, secondaryPathways: r.secondaryPathways, volumes: r.volumes, setting: r.setting, intentions: r.intentions, suitability: r.suitability, classificationStatus: r.classificationStatus, classifiedBy: r.classifiedBy, impact: r.impact,
      name: r.stay.name, country: r.stay.country, hero: r.stay.hero, bestMonths: r.stay.bestMonths, hasVerdict: !!v, verdictLine: v?.text[0] ?? null, statusLine: statusLine(r.stay.status as HouseStatus, r.stay.statusDate), href: stayPreviewHref(r.slug), pathwayHref };
  });

  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Previews", path: "/preview/pathways" }, { name: "Compass", path: "/preview/pathways/compass" }]} />
          <header className="mt-6 max-w-3xl">
            <p className="ledger-eyebrow ledger-crimson">The Compass · Wild Pathways preview</p>
            <h1 className="ledger-display text-[2.3rem] md:text-[3.3rem] leading-[1.1] mt-3">A Reading That Explains Itself</h1>
            <p className="mt-4 text-[18px] ledger-muted leading-relaxed">The adapter sits beside the <Link href="/compass" className="underline underline-offset-2 hover:text-crimson">live Compass</Link> and reads the same Ledger. Every suggestion names its pathways, its volumes and the reasons; safari-only readings go to Crux.</p>
          </header>
          <div className="mt-6"><PreviewNote>Five draft sample records, 30 Oct 2026. Weights: primary pathway 3, party fit 2, private house 2, secondary pathway 1.5, giving back 1.5, hosts &amp; history 1.5, interest 1, season 1, verdict on file 0.5 (tie-break only). Switch to the Trade view for IDs, suitability and impact state.</PreviewNote></div>
          <CompassPreview records={records} />
        </div>
      </main>
    </>
  );
}
