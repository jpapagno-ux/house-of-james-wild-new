import Link from "next/link";
import SafeLink from "@/components/ledger/SafeLink";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { JwcoSeal, Stamp } from "@/components/ledger/Marks";
import { SectionHead, JamesNote, PlanClose } from "@/components/about/Parts";
import { LEDGER } from "@/lib/content/house";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /the-ledger: how James vets every stay. Hero › in short › tally › how a
// place gets in › the marks (with what each may claim) › anatomy of an entry
// › Ledger IDs › words we don't use › the Traveller Folio › James's note ›
// FAQ › plan. DefinedTermSet schema for the marks. Noindex until signed off.

const PATH = "/the-ledger";
export const metadata = buildMetadata({
  title: "The Ledger: How James Wild & Co Vets Every Stay, Ship and Route",
  description: "Every stay, reserve, residence, vessel and route James Wild & Co recommends is vetted in person or by a named partner, filed under a permanent Ledger ID and given one dated mark. Here's how.",
  path: PATH,
  noindex: false /* approved by James, 28 Oct 2026 */,
});

export default function LedgerPage() {
  const l = LEDGER;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "The Ledger", path: PATH }]} /></div>
          <header className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-14 items-center">
            <div>
              <p className="ledger-eyebrow ledger-crimson">{l.eyebrow}</p>
              <h1 className="ledger-display text-[2.1rem] leading-[1.12] md:text-[3.1rem] mt-3">{l.title}</h1>
              <p className="mt-4 text-[18px] md:text-[19px] ledger-muted max-w-xl leading-relaxed">{l.subtitle}</p>
              <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t ledger-rule pt-4">
                {l.counts.map(([n, k]) => <div key={k}><dt className="sr-only">{k}</dt><dd><span className="ledger-display text-[1.9rem] leading-none">{n}</span><span className="block ledger-eyebrow mt-1">{k}</span></dd></div>)}
              </dl>
            </div>
            <div className="relative h-[300px] md:h-[340px] ledger-paper flex items-center justify-center overflow-hidden" aria-hidden="true">
              <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(0deg,#2D2A26_0,#2D2A26_1px,transparent_1px,transparent_28px)]" />
              <div className="absolute left-8 top-8 -rotate-6"><Stamp kind="Field verified" year={2026} size={150} animate={false} /></div>
              <div className="absolute right-8 bottom-6 rotate-3"><Stamp kind="Founder favorite" size={140} animate={false} /></div>
              <div className="absolute right-10 top-8"><JwcoSeal size={92} /></div>
            </div>
          </header>

          <div className="mt-12"><AnswerBlock>{l.answer}</AnswerBlock></div>

          <section className="mt-12 md:mt-16" aria-labelledby="steps-heading">
            <SectionHead eyebrow="How a place gets in" title="From a Tip to a Ledger ID" id="steps-heading" />
            <ol className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {l.steps.map((s) => <li key={s.n} className="border-t-2 border-crimson pt-4"><span className="font-mono text-[13px] ledger-crimson">{s.n}</span><h3 className="ledger-display text-[1.35rem] mt-1">{s.title}</h3><p className="mt-2 text-[15.5px] ledger-muted leading-relaxed">{s.line}</p></li>)}
            </ol>
          </section>

          <section id="marks" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px]" aria-labelledby="marks-heading">
            <SectionHead eyebrow="The marks · one per entry, always dated" title="I Know a Place: What Each Mark Means" id="marks-heading" />
            <p className="mt-4 text-[17px] ledger-muted max-w-2xl">A mark is a claim James signs. It&rsquo;s set by a person after the visit happened, never inferred, never upgraded, and the year sits right beside it.</p>
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {l.marks.map((m) => (
                <li key={m.says} className="ledger-paper p-5 flex gap-4 items-start">
                  <div className="shrink-0 w-[96px] h-[96px] flex items-center justify-center">
                    {m.stamp ? <Stamp kind={m.stamp} size={96} animate={false} /> : <span className="text-center ledger-eyebrow border ledger-rule px-2 py-3 leading-tight">Partner<br />verified</span>}
                  </div>
                  <div>
                    <p className="ledger-hand text-[1.7rem] leading-none ledger-crimson">&ldquo;{m.says}&rdquo;</p>
                    <h3 className="ledger-display text-[1.1rem] mt-2">{m.stamp ?? "Partner verified"}</h3>
                    <p className="mt-1 text-[15px] leading-snug">{m.plain}</p>
                    <p className="mt-1.5 text-[13px] ledger-muted">{m.rule}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16 md:mt-24 grid lg:grid-cols-2 gap-10 lg:gap-14 items-start" aria-labelledby="entry-heading">
            <div>
              <SectionHead eyebrow="Anatomy of an entry" title="What a Ledger Entry Holds" id="entry-heading" />
              <p className="mt-4 text-[17px] ledger-muted max-w-xl">Every stay, ship and route page is built from an entry like this one, so an advisor can quote it and a traveller can check it.</p>
              <table className="mt-8 w-full text-[15px]">
                <caption className="sr-only">Ledger ID prefixes</caption>
                <thead><tr className="text-left"><th className="ledger-eyebrow pb-2 font-normal">Prefix</th><th className="ledger-eyebrow pb-2 font-normal">Files</th><th className="ledger-eyebrow pb-2 font-normal hidden sm:table-cell">Example</th></tr></thead>
                <tbody>{l.ids.map(([p, w, e]) => <tr key={p} className="border-t ledger-border"><td className="py-2.5 font-mono text-[13px] ledger-crimson">{p}</td><td className="py-2.5">{w}</td><td className="py-2.5 font-mono text-[12.5px] ledger-muted hidden sm:table-cell">{e}</td></tr>)}</tbody>
              </table>
            </div>
            <article className="relative bg-paper border ledger-rule shadow-[0_10px_28px_rgba(45,42,38,0.10)] p-6 md:p-8" aria-label="Sample Ledger entry">
              <div className="absolute -top-4 right-4 rotate-6"><Stamp kind="Field verified" year={2024} volume="voyages" size={104} animate={false} /></div>
              <p className="font-mono text-[12.5px] tracking-[0.1em] ledger-crimson">{l.entry.id}</p>
              <p className="ledger-eyebrow mt-1">{l.entry.volume}</p>
              <h3 className="ledger-display text-[1.6rem] leading-tight mt-2 pr-24">{l.entry.name}</h3>
              <p className="mt-1 text-[14px]">{l.entry.status}</p>
              <dl className="mt-5 border-t ledger-border">
                {l.entry.lines.map(([k, v]) => <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3 py-2.5 border-b ledger-border"><dt className="ledger-eyebrow pt-0.5">{k}</dt><dd className="text-[15px]">{v}</dd></div>)}
              </dl>
              <p className="mt-4 ledger-hand text-[1.5rem] leading-tight text-coast-deep">{l.entry.note}</p>
              <SafeLink href="/voyages/raja-ampat/aliikai-10-day-raja-ampat-north" className="mt-4 inline-block ledger-btn-ghost">Open the voyage</SafeLink>
            </article>
          </section>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="struck-heading">
            <SectionHead eyebrow="House style" title="Words You Won't Find in the Ledger" id="struck-heading" />
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {l.struck.map((s) => (
                <li key={s.word} className="border-t ledger-rule pt-3">
                  <p className="ledger-display text-[1.35rem] line-through decoration-crimson decoration-2">{s.word}</p>
                  <p className="mt-2 ledger-hand text-[1.4rem] leading-tight text-coast-deep">{s.why}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16 md:mt-24 bg-coast-mist p-6 md:p-10 grid md:grid-cols-[auto_1fr] gap-6 items-center" aria-labelledby="folio-heading">
            <span className="ledger-eyebrow !text-coast-deep border border-coast-deep/40 px-3 py-2">Coming</span>
            <div>
              <h2 id="folio-heading" className="ledger-display text-[1.5rem] md:text-[1.9rem]">The Traveller Folio</h2>
              <p className="mt-2 text-[16.5px] leading-relaxed max-w-3xl">{l.folio}</p>
            </div>
          </section>

          <JamesNote text={l.jamesNote} />
          <FaqBlock faqs={l.faqs} title="The Ledger, answered" />
          <section className="mt-12 grid sm:grid-cols-2 gap-4">
            <Link href="/for-advisors" className="border ledger-border p-5 hover:border-crimson"><p className="ledger-eyebrow ledger-crimson">For advisors</p><p className="mt-1 text-[16px]">Quote the Ledger to your own clients.</p></Link>
            <Link href="/partners" className="border ledger-border p-5 hover:border-crimson"><p className="ledger-eyebrow ledger-crimson">For partners</p><p className="mt-1 text-[16px]">How a place joins, and why partnership never buys a mark.</p></Link>
          </section>
          <PlanClose title="Plan from places someone's actually been." />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "WebPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "The Ledger", description: l.answer, publisher: { "@id": ids.house }, author: { "@id": ids.founder } }, { "@type": "DefinedTermSet", "@id": absoluteUrl(`${PATH}#marks`), name: "James Wild & Co Ledger marks", hasDefinedTerm: l.marks.map((m) => ({ "@type": "DefinedTerm", name: m.stamp ?? "Partner verified", alternateName: m.says.replace(/\.$/, ""), description: `${m.plain} ${m.rule}` })) })} />
    </>
  );
}
