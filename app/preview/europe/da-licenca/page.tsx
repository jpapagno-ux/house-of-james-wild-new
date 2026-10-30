import Link from "next/link";
import SiteHeader from "@/components/ledger/SiteHeader";
import Breadcrumbs from "@/components/ledger/Breadcrumbs";
import { GalleryMosaic, GlanceBar } from "@/components/record/Frame";
import { Experiences, Features, Overview, PreviewNote, Practical, RecordHero, RecordNav, RoomsLedger, SectionHead, WhyChose } from "@/components/record/Sections";
import { InkStamp, Roundel, TimeMark, VolumeIconSvg } from "@/components/ledger/VolumeKit";
import { VOLUME_STYLES } from "@/lib/volumes";
import { buildMetadata } from "@/lib/seo";

// Preview: the first Volume V (Europe) stay, from James's Base44 sample
// "SampleEuropeStayPage" (Dá Licença, Estremoz, Alentejo · Not So Wild ·
// Europe). Copy, suites, experiences and James's notes are his sample's.
// Partner photos are not used (rights unconfirmed, and the site never loads
// or links the partner's own site); the generated plates are the library's.

export const metadata = buildMetadata({ title: "Dá Licença, Estremoz, Alentejo (preview)", description: "Preview of a Volume V Europe stay with before-and-after chapters and a Douro river voyage.", path: "/preview/europe/da-licenca", noindex: true });

const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474";
// Hotel-approved photographs, credit required: "Photo courtesy of Dá Licença".
const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/stays/europe/da-licenca";
const CREDIT = "Photographs courtesy of Dá Licença";
const LEDGER_ID = "STY-2026-000522";
const EU = VOLUME_STYLES.europe;
const VOY = VOLUME_STYLES.voyages;

const SUITE_IMG: Record<string, string> = { "The Rock": "suite-the-rock", "The Loft": "suite-the-loft", "My Pool": "suite-my-pool", "Sky Pool": "suite-sky-pool", "Sunset": "suite-sunset", "The Moon Cube": "suite-moon-cube" };
const SUITES = [
  ["The Rock", "Infused with Japanese ambience, shaped as an amphitheatre so you can lie back and contemplate the views."],
  ["The Loft", "A large, open studio in three spaces (bedroom, living area and bathroom) with natural, open windows onto the landscape."],
  ["My Pool", "Architecturally reminiscent of a yacht, with soothing comfort and Scandinavian furniture."],
  ["Sky Pool", "The sky is the only limit. Feel as free as a bird above the Alentejo olive hills."],
  ["Sunset", "With its private rooftop, a unique spot for an extra dose of romance."],
  ["The Moon Cube", "A standalone cube room in the grounds: the estate's most sculptural sleep."],
] as const;

const EXPERIENCES = [
  ["Olive oil tasting on the estate's own groves", "Good for the slow first afternoon, when the press is still warm and the bread is warm with it.", "d038115ff_generated_image.png"],
  ["Stargazing under one of Europe's darkest skies", "Good for anyone who has never really seen the Milky Way; take the second night, after you have slowed down.", "f2039574a_generated_image.png"],
  ["Day trip to Évora, a UNESCO World Heritage city", "Good for one excursion, no more. Go early, be back by four, and let the quiet take over again.", "e30f86f55_generated_image.png"],
  ["Estremoz marble old town and its Saturday market", "Good for a Saturday morning; stay for the marble trail through the old town afterward.", "ce0cd9df3_generated_image.png"],
  ["Private viewing of the owners' art collection", "Good for collectors. Sit with it for an hour and let Vitor tell you what he bought, and why.", "8a02fad99_generated_image.png"],
  ["Alentejo wine tastings in the surrounding countryside", "Good for the last evening, with the kitchen's cheese and the long light going out over the vines.", "78af50760_generated_image.png"],
] as const;

// Before and after: the chapters around the stay. Suggestions to build the
// trip from; every bracketed item is chosen and confirmed by the house.
const CHAPTERS: { when: string; volume: "europe" | "voyages" | "overland"; title: string; nights: string; body: string; how: string }[] = [
  { when: "Before", volume: "europe", title: "Lisbon, two nights in the old city", nights: "2 nights", body: "Land, sleep off the flight and walk Alfama before the quiet. A small house in the city, [LISBON STAY TO CHOOSE].", how: "Lisbon airport (LIS) · about two hours by road to Estremoz" },
  { when: "The stay", volume: "europe", title: "Dá Licença, the olive hills", nights: "3 nights", body: "Three nights is the house's minimum here: the first to arrive, the second to slow down, the third to stay still.", how: "Estremoz · Alentejo" },
  { when: "After", volume: "voyages", title: "The Douro by river", nights: "About a week", body: "North to Porto, then up the Douro valley by small river ship: terraced vineyards, quintas and the port lodges. [RIVER SHIP AND DEPARTURE TO CHOOSE]", how: "Estremoz to Porto by road · about 3½ hours" },
  { when: "Or after", volume: "europe", title: "The Alentejo coast", nights: "2–3 nights", body: "West to the Atlantic for long beaches and rice fields before flying home from Lisbon. [COAST STAY TO CHOOSE]", how: "Back to Lisbon (LIS) for the flight home" },
];

export default function DaLicencaPreview() {
  return (
    <div className="theme-vol-europe theme-vol-europe-page">
      <SiteHeader overlay />
      <main id="main" className="overflow-x-clip">
        <RecordHero
          image={{ url: `${CLD}/hero.jpg`, alt: "Dá Licença among the olive hills outside Estremoz, Alentejo" }}
          slides={[{ url: `${CLD}/hero.jpg`, alt: "Dá Licença among the olive hills outside Estremoz, Alentejo" }, { url: `${CLD}/grounds.jpg`, alt: "The grounds of Dá Licença in the Alentejo" }, { url: `${CLD}/main-house.jpg`, alt: "The main house at Dá Licença" }]}
          eyebrow={`Not So Wild · Europe · Volume V · Alentejo, Portugal · ${LEDGER_ID}`}
          title="Dá Licença"
          tagline="An art-filled silence among the Alentejo olive hills"
          glance={<GlanceBar glance={{ price: { amount: "€350", basis: "suites, per night · seasonal" }, facts: [["The house", "8 rooms & suites"], ["Ledger ID", LEDGER_ID], ["Fly into", "Lisbon (LIS)"]], cta: { label: "Plan this stay", href: "/plan?trip=D%C3%A1%20Licen%C3%A7a" } }} />}
        />
        <RecordNav items={[["The story", "why"], ["Overview", "overview"], ["Hosts", "hosts"], ["Suites", "rooms"], ["Experiences", "experiences"], ["Features", "features"], ["Before & after", "chapters"], ["By river", "river"], ["Details", "practical"]]} cta="Plan this stay" ctaHref="/plan?trip=D%C3%A1%20Licen%C3%A7a" />
        <div className="max-w-ledger mx-auto px-5 md:px-10">
          <div className="pt-6"><Breadcrumbs trail={[{ name: "Home", path: "/" }, { name: "Europe", path: "/preview/europe/da-licenca" }, { name: "Portugal", path: "/preview/europe/da-licenca" }, { name: "Dá Licença", path: "/preview/europe/da-licenca" }]} /></div>

          <WhyChose
            title="A Gallery in the Olive Hills"
            blocks={[
              { body: "In the olive hills outside Estremoz, where the plain rolls red and silver toward the Spanish border, a former farmstead has been made into something rare: a small hotel that behaves like a private gallery. The estate took five years to transform, and it carries only eight rooms and suites." },
              { body: "The house asks for almost nothing of its guests. Days are spent between the pool, the library and the grounds; the loudest sound is the wind through the olives. It is the counterpoint this house looks for in Europe: a stay with no adrenaline in it at all." },
            ]}
            status={<p className="ledger-eyebrow ledger-crimson">House recommended · Not So Wild · Europe</p>}
          />

          <Overview
            answer="Dá Licença is an eight-room, owner-run art hotel on a former farmstead outside Estremoz in Portugal's Alentejo, about two hours by road from Lisbon. Suites start from about €350 a night, rising in the high summer weeks. It suits couples, art collectors, slow travellers and wine and olive-oil lovers, and pairs naturally with Lisbon before and the Douro by river after. Plan it with James or an advisor."
            facts={[["Region", "Alentejo, Portugal"], ["The house", "8 rooms & suites"], ["Ledger ID", LEDGER_ID], ["From", "€350 per night (suites)"], ["Hosts", "Vitor Borges & Franck Laigneau"], ["Best suited to", "Couples, collectors, slow travellers"]]}
          />

          <section id="hosts" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px] grid lg:grid-cols-[1.3fr_1fr] gap-10 items-start">
            <div>
              <SectionHead eyebrow="Ownership & hosts" title="The Owners Who Made It" />
              <p className="mt-4 text-[17px] leading-relaxed">Dá Licença was brought to life by Vitor Borges and Franck Laigneau, who left careers in Paris to build the retreat. Their background in the art world is the property&rsquo;s signature: each suite is hung and furnished like a collector&rsquo;s apartment. The owners are present and personally host most stays.</p>
            </div>
            <div className="border ledger-rule p-6 flex items-center gap-6">
              <Roundel volume="europe" text="38.7747° N · 7.5820° W · Dá Licença · Vol V" entry="ESTREMOZ" size={130} />
              <p className="text-[14px] leading-relaxed ledger-muted">The estate sits in the olive hills outside Estremoz, the marble town of the Alentejo, about two hours east of Lisbon.</p>
            </div>
          </section>

          <GalleryMosaic title="Dá Licença in photographs" images={[{ url: `${CLD}/grounds.jpg`, alt: "The grounds of Dá Licença in the Alentejo" }, { url: `${CLD}/main-house.jpg`, alt: "The main house at Dá Licença" }, { url: `${CLD}/suite-sky-pool.jpg`, alt: "Sky Pool suite at Dá Licença" }, { url: `${CLD}/suite-sunset.jpg`, alt: "Sunset suite with its private rooftop at Dá Licença" }, { url: `${CLD}/suite-the-rock.jpg`, alt: "The Rock suite at Dá Licença" }]} />
          <p className="mt-2 text-[12px] ledger-muted">{CREDIT}</p>

          <RoomsLedger title="Eight Suites, Each Its Own World" intro="Six of the eight, as the owners describe them." rooms={SUITES.map(([name, note]) => ({ name, note, image: `${CLD}/${SUITE_IMG[name]}.jpg` }))} unit="suite" footnote={`Rates are seasonal and confirmed when you book. ${CREDIT}.`} />

          <Experiences
            title="How to Spend the Days (Slowly)"
            intro="Do one thing a day, if that. James's notes say when each is worth it."
            items={EXPERIENCES.map(([name, james, img]) => ({ name, meta: "James's note", body: james, image: `${B44}/${img}`, alt: name }))}
          />

          <Features
            title="What Makes the House"
            body="The house is built for stillness: four things carry it, and the gardens and walking paths across the estate hold the rest."
            items={[
              "Outdoor pool in the olive groves: on most days you have it to yourself, which is the whole point of the place.",
              "The owners' art collection, hung through the house: a gallery you can sleep in.",
              "Library and quiet sitting rooms, where the silence is actually kept.",
              "Restaurant and bar with an Alentejo wine list, best at the long table with whoever else is in the house.",
            ]}
          />

          {/* Before & after: the chapters around the stay */}
          <section id="chapters" className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 scroll-mt-32 lg:scroll-mt-[208px]">
            <SectionHead eyebrow="Before & after" title="The Chapters Around the Stay" intro="Most guests come for three nights and build the trip around them. Here is how the house would shape it: a city to land in, the quiet, then the river or the sea." />
            <ol className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {CHAPTERS.map((c, i) => {
                const v = VOLUME_STYLES[c.volume];
                return (
                  <li key={c.title} className="border bg-white p-5 flex flex-col gap-3" style={{ borderColor: i === 1 ? v.leather : "rgba(45,42,38,0.18)", borderTopWidth: 3, borderTopColor: v.leather }}>
                    <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] uppercase" style={{ color: v.leather }}><VolumeIconSvg volume={c.volume} size={16} />{c.when} · {v.short}</p>
                    <h3 className="ledger-display text-[1.45rem] leading-snug">{c.title}</h3>
                    <p className="font-mono text-[11px] ledger-muted">{c.nights}</p>
                    <p className="text-[15px] leading-relaxed">{c.body}</p>
                    <p className="mt-auto pt-3 border-t ledger-rule text-[13px] ledger-muted">{c.how}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* The river voyage: Europe meets Voyages */}
          <section id="river" className="mt-16 md:mt-24 scroll-mt-32 lg:scroll-mt-[208px] theme-vol-voyages border-t-[3px] pt-8 md:pt-10" style={{ borderColor: VOY.leather }}>
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
              <div>
                <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: VOY.leather }}><VolumeIconSvg volume="voyages" size={18} />Volume IV · Voyages · By river</p>
                <h2 className="ledger-display text-[1.9rem] md:text-4xl mt-2 leading-tight">Then the Douro, by River</h2>
                <p className="mt-4 text-[17px] leading-relaxed">From the olive hills to the vineyard terraces: a small river ship out of Porto, up the Douro valley through the port country, a week of slow water after three days of slow land. The house pairs the two so one booking covers the whole chapter, transfers included.</p>
                <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-[15px]">
                  <li>· Porto, the start and end of most Douro sailings</li>
                  <li>· Terraced quintas and port-wine tastings ashore</li>
                  <li>· Small ships only, never the big ones</li>
                  <li>· [SHIP, CABINS AND DATES TO CHOOSE]</li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/plan?trip=D%C3%A1%20Licen%C3%A7a%20and%20the%20Douro" className="ledger-btn ledger-btn--solid">Plan the stay and the river</Link>
                  <Link href="/voyages" className="ledger-btn">See Voyages</Link>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <TimeMark volume="voyages" size={150} />
                <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase" style={{ color: VOY.leather }}>Offers on river sailings show here</p>
                <p className="text-[13px] ledger-muted max-w-[260px]">Time Rewarded for longer stays; Final Call when a sailing releases late berths. Only real, filed offers ever appear.</p>
              </div>
            </div>
          </section>

          <Practical rows={[["Location", "Outside Estremoz, Alentejo, Portugal"], ["Ledger ID", LEDGER_ID], ["Coordinates", "38.7747° N · 7.5820° W"], ["Fly into", "Lisbon (LIS) · about 2 hours by road"], ["The house", "8 rooms and suites"], ["From", "Suites from €350 per night; seasonal, rising in the high summer weeks and for the largest suites"], ["Licence", "Tourism licence RNET 7713"], ["Booking", "Through James Wild & Co: Plan with James or an advisor"], ["Photographs", CREDIT]]} />

          <section className="mt-16 md:mt-24 border-t ledger-rule pt-8 md:pt-10 grid md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <p className="ledger-eyebrow ledger-crimson">Why the house recommends it</p>
              <p className="ledger-display italic text-2xl md:text-[1.9rem] leading-snug mt-3">&ldquo;Dá Licença is the house&rsquo;s kind of quiet. Owner-run, eight rooms, an art collection worth the trip on its own, and a landscape that asks nothing of the traveler but attention.&rdquo;</p>
              <p className="mt-4 text-[16px] leading-relaxed ledger-muted">It anchors the Not So Wild Europe line the way the great safari camps anchor Africa: proof that the rarest luxury is silence, kept by people who love the ground they stand on.</p>
            </div>
            <InkStamp volume="europe" no="0522" size={190} rotate={-5} seed={29} />
          </section>

          <PreviewNote>
            <p>Filed in the library as {LEDGER_ID} (Volume V, Europe), Portugal DST-2026-000066. No founder mark until James has stayed: his visit is planned. Photographs approved by the hotel and credited. Coordinates and drive times confirmed by James, 29 Oct 2026.</p>
            <p>To check before release: the sample says the hotel opened in 2020, but press coverage dates from late 2018, so the opening year is left off the page. The Lisbon stay, coast stay and the Douro ship and dates are still to choose. See the full journey: /preview/journeys/alentejo-douro.</p>
          </PreviewNote>
        </div>
      </main>
    </div>
  );
}
