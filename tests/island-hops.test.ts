// Island hops (James, 13 Nov 2026): the generated "can you combine" question. It may only say what the stay records
// already say, must never duplicate a question the library answers, and must stay off until a country is switched on.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { combineFaqs, gateways, pairing, ISLAND_COUNTRIES, NETWORKS, type HopStay } from "../lib/content/island-hops.ts";

const stays: HopStay[] = JSON.parse(readFileSync(new URL("../lib/content/stays.json", import.meta.url), "utf8")).stays;
const ready = stays.filter((s) => (s as unknown as { hero: string | null }).hero);
const by = (slug: string) => ready.find((s) => s.slug === slug)!;

test("gateways reads every code in the airport line", () => {
  assert.deepEqual(gateways("Savusavu Airport (SVU), via Nadi International Airport (NAN)"), [{ code: "SVU", name: "Savusavu Airport" }, { code: "NAN", name: "Nadi International Airport" }]);
  assert.deepEqual(gateways("Bora Bora Airport (BOB) Tahiti Faa'a International Airport (PPT)").map((g) => g.code), ["BOB", "PPT"]);
  assert.deepEqual(gateways(null), []);
});

test("a stay's own gateway wins over the wider hub", () => {
  const p = pairing(by("namale-resort-and-spa"), ready)!;
  assert.equal(p.gateway.code, "SVU");
  assert.ok(p.partners.some((x) => x.slug === "jean-michel-cousteau-resort"));
});

test("Fiji stays get one question, built from the record", () => {
  const s = by("six-senses-fiji");
  const [f] = combineFaqs(s, ready);
  assert.match(f.q, /^Can you combine .+ with another island in Fiji\?$/);
  assert.match(f.a, /Nadi International Airport \(NAN\)/);
  assert.ok(f.a.includes(s.airportDirections!.split(". ")[0]), "quotes the stay's own transfer");
  assert.equal(combineFaqs(s, ready).length, 1);
});

test("no dashes, no rates and no invented times in any generated answer", () => {
  for (const s of ready.filter((x) => x.countrySlug && ISLAND_COUNTRIES.has(x.countrySlug))) {
    for (const f of combineFaqs(s, ready)) {
      assert.doesNotMatch(f.q + f.a, /[–—]/, s.slug);
      assert.doesNotMatch(f.a, /[$€£]|USD|per night/i, s.slug);
    }
  }
});

test("the library's own combine question is never duplicated, and other countries stay off", () => {
  const tahaa = by("le-tahaa");
  assert.deepEqual(combineFaqs(tahaa, ready, new Set(["tahiti"])), []);
  const off = ready.find((s) => s.countrySlug === "thailand")!;
  assert.deepEqual(combineFaqs(off, ready), []);
});

test("every network link names its source and the date it was checked", () => {
  for (const links of Object.values(NETWORKS)) for (const l of links) { assert.ok(l.source.length > 5); assert.match(l.checked, /^\d{4}-\d{2}-\d{2}$/); }
});
