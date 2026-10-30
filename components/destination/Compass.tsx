"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarClock, Lock, X, MessageCircle, PenLine, RotateCcw, Route as RouteIcon, Sparkles, UserRound } from "lucide-react";
import LedgerChart from "@/components/destination/LedgerChart";
import CompassRose from "@/components/ledger/CompassRose";
import { CHART_COSTA_RICA, projectCostaRica } from "@/lib/charts/costa-rica";
import { DRAFT_TYPES, REGIONS, SEASONS, TRAVELLERS, fitsSeason, type Region, type Season, type Traveller } from "@/lib/content/preview/costa-rica-compass";
import { MUSTS, NODES, ROUTES, fmtTransfer, type Leg, type MustDo, type NodeId, type Route } from "@/lib/content/preview/costa-rica-routes";
import { AVOID_BY_ROUTE, avoidsFor } from "@/lib/content/preview/costa-rica-avoids";

// The James Wild Compass. On a destination page it opens with the country
// set; on /compass it starts one question earlier ("Where are you drawn?").
// Three questions read the Ledger and return a shortlist plus a held-back
// hidden place; four more build draft journeys from the Overland routes.
// Every result ends with a person: an enquiry, a call with James, an advisor.

export type CompassStay = { slug: string; name: string; kind: string; area?: string | null; tagline?: string | null; bestMonths?: string | null; image?: string | null };

const CALL_URL = "https://calendly.com/jameswildco/meet-your-host"; // placeholder until James's live link
const HL = "!text-crimson-light";

/* Step 0 (on /compass only): kinds of place → destinations. Only Costa Rica
   runs the full Compass in this sample; the rest open their own pages. */
const DRAWN: { id: string; label: string; line: string; bearing: number; places: { name: string; href?: string; live?: boolean; note: string }[] }[] = [
  { id: "rainforest", label: "Rainforest & volcanoes", line: "Canopy, hot springs, two coasts", bearing: 250, places: [
    { name: "Costa Rica", live: true, note: "The Compass is ready" },
    { name: "Belize", href: "/destinations/central-america/belize", note: "Compass coming · open the destination" },
    { name: "Panama", href: "/destinations/central-america/panama", note: "Compass coming · open the destination" },
  ] },
  { id: "safari", label: "Savanna & safari", line: "Big Five, the migration, the Delta", bearing: 120, places: [
    { name: "Wild & Co Safaris", href: "/safaris/wild-co-safaris", note: "Meet the safari desk and Crux" },
    { name: "South Africa", href: "/destinations/africa/south-africa", note: "Open the destination" },
    { name: "Botswana", href: "/destinations/africa/botswana", note: "Open the destination" },
  ] },
  { id: "reef", label: "Reefs & islands", line: "Atolls, lagoons, warm water", bearing: 160, places: [
    { name: "Tahiti", href: "/destinations/oceania/tahiti", note: "Compass coming · open the destination" },
    { name: "Indonesia", href: "/destinations/asia/indonesia", note: "Compass coming · open the destination" },
    { name: "Maldives", href: "/destinations/asia/maldives", note: "Compass coming · open the destination" },
  ] },
  { id: "ice", label: "Ice & the poles", line: "The high Arctic and Antarctica by ship", bearing: 0, places: [
    { name: "Arctic Cruises", href: "/destinations/polar-arctic/arctic-cruises", note: "Open the voyages" },
    { name: "Iceland", href: "/destinations/polar-arctic/iceland", note: "Open the destination" },
  ] },
];

const Rose = ({ bearing }: { bearing: number | null }) => <CompassRose bearing={bearing ?? 20} letters animate className="w-full h-full" />;

function Chip({ on, onClick, children, sub }: { on: boolean; onClick: () => void; children: React.ReactNode; sub?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`text-left border px-4 py-3 transition-colors ${on ? "bg-paper text-ink border-paper" : "border-coast-light/30 text-paper hover:border-crimson-light"}`}>
      <span className="block ledger-display text-[17px] leading-snug">{children}</span>
      {sub && <span className={`hidden sm:block text-[12.5px] mt-0.5 ${on ? "ledger-muted" : "text-white/60"}`}>{sub}</span>}
    </button>
  );
}

/* Journey building ------------------------------------------------------------- */
type Length = "week" | "ten" | "two";
type Pace = "relaxed" | "balanced" | "active";
const LENGTHS: { id: Length; label: string; sub: string; min: number; max: number }[] = [
  { id: "week", label: "About a week", sub: "7–8 nights", min: 7, max: 8 },
  { id: "ten", label: "Ten days", sub: "9–10 nights", min: 9, max: 10 },
  { id: "two", label: "Two weeks", sub: "12 nights or more", min: 12, max: 14 },
];
const PACES: { id: Pace; label: string; sub: string }[] = [
  { id: "relaxed", label: "Unhurried", sub: "Fewer moves, longer stays" },
  { id: "balanced", label: "Balanced", sub: "A move every few days" },
  { id: "active", label: "Full days", sub: "See and do the most" },
];

function shapeLegs(route: Route, len: Length, pace: Pace): Leg[] {
  const band = LENGTHS.find((l) => l.id === len)!;
  const legs = route.legs.map((l) => ({ ...l }));
  const total = () => legs.reduce((n, l) => n + l.nights, 0);
  if (pace === "relaxed") legs[legs.length - 1].nights += 1;
  let i = 0;
  while (total() < band.min && i < 20) { legs[i % 2 === 0 ? legs.length - 1 : 0].nights += 1; i++; }
  while (total() > band.max && i < 40) { const big = legs.reduce((a, b) => (b.nights > a.nights ? b : a)); if (big.nights <= 2) break; big.nights -= 1; i++; }
  return legs;
}

export default function Compass({ country = "Costa Rica", stays, advisorHref = "/about/team#advisors", global = false }: { country?: string; stays: CompassStay[]; advisorHref?: string; global?: boolean }) {
  // step 0 (global only)
  const [drawn, setDrawn] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(global ? null : country);
  // reading
  const [who, setWho] = useState<Traveller | null>(null);
  const [where, setWhere] = useState<Region | "any" | null>(null);
  const [when, setWhen] = useState<Season | "any" | null>(null);
  // journey
  const [len, setLen] = useState<Length | null>(null);
  const [pace, setPace] = useState<Pace | null>(null);
  const [musts, setMusts] = useState<MustDo[]>([]);
  const [arrive, setArrive] = useState<"sjo" | "lir" | null>(null);

  // /compass?drawn=rainforest (from the home-page doors) opens at that answer
  useEffect(() => {
    if (!global) return;
    const d = new URLSearchParams(window.location.search).get("drawn");
    if (d && DRAWN.some((x) => x.id === d)) setDrawn(d);
  }, [global]);

  const done = who && where && when;
  const region = REGIONS.find((r) => r.id === where);
  const drawnOpt = DRAWN.find((d) => d.id === drawn);
  const bySlug = useMemo(() => Object.fromEntries(stays.map((s) => [s.slug, s])), [stays]);

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

  const journeyReady = done && len && pace && musts.length > 0 && arrive;
  const journeys = useMemo(() => {
    if (!journeyReady) return [];
    const regionNodes: Record<string, NodeId[]> = { volcano: ["arenal"], cloud: ["monteverde"], caribbean: ["caribbean"], pacific: ["manuel", "ballena", "osa"], river: ["pacuare"] };
    return ROUTES.map((r) => {
      let score = musts.filter((m) => r.musts.includes(m)).length * 2;
      if (where !== "any" && where && r.legs.some((l) => regionNodes[where].includes(l.at))) score += 3;
      if (when === "any" || (when && r.seasons.includes(when))) score += 2;
      if (pace === r.pace) score += 1;
      const legs = shapeLegs(r, len!, pace!);
      const start: NodeId = arrive === "lir" && (legs[0].at === "arenal" || legs[0].at === "monteverde") ? "lir" : r.start;
      const chosen = legs.map((l) => bySlug[l.stays.find((s) => DRAFT_TYPES[s]?.includes(who as Traveller)) || l.stays[0]]);
      return { r, score, legs, start, chosen };
    }).sort((a, b) => b.score - a.score).slice(0, 2);
  }, [journeyReady, musts, where, when, pace, len, arrive, who, bySlug]);

  const reading = done ? [TRAVELLERS.find((t) => t.id === who)?.label, where === "any" ? "anywhere in the country" : region?.label, when === "any" ? "any month" : SEASONS.find((s) => s.id === when)?.label].join(" · ") : "";
  const enquire = (route?: string) => `/plan?country=${encodeURIComponent(country)}&reading=${encodeURIComponent(reading)}&stays=${picks.map((p) => p.slug).join(",")}${route ? `&route=${route}` : ""}`;
  const step = !who ? 1 : !where ? 2 : !when ? 3 : 4;
  const reset = () => { setWho(null); setWhere(null); setWhen(null); setLen(null); setPace(null); setMusts([]); setArrive(null); };
  const bearing = place ? (region?.bearing ?? (where === "any" ? 0 : null)) : drawnOpt?.bearing ?? null;
  const Heading = global ? "h1" : "h2";

  return (
    <section id="compass" className={`${global ? "" : "mt-16 md:mt-24"} scroll-mt-32 lg:scroll-mt-[212px] text-paper -mx-5 md:mx-0 px-5 md:px-12 pt-12 md:pt-16 pb-12 relative overflow-hidden bg-ink bg-[radial-gradient(90%_70%_at_100%_0%,rgba(34,101,110,0.55),transparent_62%),radial-gradient(70%_50%_at_0%_100%,rgba(139,37,37,0.28),transparent_60%)]`} aria-labelledby="compass-heading">
      <div className="pointer-events-none absolute inset-3 md:inset-4 border border-coast-light/20" aria-hidden="true" />
      <div className="relative grid lg:grid-cols-[1fr_260px] gap-10 items-start">
        <div>
          <p className="ledger-eyebrow !text-white/70">{global ? "The James Wild Compass · a few questions, one reading" : `The ${country} Compass · three questions, one reading`}</p>
          <Heading id="compass-heading" className="ledger-display text-[2rem] md:text-5xl mt-3 leading-tight">{global ? <>Find Where You&rsquo;re Meant to Go, <span className="italic">Then Talk to a Person.</span></> : <>Find Your {country}, <span className="italic">Then Talk to a Person.</span></>}</Heading>
          <p className="mt-4 text-[16px] md:text-[17px] text-white/75 max-w-2xl leading-relaxed">{global ? "Start with the kind of place you're drawn to. The Compass reads the Ledger, the places James has vetted, sets out where we'd send you, and holds back one place he doesn't publish." : `Tell the Compass who's travelling, which ${country} you're drawn to and when. It reads the Ledger, sets out the stays we'd choose, and holds back one place James doesn't publish.`}</p>
        </div>
        <div className="hidden lg:block w-[220px] h-[220px] justify-self-end"><Rose bearing={bearing} /></div>
      </div>

      {/* Step 0 · Where are you drawn? (global only) */}
      {global && (
        <div className="relative mt-10">
          <p className="ledger-eyebrow !text-white/60"><span className={!place ? HL : ""}>00 · Where are you drawn?</span></p>
          <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
            {DRAWN.map((d) => <Chip key={d.id} on={drawn === d.id} onClick={() => { setDrawn(d.id); setPlace(null); reset(); }} sub={d.line}>{d.label}</Chip>)}
          </div>
          {drawnOpt && !place && (
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {drawnOpt.places.map((p) => p.live ? (
                <button key={p.name} type="button" onClick={() => setPlace(p.name)} className="text-left bg-paper text-ink p-5 hover:bg-white transition-colors">
                  <span className="ledger-eyebrow ledger-crimson flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> {p.note}</span>
                  <span className="block ledger-display text-2xl mt-1">{p.name}</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[14px]">Continue the Compass <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></span>
                </button>
              ) : (
                <Link key={p.name} href={p.href!} className="border border-white/30 hover:border-white p-5">
                  <span className="ledger-eyebrow !text-white/60">{p.note}</span>
                  <span className="block ledger-display text-2xl mt-1">{p.name}</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-white/80">Open <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          )}
          {place && <p className="mt-5 text-[15px] text-white/75">Drawn to <span className="text-paper">{drawnOpt?.label}</span> · reading <span className="text-paper">{place}</span> <button type="button" onClick={() => { setPlace(null); reset(); }} className="ml-3 ledger-eyebrow !text-white/60 hover:!text-white">Change</button></p>}
        </div>
      )}

      {place && (
        <ol className="relative mt-10 grid lg:grid-cols-3 gap-8">
          <li>
            <p className="ledger-eyebrow !text-white/60"><span className={step === 1 ? HL : ""}>01 · Who&rsquo;s travelling?</span></p>
            <div className="mt-3 grid grid-cols-2 gap-2">{TRAVELLERS.map((t) => <Chip key={t.id} on={who === t.id} onClick={() => setWho(t.id)}>{t.label}</Chip>)}</div>
          </li>
          <li>
            <p className="ledger-eyebrow !text-white/60"><span className={step === 2 ? HL : ""}>02 · Which {country}?</span></p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-1 gap-2">
              {REGIONS.map((r) => <Chip key={r.id} on={where === r.id} onClick={() => setWhere(r.id)} sub={r.line}>{r.label}</Chip>)}
              <Chip on={where === "any"} onClick={() => setWhere("any")} sub="Let the Compass choose">Not sure yet</Chip>
            </div>
          </li>
          <li>
            <p className="ledger-eyebrow !text-white/60"><span className={step === 3 ? HL : ""}>03 · When?</span></p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-1 gap-2">
              {SEASONS.map((s) => <Chip key={s.id} on={when === s.id} onClick={() => setWhen(s.id)} sub={s.line}>{s.label}</Chip>)}
              <Chip on={when === "any"} onClick={() => setWhen("any")} sub="Dates still open">Flexible</Chip>
            </div>
          </li>
        </ol>
      )}

      {place && done && (
        <div className="relative mt-12 border-t border-white/20 pt-10" aria-live="polite">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={`ledger-eyebrow ${HL}`}>Your reading</p>
              <p className="ledger-display text-2xl md:text-3xl mt-1">{reading}</p>
            </div>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 ledger-eyebrow !text-white/70 hover:!text-white"><RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Start again</button>
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
            <article className="snap-start shrink-0 w-[78%] md:w-auto border border-dashed border-crimson-light/70 p-5 flex flex-col">
              <p className={`ledger-eyebrow ${HL} flex items-center gap-2`}><Lock className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> The hidden place</p>
              <h3 className="ledger-display text-xl mt-2 leading-snug">One place James doesn&rsquo;t publish</h3>
              <p className="mt-2 text-[14px] text-white/70 leading-relaxed">Every {country} reading comes with one place that isn&rsquo;t in the Ledger&rsquo;s public pages: somewhere James goes himself. It&rsquo;s revealed when you send your reading.</p>
              <div className="mt-auto pt-4 blur-[3px] select-none text-white/40 ledger-display text-lg" aria-hidden="true">•••••••• ••••• · ••••••</div>
            </article>
          </div>
          {picks.length === 0 && <p className="mt-4 text-white/70">Nothing in the Ledger fits all three yet. Send the reading and James will answer it himself.</p>}

          {/* Field notes: what the house would avoid, for this reading */}
          <aside className="mt-8 bg-paper-card text-ink p-6 md:p-7 -rotate-[0.35deg] shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative" aria-label="What we'd avoid">
            <span className="absolute -top-3 left-8 w-24 h-6 bg-coast-mist/90 rotate-[-3deg]" aria-hidden="true" />
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="ledger-eyebrow ledger-crimson">Field notes · what James Wild &amp; Co avoids</p>
              <p className="ledger-hand text-xl text-coast">learned the long way, so you don&rsquo;t have to</p>
            </div>
            <ul className="mt-4 grid md:grid-cols-3 gap-5">
              {avoidsFor(where as Region | "any", when as Season | "any", who as Traveller).map((a) => (
                <li key={a.avoid} className="border-t ledger-rule pt-3">
                  <p className="flex gap-2 ledger-display text-[17px] leading-snug"><X className="w-4 h-4 mt-1 shrink-0 ledger-crimson" strokeWidth={2} aria-hidden="true" /><span><span className="sr-only">Avoid: </span>{a.avoid}</span></p>
                  <p className="mt-1.5 ledger-hand text-[21px] leading-snug text-coast-deep">{a.instead}</p>
                </li>
              ))}
            </ul>
          </aside>

          {/* Build the journey */}
          <div id="compass-journey" className="mt-14 -mx-5 md:-mx-12 px-5 md:px-12 py-10 md:py-12 bg-coast-deep bg-[repeating-linear-gradient(-35deg,rgba(255,255,255,0.035)_0_1px,transparent_1px_9px)] border-y border-coast">
            <p className="ledger-eyebrow !text-coast-light flex items-center gap-2"><RouteIcon className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Build the journey · from the Overland routes</p>
            <h3 className="ledger-display text-2xl md:text-4xl mt-2">Turn the Reading Into a Route</h3>
            <p className="mt-3 text-[15.5px] text-white/70 max-w-2xl">Four more answers and the Compass drafts a route: the regions in order, a vetted stay for each, and the time between them. James finishes it with you.</p>
            <div className="mt-7 grid md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.6fr_1fr] gap-6">
              <div><p className="ledger-eyebrow !text-white/60">04 · How long?</p><div className="mt-3 grid gap-2">{LENGTHS.map((l) => <Chip key={l.id} on={len === l.id} onClick={() => setLen(l.id)} sub={l.sub}>{l.label}</Chip>)}</div></div>
              <div><p className="ledger-eyebrow !text-white/60">05 · What pace?</p><div className="mt-3 grid gap-2">{PACES.map((p) => <Chip key={p.id} on={pace === p.id} onClick={() => setPace(p.id)} sub={p.sub}>{p.label}</Chip>)}</div></div>
              <div><p className="ledger-eyebrow !text-white/60">06 · Must-dos <span className="normal-case tracking-normal">(pick any)</span></p><div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-2">{MUSTS.map((m) => <Chip key={m.id} on={musts.includes(m.id)} onClick={() => setMusts((xs) => (xs.includes(m.id) ? xs.filter((x) => x !== m.id) : [...xs, m.id]))}>{m.label}</Chip>)}</div></div>
              <div><p className="ledger-eyebrow !text-white/60">07 · Flying into</p><div className="mt-3 grid gap-2"><Chip on={arrive === "sjo"} onClick={() => setArrive("sjo")} sub="Central valley, every route">San José (SJO)</Chip><Chip on={arrive === "lir"} onClick={() => setArrive("lir")} sub="Closer to Arenal and the north">Liberia (LIR)</Chip></div></div>
            </div>

            {journeys.length > 0 && (
              <div className="mt-10 grid xl:grid-cols-2 gap-6">
                {journeys.map(({ r, legs, start, chosen }, ji) => {
                  const nights = legs.reduce((n, l) => n + l.nights, 0);
                  const pts = [start, ...legs.map((l) => l.at), ...(r.end === "sjo" ? ["sjo" as NodeId] : [])].map((n) => projectCostaRica(NODES[n].lat, NODES[n].lng));
                  return (
                    <article key={r.id} className="bg-paper text-ink flex flex-col">
                      <div className="p-5 md:p-6 border-b ledger-rule">
                        <p className="ledger-eyebrow ledger-crimson">{ji === 0 ? "Closest to your answers" : "Also worth a look"} · draft route</p>
                        <h4 className="ledger-display text-3xl mt-1">{r.name}</h4>
                        <p className="ledger-display italic text-lg ledger-muted">{r.eyebrow}</p>
                        <p className="mt-2 text-[14.5px] ledger-muted leading-relaxed">{r.line}</p>
                        <p className="mt-3 text-[13px]"><span className="ledger-eyebrow">Nights</span> {nights} · <span className="ledger-eyebrow">Pace</span> {r.pace} · <span className="ledger-eyebrow">Best</span> {r.bestMonths}</p>
                      </div>
                      <div>
                        <div className="relative border-b ledger-rule ledger-chart is-drawn overflow-hidden">
                          <LedgerChart chart={CHART_COSTA_RICA} title={`Route map: ${r.name}`} />
                          <svg viewBox={`0 0 ${CHART_COSTA_RICA.width} ${CHART_COSTA_RICA.height}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
                            <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#8B2525" strokeWidth="4" strokeDasharray="10 8" strokeLinejoin="round" />
                            {legs.map((l, i) => { const p = projectCostaRica(NODES[l.at].lat, NODES[l.at].lng); return <g key={i}><circle cx={p.x} cy={p.y} r="17" fill="#8B2525" stroke="#F4F1ED" strokeWidth="3" /><text x={p.x} y={p.y + 6} textAnchor="middle" fontSize="17" fill="#F4F1ED" fontFamily="'IBM Plex Mono', monospace">{i + 1}</text></g>; })}
                            {(() => { const p = projectCostaRica(NODES[start].lat, NODES[start].lng); return <rect x={p.x - 9} y={p.y - 9} width="18" height="18" fill="#2D2A26" stroke="#F4F1ED" strokeWidth="3" />; })()}
                          </svg>
                        </div>
                        <ol className="p-5 grid sm:grid-cols-2 gap-x-6 gap-y-4">
                          {legs.map((l, i) => {
                            const s = chosen[i]; const from = i === 0 ? start : legs[i - 1].at;
                            return (
                              <li key={i} className="grid grid-cols-[28px_1fr] gap-3">
                                <span className="w-7 h-7 rounded-full bg-crimson text-paper flex items-center justify-center font-mono text-[12px]">{i + 1}</span>
                                <div>
                                  <p className="text-[12px] ledger-muted">{fmtTransfer(from, l.at)}</p>
                                  <p className="ledger-display text-lg leading-snug">{NODES[l.at].label} · {l.nights} nights</p>
                                  {s && <Link href={`/stays/${s.slug}`} className="mt-1 flex items-center gap-2 text-[14px] hover:ledger-crimson">{s.image && <span className="relative w-10 h-8 shrink-0 border ledger-border"><Image src={s.image} alt="" fill sizes="40px" className="object-cover" /></span>}{s.name}</Link>}
                                  <p className="mt-1 text-[13px] ledger-muted">{l.highlights.slice(0, 2).join(" · ")}</p>
                                </div>
                              </li>
                            );
                          })}
                          <li className="sm:col-span-2 text-[12.5px] ledger-muted pl-10">{r.end === "osa" ? "Fly home from Puerto Jiménez via San José." : fmtTransfer(legs[legs.length - 1].at, "sjo")?.replace("from", "back to San José from")}</li>
                        </ol>
                        {AVOID_BY_ROUTE[r.id] && (
                          <div className="mx-5 mb-5 bg-coast-mist border-l-2 border-crimson px-4 py-3">
                            <p className="ledger-eyebrow ledger-crimson">Field note · avoid</p>
                            <p className="mt-1 text-[14.5px]"><span className="ledger-display">{AVOID_BY_ROUTE[r.id].avoid}</span> <span className="ledger-hand text-[19px] text-coast-deep">{AVOID_BY_ROUTE[r.id].instead}</span></p>
                          </div>
                        )}
                      </div>
                      <div className="mt-auto p-5 border-t ledger-rule flex flex-wrap items-center gap-3">
                        <Link href={enquire(r.id)} className="ledger-btn ledger-btn--solid" data-event="compass_route_enquire">Send this journey</Link>
                        <Link href={`/plan/iggi?from=compass&destination=costa-rica&route=${r.id}`} className="ledger-btn" data-event="compass_iggi">Refine with Iggi</Link>
                        <span className="text-[12px] ledger-muted ml-auto">Drafted by the Compass · finished by James</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* The hand-over */}
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            <Link href={enquire()} className="bg-crimson hover:bg-crimson-deep transition-colors p-5 flex items-start gap-3" data-event="compass_enquire">
              <PenLine className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span><span className="block ledger-display text-xl">Send my reading</span><span className="block text-[13.5px] text-white/80 mt-1">Your shortlist, your route and the hidden place, answered by James personally.</span></span>
            </Link>
            <a href={CALL_URL} className="border border-coast-light/40 hover:border-coast-light p-5 flex items-start gap-3" data-event="compass_call">
              <CalendarClock className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span><span className="block ledger-display text-xl">Book a call with James</span><span className="block text-[13.5px] text-white/70 mt-1">Twenty minutes, your reading on the table.</span></span>
            </a>
            <Link href={advisorHref} className="border border-coast-light/40 hover:border-coast-light p-5 flex items-start gap-3" data-event="compass_advisor">
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
