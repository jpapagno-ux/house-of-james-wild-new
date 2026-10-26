import { test } from "node:test";
import assert from "node:assert/strict";
import { houseNote } from "../lib/ledger/house-notes.ts";

test("house notes are specific, signed and stable", () => {
  const a = houseNote({ key: "stay:x", name: "Camp X", bestMonths: "May to September", airport: "Skukuza Airport", suited: ["Big Five safari"], rooms: ["Luxury Tent"] });
  assert.ok(a.script.endsWith(" JW"));
  assert.deepEqual(a, houseNote({ key: "stay:x", name: "Camp X", bestMonths: "May to September", airport: "Skukuza Airport", suited: ["Big Five safari"], rooms: ["Luxury Tent"] }));
  const lines = new Set(["a", "b", "c", "d", "e", "f"].map((k) => houseNote({ key: k, name: "N", bestMonths: "June", suited: ["Beach & ocean"] }).script));
  assert.ok(lines.size > 1, "rotates across places");
});
