import { withTraveler, ok, error, jsonBody } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/booking-live/validate";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { isAdvisor } from "@/lib/booking-live/ops";
import { gateway } from "@/lib/booking-live/payments/gateway";

// POST /api/v1/ops/payments/:id/refund { amountMinor?, note? }
// Advisor or admin only. Refunds part (amountMinor) or all of a settled
// payment. A gateway payment is refunded at the gateway first (against the
// stored payment intent), then recorded; a manual payment is recorded as
// refunded by the house. refund_payment moves the booking's paid columns back.
export const dynamic = "force-dynamic";

export const POST = withTraveler("quotes", async ({ req, sb, user, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  if (!(await isAdvisor(sb, user.id))) return error("forbidden", "Advisors only", requestId);
  const admin = supabaseAdmin();
  if (!admin) return error("server_error", "Not configured (server key missing)", requestId);
  const body = (await jsonBody(req)) as { amountMinor?: unknown; note?: unknown } | undefined;
  const { data: p } = await admin.from("payments").select("id, status, amount_minor, refunded_minor, currency, provider, provider_charge").eq("id", params.id).maybeSingle();
  if (!p) return error("not_found", "Not found", requestId);
  const remaining = Number(p.amount_minor) - Number(p.refunded_minor);
  const amount = body?.amountMinor == null ? remaining : typeof body.amountMinor === "number" && Number.isInteger(body.amountMinor) ? body.amountMinor : NaN;
  if (!(amount > 0) || amount > remaining) return error("invalid_input", `amountMinor must be 1..${remaining}`, requestId);
  if (p.status !== "succeeded" && p.status !== "refunded") return error("conflict", `Payment is ${p.status}`, requestId);
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) || null : null;

  let reference: string | null = null;
  if (p.provider === "stripe") {
    const gw = gateway();
    if (!gw) return error("feature_off", "The payment gateway is off; refund it in the Stripe dashboard and record it as manual", requestId);
    if (!p.provider_charge) return error("conflict", "This payment has no charge reference yet (the webhook hasn't settled it)", requestId);
    try { reference = (await gw.refund({ providerCharge: p.provider_charge, amountMinor: amount, currency: p.currency, paymentId: p.id, reason: note ?? undefined })).reference; }
    catch (e) { console.error(JSON.stringify({ requestId, route: "refund", error: e instanceof Error ? e.message : String(e) })); return error("server_error", "The gateway refused the refund", requestId); }
  }
  const { data: booking, error: e } = await admin.rpc("refund_payment", { p_payment: p.id, p_amount: amount, p_reference: reference, p_note: note });
  if (e) return error("conflict", e.message.includes("exceeds") ? "More than remains on this payment" : "Couldn't record the refund", requestId);
  return ok({ paymentId: p.id, refundedMinor: amount, reference, booking: { status: (booking as { status: string }).status } }, requestId);
});
