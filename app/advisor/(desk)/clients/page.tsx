import Link from "next/link";
import { requireAdvisor } from "@/lib/platform/advisor";
import { loadBook } from "@/lib/platform/advisor-book";
import { buildClients } from "@/lib/platform/advisor-clients";
import { niceDate } from "@/lib/platform/labels";
import { Empty, PageHead } from "@/components/platform/ui";

export const metadata = { title: "My clients" };

export default async function AdvisorClients() {
  const a = await requireAdvisor("/advisor/clients");
  const book = await loadBook(a.sb, a.advisor.id);
  const today = new Date().toISOString().slice(0, 10);
  const clients = buildClients(book.people, book.folios, book.quotes, book.bookings, today);
  return (
    <>
      <PageHead eyebrow="Advisor Desk · My clients" title="My clients" lead="Everyone you are planning for or have booked, soonest arrival first." />
      {clients.length ? (
        <>
          {/* tablet and desktop */}
          <table className="hidden md:table mt-8 w-full text-[14.5px]">
            <thead>
              <tr className="text-left border-b ledger-rule">
                <th scope="col" className="ledger-eyebrow py-2 pr-4 font-normal">Client</th>
                <th scope="col" className="ledger-eyebrow py-2 pr-4 font-normal text-right">Trips in planning</th>
                <th scope="col" className="ledger-eyebrow py-2 pr-4 font-normal text-right">Open quotes</th>
                <th scope="col" className="ledger-eyebrow py-2 pr-4 font-normal text-right">Bookings</th>
                <th scope="col" className="ledger-eyebrow py-2 font-normal">Next arrival</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b ledger-border">
                  <td className="py-3 pr-4"><Link href={`/advisor/clients/${c.id}`} className="font-medium hover:underline">{c.name}</Link>{c.email && <span className="block text-[13px] ledger-muted">{c.email}</span>}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{c.folios}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{c.openQuotes}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{c.bookings}</td>
                  <td className="py-3 tabular-nums">{c.nextArrival ? niceDate(c.nextArrival) : <span className="ledger-muted">None booked</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* phones */}
          <ul className="md:hidden mt-6 divide-y ledger-border border-y ledger-border">
            {clients.map((c) => (
              <li key={c.id} className="py-3">
                <Link href={`/advisor/clients/${c.id}`} className="font-medium text-[16px]">{c.name}</Link>
                <p className="text-[13.5px] ledger-muted">{c.nextArrival ? `Arrives ${niceDate(c.nextArrival)}` : "No trip booked"} · {c.openQuotes} open quote{c.openQuotes === 1 ? "" : "s"} · {c.folios} in planning</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-8"><Empty title="No clients yet">When the house assigns you a client, or a trip you sell is recorded, the client appears here.</Empty></div>
      )}
    </>
  );
}
