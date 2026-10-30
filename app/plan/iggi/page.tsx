import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { FieldIcon, HandCta } from "@/components/ledger/FieldIcon";
import { Icon } from "@/components/ledger/Marks";
import ChatSample, { TagChip } from "@/components/iggi/ChatSample";
import IggiMark from "@/components/iggi/IggiMark";
import IggiPanel from "@/components/iggi/IggiPanel";
import { IGGI_ON } from "@/lib/iggi/flag";
import { SectionHead } from "@/components/about/Parts";
import { IGGI, IGGI_IMG, NOTES, PLACES, QUESTIONS, SAMPLES, TAGS, type Tag } from "@/lib/content/iggi";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /plan/iggi: Meet Iggi. Hero › in short › where you'll find him › three
// sample chats (destination, stay, voyage) › the questions › field notes ›
// clear about what we know (origin labels) › handoff to a person › what's
// next › FAQ. Iggi isn't live; every chat is a labelled sample. Noindex
// until launch.

const PATH = "/plan/iggi";
export const metadata = buildMetadata({
  title: "Meet Iggi: Ask James Wild & Co About the Page You're On",
  description: "Iggi, James's chameleon buddy, answers questions on destination, stay, route and voyage pages from the Ledger James has vetted, and labels where every answer comes from. Coming soon.",
  path: PATH,
  image: IGGI_IMG,
  noindex: false /* approved by James, 28 Oct 2026 */,
});

export default function IggiPage() {
  const g = IGGI;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Plan", path: "/plan" }, { name: "Meet Iggi", path: PATH }]} /></div>

          <header className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-14 items-center">
            <div>
              <p className="inline-flex items-center gap-2 ledger-eyebrow !text-coast-deep bg-coast-mist px-2.5 py-1"><span className="w-1.5 h-1.5 rounded-full bg-coast" aria-hidden="true" />{g.eyebrow}</p>
              <h1 className="ledger-display text-[2.1rem] leading-[1.12] md:text-[3.1rem] mt-4">{g.title}</h1>
              <p className="mt-4 text-[18px] md:text-[19px] ledger-muted max-w-xl leading-relaxed">{g.subtitle}</p>
              <ul className="mt-6 space-y-2">{g.quips.map((q) => <li key={q} className="ledger-hand text-[1.6rem] leading-tight text-coast-deep">&ldquo;{q}&rdquo;</li>)}</ul>
              <p className="ledger-eyebrow mt-2">Iggi</p>
            </div>
            <div className="relative aspect-square max-w-[420px] w-full mx-auto bg-paper-card flex items-center justify-center text-coast">
              {/* Iggi's mark (Candidate A, chosen 30 Oct 2026); a portrait may follow later. */}
              <IggiMark size={300} className="w-[72%] h-auto" />
            </div>
          </header>

          <div className="mt-12"><AnswerBlock>{g.answer}</AnswerBlock></div>

          {IGGI_ON && (
            <IggiPanel ctx={{ entityType: "property", entitySlug: "meet-iggi", sourcePage: PATH, volume: null }} heading="Ask Iggi" lead="Tell Iggi where you're drawn, or what kind of journey you want. He answers from the Ledger and labels every source." />
          )}

          <section className="mt-12 md:mt-16" aria-labelledby="where-heading">
            <SectionHead eyebrow="Where you'll find him" title="He Starts From the Page You're On" id="where-heading" />
            <p className="mt-4 text-[17px] ledger-muted max-w-2xl">Open Iggi on a page and he already knows what you&rsquo;re looking at, so you can ask about the place in front of you without starting from scratch.</p>
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PLACES.map((p) => (
                <li key={p.place} className="border-t-2 border-coast pt-4">
                  <FieldIcon name={p.icon} height={34} className="text-coast" />
                  <h3 className="ledger-display text-[1.25rem] mt-3">{p.place}</h3>
                  <p className="mt-1.5 text-[15px] ledger-muted leading-relaxed">{p.line}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="samples-heading">
            <SectionHead eyebrow="Three samples, three pages" title="Watch Iggi Answer, in Context" id="samples-heading" />
            <p className="mt-4 text-[17px] ledger-muted max-w-2xl">The same question means something different on a country page, a stay and a ship. Each answer is built from labelled layers, so you can see what&rsquo;s fact, what&rsquo;s first-hand and what a person still needs to check.</p>
            <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {SAMPLES.map((s) => <ChatSample key={s.where} s={s} />)}
            </div>
          </section>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="questions-heading">
            <SectionHead eyebrow="Good questions" title="Ask the Questions That Make the Difference" id="questions-heading" />
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7">
              {QUESTIONS.map((q) => (
                <li key={q.q} className="grid grid-cols-[44px_1fr] gap-4">
                  <span className="ledger-crimson"><Icon name={q.icon} size={40} /></span>
                  <div><h3 className="ledger-display text-[1.25rem]">{q.q}</h3><p className="mt-1 text-[15px] ledger-muted leading-relaxed">{q.a}</p></div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16 md:mt-24 bg-paper-card p-6 md:p-10" aria-labelledby="notes-heading">
            <SectionHead eyebrow="Field notes from James" title="The Small Things That Change a Journey" id="notes-heading" />
            <p className="mt-4 text-[17px] ledger-muted max-w-2xl">Allow more time here. Resist that extra stop. Understand the transfer before you book the flight. Where James has filed a note, Iggi brings it into the conversation, in James&rsquo;s own words.</p>
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {NOTES.map((n) => (
                <li key={n.label} className="bg-paper p-5">
                  <FieldIcon name={n.icon} height={30} className="ledger-crimson" />
                  <h3 className="ledger-display text-[1.2rem] mt-3">{n.label}</h3>
                  <p className="mt-1 text-[15px] ledger-muted leading-relaxed">{n.line}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16 md:mt-24 grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16" aria-labelledby="clear-heading">
            <div>
              <SectionHead eyebrow="Clear about what we know" title="Every Answer Shows Its Source" id="clear-heading" />
              <div className="mt-6 space-y-4 text-[17px] leading-relaxed max-w-xl">
                <p>Iggi is an AI-powered guide, and he&rsquo;s upfront about it. He draws only on what the house can stand behind: the Ledger, James&rsquo;s approved notes and what partners tell us, each labelled.</p>
                <p>If a detail is missing, uncertain or needs a current check, Iggi says so. Prices, availability and booking terms always go to a person.</p>
                <p className="ledger-display italic text-[1.3rem] ledger-crimson">We&rsquo;d rather help you ask the right question than give you an answer we can&rsquo;t back up.</p>
              </div>
            </div>
            <dl className="border-t ledger-border self-start">
              {(Object.keys(TAGS) as Tag[]).map((t) => (
                <div key={t} className="grid grid-cols-[minmax(0,11rem)_1fr] gap-4 py-3.5 border-b ledger-border items-start">
                  <dt><TagChip tag={t} /></dt>
                  <dd className="text-[15px] ledger-muted leading-relaxed">{TAGS[t].line}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16 md:mt-24 ledger-paper p-6 md:p-10 grid md:grid-cols-[1.2fr_1fr] gap-8 items-center" aria-labelledby="handoff-heading">
            <div>
              <SectionHead eyebrow="When a chat becomes a journey" title="Iggi Explores. A Person Decides With You." id="handoff-heading" />
              <p className="mt-4 text-[17px] leading-relaxed max-w-xl">When you&rsquo;re ready, send what you&rsquo;ve gathered to James or an advisor. With your permission, the useful bits of your chat travel with your enquiry, so the next conversation starts where this one left off.</p>
            </div>
            <div className="flex flex-col gap-5 items-start">
              <HandCta kind="schedule-call" href="/plan?from=iggi&next=call" />
              <HandCta kind="request-itinerary" href="/plan?from=iggi" />
              <Link href="/about/team" className="ledger-btn-ghost">Meet the advisors</Link>
            </div>
          </section>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="next-heading">
            <SectionHead eyebrow="Where Iggi is headed" title="Smarter Each Season, Same Standard" id="next-heading" />
            <ol className="mt-8 grid md:grid-cols-3 gap-5">
              {g.roadmap.map((r, i) => (
                <li key={r.label} className={`p-6 ${i === 2 ? "bg-coast-deep text-paper" : "border ledger-border"}`}>
                  <p className={`ledger-eyebrow ${i === 2 ? "!text-coast-light" : "ledger-crimson"}`}>{r.label}</p>
                  <p className={`mt-2 text-[16px] leading-relaxed ${i === 2 ? "" : "ledger-muted"}`}>{r.line}</p>
                </li>
              ))}
            </ol>
          </section>

          <FaqBlock faqs={g.faqs} title="Iggi, answered" />

          <section className="mt-16 text-center" aria-label="Start exploring">
            <p className="ledger-display text-[1.8rem] md:text-[2.4rem] leading-tight">What&rsquo;s caught your curiosity?</p>
            <p className="mt-3 text-[17px] ledger-muted">{IGGI_ON ? "Ask Iggi above, take the Compass, or go straight to James." : "Until Iggi\u2019s here, James and the Compass are happy to take the first question."}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4"><Link href="/compass" className="ledger-btn ledger-btn--solid">Take the Compass</Link><Link href="/plan" className="ledger-btn">Ask James</Link></div>
          </section>
        </div>
      </main>
      <JsonLd data={graph({ "@type": "WebPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Meet Iggi", description: g.answer, about: { "@type": "Thing", name: "Iggi, the James Wild & Co guide" }, publisher: { "@id": ids.house }, primaryImageOfPage: IGGI_IMG.url })} />
    </>
  );
}
