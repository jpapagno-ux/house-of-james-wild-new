import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import SiteHeader from "@/components/ledger/SiteHeader";
import FaqBlock from "@/components/ledger/FaqBlock";
import HostPanel from "@/components/record/HostPanel";
import { hostFor } from "@/lib/content/hosts";
import { GalleryMosaic, GlanceBar, LocationBlock, RecordActionBar } from "@/components/record/Frame";
import { OfferCard } from "@/components/record/Pricing";
import { CardRail, Conservation, Experiences, Features, Overview, PreviewNote, RecordHero, RecordNav, RoomsLedger, WhyChose, type RecordCard, type Room } from "@/components/record/Sections";
import { CHART_COSTA_RICA } from "@/lib/charts/costa-rica";
import { SAMPLE_AGUAS as A } from "@/lib/content/preview/aguas-claras";
import { SAMPLE_STAY_PROMOTION as P } from "@/lib/content/preview/promotion-aguas";
import { COSTA_RICA } from "@/lib/content/preview/costa-rica";
import { buildMetadata } from "@/lib/seo";

// Preview of the STAY template on Aguas Claras (STY-2026-000006, Playa
// Chiquita, Costa Rica). Text and images are the library record; rooms and
// "from" prices are the Room records (rates_pending none, USD per room per
// night). Experiences and features are the Experience / Feature records,
// capped at four each (MAX_PER_RECORD).

export const metadata = buildMetadata({ title: "Aguas Claras, Playa Chiquita: Vetted Caribbean Hideaway (preview)", description: "Preview of the James Wild & Co stay template.", path: "/preview/stay/aguas-claras", noindex: true });

const INCLUDED = ["A-la-carte breakfast", "High-speed WiFi", "Concierge & tour planning", "Beach bicycles", "Daily housekeeping & turndown", "Pool, yoga shala & gardens", "DaLime Beach Club via private gate", "Theme nights, bonfires, yoga & Afro-Caribbean experiences", "Organic toiletries, robes", "A/C & ceiling fans"];
// Sample "not included" lines, to confirm against the partner rate sheet.
const EXCLUDED = ["Lunch and dinner", "Airport transfers", "Spa treatments", "Guided tours and excursions", "Taxes and service (13%)"];
const ROOMS: Room[] = [
  { name: "Pavlova Suites", image: A.rooms[0].image, sleeps: 2, beds: "1 King (1 of 6 has 2 doubles)", size: 30, units: 6, price: 460, included: INCLUDED, excluded: EXCLUDED },
  { name: "1-Bedroom Bungalow", image: A.rooms[1].image, sleeps: 2, beds: "1 King or 2 Singles", size: 50, units: 3, price: 610, included: INCLUDED, excluded: EXCLUDED },
  { name: "2-Bedroom Luxury Bungalow", image: A.rooms[3].image, sleeps: 4, beds: "1 King & 2 Singles", units: 10, price: 953, included: INCLUDED, excluded: EXCLUDED },
  { name: "2-Bedroom Deluxe Bungalow", image: A.rooms[2].image, sleeps: 4, beds: "1 King + 2 Singles, 2 en-suites", size: 74, units: 2, plunge: true, price: 1100, included: INCLUDED, excluded: EXCLUDED },
];
const G = A.gallery;
// Library records (Experience / Feature collections, imported from
// wildearthstays.com), four of each. Picked so no photo repeats on the page.
const WF = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
const EXPERIENCES: RecordCard[] = [
  { name: "Hike + Snorkel Cahuita", meta: "Sea + forest · 25 min walk", image: `${WF}/6835e297ff2e3b864f9ddef7_Beach_0030.jpg`, alt: "Beach at Cahuita National Park near Aguas Claras", body: "Snorkel Cahuita National Park’s coral reef, home to more than 120 tropical fish species, sea turtles and reef sharks. Then hike the rainforest trails, spotting monkeys, sloths and parrots, all a 25-minute walk from the hotel." },
  { name: "Gandoca-Manzanillo Refuge Jungle Hike", meta: "Forest · Guided", image: `${WF}/6835eb930d3f59c03d5b4ae1_Gardens_0041.jpg`, alt: "Rainforest trail in the Gandoca-Manzanillo Wildlife Refuge", body: "A guided hike through the Gandoca-Manzanillo Wildlife Refuge, discovering diverse wildlife and pristine natural landscapes." },
  { name: "Yoga & Meditation", meta: "Wellness · Mornings", image: `${WF}/6835dfce365e1ce479ced40c_Yoga_0008.jpg`, alt: "Morning yoga in the open-air shala at Casa Gandhi", body: "Begin the day with morning yoga in Casa Gandhi, the open-air shala set in the hotel’s tropical gardens." },
  { name: "Theme Nights at DaLime Beach Club", meta: "Evenings · On the beach", image: `${WF}/6835deb8a59b4ec4dfc9708d_Restaurante_0001.jpg`, alt: "Evening at DaLime Beach Club on Playa Chiquita", body: "Special themed evenings with live music, DJ sessions and beach bonfires, under the stars." },
];
const FEATURES: RecordCard[] = [
  { name: "Wildlife", meta: "Nature", image: `${WF}/6801c9727944d64ee9466155_Gardens_0026.jpg`, alt: "Tropical forest around Aguas Claras", body: "On a hike in one of the many nature reserves, see flashes of rainbow fly through the jungle. You may even spot a sloth." },
  { name: "Dining", meta: "Afro-Caribbean", image: `${WF}/6835e2bd443f2415c0e32090_Restaurante_0020.jpg`, alt: "Local, organic dishes at the Aguas Claras restaurant", body: "Colourful, local, organic beach eats and cocktails on the Caribbean coast’s best beaches, with an Afro-Caribbean twist." },
  { name: "Bohemian Art Gardens", meta: "On property", image: `${WF}/6801c9f05e538d128b10a99f_Gardens_0038.avif`, alt: "Victorian fountain in the tropical art gardens at Aguas Claras", body: "Stroll the tropical gardens, with Victorian fountains and original local art that match the bohemian interiors." },
  { name: "Beach Days", meta: "Included", image: `${WF}/6835e39917e50c7293c6983b_DALIMEFOODS_B_-200-41.jpg`, alt: "Beach chairs on Playa Chiquita", body: "Chill by the ocean with complimentary beach chairs, and a bike to get you there." },
];

const nearby = COSTA_RICA.ledger.items.filter((s) => s.slug !== "aguas-claras" && s.image && s.tagline);
const others = COSTA_RICA.ledger.items.filter((s) => s.lat != null && s.slug !== "aguas-claras").map((s) => ({ lat: s.lat as number, lng: s.lng as number }));

export default function AguasClarasPreview() {
  const offer = P.card;
  const photos = [{ url: A.hero.url, alt: A.hero.alt }, ...G];
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        {/* 01 · Hero + glance: name, place, price, best months, size, the two actions */}
        <RecordHero image={{ url: A.hero.url, alt: A.hero.alt }} eyebrow={`Wild & Co Stays · ${A.ledger.location} · ${A.ledger.id}`} title={A.ledger.name} tagline={A.ledger.tagline}
          glance={<GlanceBar glance={{ price: { amount: "US$460", basis: "per room, per night" }, facts: [["Best months", "May to November"], ["The stay", "12 rooms · on the beach"], ["Fly into", "San José (SJO)"]], photos: photos.length }} />} />
        {/* 02 · Sticky record nav */}
        <RecordNav items={[["Photos", "gallery"], ["Why we chose it", "why"], ["Rooms & rates", "rooms"], ["Offer", "offer"], ["Experiences", "experiences"], ["Features", "features"], ["Location", "location"], ["Conservation", "conservation"], ["Host", "host"], ["FAQ", "faq-heading"]]} cta="Check your dates" />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          {/* 03 · In short (the answer block) */}
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Stays", path: "/stays" }, { name: "Costa Rica", path: "/destinations/central-america/costa-rica" }, { name: "Aguas Claras", path: "/stays/aguas-claras" }]} /></div>
          <Overview
            quote={A.ledger.introQuote}
            answer="Aguas Claras is a 12-room art-filled hideaway directly on Playa Chiquita, near Puerto Viejo on Costa Rica's south Caribbean coast. Rooms run from Pavlova suites to two-bedroom bungalows with plunge pools, from US$460 a night with breakfast. Best May to November; fly into San José (SJO)."
            facts={[["Ledger ID", A.ledger.id], ["Type", "Boutique hotel · 12 rooms"], ["Rates", "Fixed · partner rate sheet"], ["Best for", "Honeymoon · family · solo · adventure"]]}
            paragraphs={A.staysContent}
          />
          {/* 04 · Photos */}
          <GalleryMosaic images={photos} title={A.ledger.name} />
          {/* 05 · Why James chose it */}
          <WhyChose
            title="Why Aguas Claras Is in the Ledger"
            status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">Vetted by the house</span> · in the Ledger since August 2026 · no founder visit filed yet, so no founder stamp</p>}
            blocks={A.whyStay}
            image={{ url: G[5].url, alt: G[5].alt }}
          />
          {/* 06 · Core: rooms & rates, with what's included and not */}
          <RoomsLedger title="Four Ways to Stay on Playa Chiquita" intro="Every room category on file, with its published “from” price per room, per night, and what the rate does and doesn't carry." rooms={ROOMS} footnote="Fixed rates from the partner rate sheet (USD, per room, per night, before tax). Your dates are quoted live before anything is booked." />
          <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={hostFor("stay:aguas-claras").state} host={hostFor("stay:aguas-claras").host} stayName={A.ledger.name} /></div>
          {/* 07 · Offer (switch on in the library) */}
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
          {/* 08 · Experiences (max 4) */}
          <Experiences title="Four Ways to Spend a Day Here" intro="Reef in the morning, refuge trails after lunch, the beach club after dark. Four picks from the experiences on file for Aguas Claras." items={EXPERIENCES} icon="wave" />
          {/* 09 · Features (max 4) + only here */}
          <Features title="What Makes the Stay" body={A.features.body} cards={FEATURES} onlyHere={{ title: A.onlyHere.title, paragraphs: A.onlyHere.paragraphs }} icon="coral" />
          {/* 10 · Location & getting there */}
          <LocationBlock chart={CHART_COSTA_RICA} name="Aguas Claras" pin={{ lat: 9.643245, lng: -82.720328 }} others={others} heading="Playa Chiquita, South Caribbean Coast"
            rows={[["Address", A.facts.address], ["Coordinates", A.facts.coordinates], ["Airport", A.facts.airportName], ["Getting there", A.facts.airportDirections]]} note="Faint pins are the other stays in the Ledger in Costa Rica." />
          {/* 11 · Conservation */}
          <Conservation eyebrow="People + planet" title={`${A.peoplePlanet.titleA} ${A.peoplePlanet.titleItalic} ${A.peoplePlanet.titleB}`} intro={A.peoplePlanet.intro} body={A.peoplePlanet.body} />
          {/* 12 · Meet your host (switch) */}
          {/* 13 · FAQ */}
          <FaqBlock faqs={A.faqs.map((f) => ({ q: f.question, a: f.answer }))} title="Questions About Aguas Claras" />
          {/* 14 · More from the brand / James's favourites nearby */}
          <CardRail id="nearby" eyebrow="James's favourites & more in Costa Rica" title="Also in the Ledger in Costa Rica" cards={nearby.map((s) => ({ name: s.name, href: `/stays/${s.slug}`, image: s.image, meta: `${s.kind}${s.area ? ` · ${s.area}` : ""}`, line: s.tagline }))} />

          <PreviewNote>
            <p>The Time Rewarded offer (WAN-2026-014) is switched off in the library; it&rsquo;s shown here so you can review it. The exclusive line and the &ldquo;not included&rdquo; room lines are samples to confirm against the rate sheet.</p>
            <p>Experiences and features are the library&rsquo;s own records (8 experiences and 5 features on file; four of each shown). They are matched to Aguas Claras by name only, because their stay links are empty. No founder favourites are filed in Costa Rica, so the rail shows the other Costa Rica stays.</p>
            <p>The library holds two Pavlova Suites records (US$460 and US$475); the page uses the fuller one. The duplicate needs removing.</p>
          </PreviewNote>
        </div>
      </main>
      <RecordActionBar price="US$460" basis="/ night" cta="Check dates" />
    </>
  );
}
