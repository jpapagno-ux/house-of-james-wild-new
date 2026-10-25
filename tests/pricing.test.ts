// Run: node --experimental-strip-types --test tests/pricing.test.ts
// The two "test before deploy" cases from the audit addendum. Option and
// add-on prices are examples: only their per-person sum is fixed by the
// addendum totals (Land 7,045 pp; Voyage 4,540 pp).
import { test } from "node:test";
import assert from "node:assert/strict";
import { priceTrip } from "../lib/pricing.ts";

test("Land: As filed × 3 + turtle walk → US$22,614, deposit US$1,500", () => {
  const r = priceTrip({ optionPP: 6950, addOnsPP: [95], travellers: 3 });
  assert.equal(r.total, 22614);
  assert.equal(r.deposit, 1500);
  assert.equal(r.balance, 21114);
});

test("Voyage: Family cabin × 4 + Sorong night → US$19,431, deposit US$2,000", () => {
  const r = priceTrip({ optionPP: 4390, addOnsPP: [150], travellers: 4 });
  assert.equal(r.total, 19431);
  assert.equal(r.deposit, 2000);
  assert.equal(r.balance, 17431);
});

test("tax is 7% of the subtotal, rounded to the dollar", () => {
  const r = priceTrip({ optionPP: 1000, addOnsPP: [], travellers: 2 });
  assert.equal(r.subtotal, 2000);
  assert.equal(r.tax, 140);
  assert.equal(r.total, 2140);
  assert.equal(r.perPerson, 1070);
});
