// The Exceptional Few™ is stays only (James, 19 Nov 2026: "that is for hotels only"). Ships are Timeless Voyages.
// Hermes (No. 002) and Amandira (No. 003) left the collection that day; their numbers are retired, never renumbered
// and never given to a stay. This replaces tests/exceptional-few-vessels.test.ts (2 Nov 2026).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FOUNDER_LINES } from "../lib/content/voice/founder-lines.ts";
import { SHIP_REGISTRY } from "../lib/content/ships/registry.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
type Row = { id: string; entityType?: string; staySlug?: string | null; vesselSlug?: string | null; collectionNumber: number; designationStatus: string; publicationStatus: string };
const rows = JSON.parse(read("lib/content/exceptional-few.json")).records as Row[];
const TIMELESS_VOYAGES = JSON.parse(read("lib/content/timeless-voyages.json")).records as { vesselSlug: string }[];
const loader = read("lib/content/exceptional-few.ts");
// what the site loads: the loader drops every vessel row, whatever the export still holds
const stays = rows.filter((e) => (e.entityType ?? "stay") === "stay");
const live = stays.filter((e) => e.designationStatus === "designated" && e.publicationStatus === "published").sort((a, b) => a.collectionNumber - b.collectionNumber);
const MOVED = ["hermes-galapagos", "amandira"];
const RETIRED_NUMBERS = [2, 3];

test("no ship is in The Exceptional Few", () => {
  assert.match(loader, /EXCEPTIONAL_FEW: ExceptionalFew\[\] = \(data\.records as ExceptionalFew\[\]\)\.filter\(\(e\) => \(e\.entityType \?\? "stay"\) === "stay"\)/, "the loader keeps stays only");
  assert.match(loader, /RETIRED_NUMBERS = \[2, 3\]/);
  assert.ok(stays.every((e) => !e.vesselSlug), "no stay row points at a ship");
});

test("Amangiri stays No. 001; 002 and 003 are retired, not renumbered and not reused", () => {
  assert.equal(live[0].collectionNumber, 1);
  assert.equal(live[0].staySlug, "amangiri");
  for (const n of RETIRED_NUMBERS) assert.ok(!stays.some((e) => e.collectionNumber === n), `No. ${String(n).padStart(3, "0")} is not given to a stay`);
  assert.equal(live[1].collectionNumber, 4, "the stays after the two ships keep the numbers they were given");
  assert.equal(new Set(live.map((e) => e.collectionNumber)).size, live.length, "collection numbers are unique");
});

test("Hermes and Amandira are in Timeless Voyages, with a ship page each", () => {
  for (const slug of MOVED) {
    assert.ok(TIMELESS_VOYAGES.some((t) => t.vesselSlug === slug), `${slug} has a Timeless Voyages row`);
    assert.ok(SHIP_REGISTRY.find((s) => s.slug === slug)?.page, `${slug} has a ship page`);
  }
});

test("James's approved note for each ship stays on her page, and never claims he sailed her", () => {
  for (const slug of MOVED) {
    const f = FOUNDER_LINES[`ship:${slug}`];
    assert.ok(f?.line, `${slug} keeps James's note`);
    assert.ok(!/[–—]/.test(f.line), `${slug}: no em or en dashes`);
    assert.ok(!/\b(I|we) (sailed|was aboard|were aboard|stayed|boarded)\b|\baboard (her|with me)\b/i.test(f.line), "a ship note never claims James sailed her");
  }
});

test("the public pages say stays, and point ships at Timeless Voyages", () => {
  const page = read("app/the-exceptional-few/page.tsx");
  assert.ok(!/stays and ships/i.test(page), "the collection page no longer says stays and ships");
  assert.match(page, /TV_PATH/, "the collection page links to Timeless Voyages");
  assert.ok(!/stays and ships james has chosen/i.test(read("components/home/ExceptionalFewBand.tsx")), "the homepage band says stays");
  assert.match(read("components/ships/TimelessCollection.tsx"), /different from The Exceptional Few/, "Timeless Voyages states the rule");
});

test("the export refuses a live vessel row and a reused number", () => {
  const s = read("scripts/export-editorial-layer.mjs");
  assert.match(s, /The Exceptional Few is stays only/);
  assert.match(s, /Collection numbers 002 and 003 are retired/);
});
