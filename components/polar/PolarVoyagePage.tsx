import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { Overview, RecordHero, SectionHead } from "@/components/record/Sections";
import { GalleryMosaic, RecordActionBar } from "@/components/record/Frame";
import { PathwayChips } from "@/components/pathways/Pathway";
import ShipGlance from "@/components/ships/ShipGlance";
import ShipCard from "@/components/ships/ShipCard";
import OfferPanel from "@/components/ledger/OfferPanel";
import { offersFor } from "@/lib/content/offers/offers";
import { shipCard } from "@/lib/content/ships/cards";
import { registryShip } from "@/lib/content/ships/registry";
import ShipNav from "@/components/ships/ShipNav";
import ShipItinerary from "@/components/ships/ShipItinerary";
import MonthDepartures from "@/components/ships/MonthDepartures";
import DatesGrid from "@/components/ships/DatesGrid";
import NoDates from "@/components/ships/NoDates";
import { datesData } from "@/lib/content/ships/fares";
import { undash, type ShipRecord } from "@/lib/content/ships/types";
import { pathway as pathwayOf, type Pathway } from "@/lib/pathways";
import { pathwayHref } from "@/lib/content/pathways/flag";
import { VOYAGE_PATHWAYS_ON } from "@/lib/content/ships/flags";
import { POLAR_FACTS, POLAR_PATH, STYLES, polarRouteId, daysWords, monthsWords, nightsWords, sailingAsDeparture, shipName, usd, voyageFrom, voyagePath, type PolarVoyage } from "@/lib/content/polar";
import { voyageMap } from "@/lib/content/polar/maps";
import { volumeMark } from "@/lib/volumes";
import { terrainRoute } from "@/components/maps/terrain/routed";
import { readRoute } from "@/lib/content/ships/routes";
import { absoluteUrl } from "@/lib/seo";
import { Band, tonesStyle, type Tones } from "@/components/opening/Tones";
import { FieldIcon } from "@/components/ledger/FieldIcon";

// One landing page per Antarctica21 itinerary (/voyages/polar/<slug>), on the ship template's
// pieces: hero and glance, the five-stop section nav, the answer first, the day by day with the
// house route chart and its moving boat, the ships and what changes between them, departures
// (by month until exact dates are filed, then the shared dates grid), inclusions, the things to
// know before booking, FAQs and TouristTrip schema. Copy is Antarctica21's facts in the house
// voice, kept short: the long-form polar guide is polarcrossings.com.

const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10";
const INDICATIVE = "Day order is indicative; the expedition team sets each day by weather and ice.";

export default function PolarVoyagePage({ v, opening, surface, tones }: { v: PolarVoyage; /** a full opening (VoyageOpening previews) in place of the standard hero */ opening?: React.ReactNode; /** the page surface under a preview opening */ surface?: string; /** Details D: the record palette carried through the details as bands (preview) */ tones?: Tones }) {
  const path = voyagePath(v.slug);
  const t = (x: string) => undash(x);
  const from = voyageFrom(v);
  const plan = `/plan?trip=${encodeURIComponent(`${v.name}, Antarctica21`)}`;
  const flies = v.style !== "sail-both";
  const indicative = v.itinerary.some((d) => d.indicative);
  const map = voyageMap(v);
  const nav: [string, string][] = [["The Voyage", "overview"], ["Day by Day", "itinerary"], ["Ships", "ships"], ["Dates & Rates", "dates"], ["FAQ", "faq-heading"]];
  const crumbs = [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: "Polar Voyages", path: POLAR_PATH }, { name: v.name, path }];
  const primary = VOYAGE_PATHWAYS_ON ? pathwayOf(v.pathway.primary) : undefined;
  const secondary = primary ? v.pathway.secondary.map((p) => pathwayOf(p)).filter((p): p is Pathway => !!p) : [];
  const priceLabel = v.status === "sold-out" ? "Status" : from ? "From" : "Rates";
  const price = v.status === "sold-out" ? "Sold out" : from ? usd(from) : "Ask us";
  const basis = v.status === "sold-out" ? "as Antarctica21 shows it; ask James about the waitlist" : from ? "per person, double cabin, as Antarctica21 shows it" : "ask James for fares";

  // Exact sailings, once filed, run through the shared dates grid (chips coloured by ship).
  const grid = v.sailings.length ? datesData({
    name: v.name, itineraries: v.ships.map((s) => ({ name: shipName(s), nights: v.nights, direction: shipName(s), days: [] })), cabins: [], rateBasis: "per-cruise",
    departures: v.sailings.map((s) => sailingAsDeparture(v, s)),
  } as unknown as ShipRecord, (what, date, full) => `/plan?trip=${encodeURIComponent(what)}&date=${encodeURIComponent(date)}${full ? "&waitlist=1" : ""}`) : null;

  const facts: [string, string][] = [
    ["Trip style", STYLES[v.style].name],
    ["Starts", t(v.start.place)],
    ["Ends", t(v.end.place)],
    ["Flights", t(v.flight)],
    ["Operator", v.operator],
  ];
  const know: [string, string][] = [
    ...(flies ? [["If weather delays the flight", POLAR_FACTS.flight] as [string, string], ["Luggage on the flights", POLAR_FACTS.luggage] as [string, string]] : []),
    ["Insurance", POLAR_FACTS.insurance],
    ["Travelling solo", POLAR_FACTS.single],
    ["Children", t(v.children)],
  ];

  const jsonld = [{
    "@context": "https://schema.org", "@type": "TouristTrip", "@id": absoluteUrl(`${path}#trip`), name: v.name, url: absoluteUrl(path),
    description: t(v.answer), image: v.hero.url, touristType: v.suits.map((s) => s.who),
    itinerary: { "@type": "ItemList", itemListElement: v.itinerary.map((d, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Place", name: t(d.place), geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lng } } })) },
    ...(Object.keys(v.fromByShip).length && v.status !== "sold-out" ? { offers: Object.entries(v.fromByShip).map(([s, p]) => ({ "@type": "Offer", name: `${v.name} aboard ${shipName(s)}`, price: p, priceCurrency: "USD", url: absoluteUrl(`${path}#dates`), seller: { "@type": "TravelAgency", name: "James Wild & Co" } })) } : {}),
    provider: { "@type": "TravelAgency", name: "James Wild & Co", url: absoluteUrl("/") },
  }];

  const knowBlock = (
            <div className="mt-10">
              <h3 className="ledger-display text-[22px] md:text-[24px]">What Should You Know Before You Book?</h3>
              <dl className="mt-4 grid gap-x-8 md:grid-cols-2">
                {know.map(([k, x]) => <div key={k} className="border-t ledger-rule py-3"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-1 text-[15px] leading-relaxed">{x}</dd></div>)}
                {flies && <div className="border-t ledger-rule py-3"><dt className="ledger-eyebrow">Punta Arenas</dt><dd className="mt-1 text-[15px] leading-relaxed">{POLAR_FACTS.hotel}</dd></div>}
              </dl>
            </div>
  );
  const operatorBlock = (
          <section className="mt-12 border ledger-border p-5 md:p-6 grid md:grid-cols-[1fr_auto] gap-4 items-center">
            <p className="text-[15.5px] leading-relaxed"><span className="ledger-eyebrow block mb-1">Operated by Antarctica21</span>Every polar voyage James Wild & Co plans sails with Antarctica21, the Chilean company that says it pioneered the Antarctic air-cruise in 2003.</p>
            <div className="flex flex-wrap gap-x-5">
              <Link href="/partners/antarctica21" className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline">About Antarctica21<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>
              <Link href={POLAR_PATH} className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline">Every polar voyage<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>
            </div>
          </section>
  );
  // Details D (tones): before you book and the operator move out of dates onto the night band, as their own section
  const nightBlock = (
    <section id="before" aria-labelledby="before-heading">
      <div data-sechead><div className="flex items-center gap-3"><FieldIcon name="tree-ring" height={26} className="ledger-crimson" /><p className="ledger-eyebrow">Before you book</p></div><h2 id="before-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2 leading-tight">What Should You Know Before You Book?</h2></div>
      <dl className="mt-6 grid gap-x-10 md:grid-cols-2">
        {know.map(([k, x]) => <div key={k} className="border-t ledger-rule py-4"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-1.5 text-[15.5px] leading-relaxed">{x}</dd></div>)}
        {flies && <div className="border-t ledger-rule py-4"><dt className="ledger-eyebrow">Punta Arenas</dt><dd className="mt-1.5 text-[15.5px] leading-relaxed">{POLAR_FACTS.hotel}</dd></div>}
      </dl>
      {operatorBlock}
    </section>
  );
  // long inclusion lists fold after six (all of it stays in the page for search and answer engines)
  const FOLD = 6;
  const included = (xs: string[], icon: "in" | "out") => {
    const li = (x: string) => icon === "in"
      ? <li key={x} className="flex gap-2 text-[15px]"><Check className="w-4 h-4 mt-0.5 shrink-0 ledger-crimson" strokeWidth={1.75} aria-hidden="true" />{t(x)}</li>
      : <li key={x} className="flex gap-2 text-[15px] ledger-muted"><X className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />{t(x)}</li>;
    if (!tones || xs.length <= FOLD + 1) return <ul className="mt-3 space-y-2">{xs.map(li)}</ul>;
    return (
      <>
        <ul className="mt-3 space-y-2">{xs.slice(0, FOLD).map(li)}</ul>
        <details className="group mt-2">
          <summary className="cursor-pointer list-none ledger-eyebrow inline-flex items-center gap-2 min-h-[44px]">{xs.length - FOLD} more <span className="group-open:rotate-45 transition-transform text-lg leading-none">+</span></summary>
          <ul className="space-y-2">{xs.slice(FOLD).map(li)}</ul>
        </details>
      </>
    );
  };

  return (
    <div className={`theme-sea theme-sea-page${tones ? " house-tones" : ""}`} style={tones ? tonesStyle(tones) : surface ? { background: surface } : undefined}>
      <SiteHeader overlay tuck />
      <main id="main">
        {opening ?? <RecordHero image={v.hero} eyebrow={`Voyages · ${STYLES[v.style].name} · ${v.operator}`} title={v.name} tagline={t(v.tagline)} credit={v.photoCredit}
          glance={<ShipGlance label={priceLabel} price={price} basis={basis} facts={[["Length", `${nightsWords(v)}, ${daysWords(v)}`], ["Route", t(v.route)], ["Ships", v.ships.map(shipName).join(" or ")], ["When", monthsWords(v)]]} cta={{ label: "Plan with James", href: plan }} />} />}
        <ShipNav items={nav} cta="Plan with James" ctaHref={plan} house />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-4"><Breadcrumbs trail={crumbs} touch /></div>
          {primary && <div className="mt-4"><PathwayChips primary={primary} secondary={secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}
          <Overview answer={t(v.answer)} facts={facts} paragraphs={v.overview.map(t)} />
          {v.suits.length > 0 && (
            <ul className="mt-8 grid gap-4 md:grid-cols-2" aria-label={`Who the ${v.name} suits`}>
              {v.suits.map((x) => <li key={x.who} className="border ledger-border p-4"><h3 className="ledger-display text-[18px] leading-snug">{t(x.who)}</h3><p className="mt-1.5 text-[14.5px] leading-relaxed ledger-muted">{t(x.line)}</p></li>)}
            </ul>
          )}
          {v.gallery.length > 0 && <><GalleryMosaic images={v.gallery} title={v.name} /><p className="mt-2 text-[12px] ledger-muted">Photographs: {v.photoCredit}</p></>}

          <Band t={tones} tone="mist">
          <ShipItinerary ship={v.name} map={map} eyebrow="The voyage, day by day" title={`What Happens on the ${v.name}, Day by Day?`}
            intro={[indicative ? INDICATIVE : null, v.itineraryNote ? t(v.itineraryNote) : null, "Fly the voyage in 3D over the ice and mountains, or switch to the itinerary chart, which sails the route as you scroll the log."].filter(Boolean).join(" ")}
            terrain={{ id: `see-${v.slug}-in-3d`, kind: "voyage", ink: volumeMark("voyages"), title: v.name, exaggeration: 1.6,
              routes: [terrainRoute(v.name, readRoute(polarRouteId(v)), v.itinerary.map((d) => ({ day: d.day, name: t(d.place), lat: d.lat, lng: d.lng })))] }}
            itineraries={[{ name: v.name, nights: v.nights, direction: t(v.route), days: v.itinerary.map((d) => ({ ...d, title: t(d.title), place: t(d.place), summary: t(d.summary) })) }]} />
          </Band>

          <section id="ships" className={SEC}>
            <SectionHead eyebrow="The ships" title={v.ships.length > 1 ? "Which Ship Should You Choose?" : `Which Ship Sails the ${v.name}?`} icon={tones ? "mountain-sun" : "wave"}
              intro={v.ships.length > 1 ? `The voyage is the same on either ship; the cabins and the fare are what change. ${t(v.guests)}.` : `${t(v.guests)}.`} />
            <ul className={`mt-6 grid gap-5 sm:grid-cols-2 ${v.ships.length > 1 ? "" : "lg:grid-cols-3"}`}>
              {v.ships.map((slug) => {
                const c = shipCard(registryShip(slug)!);
                if (!c) return null;
                const own = v.fromByShip[slug] && v.status !== "sold-out" ? { label: "This voyage", amount: usd(v.fromByShip[slug]) } : v.status === "sold-out" ? { label: "Status", amount: "Sold out" } : { label: "Rates", amount: "Ask us" };
                return <li key={slug}><ShipCard c={{ ...c, price: own, facts: c.facts.filter(([k]) => k === "Guests") }} /></li>;
              })}
            </ul>
            <p className="mt-3 text-[12px] ledger-muted">Photographs: Antarctica21. &ldquo;This voyage&rdquo; is the lowest fare per person, double cabin, Antarctica21 shows for this itinerary on that ship.</p>
          </section>

          <Band t={tones} tone="paper">
          <section id="dates" className={SEC}>
            <SectionHead eyebrow="Dates & rates" title={`When Does the ${v.name} Sail, and What Does It Cost?`} icon="sun"
              intro={v.status === "not-open" ? "Antarctica21 shows this voyage as not yet open for booking; the months and fares below are as it publishes them." : "Antarctica21 publishes the months, the number of sailings and the fares from; exact dates and fares by cabin come from its live booking tool, and James confirms them when you ask."} />
            {grid && <DatesGrid ship={v.name} data={grid} note="Fares per person, two sharing, by cabin as Antarctica21 confirms them." />}
            {v.departures.length > 0
              ? <MonthDepartures groups={v.departures} priceName={shipName} planHref={(g) => `${plan}&date=${encodeURIComponent(g.months[0] ?? g.season ?? "")}${g.status === "sold-out" ? "&waitlist=1" : ""}`} note="Fares are per person, double cabin, in US dollars, as Antarctica21 shows them." />
              : !grid && <NoDates name={`The ${v.name}`} planHref={plan} />}
            <div className="mt-10 grid md:grid-cols-2 gap-8">
              <div><p className="ledger-eyebrow ledger-crimson">Included</p>{included(v.inclusions, "in")}</div>
              {v.exclusions.length > 0 && <div><p className="ledger-eyebrow">Not included</p>{included(v.exclusions, "out")}</div>}
            </div>
            {v.optional.length > 0 && (
              <div className="mt-8">
                <p className="ledger-eyebrow">Optional, priced separately</p>
                <ul className="mt-3 grid gap-3 md:grid-cols-3">{v.optional.map((o) => <li key={o.name} className="border ledger-border p-4"><h3 className="ledger-display text-[18px]">{o.name}</h3>{o.note && <p className="mt-1 text-[14px] ledger-muted leading-relaxed">{t(o.note)}</p>}</li>)}</ul>
              </div>
            )}
            {!tones && knowBlock}
          </section>

          </Band>
          {tones && <Band t={tones} tone="night">{nightBlock}</Band>}

          <OfferPanel offers={offersFor(v.slug)} volume="voyages" title="Antarctica21 offers on this voyage" />

          {!tones && operatorBlock}

          <FaqBlock faqs={v.faqs.map(([q, a]) => ({ q: t(q), a: t(a) }))} title={`What Else Should You Know About the ${v.name}?`} icon={tones ? "frond" : undefined} />
        </div>
      </main>
      <RecordActionBar price={from && v.status !== "sold-out" ? usd(from) : undefined} basis="pp, double" cta="Plan with James" href={plan} house />
      <JsonLd data={jsonld} />
    </div>
  );
}
