import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, BookOpen, Check, Film, Mail, MessageCircle, Route, X } from "lucide-react";
import { Reveal, StampPress } from "@/components/ledger/Motion";
import OverlandStamp from "@/components/ledger/OverlandStamp";
import RouteLine from "./RouteLine";
import HouseFilm from "./HouseFilm";
import { HOME } from "@/lib/content/home";
import { LEDGER_COUNTS } from "@/lib/ledger/counts";
import { statusLine } from "@/lib/ledger/status";
import { REGIONS, SITE } from "@/lib/site";
import { recordHref } from "@/lib/ledger/urls";
import SafeLink, { GuardLink } from "@/components/ledger/SafeLink";

// The home page sections, ported from the Base44 sample. All server-rendered:
// every word and link is in the HTML. Motion comes from the small client
// wrappers (Reveal, StampPress, RouteLine), which animate only opacity and
// transform, so nothing shifts layout.

const H2 = "ledger-display text-[1.75rem] md:text-4xl mt-2 leading-tight";
const SECTION = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10";

/* The Ledger, counted ----------------------------------------------------- */
export function LedgerTally() {
  const cells: [string, number][] = [
    ["Stays", LEDGER_COUNTS.stays],
    ["Vessels", LEDGER_COUNTS.vessels],
    ["Journeys", LEDGER_COUNTS.journeys],
  ];
  return (
    <section className="ledger-page border-b ledger-rule" aria-label="The Ledger, counted">
      <div className="max-w-ledger mx-auto px-5 md:px-10 py-10 md:py-14 grid md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-center">
        <dl className="grid grid-cols-3 gap-4 md:gap-10">
          {cells.map(([label, value]) => (
            <div key={label} className="border-t ledger-rule pt-3 flex flex-col-reverse">
              <dt className="ledger-eyebrow mt-2">{label} in the Ledger</dt>
              <dd className="ledger-display text-4xl md:text-6xl leading-none tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <figure className="md:max-w-sm">
          <blockquote className="ledger-display italic text-2xl md:text-[1.75rem] leading-snug">&ldquo;Go someplace new. Then go further.&rdquo;</blockquote>
          <figcaption className="mt-3 flex items-center gap-3">
            <span className="ledger-eyebrow">James Wild · Founder</span>
            <Image src="/brand/jwco-hare-240.png" alt="" aria-hidden="true" width={40} height={40} className="opacity-80" />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* Places marquee: the live countries, straight from the region list ------- */
export function PlacesMarquee() {
  const places = REGIONS.flatMap((r) => r.countries.map((c) => c.label)).filter((p) => !p.includes("Cruises"));
  const row = [...places, ...places];
  return (
    <div className="border-b ledger-rule py-5 overflow-hidden ledger-page" aria-hidden="true">
      <div className="ledger-marquee flex w-max gap-10 whitespace-nowrap">
        {row.map((p, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="ledger-display italic text-3xl md:text-4xl">{p}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-crimson/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* The story: who the house is -------------------------------------------- */
export function HouseStory() {
  const s = HOME.story;
  return (
    <section className="pt-12 md:pt-16" aria-labelledby="story-heading">
      <div className="grid lg:grid-cols-[1fr_1.35fr] gap-8 lg:gap-12 items-start">
        <Reveal>
          <p className="ledger-eyebrow">{s.eyebrow}</p>
          <h2 id="story-heading" className="ledger-display text-4xl md:text-6xl mt-3 leading-tight">{s.title}</h2>
          <p className="ledger-display italic text-lg md:text-xl mt-3 ledger-muted">{s.subtitle}</p>
          <dl className="mt-6 border-t ledger-rule">
            {s.meta.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-2.5 border-b ledger-rule">
                <dt className="ledger-eyebrow pt-1">{k}</dt>
                <dd className="text-[15px] text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <Link href="/the-ledger" className="ledger-btn">Open the Ledger</Link>
            <StampPress className="w-24 h-24">
              <Image src="/brand/jwco-hare-240.png" alt="James Wild & Co. Ledger stamp: a running hare, journey design since 1982, ledgered and vetted" width={96} height={96} className="w-full h-full object-contain" />
            </StampPress>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative aspect-[4/3] w-full border ledger-border overflow-hidden">
            <Image src={s.image.url} alt={s.image.alt} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
          </div>
        </Reveal>
      </div>
      <div className="mt-12 md:mt-16 border-t ledger-rule pt-8">
        <Reveal>
          <p className="ledger-display italic text-xl md:text-2xl max-w-3xl leading-relaxed">&ldquo;{s.quote}&rdquo;</p>
          <p className="ledger-eyebrow mt-3">— {s.quoteBy}</p>
        </Reveal>
        {/* The answer block: the passage answer engines quote */}
        <section aria-label="In short" className="border-l-2 border-crimson pl-5 mt-8 max-w-3xl">
          <p className="ledger-eyebrow ledger-crimson">In short</p>
          <p className="mt-2 text-[17px] leading-relaxed">{HOME.seo.answer}</p>
        </section>
      </div>
    </section>
  );
}

/* The five volumes -------------------------------------------------------- */
export function VolumeDoors() {
  const v = HOME.volumes;
  return (
    <section id="volumes" className={`${SECTION} scroll-mt-28`} aria-labelledby="volumes-heading">
      <p className="ledger-eyebrow">The house, in five volumes</p>
      <h2 id="volumes-heading" className={H2}>Choose Your Way In</h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {v.map((x, i) => (
          <li key={x.key}>
            <Reveal delay={i * 0.08} y={36} className="h-full">
              <Link
                href={x.path}
                className={`group h-full ledger-paper border ledger-border flex flex-col ${i % 2 === 0 ? "-rotate-1" : "rotate-1"} hover:rotate-0 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)] transition duration-300`}
              >
                <div className="relative aspect-[4/3] w-full border-b ledger-rule overflow-hidden">
                  <Image src={x.image.url} alt={x.image.alt} fill sizes="(min-width: 1280px) 220px, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                  {"stamp" in x && x.stamp && (
                    <StampPress delay={0.35 + i * 0.08} className="absolute top-2 right-2 w-20 h-20 rounded-full bg-paper/95 p-1 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
                      <OverlandStamp tested={false} bottom="OVERLAND · ROUTES BY" footer="SINCE 1983" className="w-full h-full" />
                    </StampPress>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="ledger-eyebrow">Volume {String(i + 1).padStart(2, "0")}</p>
                  <h3 className="ledger-display text-2xl mt-1">{x.name}</h3>
                  <p className="text-[11px] uppercase tracking-[0.14em] ledger-crimson mt-1">{x.brand}</p>
                  <p className="mt-3 text-[15px] leading-relaxed ledger-muted flex-1">{x.line}</p>
                  <p className="ledger-eyebrow mt-4 border-t ledger-rule pt-3">{x.proof}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-[15px] group-hover:gap-3 transition-all">
                    Enter {x.name} <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* The house standard ------------------------------------------------------ */
export function HouseStandard() {
  const s = HOME.standard;
  return (
    <section className={SECTION} aria-labelledby="standard-heading">
      <p className="ledger-eyebrow">{s.eyebrow}</p>
      <h2 id="standard-heading" className={H2}>{s.title}</h2>
      <ol className="mt-6 grid gap-x-10 md:grid-cols-2 border-t ledger-rule">
        {s.rules.map(([title, body], i) => (
          <li key={title} className="py-5 border-b ledger-rule flex gap-4">
            <span className="ledger-display text-2xl ledger-crimson w-8 shrink-0" aria-hidden="true">{i + 1}</span>
            <div>
              <h3 className="ledger-display text-lg">{title}</h3>
              <p className="mt-1.5 text-[16px] leading-relaxed ledger-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="ledger-eyebrow mt-5">
        {SITE.credentials.map((c) => `${c.label} ${c.value}`).join(" · ")} · Member {SITE.memberships[0]}
      </p>
    </section>
  );
}

/* Signature shelf ----------------------------------------------------------- */
export function SignatureShelf() {
  const s = HOME.shelf;
  return (
    <section className={SECTION} aria-labelledby="shelf-heading">
      <p className="ledger-eyebrow">{s.eyebrow}</p>
      <h2 id="shelf-heading" className={H2}>{s.title}</h2>
      <p className="mt-3 text-[16px] md:text-[17px] leading-relaxed ledger-muted max-w-3xl">{s.intro}</p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {s.entries.map((e, i) => {
          const mark = statusLine(e.status, e.statusDate);
          return (
            <li key={e.id}>
              <Reveal delay={(i % 3) * 0.08} className="h-full">
                <GuardLink as="div" href={recordHref(e.kind ?? "stay", e.slug)} className="group h-full border ledger-border flex flex-col hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)] transition duration-300">
                  <div className="relative aspect-[4/3] w-full border-b ledger-rule overflow-hidden">
                    <Image src={e.image.url} alt={e.image.alt} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="ledger-display text-xl">{e.name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="ledger-eyebrow">{e.id}</span>
                      {mark && <span className="border ledger-crimson-border ledger-crimson px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]">{mark}</span>}
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed ledger-muted flex-1">{e.line}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[15px] group-hover:gap-3 transition-all">
                      View the entry <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  </div>
                </GuardLink>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* Overland routes ------------------------------------------------------------ */
export function OverlandRoutes() {
  const o = HOME.overland;
  return (
    <section className={SECTION} aria-labelledby="overland-heading">
      <div className="flex items-center gap-2">
        <Route className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" />
        <p className="ledger-eyebrow">{o.eyebrow}</p>
      </div>
      <h2 id="overland-heading" className={H2}>{o.title}</h2>
      <p className="mt-3 text-[16px] md:text-[17px] leading-relaxed ledger-muted max-w-3xl">{o.intro}</p>
      <RouteLine />

      <div className="mt-8 space-y-8">
        {o.routes.map((x, i) => (
          <Reveal key={x.ledgerId} y={40}>
            <article className={`ledger-paper border ledger-border grid lg:grid-cols-[0.9fr_1.4fr] ${i % 2 === 0 ? "-rotate-[0.4deg]" : "rotate-[0.4deg]"}`}>
              <div className="relative border-b lg:border-b-0 lg:border-r ledger-rule min-h-[260px]">
                <Image src={x.image.url} alt={x.image.alt} fill sizes="(min-width: 1024px) 440px, 100vw" className="object-cover" />
                <StampPress className="absolute top-3 right-3 w-28 h-28 md:w-32 md:h-32 rounded-full bg-paper/95 p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.18)]">
                  <OverlandStamp tested={x.tested} year={x.year} className="w-full h-full" />
                </StampPress>
              </div>
              <div className="p-5 md:p-7">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className={`inline-flex items-center border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${x.tested ? "ledger-crimson-border ledger-crimson" : "ledger-border ledger-muted"}`}>
                    {x.tested ? `Field tested by James · ${x.year}` : "Designed by James"}
                  </span>
                  <span className="ledger-eyebrow">{x.ledgerId}</span>
                </div>
                <h3 className="ledger-display text-2xl md:text-3xl mt-3">{x.name}</h3>
                <p className="ledger-display italic ledger-muted mt-1">{x.subtitle}</p>
                <dl className="mt-4 grid grid-cols-2 border-t ledger-rule">
                  {x.facts.map(([k, v]) => (
                    <div key={k} className="py-2 pr-3 border-b ledger-rule">
                      <dt className="ledger-eyebrow">{k}</dt>
                      <dd className="text-[15px] mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <h4 className="ledger-eyebrow">What to expect</h4>
                    <ul className="mt-2 space-y-2">
                      {x.expect.map((e) => (
                        <li key={e} className="flex gap-2 text-[15px] leading-snug">
                          <Check className="w-4 h-4 mt-0.5 shrink-0 ledger-crimson" strokeWidth={1.75} aria-hidden="true" />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="ledger-eyebrow">What to avoid</h4>
                    <ul className="mt-2 space-y-2">
                      {x.avoid.map((a) => (
                        <li key={a} className="flex gap-2 text-[15px] leading-snug">
                          <X className="w-4 h-4 mt-0.5 shrink-0 ledger-muted" strokeWidth={1.75} aria-hidden="true" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-5">
                  <h4 className="ledger-eyebrow">Stays on this route</h4>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {x.stays.map(([name, slug]) => (
                      <li key={name}>
                        {slug ? (
                          <GuardLink href={`/stays/${slug}`} className="inline-flex items-center gap-1.5 border ledger-border px-2.5 py-1 text-[14px] hover:ledger-crimson">
                            <BedDouble className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> {name}
                          </GuardLink>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 border border-dashed ledger-border px-2.5 py-1 text-[14px] ledger-muted">
                            <BedDouble className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> {name} · coming soon
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className={`mt-5 border-t ledger-rule pt-4 leading-relaxed ${"noteIsQuote" in x && x.noteIsQuote ? "ledger-hand text-2xl" : "text-[15px] ledger-muted"}`}>
                  {"noteIsQuote" in x && x.noteIsQuote ? <>&ldquo;{x.note}&rdquo; — J.W.</> : x.note}
                </p>
                <SafeLink href={recordHref("route", x.slug, x.country)} className="ledger-btn mt-5">View the route</SafeLink>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[14px] ledger-muted max-w-2xl">{o.honesty}</p>
        <Link href="/overland" className="inline-flex items-center gap-2 text-[15px] hover:gap-3 transition-all">
          See all overland routes <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

/* The film --------------------------------------------------------------- */
export function FilmSection() {
  const f = HOME.film;
  const l = HOME.hero.loop;
  return (
    <section id="film" className={`${SECTION} scroll-mt-28`} aria-labelledby="film-heading">
      <div className="flex items-center gap-2">
        <Film className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" />
        <p className="ledger-eyebrow">{f.eyebrow}</p>
      </div>
      <h2 id="film-heading" className={H2}>{f.title}</h2>
      <p className="mt-3 text-[16px] md:text-[17px] leading-relaxed ledger-muted max-w-3xl">{f.intro}</p>
      <Reveal delay={0.1} className="mt-6">
        <HouseFilm title={f.title} caption={f.caption} youtubeId={f.youtubeId} poster={l.poster} posterAlt={l.label} mp4={l.mp4} webm={l.webm} />
      </Reveal>
    </section>
  );
}

/* From the house ------------------------------------------------------------- */
const JOURNAL_ICONS = [BookOpen, Mail, MessageCircle];
export function HouseJournal() {
  const j = HOME.journal;
  return (
    <section className={SECTION} aria-labelledby="journal-heading">
      <p className="ledger-eyebrow">{j.eyebrow}</p>
      <h2 id="journal-heading" className={H2}>{j.title}</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {j.items.map((item, i) => {
          const Icon = JOURNAL_ICONS[i] || BookOpen;
          return (
            <article key={item.kicker} className="border ledger-border p-6 flex flex-col">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" />
                <p className="ledger-eyebrow">{item.kicker}</p>
              </div>
              <h3 className="ledger-display text-xl mt-3">{item.title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed ledger-muted flex-1">{item.line}</p>
              <SafeLink href={item.href} className="ledger-btn mt-5 self-start">{item.cta}</SafeLink>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* James's note --------------------------------------------------------------- */
export function JamesNote() {
  return (
    <section className="mt-16 md:mt-24" aria-label="A note from James">
      <Reveal>
        <div className="ledger-paper border ledger-border p-6 md:p-10 max-w-3xl mx-auto -rotate-1 relative">
          <Image src="/kit/tape-kraft.png" alt="" aria-hidden="true" width={120} height={36} className="absolute -top-4 left-1/2 -translate-x-1/2 rotate-[-3deg]" />
          <p className="ledger-eyebrow">James&rsquo;s notes</p>
          <p className="ledger-hand text-2xl md:text-3xl leading-snug mt-3">{HOME.jamesNote}</p>
          <p className="ledger-hand text-xl mt-4 ledger-crimson">J.W.</p>
        </div>
      </Reveal>
    </section>
  );
}

/* Stewards band -------------------------------------------------------------- */
export function Stewards() {
  const s = HOME.stewards;
  return (
    <section className="relative mt-20 md:mt-28 -mb-20 h-[80vh] min-h-[520px] overflow-hidden bg-[#123332]" aria-labelledby="stewards-heading">
      <Image src={s.image.url} alt={s.image.alt} fill sizes="100vw" className="object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#123332]/90 via-[#123332]/50 to-transparent" />
      <div className="relative h-full max-w-ledger mx-auto px-5 md:px-10 flex items-center">
        <Reveal className="max-w-2xl text-white">
          <p className="ledger-eyebrow !text-[#beece0]/85">{s.eyebrow}</p>
          <h2 id="stewards-heading" className="ledger-display text-4xl md:text-6xl leading-[1.08] mt-5">{s.line}</h2>
          <p className="text-white/85 text-[17px] leading-relaxed mt-6 max-w-lg">{s.text}</p>
          <Link href={s.cta.href} className="mt-8 inline-flex items-center h-11 px-7 border border-white/80 ledger-eyebrow !text-[11px] !text-white hover:bg-white hover:!text-ink transition-colors">
            {s.cta.label}
          </Link>
        </Reveal>
      </div>
      <p className="absolute right-5 md:right-10 bottom-5 ledger-eyebrow !text-[9.5px] !text-white/70">{s.caption}</p>
    </section>
  );
}
