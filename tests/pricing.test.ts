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

test("Florida sales tax: 7% added on top of the subtotal, rounded to the dollar", () => {
  const r = priceTrip({ optionPP: 1000, addOnsPP: [], travellers: 2 });
  assert.equal(r.subtotal, 2000);
  assert.equal(r.tax, 0); // no local tax unless the rate excludes it
  assert.equal(r.flTax, 140);
  assert.equal(r.total, 2140);
  assert.equal(r.perPerson, 1070);
});

test("local tax first, then 7% Florida sales tax on subtotal + local tax", () => {
  // e.g. a rate that excludes a 13% local tax
  const r = priceTrip({ optionPP: 1000, addOnsPP: [], travellers: 2, taxRate: 0.13 });
  assert.equal(r.tax, 260);
  assert.equal(r.flTax, 158); // 7% of 2,260 = 158.2
  assert.equal(r.total, 2418);
});

test("deposit and balance always add back to the total", () => {
  const r = priceTrip({ optionPP: 4390, addOnsPP: [150], travellers: 4, taxRate: 0.13 });
  assert.equal(r.deposit + r.balance, r.total);
});
