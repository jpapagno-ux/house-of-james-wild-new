import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { verifyStripeSignature } from "@/lib/booking-live/payments/webhook";

// POST /api/v1/payments/stripe — Stripe webhook. Verifies the signature with
// STRIPE_WEBHOOK_SECRET, then settles the payment the session carries
// (metadata.payment_id) through settle_payment, which moves the booking
// forward in one transaction and ignores repeats (idempotent on the event).
// Never trusts the amount in the event: the payment row already holds it.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const admin = supabaseAdmin();
  if (!secret || !admin || process.env.PAYMENTS_PROVIDER !== "stripe") return NextResponse.json({ error: "payments off" }, { status: 404 });
  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret)) return NextResponse.json({ error: "bad signature" }, { status: 400 });
  let event: { id: string; type: string; data: { object: { id?: string; metadata?: Record<string, string>; client_reference_id?: string; payment_status?: string; payment_intent?: string | null } } };
  try { event = JSON.parse(payload); } catch { return NextResponse.json({ error: "bad payload" }, { status: 400 }); }

  const obj = event.data?.object ?? {};
  const paymentId = obj.metadata?.payment_id ?? obj.client_reference_id;
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    if (!paymentId || obj.payment_status === "unpaid") return NextResponse.json({ received: true, ignored: "unpaid" });
    // Keep the payment intent: refunds are issued against it.
    if (typeof obj.payment_intent === "string") await admin.from("payments").update({ provider_charge: obj.payment_intent }).eq("id", paymentId).is("provider_charge", null);
    const { error } = await admin.rpc("settle_payment", { p_payment: paymentId, p_event: event.id });
    if (error) { console.error(JSON.stringify({ webhook: event.id, error: error.message })); return NextResponse.json({ error: "settle failed" }, { status: 500 }); }
    return NextResponse.json({ received: true, settled: paymentId });
  }
  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    if (paymentId) await admin.from("payments").update({ status: "failed", provider_event: event.id, note: event.type }).eq("id", paymentId).eq("status", "pending");
    return NextResponse.json({ received: true, failed: paymentId ?? null });
  }
  return NextResponse.json({ received: true, ignored: event.type });
}
