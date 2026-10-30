import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { FILMS } from "@/lib/content/films";
import Image from "next/image";
import Link from "next/link";
import { Anchor, CalendarRange, Ship, Users } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import FaqBlock from "@/components/ledger/FaqBlock";
import HostPanel, { KIND as HOST_KIND } from "@/components/record/HostPanel";
import CallingCard from "@/components/record/CallingCard";
import { hostFor } from "@/lib/content/hosts";
import VoyageMap, { type Stop } from "@/components/record/VoyageMap";
import { CardRail, Experiences, Features, FounderStamp, IncludedLists, Overview, PreviewNote, RecordHero, RecordNav, RoomsLedger, SectionHead, WhyChose, type RecordCard, type Room } from "@/components/record/Sections";
import { GalleryMosaic, GlanceBar, RecordActionBar } from "@/components/record/Frame";
import { SAMPLE_ALIIKAI as S } from "@/lib/content/preview/aliikai";
import { SAMPLE_VOYAGE_ITINERARY as V } from "@/lib/content/preview/voyage-raja-ampat";
import { buildMetadata } from "@/lib/seo";

// Preview of the VOYAGE template (ship + voyage on one page) on Aliikai's
// 10 Day Raja Ampat North (VesselVoyage ITN-VSL-2026-000012, ship
// STY-2026-882896). Cabins and rates are the library's Room records; the day
// log is the ItineraryItem records. Map positions are approximate because no
// day has coordinates on file yet.

export const metadata = buildMetadata({ title: "Aliikai: 10 Day Raja Ampat North Voyage (preview)", description: "Preview of the James Wild & Co voyage template.", path: "/preview/voyages/aliikai-raja-ampat", noindex: true });

const CABINS: Room[] = S.cabins.map((c) => ({ name: c.name, image: c.image, sleeps: c.sleeps, beds: c.bed, price: c.fromRate, basis: `per cabin, per night · ${c.deck}` }));
const STOPS: Stop[] = [
  { day: 1, name: "Sorong", lat: -0.88, lng: 131.25 },
  { day: 2, name: "Kri", lat: -0.556, lng: 130.687 },
  { day: 3, name: "The Passage", lat: -0.42, lng: 130.62 },
  { day: 4, name: "Penemu", lat: -0.565, lng: 130.28 },
  { day: 5, name: "Wayag", lat: -0.165, lng: 130.05 },
  { day: 6, name: "Wofoh", lat: -0.27, lng: 130.2 },
  { day: 7, name: "Arborek", lat: -0.567, lng: 130.52 },
  { day: 8, name: "Mansuar", lat: -0.6, lng: 130.6 },
  { day: 9, name: "Batanta", lat: -0.83, lng: 130.78 },
  { day: 10, name: "Sorong", lat: -0.88, lng: 131.25 },
];
const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
// Experience + Feature records (library, imported from wildearthstays.com).
const EXPERIENCES: RecordCard[] = [
  { name: "Diving", meta: "Guided · Nitrox", image: `${CDN}/684792b32ba1312195bf8bbe_Aliikai-Diving.webp`, alt: "Diving a Raja Ampat reef from Aliikai", body: "Expert-guided small-group dives with full gear and Nitrox, from Raja Ampat's reefs to manta stations, tailored to your level." },
  { name: "Snorkelling", meta: "All ages", image: `${CDN}/684792f157be66f5080ba354_Aliikai-Snorkeling.webp`, alt: "Snorkelling over coral from Aliikai", body: "Glide above coral reefs, swim with manta rays, or meet the gentle whale shark in warm, clear water." },
  { name: "Kayak + Stand-Up Paddle", meta: "Lagoons & mangroves", image: `${CDN}/6847928005301fb963e4a458_Aliikai-Paddleboard.webp`, alt: "Stand-up paddle boarding in a Raja Ampat lagoon", body: "Hidden lagoons, mangrove forests and clear bays, at your own pace, for all ages." },
  { name: "Trekking", meta: "Islands & jungle", image: `${CDN}/68479362f1b8c50f5e581446_Aliikai-Trekking.webp`, alt: "Trekking to a viewpoint over Raja Ampat", body: "Hike to summits for the sunset view, or into Papua's forest in search of the Bird-of-Paradise." },
];
const FEATURES: RecordCard[] = [
  { name: "Diverse Marine Life", meta: "Snorkel or dive", image: `${CDN}/6847944508e422dca6ac9dfe_Aliikai-Wildlife%20(1).webp`, alt: "Reef life in Raja Ampat", body: "Manta rays, whale sharks, coral and rare reef species in the planet's most biodiverse waters." },
  { name: "Whale Sharks", meta: "Gentle giants", image: `${CDN}/68479484dad1c52ab7aa5301_Raja_Ampat-Diving-with-whale-sharks.webp`, alt: "Swimming with a whale shark", body: "Dive or snorkel with whale sharks in remote waters, safely and respectfully." },
  { name: "Remote Islands", meta: "Raja Ampat to Komodo", image: `${CDN}/6847945c5f59e88767340450_Aliikai-RemoteIslands.webp`, alt: "Limestone islands of Raja Ampat", body: "Hidden beaches, vibrant reefs and remote jungles, each island its own chapter." },
  { name: "An Informal Schedule", meta: "Freedom to explore", image: `${CDN}/68479470c30afaeff22d4c37_Aliikai-InformalSchedule.webp`, alt: "Sunset on Aliikai's deck", body: "A flexible day shaped around discovery and rest, from sunrise dives to sunset beach walks." },
];


export default function AliikaiPreview() {
  return (
    <div className="theme-sea theme-sea-page">
      <SiteHeader overlay />
      <main id="main">
        <RecordHero film={FILMS.aliikai} image={V.hero} eyebrow={`Wild & Co Voyages · Aliikai · ${V.ledgerId}`} title={V.name} tagline="Ten days aboard a hand-built phinisi through Raja Ampat's reefs and limestone islands" stamp={<FounderStamp kind="Field verified" year={2024} volume="voyages" size={140} />}
          glance={<GlanceBar glance={{ price: { amount: "US$7,650", basis: "per person, 2027 · + 11% tax" }, facts: [["Voyage", "10 days"], ["2027", "Feb · Nov · Dec"], ["Embark", "Sorong"]], photos: S.gallery.length + 1, cta: { label: "See departures", href: "#departures" } }} />} />
        <RecordNav items={[["Photos", "gallery"], ["Why we chose it", "why"], ["Day by day", "days"], ["Departures", "departures"], ["Cabins", "cabins"], ["The fare", "included"], ["Experiences", "experiences"], ["Features", "features"], ["The ship", "ship"], ["FAQ", "faq-heading"]]} cta="Enquire" />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Voyages", path: "/voyages" }, { name: "Raja Ampat", path: "/voyages/raja-ampat" }, { name: "Aliikai · 10 Day Raja Ampat North", path: "/voyages/raja-ampat/aliikai-10-day-raja-ampat-north" }]} /></div>
          <Overview
            quote={V.introQuote}
            answer="Aliikai's 10 Day Raja Ampat North sails from Sorong through the Dampier Strait to Wayag and back, nine nights aboard a 40-metre wooden phinisi with seven cabins and a crew of thirteen. From US$7,650 per person (2027, ocean-view cabin, double occupancy, plus 11% tax), all meals, guided diving and snorkelling included. Best October to April. James sailed Raja Ampat aboard Aliikai in November 2024."
            facts={(V.meta as [string, string][]).filter(([k]) => !["Duration", "Embarkation", "Disembarkation"].includes(k))}
            paragraphs={V.overview}
          />

          <GalleryMosaic images={[S.hero, ...S.gallery]} title={V.name} />
          <WhyChose eyebrow={S.whyStayHere.eyebrow} title={S.whyStayHere.title} blocks={[...S.whyStayHere.paragraphs.map((b) => ({ body: b })), ...S.onlyHere.map((b) => ({ body: b }))]}
            status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">Field verified · 2024</span> · James sailed Raja Ampat aboard Aliikai with his son in November 2024</p>} />
          {/* Core · day by day + route map */}
          <section id="days" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px]">
            <SectionHead eyebrow="Day by day · 10 days, 9 nights" title="The Route, Day by Day" icon="wave" intro="Each day as the crew sails it. Weather and wildlife shape the order; the route map keeps your place." />
            <div className="mt-8 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
              <ol className="relative border-l-2 border-crimson/30 ml-4">
                {V.days.map((d) => (
                  <li key={d.day} className="relative pl-8 pb-10 last:pb-0">
                    <span className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-crimson text-paper flex items-center justify-center font-mono text-[13px]">{d.day}</span>
                    <p className="ledger-eyebrow ledger-crimson">Day {d.day} · {d.port}</p>
                    <h3 className="ledger-display text-2xl mt-1">{d.label}</h3>
                    {"image" in d && d.image && (
                      <div className="relative aspect-[16/9] mt-3 border ledger-border"><Image src={d.image} alt={d.imageAlt || d.label} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" /></div>
                    )}
                    <p className="mt-3 text-[15.5px] leading-relaxed ledger-muted">{d.summary}</p>
                  </li>
                ))}
              </ol>
              <div className="lg:sticky lg:top-[170px]">
                <VoyageMap stops={STOPS} title="Route map of the 10 Day Raja Ampat North voyage" />
                <div className="mt-4 ledger-paper border ledger-border p-5">
                  <p className="ledger-eyebrow ledger-crimson flex items-center gap-2"><Anchor className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" /> Embark &amp; disembark</p>
                  <p className="mt-1 text-[15px]">Sorong, West Papua · met at the airport and transferred to the harbour, about 20 minutes</p>
                </div>
              </div>
            </div>
          </section>

          {/* Core · departures: per person on fixed dates, or the whole yacht */}
          <section id="departures" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px]">
            <SectionHead eyebrow="Departures · 2027 & 2028" title="Two Ways Aboard" intro="Join a fixed departure and pay per person, per voyage, or charter the whole yacht for your own group and dates." icon="wave" />
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <article className="ledger-paper border ledger-border p-6 md:p-7">
                <p className="ledger-eyebrow ledger-crimson flex items-center gap-2"><CalendarRange className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Shared voyage · by the cabin</p>
                <p className="mt-3"><span className="ledger-display text-4xl ledger-crimson">US$7,650</span> <span className="text-[13px] ledger-muted">from, per person, 2027, + 11% tax</span></p>
                <table className="mt-5 w-full text-[14.5px]">
                  <thead><tr className="border-b ledger-rule text-left"><th className="ledger-eyebrow py-2 font-normal">Departs</th><th className="ledger-eyebrow py-2 font-normal">Returns</th><th className="ledger-eyebrow py-2 font-normal text-right">Per person</th><th className="ledger-eyebrow py-2 font-normal text-right">Cabins</th></tr></thead>
                  <tbody><tr className="border-b ledger-rule"><td colSpan={4} className="py-4 ledger-muted italic">The 2027 and 2028 dates are filed from the Aliikai rate sheet. Each row shows the dates, the per-person fare and whether cabins remain.</td></tr></tbody>
                </table>
                <Link href="/plan" className="mt-6 ledger-btn ledger-btn--solid">Hold a cabin</Link>
              </article>
              <article className="border ledger-border p-6 md:p-7">
                <p className="ledger-eyebrow flex items-center gap-2"><Users className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" /> Whole-yacht charter · your dates</p>
                <p className="mt-3 ledger-display text-2xl">The whole yacht, for your group</p>
                <p className="mt-3 text-[15px] leading-relaxed ledger-muted">{S.charter.text}</p>
                <p className="mt-3 text-[13px] ledger-muted">Charter is a switch on each voyage: on, this card shows; off, the voyage sells by the cabin only.</p>
                <Link href="/voyages/charter" className="mt-6 ledger-btn">Ask about a charter</Link>
              </article>
            </div>
          </section>
          <RoomsLedger id="cabins" unit="cabin" eyebrow="Cabins & rates" title="Seven Cabins on Three Decks" intro="Every cabin, with its deck, beds and registry “from” price. The voyage fare above is per person; cabin rates apply to private sailings." rooms={CABINS} icon="tree-ring" footnote={`Whole-yacht charter: ${S.charter.text} Voyage fare from US$7,650 per person, double occupancy, plus 11% tax (2027 published rate). Rates re-verified at enquiry.`} />

          <section id="included" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px]">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHead eyebrow="The fare" title="What the Voyage Includes" />
              <p className="text-right"><span className="ledger-eyebrow block">From</span><span className="ledger-display text-4xl ledger-crimson">US$7,650</span><span className="block text-[13px] ledger-muted">per person, double occupancy · 2027 · + 11% tax</span></p>
            </div>
            <div className="mt-6"><IncludedLists included={V.rate.includes} excluded={["International and domestic flights to Sorong", "Crew gratuities", "Alcoholic drinks beyond the welcome", "Travel and dive insurance"]} /></div>
            <p className="mt-5 text-[13px] ledger-muted max-w-3xl">{V.rate.note}</p>
          </section>

          <Experiences eyebrow="Off the boat" title="Four Ways to Spend a Day Aboard" intro="The crew plans each day around the water: reef in the morning, an island in the afternoon." items={EXPERIENCES} icon="wave" />
          <Features eyebrow="Voyage features" title="What Makes the Voyage" cards={FEATURES} onlyHere={{ title: "Only aboard Aliikai", paragraphs: S.onlyHere.slice(0, 2) }} icon="coral" />
          {/* The ship */}
          <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state={hostFor("voyage:aliikai").state} host={hostFor("voyage:aliikai").host} stayName="Aliikai" kind="vessel" /></div>
          <section id="ship" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px] grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
            <div>
              <div className="flex items-center gap-2"><Ship className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /><p className="ledger-eyebrow">{S.ship.eyebrow}</p></div>
              <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2">{S.ship.title}</h2>
              <p className="mt-4 ledger-display italic text-lg">{S.ship.intro}</p>
              <p className="mt-4 text-[16px] leading-relaxed ledger-muted">{S.ship.body}</p>
              <dl className="mt-6 border-t ledger-rule">{S.practical.slice(0, 4).map(([k, v]) => <div key={k} className="flex justify-between gap-6 py-2.5 border-b ledger-rule"><dt className="ledger-eyebrow pt-1">{k}</dt><dd className="text-[15px] text-right">{v}</dd></div>)}</dl>
            </div>
            <div className="relative aspect-[4/5] border ledger-border"><Image src={S.hero.url} alt={S.hero.alt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" /></div>
          </section>


          <FaqBlock faqs={V.faqs} title="Questions About This Voyage" />
          <CardRail id="voyages" eyebrow="More aboard Aliikai" title="Other Voyages on This Ship" cards={[
            { name: "8 Day Raja Ampat and Misool", href: "/voyages/raja-ampat/aliikai-8-day-raja-ampat-and-misool", image: `${CDN}/688bbf8a7042a78a88b3ef8f_688a5bbc507a2e6ee6261154_Misool-Raja-Ampat.jpeg`, meta: "8 days · from Sorong", line: "From US$4,430 per person" },
            { name: "7 Day Komodo Island Cruise", href: "/voyages/komodo/aliikai-7-day-komodo-island-cruise", image: `${CDN}/68b3519787f35d2c5ca2e318_MER.snorkeling.1.jones.shimlock.webp`, meta: "7 days · from Labuan Bajo" },
            { name: "5 Day Komodo Island", href: "/voyages/komodo/aliikai-5-day-komodo-island", image: `${CDN}/688bbf9afeaf925f3e461130_685713a1a135f9b5004dfc47_Aliikai-LabuanBajo-harbor.webp`, meta: "5 days · from Labuan Bajo", line: "From US$3,795 per person" },
          ]} />
          <PreviewNote>
            <p>The founder stamp reflects James&rsquo;s November 2024 voyage; the library&rsquo;s voyage status is still &ldquo;unclassified&rdquo; and needs setting so the stamp is drawn from the Ledger.</p>
            <p>No day has coordinates on file, so the map uses approximate positions. All four voyages share the Raja Ampat hero image, including the Komodo ones, and the 7 Day Komodo &ldquo;from&rdquo; price (US$12,000) looks like a charter rate; both need checking. &ldquo;Not included&rdquo; lines are sample lines to confirm. The 2027/2028 departures are empty on file and need the Aliikai rate sheet.</p>
          </PreviewNote>
        </div>
        {hostFor("voyage:aliikai").state === "available" && <CallingCard who={HOST_KIND.vessel.who} />}
      </main>
      <RecordActionBar price="US$7,650" basis="pp · 2027" cta="Departures" />
    </div>
  );
}
