import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CARD_SLUGS } from "@/lib/checkout/pilot";

// GET /api/preview/checkout/rate-card?slug=ellerman-house  (Journey Cart preview, Session 03)
// Reads a pilot property's PUBLISHED, non-sample contracted card from the existing Booking Live tables
// (Airtable is the library; Supabase is its synced copy), with the anon key, so row-level security
// decides what is readable. Read only. Net rates and commission sit in private tables this never touches.
// Answers { card: null, reason } when there is no card: the cart then shows no price at all.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!CARD_SLUGS.includes(slug)) return NextResponse.json({ error: "Unknown property" }, { status: 400 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ card: null, reason: "not_connected" }, { headers: { "Cache-Control": "no-store" } });
  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data: prop } = await sb.from("properties").select("id, legacy_cms_id").eq("slug", slug).maybeSingle();
    if (!prop) return NextResponse.json({ card: null, reason: "no_property" });
    const { data: cards } = await sb.from("rate_card_versions").select("id, version_label, source_revision, currency, payment_terms, cancellation, effective_from, effective_to, supplier_contract_reference, published_at").eq("property_id", prop.id).eq("status", "published").eq("is_sample", false).order("effective_from", { ascending: false }).limit(1);
    const card = cards?.[0];
    if (!card) return NextResponse.json({ card: null, reason: "no_published_card" }, { headers: { "Cache-Control": "no-store" } });
    const [{ data: rules }, { data: rooms }, { data: taxes }] = await Promise.all([
      sb.from("seasonal_rate_rules").select("season, room_type_id, stay_start, stay_end, base_occupancy, amount_minor, priority").eq("rate_card_version_id", card.id).eq("active", true),
      sb.from("room_types").select("id, code, name").eq("property_id", prop.id).eq("active", true),
      sb.from("tax_fee_rules").select("name, kind, charge_basis, percentage_bp, amount_minor, included_in_display_price").eq("rate_card_version_id", card.id),
    ]);
    const code = new Map((rooms ?? []).map((r) => [r.id, r.code as string]));
    return NextResponse.json({
      card: {
        version: `${slug}:${card.version_label}:rev${card.source_revision}`, currency: card.currency, effectiveFrom: card.effective_from, effectiveTo: card.effective_to, publishedAt: card.published_at,
        paymentTerms: card.payment_terms, cancellation: card.cancellation,
        rooms: (rooms ?? []).map((r) => ({ key: r.code, name: r.name })),
        rules: (rules ?? []).map((r) => ({ season: r.season, roomKey: code.get(r.room_type_id) ?? "", stayStart: r.stay_start, stayEnd: r.stay_end, baseOccupancy: r.base_occupancy, amountMinor: Number(r.amount_minor), priority: r.priority ?? 0 })),
        taxes: (taxes ?? []).map((t) => ({ name: t.name, kind: t.kind, basis: t.charge_basis, percentBp: t.percentage_bp, amountMinor: t.amount_minor == null ? null : Number(t.amount_minor), included: t.included_in_display_price })),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ card: null, reason: "unreachable" }, { headers: { "Cache-Control": "no-store" } });
  }
}
