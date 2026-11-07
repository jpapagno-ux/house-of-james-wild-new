import Link from "next/link";
import { requireAdvisor } from "@/lib/platform/advisor";
import { myEarnings } from "@/lib/platform/advisor-file-data";
import { LINE_STATUS, earningTotals } from "@/lib/platform/commission-ledger";
import { money } from "@/lib/platform/advisor-requests";
import { niceDate } from "@/lib/platform/labels";
import { Empty, PageHead, StatusPill } from "@/components/platform/ui";

export const metadata = { title: "Earnings" };

// The advisor's own statement: each booking, the sale and their share in money, and where it stands.
// Never the partner's rate, the gross commission or the house's share (decision 3).
export default async function AdvisorEarnings() {
  const a = await requireAdvisor("/advisor/earnings");
  const rows = await myEarnings(a.sb);
  const t = earningTotals(rows);
  return (
    <>
      <PageHead eyebrow="Advisor Desk · Earnings" title="Earnings"
        lead={`Your share on every booking you sold, fixed when the house recorded it (${a.tier.label}). You are paid once the client has travelled and the partner has paid the house.`} />
      {t.size > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[...t.entries()].map(([c, x]) => (
            <div key={c} className="bg-white border ledger-border p-4 grid grid-cols-2 gap-3">
              <div><p className="ledger-eyebrow">On the way ({c})</p><p className="ledger-display text-[1.6rem] tabular-nums">{money(x.coming, c)}</p></div>
              <div><p className="ledger-eyebrow">Paid to you ({c})</p><p className="ledger-display text-[1.6rem] tabular-nums">{money(x.paid, c)}</p></div>
            </div>
          ))}
        </div>
      )}
      {rows.length ? (
        <ul className="mt-8 border-y ledger-border divide-y ledger-border" aria-label="Your bookings and earnings">
          {rows.map((r) => (
            <li key={r.id} className="py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="ledger-id text-[12.5px]">{r.ref}</span>
              <span className="ledger-display text-[1.15rem]">{r.request_id ? <Link className="hover:underline" href={`/advisor/requests/${r.request_id}`}>{r.stay_name}</Link> : r.stay_name}</span>
              <span className="text-[13.5px]">{r.client_name ?? ""} · {niceDate(r.arrival)} · sold {money(r.sell_minor, r.currency)}</span>
              <span className="ml-auto flex items-center gap-3"><StatusPill label={LINE_STATUS[r.status].advisor} tone={LINE_STATUS[r.status].tone} /><span className="tabular-nums text-[15px] font-medium">{money(r.advisor_minor, r.currency)}</span></span>
              {r.status === "advisor_paid" && r.paid_on && <span className="w-full text-[12.5px] ledger-muted">Paid {niceDate(r.paid_on)}{r.paid_reference ? `, ${r.paid_reference}` : ""}</span>}
            </li>
          ))}
        </ul>
      ) : <div className="mt-8"><Empty title="Nothing recorded yet">When the house confirms a stay you requested and records it, it appears here with your share.</Empty></div>}
    </>
  );
}
