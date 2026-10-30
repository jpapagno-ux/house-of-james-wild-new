import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import LedgerChart, { projectOn, type ChartData } from "@/components/destination/LedgerChart";
import LedgerChartMap, { type MapItem } from "@/components/destination/LedgerChartMap";
import { CHART_CENTRAL_AMERICA } from "@/lib/charts/central-america";
import REGION_CHARTS_JSON from "@/lib/charts/regions.json";
import { STAYS, pageReady } from "@/lib/content/stays";
import { RESERVES } from "@/lib/content/reserves";
import { isResidence } from "@/lib/content/ledger-counts";

// Region charts, one per region (scripts/build-region-charts.cjs → lib/charts/regions.json).
// Central America keeps its hand-built chart.
const REGION_CHARTS: Record<string, ChartData> = { ...(REGION_CHARTS_JSON as unknown as Record<string, ChartData>), "central-america": CHART_CENTRAL_AMERICA as unknown as ChartData };
import AnswerBlock from "@/components/ledger/AnswerBlock";
import LedgerCounter from "@/components/destination/LedgerCounter";
import PlaceNote from "@/components/destination/PlaceNote";
import { REGION_NOTES } from "@/lib/content/place-notes";
import { regionCounts } from "@/lib/content/ledger-counts";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import SafeLink from "@/components/ledger/SafeLink";
import CompassRose from "@/components/ledger/CompassRose";
import { Icon } from "@/components/ledger/Marks";
import Doors, { type Door } from "@/components/destination/Doors";
import Journeys from "@/components/destination/Journeys";
import PlanBand from "@/components/destination/PlanBand";
import { RecordCard } from "@/components/hub/Hub";
import { GlanceBar } from "@/components/record/Frame";
import { RecordHero } from "@/components/record/Sections";
import { REGION_DATA, regionBySlug } from "@/lib/content/regions";
import { journeysFor } from "@/lib/content/preview/journeys";
import { statusLine, type HouseStatus } from "@/lib/ledger/status";
import { recordHref } from "@/lib/ledger/urls";
import { REGIONS } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /destinations/[region]: the region landing page, built from the Ledger
// export. Hero + glance › region bar › in short › the region (library copy +
// gallery) › country cards › stays from the Ledger › what to expect ›
// journeys & voyages › facts & FAQ (reviewed regions only) › the Compass ›
// plan. A region is "ready" (in menus, indexable at launch) once it has live
// stays, a hero image and copy.

export const dynamicParams = false;
export function generateStaticParams() { return REGION_DATA.map((r) => ({ region: r.slug })); }

const FACT_LABEL: Record<string, string> = { best_months: "Best months", who_its_for: "Who it's for", signature_experiences: "Signature experiences", how_to_get_there: "Getting there" };
const HL_ICON = ["compass", "binoculars", "coast", "mountain", "route", "tree"];

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }) {
  const r = regionBySlug((await params).region);
  if (!r) return {};
  return buildMetadata({
    title: `${r.name}: Vetted Stays, Countries and Routes`,
    description: `${r.name} in the James Wild & Co Ledger: ${r.stayCount} live stays across ${r.countries.length} ${r.countries.length === 1 ? "country" : "countries"}${r.countries.length ? ` (${r.countries.map((c) => c.name).join(", ")})` : ""}, each vetted and filed under a permanent Ledger ID.`.slice(0, 300),
    path: `/destinations/${r.slug}`,
    image: r.hero ? { url: r.hero, alt: `${r.name} with James Wild & Co` } : undefined,
    noindex: !(r.ready || r.slug === "polar-antarctica"), // polar-antarctica approved by James, 28 Oct 2026
  });
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const r = regionBySlug((await params).region);
  if (!r) notFound();
  const path = `/destinations/${r.slug}`;
  const journeys = r.countries.flatMap((c) => (c.slug ? journeysFor(c.slug) : []));
  const doors: Door[] = r.countries.map((c) => ({ name: c.name, href: `${path}/${c.slug}`, image: c.image, imageAlt: `${c.name}, ${r.name}`, line: c.line, stays: c.stays, bestMonths: c.bestMonths ?? undefined, compass: c.slug === "costa-rica", routes: c.slug ? journeysFor(c.slug).filter((j) => j.kind === "route").length || undefined : undefined, voyages: c.slug ? journeysFor(c.slug).filter((j) => j.kind === "voyage").length || undefined : undefined }));
  const top = [...r.countries].sort((a, b) => b.stays - a.stays).slice(0, 4);
  const answer = r.countries.length
    ? `${r.name} in the James Wild & Co Ledger holds ${r.stayCount} live stays across ${r.countries.length} ${r.countries.length === 1 ? "country" : "countries"}, led by ${top.map((c) => `${c.name} (${c.stays})`).join(", ")}. Every stay is vetted in person or by a named partner and filed under a permanent Ledger ID.${journeys.length ? ` The house has drawn ${journeys.length} ${journeys.length === 1 ? "journey" : "journeys"} here.` : ""}${r.facts.best_months ? ` Best months: ${r.facts.best_months.split(".")[0]}.` : ""} Plan with James or an advisor who knows the ground.`
    : `${r.name} is being filed in the James Wild & Co Ledger now. Its first stays and voyages will appear here as they're vetted; in the meantime, James or an advisor can plan it with you.`;
  const chart = REGION_CHARTS[r.slug];
  const mapItems: MapItem[] = chart ? [
    ...STAYS.filter((s) => s.regionSlug === r.slug && s.coords).map((s) => { const q = projectOn(chart, s.coords!.lat, s.coords!.lng); return { id: s.slug, category: (isResidence(s.name, s.category) ? "residence" : "stay") as MapItem["category"], name: s.name, kind: `${s.category ?? "stay"} · ${s.country ?? ""}`, href: pageReady(s) ? recordHref("stay", s.slug) : `/plan?q=${encodeURIComponent(s.name)}`, x: q.x, y: q.y, area: s.country, bestMonths: s.bestMonths ?? undefined }; }),
    ...RESERVES.filter((x) => x.stay.regionSlug === r.slug && x.stay.coords).map((x) => { const q = projectOn(chart, x.stay.coords!.lat, x.stay.coords!.lng); return { id: `reserve-${x.slug}`, category: "reserve" as MapItem["category"], name: x.name, kind: `${x.camps.length} camps & residences`, href: `/safaris/${x.slug}`, x: q.x, y: q.y, area: x.area, bestMonths: x.stay.bestMonths ?? undefined }; }),
  ] : [];
  const glance = { facts: [["Countries", `${r.countries.length} in the Ledger`], ["Stays", `${r.stayCount} filed`], ["Journeys", journeys.length ? `${journeys.length} drawn` : "Ask James"]] as [string, string][], cta: { label: "Plan with James", href: `/plan?destination=${r.slug}` } };
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        {r.hero
          ? <RecordHero image={{ url: r.hero, alt: `${r.name}: ${r.tagline}` }} eyebrow="Destinations · Region" title={r.name} tagline={r.tagline} glance={<GlanceBar glance={glance} />} />
          : <div className="pt-36 pb-10 max-w-ledger mx-auto px-5 md:px-10"><p className="ledger-eyebrow ledger-crimson">Destinations · Region</p><h1 className="ledger-display text-[2.6rem] md:text-6xl mt-3">{r.name}</h1><p className="ledger-display italic text-xl mt-3 ledger-muted">{r.tagline}</p></div>}

        <nav aria-label="Regions" className="border-b ledger-rule bg-paper/95 backdrop-blur sticky top-[72px] lg:top-[192px] z-30">
          <div className="max-w-ledger mx-auto px-5 md:px-10 h-12 flex items-center gap-6">
            <div className="flex-1 min-w-0 flex items-center gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
              {REGIONS.map((x) => x.slug === r.slug
                ? <span key={x.slug} aria-current="page" className="ledger-display text-[15px] border-b border-crimson pb-0.5">{x.label}</span>
                : <SafeLink key={x.slug} href={x.href} className="ledger-display text-[15px] ledger-muted hover:text-ink">{x.label}</SafeLink>)}
            </div>
            <span className="hidden lg:flex items-center gap-5 shrink-0">{[...(REGION_CHARTS[r.slug] ? [["The map", "the-map"]] : []), ["Countries", "countries"], ["Stays", "stays"], ["Plan", "plan"]].map(([l, id]) => <a key={id} href={`#${id}`} className="ledger-eyebrow hover:ledger-crimson">{l}</a>)}</span>
          </div>
        </nav>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Destinations", path: "/destinations" }, { name: r.name, path }]} /></div>
          {chart && mapItems.length > 0 && (
            <section id="the-map" className="mt-8 scroll-mt-32 lg:scroll-mt-[240px]" aria-labelledby="region-map-heading">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                  <p className="ledger-eyebrow ledger-crimson">The Ledger in {r.name} · {mapItems.length} on the chart</p>
                  <h2 id="region-map-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">The Region, Pinned</h2>
                </div>
                <p className="text-[16px] ledger-muted max-w-md">Every stay, residence, reserve and voyage with a position on file. Each country page charts its own in closer detail.</p>
              </div>
              <LedgerChartMap legend="below" country={r.name} chart={<LedgerChart chart={chart} title={`Ledger chart of ${r.name} with its stays`} />} width={chart.width} height={chart.height} items={mapItems} counts={{ stay: mapItems.filter((i) => i.category === "stay").length, vessel: mapItems.filter((i) => i.category === "vessel").length, residence: mapItems.filter((i) => i.category === "residence").length, reserve: mapItems.filter((i) => i.category === "reserve").length }} />
            </section>
          )}

          <div className="mt-12 md:mt-16 grid lg:grid-cols-[1.45fr_1fr] gap-8 lg:gap-12 items-start">
            <div>
              <AnswerBlock>{answer}</AnswerBlock>
              <LedgerCounter place={r.name} counts={regionCounts(r.slug, r.countries.map((c) => c.slug).filter(Boolean) as string[], r.stayCount)} />
            </div>
            {REGION_NOTES[r.slug] && <div className="lg:pt-10"><PlaceNote place={r.name} note={REGION_NOTES[r.slug]} /></div>}
          </div>


          {(r.intro.length > 0 || r.gallery.length > 0) && (
            <section className="mt-12 md:mt-16 grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-start" aria-labelledby="region-heading">
              <div>
                <p className="ledger-eyebrow ledger-crimson">The region</p>
                <h2 id="region-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2 leading-tight">{r.heading || `Why ${r.name}`}</h2>
                <div className="mt-6 space-y-4 text-[17px] leading-relaxed">{r.intro.slice(0, 4).map((p) => <p key={p.slice(0, 30)}>{p}</p>)}</div>
              </div>
              {r.gallery.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {r.gallery.slice(0, 4).map((g, i) => (
                    <div key={g} className={`relative overflow-hidden bg-paper-card ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"} ${i === 3 ? "hidden sm:block" : ""}`}>
                      <Image src={g} alt={`${r.name}, from the James Wild & Co Ledger`} fill sizes={i === 0 ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 280px, 50vw"} className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <Doors eyebrow={`${r.countries.length} ${r.countries.length === 1 ? "country" : "countries"} in the Ledger`} title={`The Countries of ${r.name}`} intro="Open a country for its stays by area, routes, the months to go and the Compass where it's ready." doors={doors} />

          {r.featured.length > 0 && (
            <section id="stays" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[240px]" aria-labelledby="stays-heading">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div><p className="ledger-eyebrow ledger-crimson">From the Ledger · {r.stayCount} stays</p><h2 id="stays-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Places We&rsquo;d Send You in {r.name}</h2></div>
                <Link href="/stays" className="ledger-btn-ghost self-start md:self-auto">All stays</Link>
              </div>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {r.featured.map((s) => (
                  <li key={s.slug}><RecordCard name={s.name} id={s.ledgerId ?? ""} line={s.tagline ?? `${s.country}${statusLine(s.status as HouseStatus, s.statusDate) ? ` · ${statusLine(s.status as HouseStatus, s.statusDate)}` : ""}`} eyebrow={s.country} image={{ url: s.image, alt: `${s.name}, ${s.country}` }} href={recordHref(s.reserveChild ? "stay" : "stay", s.slug)} /></li>
                ))}
              </ul>
            </section>
          )}

          {r.highlights.length > 0 && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="hl-heading">
              <p className="ledger-eyebrow ledger-crimson">What to expect</p>
              <h2 id="hl-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2 max-w-3xl leading-tight">{r.highlightsTitle || `${r.name}, in Five Ways`}</h2>
              <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7">
                {r.highlights.map((h, i) => <li key={h.title} className="grid grid-cols-[44px_1fr] gap-4"><span className="ledger-crimson"><Icon name={HL_ICON[i % HL_ICON.length]} size={38} /></span><div><h3 className="ledger-display text-[1.25rem]">{h.title}</h3><p className="mt-1 text-[15px] ledger-muted leading-relaxed">{h.text}</p></div></li>)}
              </ul>
            </section>
          )}

          <Journeys country={r.name} journeys={journeys} />

          {Object.keys(r.facts).length > 0 && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="facts-heading">
              <p className="ledger-eyebrow ledger-crimson">Before you go</p>
              <h2 id="facts-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">{r.name} at a Glance</h2>
              <dl className="mt-6 grid md:grid-cols-2 gap-x-10 gap-y-6">
                {Object.entries(r.facts).map(([k, v]) => <div key={k} className="border-t ledger-border pt-3"><dt className="ledger-eyebrow">{FACT_LABEL[k] ?? k}</dt><dd className="mt-1.5 text-[16px] leading-relaxed">{v}</dd></div>)}
              </dl>
            </section>
          )}

          {r.faqs.length > 0 && <FaqBlock faqs={r.faqs} title={`${r.name}, answered`} />}

          <section className="mt-16 md:mt-24 text-paper -mx-5 md:mx-0 px-5 md:px-12 py-10 relative overflow-hidden bg-ink bg-[radial-gradient(90%_80%_at_100%_0%,rgba(34,101,110,0.55),transparent_62%)] grid md:grid-cols-[1fr_auto] gap-8 items-center" aria-label="The Compass">
            <div>
              <p className="ledger-eyebrow !text-white/70">Not sure where in {r.name}?</p>
              <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2">Let the Compass Choose, <span className="italic">Then Talk to a Person.</span></h2>
              <p className="mt-3 text-[16px] text-white/75 max-w-2xl">A few questions about who&rsquo;s travelling, the kind of place and the month, and it reads the Ledger for you.</p>
              <Link href="/compass" className="mt-5 inline-block bg-crimson hover:bg-crimson-deep transition-colors px-6 py-3 text-[12px] uppercase tracking-[0.18em]">Take the Compass</Link>
            </div>
            <CompassRose bearing={250} className="hidden md:block w-[160px] h-[160px]" />
          </section>

          <PlanBand place={r.name} compassHref="/compass" />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "CollectionPage", "@id": absoluteUrl(`${path}#page`), url: absoluteUrl(path), name: `${r.name} with James Wild & Co`, description: answer, publisher: { "@id": ids.house }, about: { "@type": "Place", name: r.name, ...(r.countries.length ? { containsPlace: r.countries.map((c) => ({ "@type": "Country", name: c.name })) } : {}) }, ...(r.featured.length ? { mainEntity: { "@type": "ItemList", name: `Stays in ${r.name}`, itemListElement: r.featured.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: absoluteUrl(recordHref("stay", s.slug)) })) } } : {}) })} />
    </>
  );
}
