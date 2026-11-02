// Polar Crossings (James, 2 Nov 2026): the Antarctica21 voyage files, their route files, and the
// month-level departures that stand in until exact dates are filed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { activeMonths, monthsLabel, withoutDated, lowestFrom, type MonthDeparture } from "../lib/content/ships/months.ts";

const root = new URL("../", import.meta.url);
const dir = new URL("lib/content/polar/voyages/", root);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
type V = { slug: string; style: string; route: string; nights: number; ships: string[]; regions: string[]; length: string; monthChips: string[]; departures: MonthDeparture[]; itinerary: { day: number; indicative?: boolean }[]; pathway: { primary: string; secondary: string[] } };
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const voyages = files.map((f) => ({ raw: readFileSync(new URL(f, dir), "utf8"), v: JSON.parse(readFileSync(new URL(f, dir), "utf8")) as V }));

test("nine Antarctica21 voyages, each with a style, region, length, month and ship", () => {
  assert.equal(voyages.length, 9);
  for (const { v } of voyages) {
    assert.ok(["fly-both", "fly-one", "sail-both"].includes(v.style), v.slug);
    assert.ok(v.regions.length && v.length && v.monthChips.length && v.ships.length, v.slug);
  }
});

test("a route file for every voyage on every ship that sails it", () => {
  for (const { v } of voyages) for (const ship of v.ships) {
    const id = `${ship}-${slug(v.route)}-${v.nights}n`;
    assert.ok(existsSync(new URL(`public/maps/routes/${id}.json`, root)), id);
  }
});

test("no dashes, no promise of crossing the Antarctic Circle", () => {
  for (const { raw, v } of voyages) {
    assert.ok(!/[–—]/.test(raw), `${v.slug}: dash`);
    const text = raw.replace(/"Do you cross the Antarctic Circle\?"/g, "").replace(/"Antarctic Circle cruise"/g, "");
    assert.ok(!/(cross(es|ing)? the Antarctic Circle|to the Antarctic Circle|66°33)/i.test(text), `${v.slug}: Circle promise`);
  }
});

test("the research's indicative day blocks are marked", () => {
  const pc = voyages.find((x) => x.v.slug === "polar-circle-air-cruise")!.v;
  assert.deepEqual(pc.itinerary.filter((d) => d.indicative).map((d) => d.day), [3, 4, 5, 6, 7, 8]);
});

const g = (months: string[], extra: Partial<MonthDeparture> = {}): MonthDeparture => ({ season: "2026-27", months, monthsText: null, count: 2, prices: { "magellan-explorer": 5995 }, priceText: null, status: null, ...extra });

test("month groups: past months drop, the count clears when part of a group has sailed", () => {
  const out = activeMonths([g(["2026-11", "2027-03"]), g(["2026-09", "2026-10"])], "2026-12-05");
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].months, ["2027-03"]);
  assert.equal(out[0].count, null);
  assert.equal(activeMonths([g([], { season: "2026-27" })], "2027-05-01").length, 0, "a season-only group ends with its season");
  assert.equal(activeMonths([g([], { season: null })], "2030-01-01").length, 1, "no season, no end");
});

test("filed sailings take over the months they cover", () => {
  const out = withoutDated([g(["2027-02"]), g(["2028-02"])], [{ date: "2027-02-05" }]);
  assert.deepEqual(out.map((x) => x.months[0]), ["2028-02"]);
});

test("labels and the lowest from", () => {
  assert.equal(monthsLabel(g(["2026-11", "2027-03"])), "November 2026 and March 2027");
  assert.equal(monthsLabel(g(["2027-03", "2027-04"])), "March and April 2027");
  assert.equal(lowestFrom([g(["2027-02"], { status: "sold-out", prices: { From: 100 } }), g(["2027-02"], { prices: { From: 900 } })]), 900);
});

test("the old Polar Circle page 301s to its polar page", () => {
  const redirects = JSON.parse(readFileSync(new URL("redirects.json", root), "utf8")) as { source: string; destination: string; statusCode?: number }[];
  const r = redirects.find((x) => x.source === "/voyages/antarctica/antarctica21-polar-circle-air-cruise");
  assert.equal(r?.destination, "/voyages/polar/polar-circle-air-cruise");
  assert.equal(r?.statusCode, 301);
});
