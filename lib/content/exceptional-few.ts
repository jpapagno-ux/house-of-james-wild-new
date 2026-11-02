// The Exceptional Few™: an editorial layer applied to existing Stay records, read
// from the Airtable editorial-layer export (scripts/export-editorial-layer.mjs →
// exceptional-few.json). A Stay is never duplicated here; each row points at the
// canonical Ledger ID and the page joins on it. Words only: signals are never a
// score, and nothing here prints a star or a number out of a hundred.
import data from "./exceptional-few.json";
import { PATHWAYS, type Pathway } from "@/lib/pathways";

export type SignalKey = "place" | "privacy" | "design" | "access" | "humanity" | "rarity";
export const SIGNAL_LABEL: Record<SignalKey, string> = { place: "Place", privacy: "Privacy", design: "Design", access: "Access", humanity: "Humanity", rarity: "Rarity" };

export type ExceptionalFew = {
  id: string; stayId: string; staySlug: string; stayName: string;
  designationStatus: "proposed" | "under review" | "designated" | "withdrawn";
  collectionNumber: number;
  heroLine: string | null;
  whyItMadeTheCut: string[];
  jamesNote: { text: string; where: string; when: string } | null;
  signals: { key: SignalKey; line: string }[];
  pathwaysOverride: string[];
  worthAnotherNight: string | null;
  whoItSuits: string[];
  whoItMayNotSuit: string[];
  continueRefs: string[];
  selectionDate: string | null;
  reviewDate: string | null;
  publicationStatus: PublicationStatus;
  paletteKey: string;
};
export type PublicationStatus = "draft" | "reviewed" | "approved" | "published" | "withdrawn";
/** What production renders. A noindex preview may pass a wider set explicitly. */
export const LIVE: PublicationStatus[] = ["published"];

export const EXCEPTIONAL_FEW: ExceptionalFew[] = (data.records as ExceptionalFew[]);

/** The designation for a Stay, by its canonical Ledger ID. Only a designated row in an allowed publication status counts; production allows "published" only. */
export function exceptionalFewFor(stayId: string | null | undefined, allow: PublicationStatus[] = LIVE): ExceptionalFew | null {
  if (!stayId) return null;
  return EXCEPTIONAL_FEW.find((e) => e.stayId === stayId && e.designationStatus === "designated" && allow.includes(e.publicationStatus)) ?? null;
}
/** Every live designation, in collection order (for the future landing page and the Continue rail). */
export const EXCEPTIONAL_FEW_LIVE = EXCEPTIONAL_FEW.filter((e) => e.designationStatus === "designated" && LIVE.includes(e.publicationStatus)).sort((a, b) => a.collectionNumber - b.collectionNumber);

export const collectionNo = (n: number) => `No. ${String(n).padStart(3, "0")}`;

/** Pathway chips for a designation: the Stay's approved classification wins; the override fills in until then. */
export function efPathways(e: ExceptionalFew, stayPathway?: { primary: string; secondary: string[]; status: string } | null): { primary: Pathway; secondary: Pathway[] } | null {
  const byKey = (k: string) => Object.values(PATHWAYS).find((p) => p.key === k || p.id === k);
  if (stayPathway?.status === "approved") {
    const p = byKey(stayPathway.primary);
    if (p) return { primary: p, secondary: stayPathway.secondary.map(byKey).filter(Boolean) as Pathway[] };
  }
  const [first, ...rest] = e.pathwaysOverride.map(byKey).filter(Boolean) as Pathway[];
  return first ? { primary: first, secondary: rest } : null;
}

/** The page theme classes for a designation (globals.css .theme-ef, .theme-ef-<palette_key>). */
export const efThemeClass = (e: ExceptionalFew) => `theme-ef theme-ef-${e.paletteKey}`;
