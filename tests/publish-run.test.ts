import { test } from "node:test";
import assert from "node:assert/strict";
import { batchName, buildBatch, checkBatch, type PendingRow } from "../lib/platform/publish-run.ts";

const ubud: PendingRow = {
  property_id: "11111111-2222-3333-4444-555555555555", ledger_id: "STY-2026-000130", name: "Kayumanis Ubud Private Villas & Spa",
  content: { best_months: "April to October, the dry season", inclusions: ["Daily breakfast", " Private airport transfer "], overview: null, nearest_airport: "Ngurah Rai International Airport (DPS)", features: [] },
  fields: ["best_months", "inclusions"], revision_ids: ["aaaaaaaa-2222-3333-4444-555555555555", "not-a-uuid"], last_decided: "2026-11-03T20:00:00Z",
};

test("approved content becomes Library fields; editorial copy is never touched", () => {
  const b = buildBatch([ubud, { ...ubud, ledger_id: null, name: "No ledger" }], "James Papagno", "desk-2026-11-04-09-30", "2026-11-04");
  assert.equal(b.records.length, 1);
  const r = b.records[0];
  assert.equal(r.set.best_months, "April to October, the dry season");
  assert.equal(r.set.airport_name, undefined, "only fields approved in this run go to native Library fields");
  assert.deepEqual((r.set.partner_facts as { inclusions: string[] }).inclusions, ["Daily breakfast", "Private airport transfer"]);
  assert.equal((r.set.partner_facts as Record<string, unknown>).features, undefined, "empty lists are left out");
  assert.deepEqual(r.revision_ids, ["aaaaaaaa-2222-3333-4444-555555555555"]);
  assert.deepEqual(b.skipped, [{ name: "No ledger", why: "no Ledger ID" }]);
  assert.deepEqual(checkBatch(b), []);
});

test("the check refuses anything outside the four fields, long dashes and bad ids", () => {
  const b = buildBatch([ubud], "James", "desk-2026-11-04-09-30", "2026-11-04");
  const bad = structuredClone(b) as unknown as { records: { ledger_id: string; set: Record<string, unknown>; revision_ids: string[] }[]; batch: string };
  bad.records[0].set.tagline = "New tagline";
  bad.records[0].set.best_months = "May — October";
  bad.records[0].ledger_id = "kayumanis";
  bad.batch = "Bad Name!";
  const errs = checkBatch(bad);
  assert.ok(errs.some((e) => /tagline is not allowed/.test(e)));
  assert.ok(errs.some((e) => /long dash/.test(e)));
  assert.ok(errs.some((e) => /ledger_id/.test(e)));
  assert.ok(errs.includes("batch name"));
  assert.equal(batchName(new Date("2026-11-04T09:30:12Z")), "desk-2026-11-04-09-30");
});
