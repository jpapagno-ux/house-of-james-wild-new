import { test } from "node:test";
import assert from "node:assert/strict";
import { balanceReminderEmail, dueForReminder } from "../lib/booking-live/reminders.ts";

const b = { id: "1", public_reference: "B-ABC12345", status: "deposit_paid", balance_due_date: "2027-04-11", balance_reminder_sent_at: null, grand_total_minor: 1247406, deposit_paid_minor: 374222, balance_paid_minor: 0, currency: "USD", arrival_date: "2027-06-10", property_name: "Lion Sands Reserve", traveler_email: "t@example.com", traveler_first_name: "Miriam" };

test("a reminder is due inside the window, once, only while something is owed", () => {
  assert.equal(dueForReminder([b], "2027-03-30").length, 1, "12 days out");
  assert.equal(dueForReminder([b], "2027-03-20").length, 0, "22 days out");
  assert.equal(dueForReminder([b], "2027-04-15")[0].daysLeft, -4, "overdue still reminds");
  assert.equal(dueForReminder([{ ...b, balance_reminder_sent_at: "2027-03-30T09:00:00Z" }], "2027-04-01").length, 0, "already sent");
  assert.equal(dueForReminder([{ ...b, balance_paid_minor: 873184 }], "2027-04-01").length, 0, "nothing owed");
  assert.equal(dueForReminder([{ ...b, status: "cancelled" }], "2027-04-01").length, 0);
  assert.equal(dueForReminder([{ ...b, balance_due_date: null }], "2027-04-01").length, 0);
});

test("the email names the booking, the amount and the date, and links to Trips", () => {
  const m = balanceReminderEmail({ ...b, outstandingMinor: 873184, daysLeft: 12 }, "https://jameswildco.com/account/trips");
  assert.match(m.subject, /Lion Sands Reserve: your balance of US\$8,731\.84 is due Sunday, April 11, 2027/);
  assert.match(m.text, /Dear Miriam/); assert.match(m.text, /B-ABC12345/); assert.match(m.html, /account\/trips/);
  assert.match(balanceReminderEmail({ ...b, outstandingMinor: 1, daysLeft: 0 }, "x").subject, /due today/);
  assert.match(balanceReminderEmail({ ...b, outstandingMinor: 1, daysLeft: -3 }, "x").subject, /overdue/);
});
