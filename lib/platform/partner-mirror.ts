// Airtable copy of the Partner Desk (D-07). One way: the desk's snapshot (public.partner_mirror_snapshot)
// becomes rows in the "James Wild & Co · Partner Network" base, matched on "Desk ID". Rows that leave the
// desk are ticked "Removed from desk", never deleted. Pure mapping here; push() does the HTTP.

type Row = Record<string, unknown>;
export type Snapshot = { organizations: Row[]; contacts: Row[]; requests: Row[]; submissions: Row[]; rate_sheets: Row[] };
export type Fields = Record<string, string | number | boolean | null>;

const s = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const day = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null);
const list = (v: unknown) => (Array.isArray(v) && v.length ? v.map(String).map(label).join(", ") : null);
const n = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
const label = (v: string) => v.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const lbl = (v: unknown) => (s(v) ? label(String(v)) : null);
// Airtable refuses a malformed email or URL in typed fields; send those as empty rather than fail the run.
const email = (v: unknown) => (s(v) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim()) ? String(v).trim() : null);
const url = (v: unknown) => { const x = s(v); if (!x) return null; const u = /^https?:\/\//i.test(x) ? x : `https://${x}`; try { new URL(u); return u; } catch { return null; } };

export const TABLES = { organizations: "Organizations", contacts: "Contacts", requests: "Requests", submissions: "Submissions", rate_sheets: "Rate sheets" } as const;

export function mapSnapshot(snap: Snapshot, now: string): Record<keyof typeof TABLES, Fields[]> {
  const base = (id: unknown): Fields => ({ "Desk ID": String(id), "Last synced": now, "Removed from desk": false });
  return {
    organizations: (snap.organizations ?? []).map((o) => ({
      Name: s(o.name), "Partner Code": s(o.partner_code), Type: lbl(o.type), Status: lbl(o.status), Website: url(o.website),
      "General email": email(o.general_email), Phone: s(o.phone), "HQ country": s(o.hq_country), Address: s(o.address),
      "Preferred communication": lbl(o.preferred_communication), Stays: s(o.stays), "Desk users": n(o.desk_users),
      "Open requests": n(o.open_requests), "On desk since": day(o.created_at), ...base(o.id),
    })),
    contacts: (snap.contacts ?? []).map((c) => ({
      Name: [s(c.first_name), s(c.last_name)].filter(Boolean).join(" ") || s(c.email), Partner: s(c.partner), "Partner Code": s(c.partner_code),
      Title: s(c.title), Roles: list(c.roles), Email: email(c.email), Mobile: s(c.mobile), WhatsApp: s(c.whatsapp),
      Country: s(c.country), Timezone: s(c.timezone), Languages: list(c.languages), Stays: s(c.stays),
      "Preferred communication": lbl(c.preferred_communication), Newsletter: c.newsletter === true, "Trade opt-in": c.trade === true,
      Status: lbl(c.status), "Last verified": day(c.last_verified_at), ...base(c.id),
    })),
    requests: (snap.requests ?? []).map((r) => ({
      Reference: s(r.reference), Partner: s(r.partner), Stay: s(r.stay), Type: lbl(r.type), "Requested item": s(r.item),
      Instructions: s(r.instructions), Priority: lbl(r.priority), Due: day(r.due), Status: lbl(r.status), Created: day(r.created_at), ...base(r.id),
    })),
    submissions: (snap.submissions ?? []).map((x) => ({
      Reference: s(x.reference), Partner: s(x.partner), Stay: s(x.stay), Kind: lbl(x.kind), Title: s(x.title), "Partner note": s(x.partner_note),
      Changes: n(x.changes), Status: lbl(x.status), Submitted: day(x.submitted_at), Decided: day(x.decided_at), "House note": s(x.jw_note), ...base(x.id),
    })),
    rate_sheets: (snap.rate_sheets ?? []).map((d) => ({
      Title: s(d.title), Partner: s(d.partner), Stay: s(d.stay), Kind: d.kind === "commercial" ? "Rate sheet / commercial" : lbl(d.kind),
      "Valid from": day(d.effective_from), Expires: day(d.expires_on), Status: lbl(d.status), Uploaded: day(d.created_at), ...base(d.id),
    })),
  };
}

/** Desk IDs already in Airtable that the desk no longer has: tick them, never delete. */
export const removedIds = (inAirtable: string[], onDesk: Fields[]) => {
  const keep = new Set(onDesk.map((f) => String(f["Desk ID"])));
  return inAirtable.filter((id) => id && !keep.has(id));
};

export function describeMirror(counts: Record<string, { upserted: number; removed: number }>, errors: string[]): string {
  const parts = Object.entries(counts).map(([t, c]) => `${t}: ${c.upserted}${c.removed ? `, ${c.removed} marked removed` : ""}`);
  return [parts.join(" · ") || "Nothing to copy.", ...errors.map((e) => `ERROR ${e}`)].join("\n");
}

// ===== HTTP (Airtable REST). Upsert in batches of 10 (Airtable's limit), merge on "Desk ID".
type Fetch = typeof fetch;
const api = (base: string, table: string) => `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;

async function existingIds(f: Fetch, token: string, base: string, table: string): Promise<{ id: string; desk: string; removed: boolean }[]> {
  const out: { id: string; desk: string; removed: boolean }[] = [];
  let offset: string | undefined;
  do {
    const u = new URL(api(base, table)); u.searchParams.append("fields[]", "Desk ID"); u.searchParams.append("fields[]", "Removed from desk"); u.searchParams.set("pageSize", "100");
    if (offset) u.searchParams.set("offset", offset);
    const res = await f(u, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`${table}: read ${res.status}`);
    const j = (await res.json()) as { records: { id: string; fields: Record<string, unknown> }[]; offset?: string };
    for (const r of j.records) out.push({ id: r.id, desk: String(r.fields["Desk ID"] ?? ""), removed: r.fields["Removed from desk"] === true });
    offset = j.offset;
  } while (offset);
  return out;
}

async function send(f: Fetch, token: string, base: string, table: string, body: unknown) {
  const res = await f(api(base, table), { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`${table}: write ${res.status} ${(await res.text()).slice(0, 200)}`);
}

export async function push(snap: Snapshot, opts: { token: string; base: string; now: string; dry?: boolean; fetch?: Fetch }) {
  const f = opts.fetch ?? fetch;
  const mapped = mapSnapshot(snap, opts.now);
  const counts: Record<string, { upserted: number; removed: number }> = {}, errors: string[] = [];
  for (const key of Object.keys(TABLES) as (keyof typeof TABLES)[]) {
    const table = TABLES[key], rows = mapped[key];
    try {
      const have = await existingIds(f, opts.token, opts.base, table);
      const gone = new Set(removedIds(have.map((h) => h.desk), rows));
      const toTick = have.filter((h) => gone.has(h.desk) && !h.removed);
      counts[table] = { upserted: rows.length, removed: toTick.length };
      if (opts.dry) continue;
      for (let i = 0; i < rows.length; i += 10)
        await send(f, opts.token, opts.base, table, { performUpsert: { fieldsToMergeOn: ["Desk ID"] }, records: rows.slice(i, i + 10).map((fields) => ({ fields })) });
      for (let i = 0; i < toTick.length; i += 10)
        await send(f, opts.token, opts.base, table, { records: toTick.slice(i, i + 10).map((h) => ({ id: h.id, fields: { "Removed from desk": true, "Last synced": opts.now } })) });
    } catch (e) { errors.push(e instanceof Error ? e.message : String(e)); }
  }
  const details = describeMirror(counts, errors);
  if (!opts.dry) {
    await f(api(opts.base, "Sync Log"), { method: "POST", headers: { Authorization: `Bearer ${opts.token}`, "content-type": "application/json" },
      body: JSON.stringify({ records: [{ fields: { Run: `desk-mirror-${opts.now.slice(0, 16).replace(/[:T]/g, "-")}`, When: opts.now, Result: errors.length ? "Errors" : "OK", Details: details } }] }),
      signal: AbortSignal.timeout(20_000) }).catch(() => {});
  }
  return { ok: !errors.length, counts, errors, details };
}
