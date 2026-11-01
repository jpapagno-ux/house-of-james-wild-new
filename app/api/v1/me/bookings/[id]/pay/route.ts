import { withTraveler, ok, error, dbError } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/booking-live/validate";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { gateway } from "@/lib/booking-live/payments/gateway";
import { nextPayment } from "@/lib/booking-live/payments/core";

// POST /api/v1/me/bookings/:id/pay — the traveler pays the next amount due.
// The amount is never taken from the request: it is the booking's outstanding
// deposit, then its balance (nextPayment). A pending payment row is written
// first, then the gateway's checkout opens for exactly that amount; the
// webhook settles it. Re-posting reuses an open pending payment.
export const dynamic = "force-dynamic";

export const POST = withTraveler("payments", async ({ req, sb, user, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const gw = gateway();
  if (!gw) return error("feature_off", "Online payment isn't switched on yet; the house will send payment details", requestId);
  const admin = supabaseAdmin();
  if (!admin) return error("server_error", "Not configured (server key missing)", requestId);

  // RLS: the traveler can only read their own booking.
  const { data: b } = await sb.from("bookings").select("id, public_reference, status, currency, grand_total_minor, deposit_due_minor, deposit_paid_minor, balance_paid_minor, balance_due_date, property:properties(name)").eq("id", params.id).maybeSingle();
  if (!b) return error("not_found", "Not found", requestId);
  const next = nextPayment(b);
  if (!next) return error("conflict", "Nothing is due on this booking", requestId);

  // Reuse a pending payment for the same kind if one exists (double click, back button).
  const { data: open } = await admin.from("payments").select("id, provider_reference, amount_minor").eq("booking_id", b.id).eq("kind", next.kind).eq("status", "pending").eq("provider", gw.name).order("created_at", { ascending: false }).limit(1).maybeSingle();
  let paymentId = open?.id as string | undefined;
  if (!paymentId || Number(open?.amount_minor) !== next.amountMinor) {
    if (paymentId) await admin.from("payments").update({ status: "failed", note: "superseded: amount due changed" }).eq("id", paymentId);
    const { data: p, error: e } = await admin.from("payments").insert({ booking_id: b.id, traveler_user_id: user.id, kind: next.kind, amount_minor: next.amountMinor, currency: b.currency, provider: gw.name }).select("id").single();
    if (e) return dbError(e, requestId);
    paymentId = p.id;
  }

  const origin = new URL(req.url).origin;
  const propertyName = (b.property as unknown as { name: string } | null)?.name ?? "your stay";
  try {
    const session = await gw.createCheckout({
      paymentId: paymentId!, bookingReference: b.public_reference, propertyName, kind: next.kind, amountMinor: next.amountMinor, currency: b.currency, travelerEmail: user.email ?? null,
      successUrl: `${origin}/account/trips?paid=${b.public_reference}`, cancelUrl: `${origin}/account/trips?cancelled=${b.public_reference}`,
    });
    await admin.from("payments").update({ provider_reference: session.providerReference }).eq("id", paymentId!);
    return ok({ paymentId, kind: next.kind, amountMinor: next.amountMinor, currency: b.currency, url: session.url }, requestId, 201);
  } catch (e) {
    console.error(JSON.stringify({ requestId, route: "bookings/pay", error: e instanceof Error ? e.message : String(e) }));
    return error("server_error", "The payment page couldn't be opened just now", requestId);
  }
});
