import { FLAGS } from "@/lib/booking-live/flags";
import { ok, error, jsonBody, newRequestId, rateLimited } from "@/lib/booking-live/api";
import { parseSearch } from "@/lib/booking-live/validate";
import { supabaseServer } from "@/lib/booking-live/supabase/server";
import { priceStay, publicOption } from "@/lib/booking-live/rates/price";

// POST /api/v1/availability/search
// { property, arrival, departure, adults, childAges?, promoCode?, room?, plan? }
// Prices every room and rate on the property's published contracted card for
// these dates. Nothing is saved. availability is always "on_request": a
// contracted card is never proof of a free room (spec §6, §14).
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = newRequestId();
  if (!FLAGS.quotes) return error("feature_off", "Not found", requestId);
  if (rateLimited(req, 30)) return error("rate_limited", "Too many searches, try again in a minute", requestId);
  const parsed = parseSearch(await jsonBody(req));
  if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
  try {
    const priced = await priceStay(await supabaseServer(), parsed.value);
    if (!priced) return error("not_found", "That stay isn't in the Ledger", requestId);
    return ok({
      property: { slug: priced.ctx.slug, name: priced.ctx.name, bookingMode: priced.ctx.bookingMode },
      hasCard: Boolean(priced.ctx.card),
      availability: "on_request",
      options: priced.options.map(publicOption),
    }, requestId);
  } catch (e) {
    console.error(JSON.stringify({ requestId, route: "availability/search", error: e instanceof Error ? e.message : String(e) }));
    return error("server_error", "Couldn't price these dates just now", requestId);
  }
}
