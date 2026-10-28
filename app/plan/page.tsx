import { Suspense } from "react";
import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import { JwcoSeal, OfferStamp } from "@/components/ledger/Marks";
import { HandCta } from "@/components/ledger/FieldIcon";
import EnquiryForm from "@/components/plan/EnquiryForm";
import { PLAN } from "@/lib/content/plan";
import { SITE } from "@/lib/site";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /plan: the enquiry and call-booking page, the one that makes money.
// Hero + form first (with the context each link carries) › how it works ›
// two ways to begin › stay longer › Iggi › insurance & conditions › FAQ.
// ContactPage + ContactPoint schema. Noindex until enquiries are connected.

const PATH = "/plan";
export const metadata = buildMetadata({
  title: "Plan Your Journey With James Wild & Co: Enquire or Book a Call",
  description: "Tell James Wild & Co where you're drawn. James or an advisor replies by email or a call, shapes the trip from the vetted Ledger and sends a quote. Nothing is booked until you approve.",
  path: PATH,
  noindex: false /* approved by James, 28 Oct 2026 */,
});

export default function PlanPage() {
  const p = PLAN;
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10 pb-20">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Plan with James", path: PATH }]} /></div>
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-start">
            <header className="lg:sticky lg:top-28">
              <p className="ledger-eyebrow ledger-crimson">{p.eyebrow}</p>
              <h1 className="ledger-display text-[2.1rem] leading-[1.12] md:text-[2.9rem] mt-3">{p.title}</h1>
              <p className="mt-4 text-[18px] ledger-muted leading-relaxed">{p.lead}</p>
              <div className="mt-6 flex items-center gap-4">
                <JwcoSeal size={76} />
                <p className="ledger-hand text-[1.6rem] leading-tight">&ldquo;Tell me where you&rsquo;re drawn. I&rsquo;ll tell you what&rsquo;s around the corner.&rdquo;</p>
              </div>
              <div className="mt-8 border-t ledger-rule pt-5 space-y-3 text-[16px]">
                <a href={`tel:${SITE.phone.tel}`} className="flex items-center gap-3 hover:ledger-crimson"><Phone className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> {SITE.phone.display}</a>
                {SITE.email && <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 hover:ledger-crimson"><Mail className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> {SITE.email}</a>}
                <Link href="/plan/iggi" className="flex items-center gap-3 hover:ledger-crimson"><MessageCircle className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Quick question? Meet Iggi (coming soon)</Link>
                <Link href="/compass" className="block ledger-btn-ghost w-fit">Not sure where yet? Take the Compass</Link>
              </div>
            </header>
            <section aria-label="Enquiry form" className="ledger-paper p-5 md:p-8">
              <Suspense fallback={<p className="ledger-muted">Loading the form…</p>}><EnquiryForm /></Suspense>
            </section>
          </div>

          <div className="mt-14"><AnswerBlock>{p.answer}</AnswerBlock></div>

          <section className="mt-12 md:mt-16 border-t ledger-rule pt-8" aria-labelledby="how-heading">
            <p className="ledger-eyebrow ledger-crimson">How it works</p>
            <h2 id="how-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">From the First Conversation to Confirmation</h2>
            <ol className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {p.steps.map((s) => <li key={s.n} className="border-t-2 border-crimson pt-4"><span className="font-mono text-[13px] ledger-crimson">{s.n}</span><h3 className="ledger-display text-[1.3rem] mt-1">{s.title}</h3><p className="mt-2 text-[15.5px] ledger-muted leading-relaxed">{s.body}</p></li>)}
            </ol>
          </section>

          <section className="mt-16 md:mt-24 grid md:grid-cols-2 gap-6" aria-label="Two ways to begin">
            <div className="ledger-paper p-6 md:p-8">
              <p className="ledger-eyebrow ledger-crimson">Way one</p>
              <h2 className="ledger-display text-[1.7rem] mt-1">{p.ways.advisor.title}</h2>
              <p className="ledger-display italic text-[1.1rem] mt-1 ledger-muted">{p.ways.advisor.italic}</p>
              <p className="mt-3 text-[16px] leading-relaxed">{p.ways.advisor.body}</p>
              <div className="mt-5 flex flex-wrap gap-5 items-center"><HandCta kind="schedule-call" href="#main" /><Link href="/about/team" className="ledger-btn-ghost">Meet the advisors</Link></div>
            </div>
            <div className="border border-dashed ledger-rule p-6 md:p-8">
              <p className="ledger-eyebrow">Way two · {p.ways.online.badge}</p>
              <h2 className="ledger-display text-[1.7rem] mt-1">{p.ways.online.title}</h2>
              <p className="ledger-display italic text-[1.1rem] mt-1 ledger-muted">{p.ways.online.italic}</p>
              <p className="mt-3 text-[16px] leading-relaxed">{p.ways.online.body}</p>
            </div>
          </section>

          <section className="mt-16 md:mt-24 bg-rust-wash p-6 md:p-10 grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center" aria-labelledby="offers-heading">
            <OfferStamp stay={4} pay={3} size={150} />
            <div>
              <p className="ledger-eyebrow !text-rust">{p.offers.mark}</p>
              <h2 id="offers-heading" className="ledger-display text-[1.6rem] md:text-[2.1rem] mt-1 leading-tight">{p.offers.title}</h2>
              <p className="mt-3 text-[16.5px] leading-relaxed max-w-2xl">{p.offers.line}</p>
              <p className="mt-2 text-[13.5px] ledger-muted max-w-2xl">{p.offers.note}</p>
            </div>
          </section>

          <section className="mt-16 md:mt-24 grid md:grid-cols-2 gap-10 border-t ledger-rule pt-8" aria-label="Before you book">
            <div><h2 className="ledger-display text-[1.5rem]">Travel Insurance, Part of Preparing Well</h2><p className="mt-3 text-[16px] ledger-muted leading-relaxed">{p.insurance}</p></div>
            <div><h2 className="ledger-display text-[1.5rem]">Know the Details Before You Commit</h2><p className="mt-3 text-[16px] ledger-muted leading-relaxed">{p.conditions}</p><Link href="/legal/booking-conditions" className="mt-4 inline-block ledger-btn-ghost">Read the booking conditions</Link></div>
          </section>

          <FaqBlock faqs={p.faqs} title="Planning, answered" />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "ContactPage", "@id": absoluteUrl(`${PATH}#page`), url: absoluteUrl(PATH), name: "Plan your journey with James Wild & Co", about: { "@id": ids.house } }, { "@type": "TravelAgency", "@id": ids.house, contactPoint: { "@type": "ContactPoint", telephone: SITE.phone.tel, email: SITE.email ?? undefined, contactType: "reservations", areaServed: "Worldwide", availableLanguage: ["English"] } })} />
    </>
  );
}
