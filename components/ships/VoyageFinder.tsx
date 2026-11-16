"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { FinderRow } from "@/lib/content/ships/seadream";

// The voyage finder (James, 16 Nov 2026: "any ideas to ease navigation"): every published voyage of a fleet in one
// list a traveller narrows by where, when, how long and which yacht. Squared graphite chips (.house-chip), never pills.
// The whole list is in the page on arrival, so search and answer engines read every voyage; the chips only hide rows.

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const day = (iso: string) => `${Number(iso.slice(8, 10))} ${MON[+iso.slice(5, 7) - 1]}`;
const LENGTHS: [string, string, (n: number) => boolean][] = [["short", "Up to 6 nights", (n) => n <= 6], ["week", "7 to 9 nights", (n) => n >= 7 && n <= 9], ["long", "10 nights or more", (n) => n >= 10]];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={on} onClick={onClick} className={`house-chip min-h-[40px] px-3 text-[13px] whitespace-nowrap ${on ? "is-on" : ""}`} style={on ? { background: "#2E2B28", color: "#fff", borderColor: "#2E2B28" } : undefined}>{children}</button>;
}

export default function VoyageFinder({ rows, start = {} }: { rows: FinderRow[]; start?: { region?: string; ship?: string } }) {
  const [region, setRegion] = useState<string | null>(start.region ?? null);
  const [ship, setShip] = useState<string | null>(start.ship ?? null);
  const [year, setYear] = useState<string | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [len, setLen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(24);

  const regions = useMemo(() => { const m = new Map<string, [string, number]>(); for (const r of rows) m.set(r.region, [r.regionName, (m.get(r.region)?.[1] ?? 0) + 1]); return [...m.entries()].sort((a, b) => b[1][1] - a[1][1]); }, [rows]);
  const ships = useMemo(() => [...new Map(rows.map((r) => [r.ship, r.shipName])).entries()].sort(), [rows]);
  const years = useMemo(() => [...new Set(rows.map((r) => r.date.slice(0, 4)))].sort(), [rows]);
  const bahamas = rows.filter((r) => r.bahamas).length;
  const words = q.trim().toLowerCase();
  const hits = rows.filter((r) =>
    (!region || (region === "bahamas" ? r.bahamas : r.region === region)) && (!ship || r.ship === ship) && (!year || r.date.startsWith(year)) && (month == null || +r.date.slice(5, 7) === month + 1) &&
    (!len || LENGTHS.find((l) => l[0] === len)![2](r.nights)) && (!words || `${r.title} ${r.calls} ${r.direction}`.toLowerCase().includes(words)));
  const any = region || ship || year || month != null || len || words;
  const pick = <T,>(cur: T | null, v: T, set: (x: T | null) => void) => { set(cur === v ? null : v); setShown(24); };
  const clear = () => { setRegion(null); setShip(null); setYear(null); setMonth(null); setLen(null); setQ(""); setShown(24); };

  return (
    <div>
      <div className="grid gap-4">
        <div><p className="ledger-eyebrow mb-2">Where</p><div className="flex flex-wrap gap-2">
          {bahamas > 0 && <Chip on={region === "bahamas"} onClick={() => pick(region, "bahamas", setRegion)}>The Bahamas · {bahamas}</Chip>}
          {regions.map(([k, [name, n]]) => <Chip key={k} on={region === k} onClick={() => pick(region, k, setRegion)}>{name} · {n}</Chip>)}
        </div></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><p className="ledger-eyebrow mb-2">When</p><div className="flex flex-wrap gap-2">{years.map((y) => <Chip key={y} on={year === y} onClick={() => pick(year, y, setYear)}>{y}</Chip>)}</div>
            <div className="mt-2 flex flex-wrap gap-2">{MON.map((m, i) => <Chip key={m} on={month === i} onClick={() => pick(month, i, setMonth)}>{m}</Chip>)}</div></div>
          <div><p className="ledger-eyebrow mb-2">Yacht and length</p><div className="flex flex-wrap gap-2">{ships.map(([k, n]) => <Chip key={k} on={ship === k} onClick={() => pick(ship, k, setShip)}>{n}</Chip>)}</div>
            <div className="mt-2 flex flex-wrap gap-2">{LENGTHS.map(([k, label]) => <Chip key={k} on={len === k} onClick={() => pick(len, k, setLen)}>{label}</Chip>)}</div></div>
        </div>
        <label className="block max-w-md"><span className="ledger-eyebrow block mb-2">A port or an island</span>
          <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(24); }} placeholder="St Barths, Santorini, Exuma" className="w-full h-11 border ledger-border bg-paper px-3 text-[16px]" /></label>
      </div>
      <p className="mt-6 text-[14px] ledger-muted" aria-live="polite">{hits.length} of {rows.length} voyages{any ? <> · <button type="button" onClick={clear} className="underline underline-offset-4">Clear</button></> : null}</p>
      <ul className="mt-3 border-t ledger-rule">
        {hits.map((r, i) => (
          <li key={r.href} hidden={i >= shown} className="border-b ledger-rule">
            <Link href={r.href} className="grid gap-x-4 gap-y-0.5 grid-cols-[1fr_auto] md:grid-cols-[170px_1fr_150px_140px] md:items-center py-3.5 hover:bg-[rgba(244,242,239,.6)]">
              <span className="ledger-display text-[1.05rem] tabular-nums">{day(r.date)} to {day(r.dateTo)} {r.dateTo.slice(0, 4)}</span>
              <span className="row-span-2 md:row-span-1 md:order-4 text-right"><span className="block ledger-display text-[1.1rem] tabular-nums">{r.waitlisted ? "Waitlist" : r.from$ ? usd(r.from$) : "Ask us"}</span><span className="block text-[10.5px] tracking-[0.12em] uppercase ledger-muted">{r.waitlisted || !r.from$ ? "" : "from, per person"}</span></span>
              <span className="md:order-2 text-[15px] leading-snug"><span className="underline underline-offset-4 decoration-[0.5px]">{r.title}</span>{r.maiden ? <span className="ml-2 text-[10.5px] tracking-[0.12em] uppercase text-house">Inaugural voyage</span> : null}<span className="block text-[13px] ledger-muted">{r.direction} · {r.calls}</span></span>
              <span className="hidden md:block md:order-3 text-[13.5px] ledger-muted">{r.shipName} · {r.nights} nights</span>
              <span className="md:hidden col-span-2 text-[12.5px] ledger-muted">{r.shipName} · {r.nights} nights</span>
            </Link>
          </li>
        ))}
      </ul>
      {hits.length === 0 && <p className="mt-4 text-[15.5px]">No published voyage matches. Clear a filter, or ask James: he can see sailings before they reach this list.</p>}
      {hits.length > shown && <p className="mt-5"><button type="button" onClick={() => setShown(shown + 48)} className="ledger-btn">Show more voyages ({hits.length - shown} more)</button></p>}
    </div>
  );
}
