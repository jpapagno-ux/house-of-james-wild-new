import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Users } from "lucide-react";
import SiteHeader from "@/components/ledger/SiteHeader";
import { Reveal } from "@/components/ledger/Motion";
import { FieldIcon } from "@/components/ledger/FieldIcon";
import { Conservation, Experiences, Features, GalleryStrip, Overview, Practical, PreviewNote, RecordHero, RecordNav, SectionHead, WhyChose } from "@/components/record/Sections";
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

export default function LondoloziPreview() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <RecordHero image={L.hero} eyebrow={`Wild & Co Safaris · Sabi Sand Game Reserve · ${L.ledgerId}`} title={L.name} tagline="Four camps, private suites and family villas on one reserve" />
        <RecordNav items={[["Overview", "overview"], ["The camps", "camps"], ["Why we chose it", "why"], ["On safari", "experiences"], ["Only here", "features"], ["Conservation", "conservation"], ["Practical", "practical"]]} />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <Overview
            quote={L.introQuote}
            answer="Londolozi is a private reserve in South Africa's Sabi Sand, famous for leopard, with five camps under one name: Varty, Founders, Tree, Pioneer and the Private Granite Suites, plus exclusive-use family villas. Rates run from US$1,386 per person per night at Varty Camp. Best May to October."
            facts={[["Reserve ledger", L.ledgerId], ["Location", "Sabi Sand · South Africa"], ["Camps", "5 camps + private villas"], ["From", "US$1,386 per person, per night"], ["Best months", "May to October"], ["Fly into", "Kruger Mpumalanga (MQP) or Skukuza"]]}
            paragraphs={L.overview}
          />

          {/* The camps: each a child stay with its own rooms */}
          <section id="camps" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32">
            <SectionHead eyebrow="The camps · each with its own page" title="Five Camps, One Reserve" intro="Choose the camp first, then the room. Each camp has its own character, rooms, rates and host, and its own page in the Ledger." icon="tree-ring" />
            <nav aria-label="Camps" className="mt-6 flex flex-wrap gap-2">
              {CAMPS.map((c) => <a key={c.slug} href={`#${c.slug}`} className="border ledger-border px-3 py-1.5 text-[14px] hover:border-crimson">{c.name}</a>)}
              <a href="#villas" className="border ledger-border px-3 py-1.5 text-[14px] hover:border-crimson">Private villas</a>
            </nav>
            <div className="mt-10 space-y-14">
              {CAMPS.map((c, i) => (
                <Reveal key={c.slug}>
                  <article id={c.slug} className="scroll-mt-32 grid lg:grid-cols-[1fr_1.3fr] gap-8 items-start">
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
              <article id="villas" className="scroll-mt-32 ledger-paper border ledger-border p-6 md:p-8 flex flex-wrap items-center justify-between gap-6">
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

          <WhyChose eyebrow={L.whyStay.eyebrow} title={L.whyStay.title} blocks={L.whyStay.paragraphs.map((b) => ({ body: b }))} image={{ url: L.whyStay.image, alt: L.whyStay.imageAlt }}
            status={<p className="text-[14px] ledger-muted"><span className="ledger-eyebrow ledger-crimson">Vetted by the house</span> · no founder visit filed, so no founder stamp</p>} />
          <Experiences eyebrow="On safari" title="What the Reserve Programs" items={L.adventures.bullets.map((b) => ({ name: b }))} icon="mountain-sun" />
          <Features title={L.onlyHere.title} eyebrow="Only here" body={L.onlyHere.paragraphs[0]} icon="sun" />
          <Conservation eyebrow={L.sustainability.eyebrow} title={L.sustainability.titleA} subtitle={L.sustainability.titleB} intro={L.sustainability.intro} body={L.sustainability.body} image={{ url: L.adventures.image, alt: L.adventures.imageAlt }} />
          <GalleryStrip images={L.gallery} />
          <Practical rows={L.practical as [string, string][]} />
          <PreviewNote>
            <p>The five camps live in the library today as room records under the reserve; filing each as its own child stay (approved) gives every camp its own page, host and offers. The Private Granite Suites and Private Villas have duplicate placeholder room records to tidy.</p>
            <p>The reserve&rsquo;s own hero image field is corrupted in the library, so the hero uses the first gallery image.</p>
          </PreviewNote>
        </div>
      </main>
    </>
  );
}
