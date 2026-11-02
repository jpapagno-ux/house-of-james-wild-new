"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import { ACTIVITIES, type Activity } from "@/lib/content/ships/registry";
import {
  BUDGETS, EMPTY, LENGTHS, WHERE, WHO, fromQuery, leftOut, monthName, pageLinks, reasons, search, suggest, toQuery,
  type LengthKey, type PageLink, type SearchItem, type SearchState, type SearchWhere, type Suggestion, type Who,
} from "@/lib/content/ships/search-match";

// "Find your voyage" on /voyages (James, 2 Nov 2026): where, when, who, what, how long and budget,
// plus a typeahead over ships, routes, ports and operators. Instant and client-side from the
// registry index (lib/content/ships/search.ts); every filter reads a published fact. Filters write
// to the URL (?where=…) so a search can be shared; those URLs are noindex (middleware.ts).
// Phones get a compact bar that opens a sheet; wide screens show the filters inline.

type Pages = Parameters<typeof pageLinks>[1];
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const chip = (on: boolean) => `shrink-0 inline-flex items-center min-h-[44px] px-3.5 border text-[14px] whitespace-nowrap transition-colors ${on ? "border-crimson bg-crimson text-paper" : "ledger-border bg-white hover:border-crimson"}`;

export default function VoyageSearch({ items, months, pages }: { items: SearchItem[]; months: string[]; pages: Pages }) {
  const [s, setS] = useState<SearchState>(EMPTY);
  const [sheet, setSheet] = useState(false);
  const ready = useRef(false);

  // Read a shared search from the URL once, then keep the URL in step (replaceState, no history spam).
  useEffect(() => {
    setS(fromQuery(new URLSearchParams(window.location.search)));
    ready.current = true;
  }, []);
  useEffect(() => {
    if (!ready.current) return;
    const q = toQuery(s);
    const url = `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(null, "", url);
  }, [s]);
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", esc); };
  }, [sheet]);

  const hits = useMemo(() => search(items, s), [items, s]);
  const links = pageLinks(s, pages);
  const note = leftOut(items, s);
  const set = <K extends keyof SearchState>(k: K, v: SearchState[K]) => setS((p) => ({ ...p, [k]: v }));
  const active = [s.where, s.when, s.who, s.len, s.budget, ...s.what].filter((x) => x !== null).length + (s.q.trim() ? 1 : 0);
  const summary = [s.where && WHERE[s.where], s.when && monthName(s.when), s.who && WHO[s.who], ...s.what.map((a) => ACTIVITIES[a]), s.len && LENGTHS[s.len].label, s.budget !== null && `Up to ${usd(s.budget)}`].filter(Boolean).join(" · ");

  const filters = <Filters s={s} set={set} months={months} />;
  return (
    <div className="ledger-paper border ledger-border p-4 md:p-7" data-voyage-search>
      <Typeahead items={items} q={s.q} onQ={(q) => set("q", q)} />

      {/* Phones: a compact bar that opens the filter sheet. */}
      <div className="md:hidden mt-3 flex items-center gap-2">
        <button type="button" onClick={() => setSheet(true)} aria-haspopup="dialog" aria-expanded={sheet} className="flex-1 min-w-0 inline-flex items-center gap-2 min-h-[48px] px-3.5 border ledger-border bg-white text-left">
          <SlidersHorizontal className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span className="truncate text-[14.5px]">{summary || "Where, when, who, what"}</span>
          {active > 0 && <span className="ml-auto shrink-0 bg-crimson text-paper text-[12px] px-2 py-0.5">{active}</span>}
        </button>
      </div>
      {sheet && (
        <div className="md:hidden fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Find your voyage">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/40" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] flex flex-col bg-paper border-t ledger-border shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b ledger-rule">
              <p className="ledger-display text-[20px]">Find your voyage</p>
              <button type="button" onClick={() => setSheet(false)} className="inline-flex items-center justify-center w-11 h-11" aria-label="Close filters"><X className="w-5 h-5" strokeWidth={1.5} /></button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-4 pb-4">{filters}</div>
            <div className="flex gap-2 px-4 py-3 border-t ledger-rule bg-paper">
              <button type="button" onClick={() => setS(EMPTY)} className="ledger-btn min-h-[48px]">Clear</button>
              <button type="button" onClick={() => setSheet(false)} className="flex-1 ledger-btn ledger-btn--solid min-h-[48px]">Show {hits.length} {hits.length === 1 ? "ship" : "ships"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Wide screens: the filters inline. */}
      <div className="hidden md:block">{filters}</div>

      <div className="mt-6 border-t ledger-rule pt-5" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="ledger-eyebrow">{hits.length ? `${hits.length} ${hits.length === 1 ? "ship fits" : "ships fit"}` : "No filed ship fits all of those yet"}</p>
          {active > 0 && <button type="button" onClick={() => setS(EMPTY)} className="text-[14px] underline underline-offset-4 min-h-[44px]">Clear all</button>}
        </div>
        {links.length > 0 && (
          <div className="mt-3 border-l-2 border-crimson pl-4">
            <p className="ledger-eyebrow">There is a page for this</p>
            <ul className="mt-1 flex flex-col">{links.map((l) => <li key={l.href}><Link href={l.href} className="inline-flex items-center gap-1.5 min-h-[44px] text-[15px] hover:underline underline-offset-4">{l.label}<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link></li>)}</ul>
          </div>
        )}
        {hits.length > 0 ? (
          <ul className="mt-3 divide-y ledger-rule border-y ledger-rule">
            {hits.map((x) => <Row key={x.slug} x={x} why={reasons(x, s)} />)}
          </ul>
        ) : (
          <p className="mt-2 text-[15px] ledger-muted max-w-xl">Clear a filter, or tell James what you have in mind and he will say plainly whether a ship he trusts sails it.</p>
        )}
        {note && <p className="mt-3 text-[13.5px] ledger-muted">{note}</p>}
        <p className="mt-5 flex flex-wrap gap-3">
          <Link href={`/plan?trip=${encodeURIComponent(["Voyage", summary].filter(Boolean).join(", "))}`} className="ledger-btn ledger-btn--solid">Plan with James</Link>
          <Link href="/compass" className="ledger-btn">Not sure? Take the Compass</Link>
        </p>
      </div>
    </div>
  );
}

function Row({ x, why }: { x: SearchItem; why: string[] }) {
  return (
    <li>
      <Link href={x.href} className="flex items-center gap-3 md:gap-4 min-h-[64px] py-2.5 px-1 hover:bg-paper-card">
        <span className="relative w-14 h-14 md:w-20 md:h-16 shrink-0 bg-paper-card overflow-hidden">{x.image && <Image src={x.image.url} alt="" fill sizes="80px" className="object-cover" />}</span>
        <span className="flex-1 min-w-0">
          <span className="block ledger-display text-[18px] leading-snug">{x.name}</span>
          <span className="block text-[12.5px] ledger-muted truncate">{x.eyebrow}{x.page ? "" : " · ship page to follow"}</span>
          {why.length > 0 && <span className="block text-[12.5px] mt-0.5">{why.join(" · ")}</span>}
        </span>
        {x.price && <span className="text-right shrink-0"><span className="ledger-eyebrow block">{x.price.label}</span><span className="ledger-display ledger-crimson text-[15px] md:text-[16px] whitespace-nowrap">{x.price.amount}</span></span>}
        <ArrowRight className="hidden sm:block w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </li>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="mt-5 md:grid md:grid-cols-[7.5rem_minmax(0,1fr)] md:items-start md:gap-4">
      <legend className="contents"><span className="ledger-eyebrow block mb-1.5 md:mb-0 md:pt-3.5">{label}</span></legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Filters({ s, set, months }: { s: SearchState; set: <K extends keyof SearchState>(k: K, v: SearchState[K]) => void; months: string[] }) {
  const [age, setAge] = useState("");
  const toggle = (a: Activity) => set("what", s.what.includes(a) ? s.what.filter((x) => x !== a) : [...s.what, a]);
  const addAge = () => { const n = Number(age); if (age !== "" && Number.isInteger(n) && n >= 0 && n < 18 && s.ages.length < 8) { set("ages", [...s.ages, n]); setAge(""); } };
  return (
    <div>
      <Group label="Where">
        {(Object.keys(WHERE) as SearchWhere[]).map((k) => <button key={k} type="button" aria-pressed={s.where === k} onClick={() => set("where", s.where === k ? null : k)} className={chip(s.where === k)}>{WHERE[k]}</button>)}
      </Group>
      <Group label="When">
        <select aria-label="Month of departure" value={s.when ?? ""} onChange={(e) => set("when", e.target.value || null)} className="min-h-[44px] border ledger-border bg-white px-3 text-[14px] max-w-full">
          <option value="">Any month</option>
          {months.map((m) => <option key={m} value={m}>{monthName(m)}</option>)}
        </select>
      </Group>
      <Group label="Who">
        {(Object.keys(WHO) as Who[]).map((k) => <button key={k} type="button" aria-pressed={s.who === k} onClick={() => set("who", s.who === k ? null : k)} className={chip(s.who === k)}>{WHO[k]}</button>)}
        {s.who === "family" && (
          <div className="basis-full mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[13.5px] ledger-muted">Children&rsquo;s ages:</span>
            {s.ages.map((a, i) => <button key={`${a}-${i}`} type="button" onClick={() => set("ages", s.ages.filter((_, j) => j !== i))} className="inline-flex items-center gap-1 min-h-[44px] px-3 border border-crimson text-[14px]" aria-label={`Remove age ${a}`}>{a}<X className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></button>)}
            <span className="inline-flex">
              <input inputMode="numeric" pattern="[0-9]*" maxLength={2} value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAge())} aria-label="Add a child's age" placeholder="Age" className="w-16 min-h-[44px] border ledger-border bg-white px-2 text-[14px]" />
              <button type="button" onClick={addAge} className="min-h-[44px] px-3 border border-l-0 ledger-border bg-white text-[14px]">Add</button>
            </span>
          </div>
        )}
      </Group>
      <Group label="What">
        {(Object.keys(ACTIVITIES) as Activity[]).map((k) => <button key={k} type="button" aria-pressed={s.what.includes(k)} onClick={() => toggle(k)} className={chip(s.what.includes(k))}>{ACTIVITIES[k]}</button>)}
      </Group>
      <Group label="How long">
        {(Object.keys(LENGTHS) as LengthKey[]).map((k) => <button key={k} type="button" aria-pressed={s.len === k} onClick={() => set("len", s.len === k ? null : k)} className={chip(s.len === k)}>{LENGTHS[k].label}</button>)}
      </Group>
      <Group label="Budget">
        {BUDGETS.map((b) => <button key={b} type="button" aria-pressed={s.budget === b} onClick={() => set("budget", s.budget === b ? null : b)} className={chip(s.budget === b)}>Up to {usd(b)}</button>)}
      </Group>
      <p className="mt-3 text-[12.5px] ledger-muted md:pl-[8.5rem]">Budget reads the lowest published fare per person, two sharing.</p>
    </div>
  );
}

function Typeahead({ items, q, onQ }: { items: SearchItem[]; q: string; onQ: (q: string) => void }) {
  const [text, setText] = useState(q);
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(-1);
  const id = useId();
  useEffect(() => setText(q), [q]);
  const list: Suggestion[] = useMemo(() => suggest(items, text), [items, text]);
  const pick = (x: Suggestion) => {
    setOpen(false);
    if (x.href) { window.location.href = x.href; return; }
    setText(x.label); onQ(x.label);
  };
  return (
    <div className="relative">
      <label htmlFor={`${id}-q`} className="ledger-eyebrow block mb-1.5">Search ships, routes, ports and operators</label>
      <div className="flex items-center border ledger-border bg-white focus-within:border-crimson">
        <Search className="w-4 h-4 ml-3 shrink-0 ledger-muted" strokeWidth={1.5} aria-hidden="true" />
        <input
          id={`${id}-q`} type="text" enterKeyHint="search" role="combobox" aria-expanded={open && list.length > 0} aria-controls={`${id}-list`} aria-autocomplete="list" autoComplete="off"
          aria-activedescendant={i >= 0 ? `${id}-o${i}` : undefined}
          value={text} placeholder="Aswan, Ecoventura, Raja Ampat…"
          onChange={(e) => { setText(e.target.value); setOpen(true); setI(-1); if (!e.target.value) onQ(""); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setI((n) => Math.min(list.length - 1, n + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setI((n) => Math.max(-1, n - 1)); }
            else if (e.key === "Enter") { e.preventDefault(); if (i >= 0 && list[i]) pick(list[i]); else { onQ(text); setOpen(false); } }
            else if (e.key === "Escape") setOpen(false);
          }}
          className="flex-1 min-w-0 min-h-[48px] px-3 text-[16px] bg-transparent outline-none"
        />
        {text && <button type="button" onClick={() => { setText(""); onQ(""); }} className="inline-flex items-center justify-center w-11 h-11 shrink-0" aria-label="Clear search"><X className="w-4 h-4" strokeWidth={1.5} /></button>}
      </div>
      {open && list.length > 0 && (
        <ul id={`${id}-list`} role="listbox" className="absolute z-30 left-0 right-0 mt-1 bg-white border ledger-border shadow-lg max-h-[60vh] overflow-y-auto">
          {list.map((x, n) => (
            <li key={`${x.kind}-${x.label}`} id={`${id}-o${n}`} role="option" aria-selected={n === i} onMouseDown={(e) => { e.preventDefault(); pick(x); }}
              className={`flex items-center gap-3 min-h-[48px] px-3 py-2 cursor-pointer ${n === i ? "bg-paper-card" : "hover:bg-paper-card"}`}>
              <span className="ledger-eyebrow w-[4.5rem] shrink-0">{x.kind}</span>
              <span className="flex-1 min-w-0"><span className="block text-[15px] truncate">{x.label}</span>{x.detail && <span className="block text-[12px] ledger-muted truncate">{x.detail}</span>}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type { PageLink };
