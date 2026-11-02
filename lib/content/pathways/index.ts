// Wild Pathways: record → pathway relationships. Reads the hand-kept
// pathway-map.json (never the regenerated stays.json) and joins each entry
// to its existing Ledger record by slug, so a stay keeps one canonical ID and
// URL however many pathways and volumes it sits on.
//
// Everything here is Phase 1 sample data marked `draft`; the public pages
// print nothing from it until the entry's classificationStatus is "approved".

export type { PathwayRecord };
import map from "./pathway-map.json";
import impactLib from "./impact-library.json";
import { mergeRecords, pathway, type ImpactStatement, type Pathway, type PathwayId, type PathwayRecord } from "@/lib/pathways";
import { STAYS, VESSEL_RECORDS, pageReady, type StayData } from "@/lib/content/stays";
import { VESSEL_WATERS, vesselHref, watersOf } from "@/lib/content/vessels";
import { recordHref } from "@/lib/ledger/urls";


/** Hand-kept override records (Phase 1 samples; Phase 2: the few cases the library cannot express). */
export const PATHWAY_OVERRIDES: PathwayRecord[] = (map as { records: PathwayRecord[] }).records;
const IMPACT_BY_REF = (impactLib as { byRef: Record<string, ImpactStatement[]> }).byRef ?? {};

/**
 * Source order (Phase 2A), see mergeRecords in lib/pathways.ts: the library export first, then the override file.
 * A stay classified in the library (`stay.pathway`) is the canonical record;
 * an override entry for the same slug only fills what the library left empty
 * (impact statements in particular, until ImpactNote records exist).
 */
export const PATHWAY_MAP: PathwayRecord[] = mergeRecords(STAYS, PATHWAY_OVERRIDES, IMPACT_BY_REF);

/** A sample record joined to its Ledger stay, or null when the slug is not in the export. */
export type PathwayStay = PathwayRecord & { stay: StayData; href: string; primary: Pathway; secondary: Pathway[] };

export function pathwayStays(opts: { includeDrafts?: boolean } = {}): PathwayStay[] {
  const out: PathwayStay[] = [];
  for (const r of PATHWAY_MAP) {
    if (!opts.includeDrafts && r.classificationStatus !== "approved") continue;
    const stay = STAYS.find((s) => s.slug === r.slug);
    const primary = pathway(r.primaryPathway);
    if (!stay || !primary) continue;
    // Live lists (pathway pages, ItemList schema, the Compass) name only stays that have a page; a classified
    // record whose page is not yet released stays out until it is (house audit, 1 Nov 2026). Previews see all.
    if (!opts.includeDrafts && !pageReady(stay)) continue;
    out.push({ ...r, stay, href: recordHref("stay", r.slug), primary, secondary: r.secondaryPathways.map((p) => pathway(p)).filter((p): p is Pathway => !!p) });
  }
  return out;
}

export const pathwayRecord = (slug: string) => PATHWAY_MAP.find((r) => r.slug === slug);

/** Records on one pathway (primary or secondary), drafts included only when asked. */
export const onPathway = (id: PathwayId, opts?: { includeDrafts?: boolean }) =>
  pathwayStays(opts).filter((r) => r.primaryPathway === id || r.secondaryPathways.includes(id));

export { validatePathwayMap } from "@/lib/pathways";

/** Approved pathway chips for a saved stay, by slug (Ledger pages, Phase 2E). Null when unclassified or still draft. */
export function pathwayChipsFor(slug: string): { primary: Pathway; secondary: Pathway[] } | null {
  const r = pathwayStays().find((x) => x.slug === slug);
  return r ? { primary: r.primary, secondary: r.secondary } : null;
}

/**
 * Vessels on the pathways (James, 1 Nov 2026): boats filed in the Stay library keep their approved
 * pathway tags but list as Voyages, never as stays (lib/content/vessels.ts). Same shape the pathway
 * pages and the Compass use for journeys; each links to the vessel's current page.
 */
export type PathwayVessel = {
  slug: string; kind: "voyage"; name: string; line: string; country: string | null; ledgerId: string | null; href: string;
  hero: { url: string; alt: string } | null; primaryPathway: PathwayId; secondaryPathways: PathwayId[]; primary: Pathway; secondary: Pathway[];
  volumes: PathwayRecord["volumes"]; setting: string; status: "draft" | "approved"; stay: StayData;
};
const VESSEL_MAP: PathwayRecord[] = mergeRecords(VESSEL_RECORDS, [], IMPACT_BY_REF);

export function pathwayVessels(opts: { includeDrafts?: boolean } = {}): PathwayVessel[] {
  const out: PathwayVessel[] = [];
  for (const r of VESSEL_MAP) {
    if (!opts.includeDrafts && r.classificationStatus !== "approved") continue;
    const stay = VESSEL_RECORDS.find((s) => s.slug === r.slug);
    const primary = pathway(r.primaryPathway);
    if (!stay || !primary || (!opts.includeDrafts && !pageReady(stay))) continue;
    const country = VESSEL_WATERS[watersOf(stay.slug)].country ?? stay.country;
    out.push({
      slug: r.slug, kind: "voyage", name: stay.name, line: stay.tagline ?? "", country, ledgerId: stay.ledgerId, href: vesselHref(stay.slug),
      hero: stay.hero ? { url: stay.hero, alt: `${stay.name}${country ? `, ${country}` : ""}` } : null,
      primaryPathway: r.primaryPathway, secondaryPathways: r.secondaryPathways, primary,
      secondary: r.secondaryPathways.map((p) => pathway(p)).filter((p): p is Pathway => !!p),
      volumes: r.volumes.includes("voyages") ? r.volumes : ["voyages"], setting: r.setting, status: r.classificationStatus === "approved" ? "approved" : "draft", stay,
    });
  }
  return out;
}

/** Vessels on one pathway, primary first. */
export function vesselsOnPathway(id: PathwayId, opts?: { includeDrafts?: boolean }): PathwayVessel[] {
  const all = pathwayVessels(opts);
  return [...all.filter((v) => v.primaryPathway === id), ...all.filter((v) => v.secondaryPathways.includes(id))];
}

/** Approved pathway chips for a vessel, by its stay-library slug. */
export function vesselChipsFor(slug: string): { primary: Pathway; secondary: Pathway[] } | null {
  const v = pathwayVessels().find((x) => x.slug === slug);
  return v ? { primary: v.primary, secondary: v.secondary } : null;
}
