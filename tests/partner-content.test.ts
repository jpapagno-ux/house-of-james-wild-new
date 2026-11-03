import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTENT_FIELDS, normaliseValue, parseContentChanges, toList } from "../lib/platform/content.ts";

const P = "11111111-2222-3333-4444-555555555555";

test("lists: one per line, bullets stripped, blanks dropped", () => {
  assert.deepEqual(toList("- Pool\n\n• Butler\r\n  Spa  "), ["Pool", "Butler", "Spa"]);
  assert.equal(normaliseValue("features", "").ok, false);
  assert.equal(normaliseValue("features", Array.from({ length: 31 }, (_, i) => `f${i}`)).ok, false);
});

test("text: lengths, one-line fields, no long dashes", () => {
  assert.equal(normaliseValue("best_months", "May to October\nand December").ok, false);
  assert.equal(normaliseValue("overview", "x".repeat(2001)).ok, false);
  assert.equal(normaliseValue("overview", "Twelve suites — on the river").ok, false);
  const ok = normaliseValue("best_months", "  May to October, when the bush is dry  ");
  assert.deepEqual(ok, { ok: true, value: "May to October, when the bush is dry" });
});

test("changes: whitelist only, at least one", () => {
  assert.equal(parseContentChanges({ propertyId: P, changes: {} }).ok, false);
  assert.equal(parseContentChanges({ propertyId: P, changes: { tagline: "x" } }).ok, false);
  assert.equal(parseContentChanges({ propertyId: "nope", changes: { overview: "x" } }).ok, false);
  const r = parseContentChanges({ propertyId: P, changes: { inclusions: "All meals\nGame drives", best_months: "May to October" }, note: "New season" });
  assert.equal(r.ok && r.value.changes.length, 2);
  assert.deepEqual(r.ok && r.value.changes[0].value, ["All meals", "Game drives"]);
});

test("partners never get editorial fields", () => {
  for (const k of ["tagline", "quote", "why", "founderNote", "pathway", "faqs"]) assert.ok(!CONTENT_FIELDS.some((f) => f.key === k));
});
