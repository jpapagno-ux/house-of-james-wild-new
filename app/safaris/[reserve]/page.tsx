import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import PlanBand from "@/components/destination/PlanBand";
import CampLedger, { type CampCard } from "@/components/reserve/CampLedger";
import ImageAccordion from "@/components/record/ImageAccordion";
import { momentsFor } from "@/lib/content/stay-moments";
import { GalleryMosaic, GlanceBar, LocationBlock } from "@/components/record/Frame";
import { Overview, RecordHero, RecordNav, SectionHead } from "@/components/record/Sections";
import TalkToUs, { ContactBar, ContactPill } from "@/components/record/TalkToUs";
import WhyFilm from "@/components/record/WhyFilm";
import HostPanel from "@/components/record/HostPanel";
import { heroSlides } from "@/lib/content/hero-sets";
import { hostFor, VIDEOS } from "@/lib/content/hosts";
import { suitedTo } from "@/lib/ledger/travel-types";
import HeroMark from "@/components/notes/HeroMark";
import { markOn, yearOf } from "@/lib/content/hero-marks";
import { houseNote } from "@/lib/ledger/house-notes";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import { KIND_LABEL, RESERVES, campReady, campStatus, reserveBySlug, reserveFrom, usd, type Reserve } from "@/lib/content/reserves";
import { stampForStatus, statusLine } from "@/lib/ledger/status";
import { regionBySlug } from "@/lib/content/regions";
import { isBuilt } from "@/lib/routes";
import { absoluteUrl, buildMetadata, fitTitle } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// RESERVE template (/safaris/[reserve]): the parent page for an African
// reserve that houses several lodges, camps and residences.
//   hero (reserve film-strip of camp photos) + glance: camps, from, best months, fly into
//   sticky nav › breadcrumbs › overview (answer, quote, facts)
//   THE CAMPS: a ledger card per camp, filterable lodges vs residences
//   COMPARE: one table, every camp side by side (type, suites, sleeps, from, signature)
//   why it's in the Ledger › on the reserve (experiences + features) › gallery
//   location (chart, airport, transfer) › quick answers › plan
// Every camp links down to /safaris/[reserve]/[camp]; every camp page links back.

export const dynamicParams = false;
export function generateStaticParams() { return RESERVES.map((r) => ({ reserve: r.slug })); }

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const suitedFor = (r: Reserve) => suitedTo([r.stay.tagline, r.stay.quote, ...r.stay.why.map((w) => w.body), ...r.stay.onlyHere, ...r.stay.experiences.items, ...r.stay.features.items, ...r.camps.flatMap((c) => [c.intro, c.description, ...c.features, ...c.experiences, ...c.rooms.map((m) => m.name)])].filter(Boolean).join(" "), [], 5);

const answerFor = (r: Reserve) => {
  const lodges = r.camps.filter((c) => c.kind === "camp").length, private_ = r.camps.length - lodges;
  const from = reserveFrom(r);
  return `${r.name} is a private reserve in the ${r.area}, ${r.stay.country ?? "South Africa"}, filed in the James Wild & Co Ledger under ${r.rsv}. It holds ${lodges} ${lodges === 1 ? "lodge" : "lodges and camps"}${private_ ? ` and ${private_} private ${private_ === 1 ? "residence or suite" : "residences and suites"}` : ""}, each with its own page.${from ? ` Registry rates start from ${usd(from)} per person, per night.` : ""}${r.stay.bestMonths ? ` Best months: ${r.stay.bestMonths}.` : ""}${r.stay.airport ? ` Fly into ${r.stay.airport}.` : ""} ${suitedFor(r).length ? `Best suited to ${suitedFor(r).join(", ").toLowerCase()}. ` : ""}Plan it with James or an advisor through Wild & Co Safaris.`;
};

export async function generateMetadata({ params }: { params: Promise<{ reserve: string }> }) {
  const r = reserveBySlug((await params).reserve);
  if (!r) return {};
  return buildMetadata({ title: fitTitle([`${r.name}: Lodges, Camps & Residences`, `${r.name}: Camps & Rates`, `${r.name} Safari Camps`, r.name]), description: answerFor(r).slice(0, 158), path: `/safaris/${r.slug}`, image: r.stay.hero ? { url: r.stay.hero, alt: r.name } : undefined, noindex: true });
}

export default async function ReservePage({ params }: { params: Promise<{ reserve: string }> }) {
  const r = reserveBySlug((await params).reserve);
  if (!r || !r.stay.hero) notFound();
  const path = `/safaris/${r.slug}`;
  const region = r.stay.regionSlug ? regionBySlug(r.stay.regionSlug) : undefined;
  const countryPath = region && r.stay.countrySlug ? `/destinations/${region.slug}/${r.stay.countrySlug}` : null;
  const lodges = r.camps.filter((c) => c.kind === "camp").length;
  const from = reserveFrom(r);
  const answer = answerFor(r);
  const suited = suitedFor(r);
  const slides = heroSlides(`reserve:${r.slug}`, r.name, r.area);
  const host = hostFor(`reserve:${r.slug}`);
  const planHref = `/plan?trip=${encodeURIComponent(r.name)}`;
  const why = r.stay.why;
  const note = houseNote({ key: `reserve:${r.slug}`, name: r.name, bestMonths: r.stay.bestMonths, airport: r.stay.airport, suited, rooms: r.camps.map((c) => c.name) });
  const cards: CampCard[] = r.camps.map((c) => {
    const st = campStatus(r, c);
    const units = c.units.find((u) => /\d/.test(u)) ?? c.units[0] ?? "";
    return { slug: c.slug, name: c.name, kind: c.kind, kindLabel: KIND_LABEL[c.kind], href: campReady(c) ? `${path}/${c.slug}` : null, photos: [c.hero, ...c.gallery].filter((u, i, a): u is string => !!u && a.indexOf(u) === i).slice(0, 6), units, line: (c.intro || c.description).split(/(?<=\.)\s/)[0]?.slice(0, 180) ?? "", from: c.fromRate ? usd(c.fromRate) : null, fromBasis: c.kind === "camp" ? "per person, per night" : "as filed · basis with your quote", mark: st ? `${stampForStatus(st.status)} · ${st.date.slice(0, 4)}` : null };
  });
  const facts: [string, string][] = [["Ledger ID", r.rsv], ["Reserve", `${r.area} · ${r.province}`], ["On the reserve", `${lodges} ${lodges === 1 ? "lodge" : "lodges & camps"}${r.camps.length > lodges ? ` · ${r.camps.length - lodges} private` : ""}`], ...(r.stay.bestMonths ? [["Best months", r.stay.bestMonths] as [string, string]] : []), ...(r.stay.airport ? [["Fly into", r.stay.airport] as [string, string]] : []), ["Booked through", "Wild & Co Safaris"]];
  const trail = [{ name: "Home", path: "/" }, { name: "Safaris", path: "/safaris" }, ...(countryPath && isBuilt(countryPath) ? [{ name: r.stay.country ?? "", path: countryPath }] : []), { name: r.name, path }];
  const images = (r.stay.gallery ?? []).filter(Boolean).slice(0, 10).map((u, i) => ({ url: u, alt: `${r.name}, photograph ${i + 1}` }));
  const apart = momentsFor(`reserve:${r.slug}`, r.stay.features.items.slice(0, 8), images.slice(1));
  const days = momentsFor(`reserve:${r.slug}`, r.stay.experiences.items.slice(0, 8), images.slice(1), 3);
  const faqs = [
    { q: `How many lodges and camps are on ${r.name}?`, a: `${r.camps.length} on the Ledger: ${r.camps.map((c) => c.name).join(", ")}. Each has its own page with its suites and rates.` },
    ...(from ? [{ q: `How much does ${r.name} cost?`, a: `Registry rates start from ${usd(from)} per person, per night at ${r.camps.find((c) => c.fromRate === from)?.name ?? "the reserve"}, and rise by camp and suite. The house confirms every rate with your quote.` }] : []),
    ...(r.stay.bestMonths ? [{ q: `When is the best time to visit ${r.name}?`, a: `${r.stay.bestMonths}.${r.stay.bestMonthsNote ? ` ${r.stay.bestMonthsNote}` : ""}` }] : []),
    ...(r.stay.airport ? [{ q: `How do you get to ${r.name}?`, a: `Fly into ${r.stay.airport}.${r.stay.airportDirections ? ` ${r.stay.airportDirections}` : ""}` }] : []),
    { q: `How do I book ${r.name}?`, a: `Send an enquiry, call the house on 1.800.419.7000, or book a thirty-minute call. James or an advisor matches you to the right camp and confirms dates and rates before anything is booked, through Wild & Co Safaris.` },
  ];
  const signature = (c: Reserve["camps"][number]) => c.features[0] ?? c.experiences[0] ?? "";
  return (
    <>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <RecordHero slides={slides} tag={markOn(`reserve:${r.slug}`) ? <HeroMark style="stamp" image={slides[1]?.url ?? r.stay.hero} script={note.script} line={note.line} where={r.area} when={yearOf(r.rsv)} label="From the house" href="#why" /> : undefined} image={{ url: r.stay.hero, alt: `${r.name}, ${r.area}, ${r.stay.country ?? "South Africa"}` }}
          eyebrow={`Wild & Co Safaris · Reserve · ${r.area} · ${r.rsv}`} title={r.name} tagline={r.stay.tagline?.replace(/^"|"$/g, "") ?? undefined}
          glance={<GlanceBar glance={{ ...(from ? { price: { amount: usd(from), basis: "from, per person per night" } } : {}), facts: [["On the reserve", `${r.camps.length} camps & residences`], ["Best months", r.stay.bestMonths ?? "Ask James"], ["Fly into", r.stay.airport ?? "Ask James"]], cta: { label: "See the camps", href: "#camps" } }} />} />
        <RecordNav items={[["Why it's here", "why"], ["Film", "film"], ["Overview", "overview"], ...(apart.length ? [["What sets it apart", "features"] as [string, string]] : []), ...(days.length ? [["What you'll do", "experiences"] as [string, string]] : []), ["The camps", "camps"], ["Compare", "compare"], ["Location", "location"], ["Talk to us", "talk"], ["Plan", "plan"]]} cta="Plan this reserve" ctaHref={`/plan?trip=${encodeURIComponent(r.name)}`} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>
          <WhyFilm title={why[0]?.title ?? `Why ${r.name} Earned Its Page`} blocks={why.map((w, i) => ({ title: i === 0 && why[0]?.title ? null : w.title, body: w.body }))} paragraphs={why.length ? [] : r.stay.onlyHere.slice(0, 2)} suited={suited} status={statusLine(r.stay.status as never, r.stay.statusDate) ? <p className="ledger-eyebrow ledger-crimson">{statusLine(r.stay.status as never, r.stay.statusDate)}</p> : null} name={r.name} video={VIDEOS[`reserve:${r.slug}`] ?? null} poster={slides[1]?.url ?? r.stay.hero} planHref={planHref} />
          <Overview quote={r.stay.quote ?? undefined} answer={answer} facts={facts} paragraphs={r.stay.onlyHere} />

          {apart.length > 0 && <ImageAccordion id="features" eyebrow="What sets it apart" title="Why It's Not Just Another Pretty Place" intro="The short list of reasons it made the Ledger, and a few you only notice on the second day." icon="frond" items={apart} />}
          {days.length > 0 && <ImageAccordion id="experiences" eyebrow="What you'll do" title="How to Fill the Days (or Not)" intro="Do all of it, some of it, or none of it. Experienced travellers usually pick two and leave the afternoons alone." icon="mountain-sun" items={days} start={null} />}
          <section id="camps" className="mt-16 md:mt-24 scroll-mt-32" aria-labelledby="camps-heading">
            <SectionHead eyebrow={`The camps · ${r.camps.length} on the Ledger`} title={`${WORDS[r.camps.length] ?? r.camps.length} Ways to Wake Up on ${r.name}`} icon="tree-ring" intro="Same reserve, different front doors. Each lodge, camp and residence is filed on its own, with its own suites, rates and photographs. Pick by who’s coming, how private you like it, and how early you’re willing to get up for the morning drive." />
            <CampLedger reserve={r.name} camps={cards} />
          </section>

          <section id="compare" className="mt-16 md:mt-24 scroll-mt-32" aria-labelledby="compare-heading">
            <p className="ledger-eyebrow ledger-crimson">Side by side, no brochure-speak</p>
            <h2 id="compare-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">The Camps of {r.name}, Compared</h2>
            <div className="relative mt-6 overflow-x-auto">
              <table className="w-full min-w-[720px] text-[14.5px]">
                <caption className="sr-only">Every camp on {r.name}: type, suites, sleeps, from rate and signature</caption>
                <thead><tr className="text-left border-b ledger-rule">{["Camp", "Type", "Suites", "Sleeps", "From", "Signature"].map((h) => <th key={h} scope="col" className="ledger-eyebrow font-normal py-2.5 pr-4">{h}</th>)}</tr></thead>
                <tbody>
                  {r.camps.map((c) => {
                    const caps = c.rooms.map((m) => m.capacity).filter(Boolean) as number[];
                    return (
                      <tr key={c.slug} className="border-b ledger-rule align-top">
                        <th scope="row" className="py-3 pr-4 text-left font-normal">{campReady(c) ? <Link href={`${path}/${c.slug}`} className="ledger-display text-[1.1rem] hover:ledger-crimson">{c.name}</Link> : <span className="ledger-display text-[1.1rem]">{c.name}</span>}{campStatus(r, c) && <span className="block ledger-eyebrow ledger-crimson mt-0.5">{stampForStatus(campStatus(r, c)!.status)}</span>}</th>
                        <td className="py-3 pr-4">{KIND_LABEL[c.kind]}</td>
                        <td className="py-3 pr-4">{c.units.find((u) => /\d/.test(u)) ?? c.units[0] ?? "Ask"}</td>
                        <td className="py-3 pr-4">{caps.length ? (Math.min(...caps) === Math.max(...caps) ? caps[0] : `${Math.min(...caps)}–${Math.max(...caps)}`) : "Ask"}</td>
                        <td className="py-3 pr-4 whitespace-nowrap">{c.fromRate ? usd(c.fromRate) : "On quote"}</td>
                        <td className="py-3 pr-4 ledger-muted">{signature(c)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] ledger-muted">From rates are the registry&rsquo;s US-dollar rates per person, per night for camps; residences are taken whole. The house confirms every rate with your quote.</p>
          </section>

          {host.state === "available" && host.host && <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={host.state} host={host.host} stayName={r.name} kind="reserve" /></div>}
          {images.length > 2 && <GalleryMosaic images={images} title={r.name} />}
          {r.stay.coords && <LocationBlock chart={CHART_SOUTH_AFRICA} name={r.name} pin={r.stay.coords} others={RESERVES.filter((x) => x.slug !== r.slug && x.stay.coords).map((x) => x.stay.coords!)} heading={`${r.area}, ${r.stay.country ?? "South Africa"}`} rows={[["Reserve", `${r.area} · ${r.province}`], ...(r.stay.airport ? [["Airport", r.stay.airport] as [string, string]] : []), ...(r.stay.bestMonths ? [["Best months", r.stay.bestMonths] as [string, string]] : [])]} note={r.stay.airportDirections ?? undefined} />}
          <FaqBlock faqs={faqs} title={`${r.name}, Answered Straight`} />
          <TalkToUs name={r.name} planHref={planHref} />
          {host.state !== "off" && !(host.state === "available" && host.host) && <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={host.state} host={host.host} stayName={r.name} kind="reserve" /></div>}
          <div id="plan" className="scroll-mt-32"><PlanBand place={r.name} compassHref={countryPath ?? "/safaris"} /></div>
        </div>
      </main>
      <ContactBar name={r.name} planHref={planHref} from={from ? `${usd(from)} pp/night` : undefined} />
      <ContactPill name={r.name} planHref={planHref} />
      <JsonLd data={graph({ "@type": ["TouristAttraction", "Place"], "@id": absoluteUrl(`${path}#reserve`), name: r.name, url: absoluteUrl(path), description: answer, image: slides.length ? slides.map((x) => (x.url.startsWith("/") ? absoluteUrl(x.url) : x.url)) : [r.stay.hero], ...(suited.length ? { audience: suited.map((t) => ({ "@type": "PeopleAudience", audienceType: t })), keywords: [r.name, r.area, "safari", ...suited].join(", ") } : {}), identifier: { "@type": "PropertyValue", propertyID: "Ledger ID", value: r.rsv }, ...(r.stay.coords ? { geo: { "@type": "GeoCoordinates", latitude: r.stay.coords.lat, longitude: r.stay.coords.lng } } : {}), containedInPlace: { "@type": "Country", name: r.stay.country ?? "South Africa" }, publisher: { "@id": ids.house }, containsPlace: r.camps.filter(campReady).map((c) => ({ "@type": "LodgingBusiness", name: c.name, url: absoluteUrl(`${path}/${c.slug}`), ...(c.hero ? { image: c.hero } : {}), ...(c.fromRate ? { priceRange: `From ${usd(c.fromRate)} per person per night` } : {}) })) })} />
    </>
  );
}
