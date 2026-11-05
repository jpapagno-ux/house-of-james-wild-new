import { notFound } from "next/navigation";
import { requireAdvisor } from "@/lib/platform/advisor";
import { loadBook } from "@/lib/platform/advisor-book";
import { BOOKING_LABEL, FOLIO_LABEL, QUOTE_LABEL, isLiveBooking, isOpenQuote, money, personName } from "@/lib/platform/advisor-clients";
import { isUuid } from "@/lib/platform/validate";
import { niceDate } from "@/lib/platform/labels";
import { Empty, PageHead, Section, StatusPill, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Client" };

export default async function AdvisorClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const a = await requireAdvisor(`/advisor/clients/${id}`);
  const book = await loadBook(a.sb, a.advisor.id, id);
  // The database shows only the advisor's own: nothing here means not their client.
  if (!book.folios.length && !book.quotes.length && !book.bookings.length) notFound();
  const person = book.people.find((p) => p.id === id);
  const stay = (pid: string) => book.stays.get(pid) ?? "Stay";
  return (
    <>
      <PageHead eyebrow="Advisor Desk · Client" title={personName(person)} lead={person?.email ?? undefined} actions={<TextLink href="/advisor/clients">All clients</TextLink>} />

      <Section title="Bookings">
        {book.bookings.length ? (
          <ul className="divide-y ledger-border border-y ledger-border">
            {book.bookings.map((b) => (
              <li key={b.id} className="py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-[15px] font-medium">{stay(b.property_id)}</span>
                <StatusPill label={BOOKING_LABEL[b.status] ?? b.status} tone={b.status === "cancelled" ? "closed" : b.status === "paid" || b.status === "stayed" ? "good" : "progress"} />
                <span className="text-[13.5px] ledger-muted tabular-nums">{niceDate(b.arrival_date)} to {niceDate(b.departure_date)}</span>
                <span className="text-[13.5px] tabular-nums">{money(b.grand_total_minor, b.currency)}</span>
                {isLiveBooking(b) && b.status !== "paid" && b.balance_due_date && <span className="text-[13.5px] ledger-muted">Balance due {niceDate(b.balance_due_date)}</span>}
                <span className="ml-auto font-mono text-[11.5px] ledger-muted">{b.public_reference}</span>
              </li>
            ))}
          </ul>
        ) : <Empty title="No bookings yet" />}
      </Section>

      <Section title="Quotes">
        {book.quotes.length ? (
          <ul className="divide-y ledger-border border-y ledger-border">
            {book.quotes.map((q) => (
              <li key={q.id} className="py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-[15px] font-medium">{stay(q.property_id)}</span>
                <StatusPill label={q.status === "converted" ? "Booked" : q.status === "expired" ? "Expired" : QUOTE_LABEL[q.advisor_status] ?? q.advisor_status}
                  tone={!isOpenQuote(q) ? "closed" : q.advisor_status === "approved" ? "good" : q.advisor_status === "held" ? "attention" : "progress"} />
                <span className="text-[13.5px] ledger-muted tabular-nums">{niceDate(q.arrival_date)} to {niceDate(q.departure_date)}</span>
                <span className="text-[13.5px] tabular-nums">{money(q.grand_total_minor, q.currency)}</span>
                {q.advisor_status === "held" && q.held_until && <span className="text-[13.5px] ledger-muted">Held until {niceDate(q.held_until)}</span>}
                <span className="ml-auto font-mono text-[11.5px] ledger-muted">{q.public_reference}</span>
              </li>
            ))}
          </ul>
        ) : <Empty title="No quotes yet" />}
      </Section>

      <Section title="Trips in planning">
        {book.folios.length ? (
          <ul className="divide-y ledger-border border-y ledger-border">
            {book.folios.map((f) => (
              <li key={f.id} className="py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-[15px] font-medium">{f.title}</span>
                <StatusPill label={FOLIO_LABEL[f.status] ?? f.status} tone={f.status === "archived" ? "closed" : f.status === "booked" ? "good" : "progress"} />
                {f.start_date && <span className="text-[13.5px] ledger-muted tabular-nums">{niceDate(f.start_date)}{f.end_date ? ` to ${niceDate(f.end_date)}` : ""}</span>}
                <span className="ml-auto text-[12.5px] ledger-muted">Updated {niceDate(f.updated_at)}</span>
              </li>
            ))}
          </ul>
        ) : <Empty title="No folios yet" />}
      </Section>
    </>
  );
}
