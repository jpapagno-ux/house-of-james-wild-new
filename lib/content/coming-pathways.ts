import type { PathwayId } from "@/lib/pathways";

// "Pair it with" (James, 2 Nov 2026: "you should suggest the pathways"): the existing Wild Pathway each
// coming property fits, shown on its What's Coming card and tinting it. Only the eight pathways in
// lib/pathways.ts; none is invented. Where the stay record already carries an approved primary pathway
// (Singita Elela, PATH-04, approved 31 Oct 2026) that one is used; the rest are house suggestions from the
// entry's own tagline and note, for James to approve when the stay record is filed.
export type ComingPathway = { id: PathwayId; basis: "approved" | "suggested"; why: string };

export const COMING_PATHWAYS: Record<string, ComingPathway> = {
  "singita-elela": { id: "PATH-04", basis: "approved", why: "Okavango Delta concession; approved on the stay record" },
  "beyond-xaranna-okavango-delta-camp-by-and-beyond": { id: "PATH-04", basis: "suggested", why: "Okavango Delta wildlife camp, as Singita Elela" },
  "anantara-siam-bangkok": { id: "PATH-08", basis: "suggested", why: "Bangkok landmark hotel; Jim Thompson Suite; heritage and culture" },
  "the-chedi-aquarius-koh-chang": { id: "PATH-02", basis: "suggested", why: "Island resort on Koh Chang, Gulf of Thailand" },
  "six-senses-uluwatu": { id: "PATH-05", basis: "suggested", why: "Clifftop wellness resort, as the house files Six Senses and Anantara Ubud" },
};

export const comingPathway = (slug: string): ComingPathway | null => COMING_PATHWAYS[slug] ?? null;
