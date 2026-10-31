import { NextResponse } from "next/server";
import { validateApplication, applicationNotes, type Application } from "@/lib/advisors/application";
import { signEmbedToken } from "@/lib/iggi/embed-token";
import { IGGI_CORE_ORIGIN } from "@/lib/iggi/flag";

// POST /api/advisors/apply — an advisor's application to carry the Ledger.
// Filed as an AdvisorLead in the Iggi Core (the house's desk sees it there),
// and mailed to the house inbox when enquiries are live. The Core call is
// server-to-server with the same embed token the Iggi panel uses, so the
// secret never reaches the browser. Answers 202 (preview) when neither
// channel is configured, so the form says so rather than losing it.
export const dynamic = "force-dynamic";

const ORIGIN = "https://house-of-james-wild-new.vercel.app";

export async function POST(req: Request) {
  let body: Partial<Application>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true }, { status: 200 }); // honeypot
  const errors = validateApplication(body);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });
  const a = body as Application;
  const notes = applicationNotes(a);
  let filed = false, mailed = false;

  // 1. The Core: an AdvisorLead with the whole application in its notes.
  const secret = process.env.IGGI_EMBED_SECRET;
  if (secret) {
    try {
      const r = await fetch(`${IGGI_CORE_ORIGIN}/functions/createAdvisorLead`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: a.name, email: a.email, phone: a.phone || null, specialty: [...a.specialties, ...a.volumes.map((v) => `Volume: ${v}`)].join(", ").slice(0, 500), notes, source: "site_application", source_page: "/for-advisors/apply", parent_origin: ORIGIN, embed_token: signEmbedToken(ORIGIN, secret) }),
      });
      filed = r.ok;
      if (!r.ok) console.error("advisor apply: core refused", r.status, await r.text().catch(() => ""));
    } catch (e) { console.error("advisor apply: core unreachable", e instanceof Error ? e.message : String(e)); }
  }

  // 2. The inbox, when enquiries are live.
  const key = process.env.RESEND_API_KEY, to = process.env.ENQUIRY_ADVISORS_TO ?? process.env.ENQUIRY_TRIPS_TO ?? null;
  if (process.env.ENQUIRY_LIVE === "on" && key && to) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.ENQUIRY_FROM ?? "James Wild & Co <hello@jameswildco.com>", to: [to], reply_to: a.email, subject: `Advisor application: ${a.name}${a.base ? ` · ${a.base}` : ""}`, text: `${a.name} <${a.email}>${a.phone ? ` · ${a.phone}` : ""}\n\n${notes}\n\nFiled in the Iggi Core: ${filed ? "yes" : "no"}` }),
      });
      mailed = r.ok;
    } catch { mailed = false; }
  }

  if (!filed && !mailed) return NextResponse.json({ ok: true, live: false }, { status: 202 });
  return NextResponse.json({ ok: true, live: true, filed, mailed }, { status: 200 });
}
