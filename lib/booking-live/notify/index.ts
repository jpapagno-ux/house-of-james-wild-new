import "server-only";
import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as E from "./emails";
import { HOUSE_INBOX, sendMail, traveler } from "./send";

// Booking Live notifications. One function per event; each loads what it
// needs with the service role, builds the words in ./emails and sends after
// the response (next/server `after`), so a slow or failing mail never slows
// or fails the booking action. Traveler mail from myfolio@ with the
// reference in the subject; the house copy goes to the trips inbox.

type Admin = SupabaseClient;
const log = (event: string, e: unknown) => console.error(JSON.stringify({ notify: event, error: e instanceof Error ? e.message : String(e) }));

async function stayOf(admin: Admin, propertyId: string, roomTypeId: string | null, row: { arrival_date: string; departure_date: string; adults: number; children: number }): Promise<E.Stay> {
  const [{ data: p }, { data: r }] = await Promise.all([
    admin.from("properties").select("name").eq("id", propertyId).maybeSingle(),
    roomTypeId ? admin.from("room_types").select("name").eq("id", roomTypeId).maybeSingle() : Promise.resolve({ data: null as { name: string } | null }),
  ]);
  return { propertyName: p?.name ?? "your stay", roomName: r?.name ?? null, arrival: row.arrival_date, departure: row.departure_date, adults: row.adults, children: row.children };
}

type QuoteCtx = { id: string; public_reference: string; traveler_user_id: string; property_id: string; room_type_id: string | null; arrival_date: string; departure_date: string; adults: number; children: number; currency: string; grand_total_minor: number | string; deposit_due_minor: number | string; expires_at: string; held_until: string | null; hold_note: string | null };
async function quoteCtx(admin: Admin, quoteId: string) {
  const { data: q } = await admin.from("quotes").select("id, public_reference, traveler_user_id, property_id, room_type_id, arrival_date, departure_date, adults, children, currency, grand_total_minor, deposit_due_minor, expires_at, held_until, hold_note").eq("id", quoteId).maybeSingle();
  if (!q) throw new Error("quote not found");
  const row = q as QuoteCtx;
  const [stay, who] = await Promise.all([stayOf(admin, row.property_id, row.room_type_id, row), traveler(admin, row.traveler_user_id)]);
  return { q: row, stay, who, total: { minor: row.grand_total_minor, currency: row.currency }, deposit: { minor: row.deposit_due_minor, currency: row.currency } };
}

/** Request to Reserve stored: traveler acknowledgement + house copy. */
export function onRequestReceived(admin: Admin, quoteId: string, origin: string) {
  after(async () => {
    try {
      const c = await quoteCtx(admin, quoteId);
      await Promise.all([
        sendMail(c.who.email, E.requestReceived({ first: c.who.first, reference: c.q.public_reference, stay: c.stay, total: c.total, deposit: c.deposit, expiresAt: c.q.expires_at, tripsUrl: `${origin}/account/trips` })),
        sendMail(HOUSE_INBOX(), E.requestForHouse({ reference: c.q.public_reference, travelerName: c.who.name, travelerEmail: c.who.email, stay: c.stay, total: c.total, deposit: c.deposit, deskUrl: `${origin}/desk` }), c.who.email),
      ]);
    } catch (e) { log("request", e); }
  });
}

/** The house held the room. */
export function onHold(admin: Admin, quoteId: string, origin: string) {
  after(async () => {
    try {
      const c = await quoteCtx(admin, quoteId);
      if (!c.q.held_until) return;
      await sendMail(c.who.email, E.roomHeld({ first: c.who.first, reference: c.q.public_reference, stay: c.stay, heldUntil: c.q.held_until, note: c.q.hold_note, tripsUrl: `${origin}/account/trips` }));
    } catch (e) { log("hold", e); }
  });
}

/** Approved (price and room confirmed) or declined. */
export function onDecision(admin: Admin, quoteId: string, decision: "approved" | "declined", origin: string) {
  after(async () => {
    try {
      const c = await quoteCtx(admin, quoteId);
      await sendMail(c.who.email, E.decision({ first: c.who.first, reference: c.q.public_reference, stay: c.stay, decision, total: c.total, deposit: c.deposit, tripsUrl: `${origin}/account/trips` }));
    } catch (e) { log("decision", e); }
  });
}

type BookingCtx = { id: string; public_reference: string; traveler_user_id: string; property_id: string; room_type_id: string | null; arrival_date: string; departure_date: string; adults: number; children: number; currency: string; grand_total_minor: number | string; deposit_due_minor: number | string; deposit_paid_minor: number | string; balance_paid_minor: number | string; balance_due_date: string | null; partner_confirmation_number: string | null; traveler_note: string | null };
async function bookingCtx(admin: Admin, bookingId: string) {
  const { data: b } = await admin.from("bookings").select("id, public_reference, traveler_user_id, property_id, room_type_id, arrival_date, departure_date, adults, children, currency, grand_total_minor, deposit_due_minor, deposit_paid_minor, balance_paid_minor, balance_due_date, partner_confirmation_number, traveler_note").eq("id", bookingId).maybeSingle();
  if (!b) throw new Error("booking not found");
  const row = b as BookingCtx;
  const [stay, who] = await Promise.all([stayOf(admin, row.property_id, row.room_type_id, row), traveler(admin, row.traveler_user_id)]);
  const paid = Number(row.deposit_paid_minor) + Number(row.balance_paid_minor);
  const m = (minor: number | string) => ({ minor, currency: row.currency });
  return { b: row, stay, who, total: m(row.grand_total_minor), deposit: m(row.deposit_due_minor), paid: m(paid), outstanding: m(Math.max(0, Number(row.grand_total_minor) - paid)) };
}

/** The house recorded a booking (from a quote or by hand). */
export function onBookingRecorded(admin: Admin, bookingId: string, origin: string, canPayOnline: boolean) {
  after(async () => {
    try {
      const c = await bookingCtx(admin, bookingId);
      await sendMail(c.who.email, E.bookingRecorded({ first: c.who.first, reference: c.b.public_reference, stay: c.stay, total: c.total, deposit: c.deposit, balanceDue: c.b.balance_due_date, partnerRef: c.b.partner_confirmation_number, note: c.b.traveler_note, payUrl: `${origin}/account/trips`, canPayOnline }));
    } catch (e) { log("booking", e); }
  });
}

/** A payment settled (gateway webhook or recorded by the house): receipt + house copy. */
export function onPaymentSettled(admin: Admin, paymentId: string, origin: string) {
  after(async () => {
    try {
      const { data: p } = await admin.from("payments").select("id, public_reference, booking_id, kind, amount_minor, currency, provider, status").eq("id", paymentId).maybeSingle();
      if (!p || p.status !== "succeeded") return;
      const c = await bookingCtx(admin, p.booking_id);
      const amount = { minor: p.amount_minor, currency: p.currency };
      await Promise.all([
        sendMail(c.who.email, E.paymentReceived({ first: c.who.first, reference: c.b.public_reference, receipt: p.public_reference, stay: c.stay, kind: p.kind, amount, paid: c.paid, outstanding: c.outstanding, balanceDue: c.b.balance_due_date, tripsUrl: `${origin}/account/trips` })),
        sendMail(HOUSE_INBOX(), E.paymentForHouse({ reference: c.b.public_reference, receipt: p.public_reference, travelerName: c.who.name, stay: c.stay, kind: p.kind, amount, provider: p.provider, outstanding: c.outstanding, deskUrl: `${origin}/desk` }), c.who.email),
      ]);
    } catch (e) { log("payment", e); }
  });
}
