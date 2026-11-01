import "server-only";
import { stripeAmount } from "./core";

// The gateway seam. The booking flow only ever asks for a checkout URL for a
// stored amount and receives a settled/failed signal back; which provider sits
// behind it is configuration (PAYMENTS_PROVIDER = stripe | off). Keys live in
// Vercel env only; nothing here logs or returns them.

export type CheckoutRequest = { paymentId: string; bookingReference: string; propertyName: string; kind: "deposit" | "balance"; amountMinor: number; currency: string; travelerEmail: string | null; successUrl: string; cancelUrl: string };
export type CheckoutSession = { url: string; providerReference: string };
export interface Gateway {
  name: "stripe";
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  /** Refund part or all of a settled charge; returns the provider's refund reference. */
  refund(req: { providerCharge: string; amountMinor: number; currency: string; paymentId: string; reason?: string }): Promise<{ reference: string }>;
}

export function paymentsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BOOKING_LIVE_PAYMENTS === "on" && process.env.PAYMENTS_PROVIDER === "stripe" && Boolean(process.env.STRIPE_SECRET_KEY);
}

export function gateway(): Gateway | null {
  if (!paymentsEnabled()) return null;
  const key = process.env.STRIPE_SECRET_KEY as string;
  return {
    name: "stripe",
    async createCheckout(r) {
      // Stripe Checkout Session, created server-side with the stored amount. No SDK: one form-encoded POST.
      const form = new URLSearchParams({
        mode: "payment",
        success_url: r.successUrl, cancel_url: r.cancelUrl,
        client_reference_id: r.paymentId,
        "metadata[payment_id]": r.paymentId, "metadata[booking_reference]": r.bookingReference, "metadata[kind]": r.kind,
        "payment_intent_data[metadata][payment_id]": r.paymentId,
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": r.currency.toLowerCase(),
        "line_items[0][price_data][unit_amount]": String(stripeAmount(r.amountMinor, r.currency)),
        "line_items[0][price_data][product_data][name]": `${r.kind === "deposit" ? "Deposit" : "Balance"} · ${r.propertyName} · booking ${r.bookingReference}`,
        ...(r.travelerEmail ? { customer_email: r.travelerEmail } : {}),
      });
      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `checkout:${r.paymentId}` }, body: form, signal: AbortSignal.timeout(15_000) });
      const json = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
      if (!res.ok || !json.url || !json.id) throw new Error(`Stripe: ${json.error?.message ?? res.status}`);
      return { url: json.url, providerReference: json.id };
    },
    async refund(r) {
      const form = new URLSearchParams({ payment_intent: r.providerCharge, amount: String(stripeAmount(r.amountMinor, r.currency)), "metadata[payment_id]": r.paymentId, ...(r.reason ? { "metadata[reason]": r.reason.slice(0, 200) } : {}) });
      const res = await fetch("https://api.stripe.com/v1/refunds", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `refund:${r.paymentId}:${r.amountMinor}:${Date.now()}` }, body: form, signal: AbortSignal.timeout(15_000) });
      const json = (await res.json()) as { id?: string; error?: { message?: string } };
      if (!res.ok || !json.id) throw new Error(`Stripe: ${json.error?.message ?? res.status}`);
      return { reference: json.id };
    },
  };
}
