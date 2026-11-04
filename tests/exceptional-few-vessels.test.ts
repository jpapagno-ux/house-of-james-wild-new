// The Exceptional Few™ for voyages (James, 2 Nov 2026): a vessel can carry a designation, keyed on its
// ships registry slug. Hermes is No. 002 and Amandira No. 003, after Amangiri (No. 001), all published.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SHIP_REGISTRY } from "../lib/content/ships/registry.ts";

const root = new URL("../", import.meta.url);
const ef = JSON.parse(readFileSync(new URL("lib/content/exceptional-few.json", root), "utf8")).records as Record<string, unknown>[];
const media = JSON.parse(readFileSync(new URL("lib/content/media-assets.json", root), "utf8")).assets as { entityId: string; role: string; rights: string; credit: string }[];
const css = readFileSync(new URL("app/globals.css", root), "utf8");
const DASH = /[–—]/;

test("Amangiri stays No. 001, unchanged; Hermes and Amandira follow", () => {
  const byNo = Object.fromEntries(ef.map((e) => [e.collectionNumber as number, e]));
  assert.equal(byNo[1].staySlug, "amangiri");
  assert.equal(byNo[1].entityType, undefined, "the Amangiri row is not rewritten");
  assert.equal(byNo[2].vesselSlug, "hermes-galapagos");
  assert.equal(byNo[3].vesselSlug, "amandira");
  assert.equal(new Set(ef.map((e) => e.collectionNumber)).size, ef.length, "collection numbers are unique");
});

test("vessel designations are published, point at registry ships with pages, and carry facts only", () => {
  for (const e of ef.filter((x) => x.entityType === "vessel")) {
    const ship = SHIP_REGISTRY.find((s) => s.slug === e.vesselSlug);
    assert.ok(ship?.page, `${e.vesselSlug} has a ship page`);
    assert.equal(e.designationStatus, "designated");
    assert.equal(e.publicationStatus, "published");
    assert.equal(e.stayId, null);
    // James approved a note for each ship (4 Nov 2026). He has not sailed them, so a note may advise but never claim he was aboard.
    if (e.jamesNote) assert.ok(!/\b(I|we) (sailed|was aboard|were aboard|stayed|boarded)\b|\baboard (her|with me)\b/i.test(e.jamesNote.text), "a ship note never claims James sailed her");
    assert.equal((e.whyItMadeTheCut as string[]).length, 3);
    assert.ok((e.whoItMayNotSuit as string[]).length > 0);
    const copy = JSON.stringify([e.heroLine, e.whyItMadeTheCut, e.signals, e.whoItSuits, e.whoItMayNotSuit]);
    assert.ok(!DASH.test(copy), `${e.id}: no em or en dashes`);
    assert.ok(!/gatherings/i.test(copy), `${e.id}: no Gatherings`);
    assert.match(css, new RegExp(`\\.theme-ef-${e.paletteKey} \\{`), `${e.id}: palette ${e.paletteKey}`);
    assert.match(css, new RegExp(`\\.theme-ef-dark\\.theme-ef-${e.paletteKey} \\{`), `${e.id}: dark surface`);
  }
});

test("Via Natura's firsts and onlys are attributed to Via Natura, never stated as ours", () => {
  const h = ef.find((e) => e.vesselSlug === "hermes-galapagos")!;
  for (const line of h.whyItMadeTheCut as string[]) if (/\b(first|only)\b/i.test(line)) assert.match(line, /Via Natura says/);
});

test("each vessel entrance has an approved hero, three cut frames and a night frame", () => {
  for (const slug of ["hermes-galapagos", "amandira"]) {
    const rows = media.filter((m) => m.entityId === `ship:${slug}` && m.rights === "approved");
    for (const role of ["hero", "editorial_landscape", "room", "experience", "night"]) assert.ok(rows.some((m) => m.role === role), `${slug} ${role}`);
    for (const m of rows) assert.ok(m.credit, `${slug} credit`);
  }
});
