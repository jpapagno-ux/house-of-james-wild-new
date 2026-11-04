import { test } from "node:test";
import assert from "node:assert/strict";
import { isEstimateSeason, seasonLabel, tbcNote } from "../lib/booking-live/estimates.ts";

test("estimated seasons are recognised and cleaned for travelers", () => {
  assert.equal(isEstimateSeason("Standard 2027 (library from-rate x2, verify)"), true);
  assert.equal(isEstimateSeason("Standard 2027 (library from-rate, whole residence, verify)"), true);
  assert.equal(isEstimateSeason("High"), false);
  assert.equal(isEstimateSeason("Festive (Dec 20 to Jan 5)"), false);
  assert.equal(isEstimateSeason(null), false);
  assert.equal(seasonLabel("Standard 2027 (library from-rate x2, verify)"), "Standard 2027");
  assert.equal(seasonLabel("High"), "High");
  assert.equal(seasonLabel("Festive (Dec 20 to Jan 5)"), "Festive (Dec 20 to Jan 5)");
  assert.doesNotMatch(tbcNote("Lion Sands Reserve"), /[–—]/);
});
