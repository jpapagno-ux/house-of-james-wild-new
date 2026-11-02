// The ships registry (voyages plan, Part 2): every ship has a type, waters, and (once on a page)
// a primary pathway and a route file for each day-by-day itinerary. Part 3 rules are checked too.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { SHIP_REGISTRY, shipsInWaters, shipsOfType, shipsOnPathway } from "../lib/content/ships/registry.ts";
import { VESSELS } from "../lib/content/vessels.ts";

const root = new URL("../", import.meta.url);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const records = new Map<string, { slug: string; itineraries: { direction: string; nights: number | null; days: unknown[] }[] }>();
for (const dir of ["nile", "amazon", "galapagos"]) for (const f of readdirSync(new URL(`lib/content/ships/${dir}/`, root)).filter((x) => x.endsWith(".json"))) {
  const r = JSON.parse(readFileSync(new URL(`lib/content/ships/${dir}/${f}`, root), "utf8"));
  records.set(r.slug, r);
}

test("every ship has a type, waters and country; slugs are unique", () => {
  assert.equal(new Set(SHIP_REGISTRY.map((s) => s.slug)).size, SHIP_REGISTRY.length);
  for (const s of SHIP_REGISTRY) {
    assert.ok(s.types.length > 0, `${s.slug} type`);
    assert.ok(s.waters.length > 0, `${s.slug} waters`);
    assert.ok(s.country.length > 0, `${s.slug} country`);
  }
});

test("every ship with a page has a primary pathway, a rate basis, and a route file per itinerary", () => {
  for (const s of SHIP_REGISTRY.filter((x) => x.page)) {
    assert.ok(s.pathway?.primary, `${s.slug} primary pathway`);
    assert.ok(s.rateBasis, `${s.slug} rate basis`);
    const r = records.get(s.slug);
    if (!r) continue; // Aliikai: her chart is the 10 Day Raja Ampat North route file
    for (const it of r.itineraries.filter((i) => i.days.length)) {
      const id = `${s.slug}-${slug(it.direction)}-${it.nights}n`;
      assert.ok(existsSync(new URL(`public/maps/routes/${id}.json`, root)), `${id}.json`);
    }
  }
  assert.ok(existsSync(new URL("public/maps/routes/10-day-raja-ampat-north.json", root)));
});

test("Part 3 pathway rules: one primary, at most two secondaries; no Between Tides on rivers; Amazon is Into the Green", () => {
  for (const s of SHIP_REGISTRY.filter((x) => x.pathway)) {
    assert.ok(s.pathway!.secondary.length <= 2, `${s.slug} at most two secondaries`);
    if (s.types.includes("river")) assert.ok(![s.pathway!.primary, ...s.pathway!.secondary].includes("PATH-02"), `${s.slug}: no Between Tides on a river`);
    if (s.waters.includes("amazon")) assert.equal(s.pathway!.primary, "PATH-01");
  }
  assert.deepEqual(SHIP_REGISTRY.find((s) => s.slug === "aliikai")!.pathway, { primary: "PATH-02", secondary: ["PATH-06", "PATH-07"] });
  assert.deepEqual(SHIP_REGISTRY.find((s) => s.slug === "zein-nile-chateau")!.pathway, { primary: "PATH-08", secondary: ["PATH-07"] });
});

test("polar ships are Antarctica21's, listed in Polar Crossings (James, 2 Nov 2026)", () => {
  const polar = SHIP_REGISTRY.filter((s) => s.waters.includes("antarctica"));
  assert.deepEqual(polar.map((s) => s.slug).sort(), ["magellan-discoverer", "magellan-explorer"]);
  for (const s of polar) {
    assert.equal(s.operator, "Antarctica21");
    assert.deepEqual(s.types, ["expedition"]);
    assert.ok(s.page);
    assert.ok(![s.pathway!.primary, ...s.pathway!.secondary].includes("PATH-03"), `${s.slug}: Above It All is not used for voyages yet`);
  }
  assert.ok(!SHIP_REGISTRY.some((s) => /roald|amundsen/i.test(s.name)), "MS Roald Amundsen is a founder card, not a ship page");
});

test("the filters the hubs run", () => {
  assert.ok(shipsInWaters("nile").length >= 5);
  assert.ok(shipsOfType("charter").some((s) => s.slug === "aliikai"));
  assert.ok(shipsOnPathway("PATH-08").every((s) => s.waters.includes("nile")));
});

test("vessels.ts is built from the registry", () => {
  for (const s of SHIP_REGISTRY.filter((x) => x.staySlug)) assert.ok(VESSELS.some((v) => v.slug === s.staySlug), s.slug);
  assert.equal(VESSELS.find((v) => v.slug === "beyond-amazon-explorer")?.ship, "beyond-amazon-explorer");
});

test("a vessel with a ship page 301s from her stay URL (as Aliikai's does)", () => {
  const redirects = JSON.parse(readFileSync(new URL("redirects.json", root), "utf8")) as { source: string; destination: string; statusCode?: number }[];
  for (const s of SHIP_REGISTRY.filter((x) => x.page && x.staySlug)) {
    const r = redirects.find((x) => x.source === `/stays/${s.staySlug}`);
    assert.ok(r, `${s.staySlug} redirects`);
    assert.equal(r!.destination, `/voyages/ships/${s.slug}`);
    assert.equal(r!.statusCode, 301);
  }
});

// Search and category facts (James, 2 Nov 2026): read only from each ship's filed record; never a guess.
type Rec = { slug: string; children?: string; facts?: [string, string][]; pricesNote?: string; overview?: string[]; faqs?: [string, string][]; cabins?: { features: string[] }[]; departures?: { prices: Record<string, number | null>; singlePrices?: Record<string, number | null> }[] };
const full = new Map<string, Rec>();
for (const dir of ["nile", "amazon", "galapagos", "polar"]) for (const f of readdirSync(new URL(`lib/content/ships/${dir}/`, root)).filter((x) => x.endsWith(".json"))) {
  const r = JSON.parse(readFileSync(new URL(`lib/content/ships/${dir}/${f}`, root), "utf8")) as Rec;
  full.set(r.slug, r);
}
const text = (r: Rec) => JSON.stringify([r.children, r.facts, r.pricesNote, r.overview, r.faqs, r.cabins]);

test("every ship with a page carries search traits, with diving only where she dives", () => {
  for (const s of SHIP_REGISTRY.filter((x) => x.page)) {
    assert.ok(s.traits, `${s.slug} traits`);
    const a = s.traits!.activities ?? [];
    assert.equal(new Set(a).size, a.length, `${s.slug} activities are unique`);
    assert.equal(a.includes("diving"), s.traits!.dives === true, `${s.slug}: diving is an activity exactly when she dives`);
  }
  // Filed vessels without a ship page have no record to read yet, so nothing is set.
  for (const s of SHIP_REGISTRY.filter((x) => !x.page)) assert.equal(s.traits, undefined, s.slug);
});

test("a minimum child age is the one her record publishes", () => {
  for (const s of SHIP_REGISTRY.filter((x) => x.traits?.minChildAge !== undefined)) {
    const r = full.get(s.slug);
    if (!r) continue;
    const t = text(r);
    const age = s.traits!.minChildAge!;
    if (age === 0) assert.match(t, /all ages/i, s.slug);
    else assert.ok(new RegExp(`\\b(${age}|${age - 1})\\b`).test(r.children || t), `${s.slug}: ${age} in her record`);
  }
});

test("a single supplement agrees with the single fares her record publishes", () => {
  for (const s of SHIP_REGISTRY.filter((x) => x.traits?.single?.kind === "percent")) {
    const r = full.get(s.slug);
    const pairs = (r?.departures ?? []).flatMap((d) => Object.entries(d.singlePrices ?? {}).map(([k, v]) => [d.prices[k], v] as const)).filter(([a, b]) => typeof a === "number" && typeof b === "number" && a > 0);
    if (!pairs.length) continue;
    const { pct, max = pct } = s.traits!.single as { pct: number; max?: number };
    const seen = pairs.map(([a, b]) => ((b as number) / (a as number) - 1) * 100);
    for (const x of seen) assert.ok(x >= pct - 2 && x <= max + 2, `${s.slug}: ${x.toFixed(1)}% is outside ${pct} to ${max}%`);
    assert.ok(Math.abs(Math.min(...seen) - pct) <= 2, `${s.slug}: the lowest published supplement is ${Math.min(...seen).toFixed(1)}%, not ${pct}%`);
  }
  for (const s of SHIP_REGISTRY.filter((x) => x.traits?.single?.kind === "none")) assert.match(text(full.get(s.slug)!), /no single supplement/i, s.slug);
});

test("connecting cabins and a kids' programme are set only where her record says so", () => {
  for (const s of SHIP_REGISTRY.filter((x) => x.traits?.connecting)) {
    const r = full.get(s.slug);
    if (r) assert.match(text(r), /connect/i, s.slug);
  }
  for (const s of SHIP_REGISTRY.filter((x) => x.traits?.kidsProgramme)) assert.match(text(full.get(s.slug)!), /WILDchild|programme/i, s.slug);
  for (const s of SHIP_REGISTRY) {
    assert.notEqual(s.traits?.connecting, false, `${s.slug}: unpublished stays unset, not false`);
    assert.notEqual(s.traits?.kidsProgramme, false, `${s.slug}: unpublished stays unset, not false`);
  }
});
