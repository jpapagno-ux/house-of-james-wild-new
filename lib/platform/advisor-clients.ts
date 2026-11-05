// Advisor Desk · My clients (step 2). Pure: turns the folios, quotes and bookings an advisor sold (the
// database already returns only theirs) into one line per client, and works out what needs their eye.
// No imports, so plain Node can test it.

export type Person = { id: string; first_name: string | null; last_name: string | null; email: string | null };
export type FolioRow = { id: string; owner_user_id: string; title: string; status: string; start_date: string | null; end_date: string | null; updated_at: string };
export type QuoteRow = {
  id: string; public_reference: string | null; traveler_user_id: string; property_id: string; arrival_date: string; departure_date: string;
  status: string; advisor_status: string; held_until: string | null; expires_at: string; grand_total_minor: number; currency: string; created_at: string;
};
export type BookingRow = {
  id: string; public_reference: string | null; traveler_user_id: string; property_id: string; arrival_date: string; departure_date: string;
  status: string; balance_due_date: string | null; grand_total_minor: number; deposit_paid_minor: number | null; balance_paid_minor: number | null; currency: string;
};

export type Client = {
  id: string; name: string; email: string | null;
  folios: number; openQuotes: number; bookings: number;
  nextArrival: string | null; lastActivity: string | null;
};

export type Attention = { kind: "hold_ending" | "quote_waiting" | "quote_expiring" | "balance_due" | "arriving"; clientId: string; ref: string; date: string; text: string };

const OPEN_QUOTE = new Set(["draft", "pricing", "quoted", "revalidation_required"]);
const LIVE_BOOKING = new Set(["confirmed", "deposit_paid", "paid"]);
const day = (iso: string) => iso.slice(0, 10);
const addDays = (iso: string, n: number) => new Date(Date.parse(`${day(iso)}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);

export const isOpenQuote = (q: Pick<QuoteRow, "status" | "advisor_status">) => OPEN_QUOTE.has(q.status) && q.advisor_status !== "declined";
export const isLiveBooking = (b: Pick<BookingRow, "status">) => LIVE_BOOKING.has(b.status);

export function personName(p: Person | undefined): string {
  if (!p) return "Client";
  const n = [p.first_name, p.last_name].map((x) => x?.trim()).filter(Boolean).join(" ");
  return n || p.email || "Client";
}

/** One line per client, soonest arrival first, then most recent activity. */
export function buildClients(people: Person[], folios: FolioRow[], quotes: QuoteRow[], bookings: BookingRow[], today: string): Client[] {
  const byId = new Map(people.map((p) => [p.id, p]));
  const ids = new Set<string>([...folios.map((f) => f.owner_user_id), ...quotes.map((q) => q.traveler_user_id), ...bookings.map((b) => b.traveler_user_id)]);
  const out: Client[] = [];
  for (const id of ids) {
    const f = folios.filter((x) => x.owner_user_id === id);
    const q = quotes.filter((x) => x.traveler_user_id === id);
    const b = bookings.filter((x) => x.traveler_user_id === id);
    const arrivals = b.filter((x) => isLiveBooking(x) && day(x.arrival_date) >= today).map((x) => day(x.arrival_date)).sort();
    const activity = [...f.map((x) => x.updated_at), ...q.map((x) => x.created_at)].filter(Boolean).sort().reverse();
    out.push({
      id, name: personName(byId.get(id)), email: byId.get(id)?.email ?? null,
      folios: f.length, openQuotes: q.filter(isOpenQuote).length, bookings: b.filter(isLiveBooking).length,
      nextArrival: arrivals[0] ?? null, lastActivity: activity[0] ? day(activity[0]) : null,
    });
  }
  return out.sort((a, b) => {
    if (a.nextArrival && b.nextArrival) return a.nextArrival.localeCompare(b.nextArrival);
    if (a.nextArrival) return -1;
    if (b.nextArrival) return 1;
    return (b.lastActivity ?? "").localeCompare(a.lastActivity ?? "") || a.name.localeCompare(b.name);
  });
}

/** What needs the advisor's eye in the next weeks, soonest first. */
export function attention(people: Person[], quotes: QuoteRow[], bookings: BookingRow[], today: string): Attention[] {
  const name = (id: string) => personName(people.find((p) => p.id === id));
  const out: Attention[] = [];
  for (const q of quotes.filter(isOpenQuote)) {
    const ref = q.public_reference ?? "Quote";
    if (q.advisor_status === "held" && q.held_until && day(q.held_until) <= addDays(today, 3) && day(q.held_until) >= today)
      out.push({ kind: "hold_ending", clientId: q.traveler_user_id, ref, date: day(q.held_until), text: `Hold for ${name(q.traveler_user_id)} ends` });
    else if (q.advisor_status === "pending")
      out.push({ kind: "quote_waiting", clientId: q.traveler_user_id, ref, date: day(q.created_at), text: `${name(q.traveler_user_id)}'s quote is waiting for the house` });
    else if (day(q.expires_at) >= today && day(q.expires_at) <= addDays(today, 5))
      out.push({ kind: "quote_expiring", clientId: q.traveler_user_id, ref, date: day(q.expires_at), text: `${name(q.traveler_user_id)}'s quote expires` });
  }
  for (const b of bookings.filter(isLiveBooking)) {
    const ref = b.public_reference ?? "Booking";
    const paid = (b.deposit_paid_minor ?? 0) + (b.balance_paid_minor ?? 0);
    if (b.status !== "paid" && b.balance_due_date && day(b.balance_due_date) >= today && day(b.balance_due_date) <= addDays(today, 30) && paid < b.grand_total_minor)
      out.push({ kind: "balance_due", clientId: b.traveler_user_id, ref, date: day(b.balance_due_date), text: `${name(b.traveler_user_id)}'s balance is due` });
    if (day(b.arrival_date) >= today && day(b.arrival_date) <= addDays(today, 14))
      out.push({ kind: "arriving", clientId: b.traveler_user_id, ref, date: day(b.arrival_date), text: `${name(b.traveler_user_id)} arrives` });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function money(minor: number, currency: string): string {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(minor / 100).replace(/\u00a0/g, " "); }
  catch { return `${currency} ${(minor / 100).toFixed(0)}`; }
}

export const QUOTE_LABEL: Record<string, string> = {
  pending: "Waiting for the house", held: "On hold", approved: "Approved", declined: "Declined",
};
export const BOOKING_LABEL: Record<string, string> = {
  confirmed: "Confirmed", deposit_paid: "Deposit paid", paid: "Paid in full", cancelled: "Cancelled", stayed: "Travelled",
};
export const FOLIO_LABEL: Record<string, string> = {
  idea: "Idea", planning: "Planning", proposed: "Proposed", booked: "Booked", traveling: "Travelling", archived: "Archived",
};
