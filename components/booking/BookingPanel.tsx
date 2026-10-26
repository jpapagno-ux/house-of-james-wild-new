"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BedDouble, CalendarDays, Check, RefreshCcw, Users, X } from "lucide-react";
import type { RatePlan } from "@/lib/rates";
import type { PricedRoom } from "@/lib/content/priced-stays";
import Carousel from "./Carousel";

// The booking panel for stays with live pricing. One search (dates, guests)
// prices every room from the engine; each room is a card with its own photo
// carousel, the live rate options and a Select button that opens the sample
// checkout. Rooms the engine doesn't price for those dates keep their registry
// "from" rate and offer a quote instead.

type Result = { nights: number; adults: number; currency: string; engineUrl: string; plans: RatePlan[]; available: boolean; fetchedAt: string };
type Live = { plan: string; total: number }[];
type Pick = { room: PricedRoom; plan: string; total: number } | null;

const iso = (d: Date) => d.toISOString().slice(0, 10);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
const usd = (n: number) => `US$${Math.round(n).toLocaleString("en-US")}`;
const zar = (n: number) => `R${n.toLocaleString("en-US")}`;
const nice = (d: string) => (d ? new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "");
const PLAN_NOTE: Record<string, string> = { "Best Available Rate": "Flexible rate", "Length of Stay Discount": "Stay longer, pay less" };

function Checkout({ pick, q, nights, name, included, excluded, policies, engine, onClose, hostHref }: { hostHref?: string; pick: NonNullable<Pick>; q: { checkIn: string; checkOut: string; adults: number }; nights: number; name: string; included: string[]; excluded: string[]; policies: string[]; engine: string; onClose: () => void }) {
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "" });
  const ok = f.name.trim().length > 1 && /.+@.+\..+/.test(f.email);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); document.addEventListener("keydown", k); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="co-title">
      <button type="button" className="absolute inset-0 bg-black/45" aria-label="Close checkout" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-paper shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-paper border-b ledger-rule px-6 py-4 flex items-center justify-between z-10">
          <p id="co-title" className="ledger-eyebrow ledger-crimson">{done ? "Folio request received" : "Checkout · sample"}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1"><X className="w-5 h-5" strokeWidth={1.5} /></button>
        </div>
        {!done ? (
          <div className="px-6 py-6">
            <div className="relative aspect-[16/9] bg-paper-card"><Image src={pick.room.photos[0]} alt={pick.room.name} fill sizes="480px" className="object-cover" /></div>
            <h3 className="ledger-display text-2xl mt-4">{pick.room.name}</h3>
            <p className="text-[14px] ledger-muted">{name} · {pick.plan}</p>
            <dl className="mt-5 border-t ledger-rule text-[15px]">
              {[["Dates", `${nice(q.checkIn)} → ${nice(q.checkOut)}`], ["Guests", `${q.adults} ${q.adults === 1 ? "adult" : "adults"}`], [`${usd(pick.total / nights)} × ${nights} ${nights === 1 ? "night" : "nights"}`, usd(pick.total)], ["Taxes & fees", "Shown by the engine"]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-2.5 border-b ledger-rule"><dt className="ledger-muted">{k}</dt><dd className="text-right">{v}</dd></div>)}
              <div className="flex justify-between gap-4 py-3"><dt className="ledger-display text-xl">Total before tax</dt><dd className="ledger-display text-xl ledger-crimson">{usd(pick.total)}</dd></div>
            </dl>
            <details className="mt-2 border-t ledger-rule group" open>
              <summary className="py-3 cursor-pointer ledger-eyebrow list-none [&::-webkit-details-marker]:hidden">Included &amp; not included</summary>
              <ul className="pb-3 grid gap-1.5 text-[14px]">{included.map((x) => <li key={x} className="flex gap-2"><Check className="w-3.5 h-3.5 mt-1 ledger-crimson shrink-0" strokeWidth={1.5} />{x}</li>)}{excluded.map((x) => <li key={x} className="flex gap-2 ledger-muted"><X className="w-3.5 h-3.5 mt-1 shrink-0" strokeWidth={1.5} />{x}</li>)}</ul>
            </details>
            <details className="border-t border-b ledger-rule">
              <summary className="py-3 cursor-pointer ledger-eyebrow list-none [&::-webkit-details-marker]:hidden">Cancellation &amp; payment</summary>
              <ul className="pb-3 grid gap-1.5 text-[14px]">{policies.map((x) => <li key={x}>{x}</li>)}</ul>
            </details>
            <form className="mt-6 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (ok) setDone(true); }}>
              <p className="ledger-eyebrow">Lead traveller</p>
              {(["name", "email", "phone"] as const).map((k) => <label key={k} className="block"><span className="text-[13px] ledger-muted capitalize">{k === "phone" ? "Phone (optional)" : k}</span><input type={k === "email" ? "email" : k === "phone" ? "tel" : "text"} required={k !== "phone"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 w-full bg-paper border ledger-border px-3 py-2 text-[16px]" autoComplete={k === "name" ? "name" : k} /></label>)}
              <button type="submit" disabled={!ok} className="ledger-btn w-full justify-center mt-2 disabled:opacity-50">Book now · sample</button>
              {hostHref && <a href={hostHref} onClick={onClose} className="text-center text-[15px] text-[#3b2716] -rotate-[1deg] hover:text-crimson" style={{ fontFamily: "'Homemade Apple', cursive" }} data-event="booking_host_click">Not sure yet? Meet the host first ↓</a>}
              <p className="text-[12.5px] ledger-muted">Sample checkout for the team: nothing is charged or sent. Live, this creates a Folio request to myfolio@jameswildco.com and the house confirms with the estate before any payment.</p>
            </form>
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <Image src="/brand/jwco-hare-240.png" alt="" width={80} height={80} className="mx-auto w-20 h-20 object-contain" />
            <h3 className="ledger-display text-3xl mt-4">Your Folio request is in.</h3>
            <p className="mt-3 text-[15.5px]">{pick.room.name} at {name}, {nice(q.checkIn)} to {nice(q.checkOut)}, {usd(pick.total)} before tax. The house confirms availability with the estate and replies within 24 hours.</p>
            <p className="mt-2 text-[13px] ledger-muted">(Sample: no request was sent.)</p>
            <div className="mt-6 flex flex-col gap-3">
              {engine && <a href={engine} className="ledger-btn justify-center inline-flex items-center gap-2" data-event="booking_outbound">Or book direct on the engine <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} /></a>}
              <button type="button" onClick={onClose} className="ledger-btn-ghost">Back to the rooms</button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export default function BookingPanel({ property, name, rooms, included, excluded, policies, hostHref }: { property: string; name: string; rooms: PricedRoom[]; included: string[]; excluded: string[]; policies: string[]; hostHref?: string }) {
  const [q, setQ] = useState({ checkIn: "", checkOut: "", adults: 2 });
  const [today, setToday] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "none" | "error">("idle");
  const [res, setRes] = useState<Result | null>(null);
  const [engine, setEngine] = useState("");
  const [tab, setTab] = useState<"room" | "house">("room");
  const [plan, setPlan] = useState<Record<string, string>>({});
  const [pick, setPick] = useState<Pick>(null);

  const run = useCallback(async (p: typeof q) => {
    if (!p.checkIn) return;
    setState("loading");
    try {
      const r = await fetch(`/api/rates?${new URLSearchParams({ property, checkIn: p.checkIn, checkOut: p.checkOut, adults: String(p.adults) })}`);
      const j = await r.json();
      if (j.engineUrl) setEngine(j.engineUrl);
      if (!r.ok) { setState("error"); return; }
      setRes(j); setState(j.available ? "ok" : "none");
    } catch { setState("error"); }
  }, [property]);

  useEffect(() => {
    const a = new Date(); setToday(iso(a)); a.setDate(a.getDate() + 45); const b = new Date(a); b.setDate(b.getDate() + 3);
    const d = { checkIn: iso(a), checkOut: iso(b), adults: 2 }; setQ(d); run(d);
  }, [run]);

  const live = useMemo(() => {
    const m: Record<string, Live> = {};
    res?.plans.forEach((p) => p.rooms.forEach((r) => { (m[norm(r.name)] ??= []).push({ plan: p.plan, total: r.total }); }));
    Object.values(m).forEach((l) => l.sort((a, b) => a.total - b.total));
    return m;
  }, [res]);

  const nights = res?.nights ?? 1;
  const shown = rooms.filter((r) => r.kind === tab);
  const pricedCount = rooms.filter((r) => live[norm(r.name)]).length;

  return (
    <section id="rates" className="mt-16 md:mt-24 scroll-mt-32" aria-labelledby="rates-heading">
      <p className="ledger-eyebrow">Live rates · booking engine by Tag Albie</p>
      <h2 id="rates-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Choose Your Room at {name}</h2>

      <form className="mt-6 md:sticky md:top-[118px] lg:top-[150px] z-20 flex flex-wrap items-end gap-3 md:gap-4 px-4 md:px-5 py-3 border ledger-border bg-paper/95 backdrop-blur" onSubmit={(e) => { e.preventDefault(); run(q); }}>
        <label className="block"><span className="ledger-eyebrow flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Check-in</span><input type="date" value={q.checkIn} min={today || undefined} onChange={(e) => setQ({ ...q, checkIn: e.target.value })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]" /></label>
        <label className="block"><span className="ledger-eyebrow">Check-out</span><input type="date" value={q.checkOut} min={q.checkIn || undefined} onChange={(e) => setQ({ ...q, checkOut: e.target.value })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]" /></label>
        <label className="block"><span className="ledger-eyebrow flex items-center gap-1.5"><Users className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Adults</span><select value={q.adults} onChange={(e) => setQ({ ...q, adults: Number(e.target.value) })} className="mt-1 bg-paper border ledger-border px-2 py-1.5 text-[16px]">{[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n}>{n}</option>)}</select></label>
        <button type="submit" className="ledger-btn inline-flex items-center gap-2"><RefreshCcw className={`w-3.5 h-3.5 ${state === "loading" ? "animate-spin" : ""}`} strokeWidth={1.5} aria-hidden="true" /> See rates</button>
        <p className="w-full md:w-auto md:ml-auto text-[13px]" aria-live="polite">
          {state === "loading" && <span className="ledger-muted">Asking the booking engine…</span>}
          {state === "ok" && <span className="ledger-crimson inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" /> {pricedCount} of {rooms.length} priced live · {nights} {nights === 1 ? "night" : "nights"}</span>}
          {state === "none" && <span>Nothing open for those dates. Try others, or ask James.</span>}
          {state === "error" && <span>The engine didn&rsquo;t answer; registry rates shown.</span>}
        </p>
      </form>

      <div className="mt-6 flex gap-6 border-b ledger-rule" role="tablist" aria-label="Room types">
        {([["room", "Rooms & suites"], ["house", "Cottages & houses"]] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`pb-2.5 -mb-px ledger-eyebrow border-b-2 ${tab === k ? "border-crimson ledger-crimson" : "border-transparent"}`}>{l} <span className="ledger-muted">({rooms.filter((r) => r.kind === k).length})</span></button>
        ))}
      </div>

      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((r) => {
          const l = live[norm(r.name)];
          const chosen = l?.find((x) => x.plan === plan[r.name]) ?? l?.[0];
          return (
            <li key={r.name} className="border ledger-border bg-paper flex flex-col">
              <Carousel photos={r.photos} name={r.name} />
              <div className="p-4 flex flex-col flex-1">
                <h3 className="ledger-display text-xl">{r.name}</h3>
                <p className="mt-1 text-[13px] ledger-muted flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />{[r.kind === "house" ? "Taken whole" : null, r.sleeps ? `Sleeps ${r.sleeps}` : null, r.beds].filter(Boolean).join(" · ") || "Details with your quote"}</p>
                {l && l.length > 1 && (
                  <div className="mt-3 grid gap-1.5" role="radiogroup" aria-label={`${r.name} rate options`}>
                    {l.map((x) => (
                      <button key={x.plan} type="button" role="radio" aria-checked={chosen?.plan === x.plan} onClick={() => setPlan({ ...plan, [r.name]: x.plan })} className={`flex justify-between items-baseline gap-2 px-3 py-2 border text-left text-[13.5px] ${chosen?.plan === x.plan ? "border-crimson bg-crimson/5" : "ledger-border"}`}>
                        <span>{x.plan}<span className="block text-[12px] ledger-muted">{PLAN_NOTE[x.plan] ?? ""}</span></span><span className="tabular-nums">{usd(x.total / nights)}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-4 flex items-end justify-between gap-3">
                  {chosen ? (
                    <p><span className="ledger-display text-2xl ledger-crimson">{usd(chosen.total / nights)}</span> <span className="ledger-eyebrow">/ night</span><span className="block text-[12.5px] ledger-muted">{usd(chosen.total)} for {nights} {nights === 1 ? "night" : "nights"}, live</span></p>
                  ) : (
                    <p>{r.fromZar ? <><span className="ledger-eyebrow">From </span><span className="ledger-display text-xl">{zar(r.fromZar)}</span><span className="block text-[12.5px] ledger-muted">registry rate / night{state === "ok" ? " · not open on these dates" : ""}</span></> : <span className="text-[13px] ledger-muted">Rate on request</span>}</p>
                  )}
                  {chosen
                    ? <button type="button" onClick={() => setPick({ room: r, plan: chosen.plan, total: chosen.total })} className="ledger-btn shrink-0">Select</button>
                    : <a href={`/plan?trip=${encodeURIComponent(`${name} · ${r.name}`)}&travellers=${q.adults}`} className="ledger-btn-ghost shrink-0">Ask for a quote</a>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[13px] ledger-muted max-w-3xl">Live prices are the engine&rsquo;s totals for your dates in US dollars, before tax, refreshed every 15 minutes. Registry rates are the estate&rsquo;s published nightly rates in South African rand. {engine && <a href={engine} className="underline underline-offset-2" data-event="booking_outbound">Open the booking engine</a>}</p>

      {pick && res && <Checkout pick={pick} q={q} nights={nights} name={name} included={included} excluded={excluded} policies={policies} engine={engine} hostHref={hostHref} onClose={() => setPick(null)} />}
    </section>
  );
}
