import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { TapedPhoto } from "@/components/ledger/Marks";
import { HouseHero, SectionHead, Prose, PullQuote, JamesNote, HouseLinks, PlanClose, Reveal } from "@/components/about/Parts";
import { FOUNDER, IMG, MEMOIR_URL } from "@/lib/content/about";
import { SITE } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { founder, graph, ids } from "@/lib/schema";

// /about/founder: Meet James. Hero › in short › thesis › story (with his own
// Polaroids) › field log + next corner › credentials › closing quote ›
// James's note › FAQ › more about the house › plan. ProfilePage + Person
// schema states only what the page shows. Noindex until signed off.

const PATH = "/about/founder";
export const metadata = buildMetadata({
  title: "James Wild, Founder of James Wild & Co: 44 Years on the Road",
  description: "Meet James Wild (James Papagno): exploring since 1982, designing journeys since 1983, safaris since 2011. IATAN since 1990, CLIA, PADI diver. His story and field log.",
  path: PATH,
  image: IMG.surfersBeach,
  type: "article",
  noindex: false /* approved by James, 28 Oct 2026 */,
});

export default function FounderPage() {
  const f = FOUNDER;
  const person = {
    ...founder(),
    alternateName: ["James Wild", SITE.founder.alternateName],
    email: SITE.founder.email,
    description: f.answer,
    image: IMG.dominical.url,
    knowsAbout: ["Safari design", "Small-ship voyages", "Sailing", "Scuba diving", "Surf travel", "Costa Rica", "Botswana", "South Africa", "Raja Ampat", "French Polynesia", "Antarctica"],
    alumniOf: { "@type": "CollegeOrUniversity", name: "Florida Atlantic University" },
    memberOf: [{ "@type": "Organization", name: "IATAN" }, { "@type": "Organization", name: "CLIA" }],
    hasCredential: [{ "@type": "EducationalOccupationalCredential", name: "PADI-certified diver", recognizedBy: { "@type": "Organization", name: "PADI" } }, { "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: "B.A. in Marketing", recognizedBy: { "@type": "CollegeOrUniversity", name: "Florida Atlantic University" } }],
    subjectOf: { "@type": "Article", name: "From Surf to Soul: The 40-Year Journey That Built Wild Earth Stays", url: MEMOIR_URL },
  };
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }, { name: "Meet James", path: PATH }]} /></div>
          <div id="james" className="scroll-mt-32 lg:scroll-mt-56"><HouseHero eyebrow={f.eyebrow} title={f.title} subtitle={f.subtitle} image={IMG.surfersBeach} quote={f.quote} /></div>

          <dl className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {f.meta.map(([k, v]) => <div key={k} className="border-t ledger-rule pt-3"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-1 text-[16px] leading-snug">{v}</dd></div>)}
          </dl>
          <AnswerBlock>{f.answer}</AnswerBlock>

          <section className="mt-14 md:mt-20 max-w-3xl" aria-labelledby="thesis-heading">
            <SectionHead eyebrow={f.thesis.eyebrow} title={f.thesis.title} id="thesis-heading" />
            <div className="mt-6"><Prose paragraphs={f.thesis.paragraphs} /></div>
            <Link href="/about#rules" className="mt-6 inline-block ledger-btn-ghost">His seven rules of the road</Link>
          </section>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16" aria-labelledby="story-heading">
            <div>
              <SectionHead eyebrow={f.story.eyebrow} title={f.story.title} id="story-heading" />
              <div className="mt-6"><Prose paragraphs={f.story.paragraphs} /></div>
              <a href={MEMOIR_URL} className="mt-6 inline-block ledger-btn-ghost">Read the full memoir, From Surf to Soul</a>
            </div>
            <div className="grid grid-cols-2 gap-5 content-start pt-4 lg:pt-16">
              <Reveal><TapedPhoto src={IMG.dominical.url} alt={IMG.dominical.alt} caption="Dominical, '95" rotate={-3} height={210} sizes="240px" /></Reveal>
              <Reveal delay={0.15} className="mt-10"><TapedPhoto src={IMG.jeep.url} alt={IMG.jeep.alt} caption="Boards first, roads later." rotate={2.5} tape="cream" height={210} sizes="240px" /></Reveal>
            </div>
          </section>

          <section id="field-log" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-56" aria-labelledby="log-heading">
            <SectionHead eyebrow="The field log" title="Where James Has Been Lately" id="log-heading" />
            <ol className="mt-8 border-t ledger-border">
              {f.fieldLog.map((e) => (
                <li key={e.year} className="grid grid-cols-[4.5rem_1fr] md:grid-cols-[6rem_14rem_1fr] gap-x-4 gap-y-1 py-4 border-b ledger-border">
                  <span className="font-mono text-[14px] ledger-crimson pt-1">{e.year}</span>
                  <h3 className="ledger-display text-[1.2rem]">{e.place}</h3>
                  <p className="col-start-2 md:col-start-3 text-[16px] ledger-muted leading-relaxed">{e.line}</p>
                </li>
              ))}
              <li className="grid grid-cols-[4.5rem_1fr] md:grid-cols-[6rem_14rem_1fr] gap-x-4 gap-y-1 py-5 bg-coast-mist px-3 -mx-3">
                <span className="font-mono text-[14px] text-coast-deep pt-1">Next</span>
                <h3 className="ledger-display text-[1.2rem] text-coast-deep">{f.next.label}</h3>
                <p className="col-start-2 md:col-start-3 text-[16px] leading-relaxed">{f.next.line}</p>
              </li>
            </ol>
          </section>

          <section className="mt-16 md:mt-24 grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start" aria-labelledby="cred-heading">
            <div>
              <SectionHead eyebrow="Filed under his name" title="Forty-Four Years, on the Record" id="cred-heading" />
              <ul className="mt-6 space-y-2.5 text-[17px]">{f.credentials.map((c) => <li key={c} className="flex gap-3"><span className="ledger-crimson" aria-hidden="true">✦</span>{c}</li>)}</ul>
              <p className="mt-6 text-[17px]">Write to James: <a href={`mailto:${SITE.founder.email}`} className="underline underline-offset-4 decoration-crimson/50 hover:ledger-crimson">{SITE.founder.email}</a></p>
              <p className="mt-3 text-[14px] ledger-muted">The house: {SITE.credentials.map((c) => `${c.label} ${c.value}`).join(" · ")}</p>
            </div>
            <Reveal><PullQuote text={f.closingQuote} /></Reveal>
          </section>

          <JamesNote text={f.jamesNote} />
          <FaqBlock faqs={f.faqs} title="About James, answered" />
          <HouseLinks current="founder" />
          <PlanClose title="Plan it with the person who's been." />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "ProfilePage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Meet James Wild", mainEntity: { "@id": ids.founder }, isPartOf: { "@id": ids.website } }, person)} />
    </>
  );
}
