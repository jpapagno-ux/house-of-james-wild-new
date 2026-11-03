import { test } from "node:test";
import assert from "node:assert/strict";
import { applyBp, calculateCommission, commissionableBase, formatBp } from "../lib/platform/commission.ts";

test("the worked example: US$10,000 room at 20%", () => {
  const r = calculateCommission({ basis: "commission", lines: [{ kind: "accommodation", cents: 1_000_000 }], rateBp: 2000 });
  assert.deepEqual(r, { baseCents: 1_000_000, rateBp: 2000, grossCents: 200_000, advisorShareBp: 7000, advisorCents: 140_000, houseCents: 60_000 });
});

test("taxes, fees and Florida sales tax are never commissionable; offers come off first", () => {
  const lines = [
    { kind: "accommodation" as const, cents: 800_000 },
    { kind: "land" as const, cents: 200_000 },
    { kind: "tax" as const, cents: 110_000 },
    { kind: "fee" as const, cents: 5_000 },
    { kind: "sales_tax" as const, cents: 70_000 },
  ];
  assert.equal(commissionableBase(lines, 100_000), 900_000);
  const r = calculateCommission({ basis: "commission", lines, offerCents: 100_000, rateBp: 1700 });
  assert.equal(r.grossCents, 153_000);
  assert.equal(r.advisorCents + r.houseCents, r.grossCents);
});

test("net rates: the margin is the commission", () => {
  const r = calculateCommission({ basis: "net", sellCents: 1_250_000, netCents: 1_000_000 });
  assert.equal(r.grossCents, 250_000);
  assert.equal(r.advisorCents, 175_000);
  assert.equal(r.houseCents, 75_000);
  assert.throws(() => calculateCommission({ basis: "net", sellCents: 1, netCents: 2 }));
});

test("odd cents always tie: advisor + house = gross", () => {
  for (const c of [1, 3, 99, 12_345, 987_653]) {
    const r = calculateCommission({ basis: "commission", lines: [{ kind: "vessel", cents: c }], rateBp: 1750, advisorShareBp: 6500 });
    assert.equal(r.advisorCents + r.houseCents, r.grossCents);
  }
  assert.equal(applyBp(5, 5000), 3);
});

test("overrides and guards", () => {
  const r = calculateCommission({ basis: "commission", lines: [{ kind: "accommodation", cents: 1_000_000 }], rateBp: 2000, advisorShareBp: 8000 });
  assert.equal(r.advisorCents, 160_000);
  assert.throws(() => calculateCommission({ basis: "commission", lines: [], rateBp: 10001 }));
  assert.throws(() => calculateCommission({ basis: "commission", lines: [{ kind: "land", cents: 1.5 }], rateBp: 100 }));
  assert.equal(formatBp(2000), "20%");
  assert.equal(formatBp(1750), "17.50%");
  assert.equal(formatBp(null), "Net");
});

import { parseTermFields } from "../lib/platform/commission.ts";
test("term form: percentages become basis points", () => {
  const g = parseTermFields({ scope: "brand", scopeId: "11111111-2222-3333-4444-555555555555", rate: "17.5", effectiveFrom: "2026-01-01", status: "to_confirm" });
  assert.equal(g.ok && g.value.rateBp, 1750);
  assert.equal(parseTermFields({ rate: "20", effectiveFrom: "2026-01-01" }).ok, true);
  assert.equal(parseTermFields({ rate: "abc", effectiveFrom: "2026-01-01" }).ok, false);
  assert.equal(parseTermFields({ rate: "120", effectiveFrom: "2026-01-01" }).ok, false);
  assert.equal(parseTermFields({ scope: "brand", rate: "20", effectiveFrom: "2026-01-01" }).ok, false);
  assert.equal(parseTermFields({ rate: "20", effectiveFrom: "2026-01-01", effectiveTo: "2025-01-01" }).ok, false);
  const net = parseTermFields({ basis: "net", effectiveFrom: "2026-01-01" });
  assert.equal(net.ok && net.value.rateBp, null);
});
