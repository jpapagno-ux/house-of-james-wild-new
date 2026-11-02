"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ComingStamp from "./ComingStamp";
import s from "./coming.module.css";
import {
  DEFAULT_STATE, SORTS, STATUS_CHIPS, countryCounts, filterComing, groupByRegionView, groupByYear, parseQuery, regionCounts, sortComing, toQuery, yearCounts, viewStatus,
  type Group, type Sort, type ViewItem, type ViewState,
} from "@/lib/content/coming-view";

export type ExplorerItem = ViewItem & {
  tagline: string | null; note: string | null; bestMonths: string | null; airport: string | null; href: string | null;
  when: string; line: string; countdown: string | null; plan: string;
  hero: { src: string; alt: string; credit: string | null } | null;
  field: { from: string; to: string; glow: string };
  pathway: { key: string; name: string; accent: string; text: string; tint: string; basis: "approved" | "suggested" } | null;
};

// The explorer under the hero: search, country, year and status chips, three sorts, and the timeline.
// The server renders the default view (every entry, soonest first) so all of it is in the HTML; the
// state lives in the query string (?q=&region=&country=&year=&status=&sort=&group=) so a filtered view can be shared
// and the back button walks through it. The canonical URL stays /whats-coming.
export default function ComingExplorer({ items, regions }: { items: ExplorerItem[]; regions: { slug: string; name: string }[] }) {
  const [st, setSt] = useState<ViewState>(DEFAULT_STATE);

  useEffect(() => {
    const read = () => setSt(parseQuery(window.location.search));
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  // Chips and sort push a history entry; typing replaces it, so the back button skips keystrokes.
  const update = useCallback((patch: Partial<ViewState>, mode: "push" | "replace" = "push") => {
    setSt((prev) => {
      const next = { ...prev, ...patch };
      // Keep ?look= (concept A or B, for comparison) across filter changes.
      const look = new URLSearchParams(window.location.search).get("look");
      const q = toQuery(next);
      const withLook = look ? `${q ? `${q}&` : "?"}look=${encodeURIComponent(look)}` : q;
      const url = `${window.location.pathname}${withLook}${mode === "push" ? "" : window.location.hash}`;
      if (mode === "push") window.history.pushState(null, "", url); else window.history.replaceState(null, "", url);
      return next;
    });
  }, []);

  const shown = useMemo(() => sortComing(filterComing(items, st), st.sort), [items, st]);
  const groups = useMemo(() => (st.group === "region" ? groupByRegionView(shown, regions) : groupByYear(shown, st.sort)), [shown, st.sort, st.group, regions]);
  const regionChips = useMemo(() => regionCounts(items, regions), [items, regions]);
  // Country chips narrow to the chosen region.
  const countries = useMemo(() => countryCounts(st.region ? items.filter((c) => c.regionSlug === st.region) : items), [items, st.region]);
  const years = useMemo(() => yearCounts(items), [items]);
  const filtered = !!(st.q.trim() || st.region || st.country || st.year || st.status);
  const clear = { q: "", region: null, country: null, year: null, status: null };
  let n = 0;

  // Chip colours live in coming.module.css (aria-pressed), so both looks style them.
  const chip = `${s.chip} shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 text-[12px] tracking-[0.06em] whitespace-nowrap`;
  const sep = `${s.sep} shrink-0 w-px h-5 mx-1`;

  return (
    <div className={`${s.explorer} overflow-x-clip`}>
      <div className={`${s.bar} sticky top-[76px] lg:top-[164px] z-30`} role="search" aria-label="Search what's coming">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-3 md:py-4">
          <div className="flex items-center gap-3">
            <label className="relative flex-1 min-w-0 md:max-w-sm">
              <span className="sr-only">Search by property or country</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className={`${s.icon} absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4`}><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              <input type="search" value={st.q} onChange={(e) => update({ q: e.target.value }, "replace")} placeholder="Lodge or country" className={`${s.field} w-full h-10 pl-9 pr-3 text-[15px]`} />
            </label>
            <label className="shrink-0 flex items-center gap-2">
              <span className="hidden md:inline font-mono text-[10.5px] tracking-[0.2em] uppercase ledger-muted">Sort</span>
              <span className="sr-only md:hidden">Sort</span>
              <select value={st.sort} onChange={(e) => update({ sort: e.target.value as Sort })} className={`${s.field} h-10 max-w-[44vw] md:max-w-none px-2 md:px-2.5 text-[13.5px] md:text-[14px]`}>
                {SORTS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </label>
            <div role="group" aria-label="Group by" className="shrink-0 hidden sm:flex h-10">
              {(["year", "region"] as Group[]).map((g) => { const on = st.group === g; return (
                <button key={g} type="button" aria-pressed={on} onClick={() => update({ group: g })} className={`${s.chip} px-3 text-[12.5px] ${g === "region" ? "-ml-px" : ""}`}>By {g}</button>
              ); })}
            </div>
            <p className="hidden lg:block ml-auto font-mono text-[11px] tracking-[0.16em] uppercase ledger-muted" aria-live="polite">{filtered ? `${shown.length} of ${items.length} shown` : `All ${items.length} shown`}</p>
          </div>
          <div className={`${s.chips} mt-3 -mx-5 px-5 md:mx-0 md:px-0 flex items-center gap-2 overflow-x-auto`}>
            {(["year", "region"] as Group[]).map((g) => { const on = st.group === g; return (
              <button key={g} type="button" className={`sm:hidden ${chip}`} aria-pressed={on} onClick={() => update({ group: g })}>By {g}</button>
            ); })}
            <span className={`sm:hidden ${sep}`} aria-hidden="true" />
            <button type="button" className={chip} aria-pressed={!filtered} onClick={() => update(clear)}>All</button>
            {regionChips.length > 1 && <span className={sep} aria-hidden="true" />}
            {regionChips.length > 1 && regionChips.map((r) => { const on = st.region === r.slug; return (
              <button key={r.slug} type="button" className={chip} aria-pressed={on} onClick={() => update({ region: on ? null : r.slug, country: null })}><span className="uppercase tracking-[0.12em] text-[11px]">{r.name}</span><span className={`font-mono text-[10.5px] ${s.count}`}>{r.count}</span></button>
            ); })}
            <span className={sep} aria-hidden="true" />
            {countries.map((c) => { const on = st.country === c.slug; return (
              <button key={c.slug} type="button" className={chip} aria-pressed={on} onClick={() => update({ country: on ? null : c.slug })}>{c.name}<span className={`font-mono text-[10.5px] ${s.count}`}>{c.count}</span></button>
            ); })}
            <span className={sep} aria-hidden="true" />
            {years.map((y) => { const on = st.year === y.key; return (
              <button key={y.key} type="button" className={chip} aria-pressed={on} onClick={() => update({ year: on ? null : y.key })}><span className="font-mono">{y.label}</span><span className={`font-mono text-[10.5px] ${s.count}`}>{y.count}</span></button>
            ); })}
            <span className={sep} aria-hidden="true" />
            {STATUS_CHIPS.map((x) => { const on = st.status === x.key; return (
              <button key={x.key} type="button" className={chip} aria-pressed={on} onClick={() => update({ status: on ? null : x.key })}>{x.label}</button>
            ); })}
          </div>
          <p className="lg:hidden mt-2 font-mono text-[10.5px] tracking-[0.16em] uppercase ledger-muted" aria-live="polite">{filtered ? `${shown.length} of ${items.length} shown` : `All ${items.length} shown`}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-10 pb-10">
        {groups.length === 0 && (
          <div className="py-24 md:py-32 text-center max-w-xl mx-auto">
            <p className="ledger-display italic text-[2rem] md:text-[2.6rem] leading-tight">Nothing on the horizon matches that yet.</p>
            <p className="mt-4 text-[16px] ledger-muted">Try another country or year, or clear the filters to see everything filed.</p>
            <div className="mt-8 flex justify-center gap-3 flex-wrap">
              <button type="button" className={`ledger-btn ledger-btn--solid ${s.primary}`} onClick={() => update(clear)}>Clear the filters</button>
              <Link href="/plan?from=whats-coming" className={`ledger-btn ${s.secondary}`}>Ask James</Link>
            </div>
          </div>
        )}
        {groups.map((g) => (
          <section key={g.key} aria-labelledby={`year-${g.key}`} className="pt-16 md:pt-28">
            <header className={`${s.yearHead} flex items-end gap-5 md:gap-8 pb-4 md:pb-6`} style={{ ["--pw" as string]: g.items.find((x) => x.pathway)?.pathway?.accent }}>
              <h2 id={`year-${g.key}`} className={`${s.yearNum} ${s.yearNumC} ${!/^\d{4}$/.test(g.key) ? "text-[3.4rem] md:text-[6.5rem] italic" : "text-[6rem] md:text-[12rem]"}`}>{g.label}</h2>
              <p className="pb-2 md:pb-5 font-mono text-[11px] md:text-[12px] tracking-[0.2em] uppercase ledger-muted">{g.items.length} {g.items.length === 1 ? "opening" : "openings"}</p>
            </header>
            <ol className="mt-10 md:mt-16 space-y-20 md:space-y-32">
              {g.items.map((c) => { const flip = n++ % 2 === 1; return <li key={c.slug}><Feature c={c} flip={flip} /></li>; })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function Feature({ c, flip }: { c: ExplorerItem; flip: boolean }) {
  return (
    <article id={c.slug} aria-labelledby={`${c.slug}-name`} className={`${s.card} ${s.anchor} ${s.reveal} grid lg:grid-cols-12 gap-7 lg:gap-14 items-center`}
      style={c.pathway ? { ["--pw" as string]: c.pathway.accent, ["--pw-text" as string]: c.pathway.text, ["--pw-tint" as string]: c.pathway.tint } : undefined}>
      <div className={`${s.imgCol} lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
        <div className={`${s.frame} ${s.frameBg} relative aspect-[4/3] md:aspect-[16/10] overflow-hidden`}>
          {c.hero ? (
            <>
              <Image src={c.hero.src} alt={c.hero.alt} fill quality={85} sizes="(min-width: 1400px) 800px, (min-width: 1024px) 58vw, 100vw" className="object-cover" />
              {c.hero.credit && <span className="absolute bottom-2 right-3 font-mono text-[9.5px] tracking-[0.12em] text-white/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">{c.hero.credit}</span>}
            </>
          ) : <ColourField c={c} />}
          <div className={`absolute top-4 ${flip ? "left-4" : "right-4"} md:top-6 ${flip ? "md:left-6" : "md:right-6"}`}>
            <ComingStamp status={c.status} date={c.date} id={c.slug} size={136} rotate={flip ? 7 : -7} />
          </div>
        </div>
      </div>
      <div className={`${s.panel} ${s.textCol} lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
        <div className={`${s.cardHead} flex items-baseline justify-between gap-3 font-mono text-[11px] tracking-[0.22em] uppercase`}>
          <p className="ledger-muted">{c.country ?? "The Ledger"}<span className={s.onlyB}> &middot; {statusWord(c.status)}</span>{c.ledgerId && <span className={s.onlyA}> &middot;</span>}</p>
          {c.ledgerId && <p className="ledger-crimson shrink-0">{c.ledgerId}</p>}
        </div>
        <h3 id={`${c.slug}-name`} className={`${s.nameB} ledger-display text-[2.3rem] md:text-[3.2rem] leading-[1.02] mt-4 tracking-[-0.01em]`}>
          {c.href ? <Link href={c.href} className="hover:underline underline-offset-[6px] decoration-1">{c.name}</Link> : c.name}
        </h3>
        {c.tagline && <p className={`${s.tagline} ledger-display italic text-[1.25rem] md:text-[1.45rem] leading-snug mt-3`}>{c.tagline}</p>}
        <div className={`${s.ruleY} mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2 py-3`}>
          <p className={`${s.line} font-mono text-[12px] tracking-[0.16em] uppercase`}>{c.line}</p>
          {c.countdown && <p className="font-mono text-[12px] tracking-[0.16em] uppercase ledger-muted">{c.countdown}</p>}
        </div>
        {c.note && <p className={`${s.noteText} mt-5 text-[16.5px] leading-relaxed`}>{c.note}</p>}
        {(c.bestMonths || c.airport) && (
          <dl className="mt-6 grid sm:grid-cols-2 gap-4 text-[14.5px]">
            {c.bestMonths && <div><dt className="font-mono text-[10px] tracking-[0.2em] uppercase ledger-muted">Best months</dt><dd className="mt-1">{c.bestMonths}</dd></div>}
            {c.airport && <div><dt className="font-mono text-[10px] tracking-[0.2em] uppercase ledger-muted">Fly into</dt><dd className="mt-1">{c.airport}</dd></div>}
          </dl>
        )}
        {c.pathway && (
          <div className="mt-7">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase ledger-muted">Pair it with</p>
            <Link href={`/pathways/${c.pathway.key}`} className={`${s.pair} mt-2`} aria-label={`Pair it with the Wild Pathway ${c.pathway.name}`}>
              <span className={s.pairDot} aria-hidden="true" />
              <span className="ledger-display text-[1.15rem] leading-none">{c.pathway.name}</span>
              <span className="font-mono text-[9.5px] tracking-[0.2em] uppercase opacity-70">Wild Pathway</span>
            </Link>
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href={c.plan} className={`ledger-btn ledger-btn--solid ${s.primary}`}>Plan with James</Link>
          {c.href && <Link href={c.href} className={`ledger-btn ${s.secondary}`}>View the stay</Link>}
        </div>
      </div>
    </article>
  );
}

// No brand photograph yet: a Deep Sea colour field with the name set large, never a stand-in image.
function ColourField({ c }: { c: ExplorerItem }) {
  return (
    <div className={`${s.colourField} absolute inset-0 text-white flex flex-col justify-between p-6 md:p-10`} style={{ ["--f-from" as string]: c.field.from, ["--f-to" as string]: c.field.to, ["--f-glow" as string]: c.field.glow }}>
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.18]" preserveAspectRatio="none" viewBox="0 0 400 250">
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M0 ${170 + i * 11} Q 100 ${164 + i * 11} 200 ${170 + i * 11} T 400 ${170 + i * 11}`} fill="none" stroke="white" strokeWidth="0.6" />)}
        <circle cx="300" cy="170" r="46" fill="none" stroke="white" strokeWidth="0.6" /><line x1="0" y1="170" x2="400" y2="170" stroke="white" strokeWidth="0.8" />
      </svg>
      <p className="relative font-mono text-[10.5px] tracking-[0.26em] uppercase text-white/75">{c.country}</p>
      <div className="relative">
        <p className="ledger-display text-[2.6rem] sm:text-[3.4rem] lg:text-[4.2rem] leading-[0.95] tracking-[-0.015em] max-w-[14ch]">{c.name}</p>
        <p className="mt-4 ledger-display italic text-[1rem] md:text-[1.1rem] text-white/75">Photographs when the brand releases them.</p>
      </div>
    </div>
  );
}

/** "Opening" or "Being reimagined", from the same labels as the status chips. */
function statusWord(status: string): string {
  return STATUS_CHIPS.find((x) => x.key === viewStatus(status))?.label ?? "Opening";
}
