import Link from "next/link";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import SiteHeader from "@/components/ledger/SiteHeader";
import { Conservation, Experiences, PreviewNote, SectionHead } from "@/components/record/Sections";
import TswaluRatesPlanner from "@/components/rates/TswaluRatesPlanner";
import { OFFERS } from "@/lib/content/rates/tswalu-rates";
import { buildMetadata } from "@/lib/seo";

// Preview for James's review (30 Oct 2026): the Tswalu sections to add to the
// live reserve page at /safaris/tswalu-reserve: conservation, the private
// safari, rates by camp and room (2026 and 2027), offers, what's included,
// payment terms and a sample cost calculator. Facts are Tswalu's own and
// attributed as such. Commission and net terms are never shown.

export const metadata = buildMetadata({ title: "Tswalu Kalahari: Conservation, Rates & Sample Costs (preview)", description: "Preview of the Tswalu reserve additions.", path: "/preview/safaris/tswalu-reserve", noindex: true });

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1600/q_auto:good/f_jpg";
const T = "wildco/south-africa/tswalu";

const EXPERIENCES = [
  { name: "A private safari, always", meta: "Your own vehicle, guide and tracker", body: "Every booking has its own 4×4, guide and tracker, and there are no other camps or safari vehicles on the reserve, so a sighting is never shared and the day runs at your pace.", image: `${CLD}/${T}/loapi/loapi-deck`, alt: "Loapi deck at Tswalu Kalahari" },
  { name: "Meerkats at first light", meta: "Three habituated colonies", body: "Early mornings with habituated meerkat colonies, close enough to watch them sun themselves and stand sentry.", image: null },
  { name: "On foot and on horseback", meta: "Walks · rides over the dunes", body: "Slow, guided walks to read the tracks of the night before, and rides over the red dunes for intermediate and advanced riders, with sundowners at the end.", image: `${CLD}/${T}/tarkuni/tarkuni-boma-sunset`, alt: "The boma at Tarkuni at sunset" },
  { name: "Malori, under the stars", meta: "Sleep-out · extra cost", body: "A night under canvas on the open veld. Malori means 'dreamer' in Setswana; the Kalahari sky does the rest.", image: `${CLD}/${T}/loapi/loapi-firepit-at-dusk`, alt: "Fire pit at Loapi at dusk" },
  { name: "Boscia", meta: "Dining · stays of 2+ nights", body: "Tswalu's restaurant from Luke Dale Roberts, included for stays of two nights or more (not for under-12s).", image: `${CLD}/${T}/loapi/loapi-indoor-dining`, alt: "Dining at Loapi, Tswalu Kalahari" },
  { name: "The ones most people never see", meta: "Night tracking · rock art", body: "Pangolin, aardvark, aardwolf and brown hyena, tracked with your own tracker; and San rock engravings in the Korannaberg foothills. Sightings are possible, never guaranteed.", image: `${CLD}/${T}/motse/motse-walkway`, alt: "Walkway at The Motse, Tswalu Kalahari" },
];

const camps = ["Motse", "Loapi", "Tarkuni"] as const;

export default function TswaluPreview() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="max-w-ledger mx-auto px-5 md:px-10 pb-24">
        <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Safaris", path: "/safaris" }, { name: "Tswalu Kalahari Reserve", path: "/safaris/tswalu-reserve" }, { name: "Preview", path: "/preview/safaris/tswalu-reserve" }]} /></div>
        <p className="mt-6 ledger-eyebrow ledger-crimson">Preview · additions to the live Tswalu page</p>
        <h1 className="ledger-display text-[2.2rem] md:text-5xl mt-2">Tswalu Kalahari: Conservation, Rates and What It Costs</h1>
        <p className="mt-4 text-[17px] max-w-3xl leading-relaxed">James stayed at Tswalu in May 2012, and it is his number one founder favourite: in his words, it changed the way he sees Africa completely; off the scale, the silence and the perfection. <Link href="/safaris/tswalu-reserve" className="underline underline-offset-4">See the live reserve page</Link>.</p>

        <Conservation eyebrow="Conservation first" title="Restoring the Kalahari to Itself" subtitle="Every night here helps pay for the reserve"
          intro="118,000 hectares of the southern Kalahari: South Africa's largest privately owned reserve, with a mission, in Tswalu's own words, to 'restore the Kalahari to itself'."
          body="For more than 25 years the reserve has been a conservation project first. Guest stays help fund it: Tswalu says each night 'helps to offset the cost of conservation'. The Tswalu Foundation backs research at the Dedeben Research Centre, where visiting scientists study the Kalahari's biodiversity and regenerative land management, from pangolin and puff adders to lichens and butterfly migration. Tswalu is a member of The Long Run and holds Global Ecosphere Resort status (2024), the network's most advanced sustainability standard, built on conservation, community, culture and commerce. It also claims the lowest guest footprint in South Africa: three camps, and no other vehicles on the reserve."
          image={{ url: `${CLD}/jwco/journal/africa-inspired-wild-and-co-safaris/tswalu-loapi-kalahari-hills`, alt: "A daybed on the Loapi deck at Tswalu looking out over the Kalahari grassland to the Korannaberg hills" }} />

        <section id="joffers" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
          <div>
            <p className="ledger-eyebrow ledger-crimson">Where the alliance began</p>
            <h2 className="ledger-display text-[1.9rem] md:text-[2.4rem] leading-tight mt-2">The Guide Comes First</h2>
          </div>
          <div className="text-[16.5px] leading-relaxed space-y-4">
            <p>Tswalu is where James met Joffers McCormick, in 2012: a guide who reads the Kalahari the way most people read a room. That meeting became an alliance. Joffers is now a co-founder of Wild &amp; Co Safaris, and together they are launching private guided safaris, with a guide you know before you choose a single camp.</p>
            <p>If this is your first time in Africa, start with the <a href="/compass" className="underline underline-offset-4 hover:ledger-crimson">Safari Compass</a>. A few honest questions, then a deep and meaningful itinerary drawn by people who have walked it: the best way we know to begin with Africa.</p>
          </div>
        </section>

        <Experiences eyebrow="The Tswalu experience" title="A Private Safari in the Kalahari" intro="Tswalu, in Setswana, means 'a new beginning'. Over 80 mammal species, from black-maned Kalahari lion and desert black rhino to the shy night species." items={EXPERIENCES} icon="mountain-sun" />

        <section id="offers" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10">
          <SectionHead eyebrow="Tswalu's offers · one at a time, never combined" title="Ways to Stay Longer for Less" />
          <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{OFFERS.map((o) => <li key={o.id} className="border ledger-border p-5"><p className="ledger-display text-[1.25rem]">{o.name}</p><p className="mt-1 text-[14.5px]">{o.line}.</p></li>)}</ul>
        </section>

        <section id="rates" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32">
          <SectionHead eyebrow="Rates and sample costs · South African rand" title="What a Stay at Tswalu Costs" intro="Open a camp to see its rooms, switch between 2026 and 2027, and price any room on the right. A planning sample on Tswalu's own rates; the live price is confirmed when you book." />
          <TswaluRatesPlanner />
        </section>

        <PreviewNote>
          <p>The 2027 rate figures were read from Tswalu&rsquo;s PDF in table order; check them against the card before this goes live. Two look odd: The Motse family legae for 3 adults is lower in 2027 (R 131 600) than 2026 (R 139 200), and the 2027 charter fare is much higher (R 59 600 vs R 39 200 return).</p>
          <p>Commercial terms are filed privately in the studio (PartnerTerms) and are never shown on any page. Rates here are Tswalu&rsquo;s published rates.</p>
          <p>A fifth 2027 offer, the &ldquo;Midweek Flight Offer&rdquo; (40% off for Monday or Thursday arrivals, March–April and October–November), is left out of the calculator until its basis is confirmed.</p>
          <p>Reserve size: 118,000 hectares, Tswalu&rsquo;s rate-card figure (its home page rounds to 1,200 km&sup2;). Chosen by James, 30 Oct 2026.</p>
          <p>Next: dynamic pricing replaces the calculator&rsquo;s fixed card once a live rate feed is connected.</p>
        </PreviewNote>
      </main>
    </>
  );
}
