import Link from "next/link";
import { requireAdvisor } from "@/lib/platform/advisor";
import { loadBook } from "@/lib/platform/advisor-book";
import { attention, buildClients, isLiveBooking, isOpenQuote, money, personName } from "@/lib/platform/advisor-clients";
import { niceDate } from "@/lib/platform/labels";
import { Empty, PageHead, Panel, Section, StatusPill, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Overview" };

const KIND_TONE = { hold_ending: "attention", quote_waiting: "progress", quote_expiring: "attention", balance_due: "attention", arriving: "good" } as const;
const KIND_LABEL = { hold_ending: "Hold ending", quote_waiting: "With the house", quote_expiring: "Quote expiring", balance_due: "Balance due", arriving: "Arriving" } as const;

export default async function AdvisorOverview() {
  const a = await requireAdvisor("/advisor");
  const book = await loadBook(a.sb, a.advisor.id);
  const today = new Date().toISOString().slice(0, 10);
  const clients = buildClients(book.people, book.folios, book.quotes, book.bookings, today);
  const eye = attention(book.people, book.quotes, book.bookings, today).slice(0, 8);
  const upcoming = book.bookings.filter((b) => isLiveBooking(b) && b.arrival_date >= today).slice(0, 5);
  const counts: [string, number, string][] = [
    ["Clients", clients.length, "/advisor/clients"],
    ["Open quotes", book.quotes.filter(isOpenQuote).length, "/advisor/clients"],
    ["Upcoming trips", book.bookings.filter((b) => isLiveBooking(b) && b.arrival_date >= today).length, "/advisor/clients"],
    ["Trips in planning", book.folios.filter((f) => ["idea", "planning", "proposed"].includes(f.status)).length, "/advisor/clients"],
  ];
  const first = a.advisor.display_name.split(" ")[0];
  return (
    <>
      <PageHead eyebrow="Advisor Desk · Overview" title={`Welcome back, ${first}`}
        lead="Your clients, their quotes and their trips. Everything on this desk is yours alone: no other advisor sees it." />
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {counts.map(([label, n, href]) => (
          <Link key={label} href={href} className="bg-white border ledger-border p-4 hover:bg-[#F7F5F2]">
            <p className="ledger-eyebrow">{label}</p>
            <p className="ledger-display text-[2.2rem] leading-none mt-2 tabular-nums">{n}</p>
          </Link>
        ))}
      </div>

      <Section title="Needs your eye" aside={eye.length ? `${eye.length} item${eye.length === 1 ? "" : "s"}` : undefined}>
        {eye.length ? (
          <ul className="divide-y ledger-border border-y ledger-border">
            {eye.map((i) => (
              <li key={`${i.kind}-${i.ref}`} className="py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <StatusPill label={KIND_LABEL[i.kind]} tone={KIND_TONE[i.kind]} />
                <Link href={`/advisor/clients/${i.clientId}`} className="text-[15px] hover:underline">{i.text}</Link>
                <span className="text-[13.5px] ledger-muted tabular-nums">{niceDate(i.date)}</span>
                <span className="ml-auto font-mono text-[11.5px] ledger-muted">{i.ref}</span>
              </li>
            ))}
          </ul>
        ) : <Empty title="Nothing waiting on you">Holds ending, quotes with the house, balances due and arrivals in the next two weeks appear here.</Empty>}
      </Section>

      <div className="mt-2 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Next arrivals">
          {upcoming.length ? (
            <ul className="divide-y ledger-border border-y ledger-border">
              {upcoming.map((b) => (
                <li key={b.id} className="py-3">
                  <p className="text-[15px]"><Link href={`/advisor/clients/${b.traveler_user_id}`} className="hover:underline">{personName(book.people.find((p) => p.id === b.traveler_user_id))}</Link> · {book.stays.get(b.property_id) ?? "Stay"}</p>
                  <p className="text-[13.5px] ledger-muted tabular-nums">{niceDate(b.arrival_date)} to {niceDate(b.departure_date)} · {money(b.grand_total_minor, b.currency)}</p>
                </li>
              ))}
            </ul>
          ) : <Empty title="No trips booked yet">Bookings you sell appear here, soonest first.</Empty>}
        </Section>
        <Section title="Your plan">
          <Panel>
            <p className="ledger-eyebrow">{a.tier.label}</p>
            <p className="ledger-display text-[2rem] leading-none mt-2 tabular-nums">{a.tier.shareBp / 100}%</p>
            <p className="mt-3 text-[14.5px] leading-relaxed">of the house&rsquo;s commission on every booking you sell. {a.tier.assigned && a.tier.since ? `Since ${niceDate(a.tier.since)}.` : "The house confirms your tier when your file is complete."}</p>
            <p className="mt-3 text-[13px] ledger-muted">Your earnings statement opens with the commission ledger.</p>
          </Panel>
        </Section>
      </div>

      <p className="mt-10"><TextLink href="/advisor/clients">All my clients</TextLink></p>
    </>
  );
}
