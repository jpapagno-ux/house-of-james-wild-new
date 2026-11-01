// The Compass → Wild Pathways adapter (brief §7). A pure function beside the
// existing Compass (components/destination/Compass.tsx), which it does not
// change: it takes a reading in the Compass's own vocabulary (traveller,
// season) plus the brief's extra axes, reads the pathway map, and returns an
// explainable shortlist: Ledger ID, canonical slug, pathways, volumes, and
// the reasons in plain words. Iggi leads the discovery; James contributes
// only where an approved Field Verdict already exists for the record.
//
// Safari and Botswana readings stay with Crux at Wild & Co Safaris
// (decision D4, 30 Oct 2026): when the reading is clearly a safari with no
// pathway interest beyond it, the adapter says so and points there.
//
// Import-free except the taxonomy, so plain Node can test it.

import type { PathwayId, PathwayRecord, VolumeKey } from "@/lib/pathways";

// Names printed in reasons. Kept here (import-free) so plain Node can test
// the adapter; tests assert this mirrors lib/pathways.ts.
export const PATHWAY_NAMES: Record<PathwayId, string> = {
  "PATH-01": "Into the Green", "PATH-02": "Between Tides", "PATH-03": "Above It All", "PATH-04": "Where the Wild Lives",
  "PATH-05": "The Art of Stillness", "PATH-06": "Off the Map", "PATH-07": "A Place of Our Own", "PATH-08": "Rooted in Place",
};

export type Party = "couple" | "family" | "friends" | "solo" | "group";
export type Setting = "rainforest" | "ocean" | "mountain" | "wildlife" | "wellness" | "hidden" | "private" | "heritage";
export type Pace = "unhurried" | "balanced" | "full";
export type Privacy = "any" | "private_house" | "small_camp";
export type Season = "dry" | "green" | "any";

export type Reading = {
  party?: Party;
  settings?: Setting[]; // what they're drawn to; maps 1:1 onto pathways
  pace?: Pace;
  interests?: string[]; // free intentions, matched against record.intentions
  privacy?: Privacy;
  season?: Season;
  conservation?: boolean; // "it matters to me that the stay gives back"
  culture?: boolean; // "I want hosts and history, not just scenery"
};

export const SETTING_TO_PATHWAY: Record<Setting, PathwayId> = {
  rainforest: "PATH-01", ocean: "PATH-02", mountain: "PATH-03", wildlife: "PATH-04",
  wellness: "PATH-05", hidden: "PATH-06", private: "PATH-07", heritage: "PATH-08",
};

const PARTY_SUITS: Record<Party, string[]> = {
  couple: ["couples", "honeymoon"], family: ["families", "family"], friends: ["small_groups", "private_groups", "friends"],
  solo: ["solo", "couples"], group: ["private_groups", "small_groups", "exclusive_use"],
};

export type Reason = { kind: "pathway" | "party" | "interest" | "privacy" | "season" | "conservation" | "culture" | "verdict"; text: string; weight: number };

export type Fit = {
  ledgerId: string | null;
  slug: string;
  primaryPathway: PathwayId;
  pathways: PathwayId[]; // primary first
  volumes: VolumeKey[];
  score: number;
  reasons: Reason[]; // why it fits, in order of weight
  fieldVerdict: boolean; // an approved James verdict exists for this record
  impactDocumented: boolean; // at least one impact statement with a source
};

export type Shortlist = {
  fits: Fit[];
  handoff: { to: "crux"; href: string; line: string } | null;
  explain: string; // Iggi's one-line summary of how the reading was weighed
};

export const CRUX_HREF = "/safaris/wild-co-safaris"; // the one door; only that page links out

/** Season fit, in the words the Ledger uses for best months (same rule as the Costa Rica Compass). */
export function fitsSeason(bestMonths: string | null | undefined, season: Season): boolean | null {
  if (season === "any" || !bestMonths) return null;
  const m = bestMonths.toLowerCase();
  if (season === "dry") return /dec|jan|feb|mar|apr/.test(m);
  return /may|jun|jul|aug|sep|oct|nov|year.round|january.december/.test(m);
}

type Record_ = PathwayRecord & {
  bestMonths?: string | null; hasVerdict?: boolean;
  /** Set by the page when the record's impact statements are documented, so the client payload need not carry them. */
  impactDocumented?: boolean;
  /** The founder's standing with the place (founder_vetted / founder_returned / founder_visited / partner_verified): a tie-break, never a reason to appear. */
  founderMark?: string | null;
  /** For the diversity rule: no shortlist is five camps in one country when others fit as well. */
  country?: string | null;
  kind?: "stay" | "voyage" | "route";
};

/** Best-for tags from the Ledger (bestFor) → the suitability words the party axis reads. */
export const BEST_FOR_SUITS: Record<string, string[]> = {
  honeymoon: ["couples", "honeymoon"], family: ["families"], solo: ["solo"], group_exclusive_use: ["private_groups", "exclusive_use", "families"],
  wildlife_photography: ["photographers"], adventure: ["friends", "solo"], wine: ["couples"], first_safari: ["families", "couples"], luxury: [],
};
export const suitabilityFrom = (bestFor: string[] | null | undefined, own: string[]): string[] => {
  const out = new Set(own);
  for (const b of bestFor ?? []) for (const w of BEST_FOR_SUITS[b] ?? []) out.add(w);
  return [...out];
};

export function readPathways(reading: Reading, records: Record_[], opts: { includeDrafts?: boolean; limit?: number } = {}): Shortlist {
  const wanted = (reading.settings ?? []).map((s) => SETTING_TO_PATHWAY[s]);
  const limit = opts.limit ?? 5;
  const fits: Fit[] = [];

  for (const r of records) {
    if (!opts.includeDrafts && r.classificationStatus !== "approved") continue;
    const reasons: Reason[] = [];
    const all = [r.primaryPathway, ...r.secondaryPathways];

    for (const p of wanted) {
      if (p === r.primaryPathway) reasons.push({ kind: "pathway", text: `${PATHWAY_NAMES[p]} is its primary pathway`, weight: 3 });
      else if (all.includes(p)) reasons.push({ kind: "pathway", text: `also sits on ${PATHWAY_NAMES[p]}`, weight: 1.5 });
    }
    if (reading.party) {
      const hit = PARTY_SUITS[reading.party].find((s) => r.suitability.includes(s));
      if (hit) {
        const who = reading.party === "couple" ? "couples" : reading.party === "solo" ? "solo travellers" : reading.party === "family" ? "families" : "a private party";
        const how = hit.replace(/_/g, " ");
        reasons.push({ kind: "party", text: how === who ? `suits ${who}` : `suits ${who}: ${how}`, weight: 2 });
      }
    }
    for (const i of reading.interests ?? []) {
      const key = i.toLowerCase().replace(/\s+/g, "_");
      if (r.intentions.some((x) => x === key || x.includes(key) || key.includes(x))) reasons.push({ kind: "interest", text: `on file for ${i}`, weight: 1 });
    }
    if (reading.privacy === "private_house" && all.includes("PATH-07")) reasons.push({ kind: "privacy", text: "a place of your own: whole-house or exclusive use", weight: 2 });
    if (reading.privacy === "small_camp" && r.suitability.includes("small_groups")) reasons.push({ kind: "privacy", text: "small camp, few guests", weight: 1 });
    const season = fitsSeason(r.bestMonths, reading.season ?? "any");
    if (season === true) reasons.push({ kind: "season", text: `in season for the ${reading.season} months`, weight: 1 });
    const documented = r.impactDocumented ?? r.impact.some((s) => !!s.source && (s.status === "verified" || s.status === "partner_reported"));
    if (reading.conservation && documented) reasons.push({ kind: "conservation", text: "what the stay gives back is on record, with a source", weight: 1.5 });
    if (reading.culture && all.includes("PATH-08")) reasons.push({ kind: "culture", text: "rooted in place: hosts and history, not only scenery", weight: 1.5 });
    if (r.hasVerdict) reasons.push({ kind: "verdict", text: "James has a Field Verdict on file", weight: 0.5 });
    if (!r.hasVerdict && r.founderMark && r.founderMark !== "unclassified") reasons.push({ kind: "verdict", text: r.founderMark === "partner_verified" ? "partner-verified in the Ledger" : "the founder has been", weight: 0.25 });

    // The pathways are the discovery axis (brief §4): once a traveller names a setting, only records on one of
    // those pathways answer. Party, season, privacy and the rest rank within that, never around it.
    if (wanted.length && !reasons.some((x) => x.kind === "pathway")) continue;
    const score = reasons.reduce((n, x) => n + x.weight, 0);
    if (score <= 0) continue;
    reasons.sort((a, b) => b.weight - a.weight);
    fits.push({ ledgerId: r.ledgerId, slug: r.slug, primaryPathway: r.primaryPathway, pathways: all, volumes: r.volumes, score, reasons, fieldVerdict: !!r.hasVerdict, impactDocumented: documented });
  }
  fits.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
  // Diversity: with the whole Ledger answering, a shortlist should not be five camps in one country
  // when places elsewhere fit just as well. At most two per country until the limit is short of fits.
  const byCountry = new Map(records.map((r) => [r.slug, r.country ?? null]));
  const picked: Fit[] = []; const seen = new Map<string, number>(); const passedOver: Fit[] = [];
  for (const f of fits) {
    const c = byCountry.get(f.slug) ?? "";
    if (c && (seen.get(c) ?? 0) >= 2) { passedOver.push(f); continue; }
    picked.push(f); seen.set(c, (seen.get(c) ?? 0) + 1);
    if (picked.length >= limit) break;
  }
  const shortlist = picked.length < limit ? [...picked, ...passedOver].slice(0, limit) : picked;

  // A reading that is only "wildlife" is a safari reading: Crux's territory.
  const safariOnly = wanted.length > 0 && wanted.every((p) => p === "PATH-04");
  const handoff = safariOnly ? { to: "crux" as const, href: CRUX_HREF, line: "A pure safari reading belongs with Crux at Wild & Co Safaris, who knows every camp by reserve. The Ledger's safari stays are listed below for context." } : null;

  const parts = [
    wanted.length ? `drawn to ${wanted.map((p) => PATHWAY_NAMES[p]).join(" and ")}` : "open to any setting",
    reading.party ? `travelling as a ${reading.party}` : null,
    reading.season && reading.season !== "any" ? `in the ${reading.season} months` : null,
    reading.conservation ? "giving back matters" : null,
  ].filter(Boolean);
  return { fits: shortlist, handoff, explain: `Iggi weighed: ${parts.join(", ")}.` };
}
