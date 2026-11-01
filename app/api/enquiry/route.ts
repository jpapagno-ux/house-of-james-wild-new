import { NextResponse } from "next/server";
import { validateEnquiry, type Enquiry } from "@/lib/enquiry";
import { deliveryFor, parseAdvisorInboxes } from "@/lib/inbox";
import { enquiryEmail } from "@/lib/enquiry-email";
import { advisorRows, config as recordConfig, createRecord, enquiryId, inboxMap, nextSeq, patchDelivery, recordFields } from "@/lib/enquiry-record";

// POST /api/enquiry: validates an enquiry from /plan, writes the enquiry
// record (Airtable, the Advisor Desk's source) and delivers it by email
// through Resend. Email is live only when ENQUIRY_LIVE=on AND RESEND_API_KEY
// is set; otherwise it answers in preview mode and the form tells the visitor
// to call, so nothing is silently lost. The record is written either way when
// the Airtable env is set, so preview-mode enquiries still reach the Desk.
//
// Env (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY               from resend.com, after jameswildco.com is verified
//   ENQUIRY_FROM                 optional; defaults to "James Wild & Co <hello@jameswildco.com>"
//   ENQUIRY_LIVE                 "on" to start sending
//   AIRTABLE_ENQUIRIES_TOKEN     PAT for the Enquiries base (lib/enquiry-record.ts)
//   AIRTABLE_ENQUIRIES_BASE_ID   the base id
//   ADVISOR_INBOXES              fallback "slug=email,…" used only when the Advisors
//                                table can't be read; the table is the source of truth

export async function POST(req: Request) {
  let body: Partial<Enquiry>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true }, { status: 200 }); // honeypot: quietly ignore bots
  const errors = validateEnquiry(body);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });
  const e = body as Enquiry;

  // 1. Who gets it. The Advisors table first; the env var only as a fallback.
  const cfg = recordConfig();
  let inboxes = parseAdvisorInboxes(process.env.ADVISOR_INBOXES);
  let advisorRecordId: string | null = null;
  if (cfg) {
    try {
      const rows = await advisorRows(cfg);
      inboxes = inboxMap(rows);
      advisorRecordId = rows.find((a) => a.slug === (e.context?.advisor ?? "james-papagno"))?.recordId ?? null;
    } catch (err) { console.error("enquiry: advisors table unreadable, using ADVISOR_INBOXES", err); }
  }
  const delivery = deliveryFor(e, inboxes, process.env.ENQUIRY_TRIPS_TO ?? null);
  const key = process.env.RESEND_API_KEY;
  const live = process.env.ENQUIRY_LIVE === "on" && !!key && !!delivery;

  // 2. The record, before the email, so the Desk never misses one.
  const now = new Date();
  let id: string | null = null, recordId: string | null = null;
  if (cfg) {
    try {
      id = enquiryId(now.getFullYear(), await nextSeq(cfg, now.getFullYear()));
      recordId = await createRecord(cfg, recordFields(e, id, now.toISOString(), advisorRecordId, delivery, live ? "sent" : "preview"));
    } catch (err) { console.error("enquiry: record not written", err); id = null; recordId = null; }
  }

  if (!live || !delivery) return NextResponse.json({ ok: true, live: false, id }, { status: 202 });

  // 3. The email, its subject carrying the ENQ ID so replies thread on it.
  const mail = enquiryEmail(e);
  const subject = id ? `${mail.subject} · ${id}`.slice(0, 180) : mail.subject;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.ENQUIRY_FROM ?? "James Wild & Co <hello@jameswildco.com>", to: [delivery.to], ...(delivery.cc.length ? { cc: delivery.cc } : {}), reply_to: e.email, subject, text: mail.text, html: mail.html }),
  });
  if (!res.ok) {
    console.error("enquiry: resend failed", res.status, await res.text().catch(() => ""));
    if (cfg && recordId) await patchDelivery(cfg, recordId, "failed");
    return NextResponse.json({ ok: false, error: "Delivery failed", id }, { status: 502 });
  }
  return NextResponse.json({ ok: true, live: true, id }, { status: 200 });
}
