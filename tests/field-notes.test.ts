import { test } from "node:test";
import assert from "node:assert/strict";
import { FIELD_NOTES } from "../lib/field-notes/notes.ts";

// Field Notes (James, 22 Nov 2026): every note files its sources, links stay inside the house, no dashes.
test("every Field Note has sources, an in-house link and no em or en dashes", () => {
  for (const n of Object.values(FIELD_NOTES)) {
    assert.ok(n.sources.length > 0, `${n.id}: no sources filed`);
    assert.ok(n.where.href.startsWith("/") || n.where.href.startsWith("#"), `${n.id}: link leaves the house`);
    const copy = [n.title, n.latin, n.body, n.where.label, n.image.alt, ...n.rows.flatMap((r) => [r.label, r.text])].join(" ");
    assert.ok(!/[–—]/.test(copy), `${n.id}: dash in public copy`);
  }
});
