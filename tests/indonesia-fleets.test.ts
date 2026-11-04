// The Indonesian yacht fleets (James, 2 Nov 2026; voyages plan Parts 12 and 16): Rascal Voyages (Rascal,
// Rebel, El Aleph), Silolona Sojourns (Silolona, Si Datu Bua) and Celestia, their partner pages and the two
// signature charter journeys shared by both fleets.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { SHIP_REGISTRY } from "../lib/content/ships/registry.ts";
import { VESSELS, vesselHref } from "../lib/content/vessels.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const rec = (slug: string) => JSON.parse(read(`lib/content/ships/indonesia/${slug}.json`));
const FLEET = { rascal: "Rascal Voyages", rebel: "Rascal Voyages", "el-aleph": "Rascal Voyages", silolona: "Silolona Sojourns", "si-datu-bua": "Silolona Sojourns", celestia: "Celestia Yacht" } as const;

test("Rascal Voyages files three yachts: kind yacht, sailing and charter, Indonesia, retired from one Stay record", () => {
  for (const slug of ["rascal", "rebel", "el-aleph"]) {
    const r = SHIP_REGISTRY.find((s) => s.slug === slug)!;
    assert.equal(r.kind, "yacht"); assert.deepEqual(r.types, ["sailing", "charter"]); assert.deepEqual(r.waters, ["indonesia"]);
    assert.equal(r.staySlug, "rascal-voyages"); assert.ok(r.page);
  }
  assert.equal(VESSELS.filter((v) => v.slug === "rascal-voyages").length, 1, "the retired record is listed once");
  assert.equal(vesselHref("rascal-voyages"), "/partners/rascal-voyages");
});

test("every fleet yacht has a page record, operator photographs credited, and her old URL redirects", () => {
  const redirects = JSON.parse(read("redirects.json")) as { source: string; destination: string; statusCode?: number }[];
  for (const [slug, operator] of Object.entries(FLEET)) {
    const s = rec(slug);
    assert.equal(s.slug, slug);
    assert.ok(s.gallery.length >= 8, `${slug}: ${s.gallery.length} photographs`);
    for (const g of s.gallery) assert.ok(g.credit, `${slug}: every photograph credited`);
    assert.ok(s.hero.url.startsWith("https://res.cloudinary.com/jhlnq5h5/"), `${slug}: hero on Cloudinary`);
    assert.equal(SHIP_REGISTRY.find((r) => r.slug === slug)!.operator, operator);
  }
  for (const [src, dst] of [["/stays/rascal-voyages", "/partners/rascal-voyages"], ["/stays/silolona-sojourns", "/voyages/ships/silolona"], ["/stays/celestia-yacht", "/voyages/ships/celestia"]]) {
    assert.deepEqual(redirects.find((r) => r.source === src), { source: src, destination: dst, statusCode: 301 });
  }
});

test("founder marks: Rascal and Silolona vetted and favourite, never a visit; Celestia carries none", () => {
  for (const slug of ["rascal", "rebel", "el-aleph", "silolona", "si-datu-bua"]) {
    const s = rec(slug);
    assert.match(s.founder.eyebrow, /Founder vetted · Founder favourite · not yet visited/);
    assert.ok(!/\b(sailed|stayed)\b/i.test(JSON.stringify([s.founder, s.proofLine, s.why, s.overview, s.answer])), `${slug}: no sailed or stayed claim`);
  }
  assert.equal(rec("celestia").founder, undefined);
  assert.ok(!/founder/i.test(rec("celestia").proofLine));
  assert.ok(rec("silolona").galleryNote.includes("Si Datu Bua"), "Silolona's gallery note names her sister");
});

test("no dashes and no Gatherings links in the new copy", () => {
  const all = [...Object.keys(FLEET).map((s) => read(`lib/content/ships/indonesia/${s}.json`)), read("lib/content/ships/journeys.json"), read("lib/content/partners/indonesia.ts")].join("\n");
  assert.ok(!/[–—]/.test(all), "no en or em dashes");
  assert.ok(!/\/gatherings/.test(all), "no Gatherings links");
});

test("the two charter journeys: typical weeks, indicative days, both fleets, a route file each, no offer until one exists", () => {
  const J = JSON.parse(read("lib/content/ships/journeys.json"));
  assert.deepEqual(J.journeys.map((j: { slug: string }) => j.slug), ["komodo-and-flores-charter", "raja-ampat-and-misool-charter"]);
  assert.deepEqual(J.fleets.map((f: { operator: string }) => f.operator), ["Rascal Voyages", "Silolona Sojourns"]);
  for (const j of J.journeys) {
    assert.equal(j.days.length, j.nights + 1, `${j.slug}: a day per night plus the last morning`);
    assert.ok(j.days.every((d: { indicative?: boolean }) => d.indicative), `${j.slug}: every day indicative`);
    assert.ok(j.dive.length >= 3, `${j.slug}: dive flags`);
    assert.match(j.season.url, /indonesia\.travel/, `${j.slug}: season from the tourism board`);
    assert.ok(existsSync(new URL(`public/maps/routes/${j.slug}-${j.nights}n.json`, root)), `${j.slug} route file`);
  }
  assert.deepEqual(J.founderFavourite, [], "the Founder Favourite slot stays empty until a partner sends an offer");
});

test("partner pages for both fleets, with Organization data and their yachts", () => {
  const p = read("lib/content/partners/indonesia.ts");
  for (const slug of ["rascal-voyages", "silolona-sojourns"]) assert.match(p, new RegExp(`slug: "${slug}"`));
  assert.match(read("lib/content/partners/index.ts"), /RASCAL_VOYAGES, SILOLONA_SOJOURNS/);
  assert.match(p, /fleet: \["rascal", "rebel", "el-aleph"\]/);
  assert.match(p, /fleet: \["silolona", "si-datu-bua"\]/);
});
