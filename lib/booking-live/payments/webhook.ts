// Stripe webhook signature check. Server only (Node crypto).
import { createHmac, timingSafeEqual } from "node:crypto";

/** Stripe-Signature: "t=<unix>,v1=<hex>[,v1=…]" over `${t}.${payload}` with the endpoint secret; 5-minute tolerance. */
export function verifyStripeSignature(payload: string, header: string | null, secret: string, nowSeconds = Math.floor(Date.now() / 1000), toleranceSeconds = 300): boolean {
  if (!header || !secret) return false;
  const parts = Object.create(null) as Record<string, string[]>;
  for (const kv of header.split(",")) { const [k, v] = kv.split("="); if (k && v) (parts[k.trim()] ??= []).push(v.trim()); }
  const t = Number(parts.t?.[0]);
  if (!Number.isFinite(t) || Math.abs(nowSeconds - t) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return (parts.v1 ?? []).some((sig) => sig.length === expected.length && timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex")));
}

