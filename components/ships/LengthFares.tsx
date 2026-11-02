import Link from "next/link";
import type { LengthFare } from "@/lib/content/ships/types";

// Fares by cruise length, for an operator that publishes no dated departures (Via Natura's
// Hermes, James 2 Nov 2026): one row per length, per person for each published year, and the
// full-vessel charter where published. No dates are shown or implied: the panel says "Ask us
// for dates". Phones get one card per length; wider screens a table. Nothing scrolls sideways.
const usd = (n: number | undefined) => (typeof n === "number" && n > 0 ? `US$${n.toLocaleString("en-US")}` : "Not published");

export default function LengthFares({ ship, fares, planHref, note, maxGuests }: { ship: string; fares: LengthFare[]; planHref: string; note?: string; maxGuests?: number }) {
  const years = [...new Set(fares.flatMap((f) => Object.keys(f.perPerson)))].sort();
  const charter = fares.some((f) => f.charter && Object.keys(f.charter).length);
  return (
    <div className="mt-7">
      <div className="border ledger-border p-5 md:p-6 bg-paper-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="ledger-eyebrow ledger-crimson">Ask us for dates</p>
          <p className="mt-1.5 text-[15.5px] leading-relaxed max-w-2xl">The operator publishes fares by cruise length, not dated departures. Pick a length, and James confirms the dates and suites open for you.</p>
        </div>
        <Link href={planHref} className="ledger-btn ledger-btn--solid !py-2.5 self-start md:self-center shrink-0">Ask us for dates</Link>
      </div>

      {/* Phones: a card per cruise length. */}
      <ul className="mt-6 grid gap-3 md:hidden" aria-label={`${ship} fares by cruise length`}>
        {fares.map((f) => (
          <li key={f.duration} className="border ledger-border p-4">
            <p className="ledger-display text-[19px] leading-snug">{f.duration}</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-[14.5px]">
              {years.map((y) => <div key={y}><dt className="ledger-eyebrow">{y}, per person</dt><dd className="mt-0.5 font-mono">{usd(f.perPerson[y])}</dd></div>)}
              {charter && years.map((y) => <div key={`c${y}`}><dt className="ledger-eyebrow">{y}, full charter</dt><dd className="mt-0.5 font-mono">{usd(f.charter?.[y])}</dd></div>)}
            </dl>
          </li>
        ))}
      </ul>

      {/* Tablets and up: one table. */}
      <table className="mt-6 hidden md:table w-full text-[15px] border-collapse">
        <caption className="sr-only">{ship} fares by cruise length, in US dollars</caption>
        <thead>
          <tr className="border-b ledger-rule text-left">
            <th scope="col" className="py-3 pr-4 ledger-eyebrow font-normal">Cruise length</th>
            {years.map((y) => <th key={y} scope="col" className="py-3 pr-4 ledger-eyebrow font-normal text-right">{y}, per person</th>)}
            {charter && years.map((y) => <th key={`c${y}`} scope="col" className="py-3 pr-4 ledger-eyebrow font-normal text-right">{y}, full charter</th>)}
          </tr>
        </thead>
        <tbody>
          {fares.map((f) => (
            <tr key={f.duration} className="border-b ledger-border">
              <th scope="row" className="py-3 pr-4 text-left font-normal ledger-display text-[17px]">{f.duration}</th>
              {years.map((y) => <td key={y} className="py-3 pr-4 text-right font-mono">{usd(f.perPerson[y])}</td>)}
              {charter && years.map((y) => <td key={`c${y}`} className="py-3 pr-4 text-right font-mono ledger-muted">{usd(f.charter?.[y])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-[13.5px] leading-relaxed ledger-muted max-w-3xl">Per person, cruise only, two sharing{charter ? `; the full charter is the whole vessel${maxGuests ? ` for up to ${maxGuests} guests` : ""}` : ""}.{note ? ` ${note}` : ""}</p>
    </div>
  );
}
