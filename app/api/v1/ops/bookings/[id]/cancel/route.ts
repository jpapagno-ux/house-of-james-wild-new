import { withTraveler, ok, error, jsonBody } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/booking-live/validate";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { isAdvisor } from "@/lib/booking-live/ops";

// POST /api/v1/ops/bookings/:id/cancel { note? }
// Advisor or admin only. Marks the booking cancelled; money is not touched
// here — refunds go through /ops/payments/:id/refund so every movement is a
// payment row. (The same shape marks a booking "stayed" with { stayed: true }.)
export const dynamic = "force-dynamic";

export const POST = withTraveler("quotes", async ({ req, sb, user, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  if (!(await isAdvisor(sb, user.id))) return error("forbidden", "Advisors only", requestId);
  const admin = supabaseAdmin();
  if (!admin) return error("server_error", "Not configured (server key missing)", requestId);
  const body = (await jsonBody(req)) as { note?: unknown; stayed?: unknown } | undefined;
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 1000) || null : null;
  const { data: b } = await admin.from("bookings").select("id, status").eq("id", params.id).maybeSingle();
  if (!b) return error("not_found", "Not found", requestId);
  if (b.status === "cancelled") return error("conflict", "Already cancelled", requestId);
  const stayed = body?.stayed === true;
  const { error: e } = await admin.from("bookings").update(stayed ? { status: "stayed" } : { status: "cancelled", cancelled_at: new Date().toISOString(), cancel_note: note }).eq("id", b.id);
  if (e) return error("server_error", "Couldn't update the booking", requestId);
  return ok({ id: b.id, status: stayed ? "stayed" : "cancelled" }, requestId);
});
