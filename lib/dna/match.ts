// The DNA match (James, 18 Nov 2026): a traveller's six answers against each advisor's six. Pure, import-free
// at runtime, tested in tests/dna-match.test.ts.
//
// Rules:
//  - Language and availability are gates: an advisor who doesn't plan in the traveller's language, or who is
//    not taking clients, is never offered.
//  - A place counts double when the advisor has marked it first-hand (Stayed, Sailed It, Walked It) on a record
//    in that country; a place they only state counts once.
//  - Unconfirmed DNA (the advisor hasn't confirmed it on their desk) counts, but ranks below confirmed DNA on a tie.
//  - The traveller is shown the answers they share, never a percentage.
import type { DnaQuestionId } from "./vocabulary";

export type TravellerDna = { pathways?: string[]; countries?: string[]; volumes?: string[]; specialties?: string[]; party?: string | null; language?: string | null };
export type AdvisorDnaLike = {
  slug: string; pathways: string[]; countries: string[]; volumes: string[]; specialties: string[]; partyTypes: string[]; languages: string[];
  availability: "open" | "waitlist" | "closed"; confirmed: boolean;
  markedCountries: string[]; // countries of Ledger records the advisor marked first-hand
};
export type SharedRow = { id: DnaQuestionId; shared: string[]; firstHand?: boolean };
export type DnaMatchResult = { slug: string; inCommon: number; score: number; rows: SharedRow[]; waitlist: boolean };

const both = (a: string[] = [], b: string[] = []) => a.filter((x) => b.includes(x));

export function matchAdvisors(t: TravellerDna, pool: AdvisorDnaLike[]): DnaMatchResult[] {
  const out: DnaMatchResult[] = [];
  for (const a of pool) {
    if (a.availability === "closed") continue;
    if (t.language && a.languages.length && !a.languages.includes(t.language)) continue;
    const rows: SharedRow[] = [];
    let score = 0;
    const paths = both(t.pathways, a.pathways);
    if (paths.length) { rows.push({ id: "drawn", shared: paths }); score += 3 * paths.length; }
    const places = both(t.countries, a.countries);
    const firstHand = places.filter((c) => a.markedCountries.includes(c));
    if (places.length) { rows.push({ id: "where", shared: places, firstHand: firstHand.length > 0 }); score += 4 * places.length + 4 * firstHand.length; }
    const vols = both(t.volumes, a.volumes);
    if (vols.length) { rows.push({ id: "how", shared: vols }); score += 2 * vols.length; }
    const does = both(t.specialties, a.specialties);
    if (does.length) { rows.push({ id: "do", shared: does }); score += 2 * does.length; }
    if (t.party && a.partyTypes.includes(t.party)) { rows.push({ id: "who", shared: [t.party] }); score += 1; }
    if (t.language && a.languages.includes(t.language)) rows.push({ id: "language", shared: [t.language] });
    const inCommon = rows.length;
    if (!rows.some((r) => r.id !== "language")) continue; // a shared language alone is not a match
    out.push({ slug: a.slug, inCommon, score: a.confirmed ? score : score - 0.5, rows, waitlist: a.availability === "waitlist" });
  }
  return out.sort((x, y) => y.score - x.score || y.inCommon - x.inCommon || x.slug.localeCompare(y.slug));
}

/** How many of the six questions the traveller actually answered (the denominator shown as "4 of your 6"). */
export const answered = (t: TravellerDna) =>
  [t.pathways?.length, t.countries?.length, t.volumes?.length, t.specialties?.length, t.party, t.language].filter(Boolean).length;
