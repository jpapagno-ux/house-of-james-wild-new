import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { HouseHero, SectionHead, Prose, PullQuote, RulesGrid, JamesNote, HouseLinks, PlanClose, Reveal } from "@/components/about/Parts";
import { ABOUT, BELIEFS, CLOSER, IMG, MISTAKES, RULES, RULES_INTRO } from "@/lib/content/about";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids, organization } from "@/lib/schema";

// /about: why the house is still going. Hero › in short › why we're still
// going › the years › rules of the road (all seven, #rules) › mistakes worth
// skipping › beliefs › the house at work ›
// James's note › FAQ › more about the house › plan. Noindex until James signs
// off the copy.

const PATH = "/about";
export const metadata = buildMetadata({
  title: "About James Wild & Co: Exploring Since 1982, Still Going",
  description: "A founder-led travel house exploring since 1982. Every stay, camp, ship and route in the Ledger is walked, sailed or slept in first. Here's why James is still going.",
  path: PATH,
  image: IMG.elephants,
  noindex: false /* approved by James, 28 Oct 2026 */,
});

export default function AboutPage() {
  const a = ABOUT;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "About", path: PATH }]} /></div>
          <HouseHero eyebrow={a.eyebrow} title={a.title} subtitle={a.subtitle} image={IMG.elephants} facts={a.facts} />
          <div className="mt-14"><AnswerBlock>{a.answer}</AnswerBlock></div>

          <section className="mt-14 md:mt-20 grid lg:grid-cols-[1fr_0.9fr] gap-10 lg:gap-16 items-start" aria-labelledby="why-heading">
            <div>
              <SectionHead eyebrow={a.why.eyebrow} title={a.why.title} id="why-heading" />
              <div className="mt-6"><Prose paragraphs={a.why.paragraphs} /></div>
            </div>
            <Reveal className="lg:pt-24"><PullQuote text={a.why.quote} /></Reveal>
          </section>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="years-heading">
            <SectionHead eyebrow="The Ledger of years" title="Forty-Four Years, Briefly" id="years-heading" />
            <ol className="mt-8 relative border-l ledger-rule ml-2 md:ml-0 md:border-l-0 md:grid md:grid-cols-4 md:gap-x-6 md:gap-y-10">
              {a.years.map((y, i) => (
                <li key={y.year} className={`relative pl-6 pb-7 md:pl-0 md:pb-0 md:border-t-2 md:pt-4 ${i === a.years.length - 1 ? "md:border-crimson" : "md:border-ink/20"}`}>
                  <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full md:hidden ${i === a.years.length - 1 ? "bg-crimson" : "bg-ink/50"}`} aria-hidden="true" />
                  <p className="font-mono text-[13px] ledger-crimson">{y.year}</p>
                  <h3 className="ledger-display text-[1.3rem] mt-1">{y.title}</h3>
                  <p className="mt-1.5 text-[15px] ledger-muted leading-relaxed">{y.line}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-[16px]">Where James has been lately, and where he&rsquo;s headed next, is in <Link href="/about/founder#field-log" className="underline underline-offset-4 decoration-crimson/50 hover:ledger-crimson">his field log</Link>.</p>
          </section>

          <section id="rules" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[240px]" aria-labelledby="rules-heading">
            <SectionHead eyebrow="Rules of the road · seven rules, forty-four years" title="How James Would Like You to Travel" id="rules-heading" />
            <p className="mt-4 text-[17px] ledger-muted max-w-2xl">{RULES_INTRO}</p>
            <RulesGrid rules={RULES} />
          </section>

          <section className="mt-16 md:mt-24 grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16" aria-labelledby="mistakes-heading">
            <div>
              <SectionHead eyebrow="From the notebook" title="Mistakes Worth Skipping" id="mistakes-heading" />
              <p className="mt-4 text-[17px] ledger-muted max-w-md">Rule seven, in practice. The cheap mistakes are part of the fun. These are the other kind.</p>
              <p className="mt-8 ledger-hand text-[2.4rem] md:text-[2.8rem] leading-none ledger-crimson">{CLOSER}</p>
              <p className="ledger-eyebrow mt-2">James Wild</p>
            </div>
            <ul className="border-t ledger-border">
              {MISTAKES.map((m, i) => (
                <li key={m.avoid} className="py-5 border-b ledger-border grid grid-cols-[2.5rem_1fr] gap-x-3">
                  <span className="font-mono text-[13px] ledger-crimson pt-1.5">✕ {i + 1}</span>
                  <div>
                    <p className="ledger-display text-[1.3rem] leading-snug">{m.avoid}</p>
                    <p className="ledger-hand text-[1.5rem] leading-tight mt-1 text-coast-deep">{m.quip}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16 md:mt-24 bg-paper-card p-8 md:p-12" aria-labelledby="beliefs-heading">
            <p className="ledger-eyebrow ledger-crimson">What it comes down to</p>
            <h2 id="beliefs-heading" className="sr-only">Three beliefs</h2>
            <ul className="mt-5 grid md:grid-cols-3 gap-6">
              {BELIEFS.map((b) => <li key={b} className="ledger-display text-[1.5rem] md:text-[1.7rem] leading-snug border-t-2 border-crimson pt-4">{b}</li>)}
            </ul>
          </section>

          <section className="mt-16 md:mt-24 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center" aria-labelledby="craft-heading">
            <div className="relative aspect-[4/3] overflow-hidden bg-paper-card order-last lg:order-first"><Image src={IMG.desk.url} alt={IMG.desk.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" /></div>
            <div>
              <SectionHead eyebrow={a.craft.eyebrow} title={a.craft.title} id="craft-heading" />
              <div className="mt-6"><Prose paragraphs={a.craft.paragraphs} /></div>
              <div className="mt-6 flex flex-wrap gap-5 items-center"><Link href="/the-ledger" className="ledger-btn">How the Ledger works</Link><Link href="/for-advisors" className="ledger-btn-ghost">For advisors</Link></div>
            </div>
          </section>

          <JamesNote text={a.jamesNote} />
          <FaqBlock faqs={a.faqs} title="About the house, answered" />
          <HouseLinks current="about" />
          <PlanClose />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "AboutPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "About James Wild & Co", about: { "@id": ids.house }, mainEntity: { "@id": ids.house }, primaryImageOfPage: IMG.elephants.url }, organization())} />
    </>
  );
}
