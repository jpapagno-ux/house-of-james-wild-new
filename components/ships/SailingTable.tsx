import Link from "next/link";
import type { DatesData, Sailing } from "@/lib/content/ships/fares";
import { undash } from "@/lib/content/ships/types";

// Dates & rates as a cruise shopper reads them (James, 11 Nov 2026: "a plain sailing table (date, voyage, nights, from
// price per person, offer flag), which is the way cruise shoppers compare" ... "is there a way to organize the dates on
// mobile? It's showing a long scroll"). Sailings are grouped by month: each month is one line (the month, how many
// sailings, the lowest fare, an offer flag) that opens to its sailings, and the first two months open on arrival.
// A wide screen reads each sailing as a table row (dates, voyage, nights, from per person, offer, ask); a phone reads
// it as a two-line row (dates and nights, then the voyage, with the fare at the right). Native <details>, no script,
// so every sailing is in the page for search and answer engines.

export type SailingFlag = { id: string; short: string; sailingsUntil?: string; departure?: string };

const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const nightsOf = (x: Sailing) => x.nights ?? (x.dateTo ? Math.round((Date.parse(x.dateTo) - Date.parse(x.date)) / 86400000) : null);
const lowOf = (x: Sailing) => (x.prices.length ? Math.min(...x.prices.map(([, p]) => p)) : null);
// "Dreams of Tahiti, 7 nights" reads "Dreams of Tahiti": the nights have their own column
const voyageName = (r: string) => undash(r).replace(/,\s*\d+\s*nights?$/i, "");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "23 Nov to 3 Dec": the year sits on the month line above. */
const span = (x: Sailing) => {
  const a = `${Number(x.date.slice(8, 10))} ${SHORT[+x.date.slice(5, 7) - 1]}`;
  if (!x.dateTo) return a;
  const b = `${Number(x.dateTo.slice(8, 10))} ${SHORT[+x.dateTo.slice(5, 7) - 1]}${x.dateTo.slice(0, 4) !== x.date.slice(0, 4) ? ` ${x.dateTo.slice(0, 4)}` : ""}`;
  return `${a} to ${b}`;
};
const flagsOn = (x: Sailing, flags: SailingFlag[]) => flags.filter((f) => (f.departure ? f.departure === x.date : f.sailingsUntil ? x.date <= f.sailingsUntil : false));

function Flag({ f }: { f: SailingFlag }) {
  return <a href="#offers" className="inline-flex items-center border px-1.5 py-0.5 text-[10.5px] tracking-[0.12em] uppercase whitespace-nowrap" style={{ borderColor: "var(--tone-path, currentColor)", color: "var(--tone-path, inherit)" }}>{f.short}</a>;
}

function Row({ x, flags, unit }: { x: Sailing; flags: SailingFlag[]; unit: string }) {
  const low = lowOf(x);
  const n = nightsOf(x);
  const on = flagsOn(x, flags);
  const full = x.status === "Full";
  return (
    <li className={`border-t ledger-border py-3 grid gap-x-4 gap-y-1 grid-cols-[1fr_auto] md:grid-cols-[150px_1fr_90px_130px_150px] md:items-center ${full ? "opacity-60" : ""}`}>
      <p className="ledger-display text-[1.05rem] tabular-nums md:order-none">
        {span(x)}<span className="md:hidden text-[13px] font-sans ledger-muted">{n ? ` · ${n} nights` : ""}</span>
      </p>
      <p className="row-span-2 md:row-span-1 text-right md:order-4 md:text-right">
        {low ? <span className="block ledger-display text-[1.1rem] tabular-nums" style={{ color: "var(--tone-path, inherit)" }}>{usd(low)}</span> : <span className="ledger-muted text-[14px]">Ask us</span>}
        <span className="block text-[10.5px] tracking-[0.12em] uppercase ledger-muted">{unit}</span>
      </p>
      <p className="text-[14.5px] leading-snug md:order-2">{voyageName(x.route)}</p>
      <p className="hidden md:block md:order-3 text-[14px] tabular-nums">{n ? `${n} nights` : "To confirm"}</p>
      <p className="col-span-2 md:col-span-1 md:order-5 flex flex-wrap items-center gap-2 md:justify-end">
        {on.map((f) => <Flag key={f.id} f={f} />)}
        {x.status && x.status !== "Open" && <span className="text-[10.5px] tracking-[0.12em] uppercase ledger-crimson whitespace-nowrap">{x.status}</span>}
        <Link href={x.plan} className="text-[12px] underline underline-offset-4 whitespace-nowrap min-h-[32px] inline-flex items-center">{full ? "Join the waitlist" : "Ask James"}</Link>
      </p>
    </li>
  );
}

export default function SailingTable({ ship, data, flags = [], note, openMonths = 2, unit = "per person" }: { ship: string; data: DatesData; flags?: SailingFlag[]; note?: string; openMonths?: number; unit?: string }) {
  const rows = data.sailings;
  if (!rows.length) return null;
  const months = new Map<string, Sailing[]>();
  for (const x of rows) months.set(x.date.slice(0, 7), [...(months.get(x.date.slice(0, 7)) ?? []), x]);
  const voyages = [...new Set(rows.map((x) => voyageName(x.route)))];
  // years fold first (James, 11 Nov 2026: "a long scroll"): the year line says how many sailings and the lowest fare;
  // inside it, one line a month. The first year with sailings opens with its first two months open.
  const years = new Map<string, [string, Sailing[]][]>();
  for (const [ym, xs] of months) years.set(ym.slice(0, 4), [...(years.get(ym.slice(0, 4)) ?? []), [ym, xs]]);
  const MonthBlock = ({ ym, xs, open }: { ym: string; xs: Sailing[]; open: boolean }) => {
    const low = Math.min(...xs.map((x) => lowOf(x) ?? Infinity));
    const offered = xs.some((x) => flagsOn(x, flags).length);
    const left = xs.filter((x) => x.status !== "Full").length;
    return (
      <details open={open} className="group/m border-t ledger-border">
        <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center gap-3 py-3 min-h-[48px] pl-1 md:pl-3">
          <span className="ledger-display text-[1.1rem] flex-1">{MONTHS[+ym.slice(5) - 1]}</span>
          <span className="text-[12.5px] ledger-muted whitespace-nowrap">{xs.length} {xs.length === 1 ? "sailing" : "sailings"}{left < xs.length ? `, ${left} open` : ""}</span>
          {Number.isFinite(low) && <span className="text-[13px] tabular-nums whitespace-nowrap">from {usd(low)}</span>}
          {offered && <span aria-label="An offer applies" className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--tone-path, #8B2525)" }} />}
          <span aria-hidden="true" className="text-[18px] leading-none transition-transform group-open/m:rotate-45">+</span>
        </summary>
        <ul className="pb-3 md:pl-3">{xs.map((x) => <Row key={x.id} x={x} flags={flags} unit={unit} />)}</ul>
      </details>
    );
  };
  return (
    <div className="mt-8" aria-label={`Every published ${ship} sailing, by year and month`}>
     <p className="text-[13.5px] ledger-muted">{rows.length} sailings{voyages.length > 3 ? ` on ${voyages.length} itineraries` : voyages.length > 1 ? `: ${voyages.join(" and ")}` : ""}. Open a year, then a month.</p>
      <div className="hidden md:grid grid-cols-[150px_1fr_90px_130px_150px] gap-x-4 mt-5 pb-2 md:pl-3 text-[10.5px] tracking-[0.18em] uppercase ledger-muted" aria-hidden="true">
        <span>Dates</span><span>Voyage</span><span>Nights</span><span className="text-right">From</span><span className="text-right">Offers</span>
      </div>
      <div className="border-b ledger-rule">
        {[...years.entries()].map(([y, ms], yi) => {
          const all = ms.flatMap(([, xs]) => xs);
          const low = Math.min(...all.map((x) => lowOf(x) ?? Infinity));
          const offered = all.some((x) => flagsOn(x, flags).length);
          return (
            <details key={y} open={yi === 0} className="group border-t ledger-rule">
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center gap-3 py-4 min-h-[56px]">
                <span className="ledger-display text-[1.4rem] md:text-[1.6rem] flex-1">{y}</span>
                <span className="text-[13px] ledger-muted whitespace-nowrap">{all.length} sailings · {ms.length} {ms.length === 1 ? "month" : "months"}</span>
                {Number.isFinite(low) && <span className="hidden sm:inline text-[13.5px] tabular-nums whitespace-nowrap" style={{ color: "var(--tone-path, inherit)" }}>from {usd(low)}</span>}
                {offered && <span className="hidden md:inline text-[10.5px] tracking-[0.12em] uppercase whitespace-nowrap" style={{ color: "var(--tone-path, inherit)" }}>Offer</span>}
                <span aria-hidden="true" className="text-[22px] leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="pb-2">{ms.map(([ym, xs], mi) => <MonthBlock key={ym} ym={ym} xs={xs} open={yi === 0 && mi < openMonths} />)}</div>
            </details>
          );
        })}
      </div>
      {note && <p className="mt-5 text-[13px] leading-relaxed ledger-muted max-w-3xl">{note}</p>}
    </div>
  );
}
