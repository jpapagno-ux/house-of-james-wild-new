import Link from "next/link";
import { isPast, today } from "@/lib/dates";

// Whole-yacht charter rates as the operator publishes them (Indonesia, James, 2 Nov 2026): Rascal
// Voyages and Celestia publish a nightly rate for the yacht, and Rascal Voyages a "from" for single
// cabins on its scheduled voyages. No dates are shown or implied, and a year's rate drops once the
// year has passed (lib/dates.ts). Commercial terms never appear here.
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;

export default function CharterRates({ ship, rates, basis, cabinFrom, planHref, note }: {
  ship: string; rates: { label: string; rate: number }[]; basis?: string; cabinFrom?: { rate: number; basis: string }; planHref: string; note?: string;
}) {
  const on = today();
  const live = rates.filter((r) => !/^\d{4}$/.test(r.label) || !isPast(r.label, on));
  return (
    <div className="mt-7">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={`${ship} published rates`}>
        {live.map((r) => (
          <li key={r.label} className="border ledger-border p-5 bg-paper-card">
            <p className="ledger-eyebrow">{/^\d{4}$/.test(r.label) ? `Whole yacht, ${r.label}` : r.label}</p>
            <p className="mt-2 ledger-display text-[30px] leading-none">{usd(r.rate)}</p>
            <p className="mt-2 text-[14px] ledger-muted leading-snug">{basis ?? "a night for the whole yacht, as published"}</p>
          </li>
        ))}
        {cabinFrom && (
          <li className="border ledger-border p-5">
            <p className="ledger-eyebrow">One cabin, scheduled voyages</p>
            <p className="mt-2 ledger-display text-[30px] leading-none">From {usd(cabinFrom.rate)}</p>
            <p className="mt-2 text-[14px] ledger-muted leading-snug">{cabinFrom.basis}; dates on request</p>
          </li>
        )}
      </ul>
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-t ledger-rule pt-5">
        <p className="text-[15px] leading-relaxed max-w-2xl">Tell James your dates and your party, and he confirms what is open on {ship} and what the operator includes for your route.</p>
        <Link href={planHref} className="ledger-btn ledger-btn--solid !py-2.5 self-start shrink-0">Ask us for dates</Link>
      </div>
      {note && <p className="mt-4 text-[13px] ledger-muted leading-relaxed max-w-3xl">{note}</p>}
    </div>
  );
}
