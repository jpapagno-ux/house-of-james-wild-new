import type React from "react";
import Image from "next/image";
import GuideOffer from "@/components/guides/GuideOffer";
import { guidesFor } from "@/lib/content/field-guides";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import Journeys from "@/components/destination/Journeys";
import WhenToGo from "@/components/destination/WhenToGo";
import PlanBand from "@/components/destination/PlanBand";
import FounderProof from "@/components/record/FounderProof";
import { Overview, RecordHero, RecordNav, SectionHead } from "@/components/record/Sections";
import { GUIDES, RAJA_VS_KOMODO, type Guide } from "@/lib/content/guides";
import ComingTicker from "@/components/coming/ComingTicker";
import { countryBoard } from "@/lib/content/board";
import { comingOn } from "@/lib/content/whats-coming";
import { today } from "@/lib/dates";
import { journeysFor } from "@/lib/content/preview/journeys";
import { countryBySlug } from "@/lib/content/countries";
import { regionBySlug } from "@/lib/content/regions";
import { pageReady, stayBySlug, staysIn } from "@/lib/content/stays";
import { guideSlides } from "@/lib/content/guide-slides";
import { RecordCard } from "@/components/hub/Hub";
import IslandZoom from "@/components/destination/IslandZoom";
import SeeIn3D from "@/components/maps/terrain/SeeIn3D";
import { terrainRoute } from "@/components/maps/terrain/routed";
import { readRoute } from "@/lib/content/ships/routes";
import type { TerrainPage } from "@/components/maps/terrain/flag";
import { volumeMark } from "@/lib/volumes";
import ChartFlyover from "@/components/destination/ChartFlyover";
import { flyover } from "@/lib/content/flyovers";
import { absoluteUrl } from "@/lib/seo";
import { graph, imageObject } from "@/lib/schema";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import StayFilter from "@/components/destination/StayFilter";
import { Headshot } from "@/components/advisor/Desk";
import { advisorsFor } from "@/lib/content/advisors";
import { COUNTRY_PAGES, shortAnswer } from "@/lib/content/country-pages";
import type { BoardEntry } from "@/lib/content/coming-view";

// A destination guide: the page someone lands on from "Raja Ampat travel guide"
// or "best time to visit Komodo". Answer first, then the months and the way in,
// the founder's testimony, what to see, who it suits, how to see it (the
// voyages), Raja Ampat vs Komodo, FAQs with schema, and the sources.
const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10";
// The Raja Ampat vs Komodo table belongs to the three Indonesia guides only.
const SEA_PAIR = new Set(["indonesia", "raja-ampat", "komodo"]);

/** The new country page (lib/content/country-layout.ts): the atlas, the live board, James's signed notes, and whether
 *  drafts for James may show (previews only). */
export type CountryV2 = { atlas: React.ReactNode; board: BoardEntry[]; boardLabel: string; notes: { text: string; year: number; name: string; href: string }[]; drafts: boolean };

export default function GuidePage({ g, map, geoInSchema = false, v2 }: { g: Guide; /** The Ledger chart of the guide's stays and voyage ports (country guides). */ map?: React.ReactNode; v2?: CountryV2;
  /** The country atlas: each stay in containsPlace carries its filed pin (on where flag.ts atlasOn is on). */ geoInSchema?: boolean }) {
  // A parent is another guide (Raja Ampat → Indonesia) or a library country (Rapa Nui → Chile).
  const parentGuide = g.parent ? GUIDES[g.parent] : undefined;
  const parentCountry = g.parent && !parentGuide ? countryBySlug(g.region, g.parent) : undefined;
  const parent = parentGuide ? { name: parentGuide.name, path: parentGuide.path, id: `${parentGuide.path}#place` } : parentCountry ? { name: parentCountry.name, path: `/destinations/${parentCountry.region}/${parentCountry.slug}`, id: `/destinations/${parentCountry.region}/${parentCountry.slug}#destination` } : undefined;
  const region = regionBySlug(g.region);
  const voyages = journeysFor(g.country).filter((j) => g.voyageWaters.some((w) => j.eyebrow.includes(w)));
  const compare = SEA_PAIR.has(g.slug);
  const RANK: Record<string, number> = { founder_returned: 0, founder_visited: 1, founder_vetted: 2 };
  const stays = g.countryStays
    ? staysIn(g.country).filter((s) => !!s.hero && pageReady(s)).sort((a, b) => (RANK[a.status ?? ""] ?? 9) - (RANK[b.status ?? ""] ?? 9) || a.name.localeCompare(b.name))
    : (g.stays ?? []).map((slug) => stayBySlug(slug)).filter((s): s is NonNullable<typeof s> => !!s && !!s.hero);
  const slides = guideSlides(g);
  const trail = [{ name: "Home", path: "/" }, { name: "Destinations", path: "/destinations" }, { name: region?.name ?? g.region, path: `/destinations/${g.region}` }, ...(parent ? [{ name: parent.name, path: parent.path }] : []), { name: g.name, path: g.path }];
  const nav: [string, string][] = [["In short", "overview"], ["When to go", "when"], ["Highlights", "highlights"], ...(g.firstTime ? [["First visit", "first-time"] as [string, string]] : []), ["Who it suits", "suits"], ...(stays.length ? [["Where to stay", "stays"] as [string, string]] : []), ["How to see it", "how"], ...(voyages.length ? [["Voyages", "journeys"] as [string, string]] : []), ...(compare ? [["Raja Ampat vs Komodo", "compare"] as [string, string]] : []), ["FAQ", "faq-heading"]];

  const schema = graph(
    {
      "@type": "TouristDestination",
      "@id": absoluteUrl(`${g.path}#place`),
      name: g.name,
      description: g.answer,
      url: absoluteUrl(g.path),
      geo: { "@type": "GeoCoordinates", latitude: g.geo.lat, longitude: g.geo.lng },
      containedInPlace: parent ? { "@id": absoluteUrl(parent.id), name: parent.name } : { "@type": "Country", name: g.name },
      ...(stays.length ? { containsPlace: stays.map((s) => ({ "@id": absoluteUrl(`/stays/${s.slug}#stay`), name: s.name, ...(geoInSchema && s.coords ? { geo: { "@type": "GeoCoordinates", latitude: s.coords.lat, longitude: s.coords.lng } } : {}) })) } : {}),
      ...(g.ledgerId ? { identifier: { "@type": "PropertyValue", propertyID: "Ledger ID", value: g.ledgerId } } : {}),
      touristType: g.suits.map((s) => s.who),
      includesAttraction: g.highlights.map((h) => ({ "@type": "TouristAttraction", name: h.title, description: h.body })),
      // Borrowed stay frames carry the brand credit into the image data; the guides with their own photographs are unchanged.
      image: g.slidesFromStay ? slides.map((s) => imageObject(s.url, s.alt, s.credit)) : slides.map((s) => s.url),
    },
  );

  const placesSec = (
    <>
          {g.places && (
            <section id="places" className={SEC}>
              <SectionHead eyebrow={`Inside ${g.name}`} title="Where to Go" icon="wave" intro="The places the house sends people, each with its own guide." />
              <ul className="mt-8 grid gap-5 md:grid-cols-2">
                {g.places.map((p) => (
                  <li key={p.href}>
                    <Link href={p.href} className="group block border ledger-border hover:border-crimson/60 transition-colors">
                      <div className="relative aspect-[16/9] overflow-hidden"><Image src={p.image.url} alt={p.image.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" /></div>
                      <div className="p-5 flex items-end justify-between gap-4">
                        <div><p className="ledger-eyebrow ledger-crimson">Best {p.best}</p><h3 className="ledger-display text-[24px] mt-1">{p.name}</h3><p className="text-[15px] ledger-muted mt-1">{p.line}</p></div>
                        <span className="inline-flex items-center gap-1.5 text-[14px] shrink-0">Read the guide <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
    </>
  );
  const highlightsSec = (
    <>
          <section id="highlights" className={SEC}>
            <SectionHead eyebrow="What to see" title={`The Best of ${g.name}`} icon="sun" />
            <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {g.highlights.map((h) => (
                <li key={h.title} className="border ledger-border flex flex-col">
                  {h.image && <div className="relative aspect-[4/3]"><Image src={h.image.url} alt={h.image.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>}
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="ledger-eyebrow ledger-crimson">{h.line}</p>
                    <h3 className="ledger-display text-[21px] mt-1">{h.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed ledger-muted flex-1">{h.body}</p>
                    {h.voyage && <p className="mt-3 text-[12.5px] ledger-muted">Aboard Aliikai · {h.voyage}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
    </>
  );
  const firstTimeSec = (
    <>
          {g.firstTime && (
            <section id="first-time" className={SEC}>
              <SectionHead eyebrow="First visit" title={g.firstTime.title} icon="wave" intro={g.firstTime.intro} />
              <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {g.firstTime.points.map(([h, b], i) => (
                  <li key={h} className="border ledger-border p-5 h-full">
                    <p className="font-mono text-[11px] tracking-[0.14em] ledger-crimson">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="ledger-display text-[20px] mt-1">{h}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed ledger-muted">{b}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
    </>
  );
  const suitsSec = (
    <>
          <section id="suits" className={SEC}>
            <SectionHead eyebrow="Who it suits" title="Best Suited To" icon="sun" />
            <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {g.suits.map((s) => (
                <li key={s.who} className="border ledger-border p-5 h-full flex flex-col">
                  <h3 className="ledger-display text-[20px]">{s.who}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed ledger-muted flex-1">{s.line}</p>
                  {s.href && <Link href={s.href} className="mt-4 ledger-btn-ghost self-start">{s.label} →</Link>}
                </li>
              ))}
            </ul>
          </section>
    </>
  );
  const staysSec = (
    <>
          {stays.length > 0 && (
            <section id="stays" className={SEC}>
              <SectionHead eyebrow="Where to stay" title={`Selected for ${g.name}`} icon="sun" intro={`The ${stays.length === 1 ? "stay" : "stays"} the house has selected here. The place comes first; the stays earn their place in it.`} />
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {stays.map((s) => (
                  <li key={s.slug}><RecordCard name={s.name} id={s.ledgerId ?? ""} line={s.tagline ?? ""} image={{ url: s.hero as string, alt: s.name }} href={`/stays/${s.slug}`} eyebrow={s.bestMonths ? `Best ${s.bestMonths}` : undefined} volume="stays" /></li>
                ))}
              </ul>
            </section>
          )}
    </>
  );
  const howSec = (
    <>
          <section id="how" className={SEC}>
            <SectionHead eyebrow="How to see it" title={g.howTo.title} icon="wave" intro={g.howTo.intro} />
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {g.howTo.options.map((o, i) => (
                <li key={o.name} className={`p-6 h-full flex flex-col ${i === 0 ? "ledger-paper border border-crimson/40" : "border ledger-border"}`}>
                  <p className="font-mono text-[11px] tracking-[0.14em] ledger-crimson">{i === 0 ? "THE HOUSE'S PICK" : `OPTION ${i + 1}`}</p>
                  <h3 className="ledger-display text-[20px] mt-1">{o.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed ledger-muted flex-1">{o.body}</p>
                  {/* One selected stay: the button opens it by name, rather than scrolling to the list. */}
                  {o.href && (() => { const one = o.href === "#stays" && stays.length === 1 ? stays[0] : null; return <Link href={one ? `/stays/${one.slug}` : o.href} className={`mt-5 self-start ${i === 0 ? "ledger-btn ledger-btn--solid" : "ledger-btn-ghost"}`}>{one ? one.name : o.label}</Link>; })()}
                </li>
              ))}
            </ol>
          </section>
    </>
  );
  const journeysSec = (
    <>
          <Journeys country={g.name} journeys={voyages} />
    </>
  );
  const compareSec = (
    <>
          {compare && (
          <section id="compare" className={SEC}>
            <SectionHead eyebrow="Choosing" title="Raja Ampat or Komodo?" icon="wave" intro="The two great sea journeys of eastern Indonesia, side by side." />
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[560px] text-[15px] border-collapse">
                <thead><tr className="border-b ledger-rule text-left"><th className="py-3 pr-4 ledger-eyebrow font-normal w-[22%]" /><th className="py-3 pr-4 ledger-display text-[19px] font-normal"><Link href="/destinations/asia/indonesia/raja-ampat" className="hover:ledger-crimson">Raja Ampat</Link></th><th className="py-3 ledger-display text-[19px] font-normal"><Link href="/destinations/asia/indonesia/komodo" className="hover:ledger-crimson">Komodo</Link></th></tr></thead>
                <tbody>{RAJA_VS_KOMODO.map((r) => <tr key={r.label} className="border-b ledger-border align-top"><th scope="row" className="py-3 pr-4 ledger-eyebrow font-normal text-left">{r.label}</th><td className="py-3 pr-4">{r.raja}</td><td className="py-3">{r.komodo}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
          )}
    </>
  );
  const onwardSec = (
    <>
          {g.onward && parent && (
            <section id="onward" className={SEC}>
              <SectionHead eyebrow={g.onwardEyebrow ?? `Continue through ${parent.name}`} title="Where Next" icon="wave" />
              <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {g.onward.map((o) => (
                  <li key={o.name}><Link href={o.href} className="group block border ledger-border p-5 h-full hover:border-crimson/60 transition-colors"><h3 className="ledger-display text-[20px]">{o.name}</h3><p className="mt-2 text-[15px] leading-relaxed ledger-muted">{o.line}</p><span className="mt-3 inline-flex items-center gap-1.5 text-[14px]">Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} aria-hidden="true" /></span></Link></li>
                ))}
              </ul>
            </section>
          )}
    </>
  );
  const faqSec = (
    <>
          <FaqBlock faqs={g.faqs} title={`Questions About ${g.name}`} />
    </>
  );
  const sourcesSec = (
    <>
          <section className="mt-10 text-[13px] ledger-muted" aria-label="Sources">
            <p className="ledger-eyebrow">Sources</p>
            <ul className="mt-2 space-y-1">{g.sources.map((s) => <li key={s.url}><a href={s.url} {...(s.url.startsWith("/") ? {} : { target: "_blank", rel: "noopener" })} className="underline underline-offset-4 hover:ledger-crimson">{s.title}</a></li>)}</ul>
          </section>
    </>
  );
  const planSec = (
    <>
          <PlanBand place={g.name} compassHref="/compass" where={g.parent ? undefined : { countrySlug: g.country }} />
    </>
  );
  const whenSec = (
    <>
          <WhenToGo place={g.name} rows={g.months} airports={g.airports} transfers={g.transfers} />

          {guidesFor(g.slug).map((fg) => <GuideOffer key={fg.key} guide={fg} source={`guide:${g.slug}`} />)}
    </>
  );

  if (v2) {
    // ---------- the new country page (James, 3 Nov 2026): one order for every country, Indonesia first ----------
    const extras = COUNTRY_PAGES[g.slug];
    const fact = (re: RegExp) => g.facts.find(([k]) => re.test(k))?.[1] ?? null;
    const best = fact(/^(Seasons|Best time)/)?.split(" · ").slice(0, 3).join(" · ") ?? null;
    const fly = fact(/^Fly into/)?.split(",")[0] ?? null;
    const quick: [string, string][] = [["Best months", best], ["Fly into", fly], ["How long", extras?.howLong?.text ?? null]].filter((x): x is [string, string] => !!x[1]);
    const advisors = advisorsFor({ countrySlug: g.country, regionSlug: g.region }).advisors.filter((a) => !a.sample);
    const planJames = `/plan?advisor=james-papagno&destination=${encodeURIComponent(g.country)}`;
    const keyFacts = g.facts.filter(([k]) => extras?.factSources[k]?.length);
    // Area chips from each stay's filed gateway airport, named as the guide names that airport ("Bali (DPS)" -> Bali).
    const areaOf = (airport: string | null | undefined) => {
      const codes = (airport ?? "").match(/\b[A-Z]{3}\b/g) ?? [];
      for (const c of codes) { const hit = g.airports.find(([k]) => k.includes(c)); if (hit) return hit[0].split(" (")[0]; }
      return `Elsewhere in ${g.name}`;
    };
    const stayItems = stays.map((st) => ({ key: st.slug, area: areaOf(st.airport), node: <RecordCard name={st.name} id={st.ledgerId ?? ""} line={st.tagline ?? ""} image={{ url: st.hero as string, alt: st.name }} href={`/stays/${st.slug}`} eyebrow={st.bestMonths ? `Best ${st.bestMonths}` : undefined} volume="stays" /> }));
    const areas = [...new Set(stayItems.map((x) => x.area))].sort((a, b) => Number(a.startsWith("Elsewhere")) - Number(b.startsWith("Elsewhere")) || a.localeCompare(b));
    const placeNames = new Set((g.places ?? []).map((p) => p.name));
    const more = g.highlights.filter((h) => !placeNames.has(h.title) && !(g.places ?? []).some((p) => p.name.startsWith(h.title)));
    const chapters: [string, string][] = [["Overview", "overview"], ["When", "when"], ["Map", "atlas"], ...(g.places ? [["Where", "places"] as [string, string]] : []), ...(stays.length ? [["Stay", "stays"] as [string, string]] : []), ...(voyages.length ? [["Voyages", "journeys"] as [string, string]] : []), ["Plan", "plan"]];

    return (
      <div className={g.theme === "stays" ? "theme-vol-stays theme-vol-stays-page" : "theme-sea theme-sea-page"} data-country-layout="v2">
        <SiteHeader overlay />
        <main id="main">
          {/* 1. Hero: the name, the one-line answer, three quick facts, the advisors who know it, Plan with James. */}
          <RecordHero image={slides[0]} slides={slides} eyebrow={g.eyebrow} title={g.h1} tagline={g.tagline} />
          <section className="bg-paper border-b ledger-rule" aria-label={`${g.name} at a glance`}>
            <div className="max-w-ledger mx-auto px-5 md:px-10 py-6 md:py-7 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-center">
              <dl className="grid gap-4 sm:grid-cols-3">
                {quick.map(([k, v]) => <div key={k} className="border-l ledger-border pl-4"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-1 text-[14.5px] leading-snug">{v}</dd></div>)}
              </dl>
              <div className="flex flex-col sm:flex-row sm:items-center lg:flex-col lg:items-end gap-3 sm:gap-4 lg:gap-3">
                {advisors.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="flex -space-x-2.5">{advisors.slice(0, 4).map((a) => <Headshot key={a.slug} a={a} size={38} />)}</span>
                    <span className="text-[13px] leading-snug ledger-muted whitespace-nowrap">{advisors.slice(0, 2).map((a) => a.firstName).join(" and ")}{advisors.length > 2 ? ` and ${advisors.length - 2} more` : ""} {advisors.length === 1 ? "knows" : "know"} {g.name}</span>
                  </div>
                )}
                <Link href={planJames} className="ledger-btn ledger-btn--house">Plan {g.name} with James</Link>
              </div>
            </div>
          </section>
          {/* 2. The live board. */}
          <ComingTicker entries={v2.board} label={v2.boardLabel} compact />
          <RecordNav items={chapters} cta={`Plan with James`} ctaHref={planJames} />
          <div className="max-w-ledger mx-auto px-5 md:px-10">
            <div className="pt-6"><Breadcrumbs trail={trail} /></div>
            {g.slidesFromStay && slides[0]?.credit && <p className="mt-2 font-mono text-[10.5px] tracking-[0.12em] uppercase ledger-muted">Hero photographs · {slides[0].credit}</p>}

            {/* 3. In short, and the key facts, each with its source. */}
            <section id="overview" className="pt-4 md:pt-8" aria-label={`${g.name} in short`}>
              <AnswerBlock>{shortAnswer(g.answer)}</AnswerBlock>
              {keyFacts.length > 0 && (
                <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 border-t ledger-border pt-6">
                  {keyFacts.map(([k, v]) => (
                    <div key={k}>
                      <dt className="ledger-eyebrow">{k}</dt>
                      <dd className="mt-1 text-[14.5px] leading-snug">{v}</dd>
                      <dd className="mt-1 text-[11.5px] ledger-muted">Source: {extras!.factSources[k].map((src, i) => <span key={src.url}>{i > 0 ? "; " : ""}<a href={src.url} {...(src.url.startsWith("/") ? {} : { target: "_blank", rel: "noopener" })} className="underline underline-offset-4 hover:ledger-crimson">{src.title}</a></span>)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <FounderProof proof={g.proof} eyebrow={g.proofEyebrow} className="mt-10 max-w-3xl" />
            </section>

            {/* 4. The Atlas. */}
            {v2.atlas}
            {/* 5. When to go. */}
            {whenSec}

            {/* 6. Is it for you? */}
            <section id="suits" className={SEC}>
              <SectionHead eyebrow="Is it for you?" title="Who Should Go" icon="sun" />
              <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {g.suits.map((x) => (
                  <li key={x.who} className="border ledger-border p-5 h-full flex flex-col">
                    <h3 className="ledger-display text-[20px]">{x.who}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed ledger-muted flex-1">{x.line}</p>
                    {x.href && <Link href={x.href} className="mt-4 ledger-btn-ghost self-start">{x.label} →</Link>}
                  </li>
                ))}
              </ul>
              {v2.drafts && extras?.thinkTwice?.length ? (
                <div className="mt-10 border border-dashed ledger-border p-5 md:p-6" data-draft="think-twice">
                  <p className="ledger-eyebrow ledger-id">Draft for James · not on the live site until approved</p>
                  <h3 className="ledger-display text-[24px] mt-2">Who Should Think Twice</h3>
                  <ul className="mt-4 grid gap-4 md:grid-cols-2">
                    {extras.thinkTwice.map((x) => <li key={x.who}><p className="ledger-display text-[18px]">{x.who}</p><p className="mt-1 text-[14.5px] leading-relaxed ledger-muted">{x.line}</p></li>)}
                  </ul>
                </div>
              ) : null}
            </section>
            {firstTimeSec}

            {/* 7. Where to go. */}
            {(g.places || more.length > 0) && (
              <section id="places" className={SEC}>
                <SectionHead eyebrow={`Inside ${g.name}`} title="Where to Go" icon="wave" intro="The places the house sends people, each with its own guide." />
                {g.places && (
                  <ul className="mt-8 grid gap-5 md:grid-cols-2">
                    {g.places.map((p) => (
                      <li key={p.href}>
                        <Link href={p.href} className="group block border ledger-border hover:border-crimson/60 transition-colors">
                          <div className="relative aspect-[16/9] overflow-hidden"><Image src={p.image.url} alt={p.image.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-700" /></div>
                          <div className="p-5 flex items-end justify-between gap-4">
                            <div><p className="ledger-eyebrow ledger-crimson">Best {p.best}</p><h3 className="ledger-display text-[24px] mt-1">{p.name}</h3><p className="text-[15px] ledger-muted mt-1">{p.line}</p></div>
                            <span className="inline-flex items-center gap-1.5 text-[14px] shrink-0">Read the guide <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {more.length > 0 && (
                  <ul className="mt-5 grid gap-5 md:grid-cols-3">
                    {more.map((h) => (
                      <li key={h.title} className="border ledger-border flex flex-col">
                        {h.image && <div className="relative aspect-[4/3]"><Image src={h.image.url} alt={h.image.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>}
                        <div className="p-5"><p className="ledger-eyebrow ledger-crimson">{h.line}</p><h3 className="ledger-display text-[21px] mt-1">{h.title}</h3><p className="mt-2 text-[15px] leading-relaxed ledger-muted">{h.body}</p></div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* 8. How to see it, and Raja Ampat or Komodo. */}
            {howSec}
            {compareSec}

            {/* 9. Where to stay: founder favourites and vetted first, chips by area, six on a phone then Show all. */}
            {stays.length > 0 && (
              <section id="stays" className={SEC}>
                <SectionHead eyebrow="Where to stay" title={`Selected for ${g.name}`} icon="sun" intro={`The ${stays.length === 1 ? "stay" : "stays"} the house has selected here, founder favourites and vetted first.`} />
                <StayFilter items={stayItems} areas={areas} />
              </section>
            )}

            {/* 10. Voyages. */}
            {journeysSec}

            {/* 11. From the field: James's own signed notes. */}
            {v2.notes.length > 0 && (
              <section id="field" className={SEC} aria-labelledby="field-heading">
                <p className="ledger-eyebrow">From the field</p>
                <h2 id="field-heading" className="ledger-display text-[1.9rem] md:text-4xl mt-2">James&rsquo;s Notes</h2>
                <ul className="mt-6 grid gap-6 md:grid-cols-2">
                  {v2.notes.map((n) => (
                    <li key={n.href + n.text}>
                      <figure className="border-l-2 border-crimson pl-5">
                        <blockquote className="ledger-display italic text-[1.35rem] leading-snug">&ldquo;{n.text}&rdquo;</blockquote>
                        <figcaption className="mt-2 font-mono text-[11px] tracking-[0.12em] uppercase ledger-muted">James, {n.year} · <Link href={n.href} className="underline underline-offset-4 hover:ledger-crimson">{n.name}</Link></figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 12. Questions. */}
            {onwardSec}
            {faqSec}
            {sourcesSec}

            {/* 13. Plan it: the real advisors, Travel Notes, the Compass. */}
            {planSec}
          </div>
        </main>
        {/* Phones: a slim Plan with James bar; it is #record-bar, so the Quick actions bar steps aside for it and MapClear
            slides it away while a map is in view. */}
        <div id="record-bar" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur border-t ledger-border pb-[env(safe-area-inset-bottom)]">
          <div className="h-14 px-4 flex items-center gap-3">
            <span className="mr-auto ledger-display text-[1.05rem] truncate">{g.name}</span>
            <Link href={planJames} className="ledger-btn ledger-btn--solid !h-10 shrink-0" data-event="enquire_click">Plan with James</Link>
          </div>
        </div>
        <JsonLd data={schema} />
      </div>
    );
  }

  return (
    <div className={g.theme === "stays" ? "theme-vol-stays theme-vol-stays-page" : "theme-sea theme-sea-page"}>
      <SiteHeader overlay />
      <main id="main">
        <RecordHero image={slides[0]} slides={slides} eyebrow={g.eyebrow} title={g.h1} tagline={g.tagline} />
        {/* Country guides (Indonesia) carry the What's Coming board, like library country pages. */}
        {!g.parent && <ComingTicker entries={countryBoard(comingOn(today()), g.country)} label={`${g.name}: coming and on offer`} compact />}
        <RecordNav items={nav} cta="Plan it with James" ctaHref={`/plan?place=${encodeURIComponent(g.name)}`} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>
          {g.slidesFromStay && slides[0]?.credit && <p className="mt-2 font-mono text-[10.5px] tracking-[0.12em] uppercase ledger-muted">Hero photographs · {slides[0].credit}</p>}
          <Overview answer={g.answer} facts={g.facts} />
          <FounderProof proof={g.proof} eyebrow={g.proofEyebrow} className="mt-10 max-w-3xl" />

          {map}
          {g.zoom && <IslandZoom zoom={g.zoom} />}
          {g.see3d && <SeeIn3D page={g.see3d.page as TerrainPage} id={`see-${g.slug}-in-3d`} kind={g.see3d.routes ? "voyage" : "points"} ink={volumeMark(g.see3d.routes ? "voyages" : "stays")} title={g.see3d.title} exaggeration={1.8} playLabel={g.see3d.playLabel ?? (g.see3d.routes ? "Play the voyage" : "Fly the lagoon")} points={g.see3d.points} routes={g.see3d.routes?.map((r) => (r.file ? terrainRoute(r.name, readRoute(r.file), r.stops) : r))} intro={g.see3d.intro} />}
          {g.flyover && (() => { const f = flyover(g.flyover); return f ? <ChartFlyover {...f} /> : null; })()}

          {whenSec}
          {placesSec}
          {highlightsSec}
          {firstTimeSec}
          {suitsSec}
          {staysSec}
          {howSec}
          {journeysSec}
          {compareSec}
          {onwardSec}
          {faqSec}
          {sourcesSec}
          {planSec}
        </div>
      </main>
      <JsonLd data={schema} />
    </div>
  );
}
