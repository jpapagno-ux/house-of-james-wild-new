import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import PlanBand from "@/components/destination/PlanBand";
import CampLedger, { type CampCard } from "@/components/reserve/CampLedger";
import { GalleryMosaic, GlanceBar, LocationBlock } from "@/components/record/Frame";
import { Features, Overview, RecordHero, RecordNav, SectionHead, WhyChose } from "@/components/record/Sections";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import { KIND_LABEL, RESERVES, campReady, campStatus, reserveBySlug, reserveFrom, usd, type Reserve } from "@/lib/content/reserves";
import { stampForStatus, statusLine } from "@/lib/ledger/status";
import { regionBySlug } from "@/lib/content/regions";
import { isBuilt } from "@/lib/routes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
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

const answerFor = (r: Reserve) => {
  const lodges = r.camps.filter((c) => c.kind === "camp").length, private_ = r.camps.length - lodges;
  const from = reserveFrom(r);
  return `${r.name} is a private reserve in the ${r.area}, ${r.stay.country ?? "South Africa"}, filed in the James Wild & Co Ledger under ${r.rsv}. It holds ${lodges} ${lodges === 1 ? "lodge" : "lodges and camps"}${private_ ? ` and ${private_} private ${private_ === 1 ? "residence or suite" : "residences and suites"}` : ""}, each with its own page.${from ? ` Registry rates start from ${usd(from)} per person, per night.` : ""}${r.stay.bestMonths ? ` Best months: ${r.stay.bestMonths}.` : ""}${r.stay.airport ? ` Fly into ${r.stay.airport}.` : ""} Plan it with James or an advisor through Wild & Co Safaris.`;
};

export async function generateMetadata({ params }: { params: Promise<{ reserve: string }> }) {
  const r = reserveBySlug((await params).reserve);
  if (!r) return {};
  return buildMetadata({ title: `${r.name}: Lodges, Camps & Residences | James Wild & Co Safaris`, description: answerFor(r).slice(0, 158), path: `/safaris/${r.slug}`, image: r.stay.hero ? { url: r.stay.hero, alt: r.name } : undefined, noindex: true });
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
  const cards: CampCard[] = r.camps.map((c) => {
    const st = campStatus(r, c);
    const units = c.units.find((u) => /\d/.test(u)) ?? c.units[0] ?? "";
    return { slug: c.slug, name: c.name, kind: c.kind, kindLabel: KIND_LABEL[c.kind], href: campReady(c) ? `${path}/${c.slug}` : null, photos: [c.hero, ...c.gallery].filter((u, i, a): u is string => !!u && a.indexOf(u) === i).slice(0, 6), units, line: (c.intro || c.description).split(/(?<=\.)\s/)[0]?.slice(0, 180) ?? "", from: c.fromRate ? usd(c.fromRate) : null, fromBasis: c.kind === "camp" ? "per person, per night" : "as filed · basis with your quote", mark: st ? `${stampForStatus(st.status)} · ${st.date.slice(0, 4)}` : null };
  });
  const facts: [string, string][] = [["Ledger ID", r.rsv], ["Reserve", `${r.area} · ${r.province}`], ["On the reserve", `${lodges} ${lodges === 1 ? "lodge" : "lodges & camps"}${r.camps.length > lodges ? ` · ${r.camps.length - lodges} private` : ""}`], ...(r.stay.bestMonths ? [["Best months", r.stay.bestMonths] as [string, string]] : []), ...(r.stay.airport ? [["Fly into", r.stay.airport] as [string, string]] : []), ["Booked through", "Wild & Co Safaris"]];
  const trail = [{ name: "Home", path: "/" }, { name: "Safaris", path: "/safaris" }, ...(countryPath && isBuilt(countryPath) ? [{ name: r.stay.country ?? "", path: countryPath }] : []), { name: r.name, path }];
  const images = (r.stay.gallery ?? []).filter(Boolean).slice(0, 10).map((u, i) => ({ url: u, alt: `${r.name}, photograph ${i + 1}` }));
  const faqs = [
    { q: `How many lodges and camps are on ${r.name}?`, a: `${r.camps.length} on the Ledger: ${r.camps.map((c) => c.name).join(", ")}. Each has its own page with its suites and rates.` },
    ...(from ? [{ q: `How much does ${r.name} cost?`, a: `Registry rates start from ${usd(from)} per person, per night at ${r.camps.find((c) => c.fromRate === from)?.name ?? "the reserve"}, and rise by camp and suite. The house confirms every rate with your quote.` }] : []),
    ...(r.stay.bestMonths ? [{ q: `When is the best time to visit ${r.name}?`, a: `${r.stay.bestMonths}.${r.stay.bestMonthsNote ? ` ${r.stay.bestMonthsNote}` : ""}` }] : []),
    ...(r.stay.airport ? [{ q: `How do you get to ${r.name}?`, a: `Fly into ${r.stay.airport}.${r.stay.airportDirections ? ` ${r.stay.airportDirections}` : ""}` }] : []),
  ];
  const signature = (c: Reserve["camps"][number]) => c.features[0] ?? c.experiences[0] ?? "";
  return (
    <>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <RecordHero image={{ url: r.stay.hero, alt: `${r.name}, ${r.area}, ${r.stay.country ?? "South Africa"}` }}
          eyebrow={`Wild & Co Safaris · Reserve · ${r.area} · ${r.rsv}`} title={r.name} tagline={r.stay.tagline?.replace(/^"|"$/g, "") ?? undefined}
          glance={<GlanceBar glance={{ ...(from ? { price: { amount: usd(from), basis: "from, per person per night" } } : {}), facts: [["On the reserve", `${r.camps.length} camps & residences`], ["Best months", r.stay.bestMonths ?? "Ask James"], ["Fly into", r.stay.airport ?? "Ask James"]], cta: { label: "See the camps", href: "#camps" } }} />} />
        <RecordNav items={[["Overview", "overview"], ["The camps", "camps"], ["Compare", "compare"], ["Why it's here", "why"], ["On the reserve", "experiences"], ["Location", "location"], ["Plan", "plan"]]} cta="Plan this reserve" ctaHref={`/plan?trip=${encodeURIComponent(r.name)}`} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>
          <Overview quote={r.stay.quote ?? undefined} answer={answer} facts={facts} paragraphs={r.stay.onlyHere} />

          <section id="camps" className="mt-16 md:mt-24 scroll-mt-32" aria-labelledby="camps-heading">
            <SectionHead eyebrow={`The camps · ${r.camps.length} on the Ledger`} title={`Where to Stay on ${r.name}`} icon="tree-ring" intro="One reserve, several ways in. Each lodge, camp and residence is filed on its own, with its own suites, rates and photographs. Choose by the company you keep." />
            <CampLedger reserve={r.name} camps={cards} />
          </section>

          <section id="compare" className="mt-16 md:mt-24 scroll-mt-32" aria-labelledby="compare-heading">
            <p className="ledger-eyebrow ledger-crimson">Side by side</p>
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

          {r.stay.why.length > 0 && <WhyChose title={`Why ${r.name} Is in the Ledger`} blocks={r.stay.why.map((w) => ({ title: w.title ?? undefined, body: w.body }))} status={statusLine(r.stay.status as never, r.stay.statusDate) ? <p className="ledger-eyebrow ledger-crimson">{statusLine(r.stay.status as never, r.stay.statusDate)}</p> : null} />}
          {(r.stay.experiences.items.length > 0 || r.stay.features.items.length > 0) && <Features id="experiences" eyebrow="On the reserve" title={`What You'll Do on ${r.name}`} icon="mountain-sun" items={[...r.stay.experiences.items, ...r.stay.features.items].slice(0, 12)} body={r.stay.experiences.paras[0] ?? r.stay.features.paras[0]} />}
          {images.length > 2 && <GalleryMosaic images={images} title={r.name} />}
          {r.stay.coords && <LocationBlock chart={CHART_SOUTH_AFRICA} name={r.name} pin={r.stay.coords} others={RESERVES.filter((x) => x.slug !== r.slug && x.stay.coords).map((x) => x.stay.coords!)} heading={`${r.area}, ${r.stay.country ?? "South Africa"}`} rows={[["Reserve", `${r.area} · ${r.province}`], ...(r.stay.airport ? [["Airport", r.stay.airport] as [string, string]] : []), ...(r.stay.bestMonths ? [["Best months", r.stay.bestMonths] as [string, string]] : [])]} note={r.stay.airportDirections ?? undefined} />}
          <FaqBlock faqs={faqs} title={`${r.name}: Quick Answers`} />
          <div id="plan" className="scroll-mt-32"><PlanBand place={r.name} compassHref={countryPath ?? "/safaris"} /></div>
        </div>
      </main>
      <JsonLd data={graph({ "@type": ["TouristAttraction", "Place"], "@id": absoluteUrl(`${path}#reserve`), name: r.name, url: absoluteUrl(path), description: answer, image: [r.stay.hero], identifier: { "@type": "PropertyValue", propertyID: "Ledger ID", value: r.rsv }, ...(r.stay.coords ? { geo: { "@type": "GeoCoordinates", latitude: r.stay.coords.lat, longitude: r.stay.coords.lng } } : {}), containedInPlace: { "@type": "Country", name: r.stay.country ?? "South Africa" }, publisher: { "@id": ids.house }, containsPlace: r.camps.filter(campReady).map((c) => ({ "@type": "LodgingBusiness", name: c.name, url: absoluteUrl(`${path}/${c.slug}`), ...(c.hero ? { image: c.hero } : {}), ...(c.fromRate ? { priceRange: `From ${usd(c.fromRate)} per person per night` } : {}) })) })} />
    </>
  );
}
