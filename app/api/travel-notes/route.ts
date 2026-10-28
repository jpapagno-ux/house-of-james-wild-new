import { NextResponse } from "next/server";

// POST /api/travel-notes: adds an email to the Travel Notes list (Resend Audiences).
// Live only when TRAVEL_NOTES_LIVE=on, RESEND_API_KEY and RESEND_AUDIENCE_ID are set
// in Vercel; until then it answers in preview mode and the form says so, so no
// address is silently dropped. Nothing is stored in this app.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: { email?: string; source?: string; website?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true }, { status: 200 }); // honeypot
  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 422 });

  const key = process.env.RESEND_API_KEY, audience = process.env.RESEND_AUDIENCE_ID;
  if (process.env.TRAVEL_NOTES_LIVE !== "on" || !key || !audience) return NextResponse.json({ ok: true, live: false }, { status: 202 });

  const res = await fetch(`https://api.resend.com/audiences/${audience}/contacts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, unsubscribed: false }),
  });
  if (!res.ok && res.status !== 409) return NextResponse.json({ ok: false, error: "We couldn't add you just now. Please try again." }, { status: 502 });
  return NextResponse.json({ ok: true, live: true }, { status: 200 });
}
