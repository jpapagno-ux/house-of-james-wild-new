import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import JsonLd from "@/components/ledger/JsonLd";
import FaqBlock from "@/components/ledger/FaqBlock";
import { GlanceBar } from "@/components/record/Frame";
import { Overview, PreviewNote, RecordHero, RecordNav, SectionHead } from "@/components/record/Sections";
import { InkStamp, TimeMark, VolumeIconSvg } from "@/components/ledger/VolumeKit";
import { VOLUME_STYLES, type VolumeKey } from "@/lib/volumes";
import { buildMetadata } from "@/lib/seo";

// Sample journey page: a pairing of a Europe stay (Volume V) with a river
// voyage (Volume IV), the layout every river pairing will use. One booking
// covers the stays, the river and the transfers; each chapter carries its
// volume's colour and the Ledger ID of the record behind it.

export const metadata = buildMetadata({ title: "Alentejo and the Douro by River: a 12-Night Portugal Journey (preview)", description: "Two nights in Lisbon, three at Dá Licença in the Alentejo, then seven nights up the Douro by small river ship from Porto.", path: "/preview/journeys/alentejo-douro", noindex: true });

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/stays/europe/da-licenca";
const SITE = "https://www.jameswildco.com";

type Chapter = { nights: string; days: string; volume: VolumeKey; title: string; where: string; ledger: string; body: string; note?: string; image?: string; alt?: string; href?: string; transfer?: string };
const CHAPTERS: Chapter[] = [
  { nights: "2 nights", days: "Days 1–2", volume: "europe", title: "Lisbon, the old city", where: "Lisbon", ledger: "[LISBON STAY TO CHOOSE]", body: "Land, sleep off the flight and walk Alfama and the river front before the quiet begins. A small house in the city, never a tower.", note: "Arrive a day early if you can. Lisbon is better on the second morning.", transfer: "Lisbon to Estremoz · about two hours by road, private transfer" },
  { nights: "3 nights", days: "Days 3–5", volume: "europe", title: "Dá Licença, the olive hills", where: "Estremoz · Alentejo", ledger: "STY-2026-000522", body: "An eight-room, owner-run art hotel on a former farmstead: the pool in the groves, the owners' collection on every wall, the darkest skies in Europe at night.", note: "Three nights is the minimum here: the first to arrive, the second to slow down, the third to stay still.", image: `${CLD}/hero.jpg`, alt: "Dá Licença among the olive hills outside Estremoz", href: "/preview/europe/da-licenca", transfer: "Estremoz to Porto · about 3½ hours by road, private transfer" },
  { nights: "7 nights", days: "Days 6–12", volume: "voyages", title: "The Douro by river", where: "Porto · round trip up the Douro valley", ledger: "[SHIP AND DEPARTURE TO CHOOSE]", body: "Board a small river ship in Porto and sail up the Douro: terraced vineyards, quintas and the port lodges, with a stop or two ashore each day and back to Porto at the end.", note: "Slow water after slow land. Take the top deck at the locks.", transfer: "Day 13 · disembark in Porto and fly home from Porto (OPO)" },
];
const TOTAL = "12 nights";

export default function AlentejoDouroJourney() {
  const trip = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: "Alentejo and the Douro by River: a 12-Night Portugal Journey",
    description: "Two nights in Lisbon, three at Dá Licença in the Alentejo olive hills, then seven nights by small river ship up the Douro valley from Porto. One booking covers the stays, the river and the transfers.",
    url: `${SITE}/journeys/alentejo-douro`,
    touristType: ["Couples", "Slow travellers", "Wine travellers", "Art and design travellers"],
    provider: { "@type": "TravelAgency", name: "James Wild & Co", url: SITE },
    itinerary: { "@type": "ItemList", numberOfItems: CHAPTERS.length, itemListElement: CHAPTERS.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": c.volume === "voyages" ? "BoatTrip" : "LodgingBusiness", name: c.title, description: `${c.nights}. ${c.body}` } })) },
  };
  const faqs = [
    { q: "How long is the Alentejo and Douro journey?", a: "Twelve nights: two in Lisbon, three at Dá Licença in the Alentejo, and seven aboard a small river ship on the Douro, round trip from Porto. Fly into Lisbon and home from Porto." },
    { q: "When is the best time to go?", a: "Spring and early autumn suit both halves: April to June and September to October, when the Alentejo is green or golden and the Douro is between the heat and the harvest. The house confirms the sailing dates when you plan." },
    { q: "Is the river cruise booked separately?", a: "No. James Wild & Co books the whole journey as one: the Lisbon stay, Dá Licença, the river ship and every transfer between them, with one advisor from the first call to the flight home." },
    { q: "Can we swap the river for the coast?", a: "Yes. Two or three nights on the Alentejo coast replace the Douro for a shorter journey, flying home from Lisbon. The river can also come first, starting in Porto and ending in Lisbon." },
  ];
  return (
    <div className="theme-vol-europe theme-vol-europe-page">
      <JsonLd data={trip} />
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <RecordHero
          image={{ url: `${CLD}/grounds.jpg`, alt: "The grounds of Dá Licença in the Alentejo" }}
          eyebrow="A James Wild & Co journey · Europe and Voyages · Portugal"
          title="Alentejo and the Douro by River"
          tagline="A 12-night Portugal journey: the old city, the olive hills, then a week of slow water"
          glance={<GlanceBar glance={{ facts: [["The journey", `${TOTAL} · Lisbon to Porto`], ["The chapters", "City · Stay · River"], ["Best", "April–June · Sept–Oct"]], cta: { label: "Plan this journey", href: "/plan?trip=Alentejo%20and%20the%20Douro" } }} />}
        />
        <RecordNav items={[["In short", "overview"], ["The chapters", "chapters"], ["By river", "river"], ["Offers", "offers"], ["Questions", "faq-heading"]]} cta="Plan this journey" ctaHref="/plan?trip=Alentejo%20and%20the%20Douro" />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Journeys", path: "/preview/journeys/alentejo-douro" }, { name: "Portugal", path: "/preview/journeys/alentejo-douro" }, { name: "Alentejo and the Douro", path: "/preview/journeys/alentejo-douro" }]} /></div>

          <Overview
            quote="Three days of slow land, then a week of slow water. Portugal rewards the traveller who doesn't hurry it."
            answer="A 12-night Portugal journey from James Wild & Co: two nights in Lisbon, three at Dá Licença, an eight-room art hotel in the Alentejo olive hills, then seven nights by small river ship up the Douro valley, round trip from Porto. Best April to June and September to October. One booking covers the stays, the river and every transfer."
            facts={[["Length", TOTAL], ["Fly into", "Lisbon (LIS)"], ["Fly home from", "Porto (OPO)"], ["Volumes", "V Europe · IV Voyages"], ["Best months", "April–June · Sept–Oct"], ["Booking", "One booking, one advisor"]]}
          />

          {/* The chapters: a day-by-day strip, each in its volume's colour */}
          <section id="chapters" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px]">
            <SectionHead eyebrow="The chapters" title="How the Twelve Nights Run" intro="Three chapters, two volumes, one booking. Each chapter carries the Ledger entry behind it." />
            <ol className="mt-10 relative border-l-2 border-[rgba(43,32,24,0.14)] ml-3 space-y-12">
              {CHAPTERS.map((c, i) => {
                const v = VOLUME_STYLES[c.volume];
                return (
                  <li key={c.title} className="relative pl-8 md:pl-12">
                    <span className="absolute -left-[13px] top-1 w-6 h-6 rounded-full grid place-items-center text-white" style={{ background: v.leather }} aria-hidden="true"><span className="text-[11px] font-mono">{i + 1}</span></span>
                    <div className={`grid ${c.image ? "lg:grid-cols-[1.2fr_1fr]" : ""} gap-8 items-start`}>
                      <div>
                        <p className="flex flex-wrap items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] uppercase" style={{ color: v.leather }}><VolumeIconSvg volume={c.volume} size={16} />{c.days} · {c.nights} · Volume {v.roman} · {v.short}</p>
                        <h3 className="ledger-display text-[1.7rem] md:text-[2rem] leading-tight mt-2">{c.title}</h3>
                        <p className="font-mono text-[11px] ledger-muted mt-1">{c.where} · Ledger {c.ledger}</p>
                        <p className="mt-4 text-[16.5px] leading-relaxed">{c.body}</p>
                        {c.note && <p className="mt-4 ledger-display italic text-[1.15rem] leading-snug border-l-2 pl-4" style={{ borderColor: v.leather }}>&ldquo;{c.note}&rdquo; <span className="not-italic font-mono text-[10.5px] tracking-[0.14em] uppercase ledger-muted">James · draft for approval</span></p>}
                        {c.href && <Link href={c.href} className="inline-block mt-4 ledger-btn">See the stay</Link>}
                      </div>
                      {c.image && (
                        <figure>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.image} alt={c.alt ?? c.title} className="w-full aspect-[4/3] object-cover border ledger-rule" loading="lazy" />
                          <figcaption className="mt-1 text-[11px] ledger-muted">Photograph courtesy of Dá Licença</figcaption>
                        </figure>
                      )}
                    </div>
                    {c.transfer && <p className="mt-6 inline-flex items-center gap-2 text-[13px] ledger-muted border border-dashed border-[rgba(43,32,24,0.25)] px-3 py-2">→ {c.transfer}</p>}
                  </li>
                );
              })}
            </ol>
          </section>

          {/* The river chapter, in the Voyages colour */}
          <section id="river" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[208px] theme-vol-voyages border-t-[3px] pt-8 md:pt-10" style={{ borderColor: VOLUME_STYLES.voyages.leather }}>
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
              <div>
                <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: VOLUME_STYLES.voyages.leather }}><VolumeIconSvg volume="voyages" size={18} />Volume IV · Voyages · By river</p>
                <h2 className="ledger-display text-[1.9rem] md:text-4xl mt-2 leading-tight">Small Ships Only, Never the Big Ones</h2>
                <p className="mt-4 text-[17px] leading-relaxed">The Douro is a narrow, terraced river, best seen from a small ship that can stop where the big ones can&rsquo;t. The house chooses the ship and the departure with you, then times Lisbon and the Alentejo around it.</p>
                <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-[15px]">
                  <li>· Round trip from Porto</li>
                  <li>· Quintas and port-wine tastings ashore</li>
                  <li>· Cabins with river views</li>
                  <li>· [SHIP, CABINS AND DATES TO CHOOSE]</li>
                </ul>
              </div>
              <div className="flex justify-center"><InkStamp volume="voyages" no="DOURO" size={180} rotate={5} seed={61} /></div>
            </div>
          </section>

          {/* Offers: the time marks, real offers only */}
          <section id="offers" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px]">
            <SectionHead eyebrow="Offers on this journey" title="When the Calendar Helps" intro="Offers appear here only when a partner files real terms. Two kinds fit this journey." />
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="border p-6 flex items-center gap-6" style={{ borderColor: VOLUME_STYLES.europe.leather }}>
                <TimeMark volume="europe" size={110} />
                <div><p className="font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: VOLUME_STYLES.europe.leather }}>Time Rewarded · Dá Licença</p><p className="ledger-display text-xl mt-1">Stay longer in the olive hills</p><p className="mt-1 text-[14px] ledger-muted">A reward for staying longer, when the hotel offers one. [NONE FILED YET]</p></div>
              </div>
              <div className="border p-6 flex items-center gap-6" style={{ borderColor: VOLUME_STYLES.voyages.leather }}>
                <TimeMark volume="voyages" size={110} />
                <div><p className="font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: VOLUME_STYLES.voyages.leather }}>Final Call · Last berths</p><p className="ledger-display text-xl mt-1">When a sailing releases late cabins</p><p className="mt-1 text-[14px] ledger-muted">Shown with the real departure date and saving, never a countdown. [NONE FILED YET]</p></div>
              </div>
            </div>
          </section>

          <FaqBlock faqs={faqs} title="Questions, answered" />

          <section className="mt-16 md:mt-20 border-t ledger-rule pt-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="ledger-eyebrow ledger-crimson">One booking · one advisor</p>
              <p className="ledger-display text-2xl md:text-3xl mt-2">Plan Alentejo and the Douro with James</p>
            </div>
            <Link href="/plan?trip=Alentejo%20and%20the%20Douro" className="ledger-btn ledger-btn--solid">Plan this journey</Link>
          </section>

          <PreviewNote>
            <p>The layout every river pairing will use: Douro with Lisbon or the Alentejo; Rhine or Danube with the Wachau, Alsace or Budapest; Seine with a Normandy farmhouse. Each gets its own journey page with a short answer at the top, the chapters, the river card, offers and questions, and TouristTrip structured data for search and AI assistants.</p>
            <p>The notes signed &ldquo;James · draft&rdquo; and the opening quote are suggested wording for James to approve or rewrite. To fill before release: the Lisbon stay, the river ship and departure, a journey Ledger ID once the pairing is filed, and the Douro photographs. Dá Licença is filed as STY-2026-000522; its photographs are courtesy of the hotel.</p>
          </PreviewNote>
        </div>
      </main>
    </div>
  );
}
