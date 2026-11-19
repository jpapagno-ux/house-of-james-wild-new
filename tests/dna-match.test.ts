import { test } from "node:test";
import assert from "node:assert/strict";
import { matchAdvisors, answered, type AdvisorDnaLike } from "../lib/dna/match.ts";
import { DNA_PATHWAY_NAMES, DNA_PARTY_LABELS, DNA_VOLUME_LABELS, DNA_SPECIALTIES, DNA_QUESTIONS } from "../lib/dna/vocabulary.ts";
import { DNA_PATHWAYS, DNA_PARTIES, DNA_VOLUMES } from "../lib/platform/advisor-dna.ts";
import { APPLY_SPECIALTIES } from "../lib/advisors/application.ts";

const base: AdvisorDnaLike = { slug: "x", pathways: [], countries: [], volumes: [], specialties: [], partyTypes: [], languages: ["English"], availability: "open", confirmed: true, markedCountries: [] };
const anthony: AdvisorDnaLike = { ...base, slug: "anthony-papagno", pathways: ["PATH-02", "PATH-04"], countries: ["indonesia"], volumes: ["voyages"], specialties: ["Islands & reefs"], markedCountries: ["indonesia"], confirmed: false };
const kristina: AdvisorDnaLike = { ...base, slug: "kristina-larson", pathways: ["PATH-02"], countries: ["fiji"], volumes: ["stays"], partyTypes: ["family"] };

test("the vocabulary is the same on both sides", () => {
  assert.deepEqual(DNA_PATHWAY_NAMES.map((p) => p[0]), [...DNA_PATHWAYS]);
  assert.deepEqual(DNA_VOLUME_LABELS, DNA_VOLUMES);
  assert.deepEqual(DNA_PARTY_LABELS, DNA_PARTIES);
  assert.deepEqual([...APPLY_SPECIALTIES], [...DNA_SPECIALTIES]);
  assert.equal(DNA_QUESTIONS.length, 6);
});

test("first-hand place outranks a shared Pathway", () => {
  const r = matchAdvisors({ pathways: ["PATH-02"], countries: ["indonesia"], volumes: ["voyages"], specialties: ["Islands & reefs"], party: "couple", language: "English" }, [kristina, anthony]);
  assert.equal(r[0].slug, "anthony-papagno");
  assert.equal(r[0].rows.find((x) => x.id === "where")?.firstHand, true);
  assert.equal(r[1].slug, "kristina-larson");
});

test("gates: closed advisors and other languages are never offered; language alone is no match", () => {
  assert.equal(matchAdvisors({ pathways: ["PATH-02"] }, [{ ...anthony, availability: "closed" }]).length, 0);
  assert.equal(matchAdvisors({ pathways: ["PATH-02"], language: "Spanish" }, [anthony]).length, 0);
  assert.equal(matchAdvisors({ language: "English" }, [anthony]).length, 0);
});

test("answered counts the questions the traveller answered", () => {
  assert.equal(answered({ pathways: ["PATH-01"], party: "solo" }), 2);
});
