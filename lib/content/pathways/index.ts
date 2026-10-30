// Wild Pathways: record → pathway relationships. Reads the hand-kept
// pathway-map.json (never the regenerated stays.json) and joins each entry
// to its existing Ledger record by slug, so a stay keeps one canonical ID and
// URL however many pathways and volumes it sits on.
//
// Everything here is Phase 1 sample data marked `draft`; the public pages
// print nothing from it until the entry's classificationStatus is "approved".

export type { ImpactStatement, PathwayRecord };
import map from "./pathway-map.json";
import { pathway, type ImpactStatement, type Pathway, type PathwayId, type PathwayRecord } from "@/lib/pathways";
import type { VolumeKey } from "@/lib/volumes";
import { STAYS, type StayData } from "@/lib/content/stays";
import { recordHref } from "@/lib/ledger/urls";

export const PATHWAY_MAP: PathwayRecord[] = (map as { records: PathwayRecord[] }).records;

/** A sample record joined to its Ledger stay, or null when the slug is not in the export. */
export type PathwayStay = PathwayRecord & { stay: StayData; href: string; primary: Pathway; secondary: Pathway[] };

export function pathwayStays(opts: { includeDrafts?: boolean } = {}): PathwayStay[] {
  const out: PathwayStay[] = [];
  for (const r of PATHWAY_MAP) {
    if (!opts.includeDrafts && r.classificationStatus !== "approved") continue;
    const stay = STAYS.find((s) => s.slug === r.slug);
    const primary = pathway(r.primaryPathway);
    if (!stay || !primary) continue;
    out.push({ ...r, stay, href: recordHref("stay", r.slug), primary, secondary: r.secondaryPathways.map((p) => pathway(p)).filter((p): p is Pathway => !!p) });
  }
  return out;
}

export const pathwayRecord = (slug: string) => PATHWAY_MAP.find((r) => r.slug === slug);

/** Records on one pathway (primary or secondary), drafts included only when asked. */
export const onPathway = (id: PathwayId, opts?: { includeDrafts?: boolean }) =>
  pathwayStays(opts).filter((r) => r.primaryPathway === id || r.secondaryPathways.includes(id));

export { validatePathwayMap } from "@/lib/pathways";
