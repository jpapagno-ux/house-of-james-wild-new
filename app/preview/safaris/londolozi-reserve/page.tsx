import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Users } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import { Reveal } from "@/components/ledger/Motion";
import { FieldIcon } from "@/components/ledger/FieldIcon";
import { CardRail, Conservation, Experiences, Features, IncludedLists, Overview, PreviewNote, RecordHero, RecordNav, SectionHead, WhyChose, type RecordCard } from "@/components/record/Sections";
import { GalleryMosaic, GlanceBar, LocationBlock, RecordActionBar } from "@/components/record/Frame";
import { CHART_SOUTH_AFRICA } from "@/lib/charts/south-africa";
import { zaOthers } from "@/lib/content/preview/za-ledger";
import { ZA_FAVOURITES } from "@/lib/content/preview/za-favourites";
import { SAMPLE_LONDOLOZI as L } from "@/lib/content/preview/londolozi";
import { buildMetadata } from "@/lib/seo";

// Preview of the AFRICAN RESERVE template with its child camps, on Londolozi
// (AfricanReserve RSV-2026-000007 / reserve-parent Stay STY-2026-115702,
// Sabi Sand). Each camp is a child stay with its own room types and "from"
// prices (Room records, USD per person per night). Each camp gets its own
// page at /safaris/londolozi-reserve/[camp] once filed as a child Stay.

export const metadata = buildMetadata({ title: "Londolozi Reserve, Sabi Sand: The Camps (preview)", description: "Preview of the James Wild & Co African reserve template.", path: "/preview/safaris/londolozi-reserve", noindex: true });

const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
type R = { name: string; sleeps: number; units: number; beds: string; price: number; image: string };
const CAMPS: { slug: string; name: string; summary: string; units: string; image: string; rooms: R[] }[] = [
  { slug: "varty-camp", name: "Varty Camp", summary: L.camps[1].summary, units: L.camps[1].units, image: `${CDN}/683f57ebc8ac68f06acb51dc_Londolozi-Varty-Camp-Exterior%20(1).jpg`, rooms: [
    { name: "Camp Chalet", sleeps: 2, units: 8, beds: "King", price: 1386, image: `${CDN}/6840f39d2a50f01d82e07c7d_Londolozi-Varty-Camp-Standard-Chalet-Pool.jpg` },
    { name: "Camp Superior Chalet", sleeps: 2, units: 2, beds: "King", price: 1691, image: `${CDN}/6840f3cbff2858237f576654_Londolozi-Varty-Camp-Superior-Chalet-Room2.jpg` },
  ] },
  { slug: "founders-camp", name: "Founders Camp", summary: L.camps[0].summary, units: L.camps[0].units, image: `${CDN}/683f465a9e39c1540516b179_Londolozi-Founders-Camp-Main-Area-Long-Shot-2-Elsa-Young-Low-Res-copy.jpg`, rooms: [
    { name: "Family Chalet", sleeps: 4, units: 3, beds: "King + children", price: 1692, image: `${CDN}/683f45aa513e5ea52e445948_Londolozi-Founders-Camp-Family-Suite-9-Elsa-Young-Low-Res-copy.jpg` },
    { name: "Superior Chalet", sleeps: 2, units: 6, beds: "King", price: 1942, image: `${CDN}/683f450b8db3706e081d48c2_Londolozi-Founders-Camp-Superior-Chalet-2-Elsa-Young-Low-Res-copy.jpg` },
    { name: "Superior Family Chalet", sleeps: 4, units: 1, beds: "King + children", price: 1942, image: `${CDN}/683f45ab98d1ce1a79239713_Londolozi-Founders-Camp-Family-Suite-20-Elsa-Young-Low-Res-copy.jpg` },
  ] },
  { slug: "tree-camp", name: "Tree Camp", summary: L.camps[2].summary, units: L.camps[2].units, image: `${CDN}/683f42ee134ebd745b276031_londo_treecamp9%20(1).jpg`, rooms: [
    { name: "Tree Camp Suite", sleeps: 2, units: 6, beds: "King", price: 2385, image: `${CDN}/683f5309ed9923cc8f215f91_Londolozi-Tree-Camp-room%20(1).jpg` },
  ] },
  { slug: "pioneer-camp", name: "Pioneer Camp", summary: L.camps[3].summary, units: L.camps[3].units, image: `${CDN}/683f4f2c9d49e0448d675f50_Londolozi-Pioneer-Camp-extension.jpg`, rooms: [
    { name: "Pioneer Camp Suite", sleeps: 2, units: 3, beds: "King", price: 2385, image: `${CDN}/683f4f2d4a692fe5bc57212f_Londolozi-Pioneer-Camp-room2.jpg` },
  ] },
  { slug: "private-granite-suites", name: "Private Granite Suites", summary: L.camps[4].summary, units: L.camps[4].units, image: `${CDN}/6840f2f57842218cbc43ebad_Londolozi-Private-Granite-Suite-PoolDeck.jpg`, rooms: [
    { name: "Private Granite Suite", sleeps: 2, units: 3, beds: "King", price: 3000, image: `${CDN}/6840f2592d09da9f31ff0b69_Londolozi-Private-Granite-Suite-Mainroom%20(1).webp` },
  ] },
];

// Experience + Feature records (library, imported from wildearthstays.com).
// Two Feature records are unfinished ("Need Text") and are left out.
const EXPERIENCES: RecordCard[] = [
  { name: "Game Drives", meta: "Dawn & after dark", image: `${CDN}/6840fe7f8412447d2b246a3c_Londolozi-Safari2.webp`, alt: "Leopard sighting on a Londolozi game drive", body: "Expert guides reveal the reserve's wildlife, early morning or after dark, with close, unhurried encounters with lions, leopards, elephants and more." },
  { name: "Photographic Lab", meta: "Studio · On camp", image: `${CDN}/6840fd2a3473bb1dbe01f706_Londolozi-Photo-Studio.webp`, alt: "The Londolozi photographic studio", body: "Print your favourite photographs on canvas, or rent cameras and get expert advice for the perfect shot." },
  { name: "Healing House", meta: "Wellness", image: `${CDN}/6840fbf74c78174aee61ca70_Londolozi-Healing-House.webp`, alt: "The Healing House at Londolozi", body: "Deep rest, nourishing food, forest walks, spa treatments and yoga on your private deck." },
  { name: "Village Experience", meta: "Community", image: `${CDN}/6840ff2006093bb70a48a198_Londolozi-Village-Experience.webp`, alt: "Community projects in the Londolozi village", body: "Meet the people who call this wilderness home and see how conservation and culture thrive together." },
];
const FEATURES: RecordCard[] = [
  { name: "Cuisine", meta: "Boma to bush", image: `${CDN}/684100764c78174aee63a887_Londolozi-Cuisine%20(1).webp`, alt: "Dining on deck at Londolozi", body: "From boma feasts to safari stops: on deck, communal and in open bush settings." },
  { name: "Interconnecting Suites", meta: "Families", image: `${CDN}/68410091da9d44fe53210425_Londolozi-Founders-Camp-Family-Suite-7-Elsa-Young-Low-Res-copy.webp`, alt: "Family suite at Founders Camp, Londolozi", body: "Family-friendly suites that connect, at Founders Camp." },
  { name: "Luxury Family Safari", meta: "Children welcome", image: `${CDN}/68410113c92ddbc6ab50f61d_Londolozi-Kid-Safari%20(1).webp`, alt: "Children on safari at Londolozi" },
];

export default function LondoloziPreview() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <RecordHero image={L.hero} eyebrow={`Wild & Co Safaris · Sabi Sand Game Reserve · ${L.ledgerId}`} title={L.name} tagline="Four camps, private suites and family villas on one reserve"
          glance={<GlanceBar glance={{ price: { amount: "US$1,386", basis: "per person, per night · Varty Camp" }, facts: [["Best months", "May to October"], ["The reserve", "5 camps + private villas"], ["Fly into", "Kruger Mpumalanga (MQP)"]], photos: L.gallery.length, cta: { label: "Choose a camp", href: "#camps" } }} />} />
        <RecordNav items={[["Photos", "gallery"], ["Why we chose it", "why"], ["The camps", "camps"], ["Reserve rates", "rates"], ["On safari", "experiences"], ["Features", "features"], ["Location", "location"], ["Conservation", "conservation"], ["James's favourites", "favourites"]]} cta="Enquire" />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Safaris", path: "/safaris" }, { name: "South Africa", path: "/destinations/africa/south-africa" }, { name: "Londolozi Reserve", path: "/safaris/londolozi-reserve" }]} /></div>
          <Overview
            quote={L.introQuote}
            answer="Londolozi is a private reserve in South Africa's Sabi Sand, famous for leopard, with five camps under one name: Varty, Founders, Tree, Pioneer and the Private Granite Suites, plus exclusive-use family villas. Rates run from US$1,386 per person per night at Varty Camp. Best May to October."
            facts={[["Reserve ledger", L.ledgerId], ["Location", "Sabi Sand · South Africa"], ["Camps", "5 camps + private villas"], ]}
            paragraphs={L.overview}
          />

          <GalleryMosaic images={L.gallery} title={L.name} />
          <WhyChose eyebrow={L.whyStay.eyebrow} title={L.whyStay.title} blocks={L.whyStay.paragraphs.map((b) => ({ body: b }))} image={{ url: L.whyStay.image, alt: L.whyStay.imageAlt }}
            status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">Vetted by the house</span> · no founder visit filed, so no founder stamp</p>} />
          {/* Core · the camps: each a child stay with its own rooms */}
          <section id="camps" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[212px]">
            <SectionHead eyebrow="The camps · each with its own page" title="Five Camps, One Reserve" intro="Choose the camp first, then the room. Each camp has its own character, rooms, rates and host, and its own page in the Ledger." icon="tree-ring" />
            <nav aria-label="Camps" className="mt-6 flex flex-wrap gap-2">
              {CAMPS.map((c) => <a key={c.slug} href={`#${c.slug}`} className="border ledger-border px-3 py-1.5 text-[14px] hover:border-crimson">{c.name}</a>)}
              <a href="#villas" className="border ledger-border px-3 py-1.5 text-[14px] hover:border-crimson">Private villas</a>
            </nav>
            <div className="mt-10 space-y-14">
              {CAMPS.map((c, i) => (
                <Reveal key={c.slug}>
                  <article id={c.slug} className="scroll-mt-32 lg:scroll-mt-[212px] grid lg:grid-cols-[1fr_1.3fr] gap-8 items-start">
                    <div className={i % 2 ? "lg:order-2" : ""}>
                      <div className="relative aspect-[4/3] border ledger-border"><Image src={c.image} alt={`${c.name}, Londolozi`} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" /></div>
                    </div>
                    <div>
                      <p className="ledger-eyebrow ledger-crimson">Camp {String(i + 1).padStart(2, "0")} · {c.units}</p>
                      <h3 className="ledger-display text-3xl mt-1">{c.name}</h3>
                      <p className="mt-3 text-[16px] leading-relaxed ledger-muted">{c.summary}</p>
                      <ul className="mt-5 border-t ledger-rule">
                        {c.rooms.map((r) => (
                          <li key={r.name} className="py-3 border-b ledger-rule grid grid-cols-[64px_1fr_auto] gap-4 items-center">
                            <div className="relative w-16 h-12 border ledger-border"><Image src={r.image} alt={`${r.name}, ${c.name}`} fill sizes="64px" className="object-cover" /></div>
                            <div>
                              <p className="ledger-display text-lg leading-tight">{r.name}</p>
                              <p className="text-[13px] ledger-muted flex flex-wrap gap-x-4"><span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Sleeps {r.sleeps}</span><span className="inline-flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> {r.beds}</span><span>{r.units} {r.units === 1 ? "unit" : "units"}</span></p>
                            </div>
                            <p className="text-right"><span className="ledger-display text-xl ledger-crimson">US${r.price.toLocaleString("en-US")}</span><span className="block text-[11px] ledger-muted">pp / night</span></p>
                          </li>
                        ))}
                      </ul>
                      <Link href={`/safaris/londolozi-reserve/${c.slug}`} className="mt-5 inline-flex items-center gap-2 text-[15px] hover:gap-3 transition-all">Open the {c.name} page <ArrowRight className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /></Link>
                    </div>
                  </article>
                </Reveal>
              ))}
              <article id="villas" className="scroll-mt-32 lg:scroll-mt-[212px] ledger-paper border ledger-border p-6 md:p-8 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <FieldIcon name="tree-ring" height={30} className="ledger-crimson mt-1" />
                  <div>
                    <p className="ledger-eyebrow ledger-crimson">Exclusive use · Gatherings</p>
                    <h3 className="ledger-display text-2xl mt-1">{L.camps[5].name}</h3>
                    <p className="mt-2 text-[15px] ledger-muted max-w-2xl">{L.camps[5].summary}</p>
                  </div>
                </div>
                <Link href="/plan" className="ledger-btn">Ask for the villa rate</Link>
              </article>
            </div>
          </section>

          {/* Core · what every camp rate carries */}
          <section id="rates" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[212px]">
            <SectionHead eyebrow="Reserve rates · per person, per night" title="What a Londolozi Rate Includes" intro="Every camp is priced per person, per night, fully inclusive of the safari. The lines below apply to all five camps; each camp page adds its own." />
            <div className="mt-6"><IncludedLists included={["All meals and local drinks", "Two game drives a day with a ranger and Shangaan tracker", "Guided bush walks", "Laundry and Wi-Fi", "Road transfers from the Londolozi airstrip"]} excluded={["Flights to the Londolozi airstrip or MQP", "Sabi Sand conservation levy (paid on arrival)", "Premium wines and spirits", "Healing House treatments", "Gratuities"]} /></div>
            <p className="mt-5 text-[13px] ledger-muted max-w-3xl">Sample lines to confirm against the Londolozi rate sheet. Live registry rates, re-verified at enquiry, never &ldquo;on request&rdquo;.</p>
          </section>
          <Experiences eyebrow="On safari" title="Four Ways to Spend a Day Here" intro="The drives come first, always. The rest of the day is yours." items={EXPERIENCES} icon="mountain-sun" />
          <Features eyebrow="Reserve features" title="What Makes the Reserve" cards={FEATURES} onlyHere={{ title: L.onlyHere.title, paragraphs: L.onlyHere.paragraphs.slice(0, 2) }} icon="frond" />
          <LocationBlock chart={CHART_SOUTH_AFRICA} name="Londolozi" pin={{ lat: -24.801461, lng: 31.498252 }} others={zaOthers("Londolozi Reserve")} heading="Sabi Sand, beside the Kruger"
            rows={[["Reserve", "Sabi Sand Game Reserve, Mpumalanga, South Africa"], ["Coordinates", "-24.801461, 31.498252"], ["Airports", "Kruger Mpumalanga (MQP) for the western sector, Skukuza for the south, Hoedspruit Eastgate for the north"], ["Getting there", "Fly to MQP or Skukuza and transfer by road, or take a light aircraft to the Londolozi airstrip."], ["When to go", "May to October, the dry season: sparse bush and animals at the waterholes, so leopard sightings come more often."]]} note="Faint pins are the other stays in the Ledger in South Africa." />
          <Conservation eyebrow={L.sustainability.eyebrow} title={L.sustainability.titleA} subtitle={L.sustainability.titleB} intro={L.sustainability.intro} body={L.sustainability.body} image={{ url: L.adventures.image, alt: L.adventures.imageAlt }} />
          <CardRail id="favourites" eyebrow="James's favourites in South Africa" title="Where James Would Go Back" cards={ZA_FAVOURITES} />
          <PreviewNote>
            <p>The five camps live in the library today as room records under the reserve; filing each as its own child stay (approved) gives every camp its own page, host and offers. The Private Granite Suites and Private Villas have duplicate placeholder room records to tidy.</p>
            <p>The reserve&rsquo;s own hero image field is corrupted in the library, so the hero uses the first gallery image. No host is filed for Londolozi, so the host panel is switched off; no FAQs are on file, so the practical ledger closes the page. &ldquo;Included / not included&rdquo; lines are samples to confirm.</p>
            <p>Two Londolozi Feature records are unfinished (&ldquo;Need Text&rdquo;), so three features show.</p>
          </PreviewNote>
        </div>
      </main>
      <RecordActionBar price="US$1,386" basis="pp / night" />
    </>
  );
}
