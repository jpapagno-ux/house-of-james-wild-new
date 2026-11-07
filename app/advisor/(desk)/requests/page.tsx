import Link from "next/link";
import { requireAdvisor } from "@/lib/platform/advisor";
import { advisorRequests } from "@/lib/platform/advisor-file-data";
import { REQUEST_STATUS, money, nightsBetween, party } from "@/lib/platform/advisor-requests";
import { niceDate } from "@/lib/platform/labels";
import { Empty, PageHead, StatusPill, TextLink } from "@/components/platform/ui";

export const metadata = { title: "Quote requests" };

export default async function AdvisorRequests() {
  const a = await requireAdvisor("/advisor/requests");
  const rows = await advisorRequests(a.sb, { advisorId: a.advisor.id });
  return (
    <>
      <PageHead eyebrow="Advisor Desk · Quote requests" title="Quote requests"
        lead="Ask the house to price and hold a stay for your client. Start from any stay in the Ledger; the house prices it, checks space and holds it, and you share it with your client."
        actions={<TextLink href="/advisor/ledger">Find a stay in the Ledger</TextLink>} />
      {rows.length ? (
        <ul className="mt-8 grid gap-3" aria-label="Your quote requests">
          {rows.map((r) => {
            const s = REQUEST_STATUS[r.status];
            return (
              <li key={r.id}>
                <Link href={`/advisor/requests/${r.id}`} className="grid gap-1 bg-white border ledger-border p-4 md:p-5 hover:bg-[#F7F5F2] md:grid-cols-[1fr_auto]">
                  <span>
                    <span className="flex flex-wrap items-baseline gap-x-3"><span className="ledger-display text-[1.25rem]">{r.stay_name}</span><span className="ledger-id text-[12px]">{r.ref}</span></span>
                    <span className="block text-[14px]">{r.client_name} · {niceDate(r.arrival)}, {nightsBetween(r.arrival, r.departure)} nights · {party(r.adults, r.child_ages)}</span>
                  </span>
                  <span className="flex md:flex-col md:items-end gap-2 text-[13px]">
                    <StatusPill label={s.label} tone={s.tone} />
                    {r.price_minor && r.currency ? <span className="tabular-nums">{money(r.price_minor, r.currency)}</span> : null}
                    {r.status === "held" && r.hold_until ? <span className="ledger-muted">held to {niceDate(r.hold_until)}</span> : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : <div className="mt-8"><Empty title="No requests yet">Open a stay in the Ledger and choose Request a quote.</Empty></div>}
    </>
  );
}
