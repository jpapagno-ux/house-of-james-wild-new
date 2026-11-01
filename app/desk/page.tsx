import { currentUser } from "@/lib/booking-live/supabase/server";
import { quoteState, type BookingRow, type QuoteRow } from "@/lib/booking-live/bookings";
import DeskQueue from "@/components/desk/DeskQueue";

export const metadata = { title: "Requests & bookings" };

type Person = { first_name: string | null; last_name: string | null } | null;
type Q = QuoteRow & { traveler_user_id: string; hold_note: string | null; adults: number; children: number; advisor_note: string | null; property: { name: string; slug: string } | null; room: { name: string } | null };
type B = BookingRow & { traveler_user_id: string; traveler_note: string | null; partner_confirmation_number: string | null; property: { name: string } | null; room: { name: string } | null };

// The queue: every open request (waiting, held, confirmed-not-yet-booked) and
// every live booking, read with the advisor's session (RLS lets advisors read all).
export default async function DeskPage() {
  const { sb } = await currentUser();
  const [{ data: quotes }, { data: bookings }] = await Promise.all([
    sb.from("quotes").select("id, public_reference, status, advisor_status, expires_at, held_until, hold_note, arrival_date, departure_date, adults, children, grand_total_minor, deposit_due_minor, balance_due_date, currency, created_at, advisor_note, traveler_user_id, property:properties(name, slug), room:room_types(name)").neq("status", "converted").order("created_at", { ascending: false }).limit(100),
    sb.from("bookings").select("id, public_reference, status, arrival_date, departure_date, grand_total_minor, deposit_due_minor, deposit_paid_minor, balance_paid_minor, balance_due_date, currency, partner_confirmation_number, traveler_note, created_at, traveler_user_id, property:properties(name), room:room_types(name)").in("status", ["confirmed", "deposit_paid", "paid"]).order("arrival_date", { ascending: true }).limit(100),
  ]);
  // Travelers' names: quotes and bookings reference auth.users, so profiles are read separately (RLS: advisors may read them).
  const ids = [...new Set([...(quotes ?? []), ...(bookings ?? [])].map((r) => (r as { traveler_user_id: string }).traveler_user_id))];
  const { data: people } = ids.length ? await sb.from("profiles").select("id, first_name, last_name").in("id", ids) : { data: [] };
  const person = new Map<string, Person>((people ?? []).map((p) => [p.id as string, { first_name: p.first_name, last_name: p.last_name }]));
  const qs = ((quotes ?? []) as unknown as Q[]).map((q) => ({ ...q, state: quoteState(q), traveler: person.get(q.traveler_user_id) ?? null }));
  const bs = ((bookings ?? []) as unknown as B[]).map((b) => ({ ...b, traveler: person.get(b.traveler_user_id) ?? null }));
  return (
    <section>
      <p className="ledger-eyebrow ledger-crimson">Advisor Desk</p>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] leading-[1.1]">Requests &amp; Bookings</h1>
      <p className="mt-3 text-[16px] ledger-muted max-w-2xl">Every price here is the traveler&rsquo;s stored quote; nothing is re-priced. Confirm only once the property has confirmed the room.</p>
      <DeskQueue quotes={qs.filter((q) => ["waiting", "held", "confirmed"].includes(q.state))} bookings={bs} />
    </section>
  );
}
