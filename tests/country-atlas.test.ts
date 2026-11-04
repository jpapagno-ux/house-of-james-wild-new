import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BANNED, cleanCopy, pinsOf, type AtlasEntry } from "../components/maps/terrain/atlas.ts";
import { GAPS, PARKS, VOLCANO_SNAPSHOT, dmsToLatLng } from "../lib/content/atlas/indonesia-sources.ts";

// The Indonesia country atlas: official layers only from their official sources, coordinates read as
// printed, co-located voyages share a pin without being moved, and the copy keeps to the house rules.

test("WHC coordinates read as printed", () => {
  assert.deepEqual(dmsToLatLng("S8 32 35.988 E119 29 21.984"), { lat: -8.54333, lng: 119.48944 });
  assert.deepEqual(dmsToLatLng("S7 36 28.001 E110 12 13.9"), { lat: -7.60778, lng: 110.20386 });
  assert.throws(() => dmsToLatLng("somewhere near Bali"));
});

test("every park point comes from whc.unesco.org and sits in Indonesia, Komodo included", () => {
  assert.ok(PARKS.some((p) => p.site === "Komodo National Park"));
  for (const p of PARKS) {
    assert.match(p.url, /^https:\/\/whc\.unesco\.org\//);
    const { lat, lng } = dmsToLatLng(p.dms);
    assert.ok(lat > -11.5 && lat < 6.5 && lng > 94 && lng < 141.5, p.name);
  }
});

test("volcano levels come only from MAGMA Indonesia and carry an as-of date when filed", () => {
  assert.match(VOLCANO_SNAPSHOT.source, /^https:\/\/magma\.esdm\.go\.id\//);
  for (const v of VOLCANO_SNAPSHOT.volcanoes) assert.match(v.url, /magma\.esdm\.go\.id|esdm\.go\.id/);
  if (VOLCANO_SNAPSHOT.volcanoes.length) assert.ok(VOLCANO_SNAPSHOT.asOf);
});

test("the dive flags the atlas reads are partner named, with filed positions", () => {
  const j = JSON.parse(readFileSync(new URL("../lib/content/ships/journeys.json", import.meta.url), "utf8")) as { journeys: { dive: { name: string; lat: number; lng: number }[] }[] };
  const flags = j.journeys.flatMap((x) => x.dive);
  assert.ok(flags.length >= 4);
  for (const f of flags) assert.ok(Number.isFinite(f.lat) && Number.isFinite(f.lng), f.name);
});

test("voyages leaving the same filed point share one pin, unmoved", () => {
  const e = (id: string, name: string, lat: number, lng: number): AtlasEntry => ({ id, kind: "voyage", name, sub: "", lat, lng, color: "#000", href: "/", image: null, mark: null });
  const pins = pinsOf([e("a", "Rascal", -8.505, 119.712), e("b", "Rebel", -8.505, 119.712), e("c", "Aliikai", -0.876, 131.255)]);
  assert.equal(pins.length, 2);
  const shared = pins.find((p) => p.ids.length === 2)!;
  assert.deepEqual([shared.lat, shared.lng], [-8.505, 119.712]);
  assert.equal(shared.label, "Rascal and 1 more");
});

test("the atlas copy has no dashes or banned words", () => {
  const files = ["../components/maps/terrain/CountryAtlas.tsx", "../components/maps/terrain/AtlasMap.tsx", "../components/maps/terrain/AtlasShell.tsx"];
  const text = [...PARKS.map((p) => `${p.name} ${p.line}`), VOLCANO_SNAPSHOT.note, ...GAPS].join(" ");
  assert.ok(cleanCopy(text), "data copy");
  for (const f of files) {
    const src = readFileSync(new URL(f, import.meta.url), "utf8");
    // Visible strings only: JSX text and string literals, comments stripped.
    const visible = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const r of BANNED) assert.ok(!r.test(visible), `${f}: ${r}`);
  }
});
