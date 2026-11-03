import { test } from "node:test";
import assert from "node:assert/strict";
import { ibanChecksum, maskNumber, parseBankAccount, parseCurrencies, parsePolicy, reminderEmail } from "../lib/platform/commercial.ts";
import { advisorShareForTier, calculateCommission } from "../lib/platform/commission.ts";

test("advisor tiers: 75 / 70 / 55, Tier 2 by default", () => {
  const sale = (tier: Parameters<typeof advisorShareForTier>[0]) =>
    calculateCommission({ basis: "commission", lines: [{ kind: "accommodation", cents: 1_000_000 }], rateBp: 2000, advisorShareBp: advisorShareForTier(tier) });
  assert.deepEqual([sale("tier_1").advisorCents, sale("tier_1").houseCents], [150_000, 50_000]);
  assert.deepEqual([sale("tier_2").advisorCents, sale("tier_2").houseCents], [140_000, 60_000]);
  assert.deepEqual([sale("tier_3").advisorCents, sale("tier_3").houseCents], [110_000, 90_000]);
  assert.equal(advisorShareForTier(null), 7000);
});

test("currencies: one main, up to six others, from the list", () => {
  assert.deepEqual(parseCurrencies({ primaryCurrency: "zar", otherCurrencies: ["USD", "usd", "ZAR", "EUR"] }), { ok: true, value: { primary_currency: "ZAR", other_currencies: ["USD", "EUR"] } });
  assert.equal(parseCurrencies({ primaryCurrency: "XXX" }).ok, false);
  assert.equal(parseCurrencies({ primaryCurrency: "USD", otherCurrencies: ["ABC"] }).ok, false);
});

test("banking: IBAN checksum, SWIFT shape, one of number or IBAN", () => {
  assert.equal(ibanChecksum("GB82WEST12345698765432"), true);
  assert.equal(ibanChecksum("GB82WEST12345698765433"), false);
  const base = { currency: "ZAR", accountHolder: "Leeu Collection (Pty) Ltd", bankName: "Bank", bankCountry: "za" };
  assert.equal(parseBankAccount(base).ok, false);
  assert.equal(parseBankAccount({ ...base, iban: "GB82 WEST 1234 5698 7654 33" }).ok, false);
  const ok = parseBankAccount({ ...base, accountNumber: "62 1234 5678", swiftBic: "fir nza jj", routingCode: "250655" });
  assert.equal(ok.ok && ok.value.bank_country, "ZA");
  assert.equal(ok.ok && ok.value.swift_bic, "FIRNZAJJ");
  assert.equal(parseBankAccount({ ...base, accountNumber: "1234", swiftBic: "ABC" }).ok, false);
  assert.equal(maskNumber("62 1234 5678"), "…5678");
});

test("policies: text or a document", () => {
  assert.equal(parsePolicy({ kind: "cancellation" }).ok, false);
  assert.equal(parsePolicy({ kind: "other", body: "x" }).ok, false);
  const p = parsePolicy({ kind: "refund", body: "Deposits refundable up to 90 days before arrival." });
  assert.equal(p.ok && p.value.kind, "refund");
});

test("reminder email", () => {
  const e = reminderEmail({ organization: "Leeu Collection", title: "Agency agreement 2027", kind: "contract", expiresOn: "2027-03-01", stage: "30_days", link: "https://x.test/partner/documents" });
  assert.match(e.subject, /expires within a month/);
  assert.match(e.text, /1 March 2027/);
  assert.ok(!/[–—]/.test(e.text + e.html), "no em or en dashes");
});
