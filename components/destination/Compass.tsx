"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarClock, Lock, MessageCircle, PenLine, RotateCcw, UserRound } from "lucide-react";
import { DRAFT_TYPES, REGIONS, SEASONS, TRAVELLERS, fitsSeason, type Region, type Season, type Traveller } from "@/lib/content/preview/costa-rica-compass";

// The destination Compass: three questions read the Ledger and return a
// shortlist, a held-back hidden place and the hand-over to a person (an
// enquiry, a call with James, or an advisor). Built for Costa Rica first;
// the same component takes any country's Ledger and regions.

export type CompassStay = { slug: string; name: string; kind: string; area?: string | null; tagline?: string | null; bestMonths?: string | null; image?: string | null };

const CALL_URL = "https://calendly.com/jameswildco/meet-your-host"; // placeholder until James's live link

function Rose({ bearing }: { bearing: number | null }) {
  return (
    <svg viewBox="-60 -60 120 120" className="w-full h-full" aria-hidden="true">
      <circle r="54" fill="none" stroke="rgba(244,241,237,0.25)" />
      <circle r="44" fill="none" stroke="rgba(244,241,237,0.12)" strokeDasharray="1 3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <path key={a} d={a % 90 === 0 ? "M0 -50 L5 -8 L0 0 L-5 -8 Z" : "M0 -34 L3.5 -6 L0 0 L-3.5 -6 Z"} transform={`rotate(${a})`} fill={a % 90 === 0 ? "rgba(244,241,237,0.85)" : "rgba(244,241,237,0.4)"} />
      ))}
      {["N", "E", "S", "W"].map((l, i) => <text key={l} x={[0, 56, 0, -56][i]} y={[-55, 3.5, 61, 3.5][i]} textAnchor="middle" fontSize="8" fill="rgba(244,241,237,0.7)" fontFamily="'IBM Plex Mono', monospace">{l}</text>)}
      <g style={{ transform: `rotate(${bearing ?? 20}deg)`, transition: "transform 900ms cubic-bezier(.2,.8,.2,1)" }}>
        <path d="M0 -46 L4 0 L0 6 L-4 0 Z" fill="#C0392B" />
        <path d="M0 46 L4 0 L0 -6 L-4 0 Z" fill="rgba(244,241,237,0.55)" />
      </g>
      <circle r="3.5" fill="#F4F1ED" />
    </svg>
  );
}

function Chip({ on, onClick, children, sub }: { on: boolean; onClick: () => void; children: React.ReactNode; sub?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`text-left border px-4 py-3 transition-colors ${on ? "bg-paper text-ink border-paper" : "border-white/25 text-paper hover:border-white/60"}`}>
      <span className="block ledger-display text-[17px] leading-snug">{children}</span>
      {sub && <span className={`hidden sm:block text-[12.5px] mt-0.5 ${on ? "ledger-muted" : "text-white/60"}`}>{sub}</span>}
    </button>
  );
}

export default function Compass({ country, stays, advisorHref = "/advisors" }: { country: string; stays: CompassStay[]; advisorHref?: string }) {
  const [who, setWho] = useState<Traveller | null>(null);
  const [where, setWhere] = useState<Region | "any" | null>(null);
  const [when, setWhen] = useState<Season | "any" | null>(null);
  const done = who && where && when;
  const region = REGIONS.find((r) => r.id === where);

  const picks = useMemo(() => {
    if (!done) return [];
    return stays
      .map((s) => {
        let score = 0;
        if (where === "any" || (region && s.area && region.areas.includes(s.area))) score += 3;
        if (DRAFT_TYPES[s.slug]?.includes(who as Traveller)) score += 2;
        if (when === "any" || (s.bestMonths && fitsSeason(s.bestMonths, when as Season))) score += 1;
        return { s, score };
      })
      .filter((x) => x.score >= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.s);
  }, [done, stays, where, who, when, region]);

  const reading = done ? [TRAVELLERS.find((t) => t.id === who)?.label, where === "any" ? "anywhere in the country" : region?.label, when === "any" ? "any month" : SEASONS.find((s) => s.id === when)?.label].join(" · ") : "";
  const enquire = `/plan?country=${encodeURIComponent(country)}&reading=${encodeURIComponent(reading)}&stays=${picks.map((p) => p.slug).join(",")}`;
  const step = !who ? 1 : !where ? 2 : !when ? 3 : 4;

  return (
    <section id="compass" className="mt-16 md:mt-24 scroll-mt-32 bg-ink text-paper -mx-5 md:mx-0 px-5 md:px-12 py-12 md:py-16 relative overflow-hidden" aria-labelledby="compass-heading">
      <div className="pointer-events-none absolute inset-3 md:inset-4 border border-white/15" aria-hidden="true" />
      <div className="relative grid lg:grid-cols-[1fr_260px] gap-10 items-start">
        <div>
          <p className="ledger-eyebrow !text-white/70">The {country} Compass · three questions, one reading</p>
          <h2 id="compass-heading" className="ledger-display text-[2rem] md:text-5xl mt-3 leading-tight">Find Your {country}, <span className="italic">Then Talk to a Person.</span></h2>
          <p className="mt-4 text-[16px] md:text-[17px] text-white/75 max-w-2xl leading-relaxed">Tell the Compass who&rsquo;s travelling, which {country} you&rsquo;re drawn to and when. It reads the Ledger, sets out the stays we&rsquo;d choose, and holds back one place James doesn&rsquo;t publish.</p>
        </div>
        <div className="hidden lg:block w-[220px] h-[220px] justify-self-end"><Rose bearing={region?.bearing ?? (where === "any" ? 0 : null)} /></div>
      </div>

      <ol className="relative mt-10 grid lg:grid-cols-3 gap-8">
        <li>
          <p className="ledger-eyebrow !text-white/60"><span className={step === 1 ? "!text-[#E8A598]" : ""}>01 · Who&rsquo;s travelling?</span></p>
          <div className="mt-3 grid grid-cols-2 gap-2">{TRAVELLERS.map((t) => <Chip key={t.id} on={who === t.id} onClick={() => setWho(t.id)}>{t.label}</Chip>)}</div>
        </li>
        <li>
          <p className="ledger-eyebrow !text-white/60"><span className={step === 2 ? "!text-[#E8A598]" : ""}>02 · Which {country}?</span></p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-1 gap-2">
            {REGIONS.map((r) => <Chip key={r.id} on={where === r.id} onClick={() => setWhere(r.id)} sub={r.line}>{r.label}</Chip>)}
            <Chip on={where === "any"} onClick={() => setWhere("any")} sub="Let the Compass choose">Not sure yet</Chip>
          </div>
        </li>
        <li>
          <p className="ledger-eyebrow !text-white/60"><span className={step === 3 ? "!text-[#E8A598]" : ""}>03 · When?</span></p>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-1 gap-2">
            {SEASONS.map((s) => <Chip key={s.id} on={when === s.id} onClick={() => setWhen(s.id)} sub={s.line}>{s.label}</Chip>)}
            <Chip on={when === "any"} onClick={() => setWhen("any")} sub="Dates still open">Flexible</Chip>
          </div>
        </li>
      </ol>

      {done && (
        <div className="relative mt-12 border-t border-white/20 pt-10" aria-live="polite">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ledger-eyebrow !text-[#E8A598]">Your reading</p>
              <p className="ledger-display text-2xl md:text-3xl mt-1">{reading}</p>
            </div>
            <button type="button" onClick={() => { setWho(null); setWhere(null); setWhen(null); }} className="inline-flex items-center gap-2 ledger-eyebrow !text-white/70 hover:!text-white"><RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Start again</button>
          </div>

          <div className="mt-7 flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-2 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5 md:overflow-visible">
            {picks.map((s, i) => (
              <Link key={s.slug} href={`/stays/${s.slug}`} className="group snap-start shrink-0 w-[78%] md:w-auto bg-paper text-ink border border-paper flex flex-col">
                <div className="relative aspect-[4/3]">{s.image && <Image src={s.image} alt={`${s.name}, ${s.area || country}`} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" />}<span className="absolute top-3 left-3 bg-paper/95 font-mono text-[11px] px-2 py-0.5">{String(i + 1).padStart(2, "0")}</span></div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="ledger-eyebrow ledger-crimson">{s.kind}{s.area ? ` · ${s.area}` : ""}</p>
                  <h3 className="ledger-display text-xl mt-1 leading-snug">{s.name}</h3>
                  {s.tagline && <p className="mt-1.5 text-[14px] ledger-muted leading-snug">{s.tagline}</p>}
                  {s.bestMonths && <p className="mt-2 text-[12.5px] ledger-muted">Best {s.bestMonths}</p>}
                  <span className="mt-auto pt-3 inline-flex items-center gap-1.5 text-[14px] group-hover:gap-2.5 transition-all">Open entry <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
            {/* The hidden place: held back until the reading is sent */}
            <article className="snap-start shrink-0 w-[78%] md:w-auto border border-dashed border-[#E8A598]/70 p-5 flex flex-col">
              <p className="ledger-eyebrow !text-[#E8A598] flex items-center gap-2"><Lock className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> The hidden place</p>
              <h3 className="ledger-display text-xl mt-2 leading-snug">One place James doesn&rsquo;t publish</h3>
              <p className="mt-2 text-[14px] text-white/70 leading-relaxed">Every {country} reading comes with one place that isn&rsquo;t in the Ledger&rsquo;s public pages: somewhere James goes himself. It&rsquo;s revealed when you send your reading.</p>
              <div className="mt-auto pt-4 blur-[3px] select-none text-white/40 ledger-display text-lg" aria-hidden="true">•••••••• ••••• · ••••••</div>
            </article>
          </div>
          {picks.length === 0 && <p className="mt-4 text-white/70">Nothing in the Ledger fits all three yet. Send the reading and James will answer it himself.</p>}

          {/* The hand-over */}
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            <Link href={enquire} className="bg-[#8B2525] hover:bg-[#6E1C1C] transition-colors p-5 flex items-start gap-3" data-event="compass_enquire">
              <PenLine className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span><span className="block ledger-display text-xl">Send my reading</span><span className="block text-[13.5px] text-white/80 mt-1">Your shortlist and the hidden place, answered by James personally.</span></span>
            </Link>
            <a href={CALL_URL} className="border border-white/30 hover:border-white p-5 flex items-start gap-3" data-event="compass_call">
              <CalendarClock className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span><span className="block ledger-display text-xl">Book a call with James</span><span className="block text-[13.5px] text-white/70 mt-1">Twenty minutes, your reading on the table.</span></span>
            </a>
            <Link href={advisorHref} className="border border-white/30 hover:border-white p-5 flex items-start gap-3" data-event="compass_advisor">
              <UserRound className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span><span className="block ledger-display text-xl">Choose an advisor</span><span className="block text-[13.5px] text-white/70 mt-1">Advisors who know {country}, or keep the one you already have.</span></span>
            </Link>
          </div>
          <p className="mt-5 text-[13px] text-white/55 flex items-center gap-2"><MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Rather ask in your own words? Iggi answers from the same Ledger, any hour.</p>
        </div>
      )}
    </section>
  );
}
