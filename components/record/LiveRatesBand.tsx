"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, RefreshCcw, Users } from "lucide-react";
import type { RatePlan } from "@/lib/rates";
import { FL_TAX_RATE } from "@/lib/pricing";

// LiveRatesBand: the live booking-engine band for a stay page. Reads
// /api/rates (15-minute cache) for the guest's dates and party, shows each
// rate plan's rooms with per-night and stay totals, and deep-links into the
// engine. If the engine can't be reached it says so plainly and keeps the
// engine link, so the guest is never stuck.

type Result = { nights: number; adults: number; currency: string; engineUrl: string; plans: RatePlan[]; available: boolean; fetchedAt: string };
const PLAN_NOTE: Record<string, string> = { "Length of Stay Discount": "Stay longer, pay less · the engine's length-of-stay rate", "Best Available Rate": "Flexible · the engine's standard rate" };

const iso = (d: Date) => d.toISOString().slice(0, 10);
function defaults() { const a = new Date(); a.setDate(a.getDate() + 45); const b = new Date(a); b.setDate(b.getDate() + 3); return { checkIn: iso(a), checkOut: iso(b) }; }

export default function LiveRatesBand({ property, name }: { property: string; name: string }) {
  const [q, setQ] = useState({ checkIn: "", checkOut: "", adults: 2 });
  const [today, setToday] = useState("");
  const [state, setState] = useState<"loading" | "ok" | "none" | "error">("loading");
  const [res, setRes] = useState<Result | null>(null);
  const [engine, setEngine] = useState("");

  const run = useCallback(async (p: typeof q) => {
    setState("loading");
    const qs = new URLSearchParams({ property, checkIn: p.checkIn, checkOut: p.checkOut, adults: String(p.adults) });
    try {
      const r = await fetch(`/api/rates?${qs}`);
      const j = await r.json();
      if (j.engineUrl) setEngine(j.engineUrl);
      if (!r.ok) { setState("error"); return; }
      setRes(j); setState(j.available ? "ok" : "none");
    } catch { setState("error"); }
  }, [property]);

  useEffect(() => { const d = { ...defaults(), adults: 2 }; setToday(iso(new Date())); setQ(d); run(d); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (n: number, c = "USD") => `${c === "USD" ? "US$" : `${c} `}${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fetched = res ? new Date(res.fetchedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "";

  return (
    <section id="live-rates" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[240px]" aria-labelledby="live-heading">
      <p className="ledger-eyebrow">Live rates · booking engine by Tag Albie</p>
      <h2 id="live-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">What {name} Costs on Your Dates</h2>
      <p className="mt-3 text-[16px] ledger-muted max-w-3xl">The booking engine&rsquo;s own price for your dates and party, refreshed every 15 minutes. The house confirms every quote before anything is booked.</p>
      <div className="mt-6 border ledger-border bg-paper">
        <form className="flex flex-wrap items-end gap-4 px-5 py-4 border-b ledger-rule bg-paper-card/60" onSubmit={(e) => { e.preventDefault(); run(q); }}>
          <label className="block"><span className="ledger-eyebrow flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Check-in</span><input type="date" value={q.checkIn} min={today || undefined} onChange={(e) => setQ({ ...q, checkIn: e.target.value })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]" /></label>
          <label className="block"><span className="ledger-eyebrow">Check-out</span><input type="date" value={q.checkOut} min={q.checkIn} onChange={(e) => setQ({ ...q, checkOut: e.target.value })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]" /></label>
          <label className="block"><span className="ledger-eyebrow flex items-center gap-1.5"><Users className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Adults</span><select value={q.adults} onChange={(e) => setQ({ ...q, adults: Number(e.target.value) })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]">{[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n}>{n}</option>)}</select></label>
          <button type="submit" className="ledger-btn inline-flex items-center gap-2"><RefreshCcw className={`w-3.5 h-3.5 ${state === "loading" ? "animate-spin" : ""}`} strokeWidth={1.5} aria-hidden="true" /> Update search</button>
          {state === "ok" && <span className="ml-auto ledger-eyebrow ledger-crimson inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" /> Live · {fetched}</span>}
        </form>
        <div aria-live="polite">
          {state === "loading" && <p className="px-5 py-8 ledger-muted">Asking the booking engine…</p>}
          {state === "error" && <p className="px-5 py-8">The booking engine didn&rsquo;t answer just now. Open it directly below, or ask James for a quote.</p>}
          {state === "none" && <p className="px-5 py-8">Nothing is available for those dates and that party. Try other dates, or ask James: he often knows a way in.</p>}
          {state === "ok" && res && (
            <div className="divide-y divide-[rgba(45,42,38,0.16)]">
              {res.plans.flatMap((p) => p.rooms.map((r) => (
                <div key={p.plan + r.name} className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 px-5 py-4 items-baseline">
                  <div><p className="ledger-display text-xl">{r.name}</p><p className="ledger-eyebrow mt-0.5">{p.plan}</p></div>
                  <p className="text-[14px] ledger-muted">{PLAN_NOTE[p.plan] ?? ""}</p>
                  <p className="md:text-right"><span className="ledger-display text-xl">{fmt(r.total / res.nights, res.currency)}</span> <span className="ledger-eyebrow">/ night</span></p>
                  <p className="md:text-right text-[14px] ledger-muted">{fmt(r.total, res.currency)} for {res.nights} {res.nights === 1 ? "night" : "nights"}<span className="block text-[12.5px]">{fmt(r.total * (1 + FL_TAX_RATE), res.currency)} with 7% Florida sales tax</span></p>
                </div>
              )))}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t ledger-rule flex flex-wrap items-center gap-4">
          {engine && <a href={engine} className="ledger-btn inline-flex items-center gap-2" data-event="booking_outbound">Book on the engine <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></a>}
          <a href={`/plan?trip=${encodeURIComponent(name)}&travellers=${q.adults}`} className="ledger-btn-ghost">Or ask James for a quote</a>
          <p className="text-[13px] ledger-muted max-w-xl w-full md:w-auto">Prices are the engine&rsquo;s totals for the whole stay, before the hotel&rsquo;s own taxes and fees. James Wild &amp; Co adds 7% Florida sales tax to every booking. Dynamic pricing changes with dates, occupancy and season.</p>
        </div>
      </div>
    </section>
  );
}
