"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Mic, Minus, Plus, Search, X } from "lucide-react";
import { lockScroll } from "@/lib/scroll-lock";
import { loadIndex } from "./index-client";
import {
  CATEGORY_GROUPS, CATEGORY_LABEL, COLLECTIONS, COLLECTION_LABEL, EMPTY, INTERESTS, INTEREST_LABEL, datesShort, monthName, partyWords, toQuery,
  type AtlasQuery, type Category, type Collection, type Interest,
} from "@/lib/atlas/match";

// Atlas Search, Phase 01: the search bar inside Ask the House, and the same bar at the top of /atlas.
// One field and one row at rest; Category, Dates, Travellers and Interests each open one panel at a time (a sheet on
// phones, a panel under the bar on wide screens). The field keeps its own full-width row on phones and Search sits on
// its own row beneath, so the button can never squeeze the field (the collapse found in the 20 Nov audit).
// The microphone is a reserved, inactive place for Atlas by Voice: it does nothing in Phase 01.

type PanelKey = "cat" | "dates" | "who" | "interests";
const toggle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);
const pad = (n: number) => String(n).padStart(2, "0");

export default function AtlasSearch({ places, initial, onSubmit, idPrefix = "atlas" }: {
  /** Countries, regions and waters offered as the Where field is typed. */
  places: string[];
  initial?: AtlasQuery;
  /** On /atlas the page owns the search; on the home page the bar opens /atlas with the search in its address. */
  onSubmit?: (q: AtlasQuery) => void;
  idPrefix?: string;
}) {
  const router = useRouter();
  const uid = useId();
  const [q, setQ] = useState<AtlasQuery>(initial ?? EMPTY);
  const [open, setOpen] = useState<PanelKey | null>(null);
  const [mode, setMode] = useState<"exact" | "flexible">(initial?.months.length ? "flexible" : "exact");
  const opener = useRef<HTMLButtonElement | null>(null);
  // Names of stays, camps, ships, voyages and routes join the places once the field is first used (one shared fetch).
  const [names, setNames] = useState<string[]>([]);
  const wantNames = () => { if (!names.length) loadIndex().then((rs) => setNames([...new Set(rs.map((r) => r.name))].filter((n) => !places.includes(n)).sort((a, b) => a.localeCompare(b)))).catch(() => {}); };
  useEffect(() => { if (initial) { setQ(initial); if (initial.months.length) setMode("flexible"); } }, [initial]);

  // One panel at a time. On phones it is a sheet over the page, so the page behind stops scrolling.
  useEffect(() => {
    if (!open) return;
    const release = window.matchMedia("(max-width: 767px)").matches ? lockScroll() : () => {};
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); opener.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => { release(); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const go = (next: AtlasQuery = q) => {
    setOpen(null);
    if (onSubmit) onSubmit(next);
    else { const s = toQuery(next); router.push(s ? `/atlas?${s}` : "/atlas"); }
  };
  const set = (patch: Partial<AtlasQuery>) => setQ((v) => ({ ...v, ...patch }));
  const openPanel = (k: PanelKey) => (e: React.MouseEvent<HTMLButtonElement>) => { opener.current = e.currentTarget; setOpen(open === k ? null : k); };

  const months = useMemo(() => { const d = new Date(); return Array.from({ length: 12 }, (_, i) => { const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + i, 1)); return `${m.getUTCFullYear()}-${pad(m.getUTCMonth() + 1)}`; }); }, []);
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const catWords = q.cat.length + q.col.length === 0 ? "Everything" : q.cat.length + q.col.length === 1 ? (q.cat[0] ? CATEGORY_LABEL[q.cat[0]] : COLLECTION_LABEL[q.col[0]]) : `${q.cat.length + q.col.length} chosen`;
  const whenWords = datesShort(q) ?? "Dates, or flexible";
  const cell = "flex flex-col justify-center text-left min-w-0 h-12 md:h-auto md:py-3 px-3 md:px-4 border-r ledger-border last:border-r-0 md:last:border-r hover:bg-mist";

  return (
    <div>
      <form role="search" aria-label="Search the Atlas" className="border border-ink bg-paper md:flex md:items-stretch max-w-[1280px]" onSubmit={(e) => { e.preventDefault(); go(); }}>
        <div className="flex items-center gap-2 pl-4 pr-1.5 h-14 md:h-auto md:py-2 md:flex-[2] min-w-0 border-b md:border-b-0 md:border-r ledger-border">
          <Search className="w-4 h-4 shrink-0 text-ink" strokeWidth={1.5} aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <label htmlFor={`${idPrefix}-where`} className="hidden md:block ledger-eyebrow">Where</label>
            <label htmlFor={`${idPrefix}-where`} className="sr-only md:hidden">Where</label>
            <input id={`${idPrefix}-where`} list={`${uid}-places`} value={q.where} onChange={(e) => set({ where: e.target.value })} placeholder="Anywhere" autoComplete="off" enterKeyHint="search" onFocus={wantNames} aria-describedby={`${uid}-where-hint`}
              className="block w-full min-w-0 h-11 md:h-8 bg-transparent text-[16px] outline-none placeholder:text-ink" />
            <datalist id={`${uid}-places`}>{places.map((p) => <option key={p} value={p} />)}{names.map((n) => <option key={`n:${n}`} value={n} />)}</datalist>
            <span id={`${uid}-where-hint`} className="sr-only">A country, region, sea, or the name of a stay, camp or ship.</span>
          </div>
          {/* Reserved for Atlas by Voice. Inactive in Phase 01: no listener, no permission request. */}
          <button type="button" disabled aria-disabled="true" aria-label="Atlas by Voice, coming later" title="Atlas by Voice, coming later" data-atlas-voice="reserved"
            className="shrink-0 inline-flex items-center justify-center w-11 h-11 border border-dashed border-stone bg-mist text-stone-text cursor-not-allowed">
            <Mic className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-3 md:contents">
          <button type="button" aria-haspopup="dialog" aria-expanded={open === "cat"} onClick={openPanel("cat")} className={`${cell} md:flex-1`}><span className="hidden md:block ledger-eyebrow">Category</span><span className="text-[13.5px] md:text-[16px] truncate">{catWords === "Everything" ? <><span className="md:hidden">Category</span><span className="hidden md:inline">Everything</span></> : catWords}</span></button>
          <button type="button" aria-haspopup="dialog" aria-expanded={open === "dates"} onClick={openPanel("dates")} className={`${cell} md:flex-1`}><span className="hidden md:block ledger-eyebrow">Dates</span><span className="text-[13.5px] md:text-[16px] truncate">{datesShort(q) ? whenWords : <><span className="md:hidden">Dates</span><span className="hidden md:inline">{whenWords}</span></>}</span></button>
          <button type="button" aria-haspopup="dialog" aria-expanded={open === "who"} onClick={openPanel("who")} className={`${cell} md:flex-1`}><span className="hidden md:block ledger-eyebrow">Travellers</span><span className="text-[13.5px] md:text-[16px] truncate">{partyWords(q)}</span></button>
        </div>
        {/* The wrapper carries the breakpoint: .ledger-btn sets its own display, which would beat a `hidden` on the button. */}
        <div className="hidden md:flex shrink-0"><button type="submit" className="ledger-btn ledger-btn--house !h-auto !min-h-[64px] !border-0">Search</button></div>
        {/* Phones: toggles and Search each on their own row, inside the form so Enter and the button both submit. */}
        <div className="md:hidden border-t ledger-border p-3 flex flex-col gap-2.5 bg-mist">
          <Toggles q={q} set={set} open={open} openPanel={openPanel} />
          <button type="submit" className="ledger-btn ledger-btn--house w-full">Search</button>
        </div>
      </form>

      <div className="hidden md:flex flex-wrap items-center gap-2.5 mt-3 max-w-[1280px]">
        <Toggles q={q} set={set} open={open} openPanel={openPanel} />
        <p className="text-[13px] ledger-muted ml-1">Dates show season and offers. Availability is confirmed by the house.</p>
      </div>
      <p className="md:hidden mt-3 text-[13px] ledger-muted">Dates show season and offers. Availability is confirmed by the house.</p>

      {open === "cat" && (
        <Panel title="Category" onClose={() => setOpen(null)} onDone={() => (onSubmit ? go() : setOpen(null))}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
            {CATEGORY_GROUPS.map((g) => (
              <fieldset key={g.label}>
                <legend className="ledger-eyebrow py-1.5">{g.label}</legend>
                {g.items.map((c) => <Check key={c} label={CATEGORY_LABEL[c]} on={q.cat.includes(c)} onChange={() => set({ cat: toggle<Category>(q.cat, c) })} />)}
              </fieldset>
            ))}
          </div>
          <fieldset className="mt-3 pt-3 border-t ledger-border flex flex-wrap items-center gap-x-6">
            <legend className="ledger-eyebrow py-1.5 float-left mr-6">Collections, across any category</legend>
            {COLLECTIONS.map((c) => <Check key={c} label={COLLECTION_LABEL[c]} on={q.col.includes(c)} onChange={() => set({ col: toggle<Collection>(q.col, c) })} />)}
          </fieldset>
        </Panel>
      )}

      {open === "dates" && (
        <Panel title="When" onClose={() => setOpen(null)} onDone={() => (onSubmit ? go() : setOpen(null))}>
          <div role="group" aria-label="How to choose dates" className="grid grid-cols-2 max-w-md">
            <button type="button" aria-pressed={mode === "exact"} onClick={() => { setMode("exact"); set({ months: [] }); }} className={`h-11 border border-ink text-[14px] ${mode === "exact" ? "bg-ink text-paper" : "bg-paper"}`}>Exact dates</button>
            <button type="button" aria-pressed={mode === "flexible"} onClick={() => { setMode("flexible"); set({ from: null, to: null }); }} className={`h-11 border border-l-0 border-ink text-[14px] ${mode === "flexible" ? "bg-ink text-paper" : "bg-paper"}`}>Flexible</button>
          </div>
          {mode === "exact" ? (
            <div className="mt-4 grid grid-cols-2 gap-3 max-w-md">
              <label className="flex flex-col gap-1 text-[13px] ledger-muted">Arrival<input type="date" min={todayIso} value={q.from ?? ""} onChange={(e) => set({ from: e.target.value || null, to: q.to && e.target.value && q.to <= e.target.value ? null : q.to })} className="h-11 border border-ink px-2 text-[15px] text-ink bg-paper" /></label>
              <label className="flex flex-col gap-1 text-[13px] ledger-muted">Departure<input type="date" min={q.from ?? todayIso} value={q.to ?? ""} onChange={(e) => set({ to: e.target.value || null })} className="h-11 border border-ink px-2 text-[15px] text-ink bg-paper" /></label>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-xl" role="group" aria-label="Months">
              {months.map((m) => <button key={m} type="button" aria-pressed={q.months.includes(m)} onClick={() => set({ months: toggle(q.months, m).sort() })} className="house-chip justify-center min-h-[44px] !px-1">{monthName(m).slice(0, 3)} {m.slice(2, 4)}</button>)}
            </div>
          )}
          <p className="mt-4 text-[13px] leading-relaxed ledger-muted max-w-xl">Dates show what is in season and which offers apply. They do not confirm a room or a cabin: the house confirms availability.</p>
          {(q.from || q.to || q.months.length > 0) && <button type="button" onClick={() => set({ from: null, to: null, months: [] })} className="mt-2 ledger-btn-ghost text-[15px]">Clear dates</button>}
        </Panel>
      )}

      {open === "who" && (
        <Panel title="Travellers" onClose={() => setOpen(null)} onDone={() => (onSubmit ? go() : setOpen(null))}>
          <Stepper label="Adults" value={q.adults} min={1} max={16} onChange={(n) => set({ adults: n })} />
          <Stepper label="Children" value={q.children.length} min={0} max={8} onChange={(n) => set({ children: n > q.children.length ? [...q.children, ...Array(n - q.children.length).fill(8)] : q.children.slice(0, n) })} />
          {q.children.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {q.children.map((age, i) => (
                <label key={i} className="flex flex-col gap-1 text-[13px] ledger-muted">Age of child {i + 1}
                  <select value={age} onChange={(e) => set({ children: q.children.map((a, k) => (k === i ? Number(e.target.value) : a)) })} className="h-11 w-24 border border-ink px-2 text-[15px] text-ink bg-paper">
                    {Array.from({ length: 18 }, (_, a) => <option key={a} value={a}>{a === 0 ? "Under 1" : a}</option>)}
                  </select>
                </label>
              ))}
            </div>
          )}
          <p className="mt-4 text-[13px] leading-relaxed ledger-muted max-w-xl">Where a place has not filed how many it sleeps or the ages it takes, it stays in your results and says so.</p>
        </Panel>
      )}

      {open === "interests" && (
        <Panel title="Travel for" onClose={() => setOpen(null)} onDone={() => (onSubmit ? go() : setOpen(null))}>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
            {INTERESTS.map((i) => <button key={i} type="button" aria-pressed={q.interests.includes(i)} onClick={() => set({ interests: toggle<Interest>(q.interests, i) })} className="house-chip min-h-[44px] !px-4">{INTEREST_LABEL[i]}</button>)}
          </div>
        </Panel>
      )}
    </div>
  );
}

function Toggles({ q, set, open, openPanel }: { q: AtlasQuery; set: (p: Partial<AtlasQuery>) => void; open: PanelKey | null; openPanel: (k: PanelKey) => (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <div className="flex gap-2">
      <button type="button" aria-pressed={q.sort === "savings"} onClick={() => set({ sort: q.sort === "savings" ? "best" : "savings" })} className="house-chip house-chip--primary flex-1 md:flex-none justify-center min-h-[44px] !px-3.5">Savings first</button>
      <button type="button" aria-haspopup="dialog" aria-expanded={open === "interests"} onClick={openPanel("interests")} className="house-chip flex-1 md:flex-none justify-center min-h-[44px] !px-3.5">{q.interests.length ? q.interests.map((i) => INTEREST_LABEL[i]).join(", ") : "Interests"} <Plus className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></button>
    </div>
  );
}

/** A sheet from the bottom on phones; a panel under the bar on wide screens. */
function Panel({ title, children, onClose, onDone }: { title: string; children: ReactNode; onClose: () => void; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return (
    <div className="fixed inset-0 z-[70] md:static md:z-auto md:mt-3">
      <div className="absolute inset-0 bg-ink-deep/55 md:hidden" onClick={onClose} aria-hidden="true" />
      <div ref={ref} tabIndex={-1} role="dialog" aria-label={title} className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto bg-paper border-t border-ink p-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] md:static md:max-h-none md:max-w-[1280px] md:border md:p-6 outline-none">
        <div className="flex justify-center md:hidden -mt-1 mb-2" aria-hidden="true"><span className="block w-11 h-1 bg-keyline" /></div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h3 className="ledger-display text-[1.6rem] leading-none">{title}</h3>
          <button type="button" onClick={onClose} aria-label={`Close ${title}`} className="inline-flex items-center justify-center w-11 h-11 border ledger-border bg-paper"><X className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></button>
        </div>
        {children}
        <button type="button" onClick={onDone} className="ledger-btn ledger-btn--house w-full md:w-auto mt-5">Done</button>
      </div>
    </div>
  );
}

function Check({ label, on, onChange }: { label: string; on: boolean; onChange: () => void }) {
  return <label className="flex items-center gap-2.5 min-h-[44px] text-[15px] cursor-pointer"><input type="checkbox" checked={on} onChange={onChange} className="w-[18px] h-[18px] accent-[#2E2B28]" />{label}</label>;
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 max-w-md py-2 border-b ledger-border">
      <span className="text-[15px]">{label}</span>
      <span className="inline-flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`} className="inline-flex items-center justify-center w-11 h-11 border border-ink bg-paper disabled:opacity-40"><Minus className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></button>
        <span className="w-6 text-center tabular-nums text-[16px]" aria-live="polite">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`} className="inline-flex items-center justify-center w-11 h-11 border border-ink bg-paper disabled:opacity-40"><Plus className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></button>
      </span>
    </div>
  );
}
