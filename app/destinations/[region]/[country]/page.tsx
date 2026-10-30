import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { sharpen, tooSmall } from "@/lib/content/sharpen";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import LedgerCounter from "@/components/destination/LedgerCounter";
import PlaceNote from "@/components/destination/PlaceNote";
import { COUNTRY_NOTES } from "@/lib/content/place-notes";
import { countryCounts, isResidence } from "@/lib/content/ledger-counts";
import { RESERVES } from "@/lib/content/reserves";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import SafeLink from "@/components/ledger/SafeLink";
import { Reveal } from "@/components/ledger/Motion";
import HeroSlider, { type Slide } from "@/components/destination/HeroSlider";
import LedgerChart, { projectOn, type ChartData } from "@/components/destination/LedgerChart";
import LedgerChartMap, { type MapItem } from "@/components/destination/LedgerChartMap";
import Compass from "@/components/destination/Compass";
import Journeys from "@/components/destination/Journeys";
import Postcard from "@/components/notes/Postcard";
import Doors, { type Door } from "@/components/destination/Doors";
import WhenToGo from "@/components/destination/WhenToGo";
import PlanBand from "@/components/destination/PlanBand";
import GatewayNight from "@/components/stays/GatewayNight";
import LiveRatesBand from "@/components/record/LiveRatesBand";
import { RecordCard } from "@/components/hub/Hub";
import { CHART_COSTA_RICA } from "@/lib/charts/costa-rica";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import LIB_CHARTS from "@/lib/charts/countries.json";
import { COUNTRIES, countryBySlug } from "@/lib/content/countries";
import { GUIDES } from "@/lib/content/guides";
import GuidePage from "@/components/destination/GuidePage";
import { regionBySlug } from "@/lib/content/regions";
import { pageReady, staysIn } from "@/lib/content/stays";
import { journeysFor } from "@/lib/content/preview/journeys";
import { recordHref } from "@/lib/ledger/urls";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /destinations/[region]/[country]: the country page. Hero slider + counts ›
// region/country bar › the Ledger chart map (every stay, linked) › in short ›
// the Compass (where ready) › live rates spotlight (where a stay has the
// booking engine) › journeys › stays › James's note › the story › facts & FAQ
// › when to go › plan › also in the region. Built for Costa Rica and South
// Africa so far; more countries are added in lib/content/countries.ts.

export const dynamicParams = false;
export function generateStaticParams() {
  // Countries with stays (the Ledger chart page) plus countries told as a guide (Indonesia, by sea).
  return [...COUNTRIES.map((c) => ({ region: c.region, country: c.slug })), ...Object.values(GUIDES).filter((g) => !g.parent && !COUNTRIES.some((c) => c.slug === g.slug)).map((g) => ({ region: g.region, country: g.slug }))];
}

const CHARTS: Record<string, ChartData> = { ...(LIB_CHARTS as unknown as Record<string, ChartData>), "costa-rica": CHART_COSTA_RICA, "south-africa": CHART_SOUTH_AFRICA };
const FIRST = ["leeu", "ellerman", "monwana", "lion sands", "kirkman", "tswalu", "morukuru", "aguas claras", "pacuare", "lapa rios", "nayara"];
const rank = (n: string) => { const i = FIRST.findIndex((k) => n.toLowerCase().includes(k)); return i === -1 ? 99 : i; };

export async function generateMetadata({ params }: { params: Promise<{ region: string; country: string }> }) {
  const p = await params;
  const c = countryBySlug(p.region, p.country);
  const g = GUIDES[p.country];
  if (!c && g && g.region === p.region) return { ...buildMetadata({ title: g.seo.title, description: g.seo.description, path: g.path, image: { url: g.slides[0].url, alt: g.slides[0].alt } }), keywords: g.seo.keywords };
  if (!c) return {};
  const n = staysIn(c.slug).filter(pageReady).length;
  return buildMetadata({ title: `${c.name}: ${n} Vetted Stays, Routes and When to Go`, description: `${c.name} in the James Wild & Co Ledger: ${n} vetted stays mapped, the best months by area, how to get there and journeys the house has drawn. ${c.subtitle}.`, path: `/destinations/${c.region}/${c.slug}`, image: { url: c.hero.src, alt: c.hero.alt } });
}

export default async function CountryPage({ params }: { params: Promise<{ region: string; country: string }> }) {
  const p = await params;
  const c = countryBySlug(p.region, p.country);
  const g = GUIDES[p.country];
  if (!c && g && !g.parent && g.region === p.region) return <GuidePage g={g} />;
  if (!c) notFound();
  const region = regionBySlug(c.region);
  const path = `/destinations/${c.region}/${c.slug}`;
  const chart = CHARTS[c.slug];
  const all = staysIn(c.slug);
  const pages = all.filter(pageReady).sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
  const featured = pages.slice(0, 9);
  const rest = pages.slice(9);
  const journeys = journeysFor(c.slug);
  const items: MapItem[] = all.filter((s) => s.coords).map((s) => {
    const q = projectOn(chart, s.coords!.lat, s.coords!.lng);
    return { id: s.slug, category: isResidence(s.name, s.category) ? "residence" : "stay", name: s.name, kind: s.category ?? "stay", href: pageReady(s) ? recordHref("stay", s.slug) : `/plan?q=${encodeURIComponent(s.name)}`, x: q.x, y: q.y, area: null, bestMonths: s.bestMonths ?? undefined };
  });
  for (const r of RESERVES.filter((x) => x.stay.countrySlug === c.slug && x.stay.coords)) {
    const q = projectOn(chart, r.stay.coords!.lat, r.stay.coords!.lng);
    items.push({ id: `reserve-${r.slug}`, category: "reserve", name: r.name, kind: `${r.camps.length} camps & residences`, href: `/safaris/${r.slug}`, x: q.x, y: q.y, area: r.area, bestMonths: r.stay.bestMonths ?? undefined });
  }
  // A pin off the chart (offshore or a mis-coded record) is left off the map, not drawn at the edge.
  for (let i = items.length - 1; i >= 0; i--) { const { x, y } = items[i]; if (x == null || y == null || x < 0 || y < 0 || x > chart.width || y > chart.height) items.splice(i, 1); }
  const tally = (k: MapItem["category"]) => items.filter((i) => i.category === k).length;
  const slides: Slide[] = [{ src: c.hero.src, alt: c.hero.alt, caption: c.name }, ...featured.filter((s) => s.hero && !tooSmall(s.hero)).slice(0, 5).map((s) => ({ src: sharpen(s.hero as string), alt: `${s.name}, ${c.name}`, caption: s.name }))];
  const live = c.liveRates ? pages.find((s) => s.slug === c.liveRates!.stay) : undefined;
  const siblings = region?.countries ?? [];
  const doors: Door[] = siblings.filter((x) => x.slug !== c.slug).map((x) => ({ name: x.name, href: `/destinations/${c.region}/${x.slug}`, image: x.image, line: x.line, stays: x.stays }));
  const answer = `${c.name} has ${all.length} live stays in the James Wild & Co Ledger, ${pages.length} with their own page, each vetted in person or by a named partner and filed under a permanent Ledger ID.${c.months.length ? ` ${c.months.map((m) => `${m.area}: best ${monthsText(m.months)}`).join("; ")}.` : c.bestShort !== "Ask James" ? ` Best months: ${c.bestShort}.` : ""}${c.airports.length ? ` Fly into ${c.airports.map((a) => a[0]).join(" or ")}.` : ""}${journeys.length ? ` The house has drawn ${journeys.length} ${journeys.length === 1 ? "route" : "routes"} here.` : ""} Plan it with James or an advisor who knows the ground.`;
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <HeroSlider slides={slides} label={`${c.name} in photographs`}>
          <div className="h-full max-w-ledger mx-auto px-5 md:px-10 flex flex-col justify-end pb-24 md:pb-28">
            <p className="ledger-eyebrow !text-[11px] !tracking-[0.28em] !text-white/85">{c.regionName} · Destination</p>
            <h1 className="ledger-display text-5xl md:text-7xl mt-3">{c.name}</h1>
            <p className="ledger-display italic text-xl md:text-2xl text-white/90 mt-2">{c.subtitle}</p>
            <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 max-w-3xl border-t border-white/30 pt-5">
              <div><dt className="ledger-eyebrow !text-white/70">In the Ledger</dt><dd className="ledger-display text-2xl">{all.length} stays</dd></div>
              <div><dt className="ledger-eyebrow !text-white/70">Routes</dt><dd className="ledger-display text-2xl">{journeys.length || "Ask James"}</dd></div>
              <div><dt className="ledger-eyebrow !text-white/70">Best</dt><dd className="ledger-display text-2xl">{c.bestShort}</dd></div>
              <div><dt className="ledger-eyebrow !text-white/70">Fly into</dt><dd className="ledger-display text-2xl">{c.flyInto}</dd></div>
            </dl>
          </div>
        </HeroSlider>

        <nav aria-label={`${c.regionName} destinations`} className="border-b ledger-rule bg-paper sticky top-[72px] lg:top-[105px] z-30">
          <div className="max-w-ledger mx-auto px-5 md:px-10 h-12 flex items-center gap-6">
            <div className="flex-1 min-w-0 flex items-center gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
            <Link href={`/destinations/${c.region}`} className="ledger-eyebrow ledger-crimson">{c.regionName}</Link>
            <span className="w-px h-4 bg-ink/20" aria-hidden="true" />
            {siblings.map((s) => s.slug === c.slug
              ? <span key={s.slug} aria-current="page" className="ledger-display text-[15px] border-b border-crimson pb-0.5">{s.name}</span>
              : <SafeLink key={s.slug} href={`/destinations/${c.region}/${s.slug}`} className="ledger-display text-[15px] ledger-muted hover:text-ink" fallback={<span className="ledger-display text-[15px] ledger-muted/60">{s.name}</span>}>{s.name}</SafeLink>)}
            </div>
            <span className="shrink-0 hidden md:flex items-center gap-5">
              {[["The map", "the-map"], ...(c.compass ? [["Compass", "compass"]] : []), ...(live ? [["Live rates", "live-rates"]] : []), ["Stays", "stays"], ["When to go", "when"], ["Plan", "plan"]].map(([l, id]) => <a key={id} href={`#${id}`} className="ledger-eyebrow hover:ledger-crimson">{l}</a>)}
            </span>
          </div>
        </nav>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Destinations", path: "/destinations" }, { name: c.regionName, path: `/destinations/${c.region}` }, { name: c.name, path }]} /></div>

          <section id="the-map" className="pt-8 scroll-mt-32" aria-labelledby="map-heading">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="ledger-eyebrow ledger-crimson">The Ledger in {c.name} · {all.length} filed</p>
                <h2 id="map-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Where We&rsquo;d Send You in {c.name}</h2>
              </div>
              <p className="text-[16px] ledger-muted max-w-md">Every pin is a place in the Ledger. Open any entry for its full page; the rest can be planned with James.</p>
            </div>
            <LedgerChartMap legend={c.slug === "south-africa" ? "top-left" : "bottom-left"} country={c.name} chart={<LedgerChart chart={chart} title={`Ledger chart of ${c.name} with its stays`} />} width={chart.width} height={chart.height} items={items} counts={{ stay: tally("stay"), vessel: tally("vessel"), residence: tally("residence"), reserve: tally("reserve") }} />
          </section>

          <Reveal className="pt-12 md:pt-16 grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
            <div>
              <AnswerBlock>{answer}</AnswerBlock>
              <LedgerCounter place={c.name} counts={countryCounts(c.slug)} />
            </div>
            <div className="md:pt-8 space-y-8">
              {COUNTRY_NOTES[c.slug] && <PlaceNote place={c.name} note={COUNTRY_NOTES[c.slug]} />}
              <p className="text-[16px] leading-relaxed ledger-muted">{c.leading}</p>
            </div>
          </Reveal>

          {c.compass && <Compass country={c.name} stays={pages.map((x) => ({ slug: x.slug, name: x.name, kind: x.category ?? "stay", area: null, tagline: x.tagline ?? "", bestMonths: x.bestMonths ?? "", image: x.hero }))} advisorHref="/about/team#advisors" />}

          {live && c.liveRates && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="live-spot">
              <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center">
                <div>
                  <p className="ledger-eyebrow ledger-crimson">New · live booking</p>
                  <h2 id="live-spot" className="ledger-display text-[1.75rem] md:text-4xl mt-2">{c.liveRates.name}, Priced Live</h2>
                  <p className="mt-3 text-[17px] leading-relaxed max-w-xl">{c.liveRates.line}</p>
                  <Link href={recordHref("stay", live.slug)} className="mt-5 inline-block ledger-btn">Open {c.liveRates.name}</Link>
                </div>
                {live.hero && <div className="relative aspect-[16/10] overflow-hidden bg-paper-card"><Image src={live.hero} alt={`${live.name}, ${c.name}`} fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" /></div>}
              </div>
              <LiveRatesBand property={c.liveRates.property} name={c.liveRates.name} />
            </section>
          )}

          <Journeys country={c.name} journeys={journeys} chart={chart} />
          {c.postcard && (
            <section id="postcard" className="mt-16 md:mt-24 scroll-mt-32 grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-14 items-center" aria-labelledby="postcard-heading">
              <div>
                <p className="ledger-eyebrow ledger-crimson">From the house, by return</p>
                <h2 id="postcard-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2 leading-tight">Every Enquiry Gets a Reply Worth Keeping</h2>
                <p className="mt-4 text-[16px] leading-relaxed">Ask about a route and the answer comes back like this: the photograph on the front, the plan on the back in plain English, initialled by James. It works on a phone, in an inbox and, for the sentimental, on the fridge.</p>
                <a href={`/plan?trip=${encodeURIComponent(`${c.name} · ${c.postcard.front.title}`)}`} className="mt-6 inline-block ledger-btn">Ask about {c.postcard.front.title}</a>
              </div>
              <Postcard p={c.postcard} sample />
            </section>
          )}

          <GatewayNight country={p.country} className="mt-16 md:mt-24" />

          <section id="stays" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32" aria-labelledby="stays-heading">
            <p className="ledger-eyebrow ledger-crimson">From the Ledger · {pages.length} stays with their own page</p>
            <h2 id="stays-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Filed in {c.name}</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((s) => <li key={s.slug}><RecordCard name={s.name} id={s.ledgerId ?? ""} line={s.tagline ?? (s.bestMonths ? `Best ${s.bestMonths}` : "")} eyebrow={s.bestMonths ? `Best ${s.bestMonths}` : undefined} image={{ url: s.hero as string, alt: `${s.name}, ${c.name}` }} href={recordHref("stay", s.slug)} /></li>)}
            </ul>
            {rest.length > 0 && (
              <div className="mt-10 border-t ledger-border pt-6">
                <p className="ledger-eyebrow">More in {c.name}</p>
                <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2.5">{rest.map((s) => <li key={s.slug}><Link href={recordHref("stay", s.slug)} className="ledger-display text-[1.1rem] hover:ledger-crimson">{s.name}</Link>{s.ledgerId && <span className="ml-2 font-mono text-[11px] ledger-muted">{s.ledgerId}</span>}</li>)}</ul>
              </div>
            )}
          </section>

          {c.quote && (
            <Reveal className="mt-20 md:mt-28 max-w-4xl mx-auto text-center">
              <span className="ledger-display text-7xl ledger-crimson leading-none block h-10" aria-hidden="true">&ldquo;</span>
              <blockquote className="ledger-display italic text-2xl md:text-4xl leading-snug">{c.quote.text}</blockquote>
              <p className="ledger-hand text-3xl ledger-crimson mt-5">— James</p>
            </Reveal>
          )}

          <section id="story" className="mt-20 md:mt-28 border-t ledger-rule pt-10 scroll-mt-32 space-y-16" aria-label={`${c.name}, the story`}>
            {c.story.map((st, i) => (
              <div key={st.title} className="grid md:grid-cols-2 gap-10 items-center">
                <div className={i % 2 ? "md:order-2" : ""}>
                  <p className="ledger-eyebrow ledger-crimson">{st.eyebrow}</p>
                  <h2 className="ledger-display text-2xl md:text-3xl mt-2 leading-snug">{st.title}</h2>
                  <div className="mt-4 space-y-4 text-[16px] leading-relaxed ledger-muted">{st.blocks.map((b) => <p key={b.p.slice(0, 24)}>{b.h && <strong className="block ledger-display text-[1.1rem] text-ink font-normal mb-1">{b.h}</strong>}{b.p}</p>)}</div>
                </div>
                <div className={`ledger-paper p-3 ${i % 2 ? "md:order-1 rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}><div className="relative aspect-[4/5]"><Image src={st.image.src} alt={st.image.alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" /></div></div>
              </div>
            ))}
          </section>

          {c.facts.length > 0 && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="facts-heading">
              <p className="ledger-eyebrow ledger-crimson">Before you go</p>
              <h2 id="facts-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">{c.name} at a Glance</h2>
              <dl className="mt-6 grid md:grid-cols-3 gap-x-10 gap-y-5">{c.facts.map(([k, v]) => <div key={k} className="border-t ledger-border pt-3"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-1.5 text-[15.5px] leading-relaxed">{v}</dd></div>)}</dl>
            </section>
          )}

          <WhenToGo place={c.name} rows={c.months} airports={c.airports} transfers={c.transfers} />
          {c.faqs.length > 0 && <FaqBlock faqs={c.faqs} title={`${c.name}, answered`} />}
          <PlanBand place={c.name} compassHref={c.compass ? "#compass" : "/compass"} />
          <Doors id="also" eyebrow={`Also in ${c.regionName}`} title={`Beyond ${c.name}`} doors={doors} />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "TouristDestination", "@id": absoluteUrl(`${path}#destination`), name: c.name, url: absoluteUrl(path), description: answer, containedInPlace: { "@type": "Place", name: c.regionName }, publisher: { "@id": ids.house }, includesAttraction: pages.slice(0, 30).map((s) => ({ "@type": "LodgingBusiness", name: s.name, url: absoluteUrl(recordHref("stay", s.slug)), ...(s.coords ? { geo: { "@type": "GeoCoordinates", latitude: s.coords.lat, longitude: s.coords.lng } } : {}), ...(s.ledgerId ? { identifier: { "@type": "PropertyValue", propertyID: "Ledger ID", value: s.ledgerId } } : {}) })) })} />
    </>
  );
}

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function monthsText(m: string[]) {
  const best = m.map((x, i) => (x === "best" ? i : -1)).filter((i) => i >= 0);
  if (!best.length) return "year-round";
  // group consecutive months (wrapping December→January)
  const runs: number[][] = [];
  best.forEach((i) => { const r = runs[runs.length - 1]; if (r && r[r.length - 1] === i - 1) r.push(i); else runs.push([i]); });
  if (runs.length > 1 && runs[0][0] === 0 && runs[runs.length - 1].at(-1) === 11) { runs[0] = [...runs.pop()!, ...runs[0]]; }
  return runs.map((r) => (r.length === 1 ? MON[r[0]] : `${MON[r[0]]} to ${MON[r[r.length - 1]]}`)).join(" and ");
}
