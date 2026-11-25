"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import AtlasSearch from "./AtlasSearch";
import { loadIndex } from "./index-client";
import { wildlifeFor } from "@/lib/field-notes/match-place";
import {
  CATEGORY_LABEL, COLLECTION_LABEL, EMPTY, INTEREST_LABEL, datesWords, describe, isPlace, fromQuery, norm, partyWords, search, toQuery,
  type AtlasQuery, type AtlasRecord, type Result,
} from "@/lib/atlas/match";

// Atlas results (/atlas), Phase 01. The index is fetched once (/atlas/index.json, built from the Ledger at deploy), and
// every change of the search is answered in the browser by lib/atlas/match.ts. The search lives in the address, so a
// result list can be shared or bookmarked. Every card prints three separate lines: season, offer and availability.

const PAGE = 24;

export default function AtlasResults({ places, wildlife = {} }: { places: string[]; wildlife?: Record<string, { name: string; href: string }[]> }) {
  const [records, setRecords] = useState<AtlasRecord[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState<AtlasQuery>(EMPTY);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [shownAwaiting, setShownAwaiting] = useState(12);
  const species = useMemo(() => wildlifeFor(q.where, wildlife, norm), [q.where, wildlife]);

  useEffect(() => {
    setQ(fromQuery(new URLSearchParams(window.location.search)));
    setReady(true);
    loadIndex().then(setRecords).catch(() => setFailed(true));
    const onPop = () => setQ(fromQuery(new URLSearchParams(window.location.search)));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const apply = useCallback((next: AtlasQuery) => {
    setQ(next); setShown(PAGE); setShownAwaiting(12);
    const s = toQuery(next);
    window.history.pushState(null, "", s ? `/atlas?${s}` : "/atlas");
  }, []);

  const out = useMemo(() => (records ? search(records, q) : null), [records, q]);
  const chips: { key: string; label: string; clear: () => void }[] = [
    ...(q.where.trim() ? [{ key: "where", label: q.where.trim(), clear: () => apply({ ...q, where: "" }) }] : []),
    ...q.cat.map((c) => ({ key: c, label: CATEGORY_LABEL[c], clear: () => apply({ ...q, cat: q.cat.filter((x) => x !== c) }) })),
    ...q.col.map((c) => ({ key: c, label: COLLECTION_LABEL[c], clear: () => apply({ ...q, col: q.col.filter((x) => x !== c) }) })),
    ...(datesWords(q) ? [{ key: "dates", label: datesWords(q)!, clear: () => apply({ ...q, from: null, to: null, months: [] }) }] : []),
    ...(q.adults !== 2 || q.children.length ? [{ key: "who", label: partyWords(q), clear: () => apply({ ...q, adults: 2, children: [] }) }] : []),
    ...q.interests.map((i) => ({ key: i, label: INTEREST_LABEL[i], clear: () => apply({ ...q, interests: q.interests.filter((x) => x !== i) }) })),
  ];

  return (
    <>
      <section className="bg-mist border-b ledger-border" aria-labelledby="atlas-h">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-12">
          <p className="ledger-eyebrow">The Atlas</p>
          <h1 id="atlas-h" className="ledger-display text-[2rem] md:text-[2.6rem] leading-tight mt-2">{ready ? describe(q, isPlace(q.where, places)) : "The Atlas"}</h1>
          <div className="mt-5">{ready && <AtlasSearch places={places} initial={q} onSubmit={apply} idPrefix="atlas-results" />}</div>
          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Your search">
              {chips.map((c) => <li key={c.key}><button type="button" onClick={c.clear} className="house-chip house-chip--primary min-h-[44px] !normal-case !tracking-normal !text-[14px] !font-medium" aria-label={`Remove ${c.label}`}>{c.label} <span aria-hidden="true">×</span></button></li>)}
              <li><button type="button" onClick={() => apply({ ...EMPTY, sort: q.sort })} className="ledger-btn-ghost text-[15px] min-h-[44px] px-2">Clear all</button></li>
            </ul>
          )}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        <div className="py-5 border-b ledger-border flex flex-wrap items-center justify-between gap-4">
          <div aria-live="polite" className="min-w-0 flex-1 basis-[320px]">
            {failed && <p className="text-[15px]">The Atlas could not be opened just now. Please try again, or speak with an advisor.</p>}
            {!failed && !out && <p className="ledger-eyebrow">Opening the Ledger…</p>}
            {out && (
              <>
                <p className="text-[15px]">{out.results.length} {out.results.length === 1 ? "entry matches" : "entries match"}.{out.offers.eligible > 0 ? ` ${out.offers.eligible} carry an offer that applies to your dates.` : ""}{out.offers.mayApply > 0 ? ` ${out.offers.mayApply} carry an offer that may apply.` : ""}</p>
                {out.withUnknowns > 0 && <p className="text-[13px] ledger-muted mt-1">{out.withUnknowns} {out.withUnknowns === 1 ? "has" : "have"} a detail the house confirms, shown on the card.</p>}
                {q.sort === "savings" && <p className="text-[13px] ledger-muted mt-1">{out.savingsEmpty ? "No entry in this search carries a current offer, so the order is Best match." : "Savings first lists entries with a current offer first. It does not compare the size of a saving."}</p>}
              </>
            )}
          </div>
          <div role="group" aria-label="Order" className="inline-flex">
            <button type="button" aria-pressed={q.sort === "best"} onClick={() => apply({ ...q, sort: "best" })} className={`min-h-[44px] px-4 border border-ink text-[13px] ${q.sort === "best" ? "bg-ink text-paper" : "bg-paper"}`}>Best match</button>
            <button type="button" aria-pressed={q.sort === "savings"} onClick={() => apply({ ...q, sort: "savings" })} className={`min-h-[44px] px-4 border border-l-0 border-ink text-[13px] ${q.sort === "savings" ? "bg-ink text-paper" : "bg-paper"}`}>Savings first</button>
          </div>
        </div>

        {out && species.length > 0 && (
          <p className="pt-5 text-[14.5px] leading-relaxed">
            <span className="ledger-eyebrow mr-3">Wildlife here</span>
            {species.slice(0, 6).map((s, i) => <span key={s.href}>{i > 0 && ", "}<Link href={s.href} className="underline underline-offset-4 decoration-[color:var(--jw-hairline)] hover:ledger-crimson">{s.name}</Link></span>)}
            {species.length > 6 && <>, <Link href="/wildlife" className="underline underline-offset-4 decoration-[color:var(--jw-hairline)] hover:ledger-crimson">and {species.length - 6} more</Link></>}
          </p>
        )}

        {out && out.results.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 py-8" aria-label="Results">
            {out.results.slice(0, shown).map((x) => <li key={x.record.id} className="flex"><Card x={x} /></li>)}
          </ul>
        )}
        {out && out.results.length > shown && (
          <div className="pb-10 text-center"><button type="button" onClick={() => setShown(shown + PAGE)} className="house-chip house-chip--primary min-h-[48px] !px-5">Show {Math.min(PAGE, out.results.length - shown)} more of {out.results.length}</button></div>
        )}

        {out && out.awaiting.length > 0 && (
          <section aria-labelledby="atlas-awaiting-h" className="border-t ledger-border pt-7 pb-4">
            <p className="ledger-eyebrow">Also in the Ledger</p>
            <h2 id="atlas-awaiting-h" className="ledger-display text-[1.6rem] leading-snug mt-1.5">{out.awaiting.length} related {out.awaiting.length === 1 ? "entry" : "entries"} for this search</h2>
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 py-6" aria-label="Related entries">
              {out.awaiting.slice(0, shownAwaiting).map((x) => <li key={x.record.id} className="flex"><Card x={x} /></li>)}
            </ul>
            {out.awaiting.length > shownAwaiting && (
              <div className="pb-6 text-center"><button type="button" onClick={() => setShownAwaiting(shownAwaiting + PAGE)} className="house-chip house-chip--primary min-h-[48px] !px-5">Show {Math.min(PAGE, out.awaiting.length - shownAwaiting)} more of {out.awaiting.length}</button></div>
            )}
          </section>
        )}

        {out && out.results.length === 0 && out.awaiting.length === 0 && (
          <div className="bg-mist border ledger-border p-6 md:p-10 my-8 max-w-3xl">
            <p className="ledger-eyebrow">Nothing filed under that yet</p>
            <p className="ledger-display text-[1.6rem] leading-snug mt-2">Loosen one part of the search, or tell an advisor where you are thinking of going.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {q.cat.length > 0 && <button type="button" onClick={() => apply({ ...q, cat: [] })} className="house-chip house-chip--primary min-h-[44px] !px-4">Any category</button>}
              {(q.from || q.months.length > 0) && <button type="button" onClick={() => apply({ ...q, from: null, to: null, months: [] })} className="house-chip house-chip--primary min-h-[44px] !px-4">Any dates</button>}
              {q.interests.length > 0 && <button type="button" onClick={() => apply({ ...q, interests: [] })} className="house-chip house-chip--primary min-h-[44px] !px-4">Any interest</button>}
              <Link href={`/plan/iggi?q=${encodeURIComponent(q.where)}`} className="house-chip house-chip--primary min-h-[44px] !px-4"><MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Ask Iggi</Link>
              <Link href={`/plan?q=${encodeURIComponent(q.where)}`} className="house-chip house-chip--primary min-h-[44px] !px-4">Speak with an advisor</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Card({ x }: { x: Result }) {
  const r = x.record;
  const [broken, setBroken] = useState(false);
  const eyebrow = [r.category ? CATEGORY_LABEL[r.category] : r.filedAs, r.country, ...r.collections.map((c) => COLLECTION_LABEL[c])].filter(Boolean).join(" · ");
  const quiet = false;
  const action = r.booking === "engine" ? "View and reserve" : x.availability.state === "departs" ? "See the sailing" : "View and ask";
  return (
    <article className="flex flex-col w-full bg-paper border ledger-border border-t-[5px] border-t-stone">
      <Link href={r.href} className="block bg-mist aspect-[16/10] overflow-hidden" tabIndex={-1} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- Ledger photographs live on several hosts; a plain lazy image keeps the card independent of the image optimiser */}
        {r.image && !broken ? <img src={r.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" onError={() => setBroken(true)} /> : <span className="flex flex-col w-full h-full items-center justify-center gap-1 text-center px-4"><span className="ledger-display text-[1.15rem]">James Wild &amp; Co</span><span className="ledger-eyebrow">Photograph to follow</span></span>}
      </Link>
      <div className="px-5 pt-4 pb-1">
        <p className="ledger-eyebrow">{eyebrow}</p>
        <h2 className="ledger-display text-[1.45rem] leading-tight mt-1.5"><Link href={r.href} className="hover:underline">{r.name}</Link></h2>
        {r.tagline && <p className="text-[14px] leading-snug mt-1.5 line-clamp-2">{r.tagline}</p>}
        {r.mark && <p className="text-[12.5px] ledger-muted mt-1.5">{r.mark}</p>}
        {r.exclusiveUse && <p className="text-[12.5px] ledger-muted mt-1.5">Exclusive use available</p>}
      </div>
      <dl className="px-5 mt-2">
        <Line label="Season">{x.season.line}</Line>
        <div className={`-mx-5 px-5 py-2.5 border-t ledger-border ${x.offer && !quiet ? "bg-mist" : ""}`}>
          <dt className="ledger-eyebrow !text-[10px]">{x.offer && !quiet ? `Offer · ${x.offer.offer.program}` : "Offer"}</dt>
          <dd className="text-[13.5px] leading-snug mt-0.5">
            {x.offer ? x.offer.line : "No current offer for this search."}
            {x.offer && <span className="block text-[12px] ledger-muted mt-1">{x.offer.meta ? `${x.offer.meta} · ` : ""}<span className="ledger-id">{x.offer.offer.id}</span></span>}
          </dd>
        </div>
        <Line label="Availability">{x.availability.line}{r.price ? ` ${r.price.basis}: ${r.price.amount}.` : ""}</Line>
        {x.unknowns.length > 0 && <Line label="The house confirms">{x.unknowns.join(" ")}</Line>}
      </dl>
      <div className="px-5 pb-4 pt-1 mt-auto">
        <Link href={r.href} className="ledger-btn-ghost inline-flex items-center gap-2 min-h-[44px] text-[16px]">{action}<span className="sr-only">: {r.name}</span></Link>
      </div>
    </article>
  );
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="py-2.5 border-t ledger-border"><dt className="ledger-eyebrow !text-[10px]">{label}</dt><dd className="text-[13.5px] leading-snug mt-0.5">{children}</dd></div>;
}
