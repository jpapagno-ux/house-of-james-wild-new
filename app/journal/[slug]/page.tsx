import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import PlanBand from "@/components/destination/PlanBand";
import StayFilm from "@/components/booking/StayFilm";
import Signature from "@/components/record/Signature";
import { Blocks, parse, sections, words } from "@/components/journal/Prose";
import LoopVideo from "@/components/journal/LoopVideo";
import { POSTS, journalPath, photoCredit, type JournalFigure, type JournalImage, type JournalPost } from "@/lib/content/journal/posts";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids, imageObject } from "@/lib/schema";
import { FILM_CREDITS, filmCreditSchema } from "@/lib/content/films";

// A Journal post: James's story, set like a printed travel piece. Full-bleed
// hero, the answer first (for readers and answer engines), the contents as
// questions, the film where the story first needs it, photographs at full
// resolution between sections, then the stay it's about, the FAQs and a way
// to plan. Article, VideoObject and FAQPage schema match what's on the page.

type P = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(POSTS).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: P) {
  const { slug } = await params; const p = POSTS[slug];
  if (!p) return {};
  const m = buildMetadata({ title: p.seoTitle, description: p.description, path: journalPath(p.slug), image: { url: abs(p.hero.url), alt: p.hero.alt }, type: "article", noindex: !p.approved });
  return { ...m, keywords: p.keywords, openGraph: { ...m.openGraph, type: "article", publishedTime: p.published, modifiedTime: p.modified, authors: [absoluteUrl("/about/founder")] } };
}

const abs = (u: string) => (u.startsWith("/") ? absoluteUrl(u) : u);
const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function Fig({ img, sizes, className = "", ratio }: { img: JournalImage; sizes: string; className?: string; ratio?: string }) {
  return (
    <figure className={className}>
      <div className="relative overflow-hidden bg-ink/5" style={{ aspectRatio: ratio ?? `${img.w} / ${img.h}` }}>
        {img.video
          ? <LoopVideo src={img.video} poster={img.url} label={img.alt} className="absolute inset-0 w-full h-full object-cover" />
          : <Image src={img.url} alt={img.alt} fill sizes={sizes} quality={85} className="object-cover" />}
      </div>
      {(img.caption || photoCredit(img)) && <figcaption className="mt-3 text-[14px] leading-snug ledger-muted italic max-w-2xl">{img.caption}{photoCredit(img) && <span className="not-italic font-mono text-[10.5px] tracking-[0.12em] uppercase ml-2 opacity-70">{photoCredit(img)}</span>}</figcaption>}
    </figure>
  );
}

function Figure({ f }: { f: JournalFigure }) {
  if (f.layout === "bleed") {
    const img = f.images[0];
    return (
      <figure className="journal-bleed my-14 md:my-20">
        <div className="relative w-full h-[62vh] md:h-[86vh] min-h-[360px] max-h-[980px] overflow-hidden bg-ink">
          <Image src={img.url} alt={img.alt} fill sizes="100vw" quality={85} className="object-cover" />
        </div>
        {(img.caption || photoCredit(img)) && <figcaption className="max-w-ledger mx-auto px-5 md:px-10 mt-3 text-[14px] ledger-muted italic">{img.caption}{photoCredit(img) && <span className="not-italic font-mono text-[10.5px] tracking-[0.12em] uppercase ml-2 opacity-70">{photoCredit(img)}</span>}</figcaption>}
      </figure>
    );
  }
  if (f.layout === "wide") return <div className="journal-wide my-12 md:my-16"><Fig img={f.images[0]} sizes="(min-width: 1200px) 1150px, 100vw" /></div>;
  if (f.layout === "pair") return <div className="journal-wide my-12 md:my-16 grid md:grid-cols-2 gap-5 md:gap-6">{f.images.map((i) => <Fig key={i.url} img={i} ratio="4 / 3" sizes="(min-width: 768px) 50vw, 100vw" />)}</div>;
  return <div className="journal-wide my-12 md:my-16 grid grid-cols-2 gap-3 md:gap-6">{f.images.map((i) => <Fig key={i.url} img={i} ratio="4 / 5" sizes="(min-width: 768px) 560px, 50vw" />)}</div>;
}

function Film({ p }: { p: JournalPost }) {
  if (!p.film) return null;
  return (
    <section id="film" aria-labelledby="film-h" className="journal-wide my-14 md:my-20 scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b ledger-rule pb-3 mb-5">
        <div><p className="ledger-eyebrow ledger-crimson">The film</p><h2 id="film-h" className="ledger-display text-[1.6rem] md:text-[2rem] mt-1">{p.title.split(":")[0]}, on film</h2></div>
        {p.youtube && <a href={p.youtube} target="_blank" rel="noopener" className="text-[14px] ledger-muted underline underline-offset-4 hover:ledger-crimson">Watch on YouTube</a>}
      </div>
      <StayFilm id={p.film.id} title={p.film.title} name={p.stays[0]?.name ?? p.title} planHref={`/plan?place=${encodeURIComponent(p.stays[0]?.name ?? "")}`} bare />
    </section>
  );
}

export default async function JournalPostPage({ params }: P) {
  const { slug } = await params;
  const p = POSTS[slug];
  if (!p) notFound();
  const secs = sections(parse(p.body));
  const toc = secs.filter((s) => s.title);
  const minutes = p.readMinutes ?? Math.max(1, Math.round((words(p.body) + p.faqs.reduce((n, f) => n + words(f.a) + words(f.q), 0)) / 230));
  const url = absoluteUrl(journalPath(p.slug));
  const stay = p.stays[0];
  const trail = [{ name: "Home", path: "/" }, { name: "Journal", path: "/journal" }, { name: p.title.split(":")[0], path: journalPath(p.slug) }];

  const schema = graph(
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: p.title,
      alternativeHeadline: p.seoTitle,
      description: p.description,
      url,
      mainEntityOfPage: url,
      image: [p.hero, ...p.figures.flatMap((f) => f.images)].map((i) => { const c = photoCredit(i)?.replace(/^Photograph: /, ""); return imageObject(abs(i.url), i.alt, c); }),
      datePublished: p.published,
      dateModified: p.modified,
      wordCount: words(p.body),
      articleSection: p.shelf,
      keywords: p.keywords.join(", "),
      inLanguage: "en",
      author: { "@id": ids.founder },
      publisher: { "@id": ids.house },
      isPartOf: { "@type": "Blog", "@id": absoluteUrl("/journal#blog"), name: "The James Wild & Co Journal" },
      about: p.about.map((name) => ({ "@type": "Thing", name })),
      mentions: p.stays.map((s) => ({ "@type": "LodgingBusiness", name: s.name, url: absoluteUrl(`/stays/${s.slug}`) })),
      identifier: p.ledgerId,
      ...(p.film ? { video: { "@id": `${url}#film` } } : {}),
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["#answer"] },
    },
    ...(p.film ? [{
      "@type": "VideoObject",
      "@id": `${url}#film`,
      name: p.film.title,
      description: p.film.description,
      thumbnailUrl: [`https://i.ytimg.com/vi/${p.film.id}/maxresdefault.jpg`],
      uploadDate: p.film.uploadDate,
      embedUrl: `https://www.youtube-nocookie.com/embed/${p.film.id}`,
      contentUrl: `https://www.youtube.com/watch?v=${p.film.id}`,
      // A credited film names its studio and partner; otherwise it is the founder's own.
      ...(FILM_CREDITS[p.film.id] ? filmCreditSchema(p.film.id) : { author: { "@id": ids.founder } }),
      publisher: { "@id": ids.house },
    }] : []),
  );

  return (
    <>
      <SiteHeader overlay />
      <main id="main" className="pb-16">
        {/* Hero: the photograph, full width, with the title set over its foot. */}
        <header className="relative w-full h-[88svh] min-h-[560px] max-h-[1100px] overflow-hidden bg-ink text-white">
          <Image src={p.hero.url} alt={p.hero.alt} fill priority sizes="100vw" quality={85} className="object-cover object-[50%_68%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/35" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-ledger mx-auto px-5 md:px-10 pb-10 md:pb-16">
              <p className="ledger-eyebrow !text-white/80">{p.shelf} · {p.place}</p>
              <h1 className="ledger-display text-[2.3rem] leading-[1.05] md:text-[4.2rem] mt-3 max-w-4xl text-balance">{p.title}</h1>
              <p className="mt-5 text-[18px] md:text-[21px] leading-relaxed text-white/90 max-w-2xl">{p.dek}</p>
              <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[13px] tracking-[0.06em] text-white/80">
                <span>By <Link href="/about/founder" className="underline underline-offset-4 decoration-white/40 hover:decoration-white">James Papagno</Link></span>
                {p.trip && <span>Travelled {p.trip}</span>}
                <span>{minutes} min read</span>
                {p.film && <a href="#film" className="underline underline-offset-4 decoration-white/40 hover:decoration-white">Watch the film</a>}
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
            <Breadcrumbs trail={trail} />
            <p className="font-mono text-[11px] tracking-[0.14em] ledger-muted">LEDGER · {p.ledgerId} · FILED {fmt(p.published).toUpperCase()}</p>
          </div>
        </div>

        <article className="journal" aria-labelledby="post-title">
          <h2 id="post-title" className="sr-only">{p.title}</h2>
          <div className="journal-col">
            <div id="answer"><AnswerBlock>{p.answer}</AnswerBlock></div>

            <nav aria-label="In this story" className="journal-toc">
              <p className="ledger-eyebrow">In this story</p>
              <ol>{toc.map((s, i) => <li key={s.id}><span className="font-mono text-[11px] ledger-crimson">{String(i + 1).padStart(2, "0")}</span><a href={`#${s.id}`}>{s.title}</a></li>)}<li><span className="font-mono text-[11px] ledger-crimson">{String(toc.length + 1).padStart(2, "0")}</span><a href="#faq-heading">{p.faqTitle ?? `Questions about ${stay?.name ?? "this story"}`}</a></li></ol>
            </nav>
          </div>

          {secs.map((s) => {
            const figs = p.figures.filter((f) => f.after === s.id);
            return (
              <div key={s.id}>
                <section id={s.id === "lead" ? undefined : s.id} className="journal-col journal-prose scroll-mt-28" aria-labelledby={s.title ? `${s.id}-h` : undefined}>
                  {s.title && <h2 id={`${s.id}-h`} className="ledger-display">{s.title}</h2>}
                  <Blocks blocks={s.blocks} lead={s.id === "lead"} />
                  {p.pull?.after === s.id && !p.pull.image && (
                    <figure className="journal-pull">
                      <blockquote><p>{p.pull.text}</p></blockquote>
                      <figcaption className="mt-6 flex items-center gap-4"><Signature className="w-24 md:w-28" label="Signed, James Papagno" /><span className="ledger-eyebrow">{p.close} · Founder, James Wild &amp; Co</span></figcaption>
                    </figure>
                  )}
                </section>
                {p.pull?.after === s.id && p.pull.image && (
                  <figure className="journal-lion journal-wide my-16 md:my-24" aria-label="From James">
                    <div className="journal-lion-text">
                      <blockquote><p>{p.pull.text}</p></blockquote>
                      <figcaption className="mt-6 flex items-center gap-4"><Signature className="w-24 md:w-28" label="Signed, James Papagno" /><span className="ledger-eyebrow">{p.close} · Founder, James Wild &amp; Co</span></figcaption>
                    </div>
                    <div className="journal-lion-art" style={{ aspectRatio: `${p.pull.image.w} / ${p.pull.image.h}` }}><Image src={p.pull.image.url} alt={p.pull.image.alt} fill sizes="(min-width: 900px) 45vw, 100vw" quality={85} className="object-contain" /></div>
                  </figure>
                )}
                {p.film?.after === s.id && <Film p={p} />}
                {figs.map((f, i) => <Figure key={i} f={f} />)}
              </div>
            );
          })}

          {stay && p.stays.length === 1 && (
            <section aria-labelledby="stay-h" className="journal-wide mt-16 md:mt-24 border-t ledger-rule pt-10">
              <p className="ledger-eyebrow ledger-crimson">The stay in this story</p>
              <Link href={`/stays/${stay.slug}`} className="group mt-4 grid md:grid-cols-[1.3fr_1fr] border ledger-border hover:border-crimson/60 transition-colors">
                <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[340px] overflow-hidden"><Image src={stay.image.url} alt={stay.image.alt} fill sizes="(min-width: 768px) 60vw, 100vw" quality={85} className="object-cover group-hover:scale-[1.02] transition-transform duration-700" /></div>
                <div className="p-6 md:p-10 flex flex-col justify-center">
                  <h2 id="stay-h" className="ledger-display text-[2rem] md:text-[2.6rem] leading-none">{stay.name}</h2>
                  <p className="mt-2 ledger-muted">{stay.line}</p>
                  {stay.note && <p className="mt-5 text-[16px] leading-relaxed">{stay.note}</p>}
                  <span className="mt-6 inline-flex items-center gap-2 ledger-crimson">See {stay.name} <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span>
                </div>
              </Link>
            </section>
          )}
          {p.stays.length > 1 && (
            <section aria-labelledby="stay-h" className="journal-wide mt-16 md:mt-24 border-t ledger-rule pt-10">
              <p className="ledger-eyebrow ledger-crimson">In this story</p>
              <h2 id="stay-h" className="ledger-display text-2xl md:text-3xl mt-2">The Stays</h2>
              <ul className="mt-6 grid md:grid-cols-3 gap-5">
                {p.stays.map((st) => (
                  <li key={st.slug}><Link href={`/stays/${st.slug}`} className="group block h-full border ledger-border hover:border-crimson/60 transition-colors">
                    <div className="relative aspect-[4/3] overflow-hidden"><Image src={st.image.url} alt={st.image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" quality={85} className="object-cover group-hover:scale-[1.02] transition-transform duration-700" /></div>
                    <div className="p-5"><h3 className="ledger-display text-[1.4rem] leading-tight">{st.name}</h3><p className="mt-1 text-[14px] ledger-muted">{st.line}</p>{st.note && <p className="mt-3 text-[15px] leading-relaxed">{st.note}</p>}<span className="mt-4 inline-flex items-center gap-2 ledger-crimson text-[15px]">See {st.name} <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span></div>
                  </Link></li>
                ))}
              </ul>
            </section>
          )}

          <div className="journal-col"><FaqBlock faqs={p.faqs} title={p.faqTitle ?? `Questions About ${stay?.name ?? "This Story"}`} /></div>

          <section aria-labelledby="more-h" className="journal-wide mt-16 border-t ledger-rule pt-8">
            <p className="ledger-eyebrow">Around this story</p>
            <h2 id="more-h" className="ledger-display text-2xl md:text-3xl mt-2">Where to Go Next</h2>
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {p.links.map((l) => <li key={l.href}><Link href={l.href} className="block h-full border ledger-border p-5 hover:border-crimson/60 transition-colors"><span className="ledger-display text-[19px]">{l.label}</span><span className="block mt-2 text-[14.5px] ledger-muted leading-snug">{l.line}</span></Link></li>)}
            </ul>
          </section>
        </article>

        <div className="max-w-ledger mx-auto px-5 md:px-10"><PlanBand place={p.planPlace ?? "South Africa"} compassHref="/compass" /></div>
      </main>
      <JsonLd data={schema} />
    </>
  );
}
