// "Find your voyage" (James, 2 Nov 2026): the matching rules behind the search on /voyages.
import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY, departureMonths, fromQuery, groupMonths, leftOut, matches, pageLinks, search, suggest, toQuery, type SearchItem } from "../lib/content/ships/search-match.ts";

const base: SearchItem = { slug: "a", name: "Alpha", href: "/voyages/ships/a", eyebrow: "Yacht · Op", operator: "Op", image: null, price: null, low: 6000, where: ["galapagos"], months: ["2027-03"], nights: [7], traits: { minChildAge: 8, single: { kind: "percent", pct: 50 }, activities: ["wildlife", "snorkelling"] }, couples: true, charter: false, ports: ["San Cristobal"], routes: [{ name: "Beaches and Bays", href: "/x" }], page: true };
const b: SearchItem = { ...base, slug: "b", name: "Bravo", operator: "Other", where: ["nile"], months: ["2027-01"], nights: [4], low: null, traits: { single: { kind: "none" }, activities: ["culture"] }, couples: false, charter: true, ports: ["Luxor", "Aswan"], routes: [] };
const c: SearchItem = { ...base, slug: "c", name: "Charlie", where: ["indonesia"], months: [], nights: [9], low: 3400, traits: { minChildAge: 0, activities: ["diving", "sailing"], dives: true }, couples: false };
const all = [base, b, c];

test("months: a dated sailing gives its month, a band every month it spans; past and sold out give none", () => {
  const on = "2026-11-02";
  assert.deepEqual(departureMonths([{ date: "2027-03-14" }], on), ["2027-03"]);
  assert.deepEqual(departureMonths([{ date: "2026-10-01", dateTo: "2027-01-31" }], on), ["2026-11", "2026-12", "2027-01"]);
  assert.deepEqual(departureMonths([{ date: "2026-10-20" }, { date: "2027-02-01", status: "Sold out" }], on), []);
  assert.deepEqual(groupMonths([{ months: ["2026-10", "2026-12"], status: null }, { months: ["2027-01"], status: "sold-out" }], on), ["2026-12"]);
});

test("each filter reads a published fact; unpublished never matches", () => {
  assert.deepEqual(search(all, { ...EMPTY, where: "nile" }).map((x) => x.slug), ["b"]);
  assert.deepEqual(search(all, { ...EMPTY, when: "2027-03" }).map((x) => x.slug), ["a"]);
  assert.deepEqual(search(all, { ...EMPTY, len: "short" }).map((x) => x.slug), ["b"]);
  assert.deepEqual(search(all, { ...EMPTY, budget: 5000 }).map((x) => x.slug), ["c"]);
  assert.deepEqual(search(all, { ...EMPTY, what: ["wildlife", "snorkelling"] }).map((x) => x.slug), ["a"]);
  assert.deepEqual(search(all, { ...EMPTY, who: "couple" }).map((x) => x.slug), ["a"]);
  assert.deepEqual(search(all, { ...EMPTY, who: "group" }).map((x) => x.slug), ["b"]);
  assert.deepEqual(search(all, { ...EMPTY, q: "aswan" }).map((x) => x.slug), ["b"]);
});

test("family filters by the youngest child against the minimum age; solo sorts by the supplement", () => {
  assert.deepEqual(search(all, { ...EMPTY, who: "family" }).map((x) => x.slug), ["a", "c"]);
  assert.deepEqual(search(all, { ...EMPTY, who: "family", ages: [12, 5] }).map((x) => x.slug), ["c"]);
  assert.match(leftOut(all, { ...EMPTY, who: "family" })!, /1 more ship does not publish a minimum age/);
  assert.deepEqual(search(all, { ...EMPTY, who: "solo" }).map((x) => x.slug), ["b", "a"]);
  assert.ok(!matches(c, { ...EMPTY, who: "solo" }));
});

test("the URL round-trips and ignores anything unknown", () => {
  const s = { ...EMPTY, where: "galapagos" as const, when: "2027-03", who: "family" as const, ages: [6, 9], what: ["kayaking" as const], len: "week" as const, budget: 10000, q: "Origin" };
  assert.deepEqual(fromQuery(new URLSearchParams(toQuery(s))), s);
  assert.deepEqual(fromQuery(new URLSearchParams("where=mars&budget=7&what=golf&ages=40")), EMPTY);
  assert.equal(toQuery(EMPTY), "");
  assert.deepEqual(fromQuery(new URLSearchParams("")), EMPTY);
  assert.deepEqual(fromQuery(new URLSearchParams("who=family")).ages, []);
});

test("a combination that matches a real page links to it; the typeahead finds ships, routes, ports and operators", () => {
  const pages = { where: { galapagos: { label: "G", href: "/voyages/galapagos" } }, who: { family: { label: "F", href: "/voyages/family" } }, what: {} };
  assert.deepEqual(pageLinks({ ...EMPTY, who: "family", where: "galapagos" }, pages).map((l) => l.href), ["/voyages/family", "/voyages/galapagos"]);
  assert.equal(suggest(all, "br")[0].label, "Bravo");
  assert.equal(suggest(all, "beach")[0].kind, "Route");
  assert.equal(suggest(all, "luxor")[0].kind, "Port");
  assert.ok(suggest(all, "other").some((x) => x.kind === "Operator"));
  assert.deepEqual(suggest(all, "a"), []);
});
