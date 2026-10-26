import { test } from "node:test";
import assert from "node:assert/strict";
import { suitedTo } from "../lib/ledger/travel-types.ts";

test("travel types come from the record's words", () => {
  assert.deepEqual(suitedTo("Family chalets, kid-friendly game drives and a pool", []).slice(0, 2), ["Families & generations", "Big Five safari"]);
  assert.deepEqual(suitedTo("", []), []);
  assert.ok(suitedTo("Exclusive-use villa for groups of ten").includes("Private groups (exclusive use)"));
  assert.equal(suitedTo("wine wine wine spa", ["family"])[0], "Families & generations");
});
