import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import OfferPanel from "@/components/ledger/OfferPanel";
import { SectionHead, WhyChose } from "@/components/record/Sections";
import { GalleryMosaic } from "@/components/record/Frame";
import { offersFor } from "@/lib/content/offers/offers";
import { absoluteUrl } from "@/lib/seo";
import { cabinFrom, cruiseOnly, factOf, nightsLabel, packages, priceLine, pricedCabins, publicNote, routeOf, undash, type ShipRecord } from "@/lib/content/ships/types";
import { shipPath, waterFor, type ShipEntry } from "@/lib/content/ships";
import ShipTemplate from "./ShipTemplate";
import CabinsDeck from "./CabinsDeck";
import DatesRates from "./DatesRates";
import NoDates from "./NoDates";
import ShipGlance from "./ShipGlance";
import { NILE_CHART, readRoute, shipMapHtml, shipRouteId } from "@/lib/content/ships/routes";

// A ship filed as data (lib/content/ships/<waters>/<slug>.json) on the shared
// template: the A&K Sanctuary Nile fleet first. Every photograph is credited
// to its owner, every price is derived from the published departures.
const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[212px]";

export default function RecordShip({ entry, sisters }: { entry: ShipEntry; sisters: ShipEntry[] }) {
  const s = entry.data as ShipRecord;
  const w = waterFor(entry)!;
  const path = shipPath(s.slug);
  const credit = entry.credit;
  const price = priceLine(s);
  const types = pricedCabins(s);
  const cruise = cruiseOnly(s);
  const journeys = packages(s);
  const offers = entry.offerRefs.flatMap((r) => offersFor(r));
  const guests = factOf(s, /guest/i);
  const ages = factOf(s, /child|age/i);
  const route = routeOf(s);
  const plan = `/plan?trip=${encodeURIComponent(s.name)}`;
  const t = (x: string) => undash(x);
  // The house route chart: one route file per itinerary with days, in tab order.
  const routes = s.itineraries.filter((i) => i.days.length).map((i) => readRoute(shipRouteId(s, i)));
  const map = routes.length && routes.every(Boolean) ? { html: shipMapHtml({ id: `jwmap-${s.slug}`, routes: routes.map((r) => r!), destination: "nile", chart: NILE_CHART, title: `Route map of ${s.name} on the Nile` }) } : null;

  const nav: [string, string][] = [["Overview", "overview"], ["Itinerary", "itinerary"], ["Cabins", "cabins"], ...(s.deckPlans.length ? [["Deck plan", "deck-plan"] as [string, string]] : []), ["Dates & rates", "dates"] as [string, string], ...(offers.length ? [["Offers", "offers"] as [string, string]] : []), ["FAQ", "faq-heading"]];

  const trips = s.itineraries.map((it) => {
    const deps = cruise.filter((d) => d.itinerary === it.name || d.itinerary.includes(it.name) || /either/i.test(d.direction));
    const low = (d: (typeof deps)[number]) => Math.min(...Object.values(d.prices).filter((p): p is number => typeof p === "number" && p > 0));
    return {
      "@type": "TouristTrip",
      "@id": absoluteUrl(`${path}#${it.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`),
      name: `${it.name} aboard ${s.name}`,
      description: `${it.nights} nights on the ${s.waters}, ${it.direction}, aboard ${s.name}, ${s.brandLine}.`,
      touristType: s.suits.map((x) => x.who),
      itinerary: { "@type": "ItemList", itemListElement: it.days.map((d, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Place", name: d.place, geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lng } } })) },
      // Season bands, never invented sailing dates: each fare is valid from the band's start to its end.
      ...(deps.length ? { offers: deps.filter((d) => Number.isFinite(low(d))).map((d) => ({ "@type": "Offer", name: d.season ? undash(d.season) : undefined, price: low(d), priceCurrency: "USD", url: absoluteUrl(`${path}#dates`), validFrom: d.date, ...(d.dateTo ? { validThrough: d.dateTo } : {}), seller: { "@type": "TravelAgency", name: "James Wild & Co" } })) } : {}),
      provider: { "@type": "TravelAgency", name: "James Wild & Co", url: absoluteUrl("/") },
    };
  });
  const jsonld = [
    { "@context": "https://schema.org", "@type": "ItemList", "@id": absoluteUrl(`${path}#voyages`), name: `${s.name} voyages`, itemListElement: trips.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Home", "/"], ["Voyages", "/voyages"], [w.name, w.path], [s.name, path]].map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: absoluteUrl(p) })) },
  ];

  return (
    <ShipTemplate
      ship={{
        name: s.name,
        path,
        hero: s.hero,
        heroCredit: credit,
        eyebrow: `Wild & Co Voyages · ${s.brandLine} · ${s.waters}, ${s.country}`,
        tagline: t(s.tagline),
        glance: <ShipGlance label={price.label} price={price.amount} basis={price.basis} facts={[["Route", route], ["Nights", nightsLabel(s)], ["Guests", guests ?? "To confirm"], ["Ages", ages ?? "Ask us"]]} cta={{ label: "Plan with James", href: plan }} />,
        nav,
        cta: { label: "Plan with James", href: plan, house: true },
        // Each fact once: route, nights, guests and ages live in the glance bar, cabins in Cabins.
        overview: { answer: t(s.answer), facts: s.facts.filter(([k]) => !/route|guest|child|age|cabin|suite/i.test(k)).map(([k, v]) => [k, t(v)] as [string, string]), paragraphs: s.overview.map(t) },
        itinerary: { map, itineraries: s.itineraries.map((i) => ({ ...i, days: i.days.map((d) => ({ ...d, title: t(d.title), summary: t(d.summary) })) })), eyebrow: "The voyage, day by day", title: `Where Does ${s.name} Sail, Day by Day?`, intro: s.itineraries.length > 1 ? "Pick a direction, then scroll the log: the chart sails the river day by day as you read." : "Scroll the log and the chart sails the river day by day as you read." },
        film: { film: s.film, poster: s.gallery[1] ?? s.hero, credit },
        faqs: s.faqs.map(([q, a]) => [t(q), t(a)] as [string, string]),
        faqTitle: `What Else Should You Know About ${s.name}?`,
        host: { key: `voyage:${s.slug}`, name: s.name },
        action: { price: price.kind === "cruise" ? price.amount : undefined, basis: "pp, cruise", cta: "Plan with James", href: plan, house: true },
        crumbs: [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: w.name, path: w.path }, { name: s.name, path }],
        jsonld,
      }}
      lead={<>
        <WhyChose eyebrow="Why we chose her" title="Why Choose Her, and Who Is She For?" blocks={s.why.map((b) => ({ body: t(b) }))}
          status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">{s.status === "sailing" ? "Sailing" : t(s.status)}</span> · {s.operator}, {s.brandLine}</p>} />
        {s.suits.length > 0 && (
          <ul id="suits" className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4" aria-label={`Who ${s.name} suits`}>
            {s.suits.map((x) => <li key={x.who} className="border ledger-border p-4"><h3 className="ledger-display text-[18px] leading-snug">{t(x.who)}</h3><p className="mt-1.5 text-[14.5px] leading-relaxed ledger-muted">{t(x.line)}</p></li>)}
          </ul>
        )}
        {s.gallery.length > 0 && <><GalleryMosaic images={s.gallery} title={s.name} /><p className="mt-2 text-[12px] ledger-muted">Photographs: {credit}</p></>}
      </>}
      body={<>
        <CabinsDeck
          cabins={s.cabins.map((c) => ({ ...c, features: c.features.map(t), from: cabinFrom(s, c.type) }))}
          decks={s.deckPlans}
          credit={credit}
          basis="per person, double"
          cabinTitle="Cabins"
          deckTitle="Deck plan"
          heads={{
            cabins: <SectionHead eyebrow="Cabins & suites" title={`Which Cabin Should You Choose on ${s.name}?`} icon="tree-ring" intro={`${s.cabins.reduce((a, c) => a + (c.count ?? 0), 0) || s.cabins.length} cabins and suites${guests ? ` for ${guests} guests` : ""}. ${cruise.length ? "Fares are the lowest published cruise fare per person for each cabin across the seasons below." : "Rates are on request: A&K publishes no cruise-only fare for her."}`} />,
            decks: <SectionHead eyebrow="Deck plan" title="Where Is Each Cabin on the Ship?" icon="wave" />,
          }}
        />
        {s.departures.length === 0 && (
          <section id="dates" className={SEC}>
            <SectionHead eyebrow="Dates & rates" title={`When Does ${s.name} Sail Next?`} icon="sun" />
            <NoDates name={s.name} planHref={plan} />
          </section>
        )}
        {s.departures.length > 0 && (
          <section id="dates" className={SEC}>
            <SectionHead eyebrow="Dates & rates" title={`When Does ${s.name} Sail, and What Does It Cost?`} icon="sun"
              intro={cruise.length ? (cruise.some((d) => d.dateTo) ? "Cruise fares by season as Abercrombie & Kent publishes them, per person for each cabin type." : "Every published departure by month, with the fare per person for each cabin type.") : `Abercrombie & Kent publishes no cruise-only fare for ${s.name}: a private charter is priced on enquiry, and her cabins are also sold inside A&K land and cruise journeys, listed below with their full-journey fares.`} />
            <DatesRates ship={s.name} types={types} cabins={s.cabins.map((c) => c.type)} departures={cruise} title={journeys.length ? "Cruise fares by season" : undefined} note={publicNote(s.pricesNote)} />
            <DatesRates ship={s.name} types={types} cabins={s.cabins.map((c) => c.type)} departures={journeys} title={`Aboard ${s.name} inside A&K journeys`} note={cruise.length ? undefined : publicNote(s.pricesNote)} />
            {(s.inclusions.length > 0 || (s.exclusions?.length ?? 0) > 0) && (
              <div className="mt-10 grid md:grid-cols-2 gap-8">
                {s.inclusions.length > 0 && <div><p className="ledger-eyebrow ledger-crimson">Included</p><ul className="mt-3 space-y-2">{s.inclusions.map((x) => <li key={x} className="flex gap-2 text-[15px]"><Check className="w-4 h-4 mt-0.5 shrink-0 ledger-crimson" strokeWidth={1.75} aria-hidden="true" />{t(x)}</li>)}</ul></div>}
                {(s.exclusions?.length ?? 0) > 0 && <div><p className="ledger-eyebrow">Not included</p><ul className="mt-3 space-y-2">{s.exclusions!.map((x) => <li key={x} className="flex gap-2 text-[15px] ledger-muted"><X className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />{t(x)}</li>)}</ul></div>}
              </div>
            )}
          </section>
        )}
        <OfferPanel offers={offers} volume="voyages" title="Offers aboard" />
        {sisters.length > 0 && (
          <section id="sisters" className={SEC}>
            <SectionHead eyebrow={`${s.brandLine.replace(/^an?\s+/i, "")} fleet · ${s.waters}`} title={`Which Other Ships Sail the ${s.waters} with ${s.operator}?`} />
            <ul className="mt-7 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 md:mx-0 md:px-0">
              {sisters.map((e) => {
                const x = e.data as ShipRecord;
                const f = priceLine(x);
                return (
                  <li key={x.slug} className="snap-start shrink-0 w-[78%] sm:w-[44%] lg:w-[23.5%]">
                    <Link href={shipPath(x.slug)} className="group block h-full ledger-paper border ledger-border hover:border-crimson/60">
                      <div className="relative aspect-[4/3] border-b ledger-rule bg-paper-card overflow-hidden"><Image src={x.hero.url} alt={x.hero.alt} fill sizes="(min-width: 1024px) 270px, 78vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" /></div>
                      <div className="p-4">
                        <p className="ledger-eyebrow ledger-crimson">{x.type === "dahabiya" ? "Dahabiya" : "Riverboat"} · {nightsLabel(x)}</p>
                        <h3 className="ledger-display text-lg mt-1 leading-snug">{x.name}</h3>
                        <p className="mt-1.5 text-[14px] ledger-muted leading-snug">{factOf(x, /guest/i) ? `${factOf(x, /guest/i)} guests` : t(x.tagline)} · {f.kind === "cruise" ? `from ${f.amount}` : f.kind === "journey" ? `A&K journeys from ${f.amount}` : f.kind === "tba" ? "new dates to be announced" : "rates on request"}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-1 text-[12px] ledger-muted">Photographs: {credit}</p>
          </section>
        )}
      </>}
    />
  );
}
