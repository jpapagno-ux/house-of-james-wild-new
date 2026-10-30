import Image from "next/image";
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
import { journeysFor } from "@/lib/content/preview/journeys";
import { absoluteUrl } from "@/lib/seo";
import { graph } from "@/lib/schema";

// A destination guide: the page someone lands on from "Raja Ampat travel guide"
// or "best time to visit Komodo". Answer first, then the months and the way in,
// the founder's testimony, what to see, who it suits, how to see it (the
// voyages), Raja Ampat vs Komodo, FAQs with schema, and the sources.
const SEC = "mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px]";

export default function GuidePage({ g }: { g: Guide }) {
  const parent = g.parent ? GUIDES[g.parent] : undefined;
  const voyages = journeysFor("indonesia").filter((j) => g.voyageWaters.some((w) => j.eyebrow.includes(w)));
  const trail = [{ name: "Home", path: "/" }, { name: "Destinations", path: "/destinations" }, { name: "Asia", path: "/destinations/asia" }, ...(parent ? [{ name: parent.name, path: parent.path }] : []), { name: g.name, path: g.path }];
  const nav: [string, string][] = [["In short", "overview"], ["When to go", "when"], ["Highlights", "highlights"], ...(g.firstTime ? [["First visit", "first-time"] as [string, string]] : []), ["Who it suits", "suits"], ["How to see it", "how"], ...(voyages.length ? [["Voyages", "journeys"] as [string, string]] : []), ["Raja Ampat vs Komodo", "compare"], ["FAQ", "faq-heading"]];

  const schema = graph(
    {
      "@type": "TouristDestination",
      "@id": absoluteUrl(`${g.path}#place`),
      name: g.name,
      description: g.answer,
      url: absoluteUrl(g.path),
      geo: { "@type": "GeoCoordinates", latitude: g.geo.lat, longitude: g.geo.lng },
      containedInPlace: parent ? { "@id": absoluteUrl(`${parent.path}#place`), name: parent.name } : { "@type": "Country", name: "Indonesia" },
      touristType: g.suits.map((s) => s.who),
      includesAttraction: g.highlights.map((h) => ({ "@type": "TouristAttraction", name: h.title, description: h.body })),
      image: g.slides.map((s) => s.url),
    },
  );

  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader overlay />
      <main id="main">
        <RecordHero image={g.slides[0]} slides={g.slides} eyebrow={g.eyebrow} title={g.h1} tagline={g.tagline} />
        <RecordNav items={nav} cta="Plan it with James" ctaHref={`/plan?place=${encodeURIComponent(g.name)}`} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={trail} /></div>
          <Overview answer={g.answer} facts={g.facts} />
          <FounderProof proof={g.proof} className="mt-10 max-w-3xl" />

          <WhenToGo place={g.name} rows={g.months} airports={g.airports} transfers={g.transfers} />

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

          <section id="how" className={SEC}>
            <SectionHead eyebrow="How to see it" title={g.howTo.title} icon="wave" intro={g.howTo.intro} />
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {g.howTo.options.map((o, i) => (
                <li key={o.name} className={`p-6 h-full flex flex-col ${i === 0 ? "ledger-paper border border-crimson/40" : "border ledger-border"}`}>
                  <p className="font-mono text-[11px] tracking-[0.14em] ledger-crimson">{i === 0 ? "THE HOUSE'S PICK" : `OPTION ${i + 1}`}</p>
                  <h3 className="ledger-display text-[20px] mt-1">{o.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed ledger-muted flex-1">{o.body}</p>
                  {o.href && <Link href={o.href} className={`mt-5 self-start ${i === 0 ? "ledger-btn ledger-btn--solid" : "ledger-btn-ghost"}`}>{o.label}</Link>}
                </li>
              ))}
            </ol>
          </section>

          <Journeys country={g.name} journeys={voyages} />

          <section id="compare" className={SEC}>
            <SectionHead eyebrow="Choosing" title="Raja Ampat or Komodo?" icon="wave" intro="The two great sea journeys of eastern Indonesia, side by side." />
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[560px] text-[15px] border-collapse">
                <thead><tr className="border-b ledger-rule text-left"><th className="py-3 pr-4 ledger-eyebrow font-normal w-[22%]" /><th className="py-3 pr-4 ledger-display text-[19px] font-normal"><Link href="/destinations/asia/indonesia/raja-ampat" className="hover:ledger-crimson">Raja Ampat</Link></th><th className="py-3 ledger-display text-[19px] font-normal"><Link href="/destinations/asia/indonesia/komodo" className="hover:ledger-crimson">Komodo</Link></th></tr></thead>
                <tbody>{RAJA_VS_KOMODO.map((r) => <tr key={r.label} className="border-b ledger-border align-top"><th scope="row" className="py-3 pr-4 ledger-eyebrow font-normal text-left">{r.label}</th><td className="py-3 pr-4">{r.raja}</td><td className="py-3">{r.komodo}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <FaqBlock faqs={g.faqs} title={`Questions About ${g.name}`} />

          <section className="mt-10 text-[13px] ledger-muted" aria-label="Sources">
            <p className="ledger-eyebrow">Sources</p>
            <ul className="mt-2 space-y-1">{g.sources.map((s) => <li key={s.url}><a href={s.url} {...(s.url.startsWith("/") ? {} : { target: "_blank", rel: "noopener" })} className="underline underline-offset-4 hover:ledger-crimson">{s.title}</a></li>)}</ul>
          </section>

          <PlanBand place={g.name} compassHref="/compass" />
        </div>
      </main>
      <JsonLd data={schema} />
    </div>
  );
}
