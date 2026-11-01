import Link from "next/link";
import { requireTraveler } from "@/lib/booking-live/account";
import { quoteState, type BookingRow, type QuoteRow } from "@/lib/booking-live/bookings";
import { BookingCard, RequestCard } from "@/components/trips/TripCards";

export const metadata = { title: "Trips" };

// The traveler's trips: bookings (recorded by the house) and requests
// (quotes: waiting, on hold, confirmed, declined, expired). Read with the
// traveler's own session, so row-level security decides what they see.
type Q = QuoteRow & { property: { name: string; slug: string } | null; room: { name: string } | null };
type B = BookingRow & { property: { name: string; slug: string } | null; room: { name: string } | null };

export default async function TripsPage() {
  const { sb } = await requireTraveler("/account/trips");
  const [{ data: quotes }, { data: bookings }] = await Promise.all([
    sb.from("quotes").select("id, public_reference, status, advisor_status, expires_at, held_until, arrival_date, departure_date, grand_total_minor, deposit_due_minor, balance_due_date, currency, created_at, property:properties(name, slug), room:room_types(name)").order("created_at", { ascending: false }).limit(50),
    sb.from("bookings").select("id, public_reference, status, arrival_date, departure_date, grand_total_minor, deposit_due_minor, deposit_paid_minor, balance_paid_minor, balance_due_date, currency, partner_confirmation_number, traveler_note, created_at, property:properties(name, slug), room:room_types(name)").order("arrival_date", { ascending: false }).limit(50),
  ]);
  const qs = ((quotes ?? []) as unknown as Q[]).filter((q) => q.status !== "converted");
  const bs = (bookings ?? []) as unknown as B[];
  const open = qs.filter((q) => ["waiting", "held", "confirmed"].includes(quoteState(q)));
  const past = qs.filter((q) => !open.includes(q));
  const upcoming = bs.filter((b) => b.status !== "cancelled" && b.status !== "stayed");
  const done = bs.filter((b) => !upcoming.includes(b));
  const withSlug = (q: Q) => ({ ...q, property_slug: q.property?.slug ?? null });
  const empty = !qs.length && !bs.length;
  return (
    <section>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] leading-[1.1]">Your Trips</h1>
      <p className="mt-3 text-[17px] max-w-2xl ledger-muted">Requests the house is working on, rooms on hold, and the bookings themselves. Nothing here is charged without you; the house confirms every room with the property first.</p>
      {empty && (
        <div className="mt-8 border ledger-rule p-6 max-w-2xl">
          <p className="ledger-display text-xl">Nothing on the shelf yet</p>
          <p className="mt-2 text-[15.5px]">Find a stay, check your dates, and Request to Reserve. It appears here the moment you do.</p>
          <Link href="/stays" className="ledger-btn mt-4">See the stays</Link>
        </div>
      )}
      {upcoming.length > 0 && <Shelf title="Booked" count={upcoming.length}>{upcoming.map((b) => <BookingCard key={b.id} b={b} propertyName={b.property?.name ?? "Your stay"} roomName={b.room?.name ?? null} />)}</Shelf>}
      {open.length > 0 && <Shelf title="With the house" count={open.length}>{open.map((q) => <RequestCard key={q.id} q={withSlug(q)} propertyName={q.property?.name ?? "Your stay"} roomName={q.room?.name ?? null} />)}</Shelf>}
      {past.length > 0 && <Shelf title="Earlier requests" count={past.length}>{past.map((q) => <RequestCard key={q.id} q={withSlug(q)} propertyName={q.property?.name ?? "Your stay"} roomName={q.room?.name ?? null} />)}</Shelf>}
      {done.length > 0 && <Shelf title="Stayed & cancelled" count={done.length}>{done.map((b) => <BookingCard key={b.id} b={b} propertyName={b.property?.name ?? "Your stay"} roomName={b.room?.name ?? null} />)}</Shelf>}
    </section>
  );
}

function Shelf({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <div className="flex items-baseline justify-between border-b ledger-rule pb-2"><h2 className="ledger-display text-[1.35rem]">{title}</h2><p className="text-[13px] ledger-muted">{count}</p></div>
      <ul className="mt-5 grid gap-5">{children}</ul>
    </div>
  );
}
