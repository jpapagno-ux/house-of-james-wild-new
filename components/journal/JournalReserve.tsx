import type { ReactNode } from "react";
import SectionHead from "./SectionHead";

// JWC-STYLE-01, Stage 8. How to reserve: the steps on the left, a reservation slip on the right, then the Folio
// band. The slip is a worked sample from the filed rate card (every line passed in, already formatted); its button is
// the page's existing enquiry link, unchanged: a request to the house, never a payment.
export type SlipLine = { label: string; value: string; saving?: boolean };
type Props = {
  no: string;
  steps: { title: string; line: string }[];
  slip?: { fields: [string, string][]; lines: SlipLine[]; totalLabel: string; total: string; note: string } | null;
  reserve: { label: string; href: string };
  /** The existing save control (renders nothing while its flag is off). */
  save?: ReactNode;
  folio?: ReactNode;
};

export default function JournalReserve({ no, steps, slip, reserve, save, folio }: Props) {
  return (
    <section id="reserve" aria-label="How to reserve" className="bg-white">
      <SectionHead no={no} label="Check your dates" title="How to Reserve" lede="See every line before you ask for anything." />
      <div className="mt-9 grid lg:grid-cols-[0.8fr_1fr] gap-10 lg:gap-14 items-start">
        <ol className="border-t border-[color:var(--jw-keyline)]">
          {steps.map((x, i) => (
            <li key={x.title} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-2 border-b border-[color:var(--jw-hairline)] py-4">
              <span aria-hidden className="font-mono text-[10.5px] text-house pt-1.5">{String(i + 1).padStart(2, "0")}</span>
              <div><p className="font-display font-medium text-[20px] text-graphite">{x.title}</p><p className="mt-0.5 text-[13.5px] text-stone-text">{x.line}</p></div>
            </li>
          ))}
        </ol>
        <div className="border border-[color:var(--jw-hairline)] border-t-2 border-t-[color:var(--jw-crimson)] bg-white px-5 py-6 md:px-7">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-house">Reservation slip</p>
            {slip && <p className="font-mono text-[9.5px] tracking-[0.22em] uppercase text-stone-text">Sample quote</p>}
          </div>
          {slip ? (
            <>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
                {slip.fields.map(([k, v]) => <div key={k} className="border-b border-[color:var(--jw-graphite)] pb-2"><dt className="font-mono text-[9.5px] tracking-[0.22em] uppercase text-stone-text">{k}</dt><dd className="font-display text-[19px] text-graphite mt-1.5">{v}</dd></div>)}
              </dl>
              <dl className="mt-5">
                {slip.lines.map((l) => <div key={l.label} className="flex items-baseline justify-between gap-6 border-b border-[color:var(--jw-hairline)] py-3"><dt className="text-[14px] text-graphite">{l.label}</dt><dd className={`font-mono text-[12.5px] ${l.saving ? "text-house" : "text-graphite"}`}>{l.value}</dd></div>)}
              </dl>
              <div className="mt-6 flex items-baseline justify-between gap-6">
                <p className="font-mono text-[9.5px] tracking-[0.22em] uppercase text-stone-text">{slip.totalLabel}</p>
                <p className="font-display text-[34px] leading-none text-graphite">{slip.total}</p>
              </div>
            </>
          ) : <p className="mt-5 text-[14.5px] leading-relaxed text-stone-text">No rate is on file for this stay yet. Ask the house and it writes back with dates, the rate and what it includes.</p>}
          <div className="mt-6 flex flex-col gap-3 [&_.ledger-btn]:w-full [&_.ledger-btn]:justify-center">
            <a href={reserve.href} className="ledger-btn ledger-btn--house">{reserve.label}</a>
            {save}
          </div>
          {slip && <p className="mt-4 text-[12.5px] leading-relaxed text-stone-text">{slip.note}</p>}
        </div>
      </div>
      {folio}
    </section>
  );
}
