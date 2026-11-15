// Run: node --experimental-strip-types --test tests/pricing.test.ts
// The two "test before deploy" cases from the audit addendum. Option and
// add-on prices are examples: only their per-person sum is fixed by the
// addendum totals (Land 7,045 pp; Voyage 4,540 pp). Totals carry no Florida sales tax (James, 15 Nov 2026).
import { test } from "node:test";
import assert from "node:assert/strict";
import { priceTrip } from "../lib/pricing.ts";

test("Land: As filed × 3 + turtle walk → US$21,135, deposit US$1,500", () => {
  const r = priceTrip({ optionPP: 6950, addOnsPP: [95], travellers: 3 });
  assert.equal(r.total, 21135);
  assert.equal(r.deposit, 1500);
  assert.equal(r.balance, 19635);
});

test("Voyage: Family cabin × 4 + Sorong night → US$18,160, deposit US$2,000", () => {
  const r = priceTrip({ optionPP: 4390, addOnsPP: [150], travellers: 4 });
  assert.equal(r.total, 18160);
  assert.equal(r.deposit, 2000);
  assert.equal(r.balance, 16160);
});

test("no Florida sales tax is added (James, 15 Nov 2026): the total is the subtotal", () => {
  const r = priceTrip({ optionPP: 1000, addOnsPP: [], travellers: 2 });
  assert.equal(r.subtotal, 2000);
  assert.equal(r.tax, 0); // no local tax unless the rate excludes it
  assert.equal(r.flTax, 0);
  assert.equal(r.total, 2000);
  assert.equal(r.perPerson, 1000);
});

test("a local tax the rate excludes is added; nothing else is", () => {
  // e.g. a rate that excludes a 13% local tax
  const r = priceTrip({ optionPP: 1000, addOnsPP: [], travellers: 2, taxRate: 0.13 });
  assert.equal(r.tax, 260);
  assert.equal(r.flTax, 0);
  assert.equal(r.total, 2260);
});

test("deposit and balance always add back to the total", () => {
  const r = priceTrip({ optionPP: 4390, addOnsPP: [150], travellers: 4, taxRate: 0.13 });
  assert.equal(r.deposit + r.balance, r.total);
});
