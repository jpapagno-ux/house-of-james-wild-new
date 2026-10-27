import ImageAccordion from "@/components/record/ImageAccordion";
import { momentsFor } from "@/lib/content/stay-moments";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import PlanBand from "@/components/destination/PlanBand";
import SuiteCards from "@/components/reserve/SuiteCards";
import TalkToUs, { ContactBar, ContactPill } from "@/components/record/TalkToUs";
import WhyFilm from "@/components/record/WhyFilm";
import MarginNote from "@/components/notes/MarginNote";
import HeroMark from "@/components/notes/HeroMark";
import VerdictCard, { verdictSchema } from "@/components/record/VerdictCard";
import { HERO_MARK, SCRIPT, verdictFor } from "@/lib/content/verdicts";
import { markOn, yearOf } from "@/lib/content/hero-marks";
import { houseNote } from "@/lib/ledger/house-notes";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import HostPanel, { KIND as HOST_KIND } from "@/components/record/HostPanel";
import CallingCard from "@/components/record/CallingCard";
import { heroSlides } from "@/lib/content/hero-sets";
import { hostFor, VIDEOS } from "@/lib/content/hosts";
import { suitedTo } from "@/lib/ledger/travel-types";
import { GalleryMosaic, GlanceBar, LocationBlock } from "@/components/record/Frame";
import { CardRail, FounderStamp, Overview, RecordHero, RecordNav, SectionHead } from "@/components/record/Sections";
import { KIND_LABEL, RESERVES, campBySlug, campReady, campStatus, reserveBySlug, usd } from "@/lib/content/reserves";
import { stampForStatus } from "@/lib/ledger/status";
import FounderProof from "@/components/record/FounderProof";
import { regionBySlug } from "@/lib/content/regions";
import { isBuilt } from "@/lib/routes";
import { absoluteUrl, buildMetadata, fitTitle } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// CAMP template (/safaris/[reserve]/[camp]): a lodge, camp or residence
// inside a reserve, on its own page and always tied to its parent.
//   hero (+ founder mark) › nav › breadcrumbs: Safaris › country › reserve › camp
//   overview (answer, the camp's own words, facts incl. the parent reserve)
//   SUITES: card per suite with photo strip, sleeps, beds, from rate
//   features + experiences › gallery › the other camps on the reserve › plan

export const dynamicParams = false;
export function generateStaticParams() { return RESERVES.flatMap((r) => r.camps.filter(campReady).map((c) => ({ reserve: r.slug, camp: c.slug }))); }

function load(reserve: string, camp: string) {
  const r = reserveBySlug(reserve);
  const c = r ? campBySlug(r, camp) : undefined;
  return r && c ? { r, c } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ reserve: string; camp: string }> }) {
  const p = await params; const x = load(p.reserve, p.camp);
  if (!x) return {};
  return buildMetadata({ title: fitTitle([`${x.c.name}, ${x.r.name}: Suites & Rates`, `${x.c.name}, ${x.r.name}`, `${x.c.name}, ${x.r.name.replace(/ Reserve$/, "")}`, `${x.c.name}: Suites & Rates`, x.c.name]), description: `${x.c.name} on ${x.r.name}, ${x.r.area}. ${(x.c.intro || x.c.description).slice(0, 110)}`, path: `/safaris/${x.r.slug}/${x.c.slug}`, image: x.c.hero ? { url: x.c.hero, alt: x.c.name } : undefined, noindex: true });
}

export default async function CampPage({ params }: { params: Promise<{ reserve: string; camp: string }> }) {
  const p = await params; const x = load(p.reserve, p.camp);
  if (!x) notFound();
  const { r, c } = x;
  const path = `/safaris/${r.slug}/${c.slug}`, rpath = `/safaris/${r.slug}`;
  const region = r.stay.regionSlug ? regionBySlug(r.stay.regionSlug) : undefined;
  const countryPath = region && r.stay.countrySlug ? `/destinations/${region.slug}/${r.stay.countrySlug}` : null;
  const st = campStatus(r, c);
  const stamp = st ? stampForStatus(st.status) : null;
  const units = c.units.find((u) => /\d/.test(u)) ?? c.units[0] ?? "";
  const caps = c.rooms.map((m) => m.capacity).filter(Boolean) as number[];
  const suited = suitedTo([c.intro, c.description, ...c.units, ...c.features, ...c.experiences, ...c.rooms.map((m) => `${m.name} ${m.beds ?? ""}`)].filter(Boolean).join(" "), [], 5);
  const slides = heroSlides(`camp:${r.slug}/${c.slug}`, c.name, r.name);
  const host = hostFor(`camp:${r.slug}/${c.slug}`);
  const verdict = verdictFor(`camp:${r.slug}/${c.slug}`);
  const note = houseNote({ key: `camp:${r.slug}/${c.slug}`, name: c.name, bestMonths: r.stay.bestMonths, airport: r.stay.airport, suited, rooms: c.rooms.map((m) => m.name) });
  const planHref = `/plan?trip=${encodeURIComponent(`${r.name} · ${c.name}`)}`;
  const answer = `${c.name} is a ${KIND_LABEL[c.kind].toLowerCase()} on ${r.name} in the ${r.area}, ${r.stay.country ?? "South Africa"}, filed in the James Wild & Co Ledger under the reserve's ${r.rsv}.${units ? ` ${units}.` : ""}${c.fromRate ? ` Registry rates start from ${usd(c.fromRate)}${c.kind === "camp" ? " per person, per night" : " as filed"}.` : ""}${r.stay.bestMonths ? ` Best months on the reserve: ${r.stay.bestMonths}.` : ""}${st ? ` ${st.line}.` : ""}${suited.length ? ` Best suited to ${suited.join(", ").toLowerCase()}.` : ""} Plan it with James or an advisor through Wild & Co Safaris.`;
  const facts: [string, string][] = [["Reserve", `${r.name} · ${r.rsv}`], ["Type", KIND_LABEL[c.kind]], ...(units ? [["Suites", units] as [string, string]] : []), ...(caps.length ? [["Sleeps", Math.min(...caps) === Math.max(...caps) ? `${caps[0]} per suite` : `${Math.min(...caps)}–${Math.max(...caps)} per suite`] as [string, string]] : []), ...(c.fromRate ? [["From", `${usd(c.fromRate)} ${c.kind === "camp" ? "pp / night" : "as filed"}`] as [string, string]] : []), ...(r.stay.bestMonths ? [["Best months", r.stay.bestMonths] as [string, string]] : []), ...(r.stay.airport ? [["Fly into", r.stay.airport] as [string, string]] : []), ...(suited.length ? [["Best suited to", suited.join(", ")] as [string, string]] : []), ...(st ? [["The Ledger", `${stamp} · ${st.date.slice(0, 4)}`] as [string, string]] : [])];
  const trail = [{ name: "Home", path: "/" }, { name: "Safaris", path: "/safaris" }, ...(countryPath && isBuilt(countryPath) ? [{ name: r.stay.country ?? "", path: countryPath }] : []), { name: r.name, path: rpath }, { name: c.name, path }];
  const siblings = r.camps.filter((o) => o.slug !== c.slug && campReady(o));
  const images = c.gallery.map((u, i) => ({ url: u, alt: `${c.name}, ${r.name}, photograph ${i + 1}` }));
  const apart = momentsFor(`camp:${r.slug}/${c.slug}`, c.features, images.slice(1));
  const days = momentsFor(`camp:${r.slug}/${c.slug}`, c.experiences, images.slice(1), 3, apart);
  const paragraphs = [c.intro, c.description].filter((t, i, a) => t && t.length > 40 && !(i === 1 && a[0] && t.startsWith(a[0].slice(0, 40))));
  const faqs = [
    ...(c.rooms.length ? [{ q: `What suites does ${c.name} have?`, a: c.rooms.map((m) => `${m.name}${m.capacity ? ` (sleeps ${m.capacity})` : ""}${m.from ? `, from ${usd(m.from)}${/exclusive use/i.test(m.name) ? " as filed" : " per person per night"}` : ""}`).join("; ") + "." }] : []),
    { q: `Which reserve is ${c.name} on?`, a: `${r.name}, in the ${r.area}, ${r.stay.country ?? "South Africa"}. The reserve also holds ${siblings.map((o) => o.name).join(", ") || "other camps"}.` },
    { q: `How do I book ${c.name}?`, a: `Send an enquiry, call the house on 1.800.419.7000, or book a thirty-minute call. James or an advisor confirms the suite, dates and rates before anything is booked, through Wild & Co Safaris.` },
    ...(r.stay.airport ? [{ q: `How do you get to ${c.name}?`, a: `Fly into ${r.stay.airport}.${r.stay.airportDirections ? ` ${r.stay.airportDirections}` : ""}` }] : []),
  ];
  return (
    <>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <RecordHero slides={slides} tag={markOn(`camp:${r.slug}/${c.slug}`) ? (verdict ? <HeroMark style={HERO_MARK[`camp:${r.slug}/${c.slug}`] ?? "stamp"} image={slides[1]?.url ?? c.hero ?? undefined} script={SCRIPT[`camp:${r.slug}/${c.slug}`]} line={verdict.text[0]} where={verdict.where} when={verdict.when} /> : <HeroMark style="stamp" image={slides[1]?.url ?? c.hero ?? undefined} script={note.script} line={note.line} where={r.name.replace(/ Reserve$/, "")} when={yearOf(r.rsv)} label="From the house" href="#why" />) : undefined} image={{ url: c.hero as string, alt: `${c.name}, ${r.name}, ${r.stay.country ?? "South Africa"}` }}
          eyebrow={`${r.name} · ${KIND_LABEL[c.kind]} · ${r.area}`} title={c.name} tagline={c.intro.split(/(?<=\.)\s/)[0] || undefined}
          stamp={stamp ? <FounderStamp kind={stamp} year={Number(st!.date.slice(0, 4))} volume="safaris" /> : undefined}
          glance={<GlanceBar glance={{ ...(c.fromRate ? { price: { amount: usd(c.fromRate), basis: c.kind === "camp" ? "from, per person per night" : "from, as filed" } } : {}), facts: [["Reserve", r.name], ["Suites", units || "Ask James"], ["Best months", r.stay.bestMonths ?? "Ask James"]], cta: { label: "See the suites", href: "#suites" } }} />} />
        <RecordNav items={[["Why it's here", "why"], ["Film", "film"], ["Overview", "overview"], ...(apart.length ? [["What sets it apart", "features"] as [string, string]] : []), ...(days.length ? [["What you'll do", "experiences"] as [string, string]] : []), ...(c.rooms.length ? [["Suites", "suites"] as [string, string]] : []), ...(images.length > 2 ? [["Gallery", "gallery"] as [string, string]] : []), ...(r.stay.coords ? [["Location", "location"] as [string, string]] : []), ...(siblings.length ? [["Other camps", "other-camps"] as [string, string]] : []), ...(verdict ? [["The verdict", "verdict"] as [string, string]] : []), ["Talk to us", "talk"], ["Plan", "plan"]]} cta={`Plan ${c.name}`} ctaHref={`/plan?trip=${encodeURIComponent(`${r.name} · ${c.name}`)}`} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>
          <p className="mt-6 inline-flex flex-wrap items-center gap-2 border ledger-border px-3 py-2 text-[14px]"><span className="ledger-eyebrow ledger-crimson">Part of {r.name}</span><Link href={rpath} className="underline underline-offset-4 decoration-crimson/50 hover:ledger-crimson">See all {r.camps.length} camps on the reserve</Link></p>
          <WhyFilm title={`Why ${c.name} Earns Its Place on ${r.name}`} paragraphs={paragraphs.length ? paragraphs : [answer]} suited={suited} status={st ? <p className="ledger-eyebrow ledger-crimson">{st.line}</p> : null} name={c.name} video={VIDEOS[`camp:${r.slug}/${c.slug}`] ?? null} poster={slides[1]?.url ?? c.hero} planHref={planHref} note={verdict ? <MarginNote line={verdict.text[0]} where={verdict.where} when={verdict.when} /> : undefined} />
          <Overview answer={answer} facts={facts} />
          {st && <FounderProof proof={`${st.line}.`} className="mt-10 max-w-3xl" />}
          {apart.length > 0 && <ImageAccordion id="features" eyebrow="What sets it apart" title="Why It's Not Just Another Pretty Place" intro="The short list of reasons it made the Ledger, and a few you only notice on the second day." icon="frond" items={apart} />}
          {days.length > 0 && <ImageAccordion id="experiences" eyebrow="What you'll do" title="How to Fill the Days (or Not)" intro="Do all of it, some of it, or none of it. Experienced travellers usually pick two and leave the afternoons alone." icon="mountain-sun" items={days} start={null} />}
          {c.rooms.length > 0 && (
            <section id="suites" className="mt-16 md:mt-24 scroll-mt-32" aria-labelledby="suites-heading">
              <SectionHead eyebrow={`Suites · ${c.rooms.length} ${c.rooms.length === 1 ? "type" : "types"}`} title={`Where You'll Sleep at ${c.name}`} icon="tree-ring" />
              <SuiteCards camp={c.name} reserve={r.name} rooms={c.rooms} />
              <p className="mt-3 text-[13px] ledger-muted">Registry rates in US dollars. The house confirms every rate, inclusions and park fees with your quote.</p>
            </section>
          )}
          {host.state === "available" && host.host && <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={host.state} host={host.host} stayName={c.name} kind={c.kind === "residence" ? "residence" : "camp"} /></div>}
          {images.length > 2 && <GalleryMosaic images={images} title={c.name} />}
          {r.stay.coords && <LocationBlock chart={CHART_SOUTH_AFRICA} name={c.name} pin={r.stay.coords} others={RESERVES.filter((x) => x.slug !== r.slug && x.stay.coords).map((x) => x.stay.coords!)} heading={`${r.name}, ${r.area}`} rows={[["Reserve", `${r.name} · ${r.province}`], ...(r.stay.airport ? [["Airport", r.stay.airport] as [string, string]] : []), ...(r.stay.bestMonths ? [["Best months", r.stay.bestMonths] as [string, string]] : [])]} note={r.stay.airportDirections ?? undefined} />}
          {siblings.length > 0 && <CardRail id="other-camps" eyebrow={`Also on ${r.name}`} title="Same Reserve, Different Front Door" cards={siblings.map((o) => ({ name: o.name, href: `${rpath}/${o.slug}`, image: o.hero, meta: `${KIND_LABEL[o.kind]}${o.fromRate ? ` · from ${usd(o.fromRate)}` : ""}`, line: (o.intro || o.description).split(/(?<=\.)\s/)[0]?.slice(0, 120) }))} />}
          <FaqBlock faqs={faqs} title={`${c.name}, Answered Straight`} />
          {verdict && <VerdictCard k={`camp:${r.slug}/${c.slug}`} name={c.name} v={verdict} />}
          <TalkToUs name={c.name} planHref={planHref} />
          {host.state !== "off" && !(host.state === "available" && host.host) && <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={host.state} host={host.host} stayName={c.name} kind={c.kind === "residence" ? "residence" : "camp"} /></div>}
          <div id="plan" className="scroll-mt-32"><PlanBand place={`${c.name} on ${r.name}`} compassHref={rpath} /></div>
        </div>
        {host.state === "available" && host.host && <CallingCard who={HOST_KIND[c.kind === "residence" ? "residence" : "camp"].who} seats={host.host.seats} />}
      </main>
      <ContactBar name={c.name} planHref={planHref} from={c.fromRate ? `${usd(c.fromRate)}${c.kind === "camp" ? " pp/night" : ""}` : undefined} />
      <ContactPill name={c.name} planHref={planHref} />
      {verdict && <JsonLd data={graph(verdictSchema(verdict, c.name, absoluteUrl(path), ids.founder))} />}
      <JsonLd data={graph({ "@type": c.kind === "residence" ? "LodgingBusiness" : "Resort", "@id": absoluteUrl(`${path}#stay`), name: c.name, url: absoluteUrl(path), description: answer, image: slides.length ? slides.map((x) => (x.url.startsWith("/") ? absoluteUrl(x.url) : x.url)) : [c.hero].filter(Boolean), ...(suited.length ? { audience: suited.map((t) => ({ "@type": "PeopleAudience", audienceType: t })), keywords: [c.name, r.name, "safari", ...suited].join(", ") } : {}), containedInPlace: { "@id": absoluteUrl(`${rpath}#reserve`), "@type": "TouristAttraction", name: r.name, url: absoluteUrl(rpath) }, ...(r.stay.coords ? { geo: { "@type": "GeoCoordinates", latitude: r.stay.coords.lat, longitude: r.stay.coords.lng } } : {}), ...(c.fromRate ? { priceRange: `From ${usd(c.fromRate)}${c.kind === "camp" ? " per person per night" : ""}` } : {}), publisher: { "@id": ids.house }, ...(c.rooms.length ? { containsPlace: c.rooms.map((m) => ({ "@type": "Suite", name: m.name, ...(m.capacity ? { occupancy: { "@type": "QuantitativeValue", maxValue: m.capacity } } : {}), ...(m.beds ? { bed: m.beds } : {}) })) } : {}) })} />
    </>
  );
}
