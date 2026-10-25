import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { OfferStamp } from "@/components/ledger/Marks";
import { FieldIcon } from "@/components/ledger/FieldIcon";
import { SectionHead, Prose, JamesNote } from "@/components/about/Parts";
import { PARTNERS } from "@/lib/content/house";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /partners: partner with a purpose. Hero › in short › our aims › James's
// note › one house › how the house presents your place › Worth Another
// Night › resources › the invitation › FAQ. Copy from James's approved
// edit. Resource downloads and the partner form connect at launch.

const PATH = "/partners";
const SUBMIT = "/plan?from=partner";
export const metadata = buildMetadata({
  title: "Partner With James Wild & Co: Lodges, Reserves, Homes and Small Ships",
  description: "James Wild & Co partners with hand-selected lodges, safari reserves, private homes and small vessels that care for nature, community and hospitality. Tell us about your place.",
  path: PATH,
  noindex: true,
});

const AIM_ICONS = ["sun", "tree-ring", "frond", "coral", "mountain-sun", "wave"] as const;

export default function PartnersPage() {
  const p = PARTNERS;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Partners", path: PATH }]} /></div>
          <header className="max-w-3xl">
            <p className="ledger-eyebrow ledger-crimson">{p.eyebrow}</p>
            <h1 className="ledger-display text-[2.3rem] leading-[1.1] md:text-[3.3rem] mt-3">{p.title}</h1>
            <p className="mt-4 text-[18px] md:text-[19px] ledger-muted leading-relaxed">{p.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-4 items-center"><Link href={SUBMIT} className="ledger-btn ledger-btn--solid">Tell us about your place</Link><Link href="/the-ledger" className="ledger-btn-ghost">How the Ledger works</Link></div>
          </header>
          <AnswerBlock>{p.answer}</AnswerBlock>

          <section className="mt-12 md:mt-16" aria-labelledby="aims-heading">
            <SectionHead eyebrow="Our mission" title="Embrace and Promote Travel With Purpose" id="aims-heading" />
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {p.aims.map((a, i) => <li key={a.title} className="border-t ledger-rule pt-4"><FieldIcon name={AIM_ICONS[i]} height={30} className="text-coast" /><h3 className="ledger-display text-[1.25rem] mt-3">{a.title}</h3><p className="mt-1.5 text-[15px] ledger-muted leading-relaxed">{a.line}</p></li>)}
            </ul>
          </section>

          <JamesNote text={p.founderNote} />

          <section className="mt-4 grid lg:grid-cols-2 gap-10 lg:gap-16" aria-labelledby="house-heading">
            <div>
              <SectionHead eyebrow="One house" title="One House. A Shared Purpose." id="house-heading" />
              <div className="mt-6"><Prose paragraphs={p.oneHouse} /></div>
            </div>
            <div className="ledger-paper p-6 md:p-8">
              <p className="ledger-eyebrow ledger-crimson">How the house presents your place</p>
              <p className="mt-2 text-[16px] ledger-muted">Depending on the agreed scope, a partnership may include:</p>
              <ul className="mt-4 space-y-2.5 text-[16.5px]">{p.presents.map((x) => <li key={x} className="flex gap-3"><span className="ledger-crimson" aria-hidden="true">✦</span>{x}</li>)}</ul>
              <p className="mt-5 text-[14px] ledger-muted border-t ledger-border pt-3">A place earns its Ledger entry by being vetted. Partnership never buys a mark.</p>
            </div>
          </section>

          <section className="mt-16 md:mt-24 bg-rust-wash p-6 md:p-10 grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center" aria-labelledby="wan-heading">
            <OfferStamp stay={4} pay={3} size={150} />
            <div>
              <p className="ledger-eyebrow !text-rust">{p.wan.mark}</p>
              <h2 id="wan-heading" className="ledger-display text-[1.5rem] md:text-[2rem] mt-1 leading-tight">{p.wan.title}</h2>
              <p className="mt-3 text-[16.5px] leading-relaxed max-w-2xl">{p.wan.line}</p>
            </div>
          </section>

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10" aria-labelledby="res-heading">
            <SectionHead eyebrow="Get to know us" title="Share Our Approach With Your Team" id="res-heading" />
            <ul className="mt-8 grid md:grid-cols-3 gap-5">
              {p.resources.map((r) => <li key={r.title} className="border ledger-border p-5"><h3 className="ledger-display text-[1.25rem]">{r.title}</h3><p className="mt-1.5 text-[15px] ledger-muted">{r.line}</p><p className="mt-4 ledger-eyebrow">Download coming soon</p></li>)}
            </ul>
          </section>

          <section className="mt-16 md:mt-24 text-center max-w-2xl mx-auto" aria-labelledby="invite-heading">
            <p className="ledger-eyebrow ledger-crimson">The invitation</p>
            <h2 id="invite-heading" className="ledger-display text-[2rem] md:text-[2.6rem] leading-tight mt-2">{p.closing.title}</h2>
            {p.closing.lines.map((l) => <p key={l} className="mt-3 text-[17px] ledger-muted">{l}</p>)}
            <Link href={SUBMIT} className="mt-6 inline-flex ledger-btn ledger-btn--solid">Submit your place for consideration</Link>
          </section>

          <FaqBlock faqs={p.faqs} title="Partnership, answered" />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "WebPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Partner with James Wild & Co", description: p.answer, about: { "@id": ids.house }, publisher: { "@id": ids.house } })} />
    </>
  );
}
