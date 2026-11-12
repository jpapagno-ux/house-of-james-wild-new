import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import Pic from "@/components/opening/Pic";
import PlanBand from "@/components/destination/PlanBand";
import { GlanceBar } from "@/components/record/Frame";
import { Overview, RecordHero, RecordNav, SectionHead } from "@/components/record/Sections";
import TalkToUs, { ContactBar, ContactPill } from "@/components/record/TalkToUs";
import { WD, WD_CREDIT } from "@/lib/content/white-desert";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { breadcrumbs, graph, imageObject } from "@/lib/schema";

// /stays/white-desert: Antarctica's interior, by air (James, 12 Nov 2026: "the only stay that we're promoting in
// Antarctica, which we need a special section for"). A feature of its own rather than a library stay page: three
// camps, six trips with the brand's published rates, the flight from Cape Town and how a booking runs. Every fact is
// from white-desert.com (lib/content/white-desert.ts). Linked from the Antarctica destination and the polar voyages
// as the "by air, to the interior" alternative to the ships.

const usd = (n: number) => `US $${n.toLocaleString("en-US")}`;
const planHref = `/plan?from=stay&trip=${encodeURIComponent("White Desert, Antarctica")}&destination=antarctica`;
const trail = [{ name: "Home", path: "/" }, { name: "Stays", path: "/stays" }, { name: "Antarctica", path: "/destinations/polar-antarctica" }, { name: "White Desert", path: WD.path }];

export function generateMetadata() {
  return buildMetadata({
    title: "White Desert, Antarctica: Fly-In Camps on the Ice, Rates 2026 to 2027",
    description: "White Desert flies guests from Cape Town to the ice of Queen Maud Land: three camps of six suites, the South Pole and Emperor penguins. Published rates from US $16,500. Plan it with James Wild & Co.",
    path: WD.path,
    image: { url: WD.hero.url, alt: WD.hero.alt },
  });
}

export default function WhiteDesertPage() {
  const from = Math.min(...WD.trips.map((t) => t.rate));
  return (
    <>
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip design-review">
        <RecordHero image={WD.hero} eyebrow="Stays · Antarctica · The interior, by air" title="White Desert" tagline={WD.tagline} credit={WD_CREDIT}
          glance={<GlanceBar glance={{ price: { amount: usd(from), basis: "from, per person sharing" }, facts: [["Season", "Nov to Feb"], ["Camps", "Three, six suites each"], ["Flight", "5 hr 30 from Cape Town"]], cta: { label: "Plan with James", href: planHref } }} />} />
        <RecordNav items={[["Overview", "overview"], ["The flight", "flight"], ["The camps", "camps"], ["Trips & rates", "trips"], ["How it works", "how"], ["Questions", "faq"]]} ctaHref={planHref} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>

          <Overview answer={WD.answer} lead={WD.tagline} facts={WD.facts} name={WD.name} volume="stays" />

          <section id="flight" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10">
            <SectionHead eyebrow="The way in" title="Cape Town to the Ice" icon="mountain-sun" intro="No ship and no Drake Passage: White Desert flies its guests due south to its own runway of blue ice." />
            <div className="mt-8 grid gap-8 md:grid-cols-[1.3fr_1fr] items-start">
              <figure className="relative aspect-[3/2] overflow-hidden bg-mist">
                <Pic src={WD.trips[0].photo.url} alt={WD.trips[0].photo.alt} ratio="3:2" sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
              </figure>
              <dl className="grid gap-0 border-t ledger-rule">
                {WD.flight.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[8rem_1fr] gap-4 py-3 border-b ledger-rule items-baseline">
                    <dt className="text-[10.5px] tracking-[0.14em] uppercase font-medium ledger-muted">{k}</dt>
                    <dd className="ledger-display text-[1.15rem] leading-snug">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section id="camps" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10">
            <SectionHead eyebrow="Where you'll sleep" title="Three Camps, Six Suites Each" icon="tree-ring" intro="Heated pods, chefs who cook with ingredients flown in weekly, and a team of more than 100 on the ground. Each camp takes no more than 12 guests." />
            <div className="mt-10 grid gap-14 md:gap-20">
              {WD.camps.map((c, i) => (
                <article key={c.key} id={c.key} className={`grid gap-6 md:gap-10 md:grid-cols-2 items-start ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                  <div className="grid gap-2">
                    <figure className="relative aspect-[3/2] overflow-hidden bg-mist"><Pic src={c.photos[0].url} alt={c.photos[0].alt} ratio="3:2" sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></figure>
                    <figure className="relative aspect-[3/1] overflow-hidden bg-mist"><Pic src={c.photos[1].url} alt={c.photos[1].alt} ratio="3:1" sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></figure>
                  </div>
                  <div>
                    <p className="text-[10.5px] tracking-[0.14em] uppercase font-medium ledger-muted">{c.coords}</p>
                    <h3 className="ledger-display text-[1.9rem] md:text-[2.4rem] leading-tight mt-1">{c.name}</h3>
                    <p className="mt-3 ledger-display italic text-[1.2rem] leading-snug">{c.line}</p>
                    {c.body.map((b) => <p key={b.slice(0, 20)} className="mt-4 text-[16px] leading-relaxed">{b}</p>)}
                    <ul className="mt-5 grid gap-1.5 text-[14.5px]">{c.has.map((h) => <li key={h} className="flex gap-2"><span aria-hidden="true" className="ledger-muted">·</span>{h}</li>)}</ul>
                    <p className="mt-5 text-[10.5px] tracking-[0.14em] uppercase font-medium ledger-muted">Days on the ice</p>
                    <p className="mt-2 flex flex-wrap gap-1.5">{c.days.map((d) => <span key={d} className="text-[12px] leading-none px-2.5 py-1.5 border ledger-border">{d}</span>)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="trips" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10">
            <SectionHead eyebrow="Trips & rates" title="Six Ways onto the Ice" icon="sun" intro="Fixed dates, priced per person sharing, as published by White Desert for the 2026 to 2027 season. Solo travellers are welcome, as are families and groups taking a camp whole, from age 10 to 85." />
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {WD.trips.map((t) => (
                <li key={t.name} className="border ledger-border bg-white/60">
                  <figure className="relative aspect-[3/2] overflow-hidden bg-mist"><Pic src={t.photo.url} alt={t.photo.alt} ratio="3:2" sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /></figure>
                  <div className="p-5">
                    <p className="text-[10.5px] tracking-[0.14em] uppercase font-medium ledger-muted">{t.season}</p>
                    <h3 className="ledger-display text-[1.45rem] leading-snug mt-1">{t.name}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed">{t.line}</p>
                    <p className="mt-4 flex items-baseline justify-between gap-3 border-t ledger-rule pt-3"><span className="text-[12.5px] ledger-muted">{t.camps}</span><span className="ledger-display text-[1.25rem] tabular-nums whitespace-nowrap">{usd(t.rate)}</span></p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] ledger-muted">Rates per person sharing, from <a href="https://white-desert.com/prices" rel="nofollow noopener" target="_blank" className="underline underline-offset-2">white-desert.com</a>, read 12 November 2026. Where a trip runs from Explorer Camp as well, the lower figure is Explorer&rsquo;s. James confirms the rate and the dates before you book.</p>
          </section>

          <section id="how" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10">
            <SectionHead eyebrow="How it works" title="From First Call to the Ice" icon="mountain-sun" />
            <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {WD.how.map(([k, v], i) => (
                <li key={k} className="border-t-2 pt-4" style={{ borderColor: "var(--tone-path, #2E2B28)" }}>
                  <p className="font-mono text-[11px] tracking-[0.14em] ledger-muted tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="ledger-display text-[1.3rem] mt-1">{k}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed">{v}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-[15px] leading-relaxed max-w-2xl">Rather go by sea? The ships James books sail to the Antarctic Peninsula. <Link href="/voyages/polar" className="underline underline-offset-4">See the polar voyages</Link>.</p>
          </section>

          <div id="faq"><FaqBlock faqs={[...WD.faqs]} title="White Desert, Answered Straight" /></div>
          <TalkToUs name={WD.name} planHref={planHref} />
          <p className="mt-6 text-[13px] ledger-muted">{WD_CREDIT}.</p>
          <div id="plan"><PlanBand place="White Desert" compassHref="/destinations/polar-antarctica" where={{ countrySlug: "antarctica", volume: "stays" }} /></div>
        </div>
      </main>
      <ContactBar name={WD.name} planHref={planHref} from={`${usd(from)} pp`} />
      <ContactPill name={WD.name} planHref={planHref} />
      <JsonLd data={graph(
        { "@type": ["LodgingBusiness", "TouristAttraction"], "@id": absoluteUrl(`${WD.path}#stay`), name: "White Desert", url: absoluteUrl(WD.path), description: WD.answer,
          image: [imageObject(WD.hero.url, WD.hero.alt, "White Desert"), ...WD.camps.map((c) => imageObject(c.photos[0].url, c.photos[0].alt, "White Desert"))],
          address: { "@type": "PostalAddress", addressRegion: "Queen Maud Land", addressCountry: "AQ" }, sameAs: ["https://white-desert.com"],
          makesOffer: WD.trips.map((t) => ({ "@type": "Offer", name: t.name, price: t.rate, priceCurrency: "USD", description: t.line })) },
        breadcrumbs(trail),
      )} />
    </>
  );
}
