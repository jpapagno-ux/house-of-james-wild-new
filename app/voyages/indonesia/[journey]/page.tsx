import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { PlanClose } from "@/components/about/Parts";
import { SectionHead } from "@/components/record/Sections";
import ShipItinerary from "@/components/ships/ShipItinerary";
import ShipCard from "@/components/ships/ShipCard";
import { journeyFrom } from "@/components/ships/CharterJourneys";
import { JOURNEYS, JOURNEY_FLEETS, founderFavourites, journeyBySlug, journeyPath, journeyRouteId } from "@/lib/content/ships/journeys";
import { readRoute, shipMapHtml } from "@/lib/content/ships/routes";
import { registryShip } from "@/lib/content/ships/registry";
import { shipCard, type ShipCardData } from "@/lib/content/ships/cards";
import { undash } from "@/lib/content/ships/types";
import { partnerPath } from "@/lib/content/partners";
import { volumeInk } from "@/lib/volumes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph } from "@/lib/schema";

// /voyages/indonesia/<journey>: a signature charter journey shared by both Indonesian fleets (James,
// 2 Nov 2026). The answer first; the route chart with the moving boat and a typical week, every day
// marked indicative; the dive flags (light touch); the yachts that sail it, by partner, with their
// published rates; the best season from Indonesia's tourism board beside each operator's own months;
// a Founder Favourite voyage slot that renders only once a partner sends one; FAQs; TouristTrip,
// BreadcrumbList and FAQPage schema. Facts only from the operators and official sources.
export const dynamicParams = false;
export function generateStaticParams() { return JOURNEYS.map((j) => ({ journey: j.slug })); }
type P = { params: Promise<{ journey: string }> };
const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[212px]";
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;

export async function generateMetadata({ params }: P) {
  const j = journeyBySlug((await params).journey);
  if (!j) return {};
  const from = journeyFrom(JOURNEY_FLEETS.flatMap((f) => f.ships));
  return buildMetadata({
    title: `${j.short} Private Yacht Charter: A Typical Week`,
    description: `${j.short} by private phinisi: ${j.nights} nights from ${j.embark.split(",")[0]}, the day by day, best season (${j.season.best}) and five yachts from Rascal Voyages and Silolona Sojourns${from ? `, from ${usd(from)} a night` : ""}.`,
    path: journeyPath(j.slug), image: { url: j.hero.url, alt: j.hero.alt },
  });
}

export default async function JourneyPage({ params }: P) {
  const j = journeyBySlug((await params).journey);
  if (!j) notFound();
  const path = journeyPath(j.slug);
  const ink = volumeInk("voyages");
  const route = readRoute(journeyRouteId(j));
  const map = route ? { html: shipMapHtml({ id: `jwmap-${j.slug}`, routes: [route], destination: j.region, title: `Route map of ${j.name}`, kicker: "THE CHARTER · A TYPICAL WEEK" }) } : null;
  const trail = [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: "Indonesia", path: "/voyages/indonesia" }, { name: j.short, path }];
  const fleets = JOURNEY_FLEETS.map((f) => ({ ...f, cards: f.ships.map((s) => registryShip(s)).filter((r): r is NonNullable<typeof r> => !!r).map(shipCard).filter((c): c is ShipCardData => !!c) }));
  const favs = founderFavourites(j.slug);
  const from = journeyFrom(JOURNEY_FLEETS.flatMap((f) => f.ships));
  const other = JOURNEYS.find((x) => x.slug !== j.slug);
  const t = undash;

  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={trail} touch /></div>
          <header className="grid lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-end">
            <div>
              <p className="ledger-eyebrow" style={{ color: ink }}>Wild &amp; Co Voyages · Charter the whole yacht</p>
              <h1 className="ledger-h1 mt-3">{j.name}</h1>
              <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed">{t(j.line)}</p>
              <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 border-t border-l ledger-border">
                {[["Nights", `${j.nights}, a typical week`], ["From", j.embark.split(",")[0]], ["Best season", j.season.best], ["Yacht from", from ? `${usd(from)} a night` : "Ask us"]].map(([k, v]) => (
                  <div key={k} className="p-3 min-w-0 border-r border-b ledger-border"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-1 text-[14.5px] leading-snug">{v}</dd></div>
                ))}
              </dl>
            </div>
            <figure>
              <div className="relative aspect-[16/10] bg-paper-card overflow-hidden"><Image src={j.hero.url} alt={j.hero.alt} fill priority sizes="(min-width: 1024px) 54vw, 92vw" className="object-cover" /></div>
              <figcaption className="mt-1.5 text-[12px] ledger-muted">Photograph: {j.hero.credit}</figcaption>
            </figure>
          </header>
          <AnswerBlock>{t(j.answer)}</AnswerBlock>

          <ShipItinerary ship={j.short} itineraries={[{ name: `${j.short}, ${j.nights} nights`, nights: j.nights, direction: `${j.embark.split(",")[0]} round trip`, days: j.days.map((d) => ({ ...d, title: t(d.title), summary: t(d.summary) })) }]} map={map}
            eyebrow="A typical week, day by day" title={`What Does a Week of ${j.short} Look Like?`} intro={`${t(j.intro)} Scroll the log and the chart sails the route as you read.`} />

          <section id="dive-flags" className={SEC} aria-labelledby="dive-flags-h">
            <SectionHead eyebrow="For divers" title="Where Are the Dive Flags on This Route?" icon="wave" intro="A light touch: the sites the operators name on this week, with a PADI instructor or dive team aboard every yacht. The dive guide picks the sites on the day, by tide and conditions." />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {j.dive.map((f) => (
                <li key={f.name} className="flex gap-3 border ledger-border p-4">
                  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" className="shrink-0 mt-0.5"><rect x="2" y="4" width="20" height="14" fill={ink} /><path d="M2 4 L22 18" stroke="#fff" strokeWidth="3" /><rect x="1" y="3" width="1.6" height="19" fill="currentColor" /></svg>
                  <div className="min-w-0"><p className="ledger-display text-[18px] leading-snug">{f.name}</p><p className="text-[14px] ledger-muted">Day {f.day} · {t(f.note)}</p></div>
                </li>
              ))}
            </ul>
          </section>

          <section id="yachts" className={SEC} aria-labelledby="yachts-h">
            <SectionHead eyebrow="The yachts" title="Which Yacht Should You Charter for It?" icon="tree-ring" intro="Five yachts from two partners sail this week. Each is chartered whole, with her own crew; the rate is the operator's published nightly rate for the yacht, plus tax, or a quote on request." />
            {fleets.map((f) => (
              <div key={f.operator} className="mt-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                  <div><h3 className="ledger-display text-[24px]">{f.operator}</h3><p className="text-[15px] ledger-muted max-w-2xl">{t(f.line)}</p></div>
                  <Link href={partnerPath(f.partner)} className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline shrink-0" style={{ color: ink }}>Who are {f.operator}?<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>
                </div>
                <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{f.cards.map((c) => <li key={c.slug}><ShipCard c={c} /></li>)}</ul>
                <p className="mt-2 text-[12px] ledger-muted">Photographs: {f.operator}.</p>
              </div>
            ))}
          </section>

          {favs.length > 0 && (
            <section id="founder-favourite" className={SEC} aria-labelledby="founder-favourite-h">
              <SectionHead eyebrow="Founder Favourite voyage" title="Is There a Founder Favourite Voyage on This Route?" icon="sun" />
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {favs.map((f) => <li key={f.title} className="border-l-2 border-crimson pl-4 py-1"><p className="ledger-display text-[20px]">{t(f.title)}</p><p className="mt-1 text-[15px]">{t(f.line)}</p>{f.href && <Link href={f.href} className="mt-2 inline-flex min-h-[44px] items-center underline underline-offset-4">See the voyage</Link>}</li>)}
              </ul>
            </section>
          )}

          <section id="when" className={SEC} aria-labelledby="when-h">
            <SectionHead eyebrow="When to go" title={`When Is the Best Time for ${j.short}?`} icon="sun" />
            <div className="mt-6 grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
              <div className="space-y-4 text-[16.5px] leading-relaxed max-w-2xl">
                <p><a href={j.season.url} className="underline underline-offset-4" rel="noopener" target="_blank">{j.season.by}</a> names <strong className="font-medium">{j.season.best}</strong> as the best months.</p>
                <p><a href={j.parkUrl} className="underline underline-offset-4" rel="noopener" target="_blank">{t(j.park)}</a></p>
                {j.longer.map((x) => <p key={x.slice(0, 30)}>{t(x)}</p>)}
              </div>
              <dl className="ledger-paper border ledger-border p-5">
                <div className="py-2.5 border-b ledger-rule"><dt className="ledger-eyebrow">Indonesia&rsquo;s tourism board</dt><dd className="mt-0.5 text-[15px]">{j.season.best}</dd></div>
                {j.operatorSeasons.map((o) => <div key={o.operator} className="py-2.5 border-b ledger-rule last:border-0"><dt className="ledger-eyebrow">{o.operator} sails it</dt><dd className="mt-0.5 text-[15px]">{o.months}</dd></div>)}
              </dl>
            </div>
          </section>

          {other && <p className="mt-12"><Link href={journeyPath(other.slug)} className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline" style={{ color: ink }}>The other charter week: {other.name}<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link></p>}

          <FaqBlock faqs={j.faqs.map(([q, a]) => ({ q: t(q), a: t(a) }))} title={`What Else Should You Know About ${j.short}?`} />
          <PlanClose title="Want the whole yacht for a week?" line="Tell James your dates, your party and the yacht you like, and he will confirm what is open." />
        </div>
      </main>
      <JsonLd data={graph({
        "@type": "TouristTrip", "@id": absoluteUrl(`${path}#trip`), name: j.name, url: absoluteUrl(path), description: t(j.answer), image: j.hero.url,
        touristType: ["Families", "Couples travelling together", "Divers", "Private groups"],
        itinerary: { "@type": "ItemList", itemListElement: j.days.map((d, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Place", name: d.place, geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lng } } })) },
        ...(from ? { offers: { "@type": "Offer", priceCurrency: "USD", url: absoluteUrl(`${path}#yachts`), priceSpecification: { "@type": "UnitPriceSpecification", price: from, priceCurrency: "USD", unitText: "night", valueAddedTaxIncluded: false }, seller: { "@type": "TravelAgency", name: "James Wild & Co" } } } : {}),
        provider: { "@type": "TravelAgency", name: "James Wild & Co", url: absoluteUrl("/") },
      })} />
    </div>
  );
}
