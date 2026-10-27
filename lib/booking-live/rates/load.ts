import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RateCard, Room, SeasonalRule } from "../pricing/engine";

// Loads a property's PUBLISHED contracted card (only published rows are
// readable — RLS) and shapes it for the pricing engine. Picks the card whose
// effective dates cover the whole stay.

export type Offerable = { room: Room & { code: string; description: string | null }; plan: { id: string; code: string; name: string; boardBasis: string; refundability: string; inclusions: string | null } };
export type PricingContext = { propertyId: string; slug: string; name: string; timezone: string; bookingMode: string; card: RateCard | null; cardId: string | null; offerables: Offerable[] };

export async function loadPricing(sb: SupabaseClient, slug: string, arrival?: string, departure?: string): Promise<PricingContext | null> {
  const { data: prop } = await sb.from("properties").select("id, slug, name, timezone, booking_mode").eq("slug", slug).maybeSingle();
  if (!prop) return null;
  const ctx: PricingContext = { propertyId: prop.id, slug: prop.slug, name: prop.name, timezone: prop.timezone ?? "UTC", bookingMode: prop.booking_mode, card: null, cardId: null, offerables: [] };

  let cq = sb.from("rate_card_versions").select("id, version_label, source_revision, currency, payment_terms, cancellation, timezone, effective_from, effective_to").eq("property_id", prop.id).eq("status", "published").order("effective_from");
  if (arrival && departure) cq = cq.lte("effective_from", arrival).gte("effective_to", departure);
  const { data: cards } = await cq.limit(1);
  const card = cards?.[0];
  if (!card) return ctx;

  const [{ data: rules }, { data: rooms }, { data: restrictions }, { data: promos }, { data: taxes }] = await Promise.all([
    sb.from("seasonal_rate_rules").select("*").eq("rate_card_version_id", card.id).eq("active", true),
    sb.from("room_types").select("id, code, name, description, max_adults, max_children, max_occupancy, rate_plans(id, code, name, board_basis, refundability, inclusions, active)").eq("property_id", prop.id).eq("active", true),
    sb.from("inventory_restrictions").select("*").eq("rate_card_version_id", card.id),
    sb.from("promotions").select("*").eq("rate_card_version_id", card.id),
    sb.from("tax_fee_rules").select("*").eq("rate_card_version_id", card.id),
  ]);

  ctx.cardId = card.id;
  ctx.timezone = card.timezone ?? ctx.timezone;
  ctx.card = {
    versionId: `${slug}:${card.version_label}:rev${card.source_revision}`,
    propertySlug: slug,
    currency: card.currency,
    status: "published",
    rules: (rules ?? []).map((r): SeasonalRule => ({
      id: r.id, season: r.season, roomTypeId: r.room_type_id, ratePlanId: r.rate_plan_id, stayStart: r.stay_start, stayEnd: r.stay_end,
      bookingStart: r.booking_start, bookingEnd: r.booking_end, baseOccupancy: r.base_occupancy, amountMinor: Number(r.amount_minor),
      extraAdultMinor: r.extra_adult_minor == null ? null : Number(r.extra_adult_minor), childBands: r.child_bands ?? [],
      minNights: r.min_nights, maxNights: r.max_nights, daysOfWeek: r.days_of_week, priority: r.priority,
    })),
    restrictions: (restrictions ?? []).map((x) => ({ id: x.id, roomTypeId: x.room_type_id, ratePlanId: x.rate_plan_id, start: x.start_date, end: x.end_date, type: x.restriction_type, minimumStay: x.minimum_stay })),
    promotions: (promos ?? []).map((p) => ({
      code: p.promotion_code, label: p.label, type: p.discount_type, value: p.discount_value, bookingStart: p.booking_start, bookingEnd: p.booking_end,
      stayStart: p.stay_start, stayEnd: p.stay_end, minNights: p.min_nights, ratePlanIds: p.eligible_rate_plans, stacking: p.stacking_policy, approved: p.approval_status === "approved",
    })),
    taxes: (taxes ?? []).map((t) => ({ id: t.id, name: t.name, kind: t.kind, basis: t.charge_basis, percentBp: t.percentage_bp, amountMinor: t.amount_minor == null ? null : Number(t.amount_minor), included: t.included_in_display_price, minAge: t.min_age })),
    paymentTerms: card.payment_terms,
    cancellation: card.cancellation,
  };
  for (const rt of rooms ?? []) {
    for (const p of (rt.rate_plans as { id: string; code: string; name: string; board_basis: string; refundability: string; inclusions: string | null; active: boolean }[]) ?? []) {
      if (!p.active || !ctx.card.rules.some((r) => r.roomTypeId === rt.id && r.ratePlanId === p.id)) continue;
      ctx.offerables.push({
        room: { id: rt.id, code: rt.code, name: rt.name, description: rt.description, maxAdults: rt.max_adults, maxChildren: rt.max_children, maxOccupancy: rt.max_occupancy },
        plan: { id: p.id, code: p.code, name: p.name, boardBasis: p.board_basis, refundability: p.refundability, inclusions: p.inclusions },
      });
    }
  }
  return ctx;
}
