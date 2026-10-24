import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Mail, MapPin, Plane } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import JsonLd from "@/components/ledger/JsonLd";
import { Reveal } from "@/components/ledger/Motion";
import HeroSlider, { type Slide } from "@/components/destination/HeroSlider";
import LedgerChart from "@/components/destination/LedgerChart";
import LedgerChartMap, { type MapItem } from "@/components/destination/LedgerChartMap";
import { CHART_COSTA_RICA, projectCostaRica } from "@/lib/charts/costa-rica";
import { COSTA_RICA as D } from "@/lib/content/preview/costa-rica";
import { isNewToLedger } from "@/lib/ledger/categories";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { breadcrumbs, graph } from "@/lib/schema";

// Preview of the country destination template (step 8), built on a snapshot
// of the Costa Rica Ledger. Same order as the Base44 sample: hero slider →
// region sub-nav → the Ledger chart map + legend, directly under the hero →
// answer block → featured stays by area → James's note → the country story →
// advisor + Travel Notes. Kept out of search (noindex) like every preview.

const path = `/destinations/${D.region.slug}/${D.slug}`;
const SNAP = Date.parse("2026-10-24T12:00:00Z");

export const metadata = buildMetadata({
  title: `${D.name}: Vetted Lodges, Rainforest Stays & Resorts`,
  description: `${D.name} stays filed in the James Wild & Co Ledger, mapped by area from Arenal to the Osa Peninsula, with best months and how to get there.`,
  path,
  noindex: true,
});

const stays = D.ledger.items;
const items: MapItem[] = stays.map((s) => {
  const p = s.lat != null && s.lng != null ? projectCostaRica(s.lat, s.lng) : null;
  return {
    id: s.id,
    category: "stay",
    name: s.name,
    kind: s.kind,
    href: `/stays/${s.slug}`,
    x: p ? p.x : null,
    y: p ? p.y : null,
    area: s.area,
    bestMonths: s.bestMonths,
    isNew: isNewToLedger(s.created, SNAP),
  };
});
const counts = { stay: stays.length, vessel: 0, residence: 0, reserve: 0 };
const areas = [...new Set(stays.map((s) => s.area).filter(Boolean))] as string[];
const featured = stays.filter((s) => s.image && s.tagline);
const slides: Slide[] = [
  { src: D.hero.src, alt: D.hero.alt, caption: D.name },
  ...featured.slice(0, 6).map((s) => ({ src: s.image as string, alt: `${s.name}, ${s.area || D.name}`, caption: s.name })),
];

const schema = graph(
  {
    "@type": "TouristDestination",
    "@id": absoluteUrl(`${path}#destination`),
    name: D.name,
    url: absoluteUrl(path),
    description: D.leading,
    containedInPlace: { "@type": "Place", name: D.region.name },
    includesAttraction: stays
      .filter((s) => s.lat != null)
      .map((s) => ({
        "@type": "LodgingBusiness",
        name: s.name,
        url: absoluteUrl(`/stays/${s.slug}`),
        geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng },
        identifier: { "@type": "PropertyValue", propertyID: "Ledger ID", value: s.ledgerId },
      })),
  },
  breadcrumbs([
    { name: "Home", path: "/" },
    { name: "Destinations", path: "/destinations" },
    { name: D.region.name, path: `/destinations/${D.region.slug}` },
    { name: D.name, path },
  ]),
);

export default function CostaRicaPreview() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <HeroSlider slides={slides} label={`${D.name} in photographs`}>
          <div className="h-full max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pb-24 md:pb-28">
            <p className="ledger-eyebrow !text-[11px] !tracking-[0.28em] !text-white/85">{D.region.name} · Destination</p>
            <h1 className="ledger-display text-5xl md:text-7xl mt-3">{D.name}</h1>
            <p className="ledger-display italic text-xl md:text-2xl text-white/90 mt-2">{D.subtitle}</p>
            <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 max-w-3xl border-t border-white/30 pt-5">
              <div><dt className="ledger-eyebrow !text-white/70">In the Ledger</dt><dd className="ledger-display text-2xl">{stays.length} stays</dd></div>
              <div><dt className="ledger-eyebrow !text-white/70">Areas</dt><dd className="ledger-display text-2xl">{areas.length}</dd></div>
              <div><dt className="ledger-eyebrow !text-white/70">Most stays suggest</dt><dd className="ledger-display text-2xl">Dec–Apr</dd></div>
              <div><dt className="ledger-eyebrow !text-white/70">Fly into</dt><dd className="ledger-display text-2xl">SJO · LIR</dd></div>
            </dl>
          </div>
        </HeroSlider>

        {/* Region sub-navigation */}
        <nav aria-label={`${D.region.name} destinations`} className="border-b ledger-rule bg-paper sticky top-[72px] z-30">
          <div className="max-w-ledger mx-auto px-5 md:px-10 h-12 flex items-center gap-6 overflow-x-auto whitespace-nowrap">
            <Link href="/destinations" className="ledger-eyebrow hover:ledger-crimson">Destinations</Link>
            <span className="ledger-eyebrow" aria-hidden="true">›</span>
            <Link href={`/destinations/${D.region.slug}`} className="ledger-eyebrow ledger-crimson">{D.region.name}</Link>
            <span className="w-px h-4 bg-ink/20" aria-hidden="true" />
            {D.siblings.map((s) =>
              s.slug === D.slug ? (
                <span key={s.slug} aria-current="page" className="ledger-display text-[15px] border-b border-crimson pb-0.5">{s.name}</span>
              ) : (
                <Link key={s.slug} href={`/destinations/${D.region.slug}/${s.slug}`} className="ledger-display text-[15px] ledger-muted hover:text-ink">{s.name}</Link>
              ),
            )}
            <span className="ml-auto hidden md:flex items-center gap-5">
              {[["The map", "the-map"], ["Stays", "stays"], ["Story", "story"], ["Plan", "plan"]].map(([l, id]) => (
                <a key={id} href={`#${id}`} className="ledger-eyebrow hover:ledger-crimson">{l}</a>
              ))}
            </span>
          </div>
        </nav>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          {/* The Ledger map, directly under the hero */}
          <section id="the-map" className="pt-10 md:pt-14 scroll-mt-32" aria-labelledby="map-heading">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="ledger-eyebrow ledger-crimson">The Ledger in {D.name} · {stays.length} filed</p>
                <h2 id="map-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Where We&rsquo;d Send You in {D.name}</h2>
              </div>
              <p className="text-[16px] ledger-muted max-w-md">Every pin is a place in the Ledger. Use the legend to show or hide each kind of stay, then open any entry for its full page.</p>
            </div>
            <LedgerChartMap
              country={D.name}
              chart={<LedgerChart title={`Ledger chart of ${D.name} with its stays`} />}
              width={CHART_COSTA_RICA.width}
              height={CHART_COSTA_RICA.height}
              items={items}
              counts={counts}
            />
          </section>

          {/* Answer block */}
          <Reveal className="pt-12 md:pt-16 grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
            <section aria-label="In short" className="border-l-2 border-crimson pl-5">
              <p className="ledger-eyebrow ledger-crimson">In short</p>
              <p className="mt-2 text-[18px] leading-relaxed">
                {D.name} has {stays.length} stays in the James Wild &amp; Co Ledger, across {areas.length} areas from Arenal and the cloud forest to the Caribbean coast and the Osa Peninsula. Most of them suggest December to April for the best weather. Fly into San José (SJO) or Liberia (LIR). Every entry carries a permanent Ledger ID, and the map shows where each one sits.
              </p>
            </section>
            <p className="text-[16px] leading-relaxed ledger-muted">{D.leading}</p>
          </Reveal>

          {/* Featured stays */}
          <section id="stays" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32" aria-labelledby="stays-heading">
            <p className="ledger-eyebrow">Featured stays · from Wild Earth Stays</p>
            <h2 id="stays-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Filed in {D.name}</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((s, i) => (
                <li key={s.id}>
                  <Reveal delay={(i % 3) * 0.08} className="h-full">
                    <Link href={`/stays/${s.slug}`} className="group block ledger-paper border ledger-border h-full hover:-translate-y-1 transition-transform duration-300">
                      <div className="relative aspect-[4/3] overflow-hidden border-b ledger-rule">
                        <Image src={s.image as string} alt={`${s.name}, ${s.area || D.name}`} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-[1.04] transition-transform [transition-duration:1200ms]" />
                        <span className="absolute top-3 left-3 ledger-eyebrow !text-white bg-black/35 backdrop-blur-sm px-2 py-1">{s.ledgerId}</span>
                      </div>
                      <div className="p-5">
                        <p className="ledger-eyebrow ledger-crimson">{s.kind}{s.area ? ` · ${s.area}` : ""}</p>
                        <h3 className="ledger-display text-xl mt-1.5 leading-snug">{s.name}</h3>
                        <p className="mt-2 text-[15px] ledger-muted leading-relaxed">{s.tagline}</p>
                        <div className="mt-4 pt-3 border-t ledger-border flex items-center justify-between gap-3">
                          <span className="text-[13px] ledger-muted">{s.bestMonths ? `Best ${s.bestMonths}` : ""}</span>
                          <span className="inline-flex items-center gap-1.5 text-[15px] group-hover:gap-2.5 transition-all">Open entry <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>

          {/* James's note */}
          <Reveal className="mt-20 md:mt-28 max-w-4xl mx-auto text-center">
            <span className="ledger-display text-7xl ledger-crimson leading-none block h-10" aria-hidden="true">&ldquo;</span>
            <blockquote className="ledger-display italic text-2xl md:text-4xl leading-snug">{D.quote.text}</blockquote>
            <p className="ledger-hand text-3xl ledger-crimson mt-5">— James</p>
          </Reveal>

          {/* The country story */}
          <section id="story" className="mt-20 md:mt-28 border-t ledger-rule pt-10 scroll-mt-32 space-y-16" aria-label={`${D.name}, the story`}>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <Reveal>
                <p className="ledger-eyebrow ledger-crimson">{D.name} · the place</p>
                <h2 className="ledger-display text-2xl md:text-3xl mt-2 leading-snug">{D.section1.title}</h2>
                <div className="mt-4 space-y-3 text-[16px] leading-relaxed ledger-muted">{D.section1.paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>
              </Reveal>
              <Reveal delay={0.1}><div className="ledger-paper p-3 -rotate-[0.6deg]"><div className="relative aspect-[4/5]"><Image src={D.section1.image.src} alt={D.section1.image.alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" /></div></div></Reveal>
            </div>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <Reveal className="md:order-1 order-2"><div className="ledger-paper p-3 rotate-[0.6deg]"><div className="relative aspect-[4/5]"><Image src={D.section2.image.src} alt={D.section2.image.alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" /></div></div></Reveal>
              <Reveal delay={0.1} className="md:order-2 order-1">
                <p className="ledger-eyebrow ledger-crimson">{D.section2.eyebrow}</p>
                <h2 className="ledger-display text-2xl md:text-3xl mt-2 leading-snug">{D.section2.title}</h2>
                <div className="mt-4 space-y-3 text-[16px] leading-relaxed ledger-muted">{D.section2.paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>
              </Reveal>
            </div>
          </section>

          {/* Plan: advisor + Travel Notes */}
          <section id="plan" className="mt-20 md:mt-28 grid md:grid-cols-2 gap-6 scroll-mt-32 border-t ledger-rule pt-10" aria-label={`Plan ${D.name}`}>
            <div className="ledger-paper p-6 md:p-8 h-full">
              <p className="ledger-eyebrow ledger-crimson">Advisors who know {D.name}</p>
              <div className="mt-4 flex items-center gap-4">
                <span className="w-16 h-16 rounded-full border ledger-rule flex items-center justify-center ledger-display text-2xl ledger-muted" aria-hidden="true">JP</span>
                <div>
                  <p className="ledger-display text-xl">James Papagno</p>
                  <p className="ledger-eyebrow">Founder &amp; Chief Expedition Officer</p>
                </div>
              </div>
              <p className="mt-4 text-[15px] ledger-muted">The advisor feed fills this panel from the library: each advisor&rsquo;s profile, the countries they know and how to reach them.</p>
              <Link href="/plan" className="ledger-btn mt-5">Plan {D.name} with James</Link>
            </div>
            <div className="ledger-paper p-6 md:p-8 h-full">
              <p className="ledger-eyebrow ledger-crimson">Travel Notes</p>
              <p className="ledger-display text-2xl mt-2">Hear when we file something new in {D.name}.</p>
              <p className="mt-3 text-[15px] ledger-muted">New stays and ships before they&rsquo;re announced, plus the stay-longer offers. One letter a month.</p>
              <form className="mt-6 flex gap-2" action="/travel-notes">
                <label htmlFor="tn-email" className="sr-only">Email address</label>
                <input id="tn-email" name="email" type="email" placeholder="Your email" className="flex-1 min-w-0 bg-paper border ledger-border px-3 py-2 text-[16px] outline-none focus:border-crimson" />
                <button type="submit" className="ledger-btn inline-flex items-center gap-2"><Mail className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Join</button>
              </form>
            </div>
          </section>

          <div className="mt-10 grid sm:grid-cols-3 gap-4 text-[14px]">
            <p className="flex items-center gap-2 ledger-muted"><CalendarDays className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /> Most stays suggest December to April</p>
            <p className="flex items-center gap-2 ledger-muted"><Plane className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /> Fly into San José (SJO) or Liberia (LIR)</p>
            <p className="flex items-center gap-2 ledger-muted"><MapPin className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /> {stays.length} stays · 0 vessels · 0 residences</p>
          </div>

          {/* Preview only: records held back by the Ledger gate */}
          <section className="mt-14 border border-dashed border-crimson/50 p-5 md:p-6">
            <p className="ledger-eyebrow ledger-crimson">Ledger notes · preview only, never published</p>
            <p className="mt-1 text-[14px] ledger-muted">Linked to {D.name} in the library but held back until fixed:</p>
            <ul className="mt-3 space-y-1.5 text-[14px]">
              {D.ledger.notes.map(([n, id, why]) => (
                <li key={id}><span className="ledger-display">{n}</span> <span className="ledger-eyebrow">{id}</span> <span className="ledger-muted">· {why}</span></li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <JsonLd data={schema} />
    </>
  );
}
