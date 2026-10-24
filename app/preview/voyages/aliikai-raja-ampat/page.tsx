import Image from "next/image";
import { Anchor, Ship } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import FaqBlock from "@/components/ledger/FaqBlock";
import HostPanel from "@/components/record/HostPanel";
import VoyageMap, { type Stop } from "@/components/record/VoyageMap";
import { CardRail, Features, FounderStamp, GalleryStrip, IncludedLists, Overview, PreviewNote, RecordHero, RecordNav, RoomsLedger, SectionHead, WhyChose, type Room } from "@/components/record/Sections";
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

export default function AliikaiPreview() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <RecordHero image={V.hero} eyebrow={`Wild & Co Voyages · Aliikai · ${V.ledgerId}`} title={V.name} tagline="Ten days aboard a hand-built phinisi through Raja Ampat's reefs and limestone islands" stamp={<FounderStamp kind="Field verified" year={2024} volume="voyages" size={140} />} />
        <RecordNav items={[["The voyage", "overview"], ["Day by day", "days"], ["Route map", "days"], ["Cabins & rates", "cabins"], ["The ship", "ship"], ["Included", "included"], ["Other voyages", "voyages"], ["FAQ", "faq-heading"]]} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <Overview
            quote={V.introQuote}
            answer="Aliikai's 10 Day Raja Ampat North sails from Sorong through the Dampier Strait to Wayag and back, nine nights aboard a 40-metre wooden phinisi with seven cabins and a crew of thirteen. From US$4,830 per person in a shared cabin, all meals, guided diving and snorkelling included. Best October to April. James sailed Raja Ampat aboard Aliikai in November 2024."
            facts={V.meta as [string, string][]}
            paragraphs={V.overview}
          />

          {/* Day by day + route map */}
          <section id="days" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32">
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

          <RoomsLedger id="cabins" eyebrow="Cabins & rates" title="Seven Cabins on Three Decks" intro="Sail by the cabin on a shared voyage, or take the whole yacht. Every cabin, with its deck, beds and registry “from” price." rooms={CABINS} icon="tree-ring" footnote={`Whole-yacht charter: ${S.charter.text} Voyage fare from US$4,830 per person in a shared cabin (2026/27 season). Rates re-verified at enquiry.`} />

          {/* The ship */}
          <section id="ship" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
            <div>
              <div className="flex items-center gap-2"><Ship className="w-4 h-4 ledger-crimson" strokeWidth={1.5} aria-hidden="true" /><p className="ledger-eyebrow">{S.ship.eyebrow}</p></div>
              <h2 className="ledger-display text-[1.75rem] md:text-4xl mt-2">{S.ship.title}</h2>
              <p className="mt-4 ledger-display italic text-lg">{S.ship.intro}</p>
              <p className="mt-4 text-[16px] leading-relaxed ledger-muted">{S.ship.body}</p>
              <dl className="mt-6 border-t ledger-rule">{S.practical.slice(0, 4).map(([k, v]) => <div key={k} className="flex justify-between gap-6 py-2.5 border-b ledger-rule"><dt className="ledger-eyebrow pt-1">{k}</dt><dd className="text-[15px] text-right">{v}</dd></div>)}</dl>
            </div>
            <div className="relative aspect-[4/5] border ledger-border"><Image src={S.hero.url} alt={S.hero.alt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" /></div>
          </section>

          <WhyChose eyebrow={S.whyStayHere.eyebrow} title={S.whyStayHere.title} blocks={[...S.whyStayHere.paragraphs.map((b) => ({ body: b })), ...S.onlyHere.map((b) => ({ body: b }))]}
            status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">Field verified · 2024</span> · James sailed Raja Ampat aboard Aliikai with his son in November 2024</p>} />
          <Features eyebrow="Life on board" title="What the Voyage Programs" items={[...S.adventures.bullets, ...S.features.bullets]} icon="wave" />

          <section id="included" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHead eyebrow="The fare" title="What the Voyage Includes" />
              <p className="text-right"><span className="ledger-eyebrow block">From</span><span className="ledger-display text-4xl ledger-crimson">US$4,830</span><span className="block text-[13px] ledger-muted">{V.rate.basis} · {V.rate.season}</span></p>
            </div>
            <div className="mt-6"><IncludedLists included={V.rate.includes} excluded={["International and domestic flights to Sorong", "Crew gratuities", "Alcoholic drinks beyond the welcome", "Travel and dive insurance"]} /></div>
            <p className="mt-5 text-[13px] ledger-muted max-w-3xl">{V.rate.note}</p>
          </section>

          <div className="mt-16 md:mt-24 border-t ledger-rule pt-10"><HostPanel state="not_linking" stayName="Aliikai" /></div>

          <CardRail id="voyages" eyebrow="More aboard Aliikai" title="Other Voyages on This Ship" cards={[
            { name: "8 Day Raja Ampat and Misool", href: "/voyages/aliikai/8-day-raja-ampat-and-misool", image: `${CDN}/688bbf8a7042a78a88b3ef8f_688a5bbc507a2e6ee6261154_Misool-Raja-Ampat.jpeg`, meta: "8 days · from Sorong", line: "From US$4,430 per person" },
            { name: "7 Day Komodo Island Cruise", href: "/voyages/aliikai/7-day-komodo-island-cruise", image: `${CDN}/68b3519787f35d2c5ca2e318_MER.snorkeling.1.jones.shimlock.webp`, meta: "7 days · from Labuan Bajo" },
            { name: "5 Day Komodo Island", href: "/voyages/aliikai/5-day-komodo-island", image: `${CDN}/688bbf9afeaf925f3e461130_685713a1a135f9b5004dfc47_Aliikai-LabuanBajo-harbor.webp`, meta: "5 days · from Labuan Bajo", line: "From US$3,795 per person" },
          ]} />
          <GalleryStrip images={S.gallery.slice(0, 9)} />
          <FaqBlock faqs={V.faqs} title="Questions About This Voyage" />
          <PreviewNote>
            <p>The founder stamp reflects James&rsquo;s November 2024 voyage; the library&rsquo;s voyage status is still &ldquo;unclassified&rdquo; and needs setting so the stamp is drawn from the Ledger.</p>
            <p>No day has coordinates on file, so the map uses approximate positions. All four voyages share the Raja Ampat hero image, including the Komodo ones, and the 7 Day Komodo &ldquo;from&rdquo; price (US$12,000) looks like a charter rate; both need checking. &ldquo;Not included&rdquo; lines are sample lines to confirm.</p>
          </PreviewNote>
        </div>
      </main>
    </>
  );
}
