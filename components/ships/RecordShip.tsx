import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import OfferPanel from "@/components/ledger/OfferPanel";
import { SectionHead, WhyChose } from "@/components/record/Sections";
import { GalleryMosaic } from "@/components/record/Frame";
import { offersFor } from "@/lib/content/offers/offers";
import { absoluteUrl } from "@/lib/seo";
import { filmSchema, type ShortFilm } from "@/lib/content/films";
import { cabinFrom, cruiseOnly, factOf, nightsLabel, packages, priceLine, pricedCabins, publicNote, rateBasisOf, routeOf, undash, type ShipRecord } from "@/lib/content/ships/types";
import { shipPath, waterFor, type ShipEntry } from "@/lib/content/ships";
import { shipMap } from "@/lib/content/ships/maps";
import ShipTemplate from "./ShipTemplate";
import CabinsDeck from "./CabinsDeck";
import DatesRates from "./DatesRates";
import DatesGrid from "./DatesGrid";
import { datesData } from "@/lib/content/ships/fares";
import NoDates from "./NoDates";
import MonthDepartures from "./MonthDepartures";
import ShipGlance from "./ShipGlance";

// Every ship on the one shared template (voyages plan, 1 Nov 2026): Aliikai and the
// A&K Sanctuary Nile fleet print the same sections, headings, nav and CTA. A ship with
// more to say (Aliikai's charter, first-time route and founder story) passes it in
// through `extra`, which slots into the same frame. Every price is derived from the
// published departures; every photograph is credited to its owner where one is filed.
const kindLabel = (k: string) => k.charAt(0).toUpperCase() + k.slice(1);
const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[212px]";

export type ShipExtra = {
  /** A vessel's own short film playing as the hero; the film slot below then steps aside. */
  heroFilm?: ShortFilm;
  stamp?: ReactNode;
  eyebrow?: string;
  top?: ReactNode;
  lead?: ReactNode;
  body?: ReactNode;
  after?: ReactNode;
  jsonld?: object[];
};

export default function RecordShip({ entry, sisters, extra = {} }: { entry: ShipEntry; sisters: ShipEntry[]; extra?: ShipExtra }) {
  const s = entry.data as ShipRecord;
  const w = waterFor(entry);
  const path = shipPath(s.slug);
  const credit = entry.credit;
  const price = priceLine(s);
  const basis = rateBasisOf(s);
  const types = pricedCabins(s);
  const cruise = cruiseOnly(s);
  const journeys = packages(s);
  const offers = entry.offerRefs.flatMap((r) => offersFor(r));
  const guests = s.glance?.guests ?? factOf(s, /guest/i);
  const ages = s.glance?.ages ?? factOf(s, /child|age/i);
  const route = s.glance?.route ?? routeOf(s);
  const plan = `/plan?trip=${encodeURIComponent(s.name)}`;
  const planFor = (what: string, date: string, full: boolean) => `/plan?trip=${encodeURIComponent(what)}&date=${encodeURIComponent(date)}${full ? "&waitlist=1" : ""}`;
  const t = (x: string) => undash(x);
  const map = shipMap(entry);
  const glanceBasis = basis === "per-night" && price.kind === "cruise" ? "per person for the voyage, two sharing, plus tax" : price.basis;

  // Five stops (James, 2 Nov 2026): the overview and why-we-chose-her read as The Ship; cabins and
  // the deck plan share one stop; offers and a ship's own extras sit inside the nearest section.
  const nav: [string, string][] = [["The Ship", "overview"], ["Itineraries", "itinerary"], [s.deckPlans.length ? "Cabins & Deck Plan" : "Cabins", "cabins"], ["Dates & Rates", "dates"], ["FAQ", "faq-heading"]];
  const crumbs = [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, ...(w ? [{ name: w.name, path: w.path }] : []), { name: s.name, path }];

  const trips = s.itineraries.filter((it) => it.days.length).map((it) => {
    const deps = cruise.filter((d) => d.itinerary === it.name || d.itinerary.includes(it.name) || /either/i.test(d.direction));
    const low = (d: (typeof deps)[number]) => Math.min(...Object.values(d.prices).filter((p): p is number => typeof p === "number" && p > 0));
    return {
      "@type": "TouristTrip",
      "@id": absoluteUrl(`${path}#${it.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`),
      name: `${it.name} aboard ${s.name}`,
      description: t(`${it.nights} nights in ${s.waters}, ${it.direction}, aboard ${s.name}, ${s.brandLine}.`),
      touristType: s.suits.map((x) => x.who),
      itinerary: { "@type": "ItemList", itemListElement: it.days.map((d, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Place", name: d.place, geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lng } } })) },
      // Season bands, never invented sailing dates: each fare is valid from the band's start to its end.
      ...(deps.length ? { offers: deps.filter((d) => Number.isFinite(low(d))).map((d) => ({ "@type": "Offer", name: d.season ? undash(d.season) : undefined, price: low(d), priceCurrency: "USD", url: absoluteUrl(`${path}#dates`), validFrom: d.date, ...(d.dateTo ? { validThrough: d.dateTo } : {}), seller: { "@type": "TravelAgency", name: "James Wild & Co" } })) } : {}),
      provider: { "@type": "TravelAgency", name: "James Wild & Co", url: absoluteUrl("/") },
    };
  });
  const jsonld = [
    ...(trips.length ? [{ "@context": "https://schema.org", "@type": "ItemList", "@id": absoluteUrl(`${path}#itineraries`), name: `${s.name} itineraries`, itemListElement: trips.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })) }] : []),
    ...(extra.heroFilm ? [filmSchema(extra.heroFilm, absoluteUrl(path))] : []),
    ...(extra.jsonld ?? []),
  ];

  // Counted only when every cabin type publishes its count; otherwise the number of cabin types.
  const counted = s.cabins.every((c) => typeof c.count === "number");
  const cabinCount = counted ? s.cabins.reduce((a, c) => a + (c.count ?? 0), 0) : s.cabins.length;
  const cabinWord = counted ? "cabins and suites" : `cabin ${s.cabins.length === 1 ? "type" : "types"}`;
  const anyCabinFrom = s.cabins.some((c) => cabinFrom(s, c.type) !== null);
  // Some operators publish one lowest fare, not a fare per cabin (Delfin III, Anakonda).
  const oneFare = cruise.length > 0 && cruise.every((d) => Object.keys(d.prices).every((k) => !s.cabins.some((c) => k === c.type || k.startsWith(`${c.type} (`))));
  const cabinIntro = basis === "per-night"
    ? `${cabinCount} cabins${guests ? ` for ${guests} guests` : ""}. Rates are published per person per night, double occupancy, plus tax.`
    : `${cabinCount} ${cabinWord}${guests ? ` for ${guests.replace(/\s*\(.*?\)/, "").replace(/^Up to/, "up to")} guests` : ""}. ${anyCabinFrom ? "Fares are the lowest published cruise fare per person for each cabin across the seasons below." : cruise.length ? `${s.operator} publishes no fare by cabin; ask us for yours.` : s.monthly?.length ? `Fares from, voyage by voyage, are under Dates & rates; ${s.operator} quotes fares by cabin in its booking tool, and James confirms yours.` : journeys.length ? `Rates: ask us. ${s.operator} publishes no cruise-only fare for her.` : `Rates: ask us. ${s.operator} publishes no fares for her.`}`;
  const datesIntro = basis === "per-night"
    ? "Every published sailing by month, with its length and the fare per person for the voyage."
    : oneFare ? "Only the lowest published fare is shown below, per person, two sharing; James confirms the fare for your cabin and dates."
    : cruise.length ? (cruise.some((d) => d.dateTo) ? `Cruise fares by season as ${s.operator} publishes them, per person for each cabin type.` : "Every published departure by month, with the fare per person for each cabin type.")
      : `${s.operator} publishes no cruise-only fare for ${s.name}: a private charter is priced on enquiry, and her cabins are also sold inside ${s.operator} land and cruise journeys, listed below with their full-journey fares.`;

  return (
    <ShipTemplate
      ship={{
        name: s.name,
        path,
        hero: s.hero,
        heroFilm: extra.heroFilm,
        heroCredit: credit,
        pathway: s.pathway,
        eyebrow: extra.eyebrow ?? t(`Wild & Co Voyages · ${s.brandLine} · ${s.waters}, ${s.country}`),
        tagline: t(s.tagline),
        stamp: extra.stamp,
        glance: <ShipGlance compact={!!extra.heroFilm} label={price.label} price={price.amount} basis={glanceBasis} facts={[["Route", t(route)], ["Nights", nightsLabel(s)], ["Guests", guests ?? "To confirm"], ["Ages", ages ? t(ages) : "Ask us"]]} cta={{ label: "Plan with James", href: plan }} />,
        nav,
        cta: { label: "Plan with James", href: plan, house: true },
        // Each fact once: route, nights, guests and ages live in the glance bar, cabins in Cabins.
        overview: { quote: s.quote ? t(s.quote) : undefined, answer: t(s.answer), facts: s.facts.filter(([k]) => !/route|guest|child|age|cabin|suite/i.test(k)).map(([k, v]) => [k, t(v)] as [string, string]), paragraphs: s.overview.map(t) },
        itinerary: { map, itineraries: s.itineraries.map((i) => ({ ...i, name: t(i.name), direction: t(i.direction), days: i.days.map((d) => ({ ...d, title: t(d.title), place: t(d.place), summary: t(d.summary) })) })), eyebrow: "The voyage, day by day", title: `Where Does ${s.name} Sail, Day by Day?`, intro: s.itineraries.filter((i) => i.days.length).length > 1 ? "Pick a direction, then scroll the log: the chart sails the route day by day as you read." : "Scroll the log and the chart sails the route day by day as you read." },
        film: extra.heroFilm ? null : { film: s.film, poster: s.gallery[1] ?? s.hero, credit },
        faqs: s.faqs.map(([q, a]) => [t(q), t(a)] as [string, string]),
        faqTitle: `What Else Should You Know About ${s.name}?`,
        host: { key: `voyage:${s.slug}`, name: s.name },
        action: { price: price.kind === "cruise" ? price.amount : undefined, basis: basis === "per-night" ? "pp, voyage" : "pp, cruise", cta: "Plan with James", href: plan, house: true },
        crumbs,
        jsonld,
      }}
      lead={<>
        {extra.top}
        <WhyChose eyebrow="Why we chose her" title="Why Choose Her, and Who Is She For?" blocks={s.why.map((b) => ({ body: t(b) }))}
          status={<p className="text-[14px] ledger-muted">{s.proofLine ? <><span className="ledger-eyebrow ledger-crimson">{t(s.proofLine).split(" · ")[0]}</span> · {t(s.proofLine).split(" · ").slice(1).join(" · ")}</> : <><span className="ledger-eyebrow ledger-crimson">{s.status === "sailing" ? "Sailing" : t(s.status)}</span> · {s.operator}{s.brandLine && s.brandLine !== s.operator ? `, ${s.brandLine}` : ""}</>}</p>} />
        {s.suits.length > 0 && (
          <ul id="suits" className={`mt-6 grid gap-4 md:grid-cols-2 ${s.suits.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`} aria-label={`Who ${s.name} suits`}>
            {s.suits.map((x) => (
              <li key={x.who} className="border ledger-border p-4 flex flex-col">
                <h3 className="ledger-display text-[18px] leading-snug">{t(x.who)}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed ledger-muted flex-1">{t(x.line)}</p>
                {x.href && x.voyage && <Link href={x.href} className="mt-3 self-start inline-flex items-center min-h-[44px] ledger-btn-ghost">{t(x.voyage)} →</Link>}
              </li>
            ))}
          </ul>
        )}
        {s.gallery.length > 0 && <><GalleryMosaic images={s.gallery} title={s.name} />{credit && <p className="mt-2 text-[12px] ledger-muted">Photographs: {credit}</p>}</>}
        {extra.lead}
      </>}
      body={<>
        <CabinsDeck
          cabins={s.cabins.map((c) => ({ ...c, type: c.type, features: c.features.map(t), from: cabinFrom(s, c.type) }))}
          decks={s.deckPlans}
          credit={credit}
          basis={basis === "per-night" ? "per person, per night" : "per person, double"}
          cabinTitle="Cabins"
          deckTitle="Deck plan"
          heads={{
            cabins: <SectionHead eyebrow="Cabins & suites" title={`Which Cabin Should You Choose on ${s.name}?`} icon="tree-ring" intro={cabinIntro} />,
            decks: <SectionHead eyebrow="Deck plan" title="Where Is Each Cabin on the Ship?" icon="wave" />,
          }}
        />
        {extra.body}
        {s.departures.length === 0 && (s.monthly?.length ?? 0) > 0 && (
          <section id="dates" className={SEC}>
            <SectionHead eyebrow="Dates & rates" title={`When Does ${s.name} Sail, and What Does It Cost?`} icon="sun" intro={`${s.operator} publishes the months, the number of sailings and the fares from for each voyage; exact dates and fares by cabin come from its live booking tool, and James confirms them when you ask.`} />
            <MonthDepartures groups={s.monthly!} showItinerary priceName={() => s.name} planHref={(g) => `${planFor(`${g.itinerary ?? s.name}, ${s.name}`, g.months[0] ?? g.season ?? "", g.status === "sold-out")}`} note={publicNote(s.pricesNote)} />
            {(s.inclusions.length > 0 || (s.exclusions?.length ?? 0) > 0) && (
              <div className="mt-10 grid md:grid-cols-2 gap-8">
                {s.inclusions.length > 0 && <div><p className="ledger-eyebrow ledger-crimson">Included</p><ul className="mt-3 space-y-2">{s.inclusions.map((x) => <li key={x} className="flex gap-2 text-[15px]"><Check className="w-4 h-4 mt-0.5 shrink-0 ledger-crimson" strokeWidth={1.75} aria-hidden="true" />{t(x)}</li>)}</ul></div>}
                {(s.exclusions?.length ?? 0) > 0 && <div><p className="ledger-eyebrow">Not included</p><ul className="mt-3 space-y-2">{s.exclusions!.map((x) => <li key={x} className="flex gap-2 text-[15px] ledger-muted"><X className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />{t(x)}</li>)}</ul></div>}
              </div>
            )}
          </section>
        )}
        {s.departures.length === 0 && !(s.monthly?.length) && (
          <section id="dates" className={SEC}>
            <SectionHead eyebrow="Dates & rates" title={s.datesPublished === false ? `When Does ${s.name} Sail, and What Does It Cost?` : `When Does ${s.name} Sail Next?`} icon="sun" />
            <NoDates name={s.name} planHref={plan} unpublished={s.datesPublished === false} operator={s.operator} />
          </section>
        )}
        {s.departures.length > 0 && (
          <section id="dates" className={SEC}>
            <SectionHead eyebrow="Dates & rates" title={`When Does ${s.name} Sail, and What Does It Cost?`} icon="sun" intro={datesIntro} />
            {s.fleetSchedule && <p className="mt-5 border-l-2 border-crimson pl-4 text-[15px] max-w-3xl"><span className="ledger-eyebrow block mb-1">The {s.operator} fleet schedule</span>{t(s.fleetSchedule)}</p>}
            {cruise.length > 0 && <>
              {(journeys.length > 0 || s.fleetSchedule) && <h3 className="mt-8 ledger-display text-[22px] md:text-[24px]">{journeys.length ? "Cruise fares by season" : `${s.operator} departures, fleet wide`}</h3>}
              <DatesGrid ship={s.name} data={datesData(s, planFor)} note={publicNote(s.pricesNote)} />
            </>}
            <DatesRates ship={s.name} types={types} cabins={s.cabins.map((c) => c.type)} departures={journeys} basis={basis} title={`Aboard ${s.name} inside ${s.operator} journeys`} note={cruise.length ? undefined : publicNote(s.pricesNote)} />
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
            <SectionHead eyebrow={t(`${s.brandLine.replace(/^an?\s+/i, "")} fleet · ${s.waters}`)} title={`Which Other Ships Sail the ${s.waters} with ${s.operator}?`} />
            <ul className="mt-7 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 md:mx-0 md:px-0">
              {sisters.map((e) => {
                const x = e.data as ShipRecord;
                const f = priceLine(x);
                return (
                  <li key={x.slug} className="snap-start shrink-0 w-[78%] sm:w-[44%] lg:w-[23.5%]">
                    <Link href={shipPath(x.slug)} className="group block h-full ledger-paper border ledger-border hover:border-crimson/60">
                      <div className="relative aspect-[4/3] border-b ledger-rule bg-paper-card overflow-hidden"><Image src={x.hero.url} alt={x.hero.alt} fill sizes="(min-width: 1024px) 270px, 78vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" /></div>
                      <div className="p-4">
                        <p className="ledger-eyebrow ledger-crimson">{kindLabel(x.type)} · {nightsLabel(x)}</p>
                        <h3 className="ledger-display text-lg mt-1 leading-snug">{x.name}</h3>
                        <p className="mt-1.5 text-[14px] ledger-muted leading-snug">{factOf(x, /guest/i) ? `${factOf(x, /guest/i)} guests` : t(x.tagline)} · {f.kind === "cruise" ? `sister ship from ${f.amount}` : f.kind === "journey" ? `${x.operator} journeys from ${f.amount}` : f.kind === "tba" ? "dates and fares: ask us" : "rates on request"}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {credit && <p className="mt-1 text-[12px] ledger-muted">Photographs: {credit}</p>}
          </section>
        )}
      </>}
      after={extra.after}
    />
  );
}
