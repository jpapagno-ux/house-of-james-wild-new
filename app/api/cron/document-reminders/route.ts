import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { reminderEmail } from "@/lib/platform/commercial";
import { today } from "@/lib/dates";

// GET /api/cron/document-reminders — the daily expiry reminder (D-26, James, 3 Nov 2026: "a reminder
// once expired goes to the email contact on file, automatically").
// For every active partner document with an expiry date: an email 60 days before, 30 days before and
// on the day it expires, each sent once (logged in private.document_reminders). It goes to the
// partner's admins and its general email; contracts and rate documents are copied to the house.
//
// Off unless DOC_REMINDERS=on. Called by Vercel Cron with "Authorization: Bearer $CRON_SECRET".
// Needs SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ENQUIRY_FROM, optional DOC_REMINDER_HOUSE_EMAIL.
// Test addresses (.test) are never emailed. ?dry=1 lists what would be sent without sending.
export const dynamic = "force-dynamic";

type Due = { document_id: string; organization: string; kind: string; title: string; expires_on: string; stage: string; recipients: string[] };

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (process.env.DOC_REMINDERS !== "on") return NextResponse.json({ ok: true, off: true, sent: 0 });
  const sb = supabaseAdmin();
  const key = process.env.RESEND_API_KEY, from = process.env.ENQUIRY_FROM;
  if (!sb || !key || !from) return NextResponse.json({ ok: false, message: "Reminders are not configured" }, { status: 503 });
  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const { data, error } = await sb.rpc("document_reminders_due", { p_on: today() });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const house = process.env.DOC_REMINDER_HOUSE_EMAIL ?? null;
  const link = `${new URL(req.url).origin}/partner/documents`;
  const results: { document: string; stage: string; to: number; sent: boolean }[] = [];
  for (const d of (data ?? []) as Due[]) {
    const to = d.recipients.filter((e) => !e.endsWith(".test"));
    const cc = house && (d.kind === "contract" || d.kind === "commercial") ? [house] : [];
    if (!to.length && !cc.length) { results.push({ document: d.document_id, stage: d.stage, to: 0, sent: false }); continue; }
    if (dry) { results.push({ document: d.document_id, stage: d.stage, to: to.length + cc.length, sent: false }); continue; }
    const m = reminderEmail({ organization: d.organization, title: d.title, kind: d.kind, expiresOn: d.expires_on, stage: d.stage, link });
    let sent = false;
    try {
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({ from, to: to.length ? to : cc, cc: to.length && cc.length ? cc : undefined, subject: m.subject, text: m.text, html: m.html }) });
      sent = r.ok;
      if (!r.ok) console.error(JSON.stringify({ job: "document-reminders", document: d.document_id, resend: r.status }));
    } catch (x) { console.error(JSON.stringify({ job: "document-reminders", document: d.document_id, error: x instanceof Error ? x.message : String(x) })); }
    // Logged only once sent, so a failed send is retried tomorrow.
    if (sent) await sb.rpc("document_reminder_sent", { p_document: d.document_id, p_stage: d.stage, p_to: [...to, ...cc] });
    results.push({ document: d.document_id, stage: d.stage, to: to.length + cc.length, sent });
  }
  return NextResponse.json({ ok: true, dry, due: results.length, sent: results.filter((r) => r.sent).length, results });
}
