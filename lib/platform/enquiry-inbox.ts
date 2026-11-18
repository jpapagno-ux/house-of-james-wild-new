// The enquiry inbox (James, 18 Nov 2026): every enquiry from /plan and Iggi is written to the Enquiries
// table in Airtable before its email goes out (lib/enquiry-record.ts). The Advisor Desk reads an advisor's
// own enquiries at /advisor/inbox and sets their status; the house reads them all at /desk/enquiries and
// can reassign one. Same statuses, closed reasons and two-day flag as the Advisor Desk spec of 1 Nov 2026.
//
// Never shown here: commission, net rates or partner terms (none are in the table).
// Pure helpers only (no imports, no network) so plain Node can test them. The fetch is in
// enquiry-inbox-data.ts.

export const ENQ_STATUSES = ["New", "Replied", "Planning", "Quoted", "Booked", "Closed"] as const;
export const OPEN_STATUSES: readonly string[] = ["New", "Replied", "Planning", "Quoted"];
export const CLOSED_REASONS = ["No reply", "Not a fit", "Went elsewhere", "Duplicate"] as const;
export const UNANSWERED_DAYS = 2;
export type EnquiryStatus = (typeof ENQ_STATUSES)[number];

// Field IDs in the Enquiries table: stable across renames (the same IDs as lib/enquiry-record.ts, plus
// the two the Desk writes: Closed reason and Advisor note).
export const EQ = {
  enquiryId: "fldwPzONh6aEywXTE", received: "fldm9rmrKmGzjTetu", traveller: "fldj3csR76d4oZIHu", email: "fldyR9dBaPK5pyNPz", phone: "fldoaUYpF5pPlRyxE",
  replyBy: "fldwZzhHnooULLMjx", callTime: "fldvDIRHyqBcfD3mV", source: "fldQWbdo3yw1PrBJg", where: "fldU65paygT9PVFjz", when: "flddCUBMDKkyz36r4", nights: "fld4QmPsuit6dBEpp",
  adults: "fldxiDM9C1GPTMS5n", children: "fld4nVjnvwoSempVE", budget: "fldVUYq3qMXz2QIe7", interests: "fldDtDqNtqAjlYiQC", message: "fldG4BkF5A54eqJTW",
  folio: "fld5lQJIDc4an3eLb", destination: "fldgU8nxGz9Uu6PcG", route: "fldPWTlqRnLmLZgNk", askedAbout: "fldavDhRLQaepRkrV", iggiLearned: "fldOA2Tuf8pa9CKQA",
  trip: "fldUxHKkA129y8CfP", option: "flduPHGX1UebgkgzX", addons: "fldoVnxUS1RyEJCv0", estimate: "fld7KUBeu8SoZX086", ownAdvisor: "fldXVZoElKN8GWmMR",
  status: "fldGhfOsNzlA7vgYu", closedReason: "fld9nzjxxT7s5L5IN", statusChanged: "fldOxVsqNc4HXiHQU", advisorNote: "fldYoFiS750Bi3C4e", advisor: "fldxmY7K38ayHPa7m",
} as const;

export type Enquiry = {
  recordId: string; enquiryId: string; received: string; traveller: string; email: string; phone: string; replyBy: string; callTime: string;
  source: string; where: string; when: string; nights: string; adults: number | null; children: number | null; budget: string; interests: string[];
  message: string; folio: string; destination: string; route: string; askedAbout: string; iggiLearned: string; trip: string; option: string; addons: string;
  estimate: number | null; ownAdvisor: string; status: EnquiryStatus; closedReason: string; statusChanged: string; advisorNote: string;
  /** Record IDs of the linked rows in the Advisors table. */
  advisorIds: string[];
  daysWaiting: number; unanswered: boolean;
};

const RECORD_ID = /^rec[A-Za-z0-9]{14}$/;
export const isRecordId = (v: unknown): v is string => typeof v === "string" && RECORD_ID.test(v);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Whole days from an ISO time to now; 0 for a blank, bad or future time. */
export function daysSince(iso: string, now: Date): number {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(t) ? 0 : Math.max(0, Math.floor((now.getTime() - t) / 86_400_000));
}

/** One Airtable record (fields keyed by field ID) -> an Enquiry. createdTime stands in for a blank Received. */
export function toEnquiry(rec: { id: string; createdTime?: string; fields: Record<string, unknown> }, now: Date): Enquiry {
  const f = rec.fields;
  const received = str(f[EQ.received]) || str(rec.createdTime);
  const raw = str(f[EQ.status]);
  const status = (ENQ_STATUSES as readonly string[]).includes(raw) ? (raw as EnquiryStatus) : "New";
  const daysWaiting = daysSince(received, now);
  return {
    recordId: rec.id, enquiryId: str(f[EQ.enquiryId]), received, traveller: str(f[EQ.traveller]), email: str(f[EQ.email]), phone: str(f[EQ.phone]),
    replyBy: str(f[EQ.replyBy]), callTime: str(f[EQ.callTime]), source: str(f[EQ.source]), where: str(f[EQ.where]) || str(f[EQ.destination]), when: str(f[EQ.when]),
    nights: str(f[EQ.nights]), adults: num(f[EQ.adults]), children: num(f[EQ.children]), budget: str(f[EQ.budget]),
    interests: Array.isArray(f[EQ.interests]) ? (f[EQ.interests] as unknown[]).filter((x): x is string => typeof x === "string") : [],
    message: str(f[EQ.message]), folio: str(f[EQ.folio]), destination: str(f[EQ.destination]), route: str(f[EQ.route]), askedAbout: str(f[EQ.askedAbout]),
    iggiLearned: str(f[EQ.iggiLearned]), trip: str(f[EQ.trip]), option: str(f[EQ.option]), addons: str(f[EQ.addons]), estimate: num(f[EQ.estimate]),
    ownAdvisor: str(f[EQ.ownAdvisor]), status, closedReason: str(f[EQ.closedReason]), statusChanged: str(f[EQ.statusChanged]), advisorNote: str(f[EQ.advisorNote]),
    advisorIds: Array.isArray(f[EQ.advisor]) ? (f[EQ.advisor] as unknown[]).filter(isRecordId) : [],
    daysWaiting, unanswered: status === "New" && daysWaiting > UNANSWERED_DAYS,
  };
}

/** An advisor sees an enquiry only when it is addressed to their row in the Advisors table. */
export const canSee = (e: Pick<Enquiry, "advisorIds">, advisorRecordId: string | null) => !!advisorRecordId && e.advisorIds.includes(advisorRecordId);

/** Counts for the top of an inbox. */
export function inboxCounts(list: Enquiry[]) {
  return { new: list.filter((e) => e.status === "New").length, open: list.filter((e) => OPEN_STATUSES.includes(e.status)).length, unanswered: list.filter((e) => e.unanswered).length };
}

/** Unanswered first, then newest. */
export const inboxOrder = (list: Enquiry[]) => [...list].sort((a, b) => Number(b.unanswered) - Number(a.unanswered) || b.received.localeCompare(a.received));

/** The Airtable formula that keeps the enquiries linked to one advisor, matched by the Advisors row's slug (its primary field). */
export function advisorFormula(slug: string): string | null {
  return /^[a-z0-9-]{2,80}$/.test(slug) ? `FIND("|${slug}|", "|" & ARRAYJOIN({Advisor}, "|") & "|")` : null;
}

export type StatusChange = { status: EnquiryStatus; closedReason: string | null; note: string | null };
type Parsed<T> = { ok: true; value: T } | { ok: false; field: string; message: string };

/** PATCH body { status, closedReason?, note? }. A Closed enquiry needs a reason; any other status clears it. note undefined = leave as is. */
export function parseStatusChange(body: unknown): Parsed<StatusChange> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { ok: false, field: "status", message: "Choose a status" };
  const b = body as Record<string, unknown>;
  const extra = Object.keys(b).find((k) => !["status", "closedReason", "note"].includes(k));
  if (extra) return { ok: false, field: extra, message: `Unexpected field: ${extra}` };
  if (typeof b.status !== "string" || !(ENQ_STATUSES as readonly string[]).includes(b.status)) return { ok: false, field: "status", message: "Choose a status" };
  const status = b.status as EnquiryStatus;
  let closedReason: string | null = null;
  if (status === "Closed") {
    if (typeof b.closedReason !== "string" || !(CLOSED_REASONS as readonly string[]).includes(b.closedReason)) return { ok: false, field: "closedReason", message: "Choose why it is closed" };
    closedReason = b.closedReason;
  }
  if (b.note !== undefined && typeof b.note !== "string") return { ok: false, field: "note", message: "The note must be text" };
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 2000) : null;
  return { ok: true, value: { status, closedReason, note } };
}

/** The Airtable fields for a status change. */
export function statusFields(c: StatusChange, nowIso: string): Record<string, unknown> {
  return { [EQ.status]: c.status, [EQ.closedReason]: c.closedReason, [EQ.statusChanged]: nowIso, ...(c.note !== null ? { [EQ.advisorNote]: c.note } : {}) };
}

/** "anthony-papagno" -> "Anthony Papagno", for the house's advisor column. */
export const slugName = (slug: string) => slug.split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
