import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { balanceReminderEmail, dueForReminder, type DueBooking } from "@/lib/booking-live/reminders";

// GET /api/v1/internal/reminders/balance-due — Vercel Cron (CRON_SECRET) or a
// manual call with BOOKING_LIVE_SYNC_SECRET. Sends one reminder per booking
// whose balance is due within 14 days and still owing, through Resend when
// RESEND_API_KEY is set; otherwise logs what it would send (dry run) and marks
// nothing. Idempotent: balance_reminder_sent_at is set on send.
export const dynamic = "force-dynamic";
const WITHIN_DAYS = 14;

function authorized(req: Request) {
  const got = req.headers.get("authorization") ?? "";
  return [process.env.BOOKING_LIVE_SYNC_SECRET, process.env.CRON_SECRET].some((s) => s && got === `Bearer ${s}`);
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "not configured" }, { status: 500 });
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + WITHIN_DAYS * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await admin.from("bookings").select("id, public_reference, status, balance_due_date, balance_reminder_sent_at, grand_total_minor, deposit_paid_minor, balance_paid_minor, currency, arrival_date, traveler_user_id, property:properties(name)").in("status", ["confirmed", "deposit_paid"]).is("balance_reminder_sent_at", null).lte("balance_due_date", horizon).limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = [...new Set((data ?? []).map((r) => r.traveler_user_id as string))];
  const { data: people } = ids.length ? await admin.from("profiles").select("id, email, first_name").in("id", ids) : { data: [] };
  const person = new Map((people ?? []).map((p) => [p.id as string, p]));
  const rows: DueBooking[] = (data ?? []).map((r) => ({ ...(r as unknown as DueBooking), property_name: (r.property as unknown as { name: string } | null)?.name ?? "your stay", traveler_email: person.get(r.traveler_user_id as string)?.email ?? null, traveler_first_name: person.get(r.traveler_user_id as string)?.first_name ?? null }));
  const due = dueForReminder(rows, today, WITHIN_DAYS);
  const key = process.env.RESEND_API_KEY, from = process.env.ENQUIRY_FROM ?? "James Wild & Co <hello@jameswildco.com>";
  const tripsUrl = `${new URL(req.url).origin}/account/trips`;
  const sent: string[] = [], skipped: string[] = [], dry: string[] = [];
  for (const b of due) {
    if (!b.traveler_email) { skipped.push(`${b.public_reference}: no email`); continue; }
    const mail = balanceReminderEmail(b, tripsUrl);
    if (!key) { dry.push(`${b.public_reference} → ${b.traveler_email}: ${mail.subject}`); continue; }
    const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [b.traveler_email], reply_to: process.env.ENQUIRY_TO ?? undefined, subject: mail.subject, text: mail.text, html: mail.html }), signal: AbortSignal.timeout(15_000) });
    if (!res.ok) { skipped.push(`${b.public_reference}: resend ${res.status}`); continue; }
    await admin.from("bookings").update({ balance_reminder_sent_at: new Date().toISOString() }).eq("id", b.id);
    sent.push(b.public_reference);
  }
  return NextResponse.json({ today, withinDays: WITHIN_DAYS, candidates: due.length, sent, skipped, dryRun: key ? undefined : dry });
}
