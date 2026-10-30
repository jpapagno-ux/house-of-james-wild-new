import Link from "next/link";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import SiteHeader from "@/components/ledger/SiteHeader";
import { Conservation, Experiences, IncludedLists, PreviewNote, SectionHead } from "@/components/record/Sections";
import TswaluCalculator from "@/components/rates/TswaluCalculator";
import { EXCLUDED, EXTRA_CHILD, EXTRAS, FLIGHTS, INCLUDED, MIN_STAY, MOTSE_FAMILY_4A_2027, OFFERS, PAYMENT, RATE_ROWS, TSWALU_RATES_CHECKED, zar } from "@/lib/content/rates/tswalu-rates";
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
          intro="Tswalu calls itself South Africa's largest privately owned reserve, and its mission, in its own words, is to 'restore the Kalahari to itself'."
          body="For more than 25 years the reserve has been a conservation project first. Guest stays help fund it: Tswalu says each night 'helps to offset the cost of conservation'. The Tswalu Foundation backs research at the Dedeben Research Centre, where visiting scientists study the Kalahari's biodiversity and regenerative land management, from pangolin and puff adders to lichens and butterfly migration. Tswalu is a member of The Long Run and holds Global Ecosphere Resort status (2024), the network's most advanced sustainability standard, built on conservation, community, culture and commerce. It also claims the lowest guest footprint in South Africa: three camps, and no other vehicles on the reserve."
          image={{ url: `${CLD}/jwco/journal/africa-inspired-wild-and-co-safaris/tswalu-loapi-kalahari-hills`, alt: "A daybed on the Loapi deck at Tswalu looking out over the Kalahari grassland to the Korannaberg hills" }} />

        <Experiences eyebrow="The Tswalu experience" title="A Private Safari in the Kalahari" intro="Tswalu, in Setswana, means 'a new beginning'. Over 80 mammal species, from black-maned Kalahari lion and desert black rhino to the shy night species." items={EXPERIENCES} icon="mountain-sun" />

        <section id="rates" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32">
          <SectionHead eyebrow="Rates · South African rand, per night, fully inclusive" title="What a Night at Tswalu Costs" intro="Tswalu's own published rates by camp and room. 2026 is one rate all year; 2027 has high and peak seasons." />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-[15px] min-w-[640px]">
              <thead><tr className="text-left ledger-eyebrow"><th className="py-2 pr-4">Camp · room</th><th className="py-2 pr-4">Sleeps</th><th className="py-2 pr-4 text-right">2026</th><th className="py-2 pr-4 text-right">2027 high</th><th className="py-2 text-right">2027 peak</th></tr></thead>
              <tbody>
                {camps.map((c) => RATE_ROWS.filter((r) => r.camp === c).map((r, i) => (
                  <tr key={r.id} className={`border-t ledger-rule ${i === 0 ? "border-t-2" : ""}`}>
                    <th scope="row" className="py-2.5 pr-4 text-left font-normal"><span className="ledger-display text-[1.05rem]">{c === "Motse" ? "The Motse" : c}</span> · {r.label}{r.basis === "per-adult" ? " (per adult)" : ""}</th>
                    <td className="py-2.5 pr-4 ledger-muted">{r.sleeps}</td>
                    <td className="py-2.5 pr-4 text-right">{zar(r.r2026)}</td><td className="py-2.5 pr-4 text-right">{zar(r.r2027.high)}</td><td className="py-2.5 text-right">{zar(r.r2027.peak)}</td>
                  </tr>
                )))}
                <tr className="border-t ledger-rule"><th scope="row" className="py-2.5 pr-4 text-left font-normal">The Motse · Family legae, 4 adults</th><td className="py-2.5 pr-4 ledger-muted">4 adults</td><td className="py-2.5 pr-4 text-right ledger-muted">not listed</td><td className="py-2.5 pr-4 text-right">{zar(MOTSE_FAMILY_4A_2027.high)}</td><td className="py-2.5 text-right">{zar(MOTSE_FAMILY_4A_2027.peak)}</td></tr>
                <tr className="border-t-2 ledger-rule"><th scope="row" className="py-2.5 pr-4 text-left font-normal">Extra child, 0–17</th><td className="py-2.5 pr-4 ledger-muted">where the room allows</td><td className="py-2.5 pr-4 text-right">{zar(EXTRA_CHILD.r2026)}</td><td className="py-2.5 pr-4 text-right">{zar(EXTRA_CHILD.r2027.high)}</td><td className="py-2.5 text-right">{zar(EXTRA_CHILD.r2027.peak)}</td></tr>
                <tr className="border-t ledger-rule"><th scope="row" className="py-2.5 pr-4 text-left font-normal">{EXTRAS.malori.label}</th><td className="py-2.5 pr-4 ledger-muted">extra</td><td className="py-2.5 pr-4 text-right">{zar(EXTRAS.malori.r2026)}</td><td className="py-2.5 pr-4 text-right">{zar(EXTRAS.malori.r2027.high)}</td><td className="py-2.5 text-right">{zar(EXTRAS.malori.r2027.peak)}</td></tr>
                <tr className="border-t ledger-rule"><th scope="row" className="py-2.5 pr-4 text-left font-normal">{EXTRAS.photoSafari.label}</th><td className="py-2.5 pr-4 ledger-muted">extra</td><td className="py-2.5 pr-4 text-right">{zar(EXTRAS.photoSafari.r2026)}</td><td className="py-2.5 pr-4 text-right">{zar(EXTRAS.photoSafari.r2027.high)}</td><td className="py-2.5 text-right">{zar(EXTRAS.photoSafari.r2027.peak)}</td></tr>
                <tr className="border-t ledger-rule"><th scope="row" className="py-2.5 pr-4 text-left font-normal">Tswalu charter, Johannesburg or Cape Town, return</th><td className="py-2.5 pr-4 ledger-muted">per seat</td><td className="py-2.5 pr-4 text-right">{zar(FLIGHTS.r2026.ret)}</td><td className="py-2.5 pr-4 text-right" colSpan={2}>{zar(FLIGHTS.r2027.ret)} (2027)</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] ledger-muted max-w-3xl">Children 0–11 sharing a legae or one-bedroom home with two adults stay free (two at most). 2027 seasons: high 4 Jan–31 May and 1 Sep–17 Dec; peak 1–3 Jan, 1 Jun–31 Aug and 18–31 Dec. Rates checked {TSWALU_RATES_CHECKED}.</p>
          <div className="mt-8"><IncludedLists included={INCLUDED} excluded={EXCLUDED} /></div>
          <div className="mt-8 grid md:grid-cols-2 gap-6 text-[15px]">
            <div><p className="ledger-eyebrow">Minimum stays</p><ul className="mt-3 space-y-1.5 list-disc pl-5">{MIN_STAY.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><p className="ledger-eyebrow">Deposit and cancellation</p><ul className="mt-3 space-y-1.5 list-disc pl-5">{PAYMENT.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </section>

        <section id="offers" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10">
          <SectionHead eyebrow="Tswalu's offers · one at a time, never combined" title="Ways to Stay Longer for Less" />
          <ul className="mt-6 grid sm:grid-cols-2 gap-4">{OFFERS.map((o) => <li key={o.id} className="border ledger-border p-5"><p className="ledger-display text-[1.3rem]">{o.name}</p><p className="mt-1 text-[15px]">{o.line}.</p></li>)}</ul>
        </section>

        <section id="calculator" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10">
          <SectionHead eyebrow="Sample costs" title="Price a Stay at Tswalu" intro="Choose a camp, dates and party, and add the extras. A planning sample on Tswalu's own rates; the live price is confirmed when you book." />
          <TswaluCalculator />
        </section>

        <PreviewNote>
          <p>The 2027 rate figures were read from Tswalu&rsquo;s PDF in table order; check them against the card before this goes live. Two look odd: The Motse family legae for 3 adults is lower in 2027 (R 131 600) than 2026 (R 139 200), and the 2027 charter fare is much higher (R 59 600 vs R 39 200 return).</p>
          <p>Commercial terms are filed privately in the studio (PartnerTerms) and are never shown on any page. Rates here are Tswalu&rsquo;s published rates.</p>
          <p>A fifth 2027 offer, the &ldquo;Midweek Flight Offer&rdquo; (40% off for Monday or Thursday arrivals, March–April and October–November), is left out of the calculator until its basis is confirmed.</p>
          <p>Reserve size: Tswalu&rsquo;s rates page says 118,000 ha, its home page 1,200 km&sup2;; the page uses Tswalu&rsquo;s own &ldquo;largest privately owned reserve&rdquo; until confirmed.</p>
          <p>Next: dynamic pricing replaces the calculator&rsquo;s fixed card once a live rate feed is connected.</p>
        </PreviewNote>
      </main>
    </>
  );
}
