// Bookings and holds: pure helpers for the traveler dashboard and the ops
// routes. No imports, so plain Node can test them (tests/bookings.test.ts).

import type { ErrorCode, Result } from "./validate";

const fail = (code: ErrorCode, message: string): { ok: false; code: ErrorCode; message: string } => ({ ok: false, code, message });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9-]{2,120}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : null);

export type BookingInput = {
  quoteId?: string; travelerUserId?: string; propertySlug?: string; roomCode?: string; arrival: string; departure: string; adults: number; children?: number;
  currency: string; grandTotalMinor: number; depositDueMinor?: number; balanceDueDate?: string | null; partnerConfirmationNumber?: string; travelerNote?: string;
};

/** Validates the house's booking request. "from_quote" needs only the quote id and notes; "advisor" needs the whole record. */
export function parseBooking(body: unknown, mode: "from_quote" | "advisor"): Result<BookingInput> {
  if (!isObj(body)) return fail("invalid_input", "Body must be a JSON object");
  const allowed = mode === "from_quote" ? ["quoteId", "partnerConfirmationNumber", "travelerNote"] : ["travelerUserId", "propertySlug", "roomCode", "arrival", "departure", "adults", "children", "currency", "grandTotalMinor", "depositDueMinor", "balanceDueDate", "partnerConfirmationNumber", "travelerNote"];
  const extra = Object.keys(body).filter((k) => !allowed.includes(k));
  if (extra.length) return fail("invalid_input", `Unexpected field: ${extra[0]}`);
  const conf = text(body.partnerConfirmationNumber, 80) || undefined, note = text(body.travelerNote, 2000) || undefined;
  if (mode === "from_quote") {
    if (!UUID.test(String(body.quoteId))) return fail("invalid_input", "quoteId must be a quote id");
    return { ok: true, value: { quoteId: String(body.quoteId), arrival: "", departure: "", adults: 1, currency: "", grandTotalMinor: 0, partnerConfirmationNumber: conf, travelerNote: note } };
  }
  if (!UUID.test(String(body.travelerUserId))) return fail("invalid_input", "travelerUserId must be the traveler's user id");
  const slug = typeof body.propertySlug === "string" ? body.propertySlug.toLowerCase() : "";
  if (!SLUG.test(slug)) return fail("invalid_input", "propertySlug must be the stay's slug");
  const roomCode = typeof body.roomCode === "string" ? body.roomCode.toLowerCase() : undefined;
  if (roomCode !== undefined && !/^[a-z0-9-]{1,60}$/.test(roomCode)) return fail("invalid_input", "roomCode isn't a unit code");
  const arrival = String(body.arrival ?? ""), departure = String(body.departure ?? "");
  if (!DATE.test(arrival) || !DATE.test(departure) || departure <= arrival) return fail("invalid_input", "arrival and departure must be YYYY-MM-DD, departure after arrival");
  const adults = int(body.adults), children = body.children == null ? 0 : int(body.children);
  if (adults == null || adults < 1 || adults > 20) return fail("invalid_input", "adults must be 1–20");
  if (children == null || children < 0 || children > 20) return fail("invalid_input", "children must be 0–20");
  const currency = String(body.currency ?? "").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return fail("invalid_input", "currency must be an ISO code");
  const total = int(body.grandTotalMinor), deposit = body.depositDueMinor == null ? 0 : int(body.depositDueMinor);
  if (total == null || total < 0) return fail("invalid_input", "grandTotalMinor must be a whole number of minor units ≥ 0");
  if (deposit == null || deposit < 0 || deposit > total) return fail("invalid_input", "depositDueMinor must be 0..grandTotalMinor");
  const balanceDueDate = body.balanceDueDate == null ? null : String(body.balanceDueDate);
  if (balanceDueDate !== null && !DATE.test(balanceDueDate)) return fail("invalid_input", "balanceDueDate must be YYYY-MM-DD");
  return { ok: true, value: { travelerUserId: String(body.travelerUserId), propertySlug: slug, roomCode, arrival, departure, adults, children, currency, grandTotalMinor: total, depositDueMinor: deposit, balanceDueDate, partnerConfirmationNumber: conf, travelerNote: note } };
}

// ---------- what the traveler sees

export type QuoteRow = { id: string; public_reference: string; property_slug?: string | null; status: string; advisor_status: string; expires_at: string; held_until: string | null; arrival_date: string; departure_date: string; grand_total_minor: number | string; deposit_due_minor: number | string; balance_due_date: string | null; currency: string; created_at: string };
export type BookingRow = { id: string; public_reference: string; traveler_note?: string | null; status: string; arrival_date: string; departure_date: string; grand_total_minor: number | string; deposit_due_minor: number | string; deposit_paid_minor: number | string; balance_paid_minor: number | string; balance_due_date: string | null; currency: string; partner_confirmation_number: string | null; created_at: string };

export type TravelerState =
  | "waiting"      // request with the house
  | "held"         // the property is holding the room until held_until
  | "confirmed"    // approved: price and room confirmed, deposit details to follow
  | "booked"       // a booking exists (quote converted)
  | "declined"
  | "expired";

/** One plain-words state per quote, in the traveler's terms. */
export function quoteState(q: Pick<QuoteRow, "status" | "advisor_status" | "expires_at" | "held_until">, now = new Date()): TravelerState {
  if (q.status === "converted") return "booked";
  if (q.advisor_status === "declined" || q.status === "rejected") return "declined";
  if (q.advisor_status === "approved") return "confirmed";
  if (q.advisor_status === "held") return q.held_until && new Date(q.held_until) < now ? "expired" : "held";
  return new Date(q.expires_at) < now ? "expired" : "waiting";
}

export const STATE_WORDS: Record<TravelerState, { label: string; line: string }> = {
  waiting: { label: "Waiting for the house", line: "Your request is with the house; we confirm the room with the property and reply within 24 hours. Nothing has been charged." },
  held: { label: "Room on hold", line: "The property is holding the room for you. Say the word and the house confirms it." },
  confirmed: { label: "Confirmed by the house", line: "The property has confirmed the room at this price. The house will send the deposit details." },
  booked: { label: "Booked", line: "Your booking is recorded. Everything you need for the stay lives here." },
  declined: { label: "Not available", line: "The property couldn't hold these dates. The house will suggest the closest alternatives." },
  expired: { label: "Price expired", line: "Prices on contracted cards are held for 72 hours. Check your dates again for a fresh price." },
};

export type BookingStage = "confirmed" | "deposit_paid" | "paid" | "stayed" | "cancelled";
/** The booking's money position in plain words. */
export function bookingWords(b: Pick<BookingRow, "status" | "grand_total_minor" | "deposit_due_minor" | "deposit_paid_minor" | "balance_paid_minor" | "balance_due_date">): { label: string; line: string; outstandingMinor: number } {
  const total = Number(b.grand_total_minor), paid = Number(b.deposit_paid_minor) + Number(b.balance_paid_minor);
  const outstanding = Math.max(0, total - paid);
  switch (b.status) {
    case "cancelled": return { label: "Cancelled", line: "This booking was cancelled. The house can tell you where any refund stands.", outstandingMinor: 0 };
    case "stayed": return { label: "Stayed", line: "We hope it was everything it should be. Worth another night?", outstandingMinor: 0 };
    case "paid": return { label: "Paid in full", line: "Nothing more to pay. The house sends your travel documents before you go.", outstandingMinor: outstanding };
    case "deposit_paid": return { label: "Deposit paid", line: b.balance_due_date ? `The balance is due on ${b.balance_due_date}.` : "The balance is due before arrival.", outstandingMinor: outstanding };
    default: return { label: "Confirmed · deposit due", line: "A deposit confirms the booking; the house will send the payment details.", outstandingMinor: outstanding };
  }
}

/** The order of steps on a request's timeline, with the one reached. */
export function timeline(state: TravelerState): { step: string; done: boolean; current: boolean }[] {
  const steps = ["Requested", "Confirmed by the house", "Booked", "Deposit paid", "Balance paid", "Stayed"];
  const reached: Record<TravelerState, number> = { waiting: 0, held: 0, confirmed: 1, booked: 2, declined: -1, expired: -1 };
  const r = reached[state];
  return steps.map((step, i) => ({ step, done: i < r, current: i === r }));
}
