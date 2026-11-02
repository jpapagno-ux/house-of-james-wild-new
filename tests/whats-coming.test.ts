// What's Coming view (James, 2 Nov 2026): search by country, sort by year and date, "most recent to
// oldest", the departures-board labels and the countdown. A fixed "today" keeps results stable.
import { test } from "node:test";
import assert from "node:assert/strict";
import { boardDay, mixBoard, offerBoardLines, offerIsPublic, type BoardEntry, groupByRegionView, regionCounts, boardStatus, countLine, countdown, daysTo, filterComing, groupByYear, parseQuery, sortComing, toQuery, type ViewItem } from "../lib/content/coming-view.ts";
import data from "../lib/content/whats-coming.json" with { type: "json" };

const ON = "2026-11-02";
const items = (data.coming as ViewItem[]).filter((c) => c.slug !== "kahavadi-chiang-rai"); // opened 1 Jul 2026; the date rule hides it
const names = (xs: ViewItem[]) => xs.map((c) => c.slug);

test("count line is computed from the entries", () => {
  assert.equal(countLine(items), "5 openings and returns, 2026 to 2027");
  assert.equal(countLine(items.filter((c) => c.slug === "singita-elela")), "1 opening, 2026");
});

test("soonest: nearest first, a year counts to its last day, undated last", () => {
  assert.deepEqual(names(sortComing(items, "soonest")), ["singita-elela", "anantara-siam-bangkok", "the-chedi-aquarius-koh-chang", "beyond-xaranna-okavango-delta-camp-by-and-beyond", "six-senses-uluwatu"]);
});

test("latest first: the furthest date first, undated still last", () => {
  const got = names(sortComing(items, "latest"));
  assert.equal(got[0], "beyond-xaranna-okavango-delta-camp-by-and-beyond");
  assert.equal(got[got.length - 1], "six-senses-uluwatu");
});

test("recently filed: newest Ledger ID first, one flat group", () => {
  const s = sortComing(items, "filed");
  assert.equal(s[0].slug, "beyond-xaranna-okavango-delta-camp-by-and-beyond");
  assert.equal(groupByYear(s, "filed").length, 1);
});

test("groups by year in sort order, with Date to come", () => {
  assert.deepEqual(groupByYear(sortComing(items, "soonest"), "soonest").map((g) => g.label), ["2026", "2027", "Date to come"]);
});

test("filters: search by name or country (accents ignored), country, year, status", () => {
  assert.deepEqual(names(filterComing(items, { q: "botswana", country: null, year: null, status: null })).sort(), ["beyond-xaranna-okavango-delta-camp-by-and-beyond", "singita-elela"]);
  assert.deepEqual(names(filterComing(items, { q: "SINGITA", country: null, year: null, status: null })), ["singita-elela"]);
  assert.equal(filterComing(items, { q: "", country: "thailand", year: null, status: null }).length, 2);
  assert.equal(filterComing(items, { q: "", country: null, year: "tbc", status: null })[0].slug, "six-senses-uluwatu");
  assert.equal(filterComing(items, { q: "", country: null, year: null, status: "rebuilding" }).length, 3);
  assert.equal(filterComing(items, { q: "nowhere", country: null, year: null, status: null }).length, 0);
});

test("departures board labels", () => {
  assert.equal(boardStatus({ status: "opening", date: "2026-12-11" }), "OPENS 11 DEC 2026");
  assert.equal(boardStatus({ status: "rebuilding", date: "2027-08" }), "REOPENS AUG 2027");
  assert.equal(boardStatus({ status: "rebuilding", date: null }), "BEING REIMAGINED");
  assert.equal(boardStatus({ status: "opening", date: "2026" }), "OPENS 2026");
});

test("countdown only for exact dates", () => {
  assert.equal(daysTo("2026-12-11", ON), 39);
  assert.equal(countdown("2026-12-11", ON), "39 days to go");
  assert.equal(countdown("2026-11-03", ON), "1 day to go");
  assert.equal(countdown("2027-08", ON), null);
  assert.equal(countdown(null, ON), null);
});

test("query string round trip; defaults left out; junk ignored", () => {
  const s = parseQuery("?country=botswana&year=2027&sort=latest&status=rebuilding&q=delta&region=africa&group=region");
  assert.deepEqual(s, { q: "delta", region: "africa", country: "botswana", year: "2027", status: "rebuilding", sort: "latest", group: "region" });
  assert.equal(toQuery(s), "?q=delta&region=africa&country=botswana&year=2027&status=rebuilding&sort=latest&group=region");
  assert.equal(toQuery(parseQuery("?sort=bogus&status=x")), "");
});

test("no em or en dashes in What's Coming copy", () => {
  for (const c of data.coming) for (const v of [c.note, c.tagline, c.name]) assert.ok(!/[–—]/.test(v ?? ""), `${c.slug}: ${v}`);
});

test("region: grouped in the house's region order, filter by region", () => {
  const regions = [{ slug: "africa", name: "Africa" }, { slug: "asia", name: "Asia" }];
  const g = groupByRegionView(sortComing(items, "soonest"), regions);
  assert.deepEqual(g.map((x) => [x.label, x.items.length]), [["Africa", 2], ["Asia", 3]]);
  assert.deepEqual(regionCounts(items, regions).map((r) => r.count), [2, 3]);
  assert.equal(filterComing(items, { q: "", region: "asia", country: null, year: null, status: null }).length, 3);
});

test("Kahavadi Chiang Rai (opened 1 July 2026) stays hidden by the date rule", async () => {
  const { activeOnly } = await import("../lib/dates.ts");
  const live = activeOnly(data.coming, (c) => c.date, ON).map((c) => c.slug);
  assert.ok(!live.includes("kahavadi-chiang-rai"));
  assert.equal(live.length, 5);
});

test("offers on the board: headline as filed, the last day it can be used, never trade terms", () => {
  assert.equal(boardDay("2027-03-31"), "31 MAR 2027");
  assert.deepEqual(offerBoardLines({ headline: "Stay 4 nights, save 10%", program: "Time Rewarded" }, "2027-03-31"), { flap: "STAY 4 NIGHTS, SAVE 10%", tail: "TRAVEL BY 31 MAR 2027" });
  assert.deepEqual(offerBoardLines({ headline: "Save 20%", program: "Book Early", bookingWindow: true }, "2026-12-31"), { flap: "SAVE 20%", tail: "BOOK BY 31 DEC 2026" });
  assert.deepEqual(offerBoardLines({ headline: "Save 30%", program: "Final Call", departure: "2026-12-04" }, "2026-12-04"), { flap: "SAVE 30%", tail: "DEPARTS 4 DEC 2026" });
  assert.equal(offerIsPublic({ headline: "Agent commission 15%", name: "x" }), false);
  assert.equal(offerIsPublic({ headline: "Net rates from $900", name: "x" }), false);
  assert.equal(offerIsPublic({ headline: "Stay 7 nights, pay 6", name: "Bedwell Safari" }), true);
});

test("the board deals offers between openings, openings in order", () => {
  const e = (key: string, kind: BoardEntry["kind"]): BoardEntry => ({ key, kind, place: null, name: key, flap: "", href: "/" });
  const mixed = mixBoard([e("a", "opening"), e("b", "opening")], [e("1", "offer"), e("2", "offer"), e("3", "offer")]);
  assert.deepEqual(mixed.map((x) => x.key), ["a", "1", "2", "b", "3"]);
  assert.deepEqual(mixBoard([], [e("1", "offer")]).map((x) => x.key), ["1"]);
});

test("every coming entry pairs with an existing Wild Pathway", async () => {
  const { COMING_PATHWAYS } = await import("../lib/content/coming-pathways.ts");
  const { PATHWAYS } = await import("../lib/pathways.ts");
  const live = activeOnlyFor(ON);
  for (const slug of live) assert.ok(COMING_PATHWAYS[slug] && PATHWAYS[COMING_PATHWAYS[slug].id], `${slug} has no pathway`);
});
function activeOnlyFor(on: string) { return (data.coming as { slug: string; date: string | null }[]).filter((c) => !c.date || c.date.length < 10 || c.date >= on).map((c) => c.slug); }
