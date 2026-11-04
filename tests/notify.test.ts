import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingRecorded, decision, money, paymentReceived, requestForHouse, requestReceived, roomHeld } from "../lib/booking-live/notify/emails.ts";

// Booking Live emails: the reference in every subject, the right figures, no
// HTML injection from names or notes, nothing invented when a field is empty.

const stay = { propertyName: "Lion Sands", roomName: "River Lodge Luxury Room", arrival: "2027-06-10", departure: "2027-06-13", adults: 2, children: 0 };
const total = { minor: 1247406, currency: "USD" }, deposit = { minor: 374222, currency: "USD" };

test("money renders minor units in the traveler's currency", () => {
  assert.equal(money(total), "US$12,474.06");
  assert.match(money({ minor: 150000, currency: "ZAR" }), /^R\s?1,500\.00 ZAR$/);
  assert.match(money({ minor: "5000", currency: "JPY" }), /5,000 JPY$/);
});

test("request received: reference, dates, total and deposit, hold-until", () => {
  const m = requestReceived({ first: "Ada", reference: "Q-ABCD1234", stay, total, deposit, expiresAt: "2026-11-04T12:00:00Z", tripsUrl: "https://x/account/trips" });
  assert.match(m.subject, /^Your request Q-ABCD1234 · Lion Sands$/);
  for (const re of [/Dear Ada/, /River Lodge Luxury Room at Lion Sands/, /Thu, Jun 10, 2027 → Sun, Jun 13, 2027/, /2 adults/, /US\$12,474\.06/, /US\$3,742\.22/, /Nov 4, 2026/, /Nothing has been charged/]) assert.match(m.text, re);
  assert.match(m.html, /href="https:\/\/x\/account\/trips"/);
});

test("the house copy names the traveler and the desk", () => {
  const m = requestForHouse({ reference: "Q-ABCD1234", travelerName: "Ada <b>Lovelace</b>", travelerEmail: "ada@example.com", stay, total, deposit, deskUrl: "https://x/desk" });
  assert.match(m.subject, /Request Q-ABCD1234: Ada <b>Lovelace<\/b>/);
  assert.ok(!m.html.includes("<b>Lovelace</b>"), "names are escaped in HTML");
  assert.match(m.html, /&lt;b&gt;Lovelace/);
});

test("held, confirmed, declined", () => {
  const h = roomHeld({ first: null, reference: "Q-1", stay, heldUntil: "2026-11-10T00:00:00Z", note: null, tripsUrl: "u" });
  assert.match(h.subject, /Room on hold until Nov 10, 2026 · Q-1/); assert.match(h.text, /Dear there/);
  const ok = decision({ first: "Ada", reference: "Q-1", stay, decision: "approved", total, deposit, tripsUrl: "u" });
  assert.match(ok.subject, /^Confirmed by the house · Q-1/); assert.match(ok.text, /US\$12,474\.06/);
  const no = decision({ first: "Ada", reference: "Q-1", stay, decision: "declined", total, deposit, tripsUrl: "u" });
  assert.match(no.subject, /aren't available/); assert.ok(!no.text.includes("US$"), "a declined request quotes no money");
});

test("booking recorded: partner reference and balance date only when present; pay link only when payments are on", () => {
  const a = bookingRecorded({ first: "Ada", reference: "B-1", stay, total, deposit, balanceDue: "2027-04-11", partnerRef: "LS-44871", note: null, payUrl: "u", canPayOnline: true });
  assert.match(a.text, /LS-44871/); assert.match(a.text, /balance due Sun, Apr 11, 2027/); assert.match(a.text, /Pay the deposit/);
  const b = bookingRecorded({ first: "Ada", reference: "B-1", stay, total, deposit, balanceDue: null, partnerRef: null, note: null, payUrl: "u", canPayOnline: false });
  assert.ok(!b.text.includes("reference:")); assert.ok(!b.text.includes("balance due")); assert.match(b.text, /send the deposit details/);
});

test("receipt: deposit leaves a balance; the last payment says paid in full", () => {
  const d = paymentReceived({ first: "Ada", reference: "B-1", receipt: "P-9", stay, kind: "deposit", amount: deposit, paid: deposit, outstanding: { minor: 873184, currency: "USD" }, balanceDue: "2027-04-11", tripsUrl: "u" });
  assert.match(d.subject, /^Deposit received · US\$3,742\.22 · B-1/); assert.match(d.text, /US\$8,731\.84 remains, due Sun, Apr 11, 2027/);
  const f = paymentReceived({ first: "Ada", reference: "B-1", receipt: "P-10", stay, kind: "balance", amount: { minor: 873184, currency: "USD" }, paid: total, outstanding: { minor: 0, currency: "USD" }, balanceDue: null, tripsUrl: "u" });
  assert.match(f.text, /paid in full/);
});
