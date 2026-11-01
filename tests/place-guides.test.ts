import { test } from "node:test";
import assert from "node:assert/strict";
import { GUIDES, LIBRARY_PLACES, placeGuides, placeGuideForStay } from "../lib/content/guides.ts";
import { isBuilt } from "../lib/routes.ts";
import { readFileSync } from "node:fs";

// lib/site.ts and lib/content/stays.ts carry "@/..." imports plain Node can't resolve, so the
// test reads the export and the sitemap source directly, as tests/pathways.test.ts does.
type Stay = { slug: string; hero: string | null; countrySlug: string | null; coords: { lat: number; lng: number } | null };
const STAYS = JSON.parse(readFileSync(new URL("../lib/content/stays.json", import.meta.url), "utf8")).stays as Stay[];
const stayBySlug = (slug: string) => STAYS.find((s) => s.slug === slug && s.hero);
const COUNTRIES = JSON.parse(readFileSync(new URL("../lib/content/countries-library.json", import.meta.url), "utf8")).countries as { slug: string; region: string }[];
const SITE_SRC = readFileSync(new URL("../lib/site.ts", import.meta.url), "utf8");
const REGION_LIB = JSON.parse(readFileSync(new URL("../lib/charts/regions.json", import.meta.url), "utf8")) as Record<string, { bounds: { w: number; s: number; e: number; n: number }; labels: { areas: { text: string }[] } }>;

// Destination-first: a place guide sits under a guide (Raja Ampat → Indonesia) or under a
// library country (Rapa Nui → Chile), never as a country of its own, and its selected stays
// are real library records filed under that same country.
test("every place guide has a parent that exists", () => {
  for (const g of Object.values(GUIDES).filter((g) => g.parent)) {
    const parentGuide = GUIDES[g.parent!];
    const parentCountry = COUNTRIES.find((c) => c.slug === g.parent && c.region === g.region);
    assert.ok(parentGuide || parentCountry, `${g.slug}: parent ${g.parent} is neither a guide nor a library country`);
    assert.equal(g.path, `/destinations/${g.region}/${g.parent}/${g.slug}`);
  }
});

test("Rapa Nui is a place inside Chile, not a country", () => {
  const g = GUIDES["rapa-nui"];
  assert.equal(g.parent, "chile");
  assert.equal(g.region, "south-america");
  assert.ok(!COUNTRIES.some((c) => c.slug === "rapa-nui"));
  assert.deepEqual(placeGuides("chile").map((x) => x.slug).sort(), ["atacama", "patagonia", "rapa-nui"]);
});

test("selected stays are page-ready library records filed under the parent country", () => {
  for (const g of Object.values(GUIDES).filter((g) => g.stays?.length)) {
    for (const slug of g.stays!) {
      const s = stayBySlug(slug);
      assert.ok(s, `${g.slug}: ${slug} is not a page-ready stay`);
      assert.equal(s!.countrySlug, g.parent ?? g.country, `${g.slug}: ${slug} is filed under ${s!.countrySlug}`);
      assert.equal(placeGuideForStay(slug)?.slug, g.slug);
    }
  }
  assert.equal(placeGuideForStay("nayara-hangaroa")?.slug, "rapa-nui");
  assert.equal(placeGuideForStay("leeu-estates"), undefined);
});

test("a place guide is built, in the sitemap, and has its chart inset", () => {
  for (const g of Object.values(GUIDES).filter((g) => g.parent)) {
    assert.ok(isBuilt(g.path), `${g.slug}: not in the link guard`);
    assert.ok(SITE_SRC.includes(`{ path: "${g.path}"`), `${g.slug}: not in LIVE_ROUTES`);
    if (g.zoom) assert.ok(REGION_LIB[g.zoom], `${g.slug}: no ${g.zoom} chart in regions.json`);
  }
});

test("Rapa Nui's pins fall inside its inset and Rapa Nui is labelled on the region chart", () => {
  const r = REGION_LIB["rapa-nui"];
  const s = stayBySlug("nayara-hangaroa")!;
  assert.ok(s.coords!.lng > r.bounds.w && s.coords!.lng < r.bounds.e && s.coords!.lat > r.bounds.s && s.coords!.lat < r.bounds.n);
  assert.ok(REGION_LIB["south-america"].labels.areas.some((a) => a.text === "Rapa Nui"));
});

// Destination-first (Stage 2): library places (Destination records with a parent) are never
// exported as countries, always sit under a live country, and their selected stays are filed
// under that same country.
test("library places are never countries and always have a live parent", () => {
  for (const p of LIBRARY_PLACES) {
    assert.ok(!COUNTRIES.some((c) => c.slug === p.slug), `${p.slug}: a place was exported as a country`);
    assert.ok(COUNTRIES.some((c) => c.slug === p.parentSlug), `${p.slug}: parent ${p.parentSlug} is not a library country`);
    if (p.ledgerId) assert.match(p.ledgerId, /^DST-\d{4}-\d{6}$/);
    for (const slug of p.stays) {
      const s = STAYS.find((x) => x.slug === slug);
      assert.ok(s, `${p.slug}: ${slug} is not in the stays export`);
      assert.equal(s!.countrySlug, p.parentSlug, `${p.slug}: ${slug} is filed under ${s!.countrySlug}`);
    }
  }
});

// Destination-first (Stage 5): Slovenia's three places, each with the stay the house selected,
// linked to each other as one route (city, Alps, wine hills).
test("Slovenia has Ljubljana, the Logar Valley and Brda, linked as one route", () => {
  assert.deepEqual(placeGuides("slovenia").map((x) => x.slug).sort(), ["brda", "ljubljana", "logar-valley"]);
  assert.equal(placeGuideForStay("zlata-ladjica")?.slug, "ljubljana");
  assert.equal(placeGuideForStay("hotel-plesnik")?.slug, "logar-valley");
  assert.equal(placeGuideForStay("alma-vista")?.slug, "brda");
  for (const g of placeGuides("slovenia")) {
    const others = placeGuides("slovenia").filter((o) => o.slug !== g.slug).map((o) => o.path).sort();
    assert.deepEqual(g.onward!.map((o) => o.href).sort(), others, `${g.slug}: onward links don't cover the other places`);
  }
});
