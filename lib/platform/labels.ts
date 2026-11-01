// Words the desk prints for database states. No imports, so plain Node can test it.

export type Tone = "neutral" | "progress" | "good" | "attention" | "closed";

export const SUBMISSION_STATUS: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "With the house", tone: "progress" },
  in_review: { label: "In review", tone: "progress" },
  changes_requested: { label: "Your reply needed", tone: "attention" },
  approved: { label: "Approved", tone: "good" },
  partially_approved: { label: "Partly approved", tone: "good" },
  rejected: { label: "Not accepted", tone: "closed" },
  withdrawn: { label: "Withdrawn", tone: "closed" },
};

export const REQUEST_STATUS: Record<string, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "attention" },
  submitted: { label: "Answered · with the house", tone: "progress" },
  changes_requested: { label: "More needed", tone: "attention" },
  approved: { label: "Complete", tone: "good" },
  closed: { label: "Closed", tone: "closed" },
  cancelled: { label: "Cancelled", tone: "closed" },
};

export const REVISION_STATUS: Record<string, { label: string; tone: Tone }> = {
  proposed: { label: "Proposed", tone: "progress" },
  approved: { label: "Approved", tone: "good" },
  edited_approved: { label: "Edited + approved", tone: "good" },
  rejected: { label: "Not accepted", tone: "closed" },
  asked: { label: "Question from the house", tone: "attention" },
};

export const REQUEST_TYPE: Record<string, string> = { media: "Media", editorial: "Editorial", commercial: "Commercial" };
export const PUBLICATION: Record<string, { label: string; tone: Tone }> = {
  published: { label: "Published", tone: "good" },
  draft: { label: "Draft · not public", tone: "neutral" },
  retired: { label: "Retired", tone: "closed" },
};
export const PROVENANCE: Record<string, string> = {
  JW_VERIFIED: "Recorded & Vetted by the house",
  PARTNER_SUBMITTED: "Supplied by you, approved by the house",
  PUBLIC_SOURCE: "Drafted from your public website; awaiting your confirmation",
  SYSTEM_SYNC: "From the James Wild & Co Library",
};
export const ENTITY_TYPE: Record<string, string> = {
  property: "Property", lodge: "Lodge", camp: "Camp", residence: "Residence", villa: "Villa", reserve: "Reserve", vessel: "Vessel", experience: "Experience",
};
export const FIELD_LABEL: Record<string, string> = { name: "Name", category: "Category", country: "Country", region: "Region", timezone: "Time zone" };

export const niceDate = (d: string | null | undefined) =>
  d ? new Date(d.length === 10 ? `${d}T00:00:00Z` : d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—";

/** A JSON value from a revision, printed for people. */
export function showValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return v.join(", ") || "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
