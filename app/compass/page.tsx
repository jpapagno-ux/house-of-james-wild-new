import SiteHeader from "@/components/ledger/SiteHeader";
import FaqBlock from "@/components/ledger/FaqBlock";
import JsonLd from "@/components/ledger/JsonLd";
import Compass from "@/components/destination/Compass";
import AnswerBlock from "@/components/ledger/AnswerBlock";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { COSTA_RICA } from "@/lib/content/preview/costa-rica";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { graph, ids } from "@/lib/schema";

// /compass: the James Wild Compass on its own page. Starts one question
// earlier than the destination Compass ("Where are you drawn?"). Costa Rica
// runs the full Compass in this phase; other destinations open their pages
// until their regions and routes are filed. Kept noindex until approved.

export const metadata = buildMetadata({
  title: "The James Wild Compass: Find Where to Travel, Then Talk to a Person",
  description: "A free trip finder from James Wild & Co. Answer a few questions and the Compass reads James's vetted Ledger, drafts a route and hands you to a person.",
  path: "/compass",
  noindex: true,
});

const FAQS = [
  { q: "What is the James Wild Compass?", a: "A trip finder from James Wild & Co. You answer a few questions about the kind of place you're drawn to, who's travelling and when; it reads the Ledger of places James has vetted, suggests stays and a draft route, and hands you to James or an advisor to finish the trip." },
  { q: "Is the Compass free?", a: "Yes. There's no charge and no sign-up to take the Compass. You only share your details if you choose to send your reading." },
  { q: "Who answers my reading?", a: "James, or an advisor of the house who knows the destination. The hidden place in your reading is revealed when you send it." },
  { q: "Can I keep my own travel advisor?", a: "Yes. The house works with your existing advisor if you have one." },
  { q: "Does the Compass book anything?", a: "No. It drafts; a person finishes. Nothing is booked until you've seen and approved a quote." },
  { q: "Which destinations does it cover?", a: "Costa Rica runs the full Compass today, including draft routes. Other destinations open their own pages while their regions and routes are added; safaris are answered by Crux at Wild & Co Safaris." },
];

const WEIGHS = [
  ["The place", "Rainforest, savanna, reef or ice, then the country and the region within it."],
  ["Who's travelling", "Honeymoon, family, adventure, wildlife, wellness or solo."],
  ["The season", "When you can go, matched to each place's best months."],
  ["Length & pace", "How long, and whether you'd rather move often or stay put."],
  ["Must-dos", "Volcano, cloud forest, wildlife, beach, rafting, wellness, culture."],
];

export default function CompassPage() {
  const stays = COSTA_RICA.ledger.items.map((x) => ({ slug: x.slug, name: x.name, kind: x.kind, area: x.area, tagline: x.tagline, bestMonths: x.bestMonths, image: x.image }));
  return (
    <>
      <SiteHeader />
      <main id="main" className="pt-6 md:pt-10">
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="mb-5"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "The Compass", path: "/compass" }]} /></div>
          <Compass global stays={stays} advisorHref="/advisors" />

          <div className="mt-14"><AnswerBlock>The James Wild Compass is a free trip finder from James Wild &amp; Co. Answer a few questions and it reads the Ledger of places James has vetted, suggests stays and a draft route, holds back one place he doesn&rsquo;t publish, and hands you to James or an advisor to finish the trip.</AnswerBlock></div>

          <section className="mt-16 border-t ledger-rule pt-8" aria-labelledby="weighs-heading">
            <p className="ledger-eyebrow">How it reads you</p>
            <h2 id="weighs-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">What the Compass Weighs</h2>
            <dl className="mt-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {WEIGHS.map(([k, v], i) => (
                <div key={k} className="border-t ledger-rule pt-3">
                  <dt className="ledger-display text-lg"><span className="font-mono text-[12px] ledger-crimson mr-2">{String(i + 1).padStart(2, "0")}</span>{k}</dt>
                  <dd className="mt-1.5 text-[15px] ledger-muted leading-relaxed">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-16 border-t ledger-rule pt-8" aria-labelledby="promise-heading">
            <p className="ledger-eyebrow">Why it&rsquo;s different</p>
            <h2 id="promise-heading" className="ledger-display text-[1.75rem] md:text-4xl mt-2">Three Promises No Quiz Makes</h2>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {[
                ["Only vetted places", "Every suggestion comes from the Ledger: stays, camps and routes James has approved, not a booking feed."],
                ["One hidden place", "Each reading holds back somewhere James goes himself and doesn't publish. It's yours when you send the reading."],
                ["It ends with a person", "James, an advisor of the house, or the advisor you already have finishes the trip. Never a checkout page."],
              ].map(([t, b]) => (
                <article key={t} className="ledger-paper border ledger-border p-6">
                  <h3 className="ledger-display text-xl">{t}</h3>
                  <p className="mt-2 text-[15px] ledger-muted leading-relaxed">{b}</p>
                </article>
              ))}
            </div>
          </section>

          <FaqBlock faqs={FAQS} title="Questions About the Compass" />
        </div>
      </main>
      <JsonLd data={graph({ "@type": "WebApplication", "@id": absoluteUrl("/compass#app"), name: "The James Wild Compass", url: absoluteUrl("/compass"), applicationCategory: "TravelApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, provider: { "@id": ids.house } })} />
    </>
  );
}
