import { withTraveler, ok, error, jsonBody, dbError } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/booking-live/validate";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { isAdvisor } from "@/lib/booking-live/ops";

// POST /api/v1/ops/bookings/:id/payments { kind: "deposit"|"balance"|"other", amountMinor, reference?, note? }
// Advisor or admin only: records a payment the house took outside the
// gateway (bank transfer, card by phone) and settles it at once. The amount
// may never exceed what the booking is owed (settle_payment refuses).
export const dynamic = "force-dynamic";

export const POST = withTraveler("quotes", async ({ req, sb, user, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  if (!(await isAdvisor(sb, user.id))) return error("forbidden", "Advisors only", requestId);
  const admin = supabaseAdmin();
  if (!admin) return error("server_error", "Not configured (server key missing)", requestId);
  const body = (await jsonBody(req)) as { kind?: unknown; amountMinor?: unknown; reference?: unknown; note?: unknown } | undefined;
  const kind = body?.kind === "deposit" || body?.kind === "balance" || body?.kind === "other" ? body.kind : null;
  const amount = typeof body?.amountMinor === "number" && Number.isInteger(body.amountMinor) && body.amountMinor > 0 ? body.amountMinor : null;
  if (!kind || !amount) return error("invalid_input", "kind (deposit|balance|other) and a whole amountMinor > 0 are required", requestId);
  const reference = typeof body?.reference === "string" ? body.reference.trim().slice(0, 200) || null : null;
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) || null : null;
  const { data: b } = await admin.from("bookings").select("id, traveler_user_id, currency").eq("id", params.id).maybeSingle();
  if (!b) return error("not_found", "Not found", requestId);
  const { data: p, error: e } = await admin.from("payments").insert({ booking_id: b.id, traveler_user_id: b.traveler_user_id, kind, amount_minor: amount, currency: b.currency, provider: "manual", provider_reference: reference, note, recorded_by: user.id }).select("id, public_reference").single();
  if (e) return dbError(e, requestId);
  const { data: booking, error: se } = await admin.rpc("settle_payment", { p_payment: p.id, p_event: `manual:${user.id}` });
  if (se) { await admin.from("payments").update({ status: "failed", note: se.message.slice(0, 500) }).eq("id", p.id); return error("conflict", se.message.includes("exceeds") ? "That's more than the booking is owed" : "Couldn't settle the payment", requestId); }
  return ok({ paymentId: p.id, reference: p.public_reference, booking: { status: (booking as { status: string }).status } }, requestId, 201);
});
