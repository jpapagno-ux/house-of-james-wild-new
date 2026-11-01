import { withTraveler, ok, error, jsonBody } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/booking-live/validate";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { isAdvisor } from "@/lib/booking-live/ops";

// POST /api/v1/ops/quotes/:id/hold { heldUntil: ISO datetime, note? }
// Advisor or admin only. Records that the property is HOLDING the room for
// this quote until heldUntil (a hold is the property's word, so it is never
// set from the traveler side). The price stays immutable; approving later
// still needs availability confirmed by the property.
export const dynamic = "force-dynamic";
const MAX_HOLD_DAYS = 30;

export const POST = withTraveler("quotes", async ({ req, sb, user, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  if (!(await isAdvisor(sb, user.id))) return error("forbidden", "Advisors only", requestId);
  const body = (await jsonBody(req)) as { heldUntil?: unknown; note?: unknown } | undefined;
  const until = typeof body?.heldUntil === "string" ? new Date(body.heldUntil) : null;
  if (!until || Number.isNaN(until.getTime())) return error("invalid_input", "heldUntil must be a date-time", requestId);
  const now = new Date();
  if (until <= now || until.getTime() - now.getTime() > MAX_HOLD_DAYS * 86_400_000) return error("invalid_input", `heldUntil must be in the future and within ${MAX_HOLD_DAYS} days`, requestId);
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) : null;

  const admin = supabaseAdmin();
  if (!admin) return error("server_error", "Not configured (server key missing)", requestId);
  const { data: q } = await admin.from("quotes").select("id, advisor_status, expires_at").eq("id", params.id).maybeSingle();
  if (!q) return error("not_found", "Not found", requestId);
  if (q.advisor_status !== "pending" && q.advisor_status !== "held") return error("conflict", `Already ${q.advisor_status}`, requestId);
  const { error: e } = await admin.from("quotes").update({
    advisor_status: "held", held_until: until.toISOString(), hold_note: note, advisor_user_id: user.id,
    // A held quote's price stays valid for as long as the hold, so the 72-hour window extends to the hold.
    expires_at: new Date(Math.max(new Date(q.expires_at).getTime(), until.getTime())).toISOString(),
  }).eq("id", params.id).in("advisor_status", ["pending", "held"]);
  if (e) return e.code === "23514" ? error("conflict", "Holds aren't enabled yet: run supabase/manual/0011b_hold_status.sql", requestId) : error("server_error", "Couldn't record the hold", requestId);
  return ok({ id: params.id, advisor_status: "held", heldUntil: until.toISOString() }, requestId);
});
