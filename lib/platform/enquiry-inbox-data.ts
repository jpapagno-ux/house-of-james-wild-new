import { advisorRows, config, ENQUIRIES_TABLE, type AdvisorRow } from "@/lib/enquiry-record";
import { EQ, advisorFormula, isRecordId, toEnquiry, type Enquiry } from "./enquiry-inbox";

// The fetches for the enquiry inbox: the Enquiries base, with the token the enquiry record already uses
// (AIRTABLE_ENQUIRIES_TOKEN / AIRTABLE_ENQUIRIES_BASE_ID, server only). Never cached: the desk pages are dynamic.

export type InboxResult = { ok: true; enquiries: Enquiry[]; advisors: AdvisorRow[] } | { ok: false; reason: "not-configured" | "unavailable" };

const call = (path: string, init?: RequestInit) => {
  const cfg = config();
  if (!cfg) return null;
  return fetch(`https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(ENQUIRIES_TABLE)}${path}`, { ...init, cache: "no-store", headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) } });
};

async function advisors(): Promise<AdvisorRow[]> {
  const cfg = config();
  if (!cfg) return [];
  try { return await advisorRows(cfg); } catch { return []; }
}

/** The advisor's row in the Airtable Advisors table, matched by slug; null when they have none. */
export async function advisorRecordId(slug: string): Promise<string | null> {
  return (await advisors()).find((a) => a.slug === slug)?.recordId ?? null;
}

/** Enquiries, newest first: one advisor's (by slug) or, with slug null, every one (the house). At most 500. */
export async function loadInbox(slug: string | null): Promise<InboxResult> {
  if (!config()) return { ok: false, reason: "not-configured" };
  const formula = slug === null ? null : advisorFormula(slug);
  if (slug !== null && !formula) return { ok: true, enquiries: [], advisors: [] };
  try {
    const now = new Date(), out: Enquiry[] = [];
    let offset: string | undefined;
    do {
      const q = new URLSearchParams({ returnFieldsByFieldId: "1", pageSize: "100", "sort[0][field]": "Received", "sort[0][direction]": "desc" });
      if (formula) q.set("filterByFormula", formula);
      for (const id of [EQ.enquiryId, EQ.received, EQ.traveller, EQ.where, EQ.destination, EQ.when, EQ.source, EQ.status, EQ.closedReason, EQ.advisor, EQ.folio]) q.append("fields[]", id);
      if (offset) q.set("offset", offset);
      const r = await call(`?${q}`);
      if (!r || !r.ok) return { ok: false, reason: "unavailable" };
      const j = (await r.json()) as { records: { id: string; createdTime: string; fields: Record<string, unknown> }[]; offset?: string };
      for (const rec of j.records) out.push(toEnquiry(rec, now));
      offset = j.offset;
    } while (offset && out.length < 500);
    return { ok: true, enquiries: out, advisors: await advisors() };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

/** One enquiry in full; null when it does not exist or Airtable does not answer. */
export async function loadEnquiry(recordId: string): Promise<Enquiry | null> {
  if (!isRecordId(recordId)) return null;
  try {
    const r = await call(`/${recordId}?returnFieldsByFieldId=1`);
    if (!r || !r.ok) return null;
    return toEnquiry((await r.json()) as { id: string; createdTime: string; fields: Record<string, unknown> }, new Date());
  } catch { return null; }
}

/** Writes fields (keyed by field ID) to one enquiry. True when Airtable accepted it. */
export async function patchEnquiry(recordId: string, fields: Record<string, unknown>): Promise<boolean> {
  if (!isRecordId(recordId)) return false;
  try {
    const r = await call(`/${recordId}`, { method: "PATCH", body: JSON.stringify({ fields, typecast: true }) });
    return !!r && r.ok;
  } catch { return false; }
}

/** Active, real advisors an enquiry can be reassigned to. */
export async function assignableAdvisors(): Promise<AdvisorRow[]> {
  return (await advisors()).filter((a) => a.active && !a.standIn);
}
