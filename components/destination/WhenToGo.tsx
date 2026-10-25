import { CalendarDays, Plane } from "lucide-react";

// When to go & getting there: a twelve-month band per area (best / good /
// wettest) and the arrival airports with typical transfer times.
export type Season = "best" | "good" | "wet";
export type MonthRow = { area: string; months: Season[]; note?: string }; // 12 entries, Jan→Dec
const M = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CELL: Record<Season, string> = { best: "bg-crimson text-paper", good: "bg-coast-mist text-coast-deep", wet: "bg-paper-card text-ink/40" };
const LABEL: Record<Season, string> = { best: "Best", good: "Good", wet: "Wettest" };

export default function WhenToGo({ place, rows, airports, transfers }: { place: string; rows: MonthRow[]; airports: [string, string][]; transfers: [string, string][] }) {
  return (
    <section id="when" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32" aria-labelledby="when-heading">
      <p className="ledger-eyebrow ledger-crimson flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> When to go &amp; getting there</p>
      <h2 id="when-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">The Months, and the Way In</h2>
      <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 items-start">
        <div className="relative min-w-0 overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px] border-separate border-spacing-[3px]">
            <caption className="sr-only">Best, good and wettest months by area in {place}</caption>
            <thead><tr><th className="text-left ledger-eyebrow font-normal pr-3">Area</th>{M.map((m, i) => <th key={i} scope="col" className="ledger-eyebrow font-normal w-8"><abbr title={MONTH_NAMES[i]} className="no-underline">{m}</abbr></th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.area}>
                  <th scope="row" className="text-left font-normal pr-3 py-1 align-middle"><span className="ledger-display text-[15px] block leading-snug">{r.area}</span>{r.note && <span className="text-[12px] ledger-muted">{r.note}</span>}</th>
                  {r.months.map((s, i) => <td key={i} className={`h-9 text-center ${CELL[s]}`} title={`${MONTH_NAMES[i]}: ${LABEL[s]}`}><span className="sr-only">{MONTH_NAMES[i]}: {LABEL[s]}</span></td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 flex flex-wrap gap-4 text-[12.5px] ledger-muted">{(["best", "good", "wet"] as Season[]).map((s) => <span key={s} className="inline-flex items-center gap-1.5"><span className={`inline-block w-3.5 h-3.5 ${CELL[s]}`} />{LABEL[s]}</span>)}</p>
        </div>
        <div>
          <p className="ledger-eyebrow flex items-center gap-2"><Plane className="w-3.5 h-3.5 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /> Fly into</p>
          <dl className="mt-2 border-t ledger-rule">{airports.map(([k, v]) => <div key={k} className="py-2.5 border-b ledger-rule"><dt className="ledger-display text-[16px]">{k}</dt><dd className="text-[14px] ledger-muted">{v}</dd></div>)}</dl>
          <p className="ledger-eyebrow mt-6">Typical transfers</p>
          <dl className="mt-2 border-t ledger-rule">{transfers.map(([k, v]) => <div key={k} className="py-2 border-b ledger-rule flex justify-between gap-4 text-[14px]"><dt>{k}</dt><dd className="text-right ledger-muted">{v}</dd></div>)}</dl>
        </div>
      </div>
    </section>
  );
}
