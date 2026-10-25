import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { notFound } from "next/navigation";
import { GalleryMosaic, GlanceBar, LocationBlock } from "@/components/record/Frame";
import { Features, FounderStamp, Overview, RecordHero, RecordNav, WhyChose } from "@/components/record/Sections";
import LiveRatesBand from "@/components/record/LiveRatesBand";
import FullFrame from "@/components/record/FullFrame";
import { FULL_FRAME } from "@/lib/content/stay-media";
import PlanBand from "@/components/destination/PlanBand";
import { RecordCard } from "@/components/hub/Hub";
import { CHART_COSTA_RICA } from "@/lib/charts/costa-rica";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import type { ChartData } from "@/components/destination/LedgerChart";
import { BEST_FOR, STAY_PAGES, staysIn, stayBySlug, pageReady } from "@/lib/content/stays";
import { regionBySlug } from "@/lib/content/regions";
import { stampForStatus, statusLine, type HouseStatus } from "@/lib/ledger/status";
import { recordHref } from "@/lib/ledger/urls";
import { isBuilt } from "@/lib/routes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, lodging } from "@/lib/schema";

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
    title: `${s.name}${s.country ? `, ${s.country}` : ""}: Vetted Stay | James Wild & Co`,
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
  const kind = (s.category && KIND[s.category]) || "stay";
  const bestFor = s.bestFor.map((b) => BEST_FOR[b] ?? b).slice(0, 4);
  const answer = `${s.name} is a ${kind}${s.country ? ` in ${s.country}` : ""}, filed in the James Wild & Co Ledger${s.ledgerId ? ` under ${s.ledgerId}` : ""}.${s.tagline ? ` ${s.tagline.replace(/\.$/, "")}.` : ""}${s.bestMonths ? ` Best months: ${s.bestMonths}.` : ""}${bestFor.length ? ` Best for ${bestFor.join(", ").toLowerCase()}.` : ""}${s.airport ? ` Nearest airport: ${s.airport}.` : ""} ${status ? `${status}.` : "Vetted for the Ledger by the house."} Plan it with James or an advisor.`;
  const facts: [string, string][] = [["Ledger ID", s.ledgerId ?? "Being filed"], ...(s.country ? [["Country", s.country] as [string, string]] : []), ...(s.bestMonths ? [["Best months", s.bestMonths] as [string, string]] : []), ...(bestFor.length ? [["Best for", bestFor.join(", ")] as [string, string]] : []), ...(s.airport ? [["Airport", s.airport] as [string, string]] : []), ...(status ? [["The Ledger", status] as [string, string]] : [])];
  const images = [s.hero, ...s.gallery].filter(Boolean).map((u, i) => ({ url: u as string, alt: `${s.name}${i ? `, photograph ${i + 1}` : ""}${s.country ? `, ${s.country}` : ""}` }));
  const more = s.countrySlug ? staysIn(s.countrySlug).filter((x) => x.slug !== s.slug && pageReady(x)).slice(0, 4) : [];
  const chart = s.countrySlug ? CHARTS[s.countrySlug] : undefined;
  const nav: [string, string][] = [["Overview", "overview"], ...(images.length > 2 ? [["Gallery", "gallery"] as [string, string]] : []), ...(s.engine ? [["Live rates", "live-rates"] as [string, string]] : []), ...(s.why.length ? [["Why it's here", "why"] as [string, string]] : []), ...(s.rooms.items.length || s.rooms.paras.length ? [["Rooms", "rooms"] as [string, string]] : []), ...(s.coords && chart ? [["Location", "location"] as [string, string]] : []), ...(FULL_FRAME[s.slug] ? [["Full frame", "full-frame"] as [string, string]] : []), ["Plan", "plan"]];
  const trail = [{ name: "Home", path: "/" }, ...(region && isBuilt(`/destinations/${region.slug}`) ? [{ name: region.name, path: `/destinations/${region.slug}` }] : [{ name: "Stays", path: "/stays" }]), ...(countryPath && isBuilt(countryPath) ? [{ name: s.country as string, path: countryPath }] : []), { name: s.name, path }];
  return (
    <>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <RecordHero image={images[0]} eyebrow={`${s.country ?? "The Ledger"} · Stay`} title={s.name} tagline={s.tagline ?? undefined}
          stamp={stamp ? <FounderStamp kind={stamp} year={s.statusDate ? Number(s.statusDate.slice(0, 4)) : undefined} /> : undefined}
          glance={<GlanceBar glance={{ facts: [["Best months", s.bestMonths ?? "Ask James"], ["Best for", bestFor[0] ?? "Ask James"], ["Ledger ID", s.ledgerId ?? "Being filed"]], cta: { label: "Plan this stay", href: `/plan?trip=${encodeURIComponent(s.name)}` } }} />} />
        <RecordNav items={nav} cta="Plan this stay" />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>
          <Overview quote={s.quote ?? undefined} answer={answer} facts={facts} paragraphs={s.onlyHere} />
          {images.length > 2 && <GalleryMosaic images={images} title={s.name} />}
          {s.engine && <LiveRatesBand property={s.engine} name={s.name} />}
          {s.why.length > 0 && <WhyChose title={`Why ${s.name} Is in the Ledger`} blocks={s.why.map((w) => ({ title: w.title ?? undefined, body: w.body }))} status={status ? <p className="ledger-eyebrow ledger-crimson">{status}</p> : null} />}
          {FULL_FRAME[s.slug] && <FullFrame frames={FULL_FRAME[s.slug]} name={s.name} />}
          {(s.rooms.items.length > 0 || s.rooms.paras.length > 0) && <Features id="rooms" eyebrow="Rooms & suites" title="Where You'll Sleep" icon="tree-ring" items={s.rooms.items.length ? s.rooms.items : undefined} body={s.rooms.paras[0]} />}
          {(s.experiences.items.length > 0 || s.experiences.paras.length > 0) && <Features id="experiences" eyebrow="Experiences" title="What You'll Do" icon="mountain-sun" items={s.experiences.items.length ? s.experiences.items : undefined} body={s.experiences.paras[0]} />}
          {(s.features.items.length > 0 || s.features.paras.length > 0) && <Features id="features" eyebrow="Stay features" title="What Sets It Apart" icon="frond" items={s.features.items.length ? s.features.items : undefined} body={s.features.paras[0]} />}
          {s.coords && chart && <LocationBlock chart={chart} name={s.name} pin={s.coords} others={(s.countrySlug ? staysIn(s.countrySlug) : []).filter((x) => x.coords && x.slug !== s.slug).map((x) => x.coords as { lat: number; lng: number })} heading={s.country ?? ""} rows={[...(s.airport ? [["Airport", s.airport] as [string, string]] : []), ...(s.bestMonths ? [["Best months", s.bestMonths] as [string, string]] : [])]} note={s.airportDirections ?? undefined} />}
          {Object.keys(s.facts).length > 0 && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="facts-heading">
              <p className="ledger-eyebrow ledger-crimson">Before you go</p>
              <h2 id="facts-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">{s.name} at a Glance</h2>
              <dl className="mt-6 grid md:grid-cols-2 gap-x-10 gap-y-5">{Object.entries(s.facts).map(([k, v]) => <div key={k} className="border-t ledger-border pt-3"><dt className="ledger-eyebrow">{k.replace(/_/g, " ")}</dt><dd className="mt-1.5 text-[16px] leading-relaxed">{v}</dd></div>)}</dl>
            </section>
          )}
          {s.faqs.length > 0 && <FaqBlock faqs={s.faqs} title={`${s.name}, answered`} />}
          {more.length > 0 && (
            <section className="mt-16 md:mt-24 border-t ledger-rule pt-8" aria-labelledby="more-heading">
              <p className="ledger-eyebrow ledger-crimson">Also in {s.country}</p>
              <h2 id="more-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">More Stays We&rsquo;d Send You To</h2>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{more.map((x) => <li key={x.slug}><RecordCard name={x.name} id={x.ledgerId ?? ""} line={x.tagline ?? ""} image={{ url: x.hero as string, alt: `${x.name}, ${x.country}` }} href={recordHref("stay", x.slug)} /></li>)}</ul>
            </section>
          )}
          <PlanBand place={s.name} compassHref="/compass" />
        </div>
      </main>
      <JsonLd data={graph(lodging({ path, name: s.name, description: answer, image: images.slice(0, 4).map((i) => i.url.startsWith("/") ? absoluteUrl(i.url) : i.url), subtype: s.category === "resort" ? "Resort" : s.category === "hotel" ? "Hotel" : "LodgingBusiness", country: s.country ?? undefined, geo: s.coords ?? undefined, ledgerId: s.ledgerId ?? undefined }))} />
    </>
  );
}
