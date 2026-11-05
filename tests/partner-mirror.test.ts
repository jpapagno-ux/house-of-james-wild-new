import { test } from "node:test";
import assert from "node:assert/strict";
import { describeMirror, mapSnapshot, push, removedIds, type Snapshot } from "../lib/platform/partner-mirror.ts";

const snap: Snapshot = {
  organizations: [{ id: "o1", name: "Leeu Collection", partner_code: "PAR-000004", type: "partner", status: "active", website: "leeucollection.com", general_email: "not an email", desk_users: 0, open_requests: 5, created_at: "2026-11-05T10:00:00Z", stays: "Leeu Estates (operator, primary)" }],
  contacts: [{ id: "c1", first_name: "", last_name: "", email: "reservations@leeucollection.com", partner: "Leeu Collection", roles: ["reservations", "trade_sales"], languages: [], newsletter: true }],
  requests: [{ id: "r1", reference: "REQ-1", type: "commercial", priority: "high", status: "open", due: "2026-12-01" }],
  submissions: [], rate_sheets: [{ id: "d1", title: "2027 rates", kind: "commercial", status: "active" }],
};

test("desk rows become Airtable rows keyed on Desk ID", () => {
  const m = mapSnapshot(snap, "2026-11-05T12:00:00Z");
  const o = m.organizations[0];
  assert.equal(o["Desk ID"], "o1");
  assert.equal(o.Website, "https://leeucollection.com");
  assert.equal(o["General email"], null, "a malformed email is left empty, not sent");
  assert.equal(o["On desk since"], "2026-11-05");
  assert.equal(o["Removed from desk"], false);
  const c = m.contacts[0];
  assert.equal(c.Name, "reservations@leeucollection.com", "no name falls back to the email");
  assert.equal(c.Roles, "Reservations, Trade sales");
  assert.equal(c.Languages, null);
  assert.equal(m.requests[0].Priority, "High");
  assert.equal(m.rate_sheets[0].Kind, "Rate sheet / commercial");
});

test("rows gone from the desk are marked, never deleted", () => {
  const m = mapSnapshot(snap, "x");
  assert.deepEqual(removedIds(["o1", "o9", ""], m.organizations), ["o9"]);
  assert.match(describeMirror({ Organizations: { upserted: 1, removed: 1 } }, []), /Organizations: 1, 1 marked removed/);
});

test("push upserts in tens, ticks removed rows, logs the run; dry writes nothing", async () => {
  const calls: { method: string; url: string; body?: { performUpsert?: unknown; records: { id?: string; fields: Record<string, unknown> }[] } }[] = [];
  const fake = (async (u: URL | string, init?: RequestInit) => {
    const url = String(u), method = init?.method ?? "GET";
    calls.push({ method, url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (method === "GET") return new Response(JSON.stringify({ records: url.includes("Organizations") ? [{ id: "recA", fields: { "Desk ID": "o-old" } }] : [] }));
    return new Response("{}");
  }) as typeof fetch;
  const many = { ...snap, contacts: Array.from({ length: 23 }, (_, i) => ({ id: `c${i}`, email: `x${i}@leeucollection.com` })) };
  const r = await push(many, { token: "t", base: "appX", now: "2026-11-05T12:00:00Z", fetch: fake });
  assert.ok(r.ok);
  const contactWrites = calls.filter((c) => c.method === "PATCH" && c.url.includes("Contacts"));
  assert.deepEqual(contactWrites.map((c) => c.body!.records.length), [10, 10, 3]);
  assert.deepEqual(contactWrites[0].body!.performUpsert, { fieldsToMergeOn: ["Desk ID"] });
  const tick = calls.find((c) => c.method === "PATCH" && c.url.includes("Organizations") && !c.body!.performUpsert);
  assert.deepEqual(tick!.body!.records, [{ id: "recA", fields: { "Removed from desk": true, "Last synced": "2026-11-05T12:00:00Z" } }]);
  assert.ok(calls.some((c) => c.method === "POST" && c.url.includes("Sync%20Log")));
  assert.ok(!calls.some((c) => c.method === "DELETE"));
  calls.length = 0;
  const d = await push(snap, { token: "t", base: "appX", now: "n", dry: true, fetch: fake });
  assert.equal(d.counts.Organizations.removed, 1);
  assert.ok(calls.every((c) => c.method === "GET"));
});
