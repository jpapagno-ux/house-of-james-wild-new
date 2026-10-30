import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { PlanClose } from "@/components/about/Parts";
import { SAFARI_DESK } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { breadcrumbs, faqPage, graph, ids } from "@/lib/schema";

// /safaris/wild-co-safaris: the one door from the House to its safari desk.
// House rule (30 Oct 2026, James): no stay, route or card links across to
// Wild & Co Safaris. The menu item ("Ask Crux") and the Safaris hub both land
// here, and this page holds the only outbound link (SAFARI_DESK.url).
// Noindex until James approves the copy.

const PATH = SAFARI_DESK.page;
const HERO = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_fill,g_auto,w_2400,h_1300/q_auto:good/f_auto/wildco/south-africa/sabi-sand/londolozi/londolozi-leopard-cubs-in-tree";
const TINT = { "--jw-accent": "147 111 73", "--jw-accent-deep": "122 90 58", "--jw-accent-light": "214 190 158" } as React.CSSProperties;

export const metadata = buildMetadata({
  title: "Wild & Co Safaris: the House's Safari Desk",
  description: "Wild & Co Safaris is James Wild & Co's own safari desk: Crux, the safari guide, partner guides and camps known by reserve. What to expect when your safari moves to the specialists.",
  path: PATH,
  noindex: true,
});

const STEPS = [
  { n: "01", t: "Ask Crux", l: "Crux is the safari desk's guide. Answer a few questions and it suggests the journey type, destinations and pace that fit you." },
  { n: "02", t: "The guide comes first", l: "We know the guide before we choose the camp. The desk matches you to the people on the ground, then the camps around them." },
  { n: "03", t: "Drawn by a safari specialist", l: "Reserves, seasons, flights and nights are set by specialists who plan Africa every day, with the partner guides who walk it." },
  { n: "04", t: "Still one house", l: "The same Ledger, the same standards. Anything you've already told the House goes with you, and your advisor stays in the loop." },
];

const TYPES = [
  { t: "Private Guided", l: "Your own guide and your own vehicle, first day to last. The journey moves at your pace, not the camp's schedule." },
  { t: "Classic", l: "Planned by the desk, hosted on the ground by the camps' own guiding teams. Shared vehicles, balanced pacing and real value." },
  { t: "In The Field", l: "Walking safaris and the migrations: mobile, remote and elemental, in Botswana, Kenya, Tanzania and South Africa." },
];

const FAQS = [
  { q: "What is Wild & Co Safaris?", a: "Wild & Co Safaris is the safari desk of James Wild & Co. It plans and books African safaris: reserves and camps by country, private guided and classic journeys, walking safaris and the migrations, with Crux, its safari guide, and partner guides on the ground." },
  { q: "Is Wild & Co Safaris part of James Wild & Co?", a: "Yes. It is the house's own safari platform, run to the same Ledger and vetting standards as every James Wild & Co volume. It is a separate site because safaris are specialist work." },
  { q: "What is Crux?", a: "Crux is the safari desk's personal guide. You answer a few questions about how you like to travel and it suggests the journey type, destinations and pace that suit you, before a specialist designs the safari." },
  { q: "Do I start again with a new advisor?", a: "No. What you've shared with the House goes with you, and your James Wild & Co advisor stays involved while the safari desk designs the safari." },
  { q: "When should I stay on the House site instead?", a: "If the safari is a few nights inside a wider journey, such as an Overland route, a family house in Gatherings or a stay in Stays, keep planning here. Come to the safari desk when the safari is the journey." },
];

export default function SafariDesk() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-20" style={TINT}>
        <div className="max-w-ledger mx-auto px-5 md:px-10 pt-6 md:pt-10">
          <Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Safaris", path: "/safaris" }, { name: "Wild & Co Safaris", path: PATH }]} />
        </div>

        {/* Hello: the hand-over moment */}
        <section className="relative mt-6 overflow-hidden bg-ink text-paper" aria-labelledby="desk-h">
          <Image src={HERO} alt="Two leopard cubs in a tree on the Sand River, Sabi Sand, South Africa" fill priority sizes="100vw" className="object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" aria-hidden="true" />
          <div className="relative max-w-ledger mx-auto px-5 md:px-10 py-16 md:py-28 grid md:grid-cols-[1fr_minmax(0,300px)] gap-10 items-end">
            <div className="max-w-2xl">
              <p className="ledger-eyebrow !text-crimson-light">The safari desk of James Wild &amp; Co</p>
              <h1 id="desk-h" className="ledger-display text-[2.4rem] leading-[1.08] md:text-[3.6rem] mt-3">Hello. This is where the safari specialists take over.</h1>
              <p className="mt-5 text-[18px] md:text-[19px] leading-relaxed text-paper/85">You asked for the safari guide, so here&rsquo;s what happens next. The House keeps the world; Africa has its own desk. Wild &amp; Co Safaris is that desk: same house, same Ledger, built only for safaris.</p>
            </div>
            <Image src="/brand/wild-and-co-safaris-cream.png" alt="Wild & Co Safaris, Africa" width={700} height={486} className="w-[220px] md:w-[300px] h-auto justify-self-start md:justify-self-end" />
          </div>
        </section>

        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <AnswerBlock>Wild &amp; Co Safaris is James Wild &amp; Co&rsquo;s own safari desk. Crux, its safari guide, asks how you like to travel; specialists and partner guides then design the safari, reserve by reserve. Nothing you&rsquo;ve told the House is lost, and your advisor stays in the loop.</AnswerBlock>

          {/* What's happening */}
          <section className="mt-12 md:mt-16 border-t ledger-rule pt-8" aria-labelledby="happening-h">
            <p className="ledger-eyebrow ledger-crimson">What&rsquo;s happening</p>
            <h2 id="happening-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">You&rsquo;re moving desks, not houses.</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <div><h3 className="ledger-display text-[1.3rem]">Why a separate desk</h3><p className="mt-2 text-[16.5px] ledger-muted leading-relaxed">A safari turns on guides, seasons, light aircraft and the nights between camps. That&rsquo;s specialist work, so it has specialists.</p></div>
              <div><h3 className="ledger-display text-[1.3rem]">What stays the same</h3><p className="mt-2 text-[16.5px] ledger-muted leading-relaxed">The Ledger, the vetting and the standards. Every camp the desk offers is filed and judged the way the House files a stay.</p></div>
              <div><h3 className="ledger-display text-[1.3rem]">What changes</h3><p className="mt-2 text-[16.5px] ledger-muted leading-relaxed">The depth. Reserve by reserve, camp by camp, with the guides who&rsquo;ll be in the vehicle with you.</p></div>
            </div>
          </section>

          {/* What to expect */}
          <section className="mt-12 md:mt-16 border-t ledger-rule pt-8" aria-labelledby="expect-h">
            <p className="ledger-eyebrow ledger-crimson">What to expect</p>
            <h2 id="expect-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Four steps, one safari.</h2>
            <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <li key={s.n} className="border ledger-border bg-paper-card p-6 flex flex-col">
                  <span className="self-start bg-crimson text-paper ledger-eyebrow !text-[11px] px-2 py-1">{s.n}</span>
                  <h3 className="ledger-display text-[1.35rem] mt-4">{s.t}</h3>
                  <p className="mt-2 text-[16px] ledger-muted leading-relaxed">{s.l}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Three ways to go */}
          <section className="mt-12 md:mt-16 border-t ledger-rule pt-8" aria-labelledby="types-h">
            <p className="ledger-eyebrow ledger-crimson">At the desk</p>
            <h2 id="types-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Three ways to go on safari.</h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {TYPES.map((t) => (
                <li key={t.t} className="border-t-2 border-crimson pt-4"><h3 className="ledger-display text-[1.35rem]">{t.t}</h3><p className="mt-2 text-[16px] ledger-muted leading-relaxed">{t.l}</p></li>
              ))}
            </ul>
          </section>

          {/* The hand-over: the only outbound link on the House site */}
          <section className="mt-12 md:mt-16 border ledger-border bg-paper-card p-6 md:p-10 grid gap-8 md:grid-cols-[minmax(0,260px)_1fr] items-center" aria-labelledby="handover-h">
            <Image src="/brand/wild-and-co-safaris-ink.png" alt="Wild & Co Safaris, Africa" width={700} height={486} className="w-[200px] md:w-[260px] h-auto" />
            <div>
              <p className="ledger-eyebrow ledger-crimson">The hand-over</p>
              <h2 id="handover-h" className="ledger-display text-[1.75rem] md:text-[2.2rem] mt-2">Ready when you are.</h2>
              <p className="mt-3 text-[17px] leading-relaxed">You&rsquo;re about to open Wild &amp; Co Safaris in a new tab. Start with Crux, or browse the reserves. This page and everything you&rsquo;ve planned with the House stay right here.</p>
              <blockquote className="mt-5 border-l-2 border-crimson pl-4 text-[17px] italic">&ldquo;I&rsquo;ve designed safaris since 2011. Africa deserves its own desk, and its own guides.&rdquo; <span className="not-italic ledger-muted text-[14px] block mt-1">James</span></blockquote>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={SAFARI_DESK.url} target="_blank" rel="noopener" className="ledger-btn ledger-btn--solid inline-flex items-center gap-2">Continue to Wild &amp; Co Safaris <ArrowUpRight className="w-4 h-4" aria-hidden="true" /></a>
                <Link href="/plan" className="ledger-btn">Talk to James first</Link>
              </div>
            </div>
          </section>

          {/* Stay with the House */}
          <section className="mt-12 md:mt-16 border-t ledger-rule pt-8" aria-labelledby="stay-h">
            <p className="ledger-eyebrow ledger-crimson">Not just a safari?</p>
            <h2 id="stay-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Keep planning with the House.</h2>
            <p className="mt-3 text-[17px] ledger-muted max-w-2xl">If the safari is a few nights inside a bigger journey, the House plans it whole.</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {[["Overland routes", "/overland"], ["Safari reserves on the House", "/safaris"], ["Gatherings: family houses", "/gatherings"], ["Stays", "/stays"], ["The Journal", "/journal"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="inline-block border ledger-border px-3 py-1.5 text-[14.5px] hover:border-crimson">{l}</Link></li>
              ))}
            </ul>
          </section>

          {/* FAQ (answer-first, matches the FAQPage schema) */}
          <section className="mt-12 md:mt-16 border-t ledger-rule pt-8" aria-labelledby="faq-h">
            <p className="ledger-eyebrow ledger-crimson">Questions</p>
            <h2 id="faq-h" className="ledger-display text-[1.75rem] md:text-4xl mt-2">About the safari desk</h2>
            <div className="mt-6 grid gap-3 max-w-3xl">
              {FAQS.map((f) => (
                <details key={f.q} className="group border ledger-border open:border-crimson/50 open:bg-paper-card">
                  <summary className="cursor-pointer px-5 py-4 ledger-display text-[1.15rem]">{f.q}</summary>
                  <p className="px-5 pb-5 text-[16px] ledger-muted leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <PlanClose title="Safari or not, it starts with a conversation." />
        </div>
      </main>
      <JsonLd data={graph(
        { "@type": "WebPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Wild & Co Safaris: the House's Safari Desk", isPartOf: { "@id": ids.website }, about: { "@id": absoluteUrl(`${PATH}#desk`) } },
        { "@type": ["Organization", "TravelAgency"], "@id": absoluteUrl(`${PATH}#desk`), name: "Wild & Co Safaris", url: SAFARI_DESK.url, parentOrganization: { "@id": ids.house }, logo: absoluteUrl("/brand/wild-and-co-safaris-ink.png"), knowsAbout: ["African safaris", "Private guided safaris", "Walking safaris", "Great Migration", "Okavango Delta", "Sabi Sand"] },
        breadcrumbs([{ name: "Home", path: "/" }, { name: "Safaris", path: "/safaris" }, { name: "Wild & Co Safaris", path: PATH }]),
        faqPage(FAQS),
      )} />
    </>
  );
}
