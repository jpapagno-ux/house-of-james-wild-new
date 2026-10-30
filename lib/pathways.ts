// Wild Pathways: the house's shared discovery taxonomy (Phase 1 Foundation
// brief V1.3 §4, palette addendum V1.4 §4). Eight editorial collections that
// cut across the six volumes. A record may sit on several pathways; the
// primary one sets its default accent, the rest print as small labelled chips.
//
// Rules
// • Pathways are editorial collections, never geographical categories. They
//   never replace the volumes (lib/volumes.ts), the map legend
//   (lib/ledger/categories.ts) or a record's own Ledger ID and URL.
// • One accent per PATH-ID, used the same way on the Stays pages, the Compass
//   and the Ledgers. Never identify a pathway by colour alone: print its name.
// • `accent` is for fills, markers and rules. `text` is the darkest-needed
//   variant that reaches WCAG AA (≥ 4.5:1) on white and on the quiet card
//   tone (#F6F4F0); use it for any pathway-coloured words. `onAccent` says
//   which ink may sit on a solid accent fill, or "large" when only large or
//   bold text (≥ 3:1) is safe there: use the tint fill with `text` instead.
// • Nothing here touches the regenerated library JSON. Record → pathway
//   assignments live in lib/content/pathways/pathway-map.json.
//
// Five accents differ from the addendum's proposal (agreed with James, 30 Oct
// 2026, decision D3). PATH-03, 04 and 05 are each darkened the smallest step
// that lets white text pass AA on a solid fill; PATH-01 is shifted a step cooler so it is not the
// same hex as the Impact Note's forest green (#405A45), and PATH-07 reuses
// the house's existing residence rust (#94512F) rather than adding a second
// rust beside it.

// Kept import-free (like lib/ledger/travel-types.ts) so plain Node can test it.
// VolumeKey mirrors lib/volumes.ts; tests assert the two lists agree.
export type VolumeKey = "stays" | "safaris" | "gatherings" | "voyages" | "europe" | "overland";
export const VOLUME_KEYS: VolumeKey[] = ["stays", "safaris", "gatherings", "voyages", "europe", "overland"];

export type PathwayId = "PATH-01" | "PATH-02" | "PATH-03" | "PATH-04" | "PATH-05" | "PATH-06" | "PATH-07" | "PATH-08";
export type PathwayKey = "into-the-green" | "between-tides" | "above-it-all" | "where-the-wild-lives" | "the-art-of-stillness" | "off-the-map" | "a-place-of-our-own" | "rooted-in-place";

export type Pathway = {
  id: PathwayId;
  key: PathwayKey; // slug for /pathways/[key] and CSS class suffixes
  name: string; // editorial name, always printed beside the colour
  setting: string; // the setting or experience it collects
  line: string; // one-line house description for cards and the Compass
  accent: string; // fills, markers, rules
  text: string; // AA text on white / card
  tint: string; // quiet wash for chips and panels
  onAccent: "white" | "ink" | "large";
  proposed?: string; // the addendum's hex when it differs from `accent`
  volumes: VolumeKey[]; // volumes this pathway most often draws from (editorial hint, not a rule)
};

export const PATHWAYS: Record<PathwayId, Pathway> = {
  "PATH-01": {
    id: "PATH-01", key: "into-the-green", name: "Into the Green", setting: "Rainforest and jungle",
    line: "Canopy, cloud forest and the river roads between them.",
    accent: "#38634B", text: "#38634B", tint: "#EBF0EC", onAccent: "white", proposed: "#405A45", volumes: ["stays", "overland"],
  },
  "PATH-02": {
    id: "PATH-02", key: "between-tides", name: "Between Tides", setting: "Islands and oceans",
    line: "Atolls, reefs and the small ships that reach them.",
    accent: "#426E79", text: "#426E79", tint: "#ECF2F3", onAccent: "white", volumes: ["stays", "voyages"],
  },
  "PATH-03": {
    id: "PATH-03", key: "above-it-all", name: "Above It All", setting: "Mountains and highlands",
    line: "Thin air, long views and the quiet above the tree line.",
    accent: "#73786C", text: "#696D62", tint: "#F0F1EF", onAccent: "white", proposed: "#7D8275", volumes: ["stays", "overland", "europe"],
  },
  "PATH-04": {
    id: "PATH-04", key: "where-the-wild-lives", name: "Where the Wild Lives", setting: "Wildlife and wilderness",
    line: "Game drives, guides and the conservancies that keep the wild wild.",
    accent: "#936F49", text: "#866642", tint: "#F5F0EA", onAccent: "white", proposed: "#A0794F", volumes: ["safaris", "stays"],
  },
  "PATH-05": {
    id: "PATH-05", key: "the-art-of-stillness", name: "The Art of Stillness", setting: "Wellness and restoration",
    line: "Hot springs, slow mornings and places built for doing less.",
    accent: "#737769", text: "#6C7062", tint: "#F2F3F0", onAccent: "white", proposed: "#929785", volumes: ["stays", "europe"],
  },
  "PATH-06": {
    id: "PATH-06", key: "off-the-map", name: "Off the Map", setting: "Hidden and undiscovered",
    line: "Places with no signpost, filed before anyone else found them.",
    accent: "#766B63", text: "#766B63", tint: "#F1EFEE", onAccent: "white", volumes: ["overland", "stays", "europe"],
  },
  "PATH-07": {
    id: "PATH-07", key: "a-place-of-our-own", name: "A Place of Our Own", setting: "Private residences",
    line: "Whole houses, whole islands, whole camps: one party, one roof.",
    accent: "#94512F", text: "#94512F", tint: "#F7EFE6", onAccent: "white", proposed: "#A65332", volumes: ["gatherings", "stays"],
  },
  "PATH-08": {
    id: "PATH-08", key: "rooted-in-place", name: "Rooted in Place", setting: "Heritage and culture",
    line: "Working farms, old houses and hosts whose families never left.",
    accent: "#8D6958", text: "#876554", tint: "#F4F0EE", onAccent: "white", volumes: ["europe", "stays", "gatherings"],
  },
};

export const PATHWAY_ORDER: PathwayId[] = ["PATH-01", "PATH-02", "PATH-03", "PATH-04", "PATH-05", "PATH-06", "PATH-07", "PATH-08"];
export const PATHWAY_LIST: Pathway[] = PATHWAY_ORDER.map((id) => PATHWAYS[id]);

/** Pathway by ID or by key; undefined for anything else (never a silent default). */
export function pathway(idOrKey: string | null | undefined): Pathway | undefined {
  if (!idOrKey) return undefined;
  if (idOrKey in PATHWAYS) return PATHWAYS[idOrKey as PathwayId];
  return PATHWAY_LIST.find((p) => p.key === idOrKey);
}

/** The Impact Note ("Where Your Stay Gives Back") palette, addendum §5. */
export const IMPACT = {
  panel: "#E6E9DD", // soft sage
  copy: "#405A45", // forest green: copy and icons (6.17:1 on the panel)
  highlight: "#94512F", // selective rust, the house's existing residence rust
} as const;

export type ImpactStatus = "verified" | "partner_reported" | "pending_review" | "unavailable";
export type ImpactKind = "conservation" | "habitat" | "marine" | "employment" | "sourcing" | "culture" | "community" | "levy" | "beneficiary";
export type ImpactMoney = "guest_levy" | "voluntary_donation" | "property_spend" | "none";

export const IMPACT_STATUS_LABEL: Record<ImpactStatus, string> = {
  verified: "Verified by the house",
  partner_reported: "Partner-reported",
  pending_review: "Pending review",
  unavailable: "Not yet documented",
};

/* ---------- Record → pathway relationships (lib/content/pathways/pathway-map.json) ---------- */

export type ImpactStatement = {
  kind: ImpactKind;
  money: ImpactMoney;
  statement: string;
  source: string | null;
  reviewed: string; // ISO date of the last house review
  status: ImpactStatus;
};

export type PathwayRecord = {
  slug: string;
  ledgerId: string | null;
  primaryPathway: PathwayId;
  secondaryPathways: PathwayId[];
  volumes: VolumeKey[];
  setting: string;
  intentions: string[];
  suitability: string[];
  classificationStatus: "draft" | "approved";
  classifiedBy: string;
  impact: ImpactStatement[];
};

/**
 * Integrity checks the test suite runs on the map: every pathway and volume
 * exists, the primary is not repeated as a secondary, every impact
 * statement carries a review date and a status, and a statement marked
 * verified or partner-reported names its source.
 */
export function validatePathwayMap(records: PathwayRecord[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const r of records) {
    if (seen.has(r.slug)) errors.push(`${r.slug}: listed twice`);
    seen.add(r.slug);
    if (!(r.primaryPathway in PATHWAYS)) errors.push(`${r.slug}: unknown primary pathway ${r.primaryPathway}`);
    for (const p of r.secondaryPathways) {
      if (!(p in PATHWAYS)) errors.push(`${r.slug}: unknown secondary pathway ${p}`);
      if (p === r.primaryPathway) errors.push(`${r.slug}: primary pathway repeated as secondary`);
    }
    if (!r.volumes.length) errors.push(`${r.slug}: no volume`);
    for (const v of r.volumes) if (!VOLUME_KEYS.includes(v)) errors.push(`${r.slug}: unknown volume ${v}`);
    if (r.ledgerId && !/^[A-Z]{3}-\d{4}-\d{6}$/.test(r.ledgerId)) errors.push(`${r.slug}: Ledger ID ${r.ledgerId} is not in the STY-YYYY-NNNNNN form`);
    for (const [i, s] of r.impact.entries()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s.reviewed)) errors.push(`${r.slug}: impact ${i} has no review date`);
      if (!["verified", "partner_reported", "pending_review", "unavailable"].includes(s.status)) errors.push(`${r.slug}: impact ${i} has an unknown status`);
      if ((s.status === "verified" || s.status === "partner_reported") && !s.source) errors.push(`${r.slug}: impact ${i} is ${s.status} but names no source`);
      if (/\b\d+(\.\d+)?\s?%|\$\s?\d|USD|per cent|percent of (room|revenue)/i.test(s.statement) && s.status !== "verified") errors.push(`${r.slug}: impact ${i} quotes a figure that is not verified`);
    }
  }
  return errors;
}

/* ---------- Library-first merge (Phase 2A) ---------- */

/** The shape of a stay as the library export carries it (lib/content/stays.ts StayData, narrowed). */
export type LibraryStay = { slug: string; ledgerId: string | null; pathway?: { primary: string; secondary: string[]; setting: string | null; intentions: string[]; suitability: string[]; status: "draft" | "approved"; classifiedBy: string | null; classifiedAt: string | null } | null; volumes?: string[] | null };

function fromLibrary(s: LibraryStay, impactByRef: Record<string, ImpactStatement[]>): PathwayRecord | null {
  const p = s.pathway;
  if (!p || !pathway(p.primary)) return null;
  return {
    slug: s.slug, ledgerId: s.ledgerId, primaryPathway: p.primary as PathwayId,
    secondaryPathways: p.secondary.filter((x) => pathway(x) && x !== p.primary) as PathwayId[],
    volumes: ((s.volumes ?? []).filter((v) => VOLUME_KEYS.includes(v as VolumeKey)) as VolumeKey[]),
    setting: p.setting ?? "", intentions: p.intentions, suitability: p.suitability,
    classificationStatus: p.status, classifiedBy: p.classifiedBy ?? "library",
    impact: impactByRef[s.slug] ?? [],
  };
}

export function mergeRecords(stays: LibraryStay[], overrides: PathwayRecord[], impactByRef: Record<string, ImpactStatement[]> = {}): PathwayRecord[] {
  const out = new Map<string, PathwayRecord>();
  for (const s of stays) { const r = fromLibrary(s, impactByRef); if (r) out.set(r.slug, r); }
  for (const o of overrides) {
    const lib = out.get(o.slug);
    if (!lib) { out.set(o.slug, o); continue; }
    out.set(o.slug, { ...lib, volumes: lib.volumes.length ? lib.volumes : o.volumes, setting: lib.setting || o.setting, intentions: lib.intentions.length ? lib.intentions : o.intentions, suitability: lib.suitability.length ? lib.suitability : o.suitability, impact: lib.impact.length ? lib.impact : o.impact });
  }
  return [...out.values()];
}

