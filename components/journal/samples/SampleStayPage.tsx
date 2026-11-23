import Image from "next/image";
import Link from "next/link";
import { FieldIcon, type FieldIconName } from "@/components/ledger/FieldIcon";
import AccordionRow from "@/components/journal/AccordionRow";
import IggiMark from "@/components/iggi/IggiMark";
import PathwayStamp from "@/components/pathways/PathwayStamp";
import { pathwayStays } from "@/lib/content/pathways";
import { PATHWAYS_ON } from "@/lib/content/pathways/flag";
import TEMPLATE from "@/lib/journal-style/template-stays.json";
import { journalStay, type SectionKey, type ViewerPhoto } from "@/lib/journal-style/stay";

type View = NonNullable<ReturnType<typeof journalStay>>;

// JWC-STYLE-01 layout samples (James, 22 Nov 2026: "let's do a few samples before we build further"). Three ways to
// lay out the same stay record, for James to compare on a preview: A chapters, B spreads, C film first. Preview only:
// the route does not exist on the production deployment, nothing links here, and the live stay page is untouched.
// Every word and photograph is read from the filed record through journalStay(); nothing is written here.
// One system for all three: five type sizes, one section gap, white ground, Stone Mist as the only band, crimson once.
export type Variant = "a" | "b" | "c" | "d";
export const SAMPLES: { variant: Variant; slug: string; name: string }[] = [
  { variant: "a", slug: "la-ferme-de-georges", name: "A · Chapters" },
  { variant: "b", slug: "aguas-arriba-lodge", name: "B · Spreads" },
  { variant: "c", slug: "fazenda-moreias", name: "C · Film first" },
  { variant: "d", slug: "aguas-claras", name: "D · Chosen mix, with prices" },
];
/** The locked template's stays: one list, lib/journal-style/template-stays.json. */
export const BATCH: string[] = TEMPLATE.stays;

const T = {
  display: "font-display font-medium leading-[0.98] text-[40px] md:text-[72px]",
  h2: "font-display font-medium leading-[1.05] text-[30px] md:text-[44px]",
  lead: "font-display italic leading-snug text-[20px] md:text-[24px]",
  body: "text-[16px] md:text-[17px] leading-relaxed",
  label: "font-mono text-[11px] tracking-[0.24em] uppercase",
};
const GAP = "py-[72px] md:py-[120px]";
const WRAP = "max-w-ledger mx-auto px-5 md:px-10";
const SCRIM = "linear-gradient(180deg,rgba(26,24,22,.5) 0,rgba(26,24,22,0) 22%,rgba(26,24,22,0) 52%,rgba(26,24,22,.82) 100%)";

type Shot = { url: string; alt: string };

function Head({ icon, label, title }: { icon: FieldIconName; label: React.ReactNode; title: string }) {
  return (
    <>
      <FieldIcon name={icon} height={28} className="text-graphite" />
      <p className={`${T.label} mt-4 text-stone-text`}>{label}</p>
      <h2 className={`${T.h2} mt-3 text-graphite`}>{title}</h2>
    </>
  );
}

function Chapter({ no, label, title, text, photo }: { no: string; label: string; title: string; text: string[]; photo: Shot }) {
  // Pinned (James, 23 Nov 2026): the photograph holds full screen while its words pass up over it.
  return (
    <section aria-label={title} className="relative isolate h-[150svh] min-h-[820px] bg-ink-deep text-white">
      <div className="sticky top-0 h-[100svh] min-h-[520px] overflow-hidden">
        <Image src={photo.url} alt={photo.alt} fill sizes="100vw" className="object-cover" />
        <span aria-hidden className="absolute inset-0" style={{ background: SCRIM }} />
      </div>
      <div className={`${WRAP} jw-chapter-text absolute inset-x-0 bottom-0 pb-24 md:pb-28`}>
        <p className={`${T.label} text-white/80`}>{no} · {label}</p>
        <h2 className={`${T.h2} mt-3 max-w-3xl`}>{title}</h2>
        <div className={`${T.lead} mt-4 max-w-xl space-y-1 text-white/90`}>{text.map((x) => <p key={x}>{x}</p>)}</div>
      </div>
    </section>
  );
}

function Spread({ shots, flip = false }: { shots: Shot[]; flip?: boolean }) {
  const [tall, w1, w2] = shots;
  if (!tall) return null;
  return (
    <div className={`grid gap-3 md:gap-5 md:grid-cols-12 ${flip ? "md:[&>figure:first-child]:order-2" : ""}`}>
      <figure className="relative aspect-[4/5] md:aspect-auto md:col-span-7 md:min-h-[640px] overflow-hidden bg-mist"><Image src={tall.url} alt={tall.alt} fill sizes="(min-width:768px) 58vw, 100vw" className="object-cover" /></figure>
      <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-5 md:col-span-5">
        {[w1, w2].filter(Boolean).map((p) => <figure key={p.url} className="relative aspect-[4/3] md:aspect-auto md:min-h-[310px] overflow-hidden bg-mist"><Image src={p.url} alt={p.alt} fill sizes="(min-width:768px) 42vw, 50vw" className="object-cover" /></figure>)}
      </div>
    </div>
  );
}

function Split({ label, title, text, photo, flip = false }: { label: string; title: string; text: string[]; photo: Shot | null; flip?: boolean }) {
  return (
    <section aria-label={title} className={`grid items-center gap-8 md:gap-16 ${photo ? "md:grid-cols-2" : ""}`}>
      <div className={flip ? "md:order-2" : ""}>
        <p className={`${T.label} text-stone-text`}>{label}</p>
        <h2 className={`${T.h2} mt-3 text-graphite`}>{title}</h2>
        <div className={`${T.body} mt-5 max-w-[62ch] space-y-4 text-graphite`}>{text.map((t) => <p key={t}>{t}</p>)}</div>
      </div>
      {photo && <figure className="relative aspect-[4/5] overflow-hidden bg-mist"><Image src={photo.url} alt={photo.alt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" /></figure>}
    </section>
  );
}

// The hero: one photograph (or the stay's film) for the whole screen, the name low and left, one button.
export function SampleHero({ v, variant }: { v: View; variant: Variant }) {
  const { s } = v;
  const pw = PATHWAYS_ON ? pathwayStays().find((r) => r.slug === s.slug) ?? null : null;
  const hero = v.frames[0];
  const film = (variant === "c" || variant === "d") && v.heroFilm?.kind === "mp4" ? v.heroFilm : null;
  return (
    <section id="journal-hero" aria-label={s.name} className="jw-onphoto relative isolate h-[100svh] min-h-[600px] overflow-hidden bg-ink-deep text-white">
      {film
        ? <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster={film.poster} aria-label={film.title}><source src={film.srcMobile} media="(max-width: 767px)" /><source src={film.src} /></video>
        : <Image src={hero.url} alt={hero.alt} fill priority sizes="100vw" className="object-cover" />}
      <span aria-hidden className="absolute inset-0" style={{ background: SCRIM }} />
      <div className={`${WRAP} relative flex h-full flex-col justify-end pb-28 md:pb-20`}>
        <p className={`${T.label} text-white/85`}>Volume I · Stays{s.country ? ` · ${s.country}` : ""}</p>
        <h1 className={`${T.display} mt-4 max-w-5xl`}>{s.name}</h1>
        {s.tagline && <p className={`${T.lead} mt-4 max-w-2xl text-white/90`}>{s.tagline}</p>}
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <a href="#reserve" className="ledger-btn ledger-btn--house">Check your dates</a>
          {film && <p className={`${T.label} text-white/70`}>{film.credit}</p>}
        </div>
      </div>
      {pw && <div aria-hidden className="pointer-events-none absolute right-4 top-24 md:top-auto md:right-10 md:bottom-20 [filter:drop-shadow(0_1px_10px_rgba(0,0,0,.6))]"><span className="block md:hidden"><PathwayStamp id={pw.primary.id} size={104} rotate={6} ink="#ffffff" /></span><span className="hidden md:block"><PathwayStamp id={pw.primary.id} size={156} rotate={6} ink="#ffffff" /></span></div>}
    </section>
  );
}

// The body: the answer paragraph, then the stay told in photographs, in the sample's own order.
// rooms: the same rows the stay page prints (rate-card rooms with their filed rates, or the house room library), with the page's own room pick
export type SampleRoom = { name: string; sleeps: number | null; list: string | null; now: string | null; basis?: string; facts?: string[]; lede?: string | null; features?: string[]; flag?: string; photo?: { url: string; alt: string } | null; action?: React.ReactNode };
export function SampleBody({ v, variant, rooms, roomsFallback, basis, promo, bar, footnote }: { v: View; variant: Variant; rooms: SampleRoom[]; roomsFallback?: React.ReactNode; basis: string; promo: string | null; bar?: React.ReactNode; footnote?: string | null }) {
  const { s } = v;
  const priced = rooms.map((r) => r.now ?? r.list).filter(Boolean) as string[];
  const pwName = PATHWAYS_ON ? pathwayStays().find((r) => r.slug === s.slug)?.primary.name ?? null : null;
  const glance: { icon: FieldIconName; label: string; value: string; wide?: boolean }[] = [
    ...(v.suited.length ? [{ icon: "frond" as FieldIconName, label: "Best for", value: v.suited.slice(0, 3).join(", "), wide: true }] : []),
    ...(s.bestMonths ? [{ icon: "sun" as FieldIconName, label: "Best months", value: s.bestMonths }] : []),
    ...(rooms.length ? [{ icon: "porthole" as FieldIconName, label: "Rooms", value: `${rooms.length} room type${rooms.length === 1 ? "" : "s"}` }] : []),
    ...(priced.length ? [{ icon: "anchor" as FieldIconName, label: "From", value: `${priced[0]} ${basis.split("·")[0].trim()}` }] : []),
    ...(s.airport ? [{ icon: "signal-flag" as FieldIconName, label: "Nearest airport", value: s.airport, wide: true }] : []),
    ...(pwName ? [{ icon: "wave" as FieldIconName, label: "Wild Pathway", value: pwName }] : []),
  ];
  const used = new Set<string>([v.frames[0].url]);
  const pool: ViewerPhoto[] = v.photos;
  const take = (...keys: (SectionKey | null)[]): Shot | null => {
    const hit = keys.map((k) => pool.find((p) => !used.has(p.url) && (k === null ? p.section !== "rooms" : p.section === k))).find(Boolean) ?? pool.find((p) => !used.has(p.url)) ?? null;
    if (hit) used.add(hit.url);
    return hit ? { url: hit.url, alt: hit.alt } : null;
  };
  const chapters = [
    s.onlyHere[0] ? { label: s.country ?? "The place", title: "Only Here", text: [s.onlyHere[0]], photo: take("exterior", null) } : null,
    s.onlyHere[1] ? { label: "Before you go", title: "Good to Know", text: s.onlyHere.slice(1), photo: take("exterior", "pool", null) } : null,
  ].filter((c): c is { label: string; title: string; text: string[]; photo: Shot } => !!c && !!c.photo);

  // no room cards filed: the house room record or the filed rooms text, in the same place
  const Rooms = rooms.length === 0 ? (roomsFallback ? <div className={`${WRAP} ${GAP} scroll-mt-32`}>{roomsFallback}</div> : null) : (
    <section id="rooms" aria-label="Rooms" className={`!bg-mist ${GAP}`}>
      <div className={WRAP}>
        <Head icon="tree-ring" label="Rooms" title="Where You’ll Sleep" />
      </div>
      {promo && <p className={`${WRAP} ${T.label} mt-4 text-house`}>{promo}</p>}
      {bar && <div className={`${WRAP} mt-6`}>{bar}</div>}
      <ul className="mt-10 flex snap-x snap-mandatory gap-4 md:gap-6 overflow-x-auto px-5 md:px-10 pb-4 [scrollbar-width:none]">
        {rooms.map((r) => (
          <li key={r.name} className="flex w-[78vw] max-w-[420px] shrink-0 snap-start flex-col bg-white">
            {r.photo && <figure className="relative aspect-[4/5] overflow-hidden bg-mist"><Image src={r.photo.url} alt={r.photo.alt} fill sizes="(min-width:768px) 420px, 78vw" className="object-cover" /></figure>}
            <div className="flex flex-1 flex-col p-5 md:p-6">
              <h3 className="font-display font-medium text-[24px] leading-tight text-graphite">{r.name}</h3>
              <p className={`${T.label} mt-3 text-stone-text`}>{r.facts?.length ? r.facts.join(" · ") : r.sleeps ? `Sleeps ${r.sleeps}` : ""}{r.flag ? ` · ${r.flag}` : ""}</p>
              {r.lede && <p className={`${T.body} mt-3 line-clamp-3 text-graphite`}>{r.lede}</p>}
              {r.features && r.features.length > 0 && <ul className={`${T.body} mt-3 space-y-1 text-stone-text`}>{r.features.slice(0, 3).map((f) => <li key={f}>· {f}</li>)}</ul>}
              <div className="mt-auto pt-6">
                {r.list
                  ? <p className="font-display text-[28px] leading-none text-graphite">{r.now && <s className="mr-2 text-[18px] text-stone-text">{r.list}</s>}{r.now ?? r.list}</p>
                  : <p className={`${T.label} text-graphite`}>Rate on enquiry</p>}
                {r.list && <p className={`${T.label} mt-2 text-stone-text`}>{r.basis ?? basis}</p>}
                <div className="mt-4">{r.action ?? <a href="#reserve" className="ledger-btn-ghost">Check dates</a>}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {footnote ? <p className={`${WRAP} ${T.label} mt-6 text-stone-text`}>{footnote}</p> : v.lib.ratesNote ? <p className={`${WRAP} ${T.body} mt-6 max-w-[62ch] text-stone-text`}>{v.lib.ratesNote}</p> : null}
    </section>
  );
  return (
    <>
      <section id="why" aria-label="Why it is here" className={`${WRAP} ${GAP} scroll-mt-32`}>
        <Head icon="sun" label={<>{s.ledgerId ? <span className="text-house">{s.ledgerId}</span> : "Being filed"} · Vetted by the house</>} title="Why We Added It to the Portfolio" />
        {/* At a glance (James, 23 Nov 2026): the quick facts beside the words, from the record only; nothing shows that is not filed. */}
        <div className="mt-5 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
          <p className={`${T.lead} max-w-3xl text-graphite`}>{v.intro}</p>
          {glance.length > 0 && (
            <dl aria-label={`${s.name} at a glance`} className="grid grid-cols-2 gap-x-6 border-t-2 border-[color:var(--jw-stone)] lg:grid-cols-1">
              {glance.map((g) => (
                <div key={g.label} className={`flex items-start gap-3 border-b border-[color:var(--jw-hairline)] py-3.5 ${g.wide ? "col-span-2 lg:col-span-1" : ""}`}>
                  <span aria-hidden className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center text-graphite"><FieldIcon name={g.icon} height={18} /></span>
                  <div className="min-w-0"><dt className={`${T.label} text-stone-text`}>{g.label}</dt><dd className="mt-1 font-display text-[19px] leading-snug text-graphite first-letter:uppercase">{g.value}</dd></div>
                </div>
              ))}
            </dl>
          )}
        </div>
        {s.why.filter((w) => !w.title).length > 0 && <div className={`${T.body} mt-6 max-w-[62ch] space-y-4 text-graphite`}>{s.why.filter((w) => !w.title).map((w) => <p key={w.body}>{w.body}</p>)}</div>}
        {s.why.filter((w) => w.title).length > 0 && (
          <div className="mt-10 max-w-3xl border-b border-[color:var(--jw-hairline)] [&>div]:!bg-transparent [&_h3_span]:italic">
            {s.why.filter((w) => w.title).map((w, i) => <AccordionRow key={w.title} as="h3" title={w.title} defaultOpen={i === 0} icon={<FieldIcon name={ICONS[i % ICONS.length]} height={18} />}>{w.body}</AccordionRow>)}
          </div>
        )}
      </section>
      {(variant === "a" || variant === "d") && <>
        {chapters.slice(0, 1).map((c, i) => <Chapter key={c.label} no={`0${i + 1}`} {...c} />)}
        {Rooms}
        {chapters.slice(1).map((c, i) => <Chapter key={c.label} no={`0${i + 2}`} {...c} />)}
      </>}
      {variant === "b" && <>
        <div className={`${WRAP} space-y-[72px] md:space-y-[120px] pb-[72px] md:pb-[120px]`}>
          <Spread shots={[take("exterior", null), take("pool", null), take("experiences", null)].filter((p): p is Shot => !!p)} />
          {s.onlyHere.length > 0 && <Split label={s.country ?? "The place"} title="Only Here" text={s.onlyHere} photo={take("exterior", null)} />}
        </div>
        {Rooms}
        <div className={`${WRAP} ${GAP}`}>
          <Spread flip shots={[take("experiences", null), take("dining", null), take(null)].filter((p): p is Shot => !!p)} />
        </div>
      </>}
      {variant === "c" && <>
        {Rooms}
        {chapters.slice(0, 2).map((c, i) => <Chapter key={c.label} no={`0${i + 1}`} {...c} />)}
        <div className={`${WRAP} ${GAP}`}>
          <Spread shots={[take("pool", null), take("exterior", null), take("dining", null)].filter((p): p is Shot => !!p)} />
        </div>
      </>}
    </>
  );
}

// What you can expect: what there is to do and what the stay gives you, in one place, told once.
const ICONS: FieldIconName[] = ["sun", "frond", "tree-ring", "coral"];
export function SampleExpect({ v, cards, children }: { v: View; cards: { title: string; image?: string; alt?: string }[]; children?: React.ReactNode }) {
  const { s } = v;
  const list = (items: string[]) => <ul className="space-y-2">{items.map((x) => <li key={x}>{x}</li>)}</ul>;
  const shown = cards.filter((c) => c.image);
  const told = s.experiences.paras.length > 0 || s.experiences.items.length > 0;
  const rows = [
    ...(s.experiences.items.length ? [{ title: "Things to do", body: list(s.experiences.items) }] : []),
    ...(s.features.items.length || s.features.paras.length ? [{ title: "What the stay gives you", body: <>{s.features.paras.length > 0 && <div className="space-y-3">{s.features.paras.map((x) => <p key={x}>{x}</p>)}</div>}{s.features.items.length > 0 && <div className={s.features.paras.length ? "mt-3" : ""}>{list(s.features.items)}</div>}</> }] : []),
    ...(!told && s.facts.signature_experiences ? [{ title: "Signature experiences", body: <p>{s.facts.signature_experiences}</p> }] : []),
    // "Who it is for" is not repeated here: Best for sits in the at-a-glance facts at the top (James, 23 Nov 2026).
  ];
  if (!rows.length && !s.experiences.paras.length && !shown.length) return null;
  return (
    <section id="expect" aria-label="What you can expect" className="bg-white scroll-mt-32">
      <Head icon="mountain-sun" label="Experiences and the stay" title="What You Can Expect" />
      {/* Across the page (James, 23 Nov 2026): the words in the house italic on the left, the folds on the right, no box. */}
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {s.experiences.paras.length > 0 && <div className={`${T.lead} max-w-[58ch] space-y-5 text-graphite`}>{s.experiences.paras.map((x) => <p key={x}>{x}</p>)}</div>}
        {rows.length > 0 && (
          <div className={`border-b border-[color:var(--jw-hairline)] [&>div:first-child]:border-t-2 [&>div:first-child]:border-t-[color:var(--jw-stone)] ${s.experiences.paras.length ? "" : "lg:col-span-2 max-w-3xl"}`}>
            {rows.map((r, i) => <AccordionRow key={r.title} as="h3" title={r.title} defaultOpen={i === 0} icon={<FieldIcon name={ICONS[i % ICONS.length]} height={18} />}>{r.body}</AccordionRow>)}
          </div>
        )}
      </div>
      {shown.length > 0 && (
        <ul className="mt-8 -mx-5 md:-mx-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:px-10 pb-2 [scrollbar-width:none]">
          {shown.map((c) => (
            <li key={c.title} className="w-[70vw] max-w-[340px] shrink-0 snap-start">
              <figure className="relative aspect-[4/5] overflow-hidden bg-mist"><Image src={c.image as string} alt={c.alt ?? c.title} fill sizes="(min-width:768px) 340px, 70vw" className="object-cover" /></figure>
              <p className="mt-3 font-display text-[20px] leading-snug text-graphite">{c.title}</p>
            </li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}

// Iggi, introduced: who he is and what to ask, in one card with his mark; the house's own chat sits inside, unchanged.
export function SampleIggi({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <section id="ask-iggi" aria-label={`Ask Iggi about ${name}`} className="border border-[color:var(--jw-hairline)] bg-mist">
      <div className="flex items-start gap-4 p-5 md:p-8">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-graphite"><IggiMark size={38} decorative /></span>
        <div>
          <p className={`${T.label} text-stone-text`}>Iggi · the house field guide</p>
          <h2 className={`${T.h2} mt-2 text-graphite`}>Ask Iggi About {name}</h2>
          <p className={`${T.lead} mt-3 max-w-2xl text-graphite`}>Iggi is the house&rsquo;s AI guide. He answers from the Ledger, says where each answer comes from, and hands prices and bookings to a person.</p>
          <p className={`${T.label} mt-5 text-stone-text`}>Try asking</p>
          <ul className={`${T.body} mt-2 space-y-1 text-graphite`}>
            <li>Which room suits us?</li>
            <li>What is the best month to go?</li>
            <li>How do we get there?</li>
          </ul>
        </div>
      </div>
      <div className="px-3 pb-3 md:px-8 md:pb-8">{children}</div>
    </section>
  );
}

export function SampleSwitch({ slug, variant }: { slug: string; variant: Variant }) {
  return (
    <nav aria-label="Layout samples" className="bg-ink-deep text-white">
      <div className={`${WRAP} flex flex-wrap items-center gap-x-8 gap-y-3 py-6`}>
        <p className={`${T.label} text-white/60`}>Layout samples · preview only</p>
        {SAMPLES.map((x) => <Link key={x.variant} href={`/journal-style/samples/${x.variant}/${x.slug}`} className={`${T.label} ${x.variant === variant ? "text-white underline underline-offset-4" : "text-white/75"}`}>{x.name}</Link>)}
        <Link href={`/stays/${slug}?journal=1`} className={`${T.label} text-white/75`}>Today&rsquo;s page</Link>
      </div>
    </nav>
  );
}
