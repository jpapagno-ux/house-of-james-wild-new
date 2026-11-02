// Stage 4b: "Who plans it" ranks from the Library's Advisor DNA (what the advisor states)
// and the advisor's own marks; James heads every page while the house is in testing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { rankAdvisors, type Rankable } from "../lib/advisors/rank.ts";
import dna from "../lib/content/advisors-library.json" with { type: "json" };

const JAMES = "james-papagno";
const countryOfRecord = (id: string) => ({ "STY-2026-882896": "indonesia", "STY-2026-000525": "ireland" } as Record<string, string>)[id] ?? null;
const fromLibrary = (slug: string, extra: Partial<Rankable<string>> = {}): Rankable<string> => {
  const d = dna.advisors.find((x) => x.slug === slug)!;
  return { a: slug, slug, entries: [], dna: d, deskCountries: [], deskVolumes: [], ...extra };
};
const standIn: Rankable<string> = { a: "marcus-adeyemi", slug: "marcus-adeyemi", entries: [{ ledgerId: "STY-2026-000001", countrySlug: "kenya", regionSlug: "africa", volume: "safaris", guests: 40, theirs: { mark: "Stayed" } }], dna: null, deskCountries: ["kenya"], deskVolumes: ["safaris"] };
const pool = [fromLibrary(JAMES), fromLibrary("kristina-larson"), fromLibrary("anthony-papagno"), standIn];
const rank = (where: Parameters<typeof rankAdvisors>[1]) => rankAdvisors(pool, where, { defaultSlug: JAMES, countryOfRecord });

test("the Library export carries only what the advisor may be quoted on", () => {
  for (const d of dna.advisors) {
    assert.match(d.ledgerId, /^ADV-\d{4}-\d{6}$/);
    if (!d.confirmed) assert.equal(d.matchNote, null, `${d.slug}: an unconfirmed match line never leaves the Library`);
    for (const m of d.marks) assert.ok(["Stayed", "Walked It", "Sailed It", "Sent Guests"].includes(m.mark));
  }
});

test("a stated country ranks a DNA-only advisor (no Desk) for that country", () => {
  const { advisors } = rank({ countrySlug: "kenya" });
  assert.ok(advisors.includes("kristina-larson"), `Kristina states Kenya; got ${advisors.join(", ")}`);
  assert.ok(advisors.includes(JAMES));
});

test("a marked entry on the record outranks knowing the country; the advisor's own Library mark counts as slept", () => {
  const r = rank({ ledgerId: "STY-2026-882896", countrySlug: "indonesia" });
  assert.equal(r.advisors[0], "anthony-papagno", "Anthony's Sailed It on Aliikai leads");
  assert.equal(r.slept, 1);
  assert.equal(r.carried, 1);
});

test("a Library mark in the country (no record given) places the advisor before those who only state it", () => {
  const r = rank({ countrySlug: "indonesia" });
  assert.deepEqual(r.advisors.slice(0, 2), ["anthony-papagno", JAMES]);
});

test("a stand-in with a marked entry is ranked (the page labels it) but never named as the match; the lead is the page's call", () => {
  const r = rank({ countrySlug: "kenya", volume: "safaris" });
  assert.ok(r.advisors.includes("marcus-adeyemi"));
  assert.ok(r.advisors.includes(JAMES));
  // The ranking is a list; WhoPlans keeps James as lead while testing and picks the first REAL advisor as "with …".
});

test("closed availability removes an advisor from 'knows the country'", () => {
  const closed = fromLibrary("kristina-larson", { dna: { ...dna.advisors.find((x) => x.slug === "kristina-larson")!, availability: "closed" } });
  const r = rankAdvisors([fromLibrary(JAMES), closed], { countrySlug: "kenya" }, { defaultSlug: JAMES, countryOfRecord });
  assert.deepEqual(r.advisors, [JAMES]);
});

test("a volume filter respects the advisor's stated volumes", () => {
  const r = rank({ countrySlug: "kenya", volume: "voyages" });
  assert.ok(!r.advisors.includes("kristina-larson"), "Kristina states safaris, stays, gatherings — not voyages");
  assert.ok(r.advisors.includes(JAMES));
});
