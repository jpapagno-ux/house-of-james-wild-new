// The balance-due reminder, pure: which bookings are due one, and the email.
// No imports, so plain Node tests it (tests/reminders.test.ts).

export type DueBooking = { id: string; public_reference: string; status: string; balance_due_date: string | null; balance_reminder_sent_at: string | null; grand_total_minor: number | string; deposit_paid_minor: number | string; balance_paid_minor: number | string; currency: string; arrival_date: string; property_name: string; traveler_email: string | null; traveler_first_name: string | null };

const money = (minor: number, currency: string) => { const d = new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2; const s = new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(minor / 10 ** d); return currency === "USD" ? s.replace(/^\$/, "US$") : `${s} ${currency}`; };
const nice = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Bookings whose balance is due within `withinDays` of `today` (YYYY-MM-DD), still owing, not yet reminded, not cancelled. */
export function dueForReminder(rows: DueBooking[], today: string, withinDays = 14): (DueBooking & { outstandingMinor: number; daysLeft: number })[] {
  const t0 = Date.parse(`${today}T00:00:00Z`);
  return rows.flatMap((b) => {
    if (!b.balance_due_date || b.balance_reminder_sent_at || b.status === "cancelled" || b.status === "stayed" || b.status === "paid") return [];
    const outstanding = Number(b.grand_total_minor) - Number(b.deposit_paid_minor) - Number(b.balance_paid_minor);
    if (outstanding <= 0) return [];
    const daysLeft = Math.round((Date.parse(`${b.balance_due_date}T00:00:00Z`) - t0) / 86_400_000);
    if (daysLeft > withinDays) return [];
    return [{ ...b, outstandingMinor: outstanding, daysLeft }];
  });
}

export function balanceReminderEmail(b: DueBooking & { outstandingMinor: number; daysLeft: number }, tripsUrl: string): { subject: string; text: string; html: string } {
  const name = b.traveler_first_name ?? "there";
  const when = b.daysLeft < 0 ? "was due" : b.daysLeft === 0 ? "is due today" : `is due on ${nice(b.balance_due_date!)}`;
  const amount = money(b.outstandingMinor, b.currency);
  const subject = `${b.property_name}: your balance of ${amount} ${b.daysLeft < 0 ? "is overdue" : b.daysLeft === 0 ? "is due today" : `is due ${nice(b.balance_due_date!)}`}`;
  const text = [`Dear ${name},`, "", `The balance on your booking ${b.public_reference} at ${b.property_name} (arriving ${nice(b.arrival_date)}) ${when}: ${amount}.`, "", `Pay it from your trips: ${tripsUrl}`, "", "If you'd rather pay another way, or anything has changed, reply to this email and the house will sort it with you.", "", "James Wild & Co"].join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#2D2A26;max-width:620px"><p style="font:12px/1.4 monospace;letter-spacing:.12em;text-transform:uppercase;color:#8B2525;margin:0 0 6px">Balance due</p><h1 style="font-size:22px;margin:0 0 16px">${esc(b.property_name)} · booking ${esc(b.public_reference)}</h1><p style="font-size:16px">Dear ${esc(name)},</p><p style="font-size:16px">The balance on your booking (arriving ${esc(nice(b.arrival_date))}) ${esc(when)}: <strong>${esc(amount)}</strong>.</p><p style="font-size:16px"><a href="${esc(tripsUrl)}" style="color:#8B2525">Pay it from your trips</a>. If you&rsquo;d rather pay another way, or anything has changed, reply to this email and the house will sort it with you.</p><p style="font-size:12px;color:#8a857d;margin-top:24px">James Wild &amp; Co</p></div>`;
  return { subject, text, html };
}
