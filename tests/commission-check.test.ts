import { test } from "node:test";
import assert from "node:assert/strict";
import { checkCommission, parseCheckInput } from "../lib/platform/commission-check.ts";

// Lion Sands Ivory Suite, 3 nights at the estimated 2027 card rate (US$6,840 a night, VAT 15% included).
const ivory = {
  currency: "USD", roomSubtotalMinor: 2_052_000, discountsMinor: 0, grandTotalMinor: 2_052_000,
  charges: [{ kind: "tax", included: true, amountMinor: 267_652 }],
};

test("commission is on the rate less included VAT; the tiers split it to the cent", () => {
  const t2 = checkCommission(ivory, 2000, "tier_2");
  assert.equal(t2.baseCents, 2_052_000 - 267_652);
  assert.equal(t2.grossCents, 356_870);
  assert.equal(t2.advisorCents + t2.houseCents, t2.grossCents);
  assert.equal(t2.advisorShareBp, 7000);
  assert.equal(t2.grossOnInclusiveRateCents, 410_400);
  assert.equal(checkCommission(ivory, 2000, "tier_1").advisorShareBp, 7500);
  assert.equal(checkCommission(ivory, 2000, "tier_3").advisorShareBp, 5500);
  assert.equal(checkCommission(ivory, 2000, null).advisorShareBp, 7000);
});

test("offers come off before commission; house taxes are never in the base", () => {
  const c = checkCommission({ currency: "USD", roomSubtotalMinor: 100_000, discountsMinor: 25_000, grandTotalMinor: 80_250, charges: [{ kind: "house_tax", included: false, amountMinor: 5_250 }] }, 2000, "tier_2");
  assert.equal(c.baseCents, 75_000);
  assert.equal(c.grossCents, 15_000);
  assert.equal(c.advisorCents, 10_500);
  assert.equal(c.houseCents, 4_500);
});

test("form input is checked, with safe defaults", () => {
  const d = parseCheckInput({}, { slug: "lion-sands", arrival: "2027-05-10" });
  assert.deepEqual(d, { slug: "lion-sands", room: "", arrival: "2027-05-10", nights: 3, adults: 2, tier: "tier_2" });
  const x = parseCheckInput({ p: "../etc", room: "ivory-lodge-ivory-suite", arrival: "2027-13", nights: "99", adults: "4", tier: "tier_9" }, { slug: "lion-sands", arrival: "2027-05-10" });
  assert.equal(x.slug, "lion-sands");
  assert.equal(x.room, "ivory-lodge-ivory-suite");
  assert.equal(x.arrival, "2027-05-10");
  assert.equal(x.nights, 3);
  assert.equal(x.adults, 4);
  assert.equal(x.tier, "tier_2");
});
