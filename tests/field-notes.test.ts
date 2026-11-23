import { test } from "node:test";
import assert from "node:assert/strict";
import { FIELD_NOTES, COUNTRY_FIELD_NOTES, AMAZON_HUB_NOTES, GALAPAGOS_HUB_NOTES, SPECIES_PAGES } from "../lib/field-notes/notes.ts";

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
  for (const id of [...AMAZON_HUB_NOTES, ...GALAPAGOS_HUB_NOTES, ...Object.values(COUNTRY_FIELD_NOTES).flat()]) assert.ok(FIELD_NOTES[id], `${id}: placed but not filed`);
  for (const p of Object.values(SPECIES_PAGES)) {
    assert.ok(FIELD_NOTES[p.noteId], `${p.noteId}: species page without a note`);
    for (const r of p.reach) assert.ok(r.href.startsWith("/"), `${p.noteId}: link leaves the house`);
    const copy = [p.title, p.answer, ...p.photo, ...p.qa.flatMap((x) => [x.q, x.a]), ...p.reach.flatMap((r) => [r.name, r.line])].join(" ");
    assert.ok(!/[\u2013\u2014]/.test(copy), `${p.noteId}: dash in public copy`);
  }
});
