import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decodeJourney, encodePicks } from "@/lib/checkout/journey";
import { ADVISORS } from "@/lib/content/advisors";

// /api/preview/checkout/cart  (Journey Cart, Session 05: carts saved to the STAGING database)
// POST saves what was chosen and answers with a short token. GET ?token= reads it back.
// It talks only to the staging database named by CHECKOUT_STAGING_SUPABASE_URL (the partner-preview branch,
// James, 19 Nov 2026) and never to the live one. It does not exist on the live site, and it answers
// "not_configured" wherever those two settings are absent. No price, no traveler detail and no payment data
// is stored: every price is asked again from its source when the cart opens.
export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

function staging() {
  if (process.env.VERCEL_ENV === "production") return "closed" as const;
  const url = process.env.CHECKOUT_STAGING_SUPABASE_URL, key = process.env.CHECKOUT_STAGING_SERVICE_ROLE_KEY;
  // A second guard: refuse to run if someone points the staging setting at the live database.
  if (!url || !key || url === process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(req: Request) {
  const sb = staging();
  if (sb === "closed") return json({ error: "Not found" }, 404);
  if (!sb) return json({ error: "not_configured" }, 503);
  const raw = await req.text();
  if (raw.length > 8000) return json({ error: "Request too large" }, 413);
  let body: { code?: unknown; advisor?: unknown };
  try { body = JSON.parse(raw); } catch { return json({ error: "Invalid JSON" }, 400); }
  const picks = typeof body.code === "string" ? decodeJourney(body.code) : null;
  const advisor = ADVISORS.find((a) => !a.sample && a.slug === body.advisor);
  if (!picks || !advisor) return json({ error: "That journey could not be read." }, 422);
  const token = crypto.randomUUID().replace(/-/g, "");
  const { error } = await sb.from("journey_carts").insert({ public_token: token, advisor_slug: advisor.slug, advisor_ledger_id: advisor.ledgerId, status: "sent", picks });
  if (error) return json({ error: "save_failed" }, 502);
  return json({ token });
}

export async function GET(req: Request) {
  const sb = staging();
  if (sb === "closed") return json({ error: "Not found" }, 404);
  if (!sb) return json({ error: "not_configured" }, 503);
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!/^[a-f0-9]{32}$/.test(token)) return json({ error: "not_found" }, 404);
  const { data, error } = await sb.from("journey_carts").select("id, advisor_slug, status, picks, expires_at").eq("public_token", token).maybeSingle();
  if (error) return json({ error: "read_failed" }, 502);
  if (!data || data.status === "expired" || Date.parse(data.expires_at) < Date.now()) return json({ error: "not_found" }, 404);
  const code = encodePicks(data.picks);
  if (!code || !decodeJourney(code)) return json({ error: "not_found" }, 404);
  if (data.status === "sent") await sb.from("journey_carts").update({ status: "opened", opened_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", data.id);
  return json({ code, advisor: data.advisor_slug, status: data.status === "sent" ? "opened" : data.status });
}
