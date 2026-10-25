import { NextResponse } from "next/server";
import { validateEnquiry, type Enquiry } from "@/lib/enquiry";

// POST /api/enquiry: validates an enquiry from /plan. Delivery to the house
// inbox (email provider + CRM) is connected at launch, once the house email
// addresses are confirmed; until ENQUIRY_LIVE is "on" the route validates and
// answers in preview mode so nothing is silently lost.
export async function POST(req: Request) {
  let body: Partial<Enquiry>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true }, { status: 200 }); // honeypot: quietly ignore bots
  const errors = validateEnquiry(body);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });
  const live = process.env.ENQUIRY_LIVE === "on";
  // TODO(launch): send to the house inbox and the library's enquiry log here.
  return NextResponse.json({ ok: true, live }, { status: live ? 200 : 202 });
}
