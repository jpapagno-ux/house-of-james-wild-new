import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { localToday, quote, type Quote, type QuoteError } from "../pricing/engine";
import type { SearchInput } from "../validate";
import { loadPricing, type Offerable, type PricingContext } from "./load";

// Prices a stay from the property's published contracted card, server-side.
// Every total a traveler sees or saves comes from here — never from the browser.

export type PricedOption = { offerable: Offerable; result: Quote | QuoteError };
export type PriceResponse = { ctx: PricingContext; options: PricedOption[] };

export async function priceStay(sb: SupabaseClient, input: SearchInput): Promise<PriceResponse | null> {
  const ctx = await loadPricing(sb, input.slug, input.arrival, input.departure);
  if (!ctx) return null;
  if (!ctx.card) return { ctx, options: [] };
  const bookingDate = localToday(ctx.timezone);
  const wanted = ctx.offerables.filter((o) => (!input.room || o.room.code === input.room) && (!input.plan || o.plan.code === input.plan));
  const options = wanted.map((offerable) => ({
    offerable,
    result: quote(ctx.card!, offerable.room, {
      roomTypeId: offerable.room.id, ratePlanId: offerable.plan.id, arrival: input.arrival, departure: input.departure,
      adults: input.adults, childAges: input.childAges, bookingDate, promoCode: input.promoCode,
    }),
  }));
  // Bookable options first, cheapest first.
  options.sort((a, b) => (a.result.ok === b.result.ok ? (a.result.ok && b.result.ok ? a.result.grandTotalMinor - b.result.grandTotalMinor : 0) : a.result.ok ? -1 : 1));
  return { ctx, options };
}

/** What a browser may see: never contract terms, never internal ids beyond the codes it sends back. */
export function publicOption(o: PricedOption) {
  return {
    room: { code: o.offerable.room.code, name: o.offerable.room.name, description: o.offerable.room.description, maxOccupancy: o.offerable.room.maxOccupancy },
    plan: { code: o.offerable.plan.code, name: o.offerable.plan.name, boardBasis: o.offerable.plan.boardBasis, refundability: o.offerable.plan.refundability, inclusions: o.offerable.plan.inclusions },
    quote: o.result.ok ? { ...o.result, nights: o.result.nights.map(({ ruleId: _r, ...n }) => n) } : null,
    unavailable: o.result.ok ? null : { code: o.result.code, message: o.result.message, date: o.result.date ?? null },
  };
}
