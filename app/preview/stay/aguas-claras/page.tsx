import SiteHeader from "@/components/ledger/SiteHeader";
import FaqBlock from "@/components/ledger/FaqBlock";
import HostPanel from "@/components/record/HostPanel";
import LedgerChart from "@/components/destination/LedgerChart";
import { OfferCard } from "@/components/record/Pricing";
import { CardRail, Conservation, Experiences, Features, GalleryStrip, Overview, PreviewNote, RecordHero, RecordNav, RoomsLedger, WhyChose, type Room } from "@/components/record/Sections";
import { CHART_COSTA_RICA, projectCostaRica } from "@/lib/charts/costa-rica";
import { SAMPLE_AGUAS as A } from "@/lib/content/preview/aguas-claras";
import { SAMPLE_STAY_PROMOTION as P } from "@/lib/content/preview/promotion-aguas";
import { COSTA_RICA } from "@/lib/content/preview/costa-rica";
import { buildMetadata } from "@/lib/seo";

// Preview of the STAY template on Aguas Claras (STY-2026-000006, Playa
// Chiquita, Costa Rica). Text and images are the library record; rooms and
// "from" prices are the Room records (rates_pending none, USD per room per
// night). Experiences are split from the record's adventures text because no
// Experience records are linked to this stay yet.

export const metadata = buildMetadata({ title: "Aguas Claras, Playa Chiquita: Vetted Caribbean Hideaway (preview)", description: "Preview of the James Wild & Co stay template.", path: "/preview/stay/aguas-claras", noindex: true });

const INCLUDED = ["A-la-carte breakfast", "High-speed WiFi", "Concierge & tour planning", "Beach bicycles", "Daily housekeeping & turndown", "Pool, yoga shala & gardens", "DaLime Beach Club via private gate", "Theme nights, bonfires, yoga & Afro-Caribbean experiences", "Organic toiletries, robes", "A/C & ceiling fans"];
const ROOMS: Room[] = [
  { name: "Pavlova Suites", image: A.rooms[0].image, sleeps: 2, beds: "1 King (1 of 6 has 2 doubles)", size: 30, units: 6, price: 460, included: INCLUDED },
  { name: "1-Bedroom Bungalow", image: A.rooms[1].image, sleeps: 2, beds: "1 King or 2 Singles", size: 50, units: 3, price: 610, included: INCLUDED },
  { name: "2-Bedroom Luxury Bungalow", image: A.rooms[3].image, sleeps: 4, beds: "1 King & 2 Singles", units: 10, price: 953, included: INCLUDED },
  { name: "2-Bedroom Deluxe Bungalow", image: A.rooms[2].image, sleeps: 4, beds: "1 King + 2 Singles, 2 en-suites", size: 74, units: 2, plunge: true, price: 1100, included: INCLUDED },
];
const G = A.gallery;
const EXPERIENCES = [
  { name: "Snorkel the calm coves", meta: "Sea · Mornings", body: "Guided snorkeling trips over the reef off Playa Chiquita." },
  { name: "Private surf lesson", meta: "Sea · All levels", body: "Surf the Caribbean breaks with a private instructor." },
  { name: "Jungle trails with a naturalist", meta: "Forest · Afternoons", body: "Explore the rainforest trails and the wildlife that lives there." },
  { name: "Cacao ceremony", meta: "Culture · Small group", body: "A private ceremony led by a community practitioner." },
  { name: "Cooking & cocktail class", meta: "Culture · Hands-on", body: "Regional flavours, taught in the Papaya kitchen." },
  { name: "Beach bonfire with live music", meta: "Evenings", body: "Candlelit bonfires on the sand with local musicians." },
];

const p = projectCostaRica(9.643245, -82.720328);
const nearby = COSTA_RICA.ledger.items.filter((s) => s.slug !== "aguas-claras" && s.image && s.tagline);

export default function AguasClarasPreview() {
  const offer = P.card;
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <RecordHero image={{ url: A.hero.url, alt: A.hero.alt }} eyebrow={`${A.ledger.location} · ${A.ledger.id}`} title={A.ledger.name} tagline={A.ledger.tagline} />
        <RecordNav items={[["Overview", "overview"], ["Why we chose it", "why"], ["Rooms", "rooms"], ["Offer", "offer"], ["Experiences", "experiences"], ["Features", "features"], ["Conservation", "conservation"], ["Meet your host", "host"], ["Map", "map"], ["FAQ", "faq-heading"]]} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <Overview
            quote={A.ledger.introQuote}
            answer="Aguas Claras is a 12-room art-filled hideaway directly on Playa Chiquita, near Puerto Viejo on Costa Rica's south Caribbean coast. Rooms run from Pavlova suites to two-bedroom bungalows with plunge pools, from US$460 a night. Best May to November; fly into San José (SJO)."
            facts={[["Ledger ID", A.ledger.id], ["Type", "Boutique hotel · 12 rooms"], ["Best months", "May to November"], ["Fly into", "San José (SJO)"], ["From", "US$460 per room, per night"], ["Best for", "Honeymoon · family · solo · adventure"]]}
            paragraphs={A.staysContent}
          />
          <WhyChose
            title="Why Aguas Claras Is in the Ledger"
            status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">Vetted by the house</span> · in the Ledger since August 2026 · no founder visit filed yet, so no founder stamp</p>}
            blocks={A.whyStay}
            image={{ url: G[3].url, alt: G[3].alt }}
          />
          <RoomsLedger title="Four Ways to Stay on Playa Chiquita" intro="Every room category on file, with its published “from” price per room, per night. Per-room seasonal prices will sit in the same place." rooms={ROOMS} footnote="“From” prices are the published rates in the house rate registry (USD, per room, per night, before tax). Your dates are quoted live before anything is booked." />
          <OfferCard
            offer={{
              id: "WAN-2026-014",
              title: offer.tagline,
              statement: offer.statement,
              property: offer.property,
              place: offer.byline,
              image: offer.images[0],
              options: offer.options,
              bookBy: offer.validity.bookBy,
              stayThrough: offer.validity.stayThrough,
              terms: offer.validity.note,
              included: offer.included,
              excluded: offer.excluded,
              exclusive: "Stay five nights or more and the house adds one more night, with our compliments. (Sample line for the exclusive field.)",
            }}
          />
          <Experiences title="Sea and Forest, Both Filed" intro="Mornings on the reef, afternoons in the forest, evenings with the coast's own music." items={EXPERIENCES} icon="wave" />
          <Features title="What the Rate Carries" body={A.features.body} onlyHere={{ title: A.onlyHere.title, paragraphs: A.onlyHere.paragraphs }} icon="coral" />
          <Conservation eyebrow="People + planet" title={`${A.peoplePlanet.titleA} ${A.peoplePlanet.titleItalic} ${A.peoplePlanet.titleB}`} intro={A.peoplePlanet.intro} body={A.peoplePlanet.body} />
          <div className="mt-16 md:mt-24 border-t ledger-rule pt-10">
            <HostPanel state="not_linking" stayName={A.ledger.name} />
          </div>

          {/* Location map */}
          <section id="map" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start" aria-labelledby="map-heading">
            <div className="relative border ledger-rule overflow-hidden ledger-chart is-drawn">
              <LedgerChart title="Where Aguas Claras sits in Costa Rica" />
              <svg viewBox={`0 0 ${CHART_COSTA_RICA.width} ${CHART_COSTA_RICA.height}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
                {COSTA_RICA.ledger.items.filter((s) => s.lat != null && s.slug !== "aguas-claras").map((s) => { const q = projectCostaRica(s.lat as number, s.lng as number); return <circle key={s.id} cx={q.x} cy={q.y} r="6" fill="#8B2525" fillOpacity="0.3" stroke="#F4F1ED" strokeWidth="2" />; })}
                <circle cx={p.x} cy={p.y} r="30" fill="none" stroke="#8B2525" strokeWidth="2" className="ledger-pin-pulse" />
                <circle cx={p.x} cy={p.y} r="12" fill="#8B2525" stroke="#F4F1ED" strokeWidth="3" />
                <text x={p.x - 20} y={p.y - 24} textAnchor="end" fontFamily="'Playfair Display', serif" fontSize="22" fill="#2D2A26" stroke="#F4F1ED" strokeWidth="4" paintOrder="stroke">Aguas Claras</text>
              </svg>
            </div>
            <div>
              <p className="ledger-eyebrow">Location</p>
              <h2 id="map-heading" className="ledger-display text-[1.75rem] md:text-3xl mt-2">Playa Chiquita, South Caribbean Coast</h2>
              <dl className="mt-5 border-t ledger-rule text-[15px]">
                {[["Address", A.facts.address], ["Coordinates", A.facts.coordinates], ["Airport", A.facts.airportName], ["Getting there", A.facts.airportDirections]].map(([k, v]) => (
                  <div key={k} className="py-3 border-b ledger-rule"><dt className="ledger-eyebrow">{k}</dt><dd className="mt-1">{v}</dd></div>
                ))}
              </dl>
              <p className="mt-4 text-[13px] ledger-muted">Faint pins are the other stays in the Ledger in Costa Rica.</p>
            </div>
          </section>

          <CardRail id="nearby" eyebrow="James's favourites & more in Costa Rica" title="Also in the Ledger in Costa Rica" cards={nearby.map((s) => ({ name: s.name, href: `/stays/${s.slug}`, image: s.image, meta: `${s.kind}${s.area ? ` · ${s.area}` : ""}`, line: s.tagline }))} />
          <GalleryStrip images={G.slice(0, 9)} />
          <FaqBlock faqs={A.faqs.map((f) => ({ q: f.question, a: f.answer }))} title="Questions About Aguas Claras" />

          <PreviewNote>
            <p>The Time Rewarded offer (WAN-2026-014) is switched off in the library; it&rsquo;s shown here so you can review it. The exclusive line is a sample.</p>
            <p>Experience cards are split from the record&rsquo;s adventures text, because no Experience records are linked to Aguas Claras yet. No founder favourites are filed in Costa Rica, so the rail shows the other Costa Rica stays.</p>
            <p>The library holds two Pavlova Suites records (US$460 and US$475); the page uses the fuller one. The duplicate needs removing.</p>
          </PreviewNote>
        </div>
      </main>
    </>
  );
}
