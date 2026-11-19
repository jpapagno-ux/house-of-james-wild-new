import Image from "next/image";
import IggiPanel from "@/components/iggi/IggiPanel";
import { IGGI_ON } from "@/lib/iggi/flag";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { PlanClose } from "@/components/about/Parts";
import { IncludedLists, SectionHead } from "@/components/record/Sections";
import { RecordActionBar } from "@/components/record/Frame";
import ShipItinerary from "@/components/ships/ShipItinerary";
import { shipBySlug, shipPath } from "@/lib/content/ships";
import { readRoute, shipMapHtml } from "@/lib/content/ships/routes";
import { dayLabel, type ShipRecord } from "@/lib/content/ships/types";
import { SEADREAM_HUB, SEADREAM_READ, neighbours, sameVoyage, seadreamPath, type OperatorVoyage } from "@/lib/content/ships/seadream";
import { isPast } from "@/lib/dates";
import { absoluteUrl } from "@/lib/seo";
import { terrainRegion } from "@/components/maps/terrain/flag";
import { terrainRoute } from "@/components/maps/terrain/routed";
import { volumeMark } from "@/lib/volumes";

// One published voyage on its own page (/voyages/ships/<yacht>/<voyage>; James, 16 Nov 2026: "itineraries one by one").
// The answer first, then the day by day with the house chart, the fare of every stateroom and suite as the operator
// publishes it, what the fare includes, the terms, and the ways on: the same itinerary on other dates, the sailings
// either side of it aboard the same yacht (they join back to back), her yacht page and the partner page.
// Facts and fares come from the voyage record (scripts/partners/seadream-build.mjs); no outbound links.

const SEC = "mt-14 md:mt-20 border-t ledger-rule pt-8 md:pt-10";
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}` : xs[0] ?? "");
const span = (v: Pick<OperatorVoyage, "date" | "dateTo">) => (v.date.slice(0, 4) === v.dateTo.slice(0, 4) ? `${dayLabel(v.date).slice(0, -5)} to ${dayLabel(v.dateTo)}` : `${dayLabel(v.date)} to ${dayLabel(v.dateTo)}`);

function VoyageLink({ v, label }: { v: OperatorVoyage; label?: string }) {
  return (
    <Link href={seadreamPath(v)} className="group block border ledger-border p-4 hover:border-crimson/60 h-full">
      {label && <span className="ledger-eyebrow block">{label}</span>}
      <span className="ledger-display text-[18px] leading-snug block mt-0.5">{v.title}</span>
      <span className="block mt-1 text-[13.5px] ledger-muted">{span(v)} · {v.nights} nights · {v.direction}</span>
      <span className="block mt-1 text-[13.5px]">{v.waitlisted ? "Waitlist" : v.from$ ? `From ${usd(v.from$)} per person` : "Ask us for fares"}</span>
    </Link>
  );
}

export default function OperatorVoyagePage({ v }: { v: OperatorVoyage }) {
  const path = seadreamPath(v);
  const e = shipBySlug(v.ship);
  const ship = e?.data as ShipRecord | undefined;
  const sailed = isPast(v.dateTo);
  const route = v.route ? readRoute(v.route) : null;
  const map = route ? { html: shipMapHtml({ id: `jwmap-${v.slug}`, routes: [route], destination: v.region, title: `Route map of ${v.title} aboard ${v.shipName}`, kicker: "THE VOYAGE · BY YACHT" }) } : null;
  const fares = Object.entries(v.prices).sort((a, b) => a[1] - b[1]);
  const seaDays = v.days.filter((d) => d.title === "At sea").length;
  const plan = `/plan?trip=${encodeURIComponent(`${v.title}, ${v.shipName}`)}&date=${encodeURIComponent(`${v.date} to ${v.dateTo}`)}${v.waitlisted ? "&waitlist=1" : ""}`;
  const others = sameVoyage(v);
  const { before, after } = neighbours(v);
  const trail = [{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: "By Yacht", path: "/voyages/yachts" }, { name: v.shipName, path: shipPath(v.ship) }, { name: v.title, path }];
  const answer = `${v.title} is a ${v.nights}-night voyage aboard ${v.shipName}, SeaDream Yacht Club's ${ship?.facts.find(([k]) => k === "Guests")?.[1] ? `${ship.facts.find(([k]) => k === "Guests")![1].split(",")[0]} guest ` : ""}yacht, ${v.from === v.to ? `sailing round trip from ${v.from}` : `from ${v.from} to ${v.to}`} on ${dayLabel(v.date)}. She calls at ${list(v.calls.filter((c) => c !== v.from.split(",")[0]).slice(0, 8)) || list(v.calls)}${seaDays ? `, with ${seaDays} ${seaDays === 1 ? "day" : "days"} at sea` : ""}. ${v.waitlisted ? "SeaDream shows this sailing as waitlisted; James can add you to the list." : fares.length ? `SeaDream publishes fares from ${usd(fares[0][1])} per person, double occupancy, for the ${fares[0][0].replace(/ \(.*\)$/, "")}, up to ${usd(fares[fares.length - 1][1])} for the ${fares[fares.length - 1][0].replace(/ \(.*\)$/, "")}.` : v.from$ ? `SeaDream publishes a fare from ${usd(v.from$)} per person, double occupancy.` : "Ask James for the fare."}`;
  const faqs: [string, string][] = [
    [`When does ${v.title} sail?`, `${v.shipName} sails ${v.title} from ${dayLabel(v.date)} to ${dayLabel(v.dateTo)}, ${v.nights} nights, ${v.from === v.to ? `round trip from ${v.from}` : `from ${v.from} to ${v.to}`}.${others.length ? ` The same itinerary also sails on ${list(others.map((o) => dayLabel(o.date)))}.` : ""}`],
    [`Where does ${v.title} call?`, `${list(v.calls)}${v.countries.length ? `, in ${list(v.countries)}` : ""}.${seaDays ? ` There ${seaDays === 1 ? "is one day" : `are ${seaDays} days`} at sea.` : ""}`],
    ...(fares.length ? [[`How much is ${v.title} aboard ${v.shipName}?`, `As SeaDream publishes it (read ${dayLabel(SEADREAM_READ)}): ${fares.map(([k, p]) => `${k} from ${usd(p)}`).join("; ")}. Fares are per person, double occupancy, in US dollars, and are capacity controlled, so they can change. Port and government fees are extra.`] as [string, string]] : []),
    ...(ship ? [["What does the fare include?", `${list(ship.inclusions.slice(0, 6).map((x) => x.charAt(0).toLowerCase() + x.slice(1)))}.`] as [string, string]] : []),
    ...(v.bahamas ? [["Does this voyage visit the Bahamas?", `Yes. It calls at ${list(v.days.filter((d) => /Bahamas/.test(d.place)).map((d) => d.title).filter((x, i, a) => a.indexOf(x) === i))}.`] as [string, string]] : []),
  ];
  const jsonld = [{
    "@context": "https://schema.org", "@type": "TouristTrip", "@id": absoluteUrl(`${path}#trip`), name: `${v.title} aboard ${v.shipName}`, url: absoluteUrl(path), description: answer,
    ...(v.hero ? { image: v.hero.url } : {}),
    itinerary: { "@type": "ItemList", itemListElement: v.days.filter((d) => d.title !== "At sea").map((d, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Place", name: d.place, geo: { "@type": "GeoCoordinates", latitude: d.lat, longitude: d.lng } } })) },
    ...(!sailed && !v.waitlisted && (fares.length || v.from$) ? { offers: (fares.length ? fares : [["Voyage", v.from$!] as [string, number]]).map(([k, p]) => ({ "@type": "Offer", name: `${v.title}, ${k}`, price: p, priceCurrency: "USD", validFrom: SEADREAM_READ, url: absoluteUrl(`${path}#fares`), seller: { "@type": "TravelAgency", name: "James Wild & Co" } })) } : {}),
    subjectOf: { "@type": "Event", name: `${v.title} aboard ${v.shipName}`, startDate: v.date, endDate: v.dateTo, eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", location: { "@type": "Place", name: v.from } },
    provider: { "@type": "TravelAgency", name: "James Wild & Co", url: absoluteUrl("/") },
  }];
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-28 lg:pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={trail} touch /></div>
          <header className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-end">
            <div>
              <p className="ledger-eyebrow ledger-crimson">{v.shipName} · {v.regionName}{v.maiden ? " · Inaugural voyage" : ""}</p>
              <h1 className="ledger-h1 mt-3">{v.title}</h1>
              <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed">{span(v)} · {v.nights} nights · {v.direction}</p>
              <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 border-t ledger-rule pt-5">
                <div><dt className="ledger-eyebrow">{v.waitlisted ? "Status" : "From"}</dt><dd className="ledger-display text-[1.5rem] mt-0.5">{sailed ? "Sailed" : v.waitlisted ? "Waitlist" : v.from$ ? usd(v.from$) : "Ask us"}</dd><dd className="text-[12px] ledger-muted">{!sailed && !v.waitlisted && v.from$ ? "per person, double occupancy" : ""}</dd></div>
                <div><dt className="ledger-eyebrow">Ports of call</dt><dd className="ledger-display text-[1.5rem] mt-0.5">{v.calls.length}</dd><dd className="text-[12px] ledger-muted">{v.countries.length} {v.countries.length === 1 ? "country" : "countries"}{seaDays ? `, ${seaDays} at sea` : ""}</dd></div>
                <div className="col-span-2 sm:col-span-1"><dt className="ledger-eyebrow">Yacht</dt><dd className="ledger-display text-[1.5rem] mt-0.5"><Link href={shipPath(v.ship)} className="underline underline-offset-4 decoration-[0.5px]">{v.shipName}</Link></dd><dd className="text-[12px] ledger-muted">SeaDream Yacht Club</dd></div>
              </dl>
              {!sailed && <p className="mt-6 hidden lg:block"><Link href={plan} className="ledger-btn ledger-btn--solid ledger-btn--house">{v.waitlisted ? "Join the waitlist" : "Plan this voyage with James"}</Link></p>}
            </div>
            {v.hero && (
              <figure>
                <div className="relative aspect-[16/10] bg-paper-card overflow-hidden"><Image src={v.hero.url} alt={v.hero.alt} fill priority sizes="(min-width: 1024px) 52vw, 92vw" className="object-cover" /></div>
                <figcaption className="mt-1.5 text-[12px] ledger-muted">Photograph: SeaDream Yacht Club</figcaption>
              </figure>
            )}
          </header>
          {sailed && <p className="mt-8 border-l-2 border-crimson pl-4 text-[15.5px] max-w-3xl">This sailing has left. {others.length ? "The same itinerary sails again on the dates below." : `See what ${v.shipName} sails next on her page.`}</p>}
          <AnswerBlock>{answer}</AnswerBlock>

          <ShipItinerary ship={v.shipName} itineraries={[{ name: v.title, nights: v.nights, direction: v.direction, days: v.days }]} map={map}
            terrain={route && terrainRegion(v.region) ? { id: `see-${v.slug}-in-3d`, kind: "voyage", ink: volumeMark("voyages"), title: `${v.title} aboard ${v.shipName}`, exaggeration: 1.8, routes: [terrainRoute(v.title, route, v.days.filter((d) => d.lat != null).map((d) => ({ day: d.day, name: d.place, lat: d.lat, lng: d.lng })))] } : undefined} title={`Where Does ${v.title} Go, Day by Day?`} intro={route ? "Fly the voyage in 3D, or switch to the itinerary chart, which sails the route as you scroll the log. Times and port notes are SeaDream's, and the captain may change a call for weather." : "Times and port notes are SeaDream's, and the captain may change a call for weather."} />

          {!sailed && (
            <section id="fares" className={SEC} aria-labelledby="fares-h">
              <SectionHead eyebrow="Fares" title={`What Does ${v.title} Cost?`} icon="signal-flag" intro={`Per person, double occupancy, in US dollars, as SeaDream publishes them (read ${dayLabel(SEADREAM_READ)}). Fares are capacity controlled and can change; James confirms yours before you book.`} />
              {v.waitlisted && <p className="mt-5 border-l-2 border-crimson pl-4 text-[15px] max-w-3xl">SeaDream shows this sailing as waitlisted. James can add you to the list or find the nearest sailing with space.</p>}
              {fares.length > 0 ? (
                <table className="mt-6 w-full max-w-3xl text-left border-t ledger-rule">
                  <thead className="sr-only"><tr><th>Stateroom or suite</th><th>From, per person</th></tr></thead>
                  <tbody>{fares.map(([k, p]) => <tr key={k} className="border-b ledger-rule"><th scope="row" className="py-3 pr-4 font-normal text-[16px]">{k.replace(/ \((Deck \d)\)$/, "")}<span className="ledger-muted text-[13.5px]">{k.match(/ \((Deck \d)\)$/) ? ` · ${k.match(/ \((Deck \d)\)$/)![1]}` : ""}</span></th><td className="py-3 text-right ledger-display text-[1.15rem] tabular-nums whitespace-nowrap">{usd(p)}</td></tr>)}</tbody>
                </table>
              ) : (
                <p className="mt-5 text-[16px] max-w-3xl">{v.from$ ? `SeaDream publishes a fare from ${usd(v.from$)} per person for this voyage and has not yet published fares by suite.` : "SeaDream has not published a fare for this voyage yet."} Ask James and he will send them as they are released.</p>
              )}
              <p className="mt-4 text-[13px] ledger-muted max-w-3xl">Port and government fees are extra. Single and third-person fares are available on request.</p>
              <p className="mt-6"><Link href={plan} className="ledger-btn ledger-btn--solid ledger-btn--house">{v.waitlisted ? "Join the waitlist" : "Ask James about this sailing"}</Link></p>
              {ship && <div className="mt-10"><IncludedLists included={ship.inclusions} excluded={ship.exclusions ?? []} /></div>}
              {ship?.terms && ship.terms.length > 0 && <div className="mt-8 max-w-3xl"><p className="ledger-eyebrow">Payment and cancellation, as SeaDream publishes them</p><ul className="mt-2 space-y-1.5 text-[14.5px] ledger-muted">{ship.terms.map((x) => <li key={x}>{x}</li>)}</ul></div>}
            </section>
          )}

          {ship && ship.cabins.length > 0 && (
            <section className={SEC} aria-labelledby="yacht-h">
              <SectionHead eyebrow="The yacht" title={`What Is ${v.shipName} Like?`} icon="wave" />
              <div className="mt-6 grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-start">
                <div className="space-y-4 text-[16.5px] leading-relaxed max-w-2xl"><p>{ship.answer}</p><p><Link href={shipPath(v.ship)} className="inline-flex items-center gap-1.5 min-h-[44px] underline underline-offset-4">Her staterooms, suites and deck plans<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link></p></div>
                <dl className="ledger-paper border ledger-border p-5">{ship.facts.slice(0, 6).map(([k, x]) => <div key={k} className="py-2.5 border-b ledger-rule last:border-0"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-0.5 text-[15px] leading-snug">{x}</dd></div>)}</dl>
              </div>
            </section>
          )}

          <section className={SEC} aria-labelledby="more-h">
            <SectionHead eyebrow="Where next" title="Which Sailings Sit Beside This One?" icon="sun" intro={before || after ? `${v.shipName} sails her voyages back to back, so the one before or after joins this one without changing yacht.` : undefined} />
            {(before || after) && (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {before && <li><VoyageLink v={before} label="The voyage before" /></li>}
                {after && <li><VoyageLink v={after} label="The voyage after" /></li>}
              </ul>
            )}
            {others.length > 0 && (
              <>
                <p className="ledger-eyebrow mt-8">The same itinerary, other dates</p>
                <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{others.map((o) => <li key={o.ship + o.slug}><VoyageLink v={o} label={o.shipName} /></li>)}</ul>
              </>
            )}
            <p className="mt-6 flex flex-wrap gap-x-6">
              <Link href={`${shipPath(v.ship)}#dates`} className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline"><ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />Every {v.shipName} sailing</Link>
              <Link href={`${SEADREAM_HUB}#voyages`} className="inline-flex items-center gap-1.5 min-h-[44px] underline-offset-4 hover:underline">Find a SeaDream voyage by region, month or yacht<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /></Link>
            </p>
          </section>

          {IGGI_ON && <IggiPanel ctx={{ entityType: "voyage", entitySlug: `${v.ship}-${v.slug}`.slice(0, 120), countrySlug: null, sourcePage: `/voyages/ships/${v.ship}/${v.slug}`, volume: "voyages" }} heading={`Ask Iggi about ${v.title}`} lead={`Embarks ${v.from}, disembarks ${v.to}. Ask about the ports, what to pair before or after, and getting to and from the ship.`} />}
          <FaqBlock faqs={faqs.map(([q, a]) => ({ q, a }))} title={`What Else Should You Know About ${v.title}?`} />
          <PlanClose />
        </div>
      </main>
      {!sailed && <RecordActionBar price={v.waitlisted ? undefined : v.from$ ? usd(v.from$) : undefined} basis="pp" cta={v.waitlisted ? "Waitlist" : "Ask James"} href={plan} house />}
      <JsonLd data={jsonld} />
    </>
  );
}
