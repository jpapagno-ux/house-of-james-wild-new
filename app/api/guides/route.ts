import { NextResponse } from "next/server";
import { guideByKey } from "@/lib/content/field-guides";

// POST /api/guides: a traveller asks for a field guide with their email address.
// The guide's links come back at once (download and print). The address goes to Klaviyo when
// GUIDES_LIVE=on and KLAVIYO_PRIVATE_KEY + KLAVIYO_LIST_ID are set in Vercel: the profile is
// subscribed to the list and a "Requested Field Guide" event is recorded with the guide's links,
// so a Klaviyo flow on that metric can email the guide. Until then it answers in preview mode
// (live: false) and the card says sign-ups open at launch. Nothing is stored in this app.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const KLAVIYO = "https://a.klaviyo.com/api";
const REV = "2024-10-15";

export async function POST(req: Request) {
  let body: { email?: string; guide?: string; edition?: string; source?: string; website?: string; consent?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ ok: true }, { status: 200 }); // honeypot
  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 422 });
  const g = guideByKey(body.guide ?? "");
  if (!g) return NextResponse.json({ ok: false, error: "That guide isn't on file." }, { status: 404 });
  const edition = body.edition === "quick" && g.quick ? "quick" : "full";
  const file = edition === "quick" ? g.quick! : g.full;
  const links = { url: file.url, print: edition === "full" && g.print ? g.print.url : file.url };

  const key = process.env.KLAVIYO_PRIVATE_KEY, list = process.env.KLAVIYO_LIST_ID;
  if (process.env.GUIDES_LIVE !== "on" || !key || !list) return NextResponse.json({ ok: true, live: false, ...links }, { status: 202 });

  const headers = { Authorization: `Klaviyo-API-Key ${key}`, revision: REV, "Content-Type": "application/json", accept: "application/json" };
  const source = String(body.source ?? "site").slice(0, 120);
  try {
    // Subscribe to the list (email marketing consent is given by the form's line under the button).
    const sub = await fetch(`${KLAVIYO}/profile-subscription-bulk-create-jobs`, {
      method: "POST", headers,
      body: JSON.stringify({ data: { type: "profile-subscription-bulk-create-job", attributes: { custom_source: `Field guide · ${g.place}`, profiles: { data: [{ type: "profile", attributes: { email, subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } } } }] } }, relationships: { list: { data: { type: "list", id: list } } } } }),
    });
    // The request itself, for the flow that emails the guide and for segmenting by place.
    const ev = await fetch(`${KLAVIYO}/events`, {
      method: "POST", headers,
      body: JSON.stringify({ data: { type: "event", attributes: {
        properties: { guide: g.title, guide_key: g.key, place: g.place, edition, guide_url: links.url, print_url: links.print, page: source },
        metric: { data: { type: "metric", attributes: { name: "Requested Field Guide" } } },
        profile: { data: { type: "profile", attributes: { email, properties: { last_field_guide: g.title } } } },
      } } }),
    });
    if (!sub.ok || !ev.ok) return NextResponse.json({ ok: true, live: true, emailed: false, ...links }, { status: 200 });
    return NextResponse.json({ ok: true, live: true, emailed: true, ...links }, { status: 200 });
  } catch {
    // The traveller still gets the guide; the sign-up is the part that failed.
    return NextResponse.json({ ok: true, live: true, emailed: false, ...links }, { status: 200 });
  }
}
