import { test } from "node:test";
import assert from "node:assert/strict";
import { filterRows, parseQuery, queryHref, rateLine, sortRows, type LedgerRow } from "../lib/platform/advisor-ledger.ts";

const row = (o: Partial<LedgerRow>): LedgerRow => ({ slug: "x", name: "X", ledgerId: "STY-2026-000001", country: "Kenya", countrySlug: "kenya", regionSlug: "africa", category: "lodge", volumes: ["safaris"], pathways: [{ id: "PATH-04", name: "Where the Wild Lives" }], hero: null, href: null, tagline: null, bestMonths: null, rate: { kind: "request", fromUsd: null, basis: null, estimated: false }, offers: [], founder: null, mine: null, ...o });

test("parseQuery keeps only safe values", () => {
  const q = parseQuery({ q: "  Mara ", volume: "safaris", country: "Kenya!", pathway: "PATH-99", offers: "1", page: "-3" });
  assert.equal(q.q, "Mara");
  assert.equal(q.volume, "safaris");
  assert.equal(q.country, "", "not a slug");
  assert.equal(q.pathway, "");
  assert.equal(q.offers, true);
  assert.equal(q.page, 1);
});

test("filters: search ignores accents; offers, priced and mine", () => {
  const rows = [row({ slug: "a", name: "Tabacón", country: "Costa Rica", countrySlug: "costa-rica", regionSlug: "central-america" }), row({ slug: "b", name: "Governors' Camp", offers: [{ headline: "4 for 3", travel: "", program: "Worth Another Night", ends: "2026-12-15", conditions: null }] }), row({ slug: "c", name: "Ivory", rate: { kind: "card", fromUsd: 2100, basis: "per person per night sharing", estimated: true }, mine: "Stayed" })];
  const base = parseQuery({});
  assert.deepEqual(filterRows(rows, { ...base, q: "tabacon" }).map((r) => r.slug), ["a"]);
  assert.deepEqual(filterRows(rows, { ...base, offers: true }).map((r) => r.slug), ["b"]);
  assert.deepEqual(filterRows(rows, { ...base, priced: true }).map((r) => r.slug), ["c"]);
  assert.deepEqual(filterRows(rows, { ...base, mine: true }).map((r) => r.slug), ["c"]);
  assert.deepEqual(sortRows(rows).map((r) => r.slug), ["c", "b", "a"], "mine first, then offers");
});

test("rate words and links", () => {
  assert.equal(rateLine({ kind: "card", fromUsd: 2100.4, basis: "per person per night sharing", estimated: true }), "From US$2,100 per person per night sharing (to be confirmed)");
  assert.match(rateLine({ kind: "request", fromUsd: null, basis: null, estimated: false }), /on request/);
  assert.equal(queryHref(parseQuery({ q: "mara", offers: "1", page: "3" }), { page: 2 }), "/advisor/ledger?q=mara&offers=1&page=2");
});
