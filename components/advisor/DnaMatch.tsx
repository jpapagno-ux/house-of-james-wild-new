"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DNA_LANGUAGES, DNA_PARTY_LABELS, DNA_PATHWAY_NAMES, DNA_QUESTIONS, DNA_SPECIALTIES, DNA_VOLUME_LABELS, type DnaQuestionId } from "@/lib/dna/vocabulary";
import { answered, matchAdvisors, type AdvisorDnaLike, type TravellerDna } from "@/lib/dna/match";

// The traveller's six answers and the advisors who share them. Everything runs in the browser from data the
// page already holds; nothing is sent until the traveller chooses Plan with an advisor.

export type MatchCard = { slug: string; name: string; firstName: string; role: string; ledgerId: string; portrait: string | null; profileHref: string | null; contact: { email: string; phone: string; tel: string } | null; line: string | null };

const chip = (on: boolean) => `house-chip inline-flex items-center gap-1.5 border px-3 py-2 text-[14px] ${on ? "border-[#2E2B28] bg-[#F4F2EF] font-medium" : "ledger-border bg-white hover:border-[#2E2B28]"}`;
const Q = (id: DnaQuestionId) => DNA_QUESTIONS.find((q) => q.id === id)!.traveller;

function Pick({ items, value, onChange, many = true, label }: { items: [string, string][]; value: string[]; onChange: (v: string[]) => void; many?: boolean; label: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {items.map(([k, l]) => {
        const on = value.includes(k);
        return <button key={k} type="button" aria-pressed={on} className={chip(on)} onClick={() => onChange(on ? value.filter((x) => x !== k) : many ? [...value, k] : [k])}>{l}</button>;
      })}
    </div>
  );
}

export default function DnaMatch({ pool, cards, countries }: { pool: AdvisorDnaLike[]; cards: MatchCard[]; countries: { slug: string; name: string }[] }) {
  const [pathways, setPathways] = useState<string[]>([]);
  const [where, setWhere] = useState<string[]>([]);
  const [volumes, setVolumes] = useState<string[]>([]);
  const [does, setDoes] = useState<string[]>([]);
  const [party, setParty] = useState<string[]>([]);
  const [language, setLanguage] = useState<string[]>(["English"]);
  const t: TravellerDna = { pathways, countries: where, volumes, specialties: does, party: party[0] ?? null, language: language[0] ?? null };
  const results = useMemo(() => matchAdvisors(t, pool).slice(0, 3), [pathways, where, volumes, does, party, language, pool]); // eslint-disable-line react-hooks/exhaustive-deps
  const n = answered(t);
  const label = (id: DnaQuestionId, v: string) =>
    id === "drawn" ? DNA_PATHWAY_NAMES.find((p) => p[0] === v)?.[1] ?? v
    : id === "where" ? countries.find((c) => c.slug === v)?.name ?? v
    : id === "how" ? DNA_VOLUME_LABELS.find((p) => p[0] === v)?.[1] ?? v
    : id === "who" ? DNA_PARTY_LABELS.find((p) => p[0] === v)?.[1] ?? v
    : v;
  const reading = encodeURIComponent([...pathways, ...where, ...volumes, ...does, ...party].join(","));

  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
      <form className="grid gap-8" onSubmit={(e) => e.preventDefault()} aria-label="Your six answers">
        <fieldset><legend className="ledger-display text-[1.35rem] mb-3">1 · {Q("drawn")}</legend><Pick label={Q("drawn")} items={DNA_PATHWAY_NAMES.map((p) => [p[0], p[1]] as [string, string])} value={pathways} onChange={setPathways} /></fieldset>
        <fieldset><legend className="ledger-display text-[1.35rem] mb-1">2 · {Q("where")}</legend><p className="text-[13.5px] ledger-muted mb-3">Optional. Leave it blank if you are not sure yet.</p><Pick label={Q("where")} items={countries.map((c) => [c.slug, c.name] as [string, string])} value={where} onChange={setWhere} /></fieldset>
        <fieldset><legend className="ledger-display text-[1.35rem] mb-3">3 · {Q("how")}</legend><Pick label={Q("how")} items={DNA_VOLUME_LABELS} value={volumes} onChange={setVolumes} /></fieldset>
        <fieldset><legend className="ledger-display text-[1.35rem] mb-3">4 · {Q("do")}</legend><Pick label={Q("do")} items={DNA_SPECIALTIES.map((s) => [s, s] as [string, string])} value={does} onChange={setDoes} /></fieldset>
        <fieldset><legend className="ledger-display text-[1.35rem] mb-3">5 · {Q("who")}</legend><Pick label={Q("who")} items={DNA_PARTY_LABELS} value={party} onChange={setParty} many={false} /></fieldset>
        <fieldset><legend className="ledger-display text-[1.35rem] mb-3">6 · {Q("language")}</legend><Pick label={Q("language")} items={DNA_LANGUAGES.map((l) => [l, l] as [string, string])} value={language} onChange={setLanguage} many={false} /></fieldset>
      </form>

      <section aria-live="polite" aria-labelledby="match-heading" className="lg:sticky lg:top-24">
        <p className="ledger-eyebrow ledger-crimson">Your match</p>
        <h2 id="match-heading" className="ledger-display text-[1.75rem] md:text-[2.1rem] mt-2">
          {results.length ? `${cards.find((c) => c.slug === results[0].slug)?.firstName ?? "An advisor"} shares ${results[0].inCommon} of your ${n} answers.` : n > 1 ? "No advisor shares those answers yet." : "Answer a question or two to begin."}
        </h2>
        {!results.length && n > 1 && <p className="mt-3 text-[15px] ledger-muted">Tell James the trip and he will make the introduction himself. <Link href="/plan?advisor=james-papagno" className="underline underline-offset-4">Plan with James</Link></p>}
        <ol className="mt-6 grid gap-5">
          {results.map((r, i) => {
            const c = cards.find((x) => x.slug === r.slug);
            if (!c) return null;
            return (
              <li key={r.slug} className={`border p-5 ${i === 0 ? "border-[#1A1816]" : "ledger-border"}`}>
                <div className="flex gap-4">
                  <div className="relative w-20 h-24 shrink-0 bg-[#F4F2EF] overflow-hidden">{c.portrait && <Image src={c.portrait} alt={`Portrait of ${c.name}`} fill sizes="80px" className="object-cover" />}</div>
                  <div className="min-w-0">
                    <p className="ledger-eyebrow !text-[10px]">{i === 0 ? "Closest match" : "Also close"} · {r.inCommon} in common{r.waitlist ? " · waitlist" : ""}</p>
                    <p className="ledger-display text-[1.45rem] leading-tight mt-1">{c.name}</p>
                    <p className="text-[12.5px] ledger-muted">{c.role} · <span className="ledger-id">{c.ledgerId}</span></p>
                    {c.contact && <p className="mt-1 text-[13.5px] flex flex-wrap gap-x-4"><a href={`mailto:${c.contact.email}`} className="underline underline-offset-4">{c.contact.email}</a><a href={`tel:${c.contact.tel}`} className="underline underline-offset-4">{c.contact.phone}</a></p>}
                  </div>
                </div>
                <ul className="mt-4 grid gap-1.5 text-[14px]">
                  {r.rows.map((row) => (
                    <li key={row.id} className="flex gap-3"><span className="ledger-muted w-40 shrink-0">{Q(row.id)}</span><span>{row.shared.map((v) => label(row.id, v)).join(", ")}{row.firstHand ? <span className="ledger-id"> · first-hand</span> : null}</span></li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Link href={`/plan?advisor=${c.slug}&reading=${reading}`} className="ledger-btn">Plan with {c.firstName}</Link>
                  {c.profileHref && <Link href={c.profileHref} className="text-[13px] underline underline-offset-4 decoration-[#CFC8BF]">About {c.firstName}</Link>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
