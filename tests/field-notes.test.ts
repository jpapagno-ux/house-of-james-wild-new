import { test } from "node:test";
import assert from "node:assert/strict";
import { FIELD_NOTES, COUNTRY_FIELD_NOTES, AMAZON_HUB_NOTES, GALAPAGOS_HUB_NOTES, ALASKA_HUB_NOTES, POLAR_HUB_NOTES, INDONESIA_HUB_NOTES, SHIP_FIELD_NOTES, SPECIES_PAGES, shipFieldNote } from "../lib/field-notes/notes.ts";

// Field Notes (James, 22 Nov 2026): every note files its sources, links stay inside the house, no dashes.
test("every Field Note has sources, an in-house link and no em or en dashes", () => {
  for (const n of Object.values(FIELD_NOTES)) {
    assert.ok(n.sources.length > 0, `${n.id}: no sources filed`);
    assert.ok(n.where.href.startsWith("/") || n.where.href.startsWith("#"), `${n.id}: link leaves the house`);
    const copy = [n.title, n.latin, n.body, n.where.label, n.image.alt, ...n.rows.flatMap((r) => [r.label, r.text])].join(" ");
    assert.ok(!/[–—]/.test(copy), `${n.id}: dash in public copy`);
  }
});

test("every placed Field Note exists, and species pages stay in house and dash free", () => {
  for (const id of [...AMAZON_HUB_NOTES, ...GALAPAGOS_HUB_NOTES, ...ALASKA_HUB_NOTES, ...POLAR_HUB_NOTES, ...INDONESIA_HUB_NOTES, ...Object.values(COUNTRY_FIELD_NOTES).flat()]) assert.ok(FIELD_NOTES[id], `${id}: placed but not filed`);
  for (const p of Object.values(SPECIES_PAGES)) {
    assert.ok(FIELD_NOTES[p.noteId], `${p.noteId}: species page without a note`);
    for (const r of p.reach) assert.ok(r.href.startsWith("/"), `${p.noteId}: link leaves the house`);
    const copy = [p.title, p.answer, ...p.photo, ...p.qa.flatMap((x) => [x.q, x.a]), ...p.reach.flatMap((r) => [r.name, r.line])].join(" ");
    assert.ok(!/[\u2013\u2014]/.test(copy), `${p.noteId}: dash in public copy`);
  }
});

// The Atlas "Wildlife here" line (James, 24 Nov 2026): a place typed in the Atlas finds its species pages.
import { wildlifeFor } from "../lib/field-notes/match-place.ts";
test("the Atlas finds species pages for a place, and none for a name", () => {
  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const by = { Rwanda: [{ name: "Mountain gorilla", href: "/wildlife/mountain-gorilla" }], "Ecuador & Galápagos": [{ name: "Giant tortoise", href: "/wildlife/galapagos-giant-tortoise" }], "Galápagos": [{ name: "Giant tortoise", href: "/wildlife/galapagos-giant-tortoise" }], "South Africa": [{ name: "Leopard", href: "/wildlife/leopard" }] };
  assert.deepEqual(wildlifeFor("Rwanda", by, norm).map((s) => s.name), ["Mountain gorilla"]);
  assert.deepEqual(wildlifeFor("rwanda in august", by, norm).map((s) => s.name), ["Mountain gorilla"]);
  assert.equal(wildlifeFor("Galapagos", by, norm).length, 1);
  assert.equal(wildlifeFor("South Africa", by, norm).length, 1);
  assert.equal(wildlifeFor("Dulini", by, norm).length, 0);
  assert.equal(wildlifeFor("", by, norm).length, 0);
});

test("every ship Field Note is filed, and one ship always shows the same note", () => {
  for (const [w, ids] of Object.entries(SHIP_FIELD_NOTES)) for (const id of ids) assert.ok(FIELD_NOTES[id], `${w}: ${id} is not filed`);
  assert.equal(shipFieldNote("amazon", "aria-amazon")?.id, shipFieldNote("amazon", "aria-amazon")?.id);
  assert.equal(shipFieldNote("nile", "zein-nile-chateau"), null);
});
