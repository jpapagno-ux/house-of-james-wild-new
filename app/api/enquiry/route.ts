import { NextResponse } from "next/server";
import { validateEnquiry, type Enquiry } from "@/lib/enquiry";
import { inboxFor } from "@/lib/inbox";
import { enquiryEmail } from "@/lib/enquiry-email";

// POST /api/enquiry: validates an enquiry from /plan and delivers it by
// email through Resend. Live only when ENQUIRY_LIVE=on AND RESEND_API_KEY is
// set; otherwise it answers in preview mode and the form tells the visitor
// to call, so nothing is silently lost.
//
// Env (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY       from resend.com, after jameswildco.com is verified
//   ENQUIRY_FROM         optional; defaults to "James Wild & Co <hello@jameswildco.com>"
//   ENQUIRY_LIVE         "on" to start sending

export async function POST(req: Request) {
  let body: Partial<Enquiry>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true }, { status: 200 }); // honeypot: quietly ignore bots
  const errors = validateEnquiry(body);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const key = process.env.RESEND_API_KEY;
  const to = inboxFor(body) ?? process.env.ENQUIRY_TRIPS_TO ?? null;
  const live = process.env.ENQUIRY_LIVE === "on" && !!key && !!to;
  if (!live) return NextResponse.json({ ok: true, live: false }, { status: 202 });

  const mail = enquiryEmail(body as Enquiry);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.ENQUIRY_FROM ?? "James Wild & Co <hello@jameswildco.com>", to: [to], reply_to: body.email, subject: mail.subject, text: mail.text, html: mail.html }),
  });
  if (!res.ok) {
    console.error("enquiry: resend failed", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ ok: false, error: "Delivery failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, live: true }, { status: 200 });
}
