"use client";

import Link from "next/link";
import { GUARD_ON, isBuilt } from "@/lib/routes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MiniSearch from "minisearch";
import { ArrowRight, MessageCircle, Search, X } from "lucide-react";
import { DESK_ADVISORS } from "@/lib/content/advisors";
import { VOLUME_LABEL } from "@/lib/content/advisor-desk";
import { GREEN_INK } from "@/lib/content/advisor-desk";
import { VESSEL_SLUGS, vesselHref } from "@/lib/content/vessels";
import { lockScroll } from "@/lib/scroll-lock";
import { leaveTrail, recents, remember, type Recent, type SearchScope } from "@/lib/search-bus";

// Vessels filed as stays are Voyages (lib/content/vessels.ts): they file under "Ships & voyages",
// never "Stays", and point at their ship page where one is built.
const asVoyage = (x: Item): Item => {
  const slug = x.t === "stay" && x.u.startsWith("/stays/") ? x.u.slice(7) : null;
  return slug && VESSEL_SLUGS.has(slug) ? { ...x, k: "Ship", u: vesselHref(slug) } : x;
};

// SearchPanel — the house search, opened from the header (or "/" and Ctrl/⌘+K).
// The index (/search/index.json) is generated from the Ledger on every
// publish: public fields only (name, kind, country, region, traveller types,
// tagline). It loads the first time the panel opens (~19 KB compressed), then
// every keystroke is answered in the browser. Names are matched with prefix
// and typo tolerance ("londolozzi" finds Londolozi). Traveller-type chips
// filter the same index. Under the link guard, a result whose page isn't
// built yet opens the planning form with that place filled in. No result → Ask Iggi, and Plan with James is always
// the last row.

type Item = { t: "stay" | "destination" | "route" | "advisor" | "page"; n: string; u: string; k: string; p: string | null; r: string | null; f: string[]; g: string | null; c?: string[] };
type Doc = Item & { id: number };

const TYPES: { key: string; label: string }[] = [
  { key: "honeymoon", label: "Honeymoon" },
  { key: "family", label: "Family & multigenerational" },
  { key: "adventure", label: "Adventure" },
  { key: "wildlife_photography", label: "Wildlife & photography" },
  { key: "solo", label: "Solo" },
  { key: "luxury", label: "Pure luxury" },
];

// Advisors are indexed from the Advisor Desk: name, base, specialties,
// volumes and the places they carry, so "wellness", "Botswana" or "small
// ships" finds the person as well as the place.
const ADVISOR_ITEMS: Item[] = DESK_ADVISORS.map((a) => ({
  t: "advisor",
  n: a.name,
  u: a.profileHref ?? "/about/team#advisors",
  k: a.sample ? "Advisor · stand-in" : "Advisor",
  p: a.desk!.base,
  r: null,
  f: [],
  g: [...a.desk!.specialties, ...a.desk!.volumes.map((v) => VOLUME_LABEL[v]), ...a.desk!.entries.map((e) => `${e.name} ${e.place}`)].join(" · "),
}));

const GROUPS: { key: string; label: string; match: (d: Doc) => boolean }[] = [
  { key: "ef", label: "The Exceptional Few", match: (d) => d.k === "Collection" },
  { key: "dest", label: "Destinations", match: (d) => d.t === "destination" },
  { key: "camps", label: "Safari camps & lodges", match: (d) => d.t === "stay" && d.r === "africa" },
  { key: "ships", label: "Ships & voyages", match: (d) => (d.t === "stay" && d.k === "Ship") || d.k === "Voyage" },
  { key: "stays", label: "Stays", match: (d) => d.t === "stay" && d.r !== "africa" && d.k !== "Ship" && d.k !== "Collection" },
  { key: "routes", label: "Overland routes", match: (d) => d.t === "route" && d.k !== "Voyage" },
  // Places first, then the advisors who know them (James, 4 Nov 2026: "Ivory Lodge" must show the lodge on top).
  { key: "advisors", label: "Advisors who know it", match: (d) => d.t === "advisor" },
  { key: "pages", label: "Sections of the house", match: (d) => d.t === "page" },
];

// The index loads once per visit, however often the panel opens.
let INDEX: Promise<Doc[]> | null = null;
const loadIndex = () => (INDEX ??= fetch("/search/index.json")
  .then((r) => r.json())
  .then((j: { items: Item[] }) => [...j.items.map(asVoyage), ...ADVISOR_ITEMS].map((x, id) => ({ ...x, id })))
  .catch(() => { INDEX = null; return ADVISOR_ITEMS.map((x, id) => ({ ...x, id })); }));

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’]/g, "");


/** An entry belongs to a place when it is filed under one of its countries, or in its region. */
function inScope(d: Doc, s: SearchScope): boolean {
  if (d.t === "advisor" || d.t === "page") return false;
  const names = (s.countries?.length ? s.countries : [s.name]).map(norm);
  const filed = [d.p, ...(d.c ?? [])].filter(Boolean).map((x) => norm(x as string));
  if (filed.some((f) => names.some((n) => f === n || n.startsWith(f + " ") || f.startsWith(n + " ")))) return true;
  if (d.t === "destination" && names.some((n) => norm(d.n) === n)) return true;
  return !!s.region && d.r === s.region;
}

const PER_GROUP = 6;

export default function SearchPanel({ open, onClose, initialQuery = "", initialType = null, scope = null }: { open: boolean; onClose: () => void; initialQuery?: string; initialType?: string | null;
  /** Opened from a destination: results start inside that place, with one tap to search everywhere. */
  scope?: SearchScope | null }) {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState<string | null>(initialType);
  const [scoped, setScoped] = useState(!!scope);
  const [more, setMore] = useState<string | null>(null);
  const [recent, setRecent] = useState<Recent[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const where = scope && scoped ? scope : null;

  useEffect(() => {
    if (!open) return;
    setRecent(recents());
    if (!docs) loadIndex().then(setDocs);
  }, [open, docs]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => input.current?.focus({ preventScroll: true }), 30);
    const release = lockScroll();
    return () => { clearTimeout(t); release(); };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const engine = useMemo(() => {
    if (!docs) return null;
    const ms = new MiniSearch<Doc>({
      fields: ["n", "p", "k", "g"],
      storeFields: ["id"],
      processTerm: (t) => norm(t),
      searchOptions: { boost: { n: 4, p: 2 }, prefix: true, fuzzy: 0.2, combineWith: "AND" },
    });
    ms.addAll(docs);
    return ms;
  }, [docs]);

  const results = useMemo(() => {
    if (!docs || !engine) return [];
    let list: Doc[];
    if (q.trim()) list = engine.search(q).map((r) => docs[r.id as number]);
    else if (type || where) list = docs.filter((d) => d.t !== "advisor" && d.t !== "page");
    else return [];
    if (where) list = list.filter((d) => inScope(d, where));
    if (type) list = list.filter((d) => d.f.includes(type));
    return list.slice(0, where ? 400 : 60);
  }, [docs, engine, q, type, where]);

  const grouped = GROUPS.map((g) => { const all = results.filter(g.match); return { ...g, all, items: more === g.key ? all : all.slice(0, PER_GROUP) }; }).filter((g) => g.items.length);
  const typeLabel = TYPES.find((t) => t.key === type)?.label;
  const searched = q.trim() || type || where;

  const close = useCallback(() => onClose(), [onClose]);
  const choose = (d: { n: string; u: string; k: string }, href: string) => {
    remember({ n: d.n, u: href, k: d.k });
    leaveTrail({ q: q.trim(), scope: where, from: location.pathname + location.hash, fromTitle: document.title.split(" | ")[0], to: href });
    close();
  };
  const hrefOf = (d: Doc) => (isBuilt(d.u) || !GUARD_ON ? d.u : `/plan?q=${encodeURIComponent(d.n)}`);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-ink/55 backdrop-blur-sm flex items-end md:items-start justify-center px-0 md:px-6 pt-0 md:pt-20" role="dialog" aria-modal="true" aria-label={where ? `Search ${where.name}` : "Search the house"} onClick={close}>
      <div className="w-full max-w-3xl ledger-page border ledger-border shadow-[0_24px_60px_rgba(0,0,0,0.35)] text-ink max-h-[92vh] md:max-h-[88vh] flex flex-col rounded-t-2xl md:rounded-none" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 border-b ledger-rule">
          <Search className="w-5 h-5 ledger-crimson shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <label htmlFor="ledger-search" className="sr-only">{where ? `Search stays, ships and voyages in ${where.name}` : "Search lodges, stays, ships, cruises, destinations and advisors"}</label>
          <input
            id="ledger-search"
            ref={input}
            value={q}
            onChange={(e) => { setQ(e.target.value); setMore(null); }}
            placeholder={where ? `A lodge, a ship or a voyage in ${where.name}` : "Find a lodge, stay, ship or place"}
            className="flex-1 min-w-0 h-14 md:h-16 bg-transparent ledger-display text-xl md:text-2xl outline-none placeholder:text-ink/35"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="button" onClick={close} className="p-2 -mr-2" aria-label="Close search"><X className="w-5 h-5" strokeWidth={1.25} /></button>
        </div>

        {scope && (
          <div className="px-5 py-2.5 border-b ledger-border flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-mist">
            <span className="ledger-eyebrow">Searching</span>
            <span role="group" aria-label="Where to search" className="inline-flex">
              <button type="button" aria-pressed={scoped} onClick={() => { setScoped(true); setMore(null); }} className={`px-3 py-1 border text-[14px] ${scoped ? "bg-ink border-ink text-paper" : "ledger-border bg-paper"}`}>In {scope.name}</button>
              <button type="button" aria-pressed={!scoped} onClick={() => { setScoped(false); setMore(null); }} className={`px-3 py-1 border border-l-0 text-[14px] ${!scoped ? "bg-ink border-ink text-paper" : "ledger-border bg-paper"}`}>Everywhere</button>
            </span>
          </div>
        )}

        <div className="px-5 py-3 border-b ledger-border flex md:flex-wrap items-center gap-2 overflow-x-auto md:overflow-visible">
          <span className="ledger-eyebrow mr-1 shrink-0">Travelling for</span>
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={type === t.key}
              onClick={() => setType(type === t.key ? null : t.key)}
              className={`px-3 py-1 border text-[14px] whitespace-nowrap shrink-0 transition-colors ${type === t.key ? "bg-crimson border-crimson text-paper" : "ledger-border hover:border-crimson"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto px-5 py-4 flex-1" aria-live="polite">
          {!docs && <p className="ledger-eyebrow">Opening the Ledger…</p>}

          {docs && !searched && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="ledger-eyebrow ledger-crimson">How to search</p>
                <p className="mt-2 text-[15px] leading-relaxed">Type the name of a lodge, a camp, a ship or a cruise line, a country or a region, or an advisor. A few letters are enough, and a misspelling still finds it.</p>
                <p className="mt-2 text-[13px] ledger-muted">Press <kbd className="border ledger-border px-1">/</kbd> or <kbd className="border ledger-border px-1">⌘K</kbd> on any page to search again.</p>
                <p className="ledger-eyebrow ledger-crimson mt-5">Try</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {["Londolozi", "Botswana", "Windstar", "Galápagos", "Tuscany", "Private island", "Antarctica"].map((s) => (
                    <li key={s}><button type="button" onClick={() => setQ(s)} className="house-chip">{s}</button></li>
                  ))}
                </ul>
              </div>
              <div>
                {recent.length > 0 ? (
                  <>
                    <p className="ledger-eyebrow ledger-crimson">Recently viewed</p>
                    <ul className="mt-2">
                      {recent.map((r) => (
                        <li key={r.u}><Link href={r.u} onClick={() => choose(r, r.u)} className="flex items-baseline justify-between gap-3 py-2 border-b ledger-border hover:ledger-crimson"><span className="ledger-display text-[16px]">{r.n}</span><span className="ledger-eyebrow shrink-0">{r.k}</span></Link></li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <p className="ledger-eyebrow ledger-crimson">In the Ledger</p>
                    <p className="mt-2 text-[15px] ledger-muted">{docs.filter((d) => d.t === "stay").length} stays, camps and ships, {docs.filter((d) => d.t === "destination").length} destinations, {docs.filter((d) => d.t === "route").length} voyages and routes and {ADVISOR_ITEMS.length} advisors, every one filed under a permanent ID.</p>
                  </>
                )}
              </div>
            </div>
          )}

          {docs && searched && (
            <>
              <p className="ledger-eyebrow mb-3">
                {results.length} {results.length === 1 ? "entry" : "entries"}
                {q.trim() ? ` for “${q.trim()}”` : ""}
                {where ? ` in ${where.name}` : ""}
                {typeLabel ? ` · ${typeLabel}` : ""}
              </p>
              {grouped.map((g) => (
                <section key={g.key} className="mb-5">
                  <h3 className="ledger-eyebrow ledger-crimson border-b ledger-border pb-1.5 flex justify-between gap-3"><span>{g.label}</span>{g.all.length > PER_GROUP && <span className="ledger-muted tabular-nums">{g.all.length}</span>}</h3>
                  <ul>
                    {g.items.map((d) => {
                      const href = hrefOf(d);
                      return (
                        <li key={d.id}>
                          <Link href={href} onClick={() => choose(d, href)} className="group flex items-baseline justify-between gap-4 py-2.5 border-b ledger-border hover:bg-paper-card/60 -mx-2 px-2">
                            <span className="min-w-0">
                              <span className="ledger-display text-[17px] group-hover:ledger-crimson">{d.n}</span>
                              {d.g && <span className="block text-[13px] ledger-muted leading-snug mt-0.5 line-clamp-2">{d.g}</span>}
                            </span>
                            <span className="ledger-eyebrow min-w-0 max-w-[45%] text-right" style={d.t === "advisor" ? { color: GREEN_INK } : undefined}>{d.k}{d.p ? ` · ${d.p}` : ""}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {g.all.length > PER_GROUP && more !== g.key && (
                    <button type="button" onClick={() => setMore(g.key)} className="mt-2 ledger-btn-ghost text-[15px]">Show all {g.all.length} {g.label.toLowerCase()}</button>
                  )}
                </section>
              ))}
              {!results.length && (
                <div className="ledger-paper p-5">
                  <p className="ledger-display text-xl">Nothing filed under that{where ? ` in ${where.name}` : ""} yet.</p>
                  {where && <button type="button" onClick={() => setScoped(false)} className="mt-2 ledger-btn-ghost text-[15px]">Search everywhere instead</button>}
                  <p className="mt-2 text-[15px] ledger-muted">Ask Iggi, who answers from the same Ledger the advisors use, or tell James where you&rsquo;re thinking of going.</p>
                  <Link href={`/plan/iggi?q=${encodeURIComponent(q)}`} onClick={close} className="ledger-btn mt-4 inline-flex items-center gap-2"><MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Ask Iggi</Link>
                </div>
              )}
            </>
          )}
        </div>

        <Link href="/plan" onClick={close} className="flex items-center justify-between px-5 py-3.5 border-t ledger-rule hover:bg-paper-card/60">
          <span className="text-[15px]">Can&rsquo;t find it? <span className="ledger-display">Plan with James</span></span>
          <ArrowRight className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
