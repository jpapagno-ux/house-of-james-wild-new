import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { PlanClose } from "@/components/about/Parts";
import { JwcoSeal } from "@/components/ledger/Marks";
import { INSTRUMENTS, HANDOFFS, HOW_PATH } from "@/lib/content/instruments";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /how-the-house-works — the instruments of the house, explained once (James, 3 Nov 2026).
// Compass chooses, Atlas shows, Iggi explains and hands you over; then a person. The
// answer-engine page for "how does James Wild & Co work". Copy approved by James.

export const metadata = buildMetadata({
  title: "How the House Works: the Compass, the Atlas and Iggi",
  description: "James Wild & Co runs on a Ledger of places James has vetted in person. Three instruments read it for you: the Compass chooses, the Atlas shows, Iggi explains and hands you to a person. None of them books anything.",
  path: HOW_PATH,
});

export default function HowTheHouseWorks() {
  const answer = `James Wild & Co runs on a Ledger: every stay, camp, ship and route James has vetted in person, each with a number. Three instruments read it for you. The Compass chooses: five questions, then the places that fit, each with its reason and its Ledger number. The Atlas shows: every route, ship and camp on one chart that flies. Iggi explains and hands you over: the house's Field Guide answers from the Ledger, cites each record, and names the advisor who should plan the journey. None of them books anything. At the end of each, a person at the house takes it from there.`;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "How the house works", path: HOW_PATH }]} /></div>
          <header className="max-w-3xl">
            <p className="ledger-eyebrow text-house">The house · how it works</p>
            <h1 className="ledger-display text-[2.3rem] md:text-[3.3rem] leading-[1.08] mt-2">Three instruments, then a person.</h1>
            <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed">James Wild &amp; Co runs on a Ledger: every stay, camp, ship and route James has vetted in person, each with a number. Three instruments read it for you. None of them books anything. At the end of each, a person at the house takes it from there.</p>
          </header>

          <div className="mt-10"><AnswerBlock>{answer}</AnswerBlock></div>

          <ol className="mt-12 grid gap-6 lg:grid-cols-3">
            {INSTRUMENTS.map((i) => (
              <li key={i.key} className="border ledger-border bg-paper-card p-6 md:p-7 flex flex-col">
                <p className="ledger-id text-[12px]">{i.no}</p>
                <h2 className="ledger-display text-[1.7rem] leading-tight mt-2">{i.name} <span className="ledger-muted italic text-[1.1rem]">{i.verb}</span></h2>
                <p className="mt-4 text-[15.5px] leading-relaxed flex-1">{i.lede}</p>
                <p className="mt-4 ledger-display italic text-[16px]">{i.useWhen}</p>
                <Link href={i.href} className="mt-5 ledger-btn self-start">{i.cta}</Link>
              </li>
            ))}
          </ol>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 grid lg:grid-cols-[1fr_1.2fr] gap-10" aria-labelledby="handoffs-heading">
            <div>
              <p className="ledger-eyebrow text-house">How they pass to each other</p>
              <h2 id="handoffs-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Each one knows when to hand on.</h2>
              <p className="mt-4 text-[15.5px] ledger-muted leading-relaxed max-w-md">You never have to pick the right instrument first. Start anywhere; the house passes you along.</p>
            </div>
            <dl className="divide-y ledger-rule border-t border-b ledger-rule">
              {HANDOFFS.map((h) => (
                <div key={h.from + h.to} className="py-4 grid sm:grid-cols-[200px_1fr] gap-x-6 gap-y-1">
                  <dt className="ledger-display text-[17px]">{h.from} <span className="text-house">&rarr;</span> {h.to}</dt>
                  <dd className="text-[15px] leading-relaxed">{h.line}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 grid lg:grid-cols-[auto_1fr] gap-8 items-start" aria-labelledby="person-heading">
            <JwcoSeal size={88} />
            <div>
              <p className="ledger-eyebrow text-house">And then a person</p>
              <h2 id="person-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">James vouches for the place. The advisor vouches for you.</h2>
              <p className="mt-4 text-[16px] leading-relaxed max-w-2xl">A named advisor with an Advisor number carries every journey from the first note to the Folio. While the house is in its first season, James heads every page himself.</p>
              <div className="mt-6 flex flex-wrap gap-4"><Link href="/plan" className="ledger-btn ledger-btn--solid">Plan with James</Link><Link href="/advisors" className="ledger-btn-ghost">Meet the advisors</Link></div>
            </div>
          </section>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="advisors-heading">
            <p className="ledger-eyebrow text-house">For advisors of the house</p>
            <h2 id="advisors-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">The same three, with the Desk&rsquo;s verbs.</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {INSTRUMENTS.map((i) => <li key={i.key} className="border-l-2 border-house pl-5"><p className="ledger-display text-[18px]">{i.name}</p><p className="mt-1 text-[15px] leading-relaxed ledger-muted">{i.advisor}</p></li>)}
            </ul>
            <p className="mt-6 text-[15px] leading-relaxed max-w-2xl">Your own DNA, in your words, is what the house reads when it names you. <Link href="/for-advisors" className="underline underline-offset-4 hover:text-house">About advisors of the house</Link></p>
          </section>

          <PlanClose title="Start anywhere." line="Read the Compass, open the Atlas, or ask Iggi. The house takes it from there." />
        </div>
      </main>
      <JsonLd data={graph(
        { "@type": "WebPage", "@id": absoluteUrl(`${HOW_PATH}#page`), url: absoluteUrl(HOW_PATH), name: "How the House Works", isPartOf: { "@id": ids.website }, about: { "@id": ids.house }, mainEntity: { "@id": absoluteUrl(`${HOW_PATH}#howto`) } },
        { "@type": "HowTo", "@id": absoluteUrl(`${HOW_PATH}#howto`), name: "How to plan a journey with James Wild & Co", description: answer, step: INSTRUMENTS.map((i, n) => ({ "@type": "HowToStep", position: n + 1, name: `${i.name}: ${i.verb}`, text: `${i.lede} ${i.useWhen}`, url: absoluteUrl(i.href) })) },
      )} />
    </>
  );
}
