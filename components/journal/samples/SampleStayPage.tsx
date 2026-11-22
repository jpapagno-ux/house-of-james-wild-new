import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import PathwayStamp from "@/components/pathways/PathwayStamp";
import { pathwayStays } from "@/lib/content/pathways";
import { PATHWAYS_ON } from "@/lib/content/pathways/flag";
import { journalStay, money, type SectionKey, type ViewerPhoto } from "@/lib/journal-style/stay";

// JWC-STYLE-01 layout samples (James, 22 Nov 2026: "let's do a few samples before we build further"). Three ways to
// lay out the same stay record, for James to compare on a preview: A chapters, B spreads, C film first. Preview only:
// the route does not exist on the production deployment, nothing links here, and the live stay page is untouched.
// Every word and photograph is read from the filed record through journalStay(); nothing is written here.
// One system for all three: five type sizes, one section gap, white ground, Stone Mist as the only band, crimson once.
export type Variant = "a" | "b" | "c";
export const SAMPLES: { variant: Variant; slug: string; name: string }[] = [
  { variant: "a", slug: "la-ferme-de-georges", name: "A · Chapters" },
  { variant: "b", slug: "aguas-arriba-lodge", name: "B · Spreads" },
  { variant: "c", slug: "fazenda-moreias", name: "C · Film first" },
];

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

function Chapter({ no, label, title, text, photo }: { no: string; label: string; title: string; text: string[]; photo: Shot }) {
  return (
    <section aria-label={title} className="relative isolate h-[88svh] min-h-[520px] overflow-hidden bg-ink-deep text-white">
      <Image src={photo.url} alt={photo.alt} fill sizes="100vw" className="object-cover" />
      <span aria-hidden className="absolute inset-0" style={{ background: SCRIM }} />
      <div className={`${WRAP} relative flex h-full flex-col justify-end pb-12 md:pb-20`}>
        <p className={`${T.label} text-white/80`}>{no} · {label}</p>
        <h2 className={`${T.h2} mt-3 max-w-3xl`}>{title}</h2>
        <div className={`${T.body} mt-4 max-w-xl space-y-1 text-white/90`}>{text.map((x) => <p key={x}>{x}</p>)}</div>
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

export default function SampleStayPage({ slug, variant }: { slug: string; variant: Variant }) {
  const v = journalStay(slug);
  if (!v) notFound();
  const { s } = v;
  const full = `/stays/${s.slug}?journal=1`;
  const pw = PATHWAYS_ON ? pathwayStays().find((r) => r.slug === s.slug) ?? null : null;

  // photographs: each is used once, so no frame repeats down the page
  const used = new Set<string>();
  const pool: ViewerPhoto[] = v.photos;
  const take = (...keys: (SectionKey | null)[]): Shot | null => {
    const hit = keys.map((k) => pool.find((p) => !used.has(p.url) && (k === null ? p.section !== "rooms" : p.section === k))).find(Boolean) ?? pool.find((p) => !used.has(p.url)) ?? null;
    if (hit) used.add(hit.url);
    return hit ? { url: hit.url, alt: hit.alt } : null;
  };
  const hero = v.frames[0];
  used.add(hero.url);
  const film = variant === "c" && v.heroFilm?.kind === "mp4" ? v.heroFilm : null;

  const rooms = v.lib.rooms;
  const chapters = [
    s.onlyHere[0] ? { label: s.country ?? "The place", title: "Only Here", text: [s.onlyHere[0]], photo: take("exterior", null) } : null,
    s.experiences.items.length ? { label: "Experiences", title: "What You Can Do From Here", text: s.experiences.items.slice(0, 3), photo: take("experiences", "pool", null) } : null,
    s.features.items.length ? { label: "The stay", title: "What You Get", text: s.features.items.slice(0, 3), photo: take("dining", "pool", null) } : null,
    s.onlyHere[1] ? { label: "Before you go", title: "Good to Know", text: [s.onlyHere[1]], photo: take("exterior", "pool", null) } : null,
  ].filter((c): c is { label: string; title: string; text: string[]; photo: Shot } => !!c && !!c.photo);

  const Rooms = rooms.length > 0 && (
    <section id="rooms" aria-label="Rooms" className={`bg-mist ${GAP}`}>
      <div className={WRAP}>
        <p className={`${T.label} text-stone-text`}>Rooms</p>
        <h2 className={`${T.h2} mt-3 text-graphite`}>Where You&rsquo;ll Sleep</h2>
      </div>
      <ul className="mt-10 flex snap-x snap-mandatory gap-4 md:gap-6 overflow-x-auto px-5 md:px-10 pb-4 [scrollbar-width:none]">
        {rooms.map((r) => (
          <li key={r.name} className="w-[78vw] max-w-[420px] shrink-0 snap-start bg-white">
            {r.photos[0] && <figure className="relative aspect-[4/5] overflow-hidden bg-mist"><Image src={r.photos[0]} alt={`${r.name} at ${s.name}${s.country ? `, ${s.country}` : ""}`} fill sizes="(min-width:768px) 420px, 78vw" className="object-cover" /></figure>}
            <div className="p-5 md:p-6">
              <h3 className="font-display font-medium text-[24px] leading-tight text-graphite">{r.name}</h3>
              {r.facts.length > 0 && <p className={`${T.label} mt-3 text-stone-text`}>{r.facts.join(" · ")}</p>}
              {r.lede && <p className={`${T.body} mt-3 text-graphite`}>{r.lede}</p>}
              <p className={`${T.label} mt-5 text-graphite`}>{r.from ? `From ${money(r.from.amount)} · ${r.from.basis}` : "Rate on enquiry"}</p>
            </div>
          </li>
        ))}
      </ul>
      {v.lib.ratesNote && <p className={`${WRAP} ${T.body} mt-6 max-w-[62ch] text-stone-text`}>{v.lib.ratesNote}</p>}
    </section>
  );

  const Intro = (
    <section aria-label="Overview" className={`${WRAP} ${GAP}`}>
      <p className={`${T.label} text-stone-text`}>{s.ledgerId ? <span className="text-house">{s.ledgerId}</span> : "Being filed"} · Vetted by the house</p>
      <p className={`${T.lead} mt-5 max-w-4xl text-graphite`}>{v.answer}</p>
    </section>
  );

  return (
    <div className="journal-style bg-white">
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip bg-white">
        <section aria-label={s.name} className="jw-onphoto relative isolate h-[100svh] min-h-[600px] overflow-hidden bg-ink-deep text-white">
          {film
            ? <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline poster={film.poster} aria-label={film.title}><source src={film.srcMobile} media="(max-width: 767px)" /><source src={film.src} /></video>
            : <Image src={hero.url} alt={hero.alt} fill priority sizes="100vw" className="object-cover" />}
          <span aria-hidden className="absolute inset-0" style={{ background: SCRIM }} />
          <div className={`${WRAP} relative flex h-full flex-col justify-end pb-14 md:pb-20`}>
            <p className={`${T.label} text-white/85`}>Volume I · Stays{s.country ? ` · ${s.country}` : ""}</p>
            <h1 className={`${T.display} mt-4 max-w-5xl`}>{s.name}</h1>
            {s.tagline && <p className={`${T.lead} mt-4 max-w-2xl text-white/90`}>{s.tagline}</p>}
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href={`${full}#reserve`} className="ledger-btn ledger-btn--house">Check your dates</Link>
              {film && <p className={`${T.label} text-white/70`}>{film.credit}</p>}
            </div>
          </div>
          {pw && <div aria-hidden className="pointer-events-none absolute right-5 md:right-10 bottom-14 md:bottom-20 hidden sm:block"><PathwayStamp id={pw.primary.id} size={128} rotate={6} ink="#ffffff" /></div>}
        </section>

        {Intro}

        {variant === "a" && <>
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
          <div className={`${WRAP} ${GAP} space-y-[72px] md:space-y-[120px]`}>
            {s.experiences.items.length > 0 && <Split flip label="Experiences" title="What You Can Do From Here" text={s.experiences.items.slice(0, 5)} photo={take("experiences", null)} />}
            <Spread flip shots={[take("dining", null), take("experiences", null), take(null)].filter((p): p is Shot => !!p)} />
            {s.features.items.length > 0 && <Split label="The stay" title="What You Get" text={s.features.items.slice(0, 5)} photo={take("dining", "pool", null)} />}
          </div>
        </>}

        {variant === "c" && <>
          {Rooms}
          {chapters.slice(0, 2).map((c, i) => <Chapter key={c.label} no={`0${i + 1}`} {...c} />)}
          <div className={`${WRAP} ${GAP} space-y-[72px] md:space-y-[120px]`}>
            <Spread shots={[take("pool", null), take("exterior", null), take("dining", null)].filter((p): p is Shot => !!p)} />
            {s.features.items.length > 0 && <Split flip label="The stay" title="What You Get" text={s.features.items.slice(0, 5)} photo={take("dining", "pool", null)} />}
          </div>
        </>}

        <section aria-label="Plan with the house" className={`${WRAP} ${GAP} flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-[color:var(--jw-keyline)]`}>
          <div><p className={`${T.label} text-stone-text`}>Every enquiry goes to the house</p><p className={`${T.h2} mt-2 italic text-graphite`}>Let us plan your {s.country ? `${s.country} ` : ""}stay</p></div>
          <Link href={v.planHref} className="ledger-btn ledger-btn--house self-start md:self-center">Plan with James</Link>
        </section>

        <nav aria-label="Layout samples" className="bg-ink-deep text-white">
          <div className={`${WRAP} flex flex-wrap items-center gap-x-8 gap-y-3 py-6`}>
            <p className={`${T.label} text-white/60`}>Layout samples · preview only</p>
            {SAMPLES.map((x) => <Link key={x.variant} href={`/journal-style/samples/${x.variant}/${x.slug}`} className={`${T.label} ${x.variant === variant ? "text-white underline underline-offset-4" : "text-white/75"}`}>{x.name}</Link>)}
            <Link href={full} className={`${T.label} text-white/75`}>Today&rsquo;s page</Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
