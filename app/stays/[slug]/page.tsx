import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { notFound } from "next/navigation";
import { GalleryMosaic, GlanceBar, LocationBlock } from "@/components/record/Frame";
import { Features, FounderStamp, Overview, RecordHero, RecordNav } from "@/components/record/Sections";
import LiveRatesBand from "@/components/record/LiveRatesBand";
import FullFrame from "@/components/record/FullFrame";
import OfferPanel from "@/components/ledger/OfferPanel";
import { offersFor } from "@/lib/content/offers/offers";
import ImageAccordion from "@/components/record/ImageAccordion";
import { momentsFor, rowsFrom } from "@/lib/content/stay-moments";
import { FULL_FRAME, PHOTO_CREDIT } from "@/lib/content/stay-media";
import { PRICED } from "@/lib/content/priced-stays";
import Inclusions from "@/components/booking/Inclusions";
import BookingPanel from "@/components/booking/BookingPanel";
import StayActions from "@/components/booking-live/StayActions";
import TalkToUs, { ContactBar, ContactPill } from "@/components/record/TalkToUs";
import WhyFilm from "@/components/record/WhyFilm";
import MarginNote from "@/components/notes/MarginNote";
import HeroMark from "@/components/notes/HeroMark";
import VerdictCard, { verdictSchema } from "@/components/record/VerdictCard";
import { HERO_MARK, SCRIPT, verdictFor } from "@/lib/content/verdicts";
import { markOn, yearOf } from "@/lib/content/hero-marks";
import { houseNote } from "@/lib/ledger/house-notes";
import HostPanel, { KIND as HOST_KIND } from "@/components/record/HostPanel";
import CallingCard from "@/components/record/CallingCard";
import { heroSlides } from "@/lib/content/hero-sets";
import { hostFor, VIDEOS } from "@/lib/content/hosts";
import { FILM_CREDITS, filmCreditSchema } from "@/lib/content/films";
import { suitedTo } from "@/lib/ledger/travel-types";
import PlanBand from "@/components/destination/PlanBand";
import { AdvisorStrip } from "@/components/advisor/Desk";
import { RecordCard } from "@/components/hub/Hub";
import { CHART_COSTA_RICA } from "@/lib/charts/costa-rica";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import type { ChartData } from "@/components/destination/LedgerChart";
import { BEST_FOR, STAY_PAGES, staysIn, stayBySlug, pageReady, altFor } from "@/lib/content/stays";
import { regionBySlug } from "@/lib/content/regions";
import { founderProof, stampForStatus, statusLine, type HouseStatus } from "@/lib/ledger/status";
import FounderProof from "@/components/record/FounderProof";
import { InkStamp, Roundel } from "@/components/ledger/VolumeKit";
import { entryNo, roundelText, sealFor, VOLUME_STYLES } from "@/lib/volumes";
import FromTheJournal from "@/components/journal/FromTheJournal";
import { SessionsFor } from "@/components/workshops/SessionCard";
import { postsForStay } from "@/lib/content/journal/posts";
import { sessionsFor } from "@/lib/content/workshops";
import { collectionForStay, offerForStay } from "@/lib/content/collections/cayuga";
import { routesThrough } from "@/lib/content/trips";
import { recordHref } from "@/lib/ledger/urls";
import { isBuilt } from "@/lib/routes";
import { RESERVES } from "@/lib/content/reserves";
import GatewayNight from "@/components/stays/GatewayNight";
import EuropePlate from "@/components/stays/EuropePlate";
import { EUROPE_PLATES } from "@/lib/content/europe-plates";
import { absoluteUrl, buildMetadata, fitTitle } from "@/lib/seo";
import { graph, ids, imageObject, lodging } from "@/lib/schema";
import ImpactNote from "@/components/impact/ImpactNote";
import FollowThePathway from "@/components/pathways/FollowThePathway";
import IggiLine from "@/components/dialogue/IggiLine";
import { dialogueLine } from "@/lib/content/dialogue-register";
import { PathwayChips } from "@/components/pathways/Pathway";
import IggiPanel from "@/components/iggi/IggiPanel";
import { IGGI_ON } from "@/lib/iggi/flag";
import { onPathway, pathwayStays } from "@/lib/content/pathways";
import { PATHWAYS_ON, pathwayHref } from "@/lib/content/pathways/flag";

// /stays/[slug]: a stay page from the Ledger export. Hero + glance › page bar ›
// breadcrumbs › overview (quote, in short, facts, the full entry) › gallery ›
// live rates (where the booking engine is connected) › why it earned its place
// › rooms › experiences › features › location › facts & FAQ (reviewed records)
// › more stays in the country › plan. Built for every live stay with a hero
// photo and content; marks come only from house_status.

export const dynamicParams = false;
export function generateStaticParams() { return STAY_PAGES.map((s) => ({ slug: s.slug })); }

const CHARTS: Record<string, ChartData> = { "costa-rica": CHART_COSTA_RICA, "south-africa": CHART_SOUTH_AFRICA };
const KIND: Record<string, string> = { hotel: "hotel", lodge: "lodge", villa: "private villa", camp: "camp", resort: "resort", residence: "residence" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = stayBySlug((await params).slug);
  if (!s) return {};
  return buildMetadata({
    title: fitTitle([`${s.name}${s.country ? `, ${s.country}` : ""}: Vetted Stay`, `${s.name}${s.country ? `, ${s.country}` : ""}`, s.name]),
    description: (s.tagline ? `${s.tagline} ` : "") + `${s.name}${s.country ? ` in ${s.country}` : ""}, filed in the James Wild & Co Ledger${s.ledgerId ? ` (${s.ledgerId})` : ""}.${s.bestMonths ? ` Best ${s.bestMonths}.` : ""}`.slice(0, 300),
    path: `/stays/${s.slug}`,
    image: s.hero ? { url: s.hero, alt: `${s.name}${s.country ? `, ${s.country}` : ""}` } : undefined,
  });
}

export default async function StayPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = stayBySlug((await params).slug);
  if (!s || !s.hero) notFound();
  const path = `/stays/${s.slug}`;
  const region = s.regionSlug ? regionBySlug(s.regionSlug) : undefined;
  const countryPath = region && s.countrySlug ? `/destinations/${region.slug}/${s.countrySlug}` : null;
  const status = statusLine(s.status as HouseStatus, s.statusDate);
  const stamp = stampForStatus(s.status as HouseStatus);
  // The library files many safari camps as "hotel"; the name is the better witness.
  const named = /\b(camp|lodge|villa|resort|residence|house|island)\b/i.exec(s.name)?.[1]?.toLowerCase();
  const kind = (s.category === "hotel" && named ? (named === "villa" ? "private villa" : named === "island" ? "private island" : named) : null) ?? ((s.category && KIND[s.category]) || "stay");
  const bestFor = s.bestFor.map((b) => BEST_FOR[b] ?? b).slice(0, 4);
  const suited = suitedTo([s.tagline, s.quote, ...s.why.map((w) => `${w.title ?? ""} ${w.body}`), ...s.onlyHere, ...s.rooms.items, ...s.rooms.paras, ...s.experiences.items, ...s.experiences.paras, ...s.features.items, ...s.features.paras].filter(Boolean).join(" "), s.bestFor);
  const answer = `${s.name} is a ${kind}${s.country ? ` in ${s.country}` : ""}, filed in the James Wild & Co Ledger${s.ledgerId ? ` under ${s.ledgerId}` : ""}.${s.tagline ? ` ${s.tagline.replace(/\.$/, "")}.` : ""}${s.bestMonths ? ` Best months: ${s.bestMonths}.` : ""}${suited.length ? ` Best suited to ${suited.join(", ").toLowerCase()}.` : bestFor.length ? ` Best for ${bestFor.join(", ").toLowerCase()}.` : ""}${s.airport ? ` Nearest airport: ${s.airport}.` : ""} ${status ? `${status}.` : "Vetted for the Ledger by the house."} Plan it with James or an advisor.`;
  const facts: [string, string][] = [["Ledger ID", s.ledgerId ?? "Being filed"], ...(s.country ? [["Country", s.country] as [string, string]] : []), ...(s.bestMonths ? [["Best months", s.bestMonths] as [string, string]] : []), ...(suited.length ? [["Best suited to", suited.join(", ")] as [string, string]] : bestFor.length ? [["Best for", bestFor.join(", ")] as [string, string]] : []), ...(s.airport ? [["Airport", s.airport] as [string, string]] : []), ...(status ? [["The Ledger", status] as [string, string]] : [])];
  const images = [s.hero, ...s.gallery].filter(Boolean).map((u, i) => ({ url: u as string, alt: altFor(u as string, s.name, s.country, i) }));
  const more = s.countrySlug ? staysIn(s.countrySlug).filter((x) => x.slug !== s.slug && pageReady(x)).slice(0, 4) : [];
  const chart = s.countrySlug ? CHARTS[s.countrySlug] : undefined;
  const priced = s.engine ? PRICED[s.slug] : undefined;
  const planHref = `/plan?trip=${encodeURIComponent(s.name)}`;
  // Wild Pathways: only an APPROVED classification renders, and only with the flag on.
  const pw = PATHWAYS_ON ? pathwayStays().find((r) => r.slug === s.slug) ?? null : null;
  const slides = heroSlides(`stay:${s.slug}`, s.name, s.country);
  const video = VIDEOS[`stay:${s.slug}`] ?? priced?.video ?? null;
  const host = hostFor(`stay:${s.slug}`);
  const verdict = verdictFor(`stay:${s.slug}`);
  const note = houseNote({ key: `stay:${s.slug}`, name: s.name, bestMonths: s.bestMonths, airport: s.airport, suited, rooms: s.rooms.items });
  const whyTitle = s.why[0]?.title ?? `Why ${s.name} Made the Cut`;
  const whyBlocks = s.why.length ? s.why.map((w, i) => ({ title: i === 0 && s.why[0]?.title ? null : w.title, body: w.body })) : [];
  const whyParas = s.why.length ? [] : (s.onlyHere.length ? s.onlyHere.slice(0, 2) : [s.tagline].filter(Boolean) as string[]);
  const quick = [
    ...(s.bestMonths ? [{ q: `When is the best time to visit ${s.name}?`, a: `${s.bestMonths}.${s.bestMonthsNote ? ` ${s.bestMonthsNote}` : ""}` }] : []),
    ...(suited.length ? [{ q: `Who is ${s.name} best suited to?`, a: `${suited.join(", ")}. If that's you, it's worth a conversation; if it isn't, the house will point you somewhere that is.` }] : []),
    ...(s.airport ? [{ q: `How do you get to ${s.name}?`, a: `Fly into ${s.airport}.${s.airportDirections ? ` ${s.airportDirections}` : ""} The house arranges the transfer with your booking.` }] : []),
    ...(s.rooms.items.length ? [{ q: `What rooms does ${s.name} have?`, a: `${s.rooms.items.slice(0, 8).join(", ")}.` }] : []),
    { q: `How do I book ${s.name}?`, a: `Send an enquiry, call the house on 1.800.419.7000, or book a thirty-minute call. James or an advisor confirms dates, rates and what's included before anything is booked.` },
  ];
  const overviewParas = s.why.length ? s.onlyHere : s.onlyHere.slice(2);
  const apart = momentsFor(s.slug, rowsFrom(s.features.items, s.features.paras), images.slice(1));
  const days = momentsFor(s.slug, rowsFrom(s.experiences.items, s.experiences.paras), images.slice(1), 3, apart);
  const hostEarly = host.state === "available" && !!host.host;
  const baseNav: [string, string][] = [["Why it's here", "why"], ["Film", "film"], ["Overview", "overview"], ...(apart.length ? [["What sets it apart", "features"] as [string, string]] : []), ...(days.length ? [["What you'll do", "experiences"] as [string, string]] : []), ...(images.length > 2 ? [["Gallery", "gallery"] as [string, string]] : []), ...(s.engine ? [["Live rates", "live-rates"] as [string, string]] : []), ...(s.rooms.items.length || s.rooms.paras.length ? [["Rooms", "rooms"] as [string, string]] : []), ...(hostEarly ? [["Meet the host", "host"] as [string, string]] : []), ...(s.coords && chart ? [["Location", "location"] as [string, string]] : []), ...(FULL_FRAME[s.slug] ? [["Full frame", "full-frame"] as [string, string]] : []), ...(verdict ? [["The verdict", "verdict"] as [string, string]] : []), ["Talk to us", "talk"], ["Plan", "plan"]];
  const nav: [string, string][] = priced
    ? [["Why it's here", "why"], ["Film", "film"], ["Overview", "overview"], ...(apart.length ? [["What sets it apart", "features"] as [string, string]] : []), ...(days.length ? [["What you'll do", "experiences"] as [string, string]] : []), ["Included", "included"], ["Rooms & rates", "rates"], ...(hostEarly ? [["Meet the host", "host"] as [string, string]] : []), ...(FULL_FRAME[s.slug] ? [["Full frame", "full-frame"] as [string, string]] : []), ...(s.coords && chart ? [["Location", "location"] as [string, string]] : []), ...(verdict ? [["The verdict", "verdict"] as [string, string]] : []), ["Talk to us", "talk"], ["Plan", "plan"]]
    : baseNav;
  const trail = [{ name: "Home", path: "/" }, ...(region && isBuilt(`/destinations/${region.slug}`) ? [{ name: region.name, path: `/destinations/${region.slug}` }] : [{ name: "Stays", path: "/stays" }]), ...(countryPath && isBuilt(countryPath) ? [{ name: s.country as string, path: countryPath }] : []), { name: s.name, path }];
  // Volume V (Europe) stays wear the Europe palette (aubergine) instead of the Stays green; colours only.
  return (
    <div className={s.regionSlug === "europe" ? "theme-vol-europe theme-vol-europe-page" : ""}>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <RecordHero image={images[0]} slides={slides} tag={markOn(`stay:${s.slug}`) ? (verdict ? <HeroMark style={HERO_MARK[`stay:${s.slug}`] ?? "stamp"} image={slides[1]?.url ?? slides[0]?.url} script={SCRIPT[`stay:${s.slug}`]} line={verdict.text[0]} where={verdict.where} when={verdict.when} /> : <HeroMark style="stamp" image={slides[1]?.url ?? slides[0]?.url} script={note.script} line={note.line} where={(s.country ?? "The Ledger")} when={yearOf(s.ledgerId)} label="From the house" href="#why" />) : undefined} eyebrow={`${s.country ?? "The Ledger"} · Stay`} title={s.name} tagline={s.tagline ?? undefined}
          stamp={stamp ? <FounderStamp kind={stamp} year={s.statusDate ? Number(s.statusDate.slice(0, 4)) : undefined} date={s.statusDate} place={s.country ?? undefined} ledgerId={s.ledgerId ?? undefined} /> : undefined}
          glance={<GlanceBar glance={{ facts: [["Best months", s.bestMonths ?? "Ask James"], ["Best suited to", suited[0] ?? bestFor[0] ?? "Ask James"], ["Ledger ID", s.ledgerId ?? "Being filed"]], cta: priced ? { label: "Check live rates", href: "#rates" } : { label: "Plan this stay", href: `/plan?trip=${encodeURIComponent(s.name)}` } }} />} />
        <RecordNav items={nav} cta={priced ? "Check live rates" : "Plan this stay"} ctaHref={priced ? "#rates" : planHref} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>
          <StayActions slug={s.slug} name={s.name} />
          <WhyFilm title={whyTitle} blocks={whyBlocks} paragraphs={whyParas} suited={suited} status={<>{status ? <p className="ledger-eyebrow ledger-crimson">{status}</p> : null}{pw && <div className="mt-3"><PathwayChips primary={pw.primary} secondary={pw.secondary} hrefFor={(p) => pathwayHref(p.key)} /></div>}</>} name={s.name} video={video} poster={slides[1]?.url ?? slides[0]?.url} planHref={planHref} note={verdict ? <MarginNote line={verdict.text[0]} where={verdict.where} when={verdict.when} /> : undefined} />
          <Overview quote={s.quote ?? undefined} answer={answer} facts={facts} paragraphs={overviewParas} />
          {s.regionSlug === "europe" && EUROPE_PLATES[s.slug] && <EuropePlate plate={EUROPE_PLATES[s.slug]} name={s.name} place={s.country} coords={s.coords} />}
          {founderProof(s.name, s.status as HouseStatus, s.statusDate) && <FounderProof proof={founderProof(s.name, s.status as HouseStatus, s.statusDate)!} seal={sealFor(stamp)} note={s.founderNote} className="mt-10 max-w-3xl" />}
          <OfferPanel offers={offersFor(s.slug)} volume="stays" title={`Offers at ${s.name}`} />
          {apart.length > 0 && <ImageAccordion id="features" eyebrow="What sets it apart" title="Why It's Not Just Another Pretty Place" intro={(s.features.items.length ? s.features.paras[0] : undefined) ?? "The short list of reasons it made the Ledger, and a few you only notice on the second day."} icon="frond" items={apart} />}
          {days.length > 0 && <ImageAccordion id="experiences" eyebrow="What you'll do" title="How to Fill the Days (or Not)" intro={(s.experiences.items.length ? s.experiences.paras[0] : undefined) ?? "Do all of it, some of it, or none of it. Experienced travellers usually pick two and leave the afternoons alone."} icon="mountain-sun" items={days} start={null} />}
          {!apart.length && s.features.paras.length > 0 && <Features id="features" eyebrow="What sets it apart" title="Why It's Not Just Another Pretty Place" icon="frond" body={s.features.paras[0]} />}
          {!days.length && s.experiences.paras.length > 0 && <Features id="experiences" eyebrow="What you'll do" title="How to Fill the Days (or Not)" icon="mountain-sun" body={s.experiences.paras[0]} />}
          {priced ? <>
            <Inclusions name={s.name} included={priced.included} excluded={priced.excluded} policies={priced.policies} />
            <BookingPanel hostHref={hostEarly ? "#host" : undefined} property={s.engine as string} name={s.name} rooms={priced.rooms} included={priced.included} excluded={priced.excluded} policies={priced.policies} />
          </> : <>
            {images.length > 2 && <GalleryMosaic images={images} title={s.name} />}
            {s.engine && <LiveRatesBand property={s.engine} name={s.name} />}
          </>}
          {hostEarly && priced && <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={host.state} host={host.host} stayName={s.name} kind={s.category === "lodge" ? "lodge" : "stay"} /></div>}
          {FULL_FRAME[s.slug] && <FullFrame frames={FULL_FRAME[s.slug]} name={s.name} />}
          {PHOTO_CREDIT[s.slug] && <p className="mt-4 text-[13px] ledger-muted">Photographs courtesy of {PHOTO_CREDIT[s.slug]}.</p>}
          {!priced && (s.rooms.items.length > 0 || s.rooms.paras.length > 0) && <Features id="rooms" eyebrow="Rooms & suites" title="Where You'll Sleep" icon="tree-ring" items={s.rooms.items.length ? s.rooms.items : undefined} body={s.rooms.paras[0]} />}
          {hostEarly && !priced && <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={host.state} host={host.host} stayName={s.name} kind={s.category === "lodge" ? "lodge" : "stay"} /></div>}
          {s.coords && chart && <LocationBlock chart={chart} name={s.name} pin={s.coords} others={(s.countrySlug ? staysIn(s.countrySlug) : []).filter((x) => x.coords && x.slug !== s.slug).map((x) => x.coords as { lat: number; lng: number })} heading={s.country ?? ""} rows={[...(s.airport ? [["Airport", s.airport] as [string, string]] : []), ...(s.bestMonths ? [["Best months", s.bestMonths] as [string, string]] : [])]} note={s.airportDirections ?? undefined} mark={<Roundel volume="stays" text={roundelText(s.name, s.coords, VOLUME_STYLES.stays.roman)} entry={entryNo(s.ledgerId) ? `ENTRY ${entryNo(s.ledgerId)}` : undefined} size={120} />} />}
          {Object.keys(s.facts).length > 0 && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="facts-heading">
              <p className="ledger-eyebrow ledger-crimson">Before you go</p>
              <h2 id="facts-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">{s.name} at a Glance</h2>
              <dl className="mt-6 grid md:grid-cols-2 gap-x-10 gap-y-5">{Object.entries(s.facts).map(([k, v]) => <div key={k} className="border-t ledger-border pt-3"><dt className="ledger-eyebrow">{k.replace(/_/g, " ")}</dt><dd className="mt-1.5 text-[16px] leading-relaxed">{v}</dd></div>)}</dl>
            </section>
          )}
          {(() => {
            // A reserve with its own page (camps, residences, compare table) gets pointed to from here.
            const rv = RESERVES.find((r) => r.slug === s.slug || r.camps.some((c) => c.stayHref === `/stays/${s.slug}`));
            if (!rv) return null;
            const own = rv.slug === s.slug;
            return (
              <section aria-label="The reserve" className="mt-16 border ledger-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><p className="ledger-eyebrow ledger-crimson">{own ? "The camps" : "On the reserve"}</p><p className="ledger-display text-[1.5rem] mt-1">{own ? `${rv.name} has ${rv.camps.length} ways to stay` : `${s.name} is one of ${rv.camps.length} lodges on ${rv.name}`}</p><p className="mt-1 text-[15px] ledger-muted">{rv.camps.map((c) => c.name).join(", ")}. Compare them side by side, with who each one suits.</p></div>
                <Link href={`/safaris/${rv.slug}`} className="ledger-btn self-start md:self-center">{own ? "See the camps" : `See ${rv.name}`}</Link>
              </section>
            );
          })()}
          <GatewayNight country={s.countrySlug} exclude={s.slug} />
          {routesThrough(s.slug).length > 0 && (
            <section aria-label="On these routes" className="mt-16">
              <p className="ledger-eyebrow ledger-crimson">On these routes</p>
              <ul className="mt-3 grid md:grid-cols-2 gap-4">
                {routesThrough(s.slug).map((t) => <li key={t.id}><Link href={t.seo.path} className="block border ledger-border hover:border-crimson/60 p-5"><span className="ledger-display text-[1.35rem]">{t.h1}</span><span className="block text-[14px] ledger-muted mt-1">{t.sub}</span><span className="block text-[15px] mt-2">{t.herofacts[1]?.[1]}</span></Link></li>)}
              </ul>
            </section>
          )}
          {collectionForStay(s.slug) && (
            <section aria-label="Part of a collection" className="mt-16 border ledger-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div><p className="ledger-eyebrow ledger-crimson">Part of a collection</p><p className="ledger-display text-[1.5rem] mt-1">{s.name} is one of seven Cayuga Collection hotels</p><p className="mt-1 text-[15px] ledger-muted">Sustainably run boutique hotels across Costa Rica, Panama, Nicaragua and Guatemala, and how to pair them.</p>{offerForStay(s.slug) && <p className="mt-3 text-[15.5px]"><span className="ledger-eyebrow ledger-crimson mr-2">{offerForStay(s.slug)!.program}</span>{offerForStay(s.slug)!.headline}, travel {offerForStay(s.slug)!.travel}.</p>}</div>
              <Link href={offerForStay(s.slug) ? `${collectionForStay(s.slug)!.path}#offers` : collectionForStay(s.slug)!.path} className="ledger-btn self-start md:self-center">{offerForStay(s.slug) ? "See the offer" : "See the collection"}</Link>
            </section>
          )}
          <FromTheJournal posts={postsForStay(s.slug)} />
          <SessionsFor sessions={sessionsFor(`/stays/${s.slug}`)} name={s.name} />
          <AdvisorStrip place={s.name} ledgerId={s.ledgerId} className="mt-16 md:mt-24" />
          <FaqBlock faqs={s.faqs.length ? s.faqs : quick} title={`${s.name}, Answered Straight`} />
          {more.length > 0 && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="more-heading">
              <p className="ledger-eyebrow ledger-crimson">Also in {s.country}</p>
              <h2 id="more-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">More Stays We&rsquo;d Send You To</h2>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{more.map((x) => <li key={x.slug}><RecordCard name={x.name} id={x.ledgerId ?? ""} line={x.tagline ?? ""} image={{ url: x.hero as string, alt: `${x.name}, ${x.country}` }} href={recordHref("stay", x.slug)} /></li>)}</ul>
            </section>
          )}
          {IGGI_ON && (
            /* Iggi Intelligence Core, Stage 2 (flag NEXT_PUBLIC_IGGI=on): Iggi answers from the Ledger with this stay as page context. */
            <IggiPanel ctx={{ entityType: "stay", entitySlug: s.slug, countrySlug: s.countrySlug ?? null, ledgerId: s.ledgerId ?? null, sourcePage: path, volume: s.volumes?.[0] ?? "stays" }} heading={`Ask Iggi about ${s.name}`} />
          )}
          {verdict && <VerdictCard k={`stay:${s.slug}`} name={s.name} v={verdict} stamp={entryNo(s.ledgerId) ? <InkStamp volume="stays" no={entryNo(s.ledgerId)!} size={170} /> : undefined} />}
          {pw && <>
            {/* Wild Pathways (Phase 2C, flag on + approved record): Where Your Stay Gives Back and Follow the Pathway. */}
            {pw.impact.length > 0 && <ImpactNote name={s.name} statements={pw.impact} />}
            <FollowThePathway primary={pw.primary} secondary={pw.secondary} related={onPathway(pw.primaryPathway).filter((x) => x.slug !== s.slug).slice(0, 4)} pathwayHref={(p) => pathwayHref(p.key)} />
            <IggiLine line={dialogueLine("iggi.nudge.follow-pathway")} className="mt-8"><Link href={pathwayHref(pw.primary.key)} className="underline underline-offset-2 hover:text-crimson">Walk {pw.primary.name}.</Link></IggiLine>
          </>}
          <TalkToUs name={s.name} planHref={planHref} />
          {host.state !== "off" && !hostEarly && <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={host.state} host={host.host} stayName={s.name} kind={s.category === "lodge" ? "lodge" : "stay"} /></div>}
          <PlanBand place={s.name} compassHref="/compass" />
        </div>
        {hostEarly && <CallingCard who={HOST_KIND[s.category === "lodge" ? "lodge" : "stay"].who} seats={host.host?.seats} />}
      </main>
      <ContactBar name={s.name} planHref={planHref} />
      <ContactPill name={s.name} planHref={planHref} />
      {video && <JsonLd data={{ "@context": "https://schema.org", "@type": "VideoObject", name: FILM_CREDITS[video.id]?.title ?? video.title, description: FILM_CREDITS[video.id] ? `${FILM_CREDITS[video.id].seriesLine}, filmed at ${s.name}. ${FILM_CREDITS[video.id].credit}.` : `${s.name}: the stay film, from the James Wild & Co Ledger.`, thumbnailUrl: [`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`], embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`, contentUrl: `https://www.youtube.com/watch?v=${video.id}`, uploadDate: "2026-10-25", ...filmCreditSchema(video.id) }} />}
      {verdict && <JsonLd data={graph(verdictSchema(verdict, s.name, absoluteUrl(path), ids.founder))} />}
      <JsonLd data={graph({ ...lodging({ path, name: s.name, description: answer, image: (slides.length ? slides : images).slice(0, 5).map((i) => { const u = i.url.startsWith("/") ? absoluteUrl(i.url) : i.url; return PHOTO_CREDIT[s.slug] ? imageObject(u, i.alt, PHOTO_CREDIT[s.slug]) : u; }), subtype: s.category === "resort" ? "Resort" : s.category === "hotel" ? "Hotel" : "LodgingBusiness", country: s.country ?? undefined, geo: s.coords ?? undefined, ledgerId: s.ledgerId ?? undefined }), ...(apart.length ? { amenityFeature: apart.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.title, value: true })) } : {}), ...(suited.length ? { audience: suited.map((t) => ({ "@type": "PeopleAudience", audienceType: t })), keywords: [s.name, s.country, ...suited].filter(Boolean).join(", ") } : {}) })} />
    </div>
  );
}
