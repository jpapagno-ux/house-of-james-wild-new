import { withTraveler, ok, error, jsonBody, dbError } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/booking-live/validate";
import { supabaseAdmin } from "@/lib/booking-live/supabase/admin";
import { isAdvisor } from "@/lib/booking-live/ops";
import { parseBooking } from "@/lib/booking-live/bookings";
import { onBookingRecorded } from "@/lib/booking-live/notify";
import { originOf } from "@/lib/booking-live/notify/send";
import { paymentsEnabled } from "@/lib/booking-live/payments/gateway";

// POST /api/v1/ops/bookings — the house records a booking.
// Advisor or admin only. Two shapes:
//   { quoteId, partnerConfirmationNumber?, travelerNote? }
//     converts an APPROVED quote: every figure is copied from the immutable
//     quote (never from the request), the quote becomes "converted".
//   { travelerUserId, propertySlug, arrival, departure, adults, children?, currency,
//     grandTotalMinor, depositDueMinor?, balanceDueDate?, partnerConfirmationNumber?, travelerNote?, roomCode? }
//     an advisor-recorded booking (phone or email with the partner; COMMERCIAL-RULES §4).
// Payments (deposit_paid / balance_paid) move only through Phase 3b's payment routes.
export const dynamic = "force-dynamic";

export const POST = withTraveler("quotes", async ({ req, sb, user, requestId }) => {
  if (!(await isAdvisor(sb, user.id))) return error("forbidden", "Advisors only", requestId);
  const admin = supabaseAdmin();
  if (!admin) return error("server_error", "Not configured (server key missing)", requestId);
  const { data: me } = await admin.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle();
  const advisorName = [me?.first_name, me?.last_name].filter(Boolean).join(" ") || null;
  const body = await jsonBody(req);
  const b = body as { quoteId?: unknown } | undefined;

  if (b && "quoteId" in b) {
    if (!isUuid(b.quoteId)) return error("invalid_input", "quoteId must be a quote id", requestId);
    const parsed = parseBooking(body, "from_quote");
    if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
    const { data: q } = await admin.from("quotes").select("*").eq("id", b.quoteId).maybeSingle();
    if (!q) return error("not_found", "Quote not found", requestId);
    if (q.advisor_status !== "approved") return error("conflict", `The quote is ${q.advisor_status}; approve it (availability confirmed by the property) before recording the booking`, requestId);
    if (q.status === "converted") return error("conflict", "This quote is already a booking", requestId);
    const { data, error: e } = await admin.from("bookings").insert({
      traveler_user_id: q.traveler_user_id, quote_id: q.id, folio_id: q.folio_id, property_id: q.property_id, room_type_id: q.room_type_id,
      source: "traveler_quote", partner_confirmation_number: parsed.value.partnerConfirmationNumber ?? null,
      arrival_date: q.arrival_date, departure_date: q.departure_date, adults: q.adults, children: q.children,
      currency: q.currency, grand_total_minor: q.grand_total_minor, deposit_due_minor: q.deposit_due_minor, balance_due_date: q.balance_due_date,
      status: "confirmed", traveler_note: parsed.value.travelerNote ?? null, advisor_user_id: user.id, advisor_name: advisorName,
    }).select("id, public_reference").single();
    if (e) return dbError(e, requestId);
    await admin.from("quotes").update({ status: "converted" }).eq("id", q.id);
    onBookingRecorded(admin, data.id, originOf(req), paymentsEnabled());
    return ok({ id: data.id, reference: data.public_reference, source: "traveler_quote" }, requestId, 201);
  }

  const parsed = parseBooking(body, "advisor");
  if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
  const v = parsed.value;
  const { data: prop } = await admin.from("properties").select("id").eq("slug", v.propertySlug!).maybeSingle();
  if (!prop) return error("not_found", "That stay isn't in Booking Live", requestId);
  const { data: room } = v.roomCode ? await admin.from("room_types").select("id").eq("property_id", prop.id).eq("code", v.roomCode).maybeSingle() : { data: null };
  if (v.roomCode && !room) return error("not_found", "That unit isn't on the stay", requestId);
  const { data, error: e } = await admin.from("bookings").insert({
    traveler_user_id: v.travelerUserId, property_id: prop.id, room_type_id: room?.id ?? null, source: "advisor",
    partner_confirmation_number: v.partnerConfirmationNumber ?? null, arrival_date: v.arrival, departure_date: v.departure, adults: v.adults, children: v.children ?? 0,
    currency: v.currency, grand_total_minor: v.grandTotalMinor, deposit_due_minor: v.depositDueMinor ?? 0, balance_due_date: v.balanceDueDate ?? null,
    status: "confirmed", traveler_note: v.travelerNote ?? null, advisor_user_id: user.id, advisor_name: advisorName,
  }).select("id, public_reference").single();
  if (e) return dbError(e, requestId);
  onBookingRecorded(admin, data.id, originOf(req), paymentsEnabled());
  return ok({ id: data.id, reference: data.public_reference, source: "advisor" }, requestId, 201);
});
