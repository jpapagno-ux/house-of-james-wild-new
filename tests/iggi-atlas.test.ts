// §D3: the places Iggi names resolve onto the Atlas by Ledger ID first, slug second; Iggi's
// order is kept, duplicates pin once, and anything the Ledger cannot pin is named, not dropped.
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAtlasPlaces, type AtlasPlace } from "../lib/atlas/resolve.ts";

const places: AtlasPlace[] = [
  { slug: "kirkmans-kamp", ledgerId: "STY-2026-000293", name: "Kirkman's Kamp", country: "South Africa", href: "/stays/kirkmans-kamp", lat: -24.8, lng: 31.5 },
  { slug: "cottars-1920s", ledgerId: "STY-2026-000066", name: "Cottar's 1920s Safari Camp", country: "Kenya", href: "/stays/cottars-1920s", lat: -1.6, lng: 35.3 },
  { slug: "no-id-place", ledgerId: null, name: "Unnumbered", country: null, href: "/stays/no-id-place", lat: 0, lng: 0 },
];

test("Ledger ID wins, case-insensitive; slug is the fallback", () => {
  const { fits, unpinned } = resolveAtlasPlaces([{ ledger_id: "sty-2026-000066", slug: "wrong-slug" }, { slug: "kirkmans-kamp" }], places);
  assert.deepEqual(fits.map((f) => f.slug), ["cottars-1920s", "kirkmans-kamp"]);
  assert.deepEqual(unpinned, []);
});

test("Iggi's order is kept and a place named twice pins once", () => {
  const { fits } = resolveAtlasPlaces([{ slug: "kirkmans-kamp" }, { ledger_id: "STY-2026-000293", name: "Kirkman's Kamp" }, { slug: "no-id-place" }], places);
  assert.deepEqual(fits.map((f) => f.slug), ["kirkmans-kamp", "no-id-place"]);
});

test("a place the Ledger cannot pin is reported by name, never silently dropped", () => {
  const { fits, unpinned } = resolveAtlasPlaces([{ name: "Somewhere Iggi read about", slug: "not-in-ledger" }, { slug: "cottars-1920s" }, { slug: "also-missing" }], places);
  assert.deepEqual(fits.map((f) => f.slug), ["cottars-1920s"]);
  assert.deepEqual(unpinned, ["Somewhere Iggi read about"]);
});
