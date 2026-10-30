"use client";

import Link from "next/link";
import { GUARD_ON, isBuilt } from "@/lib/routes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MiniSearch from "minisearch";
import { ArrowRight, MessageCircle, Search, X } from "lucide-react";
import { DESK_ADVISORS } from "@/lib/content/advisors";
import { VOLUME_LABEL } from "@/lib/content/advisor-desk";
import { GREEN_INK } from "@/lib/content/advisor-desk";

// SearchPanel — the house search, opened from the header (or "/" and Ctrl/⌘+K).
// The index (/search/index.json) is generated from the Ledger on every
// publish: public fields only (name, kind, country, region, traveller types,
// tagline). It loads the first time the panel opens (~19 KB compressed), then
// every keystroke is answered in the browser. Names are matched with prefix
// and typo tolerance ("londolozzi" finds Londolozi). Traveller-type chips
// filter the same index. Under the link guard, a result whose page isn't
// built yet opens the planning form with that place filled in. No result → Ask Iggi, and Plan with James is always
// the last row.

type Item = { t: "stay" | "destination" | "route" | "advisor"; n: string; u: string; k: string; p: string | null; r: string | null; f: string[]; g: string | null };
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
  k: a.sample ? "Advisor · sample" : "Advisor",
  p: a.desk!.base,
  r: null,
  f: [],
  g: [...a.desk!.specialties, ...a.desk!.volumes.map((v) => VOLUME_LABEL[v]), ...a.desk!.entries.map((e) => `${e.name} ${e.place}`)].join(" · "),
}));

const GROUPS: { key: string; label: string; match: (d: Doc) => boolean }[] = [
  { key: "advisors", label: "Advisors who know it", match: (d) => d.t === "advisor" },
  { key: "dest", label: "Destinations", match: (d) => d.t === "destination" },
  { key: "camps", label: "Safari camps & lodges", match: (d) => d.t === "stay" && d.r === "africa" },
  { key: "ships", label: "Ships & voyages", match: (d) => d.t === "stay" && d.k === "Ship" },
  { key: "stays", label: "Stays", match: (d) => d.t === "stay" && d.r !== "africa" && d.k !== "Ship" },
  { key: "routes", label: "Overland routes", match: (d) => d.t === "route" },
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function SearchPanel({ open, onClose, initialQuery = "", initialType = null }: { open: boolean; onClose: () => void; initialQuery?: string; initialType?: string | null }) {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState<string | null>(initialType);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || docs) return;
    fetch("/search/index.json")
      .then((r) => r.json())
      .then((j: { items: Item[] }) => setDocs([...j.items, ...ADVISOR_ITEMS].map((x, id) => ({ ...x, id }))))
      .catch(() => setDocs(ADVISOR_ITEMS.map((x, id) => ({ ...x, id }))));
  }, [open, docs]);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 30);
    document.body.style.overflow = open ? "hidden" : "";
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
    else if (type) list = docs.filter((d) => d.t === "stay");
    else return [];
    if (type) list = list.filter((d) => d.f.includes(type));
    return list.slice(0, 60);
  }, [docs, engine, q, type]);

  const grouped = GROUPS.map((g) => ({ ...g, items: results.filter(g.match).slice(0, 6) })).filter((g) => g.items.length);
  const typeLabel = TYPES.find((t) => t.key === type)?.label;
  const searched = q.trim() || type;

  const close = useCallback(() => onClose(), [onClose]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-ink/55 backdrop-blur-sm flex items-end md:items-start justify-center px-0 md:px-6 pt-0 md:pt-20" role="dialog" aria-modal="true" aria-label="Search the Ledger" onClick={close}>
      <div className="w-full max-w-3xl ledger-page border ledger-border shadow-[0_24px_60px_rgba(0,0,0,0.35)] text-ink max-h-[92vh] md:max-h-[88vh] flex flex-col rounded-t-2xl md:rounded-none" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 border-b ledger-rule">
          <Search className="w-5 h-5 ledger-crimson shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <label htmlFor="ledger-search" className="sr-only">Search stays, camps, ships and destinations</label>
          <input
            id="ledger-search"
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="A stay, a camp, a ship or a country…"
            className="flex-1 h-14 md:h-16 bg-transparent ledger-display text-xl md:text-2xl outline-none placeholder:text-ink/35"
            autoComplete="off"
          />
          <button type="button" onClick={close} className="p-2 -mr-2" aria-label="Close search"><X className="w-5 h-5" strokeWidth={1.25} /></button>
        </div>

        <div className="px-5 py-3 border-b ledger-border flex md:flex-wrap items-center gap-2 overflow-x-auto md:overflow-visible">
          <span className="ledger-eyebrow mr-1">Travelling for</span>
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
                <p className="ledger-eyebrow ledger-crimson">Try</p>
                <ul className="mt-2 space-y-1.5 text-[16px]">
                  {["Londolozi", "Botswana", "Small ships", "Wellness", "Other Europe", "Aliikai"].map((s) => (
                    <li key={s}><button type="button" onClick={() => setQ(s)} className="hover:ledger-crimson">{s}</button></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="ledger-eyebrow ledger-crimson">In the Ledger</p>
                <p className="mt-2 text-[15px] ledger-muted">{docs.filter((d) => d.t === "stay").length} stays and ships, {docs.filter((d) => d.t === "destination").length} destinations and {docs.filter((d) => d.t === "route").length} overland routes, every one vetted and filed under a permanent ID.</p>
              </div>
            </div>
          )}

          {docs && searched && (
            <>
              <p className="ledger-eyebrow mb-3">
                {results.length} {results.length === 1 ? "entry" : "entries"}
                {q.trim() ? ` for “${q.trim()}”` : ""}
                {typeLabel ? ` · ${typeLabel}` : ""}
              </p>
              {grouped.map((g) => (
                <section key={g.key} className="mb-5">
                  <h3 className="ledger-eyebrow ledger-crimson border-b ledger-border pb-1.5">{g.label}</h3>
                  <ul>
                    {g.items.map((d) => (
                      <li key={d.id}>
                        <Link href={isBuilt(d.u) || !GUARD_ON ? d.u : `/plan?q=${encodeURIComponent(d.n)}`} onClick={close} className="group flex items-baseline justify-between gap-4 py-2.5 border-b ledger-border hover:bg-paper-card/60 -mx-2 px-2">
                          <span>
                            <span className="ledger-display text-[17px] group-hover:ledger-crimson">{d.n}</span>
                            {d.g && <span className="block text-[13px] ledger-muted leading-snug mt-0.5">{d.g}</span>}
                          </span>
                          <span className="ledger-eyebrow shrink-0 text-right" style={d.t === "advisor" ? { color: GREEN_INK } : undefined}>{d.k}{d.p ? ` · ${d.p}` : ""}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              {!results.length && (
                <div className="ledger-paper p-5">
                  <p className="ledger-display text-xl">Nothing filed under that yet.</p>
                  <p className="mt-1 text-[15px] ledger-muted">Ask Iggi, who answers from the same Ledger the advisors use, or tell James where you&rsquo;re thinking of going.</p>
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
