import { error, jsonBody, newRequestId, rateLimited } from "@/lib/booking-live/api";
import { supabaseServer } from "@/lib/booking-live/supabase/server";
import { invalid, ok } from "@/lib/platform/api";
import { PARTNER_DESK } from "@/lib/platform/flags";
import { parseApplication } from "@/lib/platform/validate";

// POST /api/v1/partner/apply — a property or operator asks to join. No account is
// created (no self-signup, D-10): the application waits for the house, who invites.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = newRequestId();
  if (!PARTNER_DESK) return error("feature_off", "Not found", requestId);
  if (rateLimited(req, 5)) return error("rate_limited", "Too many requests, try again in a minute", requestId);
  const body = await jsonBody(req);
  if (body && typeof body === "object" && (body as { company?: unknown }).company) return ok({ received: true }, requestId); // honeypot
  const p = parseApplication(body);
  if (!p.ok) return invalid(p, requestId);
  const sb = await supabaseServer();
  const { error: e } = await sb.from("partner_applications").insert(p.value);
  if (e) { console.error(JSON.stringify({ requestId, apply: e.code })); return error("server_error", "We couldn't file that just now. Please try again.", requestId); }
  return ok({ received: true }, requestId, 201);
}
