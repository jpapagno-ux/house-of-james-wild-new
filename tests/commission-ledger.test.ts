import { test } from "node:test";
import assert from "node:assert/strict";
import { earningTotals, pct, position, split, totals, type Earning, type Line } from "../lib/platform/commission-ledger.ts";

const line = (o: Partial<Line>): Line => ({ id: "1", ref: "CL-2026-000001", source: "advisor_request", advisor_id: "a", organization_id: "o", property_id: "p", stay_name: "Lion Sands", client_name: "Ana", arrival: "2027-03-10", departure: "2027-03-14", booked_on: "2026-11-07", currency: "USD", sell_minor: 1200000, base_minor: 1000000, rate_bp: 2000, rate_source: "term", gross_minor: 200000, tier: "tier_2", advisor_share_bp: 7000, advisor_minor: 140000, house_minor: 60000, status: "expected", invoiced_on: null, invoice_reference: null, received_on: null, received_reference: null, paid_on: null, paid_reference: null, note: null, advisor_request_id: "r", ...o });

test("the split matches the plan's worked example", () => {
  assert.deepEqual(split(1000000, 2000, 7500), { gross: 200000, advisor: 150000, house: 50000 });
  assert.deepEqual(split(1000000, 2000, 7000), { gross: 200000, advisor: 140000, house: 60000 });
  assert.deepEqual(split(1000000, 2000, 5500), { gross: 200000, advisor: 110000, house: 90000 });
  const odd = split(333333, 1700, 7000);
  assert.equal(odd.advisor + odd.house, odd.gross);
  assert.equal(pct(2000), "20%"); assert.equal(pct(1750), "17.50%");
});

test("totals per currency, never mixing currencies; cancelled left out", () => {
  const t = totals([line({}), line({ id: "2", currency: "ZAR", gross_minor: 500, advisor_minor: 350, house_minor: 150, sell_minor: 3000 }), line({ id: "3", status: "cancelled" })]).get("all")!;
  assert.equal(t.get("USD")!.gross, 200000);
  assert.equal(t.get("USD")!.count, 1);
  assert.equal(t.get("ZAR")!.advisor, 350);
  const p = position([line({}), line({ id: "2", status: "received" }), line({ id: "3", status: "advisor_paid" })]).get("USD")!;
  assert.equal(p.owedToHouse, 200000);
  assert.equal(p.owedToAdvisors, 280000);
  assert.equal(p.paidToAdvisors, 140000);
});

test("the advisor's own totals", () => {
  const e = (o: Partial<Earning>): Earning => ({ id: "1", ref: "x", stay_name: "s", client_name: null, arrival: "2027-01-01", departure: "2027-01-02", booked_on: "2026-11-07", currency: "USD", sell_minor: 0, advisor_minor: 140000, tier: "tier_2", status: "expected", paid_on: null, paid_reference: null, request_id: null, ...o });
  const t = earningTotals([e({}), e({ status: "advisor_paid", advisor_minor: 50000 }), e({ status: "cancelled" })]).get("USD")!;
  assert.deepEqual(t, { coming: 140000, paid: 50000, count: 2 });
});
