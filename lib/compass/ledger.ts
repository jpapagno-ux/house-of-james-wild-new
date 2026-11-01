// The Compass reads the whole Ledger (1 Nov 2026): every approved stay and
// journey, slimmed for the client. Served as /compass/ledger.json so the
// Compass page itself stays light; the client fetches it on first use.
import type { PreviewRecord } from "@/components/pathways/CompassPreview";
import { pathwayStays } from "@/lib/content/pathways";
import { pathwayTrips } from "@/lib/content/pathways/trips";
import { suitabilityFrom } from "@/lib/compass/pathway-adapter";
import { verdictFor } from "@/lib/content/verdicts";
import { statusLine, type HouseStatus } from "@/lib/ledger/status";
import { recordHref } from "@/lib/ledger/urls";

export function compassLedger(): { stays: PreviewRecord[]; journeys: PreviewRecord[] } {
  const stays: PreviewRecord[] = pathwayStays().map((r) => {
    const v = verdictFor(`stay:${r.slug}`);
    const documented = r.impact.some((s) => !!s.source && (s.status === "verified" || s.status === "partner_reported"));
    return { slug: r.slug, ledgerId: r.ledgerId, primaryPathway: r.primaryPathway, secondaryPathways: r.secondaryPathways, volumes: r.volumes, setting: r.setting, intentions: r.intentions,
      suitability: suitabilityFrom(r.stay.bestFor, r.suitability), classificationStatus: r.classificationStatus, classifiedBy: "", impact: [], impactDocumented: documented, founderMark: r.stay.status ?? null, kind: "stay",
      name: r.stay.name, country: r.stay.country, hero: r.stay.hero, bestMonths: r.stay.bestMonths, hasVerdict: !!v, verdictLine: v?.text[0] ?? null, statusLine: statusLine(r.stay.status as HouseStatus, r.stay.statusDate), href: recordHref("stay", r.slug) };
  });
  const journeys: PreviewRecord[] = pathwayTrips().map((t) => ({
    slug: t.slug, ledgerId: t.ledgerId, primaryPathway: t.primaryPathway, secondaryPathways: t.secondaryPathways, volumes: t.volumes, setting: t.setting, intentions: [], suitability: [],
    classificationStatus: t.status, classifiedBy: "", impact: [], impactDocumented: false, founderMark: null, kind: t.kind,
    name: t.name, country: t.country, hero: t.hero?.url ?? null, bestMonths: null, hasVerdict: false, verdictLine: null, statusLine: null, href: t.href,
  }));
  return { stays, journeys };
}
