import { withTraveler, ok, error, jsonBody } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/booking-live/validate";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";

// POST /api/v1/ops/quotes/:id/approve { decision: "approved" | "declined", note?, availability? }
// Advisor or admin only (organization role, checked server-side). Approving
// records that the house confirmed price AND availability with the property
// (availability → confirmed_by_property). Prices stay immutable.
// Called from the Base44 Advisor Desk through the server, never from a browser
// holding broad credentials (spec §8).
export const dynamic = "force-dynamic";

export const POST = withTraveler("quotes", async ({ req, sb, user, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { data: roles } = await sb.from("organization_memberships").select("role, status").eq("user_id", user.id).eq("status", "active");
  if (!roles?.some((r) => r.role === "advisor" || r.role === "admin")) return error("forbidden", "Advisors only", requestId);

  const body = (await jsonBody(req)) as { decision?: unknown; note?: unknown; availability?: unknown } | undefined;
  const decision = body?.decision === "approved" || body?.decision === "declined" ? body.decision : null;
  if (!decision) return error("invalid_input", 'decision must be "approved" or "declined"', requestId);
  if (decision === "approved" && body?.availability !== "confirmed_by_property")
    return error("invalid_input", 'Approving needs availability: "confirmed_by_property" — confirm with the property first', requestId);
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) : null;

  const admin = supabaseAdmin();
  if (!admin) return error("server_error", "Not configured (server key missing)", requestId);
  const { data: q } = await admin.from("quotes").select("id, advisor_status, expires_at, status").eq("id", params.id).maybeSingle();
  if (!q) return error("not_found", "Not found", requestId);
  if (q.advisor_status !== "pending") return error("conflict", `Already ${q.advisor_status}`, requestId);
  if (decision === "approved" && new Date(q.expires_at) < new Date()) return error("conflict", "This quote has expired — create a fresh one", requestId);

  const { error: e } = await admin.from("quotes").update({
    advisor_status: decision, advisor_user_id: user.id, advisor_note: note, advisor_decided_at: new Date().toISOString(),
    ...(decision === "approved" ? { availability: "confirmed_by_property" } : { status: "rejected" }),
  }).eq("id", params.id).eq("advisor_status", "pending");
  if (e) return error("server_error", "Couldn't record the decision", requestId);
  return ok({ id: params.id, advisor_status: decision }, requestId);
});
