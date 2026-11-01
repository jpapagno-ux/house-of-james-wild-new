// /api/v1/compass/read input: the adapter's vocabulary or nothing (Stage 4, D24).
import { test } from "node:test";
import assert from "node:assert/strict";
import { toReading } from "../lib/compass/reading.ts";
import { SETTING_TO_PATHWAY } from "../lib/compass/pathway-adapter.ts";

test("the reading vocabulary mirrors the adapter", () => {
  for (const s of Object.keys(SETTING_TO_PATHWAY)) assert.deepEqual(toReading({ settings: s }).reading.settings, [s]);
});

test("a query string becomes a Reading; unknown values are dropped and named", () => {
  const { reading, ignored } = toReading({ party: "family", settings: "rainforest,ocean,castle", season: "green", pace: "slow", interests: "Surfing, birding", conservation: "1" });
  assert.deepEqual(reading, { party: "family", settings: ["rainforest", "ocean"], season: "green", interests: ["surfing", "birding"], conservation: true });
  assert.deepEqual(ignored, ["settings:castle", "pace:slow"]);
});

test("JSON arrays and booleans read the same way; an empty reading is allowed", () => {
  assert.deepEqual(toReading({ settings: ["wildlife"], culture: true, privacy: "private_house" }).reading, { settings: ["wildlife"], privacy: "private_house", culture: true });
  assert.deepEqual(toReading({}).reading, {});
  assert.equal(toReading({ interests: Array.from({ length: 12 }, (_, i) => `i${i}`) }).reading.interests?.length, 8, "interests capped");
});
