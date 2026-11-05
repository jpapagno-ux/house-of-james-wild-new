import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingRow, FolioRow, Person, QuoteRow } from "./advisor-clients";

// An advisor's book: the folios, quotes and bookings they sold, their clients' names, and the stay names.
// Read with the advisor's own session: the database returns only their own (step 1 rules), so nothing
// here filters by advisor itself.
export type Book = { folios: FolioRow[]; quotes: QuoteRow[]; bookings: BookingRow[]; people: Person[]; stays: Map<string, string> };

export async function loadBook(sb: SupabaseClient, advisorId: string, clientId?: string): Promise<Book> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const by = (q: any, col: string): any => (clientId ? q.eq(col, clientId) : q);
  const [f, q, b] = (await Promise.all([
    by(sb.from("folios").select("id, owner_user_id, title, status, start_date, end_date, updated_at").eq("selling_advisor_id", advisorId), "owner_user_id").order("updated_at", { ascending: false }).limit(500),
    by(sb.from("quotes").select("id, public_reference, traveler_user_id, property_id, arrival_date, departure_date, status, advisor_status, held_until, expires_at, grand_total_minor, currency, created_at").eq("selling_advisor_id", advisorId), "traveler_user_id").order("created_at", { ascending: false }).limit(500),
    by(sb.from("bookings").select("id, public_reference, traveler_user_id, property_id, arrival_date, departure_date, status, balance_due_date, grand_total_minor, deposit_paid_minor, balance_paid_minor, currency").eq("selling_advisor_id", advisorId), "traveler_user_id").order("arrival_date", { ascending: true }).limit(500),
  ])) as { data: unknown[] | null }[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const folios = (f.data ?? []) as FolioRow[], quotes = (q.data ?? []) as QuoteRow[], bookings = (b.data ?? []) as BookingRow[];
  const ids = [...new Set([...folios.map((x) => x.owner_user_id), ...quotes.map((x) => x.traveler_user_id), ...bookings.map((x) => x.traveler_user_id)])];
  const props = [...new Set([...quotes.map((x) => x.property_id), ...bookings.map((x) => x.property_id)])];
  const [p, s] = await Promise.all([
    ids.length ? sb.from("profiles").select("id, first_name, last_name, email").in("id", ids) : Promise.resolve({ data: [] }),
    props.length ? sb.from("properties").select("id, name").in("id", props) : Promise.resolve({ data: [] }),
  ]);
  return { folios, quotes, bookings, people: (p.data ?? []) as Person[], stays: new Map(((s.data ?? []) as { id: string; name: string }[]).map((x) => [x.id, x.name])) };
}
