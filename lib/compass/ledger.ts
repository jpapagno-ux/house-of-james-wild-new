// The Compass reads the whole Ledger (1 Nov 2026): every approved stay and
// journey, slimmed for the client. Served as /compass/ledger.json so the
// Compass page itself stays light; the client fetches it on first use.
import type { PreviewRecord } from "@/components/pathways/CompassPreview";
import { pathwayStays, pathwayVessels } from "@/lib/content/pathways";
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
  // Vessels filed in the Stay library are suggested as voyages, never as stays (lib/content/vessels.ts).
  const vessels: PreviewRecord[] = pathwayVessels().map((v) => ({
    slug: v.slug, ledgerId: v.ledgerId, primaryPathway: v.primaryPathway, secondaryPathways: v.secondaryPathways, volumes: v.volumes, setting: v.setting, intentions: [], suitability: suitabilityFrom(v.stay.bestFor, []),
    classificationStatus: v.status, classifiedBy: "", impact: [], impactDocumented: false, founderMark: v.stay.status ?? null, kind: "voyage",
    name: v.name, country: v.country, hero: v.hero?.url ?? null, bestMonths: v.stay.bestMonths, hasVerdict: false, verdictLine: null, statusLine: statusLine(v.stay.status as HouseStatus, v.stay.statusDate), href: v.href,
  }));
  return { stays, journeys: [...journeys, ...vessels] };
}
