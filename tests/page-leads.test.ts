import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGE_LEADS, leadForPath, planFor } from "../lib/content/page-leads.ts";

test("Indonesia pages plan with Anthony; others with James", () => {
  assert.equal(leadForPath("/destinations/asia/indonesia")?.first, "Anthony");
  assert.equal(leadForPath("/destinations/asia/indonesia/raja-ampat")?.first, "Anthony");
  assert.equal(leadForPath("/voyages/ships/aliikai")?.first, "Anthony");
  assert.equal(leadForPath("/voyages/indonesia/charter-week-1")?.first, "Anthony");
  assert.equal(leadForPath("/destinations/africa/botswana"), null);
  assert.equal(planFor("/stays").label, "Plan with James");
});

test("every lead names a country and at least one path", () => {
  for (const l of PAGE_LEADS) { assert.ok(l.country && l.paths.length && l.advisor && l.first); }
});
