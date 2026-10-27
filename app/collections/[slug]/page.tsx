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
import FromTheJournal from "@/components/journal/FromTheJournal";
import { CAYUGA, GALLERY, OFFER_PROGRAMS, liveOffers } from "@/lib/content/collections/cayuga";
import { POST_LIST } from "@/lib/content/journal/posts";
import { TRIPS } from "@/lib/content/trips";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// A hotel collection the house works with: the answer first, the group in
// numbers, every hotel with who it suits (linked to its stay page where one is
// built), how to pair them, what to ask, James's story, FAQs. Hidden from
// search until James approves the copy.

const COLLECTIONS = { [CAYUGA.slug]: CAYUGA };
type P = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(COLLECTIONS).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: P) {
  const { slug } = await params; const c = COLLECTIONS[slug];
  if (!c) return {};
  return buildMetadata({ title: c.seo.title, description: c.seo.description, path: c.path, image: { url: c.hero.url, alt: c.hero.alt }, noindex: true });
}

const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-28";

export default async function CollectionPage({ params }: P) {
  const { slug } = await params;
  const c = COLLECTIONS[slug];
  if (!c) notFound();
  const posts = POST_LIST.filter((p) => p.stays.some((s) => c.hotels.some((h) => h.slug === s.slug)));
  const offers = liveOffers();
  const routes = Object.values(TRIPS).filter((t) => (t.offerRefs ?? []).some((r) => c.hotels.some((h) => h.slug === r)));
  const slugOf = (name: string) => c.hotels.find((h) => h.name === name);
  const facts: [string, string][] = [["Hotels", String(c.hotels.length)], ["Countries", String(c.countries.length)], ["Founded", c.founded], ["Founders", c.founders.join(" & ")]];
  const url = absoluteUrl(c.path);

  const schema = graph(
    { "@type": "Organization", "@id": `${url}#org`, name: "Cayuga Collection", alternateName: "Cayuga Hospitality", foundingDate: c.founded, founder: c.founders.map((name) => ({ "@type": "Person", name })), url: absoluteUrl(c.path), areaServed: c.countries.map((name) => ({ "@type": "Country", name })) },
    { "@type": "CollectionPage", "@id": `${url}#page`, url, name: c.seo.title, description: c.seo.description, about: { "@id": `${url}#org` }, publisher: { "@id": ids.house },
      mainEntity: { "@type": "ItemList", itemListElement: c.hotels.map((h, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "LodgingBusiness", name: h.name, address: { "@type": "PostalAddress", addressLocality: h.where, addressCountry: h.country }, ...(h.built ? { url: absoluteUrl(`/stays/${h.slug}`) } : {}), ...(h.image ? { image: h.image.url } : {}) } })) } },
  );

  return (
    <>
      <SiteHeader overlay />
      <main id="main" className="pb-16">
        <header className="relative w-full h-[80svh] min-h-[520px] max-h-[1000px] overflow-hidden bg-ink text-white">
          <Image src={c.hero.url} alt={c.hero.alt} fill priority sizes="100vw" quality={85} className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0"><div className="max-w-ledger mx-auto px-5 md:px-10 pb-10 md:pb-16">
            <p className="ledger-eyebrow !text-white/80">{c.eyebrow}</p>
            <h1 className="ledger-display text-[2.5rem] md:text-[4.4rem] leading-[1.02] mt-3 max-w-4xl text-balance">{c.name}</h1>
            <p className="mt-4 text-[18px] md:text-[21px] text-white/90 max-w-2xl">{c.tagline}</p>
          </div></div>
        </header>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Stays", path: "/stays" }, { name: c.name, path: c.path }]} /></div>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-14 items-start">
            <AnswerBlock>{c.answer}</AnswerBlock>
            <dl className="my-8 grid grid-cols-2 gap-px bg-ink/10 border ledger-border">
              {facts.map(([k, v]) => <div key={k} className="bg-paper p-4"><dt className="ledger-eyebrow">{k}</dt><dd className="ledger-display text-[1.35rem] mt-1 leading-tight">{v}</dd></div>)}
            </dl>
          </div>

          <section id="hotels" aria-labelledby="hotels-h" className={SEC}>
            <p className="ledger-eyebrow ledger-crimson">The hotels</p>
            <h2 id="hotels-h" className="ledger-display text-[1.9rem] md:text-[2.6rem] mt-2">Seven Places, No Two Alike</h2>
            <p className="mt-3 text-[16.5px] ledger-muted max-w-2xl">Each keeps its own sense of place. The question isn&rsquo;t which is best, but which fits the journey.</p>
            <ul className="mt-8 grid md:grid-cols-2 gap-6">
              {c.hotels.map((h) => {
                const inner = (
                  <>
                    <div className="relative aspect-[16/10] overflow-hidden bg-ink/5">
                      {h.image
                        ? <Image src={h.image.url} alt={h.image.alt} fill sizes="(min-width: 768px) 50vw, 100vw" quality={85} className="object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                        : <div className="absolute inset-0 flex items-center justify-center text-center p-6"><p className="ledger-eyebrow">Photographs coming as it joins the Ledger</p></div>}
                    </div>
                    <div className="p-5 md:p-6">
                      <p className="ledger-eyebrow ledger-crimson">{h.country} · {h.setting}</p>
                      <h3 className="ledger-display text-[1.6rem] leading-tight mt-1">{h.name}</h3>
                      <p className="text-[14px] ledger-muted mt-0.5">{h.where}</p>
                      <p className="mt-3 text-[16px] leading-relaxed">{h.line}</p>
                      <p className="mt-3 text-[14.5px] leading-relaxed ledger-muted"><span className="ledger-eyebrow !text-[11px] mr-1.5">Cayuga says</span>&ldquo;{h.official.who}&rdquo; {h.official.facts}</p>
                      <ul className="mt-4 flex flex-wrap gap-2">{h.bestFor.map((b) => <li key={b} className="border ledger-border px-2.5 py-0.5 text-[13px]">{b}</li>)}</ul>
                      {h.built
                        ? <span className="mt-5 inline-flex items-center gap-2 ledger-crimson text-[15px]">See {h.name} <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span>
                        : <p className="mt-5 text-[14px] ledger-muted italic">Its own page is being filed. Ask us about it in the meantime.</p>}
                    </div>
                  </>
                );
                return <li key={h.slug} id={h.slug} className="scroll-mt-28">{h.built ? <Link href={`/stays/${h.slug}`} className="group block h-full border ledger-border hover:border-crimson/60 transition-colors">{inner}</Link> : <div className="h-full border ledger-border border-dashed">{inner}</div>}</li>;
              })}
            </ul>
          </section>

          <section id="fit" aria-labelledby="fit-h" className={SEC}>
            <p className="ledger-eyebrow ledger-crimson">Who it suits</p>
            <h2 id="fit-h" className="ledger-display text-[1.9rem] md:text-[2.4rem] mt-2">Which Cayuga Hotel Fits Which Traveller</h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px] border-collapse">
                <thead><tr className="border-b ledger-rule text-left"><th className="py-3 pr-4 ledger-eyebrow font-normal">Hotel</th><th className="py-3 pr-4 ledger-eyebrow font-normal">Setting</th><th className="py-3 pr-4 ledger-eyebrow font-normal">Best for</th><th className="py-3 ledger-eyebrow font-normal">James&rsquo;s call</th></tr></thead>
                <tbody>{c.hotels.map((h) => (
                  <tr key={h.slug} className="border-b ledger-border align-top">
                    <th scope="row" className="py-3 pr-4 text-left font-normal ledger-display text-[17px]">{h.built ? <Link href={`/stays/${h.slug}`} className="hover:ledger-crimson">{h.name}</Link> : h.name}<span className="block text-[13px] ledger-muted font-body">{h.country}</span></th>
                    <td className="py-3 pr-4">{h.setting}</td>
                    <td className="py-3 pr-4">{h.bestFor.join(", ")}</td>
                    <td className="py-3 ledger-muted">{h.choose}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>

          <section id="pairings" aria-labelledby="pair-h" className={SEC}>
            <p className="ledger-eyebrow ledger-crimson">How to combine them</p>
            <h2 id="pair-h" className="ledger-display text-[1.9rem] md:text-[2.4rem] mt-2">Two or Three Places, Well Connected</h2>
            <p className="mt-3 text-[16.5px] ledger-muted max-w-2xl">{c.rule}</p>
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {c.pairings.map((p) => <li key={p.title} className="border-t-2 border-crimson pt-4"><h3 className="ledger-display text-[1.25rem]">{p.title}</h3><p className="mt-1 ledger-eyebrow">{p.hotels.join(" + ")}</p><p className="mt-2 text-[15.5px] leading-relaxed ledger-muted">{p.line}</p></li>)}
            </ul>
          </section>

          {routes.length > 0 && (
            <section id="routes" aria-labelledby="routes-h" className={SEC}>
              <p className="ledger-eyebrow ledger-crimson">Trips built on these hotels</p>
              <h2 id="routes-h" className="ledger-display text-[1.9rem] md:text-[2.4rem] mt-2">The Original Costa Route</h2>
              <p className="mt-3 text-[16.5px] ledger-muted max-w-2xl">Stamped by James Wild, circa 1992: three routes on Cayuga hotels, with Dominical surfed if it&rsquo;s happening, a secret spot if it isn&rsquo;t, and a call if Pavones is running when you leave.</p>
              <ul className="mt-8 grid md:grid-cols-3 gap-5">
                {routes.map((t) => (
                  <li key={t.id}><Link href={t.seo.path} className="group block h-full border ledger-border hover:border-crimson/60 transition-colors p-5 md:p-6">
                    <p className="ledger-eyebrow ledger-crimson">{t.herofacts[0]?.[1]} · {t.meta.find(([k]) => k === "Journey code")?.[1]}</p>
                    <h3 className="ledger-display text-[1.35rem] leading-tight mt-1">{t.sub.split(" · ").slice(2).join(" · ") || t.sub}</h3>
                    <p className="text-[14px] ledger-muted mt-1">{t.herofacts[1]?.[1]}</p>
                    <p className="mt-3 text-[15.5px] leading-relaxed">{t.slides[0]?.line}</p>
                    <span className="mt-4 inline-flex items-center gap-2 ledger-crimson text-[15px]">See the route <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span>
                  </Link></li>
                ))}
              </ul>
            </section>
          )}

          {offers.length > 0 && (
            <section id="offers" aria-labelledby="offers-h" className={SEC}>
              <p className="ledger-eyebrow ledger-crimson">Special offers · 2026 travel</p>
              <h2 id="offers-h" className="ledger-display text-[1.9rem] md:text-[2.4rem] mt-2">Current Offers, Hotel by Hotel</h2>
              <p className="mt-3 text-[16.5px] ledger-muted max-w-2xl">One offer at each hotel this year, for stays until 19 December 2026. Tell us your dates and we&rsquo;ll confirm availability and book it for you.</p>
              {OFFER_PROGRAMS.map((prog) => {
                const list = offers.filter((x) => x.program === prog.name);
                if (!list.length) return null;
                return (
                  <div key={prog.name} className="mt-10">
                    <h3 className="ledger-display text-[1.5rem] md:text-[1.8rem]">{prog.name}</h3>
                    <p className="mt-1 text-[15.5px] ledger-muted max-w-2xl">{prog.line}</p>
                    <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {list.map((x) => {
                        const h = slugOf(x.hotel);
                        return (
                          <li key={x.hotel} id={`offer-${h?.slug ?? x.hotel}`} className="border ledger-border flex flex-col scroll-mt-28">
                            <div className="relative aspect-[4/3] overflow-hidden bg-ink/5"><Image src={x.image.url} alt={x.image.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" quality={85} className="object-cover" /></div>
                            <div className="p-5 flex flex-col flex-1">
                              <p className="ledger-eyebrow ledger-crimson">{h ? `${h.country} · ${h.where}` : ""}</p>
                              <h4 className="ledger-display text-[1.35rem] leading-tight mt-1">{h?.built ? <Link href={`/stays/${h.slug}`} className="hover:ledger-crimson">{x.hotel}</Link> : x.hotel}</h4>
                              <p className="mt-2 text-[17px]">{x.headline}</p>
                              <p className="mt-1 text-[14px] ledger-muted">Travel {x.travel}</p>
                              {x.note && <p className="mt-2 text-[14px] ledger-muted">{x.note}</p>}
                              <Link href={`/plan?trip=${encodeURIComponent(x.hotel)}&option=${encodeURIComponent(`${x.program}: ${x.headline}`)}&from=cayuga-offers`} className="mt-auto pt-4 inline-flex items-center gap-2 ledger-crimson text-[15px]">Plan it with James <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></Link>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              <p className="mt-6 text-[13px] ledger-muted max-w-3xl">Offers are set by each hotel, apply to new bookings, are subject to availability and can change or end without notice. We confirm the current terms before you book.</p>
            </section>
          )}
        </div>

        {GALLERY.length > 0 && (
          <section id="gallery" aria-labelledby="gal-h" className="mt-16 md:mt-24 scroll-mt-28">
            <div className="max-w-ledger mx-auto px-5 md:px-10">
              <p className="ledger-eyebrow ledger-crimson">Across the collection</p>
              <h2 id="gal-h" className="ledger-display text-[1.9rem] md:text-[2.4rem] mt-2">The Places Themselves</h2>
              <nav aria-label="Gallery themes" className="mt-5 flex flex-wrap gap-2">{GALLERY.map((grp) => <a key={grp.key} href={`#g-${grp.key}`} className="border ledger-border px-3 py-1 text-[13.5px] hover:border-crimson/60">{grp.label} <span className="ledger-muted">{grp.images.length}</span></a>)}</nav>
            </div>
            {GALLERY.map((grp) => (
              <div key={grp.key} id={`g-${grp.key}`} className="mt-10 scroll-mt-28">
                <h3 className="max-w-ledger mx-auto px-5 md:px-10 ledger-display text-[1.35rem] md:text-[1.6rem] mb-4">{grp.label}</h3>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2 px-1.5 md:px-2">
                  {grp.images.map((g, i) => (
                    <li key={g.url} className={`relative overflow-hidden bg-ink/5 ${i % 7 === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square"}`}>
                      <Image src={g.url} alt={g.alt} fill sizes={i % 7 === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"} quality={85} className="object-cover" />
                      {g.hotel && <span className="absolute left-2 bottom-2 bg-black/55 text-white text-[11px] tracking-[0.12em] uppercase px-2 py-0.5">{g.hotel}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="max-w-ledger mx-auto px-5 md:px-10 mt-4 text-[12.5px] ledger-muted">Photographs: Cayuga Collection.</p>
          </section>
        )}

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <section id="ask" aria-labelledby="ask-h" className={SEC}>
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-14">
              <div><p className="ledger-eyebrow ledger-crimson">Before you book</p><h2 id="ask-h" className="ledger-display text-[1.9rem] md:text-[2.4rem] mt-2">Questions Worth Asking Any &lsquo;Sustainable&rsquo; Hotel</h2><p className="mt-3 text-[16.5px] ledger-muted">A hotel doing serious work can answer these clearly. Much of what&rsquo;s published about Cayuga comes from the collection itself, so we ask too.</p></div>
              <ol className="grid gap-3">{c.questions.map((q, i) => <li key={q} className="grid grid-cols-[2.2rem_1fr] items-baseline border-b ledger-border pb-3 text-[16.5px]"><span className="font-mono text-[12px] ledger-crimson">{String(i + 1).padStart(2, "0")}</span>{q}</li>)}</ol>
            </div>
          </section>

          <FromTheJournal posts={posts} />

          <FaqBlock faqs={c.faqs} title="Questions About the Cayuga Collection" />
          <p className="mt-8 text-[13px] ledger-muted max-w-3xl">{c.disclosure} Hotel details from the Cayuga Collection; the roster is confirmed before booking.</p>

          <PlanBand place="Central America" compassHref="/compass" />
        </div>
      </main>
      <JsonLd data={schema} />
    </>
  );
}
