import type { Enquiry } from "./enquiry";

// The enquiry record (James, 1 Nov 2026, spec "Advisor Desk & Traveller
// Account"): one Airtable row per enquiry, written before the email goes
// out, read by the Advisor Desk. Base "James Wild & Co — Enquiries".
//
// Env (server-only, Vercel → Settings → Environment Variables):
//   AIRTABLE_ENQUIRIES_TOKEN     PAT scoped to the Enquiries base, data.records:read+write
//   AIRTABLE_ENQUIRIES_BASE_ID   appgI5wnnmaA9gVlf
// Without them the record step is skipped and the email still sends, so a
// missing token never loses an enquiry.
//
// Pure helpers (no imports, no network) sit above the fetch calls so plain
// Node can test them.

export const ENQUIRIES_TABLE = "Enquiries";
export const ADVISORS_TABLE = "Advisors";

// Field IDs from the base — stable across renames.
export const F = {
  enquiryId: "fldwPzONh6aEywXTE", received: "fldm9rmrKmGzjTetu", traveller: "fldj3csR76d4oZIHu", email: "fldyR9dBaPK5pyNPz", phone: "fldoaUYpF5pPlRyxE",
  replyBy: "fldwZzhHnooULLMjx", callTime: "fldvDIRHyqBcfD3mV", source: "fldQWbdo3yw1PrBJg", where: "fldU65paygT9PVFjz", when: "flddCUBMDKkyz36r4", nights: "fld4QmPsuit6dBEpp",
  adults: "fldxiDM9C1GPTMS5n", children: "fld4nVjnvwoSempVE", budget: "fldVUYq3qMXz2QIe7", interests: "fldDtDqNtqAjlYiQC", message: "fldG4BkF5A54eqJTW",
  folio: "fld5lQJIDc4an3eLb", destination: "fldgU8nxGz9Uu6PcG", route: "fldPWTlqRnLmLZgNk", askedAbout: "fldavDhRLQaepRkrV", notes: "fldOA2Tuf8pa9CKQA",
  trip: "fldUxHKkA129y8CfP", option: "flduPHGX1UebgkgzX", addons: "fldoVnxUS1RyEJCv0", estimate: "fld7KUBeu8SoZX086", ownAdvisor: "fldXVZoElKN8GWmMR", travelNotes: "fldGryRRioPgyR347",
  status: "fldGhfOsNzlA7vgYu", statusChanged: "fldOxVsqNc4HXiHQU", deliveredTo: "fld3XdN2kODO7hvoy", delivery: "flddt5eTH7TzBSTTb", advisor: "fldxmY7K38ayHPa7m",
} as const;

export const ADV = { slug: "fldAnncyuEeZIER6O", inbox: "fldseFJXckteSyIDp", active: "fld7y9ESbXf4tPSk2", standIn: "flddlsEmhYHa1ivyT" } as const;

/** ENQ-YYYY-NNNNNN. The sequence comes from the caller (count of rows this year + 1). */
export function enquiryId(year: number, seq: number): string {
  return `ENQ-${year}-${String(Math.max(1, Math.floor(seq))).padStart(6, "0")}`;
}

const SOURCES = new Set(["page", "iggi", "compass", "price-builder", "crux", "advisor-application", "partner"]);

/** The Airtable `fields` object for an enquiry. `advisorRecordId` links the Advisors row when known. */
export function recordFields(e: Enquiry, id: string, receivedIso: string, advisorRecordId: string | null, delivery: { to: string; cc: string[] } | null, deliveryState: "sent" | "preview" | "failed"): Record<string, unknown> {
  const c = e.context ?? {};
  const f: Record<string, unknown> = {
    [F.enquiryId]: id, [F.received]: receivedIso, [F.traveller]: e.name, [F.email]: e.email,
    [F.replyBy]: e.contact === "email" ? "Email" : e.contact === "phone" ? "Phone call" : "Video call",
    [F.source]: c.from && SOURCES.has(c.from) ? c.from : "page",
    [F.adults]: e.adults, [F.children]: e.children ?? 0,
    [F.interests]: e.interests ?? [], [F.travelNotes]: !!e.travelNotes,
    [F.status]: "New", [F.statusChanged]: receivedIso,
    [F.delivery]: deliveryState,
  };
  const put = (k: string, v: string | undefined | null, n = 1000) => { if (v && v.trim()) f[k] = v.trim().slice(0, n); };
  put(F.phone, e.phone); put(F.callTime, e.callTime); put(F.where, e.where); put(F.when, e.when); put(F.nights, e.nights); put(F.budget, e.budget);
  put(F.message, e.message, 10000); put(F.folio, c.folio); put(F.destination, c.destination?.replace(/-/g, " ")); put(F.route, c.route); put(F.askedAbout, c.q);
  put(F.notes, c.notes, 2000); put(F.trip, c.trip); put(F.option, c.option); put(F.addons, c.addons);
  if (c.estimate && Number(c.estimate) > 0) f[F.estimate] = Number(c.estimate);
  if (e.hasAdvisor) put(F.ownAdvisor, e.advisorDetails);
  if (delivery) f[F.deliveredTo] = [delivery.to, ...delivery.cc].join(", ");
  if (advisorRecordId) f[F.advisor] = [advisorRecordId];
  return f;
}

// ── Network ──────────────────────────────────────────────────────────────────

type Cfg = { token: string; baseId: string };
export function config(env: NodeJS.ProcessEnv = process.env): Cfg | null {
  const token = env.AIRTABLE_ENQUIRIES_TOKEN, baseId = env.AIRTABLE_ENQUIRIES_BASE_ID;
  return token && baseId ? { token, baseId } : null;
}

const api = (cfg: Cfg, path: string, init?: RequestInit) =>
  fetch(`https://api.airtable.com/v0/${cfg.baseId}/${path}`, { ...init, headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) } });

export type AdvisorRow = { recordId: string; slug: string; inbox: string | null; active: boolean; standIn: boolean };

let advisorsCache: { at: number; rows: AdvisorRow[] } | null = null;
/** Active advisors with their private inbox. Cached 5 minutes per server instance. */
export async function advisorRows(cfg: Cfg): Promise<AdvisorRow[]> {
  if (advisorsCache && Date.now() - advisorsCache.at < 5 * 60_000) return advisorsCache.rows;
  const q = new URLSearchParams({ returnFieldsByFieldId: "1", pageSize: "100" });
  for (const id of [ADV.slug, ADV.inbox, ADV.active, ADV.standIn]) q.append("fields[]", id);
  const r = await api(cfg, `${encodeURIComponent(ADVISORS_TABLE)}?${q}`);
  if (!r.ok) throw new Error(`advisors ${r.status}`);
  const j = (await r.json()) as { records: { id: string; fields: Record<string, unknown> }[] };
  const rows = j.records.map((rec) => ({ recordId: rec.id, slug: String(rec.fields[ADV.slug] ?? ""), inbox: typeof rec.fields[ADV.inbox] === "string" ? (rec.fields[ADV.inbox] as string).toLowerCase() : null, active: rec.fields[ADV.active] === true, standIn: rec.fields[ADV.standIn] === true })).filter((a) => a.slug);
  advisorsCache = { at: Date.now(), rows };
  return rows;
}

/** slug → inbox, for deliveryFor(): active, non-stand-in advisors with an address. */
export const inboxMap = (rows: AdvisorRow[]): Record<string, string> =>
  Object.fromEntries(rows.filter((a) => a.active && !a.standIn && a.inbox).map((a) => [a.slug, a.inbox as string]));

/** Next sequence number this year: rows whose ID starts with ENQ-YYYY, plus one. */
export async function nextSeq(cfg: Cfg, year: number): Promise<number> {
  const q = new URLSearchParams({ filterByFormula: `LEFT({Enquiry ID}, 9) = "ENQ-${year}"`, pageSize: "1", "sort[0][field]": "Enquiry ID", "sort[0][direction]": "desc", returnFieldsByFieldId: "1" });
  q.append("fields[]", F.enquiryId);
  const r = await api(cfg, `${encodeURIComponent(ENQUIRIES_TABLE)}?${q}`);
  if (!r.ok) throw new Error(`seq ${r.status}`);
  const j = (await r.json()) as { records: { fields: Record<string, unknown> }[] };
  const last = j.records[0]?.fields[F.enquiryId];
  const n = typeof last === "string" ? Number(last.slice(-6)) : 0;
  return (Number.isFinite(n) ? n : 0) + 1;
}

export async function createRecord(cfg: Cfg, fields: Record<string, unknown>): Promise<string> {
  const r = await api(cfg, encodeURIComponent(ENQUIRIES_TABLE), { method: "POST", body: JSON.stringify({ records: [{ fields }], typecast: true }) });
  if (!r.ok) throw new Error(`create ${r.status} ${await r.text().catch(() => "")}`);
  const j = (await r.json()) as { records: { id: string }[] };
  return j.records[0].id;
}

export async function patchDelivery(cfg: Cfg, recordId: string, state: "sent" | "preview" | "failed"): Promise<void> {
  await api(cfg, `${encodeURIComponent(ENQUIRIES_TABLE)}/${recordId}`, { method: "PATCH", body: JSON.stringify({ fields: { [F.delivery]: state }, typecast: true }) }).catch(() => undefined);
}
