import { withTraveler, ok, error, jsonBody } from "@/lib/booking-live/api";
import { isUuid, parseSearch } from "@/lib/booking-live/validate";
import { priceStay } from "@/lib/booking-live/rates/price";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { onRequestReceived } from "@/lib/booking-live/notify";
import { originOf } from "@/lib/booking-live/notify/send";

// POST /api/v1/quotes — Request to Reserve.
// { property, room, plan, arrival, departure, adults, childAges?, promoCode?, folioId? }
// Re-prices on the server from the published card and stores an IMMUTABLE
// snapshot (nightly breakdown, taxes, policies, card revision). The browser
// never sends a price. The quote waits for the house to confirm availability
// with the property (advisor_status = pending, availability = on_request).
export const dynamic = "force-dynamic";
const QUOTE_HOURS = 72;

export const POST = withTraveler("quotes", async ({ req, sb, user, requestId }) => {
  const body = await jsonBody(req);
  const folioId = (body as { folioId?: unknown } | undefined)?.folioId;
  const { folioId: _f, ...rest } = (body ?? {}) as Record<string, unknown>;
  const parsed = parseSearch(rest, true);
  if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
  if (folioId != null && !isUuid(folioId)) return error("invalid_input", "folioId must be a Folio id", requestId);

  const admin = supabaseAdmin();
  if (!admin) return error("server_error", "Quotes aren't configured yet (server key missing)", requestId);

  const priced = await priceStay(sb, parsed.value);
  if (!priced) return error("not_found", "That stay isn't in the Ledger", requestId);
  const opt = priced.options[0];
  if (!opt) return error("not_found", "No contracted rate for that room and rate", requestId);
  if (!opt.result.ok) return error("conflict", opt.result.message, requestId);
  const q = opt.result;

  // A Folio may only be attached if this traveler can see it (RLS on their session).
  if (folioId) {
    const { data: f } = await sb.from("folios").select("id").eq("id", folioId).maybeSingle();
    if (!f) return error("forbidden", "You don't have access to that Folio", requestId);
  }

  const sum = (kind: string) => q.charges.filter((c) => c.kind === kind && !c.included).reduce((a, c) => a + c.amountMinor, 0);
  const { data, error: e } = await admin.from("quotes").insert({
    traveler_user_id: user.id,
    folio_id: (folioId as string | undefined) ?? null,
    property_id: priced.ctx.propertyId,
    room_type_id: opt.offerable.room.id,
    rate_plan_id: opt.offerable.plan.id,
    rate_card_version_id: priced.ctx.cardId,
    source: "contracted_card",
    price_revision: q.revision,
    availability: "on_request",
    arrival_date: parsed.value.arrival,
    departure_date: parsed.value.departure,
    adults: parsed.value.adults,
    children: parsed.value.childAges.length,
    child_ages: parsed.value.childAges,
    currency: q.currency,
    subtotal_minor: q.roomSubtotalMinor,
    discounts_minor: q.discountsMinor,
    taxes_minor: sum("tax"),
    fees_minor: sum("fee"),
    florida_tax_minor: q.floridaTaxMinor,
    grand_total_minor: q.grandTotalMinor,
    deposit_due_minor: q.depositDueMinor,
    balance_due_date: q.balanceDueDate,
    policy_snapshot: { cancellation: q.cancellation, paymentTerms: priced.ctx.card!.paymentTerms, plan: opt.offerable.plan, room: { code: opt.offerable.room.code, name: opt.offerable.room.name } },
    price_breakdown: { nights: q.nights.map(({ ruleId: _r, ...n }) => n), discounts: q.discounts, charges: q.charges, rateCardVersion: q.rateCardVersion },
    expires_at: new Date(Date.now() + QUOTE_HOURS * 3_600_000).toISOString(),
  }).select("id, public_reference").single();
  if (e) {
    console.error(JSON.stringify({ requestId, route: "quotes", db: e.code, message: e.message }));
    return error("server_error", "Couldn't save your request just now", requestId);
  }
  onRequestReceived(admin, data.id, originOf(req));
  return ok({ id: data.id, reference: data.public_reference, grandTotalMinor: q.grandTotalMinor, currency: q.currency, availability: "on_request" }, requestId, 201);
});
