"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCcw, Users } from "lucide-react";
import type { AccommodationUnit, StayCommerce } from "@/lib/stay-page/contract";
import { resolvePricingState, type LiveResult, type LiveSearch } from "@/lib/stay-page/pricing";
import AccommodationCard from "./AccommodationCard";
import AccommodationDetail from "./AccommodationDetail";

// "Choose your stay": every canonical unit as a calm card, grouped rooms and
// suites first, then units taken whole. One search (dates, adults) asks the
// live booking engine through the existing /api/rates route (15-minute cache)
// when the stay has a live engine; the answer is merged per unit by
// lib/stay-page/pricing.ts, so each card's state is resolved on its own.
// A unit without a live answer never falls back to an imported rate.

type EngineResponse = { nights: number; currency: string; engineUrl: string; plans: { plan: string; rooms: { name: string; total: number }[] }[]; available: boolean; fetchedAt: string };
const PROVIDER = "Tag Albie booking engine";
const iso = (d: Date) => d.toISOString().slice(0, 10);
const defaults = (): LiveSearch => { const a = new Date(); a.setDate(a.getDate() + 45); const b = new Date(a); b.setDate(b.getDate() + 3); return { checkIn: iso(a), checkOut: iso(b), adults: 2 }; };
const GROUPS: { key: AccommodationUnit["group"]; title: string; line: string }[] = [
  { key: "room", title: "Rooms & Suites", line: "" },
  { key: "whole", title: "Taken Whole", line: "Villas, cottages and houses for a family or a party travelling together." },
];

export default function AccommodationCollection({ units, commerce, stayName, staySlug }: { units: AccommodationUnit[]; commerce: StayCommerce; stayName: string; staySlug: string }) {
  const liveProperty = commerce.liveEngineProperty;
  const usesLive = !!liveProperty && (commerce.pricingMode === "LIVE_DYNAMIC" || commerce.pricingMode === "HYBRID" || units.some((u) => u.pricingMode === "LIVE_DYNAMIC" || u.pricingMode === "HYBRID"));
  const [q, setQ] = useState<LiveSearch>({ checkIn: "", checkOut: "", adults: 2 });
  const [search, setSearch] = useState<LiveSearch | null>(null);
  const [today, setToday] = useState("");
  const [live, setLive] = useState<LiveResult | null>(null);
  const [engineUrl, setEngineUrl] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const run = useCallback(async (p: LiveSearch) => {
    if (!usesLive || !liveProperty || !p.checkIn || !p.checkOut) return;
    setSearch(p);
    setLive({ status: "loading", nights: 0, currency: "USD", fetchedAt: null, provider: PROVIDER, plans: [] });
    try {
      const r = await fetch(`/api/rates?${new URLSearchParams({ property: liveProperty, checkIn: p.checkIn, checkOut: p.checkOut, adults: String(p.adults) })}`);
      const j = (await r.json()) as Partial<EngineResponse> & { error?: string };
      if (j.engineUrl) setEngineUrl(j.engineUrl);
      if (!r.ok || !j.plans) { setLive({ status: "error", nights: 0, currency: "USD", fetchedAt: null, provider: PROVIDER, plans: [] }); return; }
      setLive({ status: j.available ? "ok" : "none", nights: j.nights ?? 0, currency: j.currency ?? "USD", fetchedAt: j.fetchedAt ?? new Date().toISOString(), provider: PROVIDER, plans: j.plans });
    } catch { setLive({ status: "error", nights: 0, currency: "USD", fetchedAt: null, provider: PROVIDER, plans: [] }); }
  }, [usesLive, liveProperty]);

  useEffect(() => { const d = defaults(); setToday(iso(new Date())); setQ(d); run(d); }, [run]);

  const states = useMemo(() => new Map(units.map((u) => [u.code, resolvePricingState(u, search, live)])), [units, search, live]);
  const liveCount = [...states.values()].filter((s) => s.kind === "live").length;
  const current = open ? units.find((u) => u.code === open) ?? null : null;

  return (
    <section id="rates" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby="choose-heading">
      <p className="ledger-eyebrow ledger-crimson">Choose your stay</p>
      <h2 id="choose-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Where You&rsquo;ll Sleep at {stayName}</h2>
      <p className="mt-3 text-[16px] ledger-muted max-w-3xl">{usesLive ? "Pick your dates and the engine prices what it has open. Everything else is designed with the property and confirmed by the house." : "Every unit is priced with the property and confirmed by the house before anything is booked."}</p>

      {usesLive && (
        <form className="mt-6 md:sticky md:top-[118px] lg:top-[150px] z-20 flex flex-wrap items-end gap-3 md:gap-4 px-4 md:px-5 py-3 border ledger-border bg-paper/95 backdrop-blur" onSubmit={(e) => { e.preventDefault(); run(q); }}>
          <label className="block"><span className="ledger-eyebrow flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Check-in</span><input type="date" value={q.checkIn} min={today || undefined} onChange={(e) => setQ({ ...q, checkIn: e.target.value })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]" /></label>
          <label className="block"><span className="ledger-eyebrow">Check-out</span><input type="date" value={q.checkOut} min={q.checkIn || undefined} onChange={(e) => setQ({ ...q, checkOut: e.target.value })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]" /></label>
          <label className="block"><span className="ledger-eyebrow flex items-center gap-1.5"><Users className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Adults</span><select value={q.adults} onChange={(e) => setQ({ ...q, adults: Number(e.target.value) })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]">{[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n}>{n}</option>)}</select></label>
          <button type="submit" className="ledger-btn inline-flex items-center gap-2"><RefreshCcw className={`w-3.5 h-3.5 ${live?.status === "loading" ? "animate-spin" : ""}`} strokeWidth={1.5} aria-hidden="true" /> See rates</button>
          <p className="w-full md:w-auto md:ml-auto text-[13px]" aria-live="polite">
            {live?.status === "loading" && <span className="ledger-muted">Asking the booking engine…</span>}
            {live?.status === "ok" && <span className="text-vol-stays inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-vol-stays" aria-hidden="true" /> {liveCount} of {units.length} priced live · {live.nights} {live.nights === 1 ? "night" : "nights"}</span>}
            {live?.status === "none" && <span>Nothing open for those dates. Try others, or ask James.</span>}
            {live?.status === "error" && <span>The engine didn&rsquo;t answer; the house can quote instead.</span>}
          </p>
        </form>
      )}

      {GROUPS.map((g) => {
        const list = units.filter((u) => u.group === g.key);
        if (!list.length) return null;
        return (
          <div key={g.key} className="mt-10">
            <div className="flex items-baseline justify-between gap-4 border-b ledger-rule pb-2">
              <h3 className="ledger-display text-[1.35rem]">{g.title}</h3>
              <p className="text-[13px] ledger-muted">{list.length} {list.length === 1 ? "option" : "options"}{g.line ? ` · ${g.line}` : ""}</p>
            </div>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((u) => <AccommodationCard key={u.code} unit={u} state={states.get(u.code)!} onOpen={() => setOpen(u.code)} />)}
            </ul>
          </div>
        );
      })}

      <p className="mt-6 text-[13px] ledger-muted max-w-3xl">{usesLive ? "Live rates are the engine's totals for your dates in US dollars, before the estate's own taxes, refreshed every 15 minutes; James Wild & Co adds 7% Florida sales tax at checkout. " : ""}Nothing is booked or charged on this page.</p>

      {current && <AccommodationDetail unit={current} state={states.get(current.code)!} stayName={stayName} staySlug={staySlug} engineUrl={engineUrl} travellers={search?.adults ?? q.adults} dates={search ? { checkIn: search.checkIn, checkOut: search.checkOut } : null} onClose={() => setOpen(null)} />}
    </section>
  );
}
