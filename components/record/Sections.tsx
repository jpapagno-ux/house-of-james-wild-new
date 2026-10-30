import Image from "next/image";
import OnPageLink from "./OnPageLink";
import { ShortFilmBackdrop } from "@/components/media/ShortFilm";
import type { ShortFilm } from "@/lib/content/films";
import HeroSlider from "@/components/destination/HeroSlider";
import { heroReady, sharpen } from "@/lib/content/sharpen";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BedDouble, Check, Leaf, Maximize2, Users, Waves, X } from "lucide-react";
import { Reveal } from "@/components/ledger/Motion";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import { FieldIcon, type FieldIconName } from "@/components/ledger/FieldIcon";
import { Stamp, type Volume } from "@/components/ledger/Marks";
import { PassportStamp } from "@/components/ledger/VolumeKit";
import PhotoStamp from "@/components/ledger/PhotoStamp";
import { stampDate } from "@/lib/volumes";
import type { LedgerStampKind } from "@/lib/ledger/status";

// Shared record-page sections: stays, camps, residences, ships and voyages
// all draw from this one kit, so the house reads the same on every page.
// Server components; the only motion is the Reveal / stamp wrappers.

export type Img = { url: string; alt: string };
const SECTION = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-40";
const H2 = "ledger-display text-[1.75rem] md:text-4xl mt-2 leading-tight";

export function SectionHead({ eyebrow, title, icon, intro }: { eyebrow: string; title: string; icon?: FieldIconName; intro?: string }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        {icon && <FieldIcon name={icon} height={26} className="ledger-crimson" />}
        <p className="ledger-eyebrow">{eyebrow}</p>
      </div>
      <h2 className={H2}>{title}</h2>
      {intro && <p className="mt-3 text-[16px] md:text-[17px] leading-relaxed ledger-muted max-w-3xl">{intro}</p>}
    </div>
  );
}

/* Hero ----------------------------------------------------------------- */
export function RecordHero({ image, slides, eyebrow, title, tagline, stamp, glance, tag, film, height = "h-[82svh] min-h-[620px]" }: { image: Img; slides?: Img[]; eyebrow: string; title: string; tagline?: string; stamp?: ReactNode; glance?: ReactNode; tag?: ReactNode; film?: ShortFilm; height?: string }) {
  const body = (
      <div className="relative h-full max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pb-8 md:pb-10">
        {tag}
        <div className="flex items-end justify-between gap-8">
          <div className={film ? "landscape:max-w-[48vw]" : undefined}>
            <p className="ledger-eyebrow !text-white/85">{eyebrow}</p>
            <h1 className="ledger-display text-[2.6rem] md:text-7xl mt-3 leading-[1.05]">{title}</h1>
            {tagline && <p className="ledger-display italic text-lg md:text-2xl text-white/90 mt-3 max-w-2xl">{tagline}</p>}
          </div>
          {stamp && <PhotoStamp className={`hidden md:block ${film ? "landscape:!hidden" : ""} shrink-0`}>{stamp}</PhotoStamp>}
        </div>
        {glance && <div className={`mt-7 ${film ? "landscape:max-w-[54vw]" : ""}`}>{glance}</div>}
      </div>
  );
  // A vessel's own short film plays as the hero (tall screens edge to edge, wide screens in a frame).
  if (film) {
    return (
      <section className={`relative ${height} overflow-hidden bg-ink text-white`} aria-label={title}>
        <ShortFilmBackdrop film={film} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/5 to-black/75 landscape:from-black/25 landscape:via-transparent landscape:to-black/45" />
        <div className="pointer-events-none absolute inset-3 md:inset-5 border border-white/25" aria-hidden="true" />
        {body}
        <div id="hero-end" className="absolute bottom-0" />
      </section>
    );
  }
  const ready = slides ? heroReady(slides) : undefined;
  if (ready && ready.length > 1) {
    return <HeroSlider slides={ready.map((x) => ({ src: x.url, alt: x.alt }))} label={`${title} in photographs`} height={height} controls="top">{body}</HeroSlider>;
  }
  return (
    <section className={`relative ${height} overflow-hidden bg-ink text-white`} aria-label={title}>
      <Image src={sharpen(image.url)} alt={image.alt} fill priority sizes="100vw" quality={85} className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/75" />
      <div className="pointer-events-none absolute inset-3 md:inset-5 border border-white/25" aria-hidden="true" />
      {body}
      <div id="hero-end" className="absolute bottom-0" />
    </section>
  );
}

// Founder marks print as a dated passport stamp in the volume's ink (volume kit,
// Oct 2026); the other Ledger marks keep the round stamp.
const PASSPORT: Partial<Record<LedgerStampKind, string>> = { "Founder favorite": "Founder favorite", "Field verified": "Founder stayed", "Founder inspected": "Founder inspected" };
export function FounderStamp({ kind, year, date, place, ledgerId, volume = "stays", size = 132 }: { kind: LedgerStampKind; year?: number; date?: string | null; place?: string; ledgerId?: string; volume?: Volume; size?: number }) {
  const top = PASSPORT[kind];
  const when = stampDate(date ?? year);
  if (top && when) return <PassportStamp volume={volume} top={top} date={when} place={place} ledgerId={ledgerId} size={Math.round(size * 1.25)} rotate={-4} />;
  return <Stamp kind={kind} year={year} volume={volume} size={size} />;
}

/* In-page navigation ------------------------------------------------------ */
export function RecordNav({ items, cta = "Enquire", ctaHref = "/plan" }: { items: [string, string][]; cta?: string; ctaHref?: string }) {
  return (
    <nav aria-label="On this page" className="border-b ledger-rule bg-paper/95 backdrop-blur sticky top-[72px] lg:top-[105px] z-30">
      <div className="max-w-ledger mx-auto px-5 md:px-10 h-12 flex items-center gap-5">
        <div className="flex-1 min-w-0 flex items-center gap-5 xl:gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_92%,transparent)]">
          {items.map(([label, id]) => (
            <OnPageLink key={id} id={id} className="ledger-eyebrow hover:ledger-crimson">{label}</OnPageLink>
          ))}
        </div>
        <Link href={ctaHref} className="hidden sm:inline-flex ledger-btn !py-2 !px-4 shrink-0">{cta}</Link>
      </div>
    </nav>
  );
}

/* Overview + facts ---------------------------------------------------------- */
export function Overview({ quote, answer, facts, paragraphs }: { quote?: string; answer: string; facts: [string, string][]; paragraphs?: string[] }) {
  return (
    <section id="overview" className="pt-12 md:pt-16 scroll-mt-32 lg:scroll-mt-40 grid lg:grid-cols-[1.35fr_1fr] gap-10 items-start">
      <div>
        {quote && <p className="ledger-display italic text-2xl md:text-3xl leading-snug">&ldquo;{quote}&rdquo;</p>}
        <AnswerBlock>{answer}</AnswerBlock>
        {paragraphs && paragraphs.length > 0 && (
          <details className="mt-6 group border-t ledger-rule pt-4">
            <summary className="cursor-pointer list-none ledger-eyebrow ledger-crimson flex items-center gap-3">Read the full entry <span className="group-open:rotate-45 transition-transform text-lg leading-none">+</span></summary>
            {paragraphs.map((p) => <p key={p.slice(0, 24)} className="mt-4 text-[16px] leading-relaxed ledger-muted">{p}</p>)}
          </details>
        )}
      </div>
      <dl className="border-t ledger-rule text-[15px] ledger-paper px-5">
        {facts.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-5 py-3 border-b ledger-rule last:border-0">
            <dt className="ledger-eyebrow pt-1 shrink-0">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* Why James chose it ----------------------------------------------------------- */
export function WhyChose({ id = "why", eyebrow = "Why it earned its place", title, blocks, status, image }: { id?: string; eyebrow?: string; title: string; blocks: { title?: string; body: string }[]; status: ReactNode; image?: Img }) {
  return (
    <section id={id} className={SECTION}>
      <div className={`grid ${image ? "lg:grid-cols-[1.25fr_1fr]" : ""} gap-10 items-start`}>
        <div>
          <SectionHead eyebrow={eyebrow} title={title} />
          <div className="mt-4">{status}</div>
          <ul className="mt-6 border-t ledger-rule">
            {blocks.map((b, i) => (
              <li key={i} className="py-4 border-b ledger-rule flex gap-4">
                <span className="ledger-display text-xl ledger-crimson w-7 shrink-0" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  {b.title && <h3 className="ledger-display text-lg">{b.title}</h3>}
                  <p className="mt-1 text-[16px] leading-relaxed ledger-muted">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {image && (
          <Reveal delay={0.1}>
            <div className="ledger-paper p-3 rotate-[0.6deg]"><div className="relative aspect-[4/5]"><Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" /></div></div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* Rooms -------------------------------------------------------------------- */
export type Room = { name: string; image?: string | null; sleeps?: number | string | null; beds?: string | null; size?: number | null; units?: number | null; plunge?: boolean; price?: number | null; currency?: string; basis?: string; note?: string; included?: string[]; excluded?: string[]; live?: boolean };
const money = (n: number, c = "USD") => (c === "ZAR" ? `R${n.toLocaleString("en-US")}` : `US$${n.toLocaleString("en-US")}`);

export function RoomsLedger({ id = "rooms", eyebrow = "Rooms & suites", title, intro, rooms, icon = "tree-ring", footnote, unit = "room" }: { id?: string; eyebrow?: string; title: string; intro?: string; rooms: Room[]; icon?: FieldIconName; footnote?: string; unit?: string }) {
  return (
    <section id={id} className={SECTION}>
      <SectionHead eyebrow={eyebrow} title={title} icon={icon} intro={intro} />
      <ul className="mt-8 grid gap-6 md:grid-cols-2">
        {rooms.map((r, i) => (
          <li key={r.name}>
            <Reveal delay={(i % 2) * 0.08} className="h-full">
              <article className="h-full ledger-paper border ledger-border flex flex-col">
                <div className="relative aspect-[16/10] border-b ledger-rule bg-paper-card">
                  {r.image && <Image src={r.image} alt={`${r.name}`} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />}
                  {r.live && <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-paper/95 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-800"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Live rate</span>}
                </div>
                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="ledger-display text-2xl leading-tight">{r.name}</h3>
                    {r.price ? (
                      <p className="text-right shrink-0">
                        <span className="ledger-eyebrow block">From</span>
                        <span className="ledger-display text-2xl ledger-crimson">{money(r.price, r.currency)}</span>
                        <span className="block text-[11px] ledger-muted">{r.basis || "per room, per night"}</span>
                      </p>
                    ) : (
                      <p className="text-right shrink-0"><span className="ledger-eyebrow block">Rate</span><span className="text-[14px] ledger-muted">Quoted for your dates</span></p>
                    )}
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[14px] ledger-muted">
                    {r.sleeps && <li className="flex items-center gap-1.5"><Users className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Sleeps {r.sleeps}</li>}
                    {r.beds && <li className="flex items-center gap-1.5"><BedDouble className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> {r.beds}</li>}
                    {r.size && <li className="flex items-center gap-1.5"><Maximize2 className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> {r.size} m²</li>}
                    {r.plunge && <li className="flex items-center gap-1.5"><Waves className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Private plunge pool</li>}
                    {r.units && <li>{r.units} {r.units === 1 ? "unit" : "units"}</li>}
                  </ul>
                  {r.note && <p className="mt-4 ledger-hand text-xl leading-snug">{r.note}</p>}
                  {r.included && r.included.length > 0 && (
                    <details className="mt-4 border-t ledger-border pt-3 group">
                      <summary className="cursor-pointer list-none ledger-eyebrow ledger-crimson flex items-center justify-between">Included{r.excluded?.length ? " · not included" : ""} <span className="group-open:rotate-45 transition-transform text-lg leading-none">+</span></summary>
                      <ul className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[13.5px]">
                        {r.included.map((x) => <li key={x} className="flex gap-2"><Check className="w-3.5 h-3.5 mt-1 shrink-0 ledger-crimson" strokeWidth={1.75} aria-hidden="true" />{x}</li>)}
                      </ul>
                      {r.excluded && r.excluded.length > 0 && (
                        <ul className="mt-3 pt-3 border-t ledger-rule grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[13.5px] ledger-muted">
                          {r.excluded.map((x) => <li key={x} className="flex gap-2"><X className="w-3.5 h-3.5 mt-1 shrink-0" strokeWidth={1.75} aria-hidden="true" />{x}</li>)}
                        </ul>
                      )}
                    </details>
                  )}
                  <div className="mt-auto pt-5"><Link href="/plan" className="ledger-btn">Enquire about this {unit}</Link></div>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
      {footnote && <p className="mt-5 text-[13px] ledger-muted max-w-3xl">{footnote}</p>}
    </section>
  );
}

/* Experiences (cards) -------------------------------------------------------- */
/** House rule: a record page shows at most four experiences and four
 *  features, picked from the Experience / Feature collections. */
export const MAX_PER_RECORD = 4;
export type RecordCard = { name: string; meta?: string; body?: string; image?: string | null; alt?: string };

export function Experiences({ id = "experiences", eyebrow = "Local experiences", title, intro, items, icon = "mountain-sun" }: { id?: string; eyebrow?: string; title: string; intro?: string; items: RecordCard[]; icon?: FieldIconName }) {
  const list = items.slice(0, MAX_PER_RECORD);
  return (
    <section id={id} className={SECTION}>
      <SectionHead eyebrow={eyebrow} title={title} icon={icon} intro={intro} />
      <ul className={`mt-8 grid gap-5 sm:grid-cols-2 ${list.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {list.map((x, i) => (
          <li key={x.name}>
            <Reveal delay={(i % 4) * 0.07} className="h-full">
              <article className="h-full border ledger-border bg-paper flex flex-col">
                {x.image && <div className="relative aspect-[4/5] border-b ledger-rule"><Image src={x.image} alt={x.alt || x.name} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" /><span className="absolute top-3 left-3 bg-paper/95 font-mono text-[11px] px-2 py-0.5">{String(i + 1).padStart(2, "0")}</span></div>}
                <div className="p-5">
                  {x.meta && <p className="ledger-eyebrow ledger-crimson">{x.meta}</p>}
                  <h3 className="ledger-display text-xl mt-1 leading-snug">{x.name}</h3>
                  {x.body && <p className="mt-2 text-[15px] leading-relaxed ledger-muted">{x.body}</p>}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Features + only here --------------------------------------------------------- */
export function Features({ id = "features", eyebrow = "Stay features", title, items, cards, body, onlyHere, icon = "frond" }: { id?: string; eyebrow?: string; title: string; items?: string[]; cards?: RecordCard[]; body?: string; onlyHere?: { title: string; paragraphs: string[] }; icon?: FieldIconName }) {
  const list = cards?.slice(0, MAX_PER_RECORD);
  return (
    <section id={id} className={SECTION}>
      <div className={`grid ${list ? "" : "lg:grid-cols-[1.2fr_1fr]"} gap-10 items-start`}>
        <div>
          <SectionHead eyebrow={eyebrow} title={title} icon={icon} />
          {body && <p className="mt-4 text-[16px] leading-relaxed ledger-muted max-w-3xl">{body}</p>}
          {items && (
            <ul className="mt-5 border-t ledger-rule">
              {items.slice(0, MAX_PER_RECORD).map((x) => <li key={x} className="py-3 border-b ledger-rule flex gap-3 text-[16px]"><Check className="w-4 h-4 mt-1 shrink-0 ledger-crimson" strokeWidth={1.75} aria-hidden="true" />{x}</li>)}
            </ul>
          )}
        </div>
        {list && (
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
            <ul className="grid sm:grid-cols-2 gap-5">
              {list.map((x, i) => (
                <li key={x.name}>
                  <Reveal delay={(i % 2) * 0.07} className="h-full">
                    <article className="h-full grid grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] border ledger-border bg-paper">
                      <div className="relative border-r ledger-rule min-h-[150px]">{x.image && <Image src={x.image} alt={x.alt || x.name} fill sizes="140px" className="object-cover" />}</div>
                      <div className="p-4">
                        <p className="ledger-eyebrow ledger-crimson flex items-center gap-1.5"><Check className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />{x.meta || "Feature"}</p>
                        <h3 className="ledger-display text-lg mt-1 leading-snug">{x.name}</h3>
                        {x.body && <p className="mt-1.5 text-[14px] leading-relaxed ledger-muted">{x.body}</p>}
                      </div>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ul>
            {onlyHere && <OnlyHere {...onlyHere} />}
          </div>
        )}
        {!list && onlyHere && <OnlyHere {...onlyHere} />}
      </div>
    </section>
  );
}

function OnlyHere({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <aside className="ledger-paper border ledger-border p-6 md:p-8 -rotate-[0.4deg]">
      <div className="flex items-center gap-3"><FieldIcon name="sun" height={28} className="ledger-crimson" /><p className="ledger-eyebrow ledger-crimson">Only here</p></div>
      <h3 className="ledger-display text-2xl mt-2">{title}</h3>
      {paragraphs.map((p) => <p key={p.slice(0, 20)} className="mt-3 text-[15px] leading-relaxed">{p}</p>)}
    </aside>
  );
}

/* Conservation ------------------------------------------------------------------ */
export function Conservation({ id = "conservation", eyebrow, title, subtitle, intro, body, image }: { id?: string; eyebrow: string; title: string; subtitle?: string; intro?: string; body: string; image?: Img }) {
  return (
    <section id={id} className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-40 bg-coast-mist -mx-5 md:-mx-10 px-5 md:px-10 py-12 md:py-16">
      <div className={`grid ${image ? "lg:grid-cols-[1.3fr_1fr]" : ""} gap-10 items-center`}>
        <div>
          <p className="ledger-eyebrow !text-coast flex items-center gap-2"><Leaf className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> {eyebrow}</p>
          <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2 text-coast-deep">{title}</h2>
          {subtitle && <p className="ledger-display italic text-lg md:text-xl mt-1 text-coast">{subtitle}</p>}
          {intro && <p className="mt-5 ledger-display italic text-[18px] leading-relaxed text-ink/80">{intro}</p>}
          <p className="mt-4 text-[16px] leading-relaxed">{body}</p>
        </div>
        {image && <div className="relative aspect-[4/3] border border-coast/30"><Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 440px, 100vw" className="object-cover" /></div>}
      </div>
    </section>
  );
}

/* Scrolling cards: more from the brand / nearby / camps --------------------------- */
export function CardRail({ id, eyebrow, title, cards }: { id: string; eyebrow: string; title: string; cards: { name: string; href: string; image?: string | null; meta?: string; line?: string }[] }) {
  return (
    <section id={id} className={SECTION}>
      <div className="flex items-end justify-between gap-4">
        <SectionHead eyebrow={eyebrow} title={title} />
        <span className="hidden md:inline ledger-eyebrow">Scroll →</span>
      </div>
      <ul className="mt-7 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 md:mx-0 md:px-0">
        {cards.map((c) => (
          <li key={c.href} className="snap-start shrink-0 w-[72%] sm:w-[40%] lg:w-[23.5%]">
            <Link href={c.href} className="group block h-full ledger-paper border ledger-border">
              <div className="relative aspect-[4/3] border-b ledger-rule bg-paper-card">{c.image && <Image src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 270px, 72vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />}</div>
              <div className="p-4">
                {c.meta && <p className="ledger-eyebrow ledger-crimson">{c.meta}</p>}
                <h3 className="ledger-display text-lg mt-1 leading-snug">{c.name}</h3>
                {c.line && <p className="mt-1.5 text-[14px] ledger-muted leading-snug">{c.line}</p>}
                <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] group-hover:gap-2.5 transition-all">Open entry <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Included / not included --------------------------------------------------------- */
export function IncludedLists({ included, excluded }: { included: string[]; excluded: string[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div><p className="ledger-eyebrow ledger-crimson">Included</p><ul className="mt-3 space-y-2">{included.map((x) => <li key={x} className="flex gap-2 text-[15px]"><Check className="w-4 h-4 mt-0.5 shrink-0 ledger-crimson" strokeWidth={1.75} aria-hidden="true" />{x}</li>)}</ul></div>
      <div><p className="ledger-eyebrow">Not included</p><ul className="mt-3 space-y-2">{excluded.map((x) => <li key={x} className="flex gap-2 text-[15px] ledger-muted"><X className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />{x}</li>)}</ul></div>
    </div>
  );
}

/* Practical ledger ------------------------------------------------------------------ */
export function Practical({ id = "practical", rows, title = "The practical ledger" }: { id?: string; rows: [string, string][]; title?: string }) {
  return (
    <section id={id} className={SECTION}>
      <SectionHead eyebrow="How it works" title={title} />
      <dl className="mt-6 border-t ledger-rule max-w-4xl">
        {rows.map(([k, v]) => (
          <div key={k} className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-8 py-3.5 border-b ledger-rule">
            <dt className="ledger-eyebrow pt-1">{k}</dt>
            <dd className="text-[15.5px] leading-relaxed">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function PreviewNote({ children }: { children: ReactNode }) {
  return (
    <section className="mt-14 border border-dashed border-crimson/50 p-5 md:p-6">
      <p className="ledger-eyebrow ledger-crimson">Preview notes · never published</p>
      <div className="mt-2 text-[14px] ledger-muted space-y-1.5">{children}</div>
    </section>
  );
}
