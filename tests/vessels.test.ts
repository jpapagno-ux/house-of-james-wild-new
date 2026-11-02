// Vessels out of Stays (James, 1 Nov 2026): boats filed in the Stay library belong in Voyages.
// lib/content/vessels.ts is the one rule; lib/content/stays.ts (STAYS, STAY_PAGES, staysIn) and
// lib/content/regions.ts (country and region counts, featured cards) read it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { VESSELS, VESSEL_SLUGS, isVessel, onlyVessels, vesselHref, withoutVessels } from "../lib/content/vessels.ts";

type Row = { slug: string; category: string | null; countrySlug: string | null; regionSlug: string | null; misfiled: string | null };
const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const ROWS = JSON.parse(read("lib/content/stays.json")).stays as Row[];

const NAMED = ["beyond-amazon-explorer", "aliikai-voyage", "alya-catamaran-galapagos", "celestia-yacht", "ecoventura-evolve-yacht",
  "ecoventura-origin-yacht", "ecoventura-theory-yacht", "silolona-sojourns", "sirius-yacht-galapagos", "mutiara-laut"];

test("every vessel James named is a vessel, and every 'cruise' record is listed with its waters", () => {
  for (const slug of NAMED) assert.ok(VESSEL_SLUGS.has(slug), `${slug} listed`);
  for (const r of ROWS.filter((x) => x.category === "cruise")) assert.ok(VESSEL_SLUGS.has(r.slug), `${r.slug} (cruise) has waters in vessels.ts`);
  assert.equal(new Set(VESSELS.map((v) => v.slug)).size, VESSELS.length, "no duplicates");
});

test("land lodges that offer boat trips stay stays", () => {
  for (const slug of ["expedition-blue-lagoon", "six-senses-zil-pasyon", "shipwreck-lodge-namibia", "canvas-and-orchids-retreat"]) {
    const r = ROWS.find((x) => x.slug === slug);
    if (r) assert.equal(isVessel(r), false, slug);
  }
});

test("no vessel in the stays listings or counts", () => {
  const stays = withoutVessels(ROWS);
  assert.equal(stays.length + onlyVessels(ROWS).length, ROWS.length);
  for (const s of stays) assert.ok(!VESSEL_SLUGS.has(s.slug) && s.category !== "cruise", `${s.slug} is not a stay`);
  // Country counts (staysIn / regions.ts countIn) drop the vessels filed there.
  const count = (rows: Row[], c: string) => rows.filter((x) => x.countrySlug === c).length;
  assert.equal(count(ROWS, "indonesia") - count(stays, "indonesia"), 4, "Indonesia: Aliikai, Celestia, Silolona, Mutiara Laut");
  assert.equal(count(ROWS, "ecuador-galapagos") - count(stays, "ecuador-galapagos"), 5, "Galápagos: three Ecoventura yachts, Alya, Sirius");
});

test("the Stays code reads the vessel rule", () => {
  assert.match(read("lib/content/stays.ts"), /export const STAYS: StayData\[\] = RECORDS\.filter\(\(s\) => !isVessel\(s\)\)/);
  const regions = read("lib/content/regions.ts");
  assert.match(regions, /const ROWS: StayRow\[\] = ALL_ROWS\.filter\(\(x\) => !isVessel\(x\)\)/);
  assert.match(regions, /!VESSEL_SLUGS\.has\(f\.slug\)/, "featured region cards drop vessels");
  assert.match(read("lib/content/pathways/index.ts"), /const stay = STAYS\.find/, "pathway stay lists read STAYS");
});

test("aliikai-voyage redirects (301) to her ship page; the rest keep a voyage-labelled page", () => {
  const redirects = JSON.parse(read("redirects.json")) as { source: string; destination: string; permanent?: boolean; statusCode?: number }[];
  const r = redirects.find((x) => x.source === "/stays/aliikai-voyage");
  assert.deepEqual(r, { source: "/stays/aliikai-voyage", destination: "/voyages/ships/aliikai", statusCode: 301 });
  assert.equal(vesselHref("aliikai-voyage"), "/voyages/ships/aliikai");
  for (const v of VESSELS.filter((x) => !x.ship)) {
    assert.equal(vesselHref(v.slug), `/stays/${v.slug}`);
    assert.ok(!redirects.some((x) => x.source === `/stays/${v.slug}`), `${v.slug} keeps its page`);
  }
});
