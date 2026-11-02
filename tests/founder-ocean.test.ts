// The founder's surf and dive line (James, 2 Nov 2026): only where he has stated it, never a sailing he has not made.
import { test } from "node:test";
import assert from "node:assert/strict";
import { founderOceanForCountry, founderOceanForPathway, founderOceanForVoyage, SURFED_AND_DIVED } from "../lib/content/founder-ocean.ts";

test("the stated places carry the line; other countries carry none", () => {
  for (const c of ["costa-rica", "bahamas", "ecuador-galapagos", "peru", "panama", "indonesia", "tahiti"]) assert.ok(founderOceanForCountry(c), c);
  assert.match(founderOceanForCountry("tahiti")!, /^Tahiti specialist: .*1995/);
  assert.equal(founderOceanForCountry("kenya"), null);
  assert.equal(founderOceanForCountry(null), null);
  assert.equal(SURFED_AND_DIVED.includes("philippines"), false, "the Philippines is not stated as surfed or dived");
  assert.match(founderOceanForCountry("philippines")!, /44 years/);
});

test("Galápagos ships speak to the place only; Aliikai is the one ship he sailed", () => {
  const g = founderOceanForVoyage("/voyages/ships/hermes-galapagos", "galapagos")!;
  assert.ok(g && !/sail/i.test(g), g);
  assert.match(founderOceanForVoyage("/voyages/ships/aliikai", "indonesia")!, /sailed Aliikai in Raja Ampat in November 2024/);
  assert.equal(founderOceanForVoyage("/voyages/ships/nile-adventurer", "nile"), null);
  assert.equal(founderOceanForVoyage("/voyages/ships/amandira", "indonesia"), null, "never on a ship he has not sailed outside the stated pages");
  assert.ok(founderOceanForPathway("PATH-02"));
  assert.equal(founderOceanForPathway("PATH-04"), null);
});

test("no dashes in any line", () => {
  const lines = [founderOceanForCountry("peru"), founderOceanForCountry("tahiti"), founderOceanForCountry("philippines"), founderOceanForVoyage("/voyages/galapagos"), founderOceanForVoyage("/voyages/indonesia"), founderOceanForVoyage("/voyages/ships/aliikai"), founderOceanForVoyage("/voyages/ships/x", "galapagos")];
  for (const l of lines) assert.ok(l && !/[-‐‑‒–—]/.test(l), String(l));
});
