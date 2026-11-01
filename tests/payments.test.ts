import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { nextPayment } from "../lib/booking-live/payments/core.ts";
import { verifyStripeSignature } from "../lib/booking-live/payments/webhook.ts";

// Payments: the amount a traveler may pay next is decided by the booking, never
// by the request; the webhook is trusted only with a valid signature.

const b = { status: "confirmed", grand_total_minor: 1247406, deposit_due_minor: 374222, deposit_paid_minor: 0, balance_paid_minor: 0, balance_due_date: "2027-04-11" };

test("deposit first, then the balance, then nothing", () => {
  assert.deepEqual(nextPayment(b), { kind: "deposit", amountMinor: 374222 });
  assert.deepEqual(nextPayment({ ...b, status: "deposit_paid", deposit_paid_minor: 374222 }), { kind: "balance", amountMinor: 873184 });
  assert.deepEqual(nextPayment({ ...b, status: "deposit_paid", deposit_paid_minor: 200000 }), { kind: "deposit", amountMinor: 174222 }, "a part-paid deposit asks for the rest of the deposit");
  assert.equal(nextPayment({ ...b, status: "paid", deposit_paid_minor: 374222, balance_paid_minor: 873184 }), null);
  assert.equal(nextPayment({ ...b, status: "cancelled" }), null);
  assert.deepEqual(nextPayment({ ...b, deposit_due_minor: 0 }), { kind: "balance", amountMinor: 1247406 }, "no deposit on the card → the whole amount is the balance");
});

test("Stripe signature: valid within tolerance, refused when stale, wrong or missing", () => {
  const secret = "whsec_test", payload = '{"id":"evt_1","type":"checkout.session.completed"}', t = 1_800_000_000;
  const sig = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  assert.equal(verifyStripeSignature(payload, `t=${t},v1=${sig}`, secret, t + 10), true);
  assert.equal(verifyStripeSignature(payload, `t=${t},v1=deadbeef,v1=${sig}`, secret, t + 10), true, "any v1 may match");
  assert.equal(verifyStripeSignature(payload, `t=${t},v1=${sig}`, secret, t + 400), false, "older than 5 minutes");
  assert.equal(verifyStripeSignature(payload + " ", `t=${t},v1=${sig}`, secret, t), false, "payload changed");
  assert.equal(verifyStripeSignature(payload, `t=${t},v1=${sig}`, "other", t), false);
  assert.equal(verifyStripeSignature(payload, null, secret, t), false);
});
