import { NextResponse } from "next/server";
import { hasCardLikeData, simulatePayment, type SimRequest } from "@/lib/checkout/journey";

// POST /api/preview/checkout/simulate  (Journey Cart preview, Session 03)
// A stand-in for a payment provider. It holds no keys, calls no network, moves no money and writes
// nothing. It answers deterministically from the idempotency key, so a repeated request is the same
// transaction. Anything shaped like card data is refused. It does not exist in Production.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const raw = await req.text();
  if (raw.length > 2000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (hasCardLikeData(body)) return NextResponse.json({ error: "Card details are never accepted here. Nothing was stored." }, { status: 422 });
  const b = body as Partial<SimRequest>;
  const out = simulatePayment({ idempotencyKey: String(b.idempotencyKey ?? ""), method: b.method as SimRequest["method"], amountMinor: typeof b.amountMinor === "number" ? b.amountMinor : null, currency: b.currency === "USD" ? "USD" : "USD", lineId: String(b.lineId ?? "").slice(0, 80), outcome: b.outcome === "decline" ? "decline" : null });
  if ("error" in out) return NextResponse.json(out, { status: 400 });
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
