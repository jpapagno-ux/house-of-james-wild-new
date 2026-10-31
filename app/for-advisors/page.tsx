import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { Icon, JwcoSeal } from "@/components/ledger/Marks";
import { SectionHead, Prose, JamesNote } from "@/components/about/Parts";
import { FOR_ADVISORS } from "@/lib/content/house";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";
import { IGGI_CORE_ORIGIN } from "@/lib/iggi/flag";

// /for-advisors: join the house. Hero › in short › more than an ID › the
// comparison › the terms › what you get › how to join › James's note › FAQ ›
// apply. Terms are the legacy plan, pending James's confirmation. Noindex
// until signed off.

const PATH = "/for-advisors";
const APPLY = "/for-advisors/apply";
export const metadata = buildMetadata({
  title: "Become a Travel Advisor With James Wild & Co: Training and Support",
  description: "Join a founder-led host agency: training in James's 44-year method, a vetted Ledger to plan and book from, and 70% of booking commission for US$249 a year or US$49 a month.",
  path: PATH,
  noindex: false /* approved by James, 28 Oct 2026 */,
});

export default function ForAdvisorsPage() {
  const a = FOR_ADVISORS;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "For advisors", path: PATH }]} /></div>
          <header className="grid lg:grid-cols-[1.25fr_1fr] gap-8 lg:gap-14 items-end">
            <div>
              <p className="ledger-eyebrow ledger-crimson">{a.eyebrow}</p>
              <h1 className="ledger-display text-[2.1rem] leading-[1.12] md:text-[3rem] mt-3">{a.title}</h1>
              <p className="mt-4 text-[18px] md:text-[19px] ledger-muted max-w-xl leading-relaxed">{a.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-4 items-center"><Link href={APPLY} className="ledger-btn ledger-btn--solid">Apply to the desk</Link><a href="#terms" className="ledger-btn-ghost">See the terms</a></div>
            </div>
            <div className="ledger-paper p-6 md:p-8">
              <div className="flex items-start gap-4"><JwcoSeal size={70} /><p className="ledger-hand text-[1.8rem] leading-tight">&ldquo;{a.quote}&rdquo;</p></div>
              <dl className="mt-5 border-t ledger-border">{a.meta.map(([k, v]) => <div key={k} className="grid grid-cols-[8rem_1fr] gap-3 py-2.5 border-b ledger-border"><dt className="ledger-eyebrow pt-0.5">{k}</dt><dd className="text-[15.5px]">{v}</dd></div>)}</dl>
            </div>
          </header>

          <div className="mt-12"><AnswerBlock>{a.answer}</AnswerBlock></div>

          <section className="mt-12 md:mt-16 max-w-3xl" aria-labelledby="why-heading">
            <SectionHead eyebrow="Read this first" title="More Than a Host Agency ID" id="why-heading" />
            <div className="mt-6"><Prose paragraphs={a.why} /></div>
          </section>

          <section className="mt-14 md:mt-20" aria-labelledby="compare-heading">
            <SectionHead eyebrow="The comparison, filed plainly" title="Why Advisors Choose the Desk" id="compare-heading" />
            <div className="relative mt-6 overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
              <table className="w-full min-w-[620px] text-[15px]">
                <thead><tr className="text-left"><th className="w-[18%] pb-3" /><th className="ledger-eyebrow pb-3 font-normal w-[36%]">A typical advisor network</th><th className="ledger-eyebrow ledger-crimson pb-3 font-normal">James Wild &amp; Co</th></tr></thead>
                <tbody>{a.compare.map(([k, them, us]) => <tr key={k} className="border-t ledger-border align-top"><th scope="row" className="py-3.5 pr-4 text-left ledger-display font-normal text-[1.05rem]">{k}</th><td className="py-3.5 pr-4 ledger-muted">{them}</td><td className="py-3.5">{us}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id="terms" className="mt-16 md:mt-24 bg-coast-deep text-paper p-6 md:p-10 scroll-mt-32 lg:scroll-mt-[212px] grid lg:grid-cols-[1fr_1.2fr] gap-8" aria-labelledby="terms-heading">
            <div>
              <p className="ledger-eyebrow !text-coast-light">The terms, filed plainly</p>
              <h2 id="terms-heading" className="ledger-display text-[1.8rem] md:text-[2.4rem] leading-tight mt-2">The Shared Commission Split</h2>
              <p className="mt-3 text-[16.5px] text-paper/85 leading-relaxed">No hidden tiers, no moving percentages. The split is shared because the work is: you design and quote the journey; the house keeps the Ledger, the rates and the relationships that make your quote hold up.</p>
            </div>
            <dl className="border-t border-paper/25 self-start">{a.terms.map(([k, v]) => <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-4 border-b border-paper/25"><dt className="ledger-eyebrow !text-coast-light pt-1">{k}</dt><dd className="ledger-display text-[1.25rem] leading-snug">{v}</dd></div>)}</dl>
          </section>

          <section className="mt-16 md:mt-24" aria-labelledby="tools-heading">
            <SectionHead eyebrow="What you get" title="Taught From Forty-Four Years on the Road" id="tools-heading" />
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7">
              {a.tools.map((t) => <li key={t.title} className="grid grid-cols-[44px_1fr] gap-4"><span className="ledger-crimson"><Icon name={t.icon} size={40} /></span><div><h3 className="ledger-display text-[1.25rem]">{t.title}</h3><p className="mt-1 text-[15px] ledger-muted leading-relaxed">{t.line}</p></div></li>)}
            </ul>
          </section>

          {/* The Desk (Stage 5, 31 Oct 2026): what an advisor of the house works with, and the door to it. */}
          <section id="desk" className="mt-16 md:mt-24 ledger-paper p-6 md:p-10 scroll-mt-32 lg:scroll-mt-[212px]" aria-labelledby="desk-heading">
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-start">
              <div>
                <p className="ledger-eyebrow ledger-crimson">The Desk</p>
                <h2 id="desk-heading" className="ledger-display text-[1.8rem] md:text-[2.4rem] leading-tight mt-2">Your page in the book, and the tools behind it.</h2>
                <p className="mt-3 text-[16.5px] ledger-muted leading-relaxed">An advisor of the house gets an ADV number, a page with their marks in green ink beside the founder&rsquo;s, and the Desk: Iggi with the whole Ledger open, for research and for shaping a client&rsquo;s journey into a Folio with its own number.</p>
                <div className="mt-6 flex flex-wrap gap-3"><Link href={APPLY} className="ledger-btn ledger-btn--solid">Apply to the desk</Link><a href={`${IGGI_CORE_ORIGIN}/advisor/chat`} className="ledger-btn" rel="noopener">Sign in to the Desk</a></div>
                <p className="mt-3 text-[13px] ledger-muted">Sign-in is for advisors already on the roster.</p>
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  ["Your ADV number", "Issued once, never reused. It goes on every Folio you open and every entry you mark."],
                  ["Your page", "Specialties, the places you know first-hand, and every Ledger entry you carry, with your mark beside James's."],
                  ["Who plans this", "Country and reserve pages name the advisor who knows the place. Mark it, and that can be you."],
                  ["Iggi at the Desk", "Shortlists from the Ledger with the mark and one reason each; who in the house has been; the gaps, flagged."],
                  ["Folios", "A client's journey as a numbered Folio, FOL-2026-######, with you on it. Quote the number anywhere in the house."],
                  ["The Ledger's rates", "Contracted rates and the relationships behind them, so your quote holds up."],
                ].map(([t, l]) => <li key={t} className="border-t ledger-border pt-3"><h3 className="ledger-display text-[1.2rem]">{t}</h3><p className="mt-1 text-[14.5px] ledger-muted leading-relaxed">{l}</p></li>)}
              </ul>
            </div>
          </section>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="join-heading">
            <SectionHead eyebrow="Getting started" title="How to Join the Desk" id="join-heading" />
            <ol className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{a.steps.map((s) => <li key={s.n} className="border-t-2 border-crimson pt-4"><span className="font-mono text-[13px] ledger-crimson">{s.n}</span><h3 className="ledger-display text-[1.3rem] mt-1">{s.title}</h3><p className="mt-2 text-[15.5px] ledger-muted leading-relaxed">{s.line}</p></li>)}</ol>
            <div className="mt-8 flex flex-wrap gap-4 items-center"><Link href={APPLY} className="ledger-btn ledger-btn--solid">Apply to the desk</Link><Link href="/the-ledger" className="ledger-btn-ghost">How the Ledger works</Link><Link href="/about/team" className="ledger-btn-ghost">Meet the team</Link></div>
          </section>

          <JamesNote text={a.jamesNote} />
          <FaqBlock faqs={a.faqs} title="For advisors, answered" />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "WebPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Become a James Wild & Co travel advisor", description: a.answer, about: { "@id": ids.house }, publisher: { "@id": ids.house } })} />
    </>
  );
}
