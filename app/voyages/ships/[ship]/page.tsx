import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown, Ship, Users } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import HostPanel, { KIND as HOST_KIND } from "@/components/record/HostPanel";
import CallingCard from "@/components/record/CallingCard";
import Signature from "@/components/record/Signature";
import { FounderStamp, Overview, RecordHero, RecordNav, SectionHead, WhyChose } from "@/components/record/Sections";
import { GalleryMosaic, GlanceBar, RecordActionBar } from "@/components/record/Frame";
import { ALIIKAI_SHIP } from "@/lib/content/ships/aliikai";
import { FILMS, filmSchema } from "@/lib/content/films";
import { hostFor } from "@/lib/content/hosts";
import { usd } from "@/lib/pricing";
import { buildMetadata } from "@/lib/seo";

// /voyages/ships/<ship> — the vessel profile: the ship, her cabins and every
// voyage she sails, with the 2027 dates. Voyage pages carry the day by day.
const SHIPS = { aliikai: ALIIKAI_SHIP } as const;
const SITE = "https://www.jameswildco.com";

export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(SHIPS).map((ship) => ({ ship })); }
type P = { params: Promise<{ ship: string }> };
export async function generateMetadata({ params }: P) {
  const s = SHIPS[(await params).ship as keyof typeof SHIPS];
  if (!s) return {};
  // Hidden from search until James signs off, like the voyage pages (flip noindex then).
  return { ...buildMetadata({ title: s.seo.title, description: s.seo.description, path: s.path, noindex: true, image: { url: FILMS.aliikai.poster, alt: FILMS.aliikai.alt } }), keywords: s.seo.keywords };
}

const tone = (st: string) => /full/i.test(st) ? "bg-ink/10 text-ink/60 line-through decoration-ink/30" : /left/i.test(st) ? "bg-[#F1E2B8] text-[#5E3F22]" : "bg-[#DCE8DF] text-[#25543B]";
const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32";

export default async function ShipPage({ params }: P) {
  const s = SHIPS[(await params).ship as keyof typeof SHIPS];
  if (!s) notFound();
  const film = FILMS.aliikai;
  const host = hostFor("voyage:aliikai");
  const url = `${SITE}${s.path}`;

  const jsonld = [
    filmSchema(film, url),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${url}#voyages`,
      name: "Aliikai voyages, 2027",
      itemListElement: s.groups.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "TouristTrip",
          name: `${g.name} aboard Aliikai`,
          ...(s.pages[g.name] ? { url: `${SITE}${s.pages[g.name].href}` } : {}),
          description: `${g.nights} aboard the phinisi Aliikai, ${s.where[g.name]?.waters ?? "Indonesia"}. ${g.sailings.length} sailing${g.sailings.length > 1 ? "s" : ""} in 2027.`,
          offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: Math.min(...g.sailings.map((x) => x.price)), highPrice: Math.max(...g.sailings.map((x) => x.price)), offerCount: g.sailings.length },
          provider: { "@type": "TravelAgency", name: "James Wild & Co", url: SITE },
        },
      })),
    },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Home", "/"], ["Voyages", "/voyages"], ["Aliikai", s.path]].map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE}${p}` })) },
  ];

  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader overlay />
      <main id="main">
        <RecordHero film={film} image={s.gallery[0]} eyebrow={`Wild & Co Voyages · The vessel · ${s.ledgerId}`} title={s.name} tagline={s.tagline}
          stamp={<FounderStamp kind="Field verified" year={2024} volume="voyages" size={140} />}
          glance={<GlanceBar glance={{ price: { amount: usd(s.low), basis: "per person, 2027 · + 11% tax" }, facts: [["Cabins", "7 · 14 guests"], ["Waters", "Raja Ampat · Komodo"], ["Charter", "US$10,900 a night"]], photos: s.gallery.length, cta: { label: "See 2027 dates", href: "#departures" } }} />} />
        <RecordNav items={[["In short", "overview"], ["Photos", "gallery"], ["Life aboard", "aboard"], ["Cabins", "cabins"], ["The voyages", "voyages"], ["2027 dates", "departures"], ["Charter", "charter"], ["Sailed by James", "founder"], ["FAQ", "faq-heading"]]} cta="Ask about Aliikai" ctaHref="/plan?trip=Aliikai" />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: "Aliikai", path: s.path }]} /></div>
          <Overview quote={s.quote} answer={s.answer} facts={s.facts} paragraphs={[s.blurb]} />

          <GalleryMosaic images={s.gallery} title={s.name} />
          <WhyChose eyebrow={s.why.eyebrow} title={s.why.title} blocks={[...s.why.paragraphs.map((b) => ({ body: b })), ...s.onlyHere.map((b) => ({ body: b }))]}
            status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">Field verified · 2024</span> · James sailed Raja Ampat aboard Aliikai in November 2024</p>} />

          {/* Life aboard: the ship's story and her spaces */}
          <section id="aboard" className={SEC}>
            <SectionHead eyebrow={s.story.eyebrow} title="Life Aboard" icon="wave" intro={s.story.intro} />
            <div className="mt-8 grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
              <div>
                <p className="text-[16px] leading-relaxed ledger-muted">{s.story.body}</p>
                <div className="mt-6 space-y-2">
                  {s.spaces.map((sp, i) => (
                    <details key={sp.name} className="group border ledger-border open:border-crimson/50 open:bg-paper-card" open={i === 0}>
                      <summary className="cursor-pointer list-none flex items-center gap-3 px-4 py-3 hover:bg-paper-card [&::-webkit-details-marker]:hidden">
                        <span className="flex-1 min-w-0"><span className="block ledger-display text-[18px]">{sp.name}</span><span className="block text-[13px] ledger-muted">{sp.line}</span></span>
                        <ChevronDown className="w-5 h-5 shrink-0 ledger-crimson transition-transform group-open:rotate-180" strokeWidth={1.5} aria-hidden="true" />
                      </summary>
                      <div className="px-4 pb-4">
                        <p className="text-[15px] leading-relaxed">{sp.body}</p>
                        <div className={`mt-3 grid gap-2 ${sp.photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>{sp.photos.slice(0, 2).map((ph) => <div key={ph.url} className="relative aspect-[4/3]"><Image src={ph.url} alt={ph.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /></div>)}</div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
              <dl className="ledger-paper border ledger-border p-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14.5px]">
                {s.facts.map(([k, v]) => <div key={k} className="contents"><dt className="ledger-muted">{k}</dt><dd>{v}</dd></div>)}
              </dl>
            </div>
          </section>

          {/* Cabins with 2027 nightly rates */}
          <section id="cabins" className={SEC}>
            <SectionHead eyebrow="Cabins & rates · 2027" title="Seven Cabins on Three Decks" icon="tree-ring" intro="Every cabin is en-suite with air conditioning. Rates are 2027 published, per person per night, double occupancy, plus 11% tax." />
            <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {s.cabins.map((c) => (
                <li key={c.name} className="border ledger-border flex flex-col">
                  <div className="relative aspect-[3/2]"><Image src={c.photos[0].url} alt={c.photos[0].alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>
                  {c.photos.length > 1 && <div className="grid grid-cols-2 gap-1 mt-1">{c.photos.slice(1, 3).map((ph) => <div key={ph.url} className="relative aspect-[3/2]"><Image src={ph.url} alt={ph.alt} fill sizes="(max-width: 768px) 50vw, 16vw" className="object-cover" /></div>)}</div>}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="ledger-eyebrow ledger-crimson">{c.cat}</p>
                    <h3 className="ledger-display text-[20px] mt-0.5">{c.name}</h3>
                    <p className="text-[13.5px] ledger-muted mt-1">{c.deck} · {c.bed} · sleeps {c.sleeps}</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">{c.feats.map((f) => <li key={f} className="text-[11.5px] border ledger-border px-2 py-0.5">{f}</li>)}</ul>
                    <p className="mt-auto pt-4 border-t ledger-border"><span className="ledger-display ledger-crimson text-[19px]">{usd(c.night)}</span><span className="text-[12px] ledger-muted"> per person, per night</span></p>
                  </div>
                </li>
              ))}
            </ul>
            {s.source && <p className="mt-4 text-[12px] ledger-muted">Yacht, cabin and rate details from {s.source}.</p>}
          </section>

          {/* Every voyage she sails in 2027 */}
          <section id="voyages" className={SEC}>
            <SectionHead eyebrow="The voyages · 2027" title="Where Aliikai Sails" icon="wave" intro="Komodo in the dry season, the Spice Islands in October and Raja Ampat when its seas are calmest. Open a voyage for its day by day." />
            <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {s.groups.map((g) => {
                const p = s.pages[g.name];
                const w = s.where[g.name];
                const from = Math.min(...g.sailings.map((x) => x.price));
                const inner = (
                  <>
                    <p className="ledger-eyebrow ledger-crimson">{w?.waters} · {g.nights}</p>
                    <p className="ledger-display text-[21px] mt-1">{g.name}</p>
                    <p className="text-[14px] ledger-muted mt-1">{w?.months} · from {w?.from}</p>
                    <p className="mt-4 pt-3 border-t ledger-border flex items-baseline justify-between gap-3"><span><span className="ledger-eyebrow">From </span><span className="ledger-display ledger-crimson text-[18px]">{usd(from)}</span></span><span className="text-[13px] text-right">{p ? <>{p.name} →</> : "Day by day to come"}</span></p>
                  </>
                );
                return <li key={g.name}>{p ? <Link href={p.href} className="block h-full border ledger-border p-5 hover:border-crimson/60 transition-colors">{inner}</Link> : <div className="h-full border ledger-border p-5">{inner}</div>}</li>;
              })}
            </ul>
          </section>

          {/* 2027 dates & rates, grouped by voyage */}
          <section id="departures" className={SEC}>
            <SectionHead eyebrow="Departures" title="2027 Dates & Rates" icon="sun" intro="Every 2027 sailing, by voyage. Prices are per person in an ocean-view cabin, double occupancy, plus 11% tax." />
            <div className="mt-8 space-y-2">
              {s.groups.map((g) => {
                const open = g.sailings.filter((x) => !/full/i.test(x.status)).length;
                const from = Math.min(...g.sailings.map((x) => x.price));
                return (
                  <details key={g.name} className="group border ledger-border open:border-crimson/50 open:bg-paper-card">
                    <summary className="cursor-pointer list-none flex flex-wrap items-center gap-x-4 gap-y-1 px-4 md:px-5 py-4 hover:bg-paper-card [&::-webkit-details-marker]:hidden">
                      <span className="flex-1 min-w-[12rem]"><span className="block ledger-display text-[19px] md:text-[21px]">{g.name}</span><span className="block text-[13px] ledger-muted">{g.nights} · {g.sailings.length} sailing{g.sailings.length > 1 ? "s" : ""} · {open} with space</span></span>
                      <span className="text-right"><span className="ledger-eyebrow block">From</span><span className="ledger-display ledger-crimson text-[18px]">{usd(from)}</span></span>
                      <ChevronDown className="w-5 h-5 shrink-0 ledger-crimson transition-transform group-open:rotate-180" strokeWidth={1.5} aria-hidden="true" />
                    </summary>
                    <div className="px-4 md:px-5 pb-4">
                      <ul>{g.sailings.map((r) => (
                        <li key={r.date} className="border-t ledger-border py-3 grid grid-cols-[1fr_auto] md:grid-cols-[2fr_0.6fr_1.4fr_1.2fr_auto] gap-x-3 gap-y-1 items-center text-[14.5px]">
                          <span className="ledger-display text-[16px] md:font-serif md:text-[14.5px]">{r.date}</span>
                          <span className="hidden md:block">{r.nights} nights</span>
                          <span className="order-3 md:order-none">{usd(r.price)} <span className="text-[12px] ledger-muted">+ 11% tax<span className="md:hidden"> · {r.nights} nights</span></span></span>
                          <span className="order-2 md:order-none justify-self-end md:justify-self-start"><span className={`text-[11.5px] px-2 py-0.5 whitespace-nowrap ${tone(r.status)}`}>{r.status}</span></span>
                          <span className="order-4 md:order-none justify-self-end"><a href={`/plan?trip=${encodeURIComponent(`${g.name}, Aliikai`)}&date=${encodeURIComponent(r.date)}${/full/i.test(r.status) ? "&waitlist=1" : ""}`} className="ledger-btn-ghost">{/full/i.test(r.status) ? "Waitlist" : "Hold a cabin"}</a></span>
                        </li>))}</ul>
                    </div>
                  </details>
                );
              })}
            </div>
            <p className="mt-3 text-[12px] ledger-muted">Availability from {s.depSource}; we confirm it live when you ask.</p>
          </section>

          {/* Private charter */}
          <section id="charter" className={SEC}>
            <div className="grid md:grid-cols-[1.3fr_1fr] gap-8 items-center ledger-paper border ledger-border p-6 md:p-8">
              <div>
                <p className="ledger-eyebrow ledger-crimson flex items-center gap-2"><Users className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Private charter</p>
                <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2">Take the Yacht Whole</h2>
                <p className="mt-3 text-[16px] leading-relaxed">{s.charter.text}</p>
                <Link href="/plan?trip=Aliikai%20private%20charter" className="mt-6 ledger-btn ledger-btn--solid">Ask about a charter</Link>
              </div>
              <p className="text-right"><span className="ledger-eyebrow block">The whole yacht</span><span className="ledger-display text-5xl ledger-crimson">{usd(s.charter.rate)}</span><span className="block text-[13px] ledger-muted">per night · up to 15 guests · + 11% tax</span></p>
            </div>
          </section>

          {/* Sailed by James */}
          <section id="founder" className={`${SEC} grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start`}>
            <div>
              <div className="flex items-center gap-2"><Ship className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /><p className="ledger-eyebrow">Vetted & sailed by the founder</p></div>
              <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2">{s.founder.title}</h2>
              <p className="mt-4 text-[17px] leading-relaxed">{s.founder.p1}</p>
              <p className="mt-3 text-[17px] leading-relaxed">{s.founder.p2}</p>
              <p className="mt-5 italic ledger-display text-[20px] leading-snug">&ldquo;{s.quote}&rdquo;</p>
              <Signature className="w-32 mt-3" />
            </div>
            <div className="relative aspect-[4/5] border ledger-border"><Image src={s.gallery[1]?.url ?? s.gallery[0].url} alt={s.gallery[1]?.alt ?? s.gallery[0].alt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" /></div>
          </section>

          <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={host.state} host={host.host} stayName="Aliikai" kind="vessel" /></div>
          <FaqBlock faqs={s.faqs.map(([q, a]) => ({ q, a }))} title="Questions About Aliikai" />
        </div>
        {host.state === "available" && <CallingCard who={HOST_KIND.vessel.who} />}
      </main>
      <RecordActionBar price={usd(s.low)} basis="pp · 2027" cta="2027 dates" />
      <JsonLd data={jsonld} />
    </div>
  );
}
