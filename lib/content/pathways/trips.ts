// Wild Pathways 2B: voyages and overland routes on the pathways.
//
// Trips are repo content (lib/content/trips), not library records, so their
// pathway classification is the hand-kept trip-map.json beside this file.
// A trip keeps its own canonical URL (t.seo.path) and Ledger ID; the pathway
// pages list it next to the stays. Drafts never leave this module unless a
// caller asks for them. Server-only: trip-pages reads the map files from disk.

import map from "./trip-map.json";
import { TRIPS, type Trip } from "@/lib/content/trips";
import { tripHeroImage } from "@/lib/content/trip-pages";
import { pathway, VOLUME_KEYS, type Pathway, type PathwayId, type VolumeKey } from "@/lib/pathways";

export type TripPathwayEntry = {
  slug: string; kind: "voyage" | "route"; primaryPathway: PathwayId; secondaryPathways: PathwayId[]; volumes: VolumeKey[];
  setting: string; status: "draft" | "approved"; classifiedBy: string; why: string;
};
export type PathwayTrip = TripPathwayEntry & {
  trip: Trip; href: string; name: string; line: string; country: string | null; ledgerId: string | null;
  hero: { url: string; alt: string } | null; primary: Pathway; secondary: Pathway[];
};

export const TRIP_PATHWAY_MAP: TripPathwayEntry[] = ((map as { records: Record<string, unknown>[] }).records).map((r) => ({
  slug: String(r.slug), kind: r.kind as "voyage" | "route", primaryPathway: r.primary as PathwayId,
  secondaryPathways: (r.secondary as PathwayId[]) ?? [], volumes: (r.volumes as VolumeKey[]) ?? [], setting: String(r.setting ?? ""),
  status: (r.status as "draft" | "approved") ?? "draft", classifiedBy: String(r.classifiedBy ?? ""), why: String(r.why ?? ""),
}));

const LEDGER_ID = /\b[A-Z]{3}-(?:[A-Z]+-)?\d{4}-\d{6}\b/;

/** Validation for the map: every slug is a live trip; pathways and volumes are real; the primary is not repeated. */
export function validateTripMap(entries: TripPathwayEntry[] = TRIP_PATHWAY_MAP, trips: Record<string, unknown> = TRIPS): string[] {
  const bad: string[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.slug)) bad.push(`${e.slug}: duplicate`);
    seen.add(e.slug);
    if (!(e.slug in trips)) bad.push(`${e.slug}: not a trip in lib/content/trips`);
    if (!pathway(e.primaryPathway)) bad.push(`${e.slug}: unknown primary ${e.primaryPathway}`);
    for (const s of e.secondaryPathways) {
      if (!pathway(s)) bad.push(`${e.slug}: unknown secondary ${s}`);
      if (s === e.primaryPathway) bad.push(`${e.slug}: secondary repeats the primary`);
    }
    if (!e.volumes.length) bad.push(`${e.slug}: at least one volume`);
    for (const v of e.volumes) if (!VOLUME_KEYS.includes(v)) bad.push(`${e.slug}: unknown volume ${v}`);
    if (e.kind === "voyage" && !e.volumes.includes("voyages")) bad.push(`${e.slug}: a voyage sits in Voyages`);
    if (e.kind === "route" && !e.volumes.includes("overland")) bad.push(`${e.slug}: a route sits in Overland`);
    if (!["draft", "approved"].includes(e.status)) bad.push(`${e.slug}: status`);
  }
  return bad;
}

export function pathwayTrips(opts: { includeDrafts?: boolean } = {}): PathwayTrip[] {
  const out: PathwayTrip[] = [];
  for (const e of TRIP_PATHWAY_MAP) {
    if (!opts.includeDrafts && e.status !== "approved") continue;
    const trip = TRIPS[e.slug];
    const primary = pathway(e.primaryPathway);
    if (!trip || !primary) continue;
    const hero = tripHeroImage(trip);
    out.push({
      ...e, trip, href: trip.seo.path, name: trip.h1, line: trip.sub, country: trip.crumbs?.[2] ?? null,
      ledgerId: trip.ledgerline?.match(LEDGER_ID)?.[0] ?? null,
      hero: hero ? { url: hero.url, alt: hero.alt } : null, primary,
      secondary: e.secondaryPathways.map((p) => pathway(p)).filter((p): p is Pathway => !!p),
    });
  }
  return out;
}

/** Trips on a pathway, primary first. */
export function tripsOnPathway(id: PathwayId, opts: { includeDrafts?: boolean } = {}): PathwayTrip[] {
  const all = pathwayTrips(opts);
  return [...all.filter((t) => t.primaryPathway === id), ...all.filter((t) => t.secondaryPathways.includes(id))];
}
