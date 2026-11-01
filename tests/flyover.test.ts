import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { UNESCO } from "../lib/content/unesco.ts";

const REGION_LIB = JSON.parse(readFileSync(new URL("../lib/charts/regions.json", import.meta.url), "utf8"));

// The flyover lands on a close chart that sits inside the continent chart it flies from, and the
// UNESCO layer only marks real, listed sites inside the frame.
test("the Atacama–Uyuni chart sits inside South America and carries its layers", () => {
  const sa = REGION_LIB["south-america"].bounds, c = REGION_LIB["atacama-uyuni"];
  assert.ok(c.bounds.w > sa.w && c.bounds.e < sa.e && c.bounds.s > sa.s && c.bounds.n < sa.n);
  const o = c.overlays;
  assert.deepEqual(o.salt.map((s: { name: string }) => s.name).sort(), ["Salar de Atacama", "Salar de Coipasa", "Salar de Uyuni"]);
  assert.ok(o.route && o.reserves.length === 1);
  for (const u of o.unesco) {
    const site = UNESCO.find((s) => s.id === u.id)!;
    assert.ok(site, `${u.id} is not in the UNESCO list`);
    assert.ok(site.lat! < c.bounds.n && site.lat! > c.bounds.s && site.lng! > c.bounds.w && site.lng! < c.bounds.e, `${site.name} is outside the frame`);
    assert.ok(u.x >= 0 && u.x <= c.width && u.y >= 0 && u.y <= c.height);
  }
});

test("UNESCO sites are unique, dated and placed (or knowingly unplaced)", () => {
  assert.equal(new Set(UNESCO.map((u) => u.id)).size, UNESCO.length);
  for (const u of UNESCO) {
    assert.ok(u.year >= 1978 && u.year <= 2026, `${u.name}: year ${u.year}`);
    assert.equal(u.lat == null, u.lng == null, `${u.name}: half a position`);
  }
});
